import ListaDestinos from './ListaDestinos'
import ResumoRota from './ResumoRota'
import MapaDestinos from './MapaDestinos'
import './PlanejamentoView.css'

export default function PlanejamentoView({
  cidade,
  destinos,
  carregando,
  ocupado,
  aoTrocarCidade,
  aoCliqueMapa,
  aoRemover,
  aoSubir,
  aoDescer,
}) {
  return (
    <div className="planejamento">
      <div className="planejamento__lista">
        <div className="planejamento__cabecalho">
          <div>
            <h2 className="planejamento__titulo">{cidade.nome}</h2>
            <p className="planejamento__dica">
              Clique no mapa para adicionar paradas na sua rota.
            </p>
          </div>
          <button type="button" className="btn-texto" onClick={aoTrocarCidade}>
            Trocar cidade
          </button>
        </div>

        <section className="planejamento__secao">
          <h3 className="planejamento__secao-titulo">Sua rota</h3>
          {carregando ? (
            <p className="loading">Carregando destinos…</p>
          ) : (
            <ListaDestinos
              destinos={destinos}
              aoRemover={aoRemover}
              aoSubir={aoSubir}
              aoDescer={aoDescer}
              desabilitado={ocupado}
              mensagemVazia={`Nenhuma parada em ${cidade.nome} ainda. Clique no mapa ao lado.`}
            />
          )}
        </section>

        <section className="planejamento__secao">
          <h3 className="planejamento__secao-titulo">Distância e tempo</h3>
          <ResumoRota destinos={destinos} />
        </section>
      </div>

      <div className="planejamento__mapa">
        <MapaDestinos
          destinos={destinos}
          cidadeAtiva={cidade}
          aoCliqueMapa={aoCliqueMapa}
          desabilitado={ocupado}
          painel
        />
      </div>
    </div>
  )
}
