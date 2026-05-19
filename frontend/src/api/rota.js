const URL_BASE_API = import.meta.env.VITE_API_URL ?? ''

async function requisicao(caminho) {
  const resposta = await fetch(`${URL_BASE_API}${caminho}`)
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}))
    throw new Error(corpo.error ?? `Erro ${resposta.status}`)
  }
  return resposta.json()
}

export const apiRota = {
  obterResumo: () => requisicao('/api/rota/resumo'),
}
