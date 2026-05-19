const URL_BASE_API = import.meta.env.VITE_API_URL ?? ''

async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
    headers: { 'Content-Type': 'application/json', ...opcoes.headers },
    ...opcoes,
  })

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}))
    const detalhes = corpo.details?.join?.(' ') ?? corpo.details ?? ''
    throw new Error([corpo.error, detalhes].filter(Boolean).join(' — ') || `Erro ${resposta.status}`)
  }

  if (resposta.status === 204) return null
  return resposta.json()
}

export const apiDestinos = {
  listar: () => requisicao('/api/destinos'),
  criar: (dados) =>
    requisicao('/api/destinos', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id, dados) =>
    requisicao(`/api/destinos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  remover: (id) => requisicao(`/api/destinos/${id}`, { method: 'DELETE' }),
  reordenar: (ids) =>
    requisicao('/api/destinos/reordenar', {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    }),
}
