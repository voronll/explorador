const URL_BASE_API = import.meta.env.VITE_API_URL ?? ''

async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...opcoes.headers },
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

export const apiViagens = {
  listar: () => requisicao('/api/viagens'),
  obter: (id) => requisicao(`/api/viagens/${id}`),
  criar: (dados) =>
    requisicao('/api/viagens', { method: 'POST', body: JSON.stringify(dados) }),
  remover: (id) => requisicao(`/api/viagens/${id}`, { method: 'DELETE' }),
  atualizar: (id, dados) =>
    requisicao(`/api/viagens/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
}
