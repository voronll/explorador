import { useEffect, useState } from 'react'
import { Polyline } from 'react-leaflet'
import './RotaAnimada.css'

const DURACAO_MS = 1400
const COR_ROTA = '#ff385c'

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

export function chaveGeometria(geometria) {
  if (!geometria?.length) return ''
  const primeiro = geometria[0]
  const ultimo = geometria[geometria.length - 1]
  return `${geometria.length}:${primeiro[0]},${primeiro[1]}:${ultimo[0]},${ultimo[1]}`
}

export default function RotaAnimada({ posicoes, idAnimacao, pelasRuas = true }) {
  const [pontosVisiveis, setPontosVisiveis] = useState([])
  const [desenhoCompleto, setDesenhoCompleto] = useState(false)

  useEffect(() => {
    if (!posicoes || posicoes.length < 2) {
      setPontosVisiveis([])
      setDesenhoCompleto(false)
      return
    }

    let frameId
    const inicio = performance.now()
    setDesenhoCompleto(false)
    setPontosVisiveis([posicoes[0]])

    function animar(agora) {
      const progresso = Math.min((agora - inicio) / DURACAO_MS, 1)
      const suavizado = easeOutCubic(progresso)
      const quantidade = Math.max(2, Math.ceil(suavizado * posicoes.length))

      setPontosVisiveis(posicoes.slice(0, quantidade))

      if (progresso < 1) {
        frameId = requestAnimationFrame(animar)
      } else {
        setPontosVisiveis(posicoes)
        setDesenhoCompleto(true)
      }
    }

    frameId = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(frameId)
    // idAnimacao muda quando a geometria da rota muda; posicoes acompanha no mesmo render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAnimacao])

  if (pontosVisiveis.length < 2) return null

  const classeLinha = [
    'rota-gps-linha',
    pelasRuas && desenhoCompleto ? 'rota-gps-linha--fluxo' : '',
    !desenhoCompleto ? 'rota-gps-linha--desenhando' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {pelasRuas && desenhoCompleto && (
        <Polyline
          positions={posicoes}
          pathOptions={{
            color: COR_ROTA,
            weight: 8,
            opacity: 0.15,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}
      <Polyline
        positions={pontosVisiveis}
        pathOptions={{
          color: COR_ROTA,
          weight: pelasRuas ? 4 : 3,
          opacity: pelasRuas ? 0.92 : 0.5,
          lineCap: 'round',
          lineJoin: 'round',
          className: classeLinha,
          dashArray: pelasRuas ? undefined : '8 8',
        }}
      />
    </>
  )
}
