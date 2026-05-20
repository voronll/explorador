import { useEffect, useState } from 'react'
import { apiRota } from '../api/rota'

export function useResumoRotaPreview(destinos, ativo) {
  const [resumo, setResumo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const chave = destinos.map((d) => `${d._id}:${d.lat},${d.lng}`).join('|')

  useEffect(() => {
    if (!ativo) {
      setResumo(null)
      setErro(null)
      setCarregando(false)
      return
    }

    if (destinos.length < 2) {
      setResumo(null)
      setErro(null)
      setCarregando(false)
      return
    }

    let cancelado = false

    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const dados = await apiRota.preview(
          destinos.map((d, i) => ({
            name: d.name,
            lat: d.lat,
            lng: d.lng,
            order: i,
          })),
        )
        if (!cancelado) setResumo(dados)
      } catch (err) {
        if (!cancelado) {
          setResumo(null)
          setErro(err.message)
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [ativo, chave, destinos.length])

  return { resumo, carregando, erro }
}
