const URL_OSRM = process.env.OSRM_URL ?? 'https://router.project-osrm.org'

function geoJsonParaLeaflet(coordenadas) {
  return coordenadas.map(([lng, lat]) => [lat, lng])
}

async function calcularRota(destinos) {
  if (destinos.length < 2) {
    return {
      trechos: [],
      total: { distanciaMetros: 0, duracaoSegundos: 0 },
      geometria: [],
    }
  }

  const coordenadas = destinos.map((d) => `${d.lng},${d.lat}`).join(';')
  const url = `${URL_OSRM}/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`

  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`OSRM respondeu com status ${resposta.status}`)
  }

  const dados = await resposta.json()
  if (dados.code !== 'Ok' || !dados.routes?.[0]) {
    throw new Error(dados.message ?? 'Não foi possível calcular a rota')
  }

  const rota = dados.routes[0]
  const geometria = geoJsonParaLeaflet(rota.geometry.coordinates)

  const trechos = []
  for (let i = 0; i < destinos.length - 1; i++) {
    const de = destinos[i]
    const para = destinos[i + 1]
    const perna = rota.legs[i]

    if (!perna) {
      throw new Error('Resposta do OSRM incompleta para os trechos da rota')
    }

    trechos.push({
      de: { _id: de._id, name: de.name, lat: de.lat, lng: de.lng },
      para: { _id: para._id, name: para.name, lat: para.lat, lng: para.lng },
      distanciaMetros: Math.round(perna.distance),
      duracaoSegundos: Math.round(perna.duration),
    })
  }

  const total = {
    distanciaMetros: Math.round(rota.distance),
    duracaoSegundos: Math.round(rota.duration),
  }

  return { trechos, total, geometria, provedor: 'OSRM' }
}

module.exports = { calcularRota }
