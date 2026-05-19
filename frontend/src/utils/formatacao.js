export function formatarDistancia(metros) {
  if (metros >= 1000) {
    return `${(metros / 1000).toFixed(1)} km`
  }
  return `${Math.round(metros)} m`
}

export function formatarDuracao(segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  if (horas > 0) {
    return `${horas}h ${minutos}min`
  }
  return `${minutos} min`
}
