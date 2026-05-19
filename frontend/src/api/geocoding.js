const URL_BASE_API = import.meta.env.VITE_API_URL ?? ''

async function requisicao(caminho) {
  const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
    headers: { Accept: 'application/json' },
  })

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}))
    const detalhes = corpo.details ?? ''
    throw new Error([corpo.error, detalhes].filter(Boolean).join(' — ') || `Erro ${resposta.status}`)
  }

  return resposta.json()
}

export const apiGeocoding = {
  buscar: (termo, limite = 5) => {
    const params = new URLSearchParams({ q: termo, limit: String(limite) })
    return requisicao(`/api/geocoding/buscar?${params}`).then((d) => d.resultados)
  },

  reverso: (lat, lng) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) })
    return requisicao(`/api/geocoding/reverso?${params}`)
  },
}
