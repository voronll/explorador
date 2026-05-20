import { useState } from 'react'
import { formatarData, formatarDistancia, formatarDuracao } from '../utils/formatacao'
import ModalConfirmacao from './ModalConfirmacao'
import './MinhasViagens.css'

function IconeLixeira() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v5M14 11v5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function MinhasViagens({
  viagens,
  carregando,
  aoAbrirViagem,
  aoNovaViagem,
  aoRemover,
  removendoId,
}) {
  const [viagemParaExcluir, setViagemParaExcluir] = useState(null)

  async function confirmarExclusao() {
    if (!viagemParaExcluir) return
    await aoRemover(viagemParaExcluir._id)
    setViagemParaExcluir(null)
  }

  if (carregando) {
    return <p className="loading pagina-viagens__loading">Carregando viagens…</p>
  }

  if (viagens.length === 0) {
    return (
      <div className="pagina-viagens__vazio">
        <h2>Nenhuma viagem salva ainda</h2>
        <p>Planeje uma rota e clique em &quot;Salvar viagem&quot; para guardá-la aqui.</p>
        <button type="button" className="btn-primario" onClick={aoNovaViagem}>
          Planejar viagem
        </button>
      </div>
    )
  }

  return (
    <>
      <ul className="viagens-lista">
        {viagens.map((viagem) => {
          const totalParadas = viagem.destinos?.length ?? 0
          const distancia = viagem.resumoRota?.total?.distanciaMetros
          const duracao = viagem.resumoRota?.total?.duracaoSegundos
          const excluindo = removendoId === viagem._id

          return (
            <li key={viagem._id} className="viagem-card">
              <button
                type="button"
                className="viagem-card__excluir"
                onClick={() => setViagemParaExcluir(viagem)}
                disabled={excluindo}
                aria-label={`Excluir ${viagem.titulo}`}
              >
                <IconeLixeira />
              </button>

              <button
                type="button"
                className="viagem-card__corpo"
                onClick={() => aoAbrirViagem(viagem._id)}
              >
                <div className="viagem-card__topo">
                  <h3 className="viagem-card__titulo">{viagem.titulo}</h3>
                  <span className="viagem-card__data">{formatarData(viagem.createdAt)}</span>
                </div>
                <p className="viagem-card__cidade">{viagem.cidade?.nome}</p>
                <div className="viagem-card__meta">
                  <span>
                    {totalParadas} parada{totalParadas !== 1 ? 's' : ''}
                  </span>
                  {distancia > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{formatarDistancia(distancia)}</span>
                    </>
                  )}
                  {duracao > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{formatarDuracao(duracao)}</span>
                    </>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <ModalConfirmacao
        aberto={Boolean(viagemParaExcluir)}
        titulo="Excluir viagem?"
        mensagem={
          viagemParaExcluir
            ? `A viagem "${viagemParaExcluir.titulo}" será removida permanentemente. Essa ação não pode ser desfeita.`
            : ''
        }
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        carregando={Boolean(removendoId)}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => !removendoId && setViagemParaExcluir(null)}
      />
    </>
  )
}
