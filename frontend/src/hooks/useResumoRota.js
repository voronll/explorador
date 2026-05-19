import { useEffect, useState } from 'react'
import { apiRota } from '../api/rota'

export function useResumoRota(destinos) {
  const [resumo, setResumo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const idsOrdenados = destinos.map((d) => d._id).join(',')

  useEffect(() => {
    if (destinos.length < 2) {
      setResumo(null)
      setErro(null)
      setCarregando(false)
      return
    }

    let cancelado = false

    async function carregarResumo() {
      setCarregando(true)
      setErro(null)
      try {
        const dados = await apiRota.obterResumo()
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

    carregarResumo()
    return () => {
      cancelado = true
    }
  }, [idsOrdenados, destinos.length])

  return { resumo, carregando, erro }
}
