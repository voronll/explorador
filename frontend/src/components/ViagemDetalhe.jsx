import ListaDestinos from './ListaDestinos'
import ResumoRota from './ResumoRota'
import MapaDestinos from './MapaDestinos'
import { formatarData } from '../utils/formatacao'
import './ViagemDetalhe.css'

function destinosComId(destinos) {
  return destinos.map((destino, indice) => ({
    ...destino,
    _id: destino._id ?? `salvo-${indice}`,
  }))
}

export default function ViagemDetalhe({ viagem, aoVoltarLista, aoNovaViagem }) {
  const destinos = destinosComId(viagem.destinos ?? [])
  const resumo = viagem.resumoRota

  return (
    <div className="viagem-detalhe">
      <div className="viagem-detalhe__lista">
        <header className="viagem-detalhe__cabecalho">
          <div>
            <p className="viagem-detalhe__salvo">Viagem salva · {formatarData(viagem.createdAt)}</p>
            <h2 className="viagem-detalhe__titulo">{viagem.titulo}</h2>
            <p className="viagem-detalhe__cidade">{viagem.cidade?.nome}</p>
          </div>
          <div className="viagem-detalhe__acoes">
            <button type="button" className="btn-texto" onClick={aoVoltarLista}>
              Minhas viagens
            </button>
            <button type="button" className="btn-primario" onClick={aoNovaViagem}>
              Nova viagem
            </button>
          </div>
        </header>

        <section className="viagem-detalhe__secao">
          <h3 className="viagem-detalhe__secao-titulo">Paradas da rota</h3>
          <ListaDestinos destinos={destinos} somenteLeitura />
        </section>

        <section className="viagem-detalhe__secao">
          <h3 className="viagem-detalhe__secao-titulo">Distância e tempo</h3>
          <ResumoRota
            destinos={destinos}
            resumo={resumo}
            carregando={false}
            erro={resumo ? null : 'Resumo não disponível para esta viagem.'}
          />
        </section>
      </div>

      <div className="viagem-detalhe__mapa">
        <MapaDestinos
          destinos={destinos}
          cidadeAtiva={viagem.cidade}
          geometria={resumo?.geometria}
          carregandoRota={false}
          interativo={false}
          desabilitado
          painel
        />
      </div>
    </div>
  )
}
