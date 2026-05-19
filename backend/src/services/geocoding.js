const URL_NOMINATIM = process.env.NOMINATIM_URL ?? 'https://nominatim.openstreetmap.org'
const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? 'Explorador/1.0 (processo-seletivo; uso educacional)'
const PAIS_PADRAO = process.env.NOMINATIM_COUNTRYCODES ?? 'br'
const INTERVALO_MIN_MS = 1000

let ultimaRequisicao = 0

const TIPOS_LOCAL = new Set([
  'city',
  'town',
  'village',
  'municipality',
  'administrative',
  'suburb',
  'neighbourhood',
  'quarter',
  'hamlet',
])

async function aguardarRateLimit() {
  const agora = Date.now()
  const espera = INTERVALO_MIN_MS - (agora - ultimaRequisicao)
  if (espera > 0) {
    await new Promise((resolve) => setTimeout(resolve, espera))
  }
  ultimaRequisicao = Date.now()
}

async function chamarNominatim(caminho, parametros) {
  await aguardarRateLimit()

  const url = new URL(caminho, URL_NOMINATIM)
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null) {
      url.searchParams.set(chave, String(valor))
    }
  }

  const resposta = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  })

  if (!resposta.ok) {
    throw new Error(`Nominatim respondeu com status ${resposta.status}`)
  }

  return resposta.json()
}

function bboxParaLeaflet(boundingbox) {
  if (!boundingbox || boundingbox.length < 4) return null
  const [sul, norte, oeste, leste] = boundingbox.map(Number)
  return [
    [sul, oeste],
    [norte, leste],
  ]
}

function extrairNomeCidade(resultado) {
  const endereco = resultado.address ?? {}
  return (
    endereco.city ||
    endereco.town ||
    endereco.municipality ||
    endereco.village ||
    endereco.state_district ||
    resultado.name ||
    resultado.display_name?.split(',')[0]?.trim() ||
    'Local desconhecido'
  )
}

function extrairRotulo(resultado) {
  const endereco = resultado.address ?? {}
  const partes = [endereco.state, endereco.country].filter(Boolean)
  return partes.join(', ') || resultado.display_name?.split(',').slice(1).join(',').trim() || ''
}

function mapearCidade(resultado) {
  const lat = Number(resultado.lat)
  const lng = Number(resultado.lon ?? resultado.lng)

  return {
    id: String(resultado.place_id),
    nome: extrairNomeCidade(resultado),
    rotulo: extrairRotulo(resultado),
    lat,
    lng,
    zoom: 11,
    bbox: bboxParaLeaflet(resultado.boundingbox),
  }
}

function eResultadoUtil(resultado) {
  if (resultado.class === 'place') return true
  return TIPOS_LOCAL.has(resultado.type)
}

function filtrarResultados(resultados) {
  const filtrados = resultados.filter(eResultadoUtil)
  return filtrados.length > 0 ? filtrados : resultados
}

async function buscar(termo, limite = 5) {
  const consulta = termo?.trim()
  if (!consulta || consulta.length < 2) {
    return []
  }

  const dados = await chamarNominatim('/search', {
    q: consulta,
    format: 'json',
    limit: Math.min(limite, 10),
    addressdetails: 1,
    countrycodes: PAIS_PADRAO,
    'accept-language': 'pt-BR',
  })

  if (!Array.isArray(dados) || dados.length === 0) {
    return []
  }

  return filtrarResultados(dados)
    .slice(0, limite)
    .map(mapearCidade)
}

async function reverso(lat, lng) {
  const latitude = Number(lat)
  const longitude = Number(lng)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Coordenadas inválidas para geocoding reverso')
  }

  const dados = await chamarNominatim('/reverse', {
    lat: latitude,
    lon: longitude,
    format: 'json',
    addressdetails: 1,
    zoom: 18,
    'accept-language': 'pt-BR',
  })

  if (!dados || dados.error) {
    throw new Error(dados?.error ?? 'Não foi possível identificar o local')
  }

  const endereco = dados.address ?? {}
  const partes = [
    endereco.road,
    endereco.suburb || endereco.neighbourhood || endereco.quarter,
    endereco.city || endereco.town || endereco.municipality,
  ].filter(Boolean)

  const nome =
    partes.length > 0
      ? partes.slice(0, 2).join(', ')
      : extrairNomeCidade(dados)

  return {
    nome,
    rotulo: extrairRotulo(dados),
    lat: latitude,
    lng: longitude,
  }
}

module.exports = { buscar, reverso }
