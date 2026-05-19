import { useEffect, useState } from 'react'
import { apiRota } from '../api/rota'
import { formatarDistancia, formatarDuracao } from '../utils/formatacao'

export default function ResumoRota({ destinos }) {
  const [resumo, setResumo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const idsOrdenados = destinos.map((d) => d._id).join(',')

  useEffect(() => {
    if (destinos.length < 2) {
      setResumo(null)
      setErro(null)
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

  if (destinos.length < 2) {
    return (
      <p className="resumo-rota-vazio">
        Adicione pelo menos dois destinos para ver distância e tempo de viagem.
      </p>
    )
  }

  if (carregando) {
    return <p className="loading">Calculando rota…</p>
  }

  if (erro) {
    return (
      <div className="alert alert-error" role="alert">
        {erro}
      </div>
    )
  }

  if (!resumo?.trechos?.length) return null

  return (
    <div className="resumo-rota">
      <h3>Trechos da viagem</h3>
      <ul className="trechos-lista">
        {resumo.trechos.map((trecho) => (
          <li key={`${trecho.de._id}-${trecho.para._id}`} className="trecho-item">
            <span className="trecho-nomes">
              <strong>{trecho.de.name}</strong> → <strong>{trecho.para.name}</strong>
            </span>
            <span className="trecho-metricas">
              {formatarDistancia(trecho.distanciaMetros)} · {formatarDuracao(trecho.duracaoSegundos)}
            </span>
          </li>
        ))}
      </ul>

      <div className="total-rota">
        <div>
          <span className="total-label">Distância total</span>
          <strong>{formatarDistancia(resumo.total.distanciaMetros)}</strong>
        </div>
        <div>
          <span className="total-label">Tempo total</span>
          <strong>{formatarDuracao(resumo.total.duracaoSegundos)}</strong>
        </div>
      </div>

      <p className="provedor-rota">Calculado via {resumo.provedor ?? 'OSRM'} (rotas rodoviárias)</p>
    </div>
  )
}
