const URL_OSRM = process.env.OSRM_URL ?? 'https://router.project-osrm.org'

async function obterTrecho(origem, destino) {
  const coordenadas = `${origem.lng},${origem.lat};${destino.lng},${destino.lat}`
  const url = `${URL_OSRM}/route/v1/driving/${coordenadas}?overview=false`

  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`OSRM respondeu com status ${resposta.status}`)
  }

  const dados = await resposta.json()
  if (dados.code !== 'Ok' || !dados.routes?.[0]) {
    throw new Error(dados.message ?? 'Não foi possível calcular o trecho da rota')
  }

  const rota = dados.routes[0]
  return {
    distanciaMetros: Math.round(rota.distance),
    duracaoSegundos: Math.round(rota.duration),
  }
}

async function calcularRota(destinos) {
  if (destinos.length < 2) {
    return { trechos: [], total: { distanciaMetros: 0, duracaoSegundos: 0 } }
  }

  const trechos = []

  for (let i = 0; i < destinos.length - 1; i++) {
    const de = destinos[i]
    const para = destinos[i + 1]
    const metricas = await obterTrecho(de, para)

    trechos.push({
      de: { _id: de._id, name: de.name, lat: de.lat, lng: de.lng },
      para: { _id: para._id, name: para.name, lat: para.lat, lng: para.lng },
      distanciaMetros: metricas.distanciaMetros,
      duracaoSegundos: metricas.duracaoSegundos,
    })
  }

  const total = trechos.reduce(
    (acumulado, trecho) => ({
      distanciaMetros: acumulado.distanciaMetros + trecho.distanciaMetros,
      duracaoSegundos: acumulado.duracaoSegundos + trecho.duracaoSegundos,
    }),
    { distanciaMetros: 0, duracaoSegundos: 0 },
  )

  return { trechos, total, provedor: 'OSRM' }
}

module.exports = { calcularRota, obterTrecho }
