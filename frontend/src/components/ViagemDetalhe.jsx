import { useEffect, useState } from 'react'
import ListaDestinos from './ListaDestinos'
import ResumoRota from './ResumoRota'
import MapaDestinos from './MapaDestinos'
import { apiGeocoding } from '../api/geocoding'
import { apiViagens } from '../api/viagens'
import { useResumoRotaPreview } from '../hooks/useResumoRotaPreview'
import { formatarData } from '../utils/formatacao'
import './ViagemDetalhe.css'

function destinosComId(destinos) {
  return destinos.map((destino, indice) => ({
    ...destino,
    _id: destino._id ?? `salvo-${indice}`,
  }))
}

export default function ViagemDetalhe({ viagem, aoNovaViagem, aoViagemAtualizada, aoErro }) {
  const [editando, setEditando] = useState(false)
  const [destinosLocal, setDestinosLocal] = useState(() => destinosComId(viagem.destinos ?? []))
  const [ocupado, setOcupado] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const { resumo: resumoPreview, carregando: carregandoRota, erro: erroRota } =
    useResumoRotaPreview(destinosLocal, editando)

  useEffect(() => {
    setDestinosLocal(destinosComId(viagem.destinos ?? []))
    setEditando(false)
  }, [viagem._id])

  const destinosExibidos = editando ? destinosLocal : destinosComId(viagem.destinos ?? [])
  const resumo = editando ? resumoPreview : viagem.resumoRota

  function iniciarEdicao() {
    setDestinosLocal(destinosComId(viagem.destinos ?? []))
    setEditando(true)
  }

  function cancelarEdicao() {
    setDestinosLocal(destinosComId(viagem.destinos ?? []))
    setEditando(false)
  }

  function aoRemover(id) {
    setDestinosLocal((lista) => lista.filter((d) => d._id !== id))
  }

  function aoMover(indiceOrigem, indiceDestino) {
    setDestinosLocal((lista) => {
      const proxima = [...lista]
      ;[proxima[indiceOrigem], proxima[indiceDestino]] = [
        proxima[indiceDestino],
        proxima[indiceOrigem],
      ]
      return proxima
    })
  }

  async function aoCliqueMapa(lat, lng) {
    if (ocupado) return

    setOcupado(true)
    try {
      const local = await apiGeocoding.reverso(lat, lng)
      setDestinosLocal((lista) => [
        ...lista,
        {
          _id: `edit-${Date.now()}`,
          name: local.nome,
          lat,
          lng,
          order: lista.length,
        },
      ])
    } catch (err) {
      aoErro?.(err.message)
    } finally {
      setOcupado(false)
    }
  }

  async function salvarEdicao() {
    if (destinosLocal.length === 0) return

    setSalvando(true)
    try {
      const atualizada = await apiViagens.atualizar(viagem._id, {
        destinos: destinosLocal.map((d, i) => ({
          name: d.name,
          lat: d.lat,
          lng: d.lng,
          order: i,
        })),
      })
      aoViagemAtualizada(atualizada)
      setEditando(false)
    } catch (err) {
      aoErro?.(err.message)
    } finally {
      setSalvando(false)
    }
  }

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
            {editando ? (
              <button
                type="button"
                className="btn-primario"
                onClick={salvarEdicao}
                disabled={salvando || ocupado || destinosLocal.length === 0}
              >
                {salvando ? 'Salvando…' : 'Salvar'}
              </button>
            ) : (
              <button type="button" className="btn-primario" onClick={aoNovaViagem}>
                Nova viagem
              </button>
            )}
          </div>
        </header>

        <section className="viagem-detalhe__secao">
          <div className="viagem-detalhe__secao-cabecalho">
            <h3 className="viagem-detalhe__secao-titulo">Paradas da rota</h3>
            {editando ? (
              <button type="button" className="btn-texto" onClick={cancelarEdicao} disabled={salvando}>
                Cancelar
              </button>
            ) : (
              <button type="button" className="btn-texto" onClick={iniciarEdicao}>
                Editar
              </button>
            )}
          </div>
          <ListaDestinos
            destinos={destinosExibidos}
            somenteLeitura={!editando}
            aoRemover={aoRemover}
            aoSubir={(indice) => aoMover(indice, indice - 1)}
            aoDescer={(indice) => aoMover(indice, indice + 1)}
            desabilitado={ocupado || salvando}
            mensagemVazia={
              editando
                ? 'Nenhuma parada na rota. Clique no mapa ao lado para adicionar.'
                : 'Nenhuma parada registrada nesta viagem.'
            }
          />
        </section>

        <section className="viagem-detalhe__secao">
          <h3 className="viagem-detalhe__secao-titulo">Distância e tempo</h3>
          <ResumoRota
            destinos={destinosExibidos}
            resumo={resumo}
            carregando={editando && carregandoRota}
            erro={
              editando
                ? erroRota
                : resumo
                  ? null
                  : 'Resumo não disponível para esta viagem.'
            }
          />
        </section>
      </div>

      <div className="viagem-detalhe__mapa">
        <MapaDestinos
          destinos={destinosExibidos}
          cidadeAtiva={viagem.cidade}
          geometria={resumo?.geometria}
          carregandoRota={editando && carregandoRota}
          interativo={editando}
          destacado={editando}
          aoCliqueMapa={editando ? aoCliqueMapa : undefined}
          desabilitado={ocupado}
          painel
        />
      </div>
    </div>
  )
}
