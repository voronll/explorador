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
  return resposta.json()
}

export const apiRota = {
  obterResumo: () => requisicao('/api/rota/resumo'),
  preview: (destinos) =>
    requisicao('/api/rota/preview', { method: 'POST', body: JSON.stringify({ destinos }) }),
}
