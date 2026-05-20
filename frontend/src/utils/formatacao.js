export function formatarDistancia(metros) {
  if (metros >= 1000) {
    return `${(metros / 1000).toFixed(1)} km`
  }
  return `${Math.round(metros)} m`
}

export function formatarData(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatarDuracao(segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  if (horas > 0) {
    return `${horas}h ${minutos}min`
  }
  return `${minutos} min`
}
