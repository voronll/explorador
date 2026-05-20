import { formatarData, formatarDistancia, formatarDuracao } from '../utils/formatacao'
import './MinhasViagens.css'

export default function MinhasViagens({
  viagens,
  carregando,
  aoAbrirViagem,
  aoNovaViagem,
  aoRemover,
  removendoId,
}) {
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
    <ul className="viagens-lista">
      {viagens.map((viagem) => {
        const totalParadas = viagem.destinos?.length ?? 0
        const distancia = viagem.resumoRota?.total?.distanciaMetros
        const duracao = viagem.resumoRota?.total?.duracaoSegundos

        return (
          <li key={viagem._id} className="viagem-card">
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
            <button
              type="button"
              className="viagem-card__remover"
              onClick={() => aoRemover(viagem._id)}
              disabled={removendoId === viagem._id}
              aria-label={`Excluir ${viagem.titulo}`}
            >
              {removendoId === viagem._id ? 'Excluindo…' : 'Excluir'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
