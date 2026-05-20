/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import { apiDestinos } from './api/cliente'
import { apiGeocoding } from './api/geocoding'
import { apiViagens } from './api/viagens'
import BarraBusca from './components/BarraBusca'
import PlanejamentoView from './components/PlanejamentoView'
import MinhasViagens from './components/MinhasViagens'
import ViagemDetalhe from './components/ViagemDetalhe'
import Header from './components/Header'
import './App.css'

export default function App() {
  const [modo, setModo] = useState('home')
  const [cidadeAtiva, setCidadeAtiva] = useState(null)
  const [destinos, setDestinos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  const [viagens, setViagens] = useState([])
  const [carregandoViagens, setCarregandoViagens] = useState(false)
  const [viagemAtual, setViagemAtual] = useState(null)
  const [carregandoViagem, setCarregandoViagem] = useState(false)
  const [removendoId, setRemovendoId] = useState(null)

  const carregarDestinos = useCallback(async () => {
    setErro(null)
    const lista = await apiDestinos.listar()
    setDestinos(lista)
  }, [])

  const carregarViagens = useCallback(async () => {
    const lista = await apiViagens.listar()
    setViagens(lista)
  }, [])

  useEffect(() => {
    if (modo !== 'planejamento') return

    setCarregando(true)
    carregarDestinos()
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [modo, carregarDestinos])

  useEffect(() => {
    if (modo !== 'minhas-viagens') return

    setCarregandoViagens(true)
    carregarViagens()
      .catch((err) => setErro(err.message))
      .finally(() => setCarregandoViagens(false))
  }, [modo, carregarViagens])

  useEffect(() => {
    if (modo !== 'viagem-detalhe' || !viagemAtual?._id || viagemAtual.titulo) return

    setCarregandoViagem(true)
    apiViagens
      .obter(viagemAtual._id)
      .then(setViagemAtual)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregandoViagem(false))
  }, [modo, viagemAtual?._id, viagemAtual?.titulo])

  async function executarAcao(acao) {
    setOcupado(true)
    setErro(null)
    try {
      await acao()
      await carregarDestinos()
    } catch (err) {
      setErro(err.message)
    } finally {
      setOcupado(false)
    }
  }

  async function limparRascunhoPlanejamento() {
    await apiDestinos.limparRascunho()
    setDestinos([])
  }

  function aoIrHome() {
    limparRascunhoPlanejamento().catch(() => {})
    setModo('home')
    setCidadeAtiva(null)
    setErro(null)
  }

  function aoMinhasViagens() {
    setModo('minhas-viagens')
    setErro(null)
  }

  async function aoBuscarCidade(cidade) {
    setErro(null)
    setCarregando(true)
    try {
      await limparRascunhoPlanejamento()
      setCidadeAtiva(cidade)
      setModo('planejamento')
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  function aoTrocarCidade() {
    limparRascunhoPlanejamento().catch(() => {})
    setModo('home')
    setCidadeAtiva(null)
    setErro(null)
  }

  function aoCliqueMapa(lat, lng) {
    if (!cidadeAtiva || ocupado) return

    executarAcao(async () => {
      const local = await apiGeocoding.reverso(lat, lng)
      await apiDestinos.criar({ name: local.nome, lat, lng })
    })
  }

  function aoRemover(id) {
    return executarAcao(() => apiDestinos.remover(id))
  }

  function aoMover(indiceOrigem, indiceDestino) {
    const ids = destinos.map((d) => d._id)
    ;[ids[indiceOrigem], ids[indiceDestino]] = [ids[indiceDestino], ids[indiceOrigem]]
    return executarAcao(() => apiDestinos.reordenar(ids))
  }

  async function aoSalvarViagem(resumo) {
    if (!cidadeAtiva || destinos.length === 0) return

    setSalvando(true)
    setErro(null)

    try {
      const viagem = await apiViagens.criar({
        cidade: cidadeAtiva,
        destinos: destinos.map((d, i) => ({
          name: d.name,
          lat: d.lat,
          lng: d.lng,
          order: i,
        })),
        resumoRota: resumo ?? null,
      })
      await limparRascunhoPlanejamento()
      setViagemAtual(viagem)
      setModo('viagem-detalhe')
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  function aoAbrirViagem(id) {
    setViagemAtual({ _id: id })
    setModo('viagem-detalhe')
    setErro(null)
  }

  async function aoRemoverViagem(id) {
    setRemovendoId(id)
    setErro(null)
    try {
      await apiViagens.remover(id)
      setViagens((lista) => lista.filter((v) => v._id !== id))
    } catch (err) {
      setErro(err.message)
    } finally {
      setRemovendoId(null)
    }
  }

  function classeMain() {
    if (modo === 'home') return 'app app--home'
    if (modo === 'planejamento' || modo === 'viagem-detalhe') return 'app app--planejamento'
    return 'app app--pagina'
  }

  const mostrarErroFlutuante =
    erro && (modo === 'planejamento' || modo === 'minhas-viagens' || modo === 'viagem-detalhe')

  return (
    <>
      <Header aoIrHome={aoIrHome} aoMinhasViagens={aoMinhasViagens} />

      <main className={classeMain()}>
        {mostrarErroFlutuante && (
          <div className="alert alert-error alert--flutuante" role="alert">
            {erro}
          </div>
        )}

        {modo === 'home' && <BarraBusca aoBuscar={aoBuscarCidade} />}

        {modo === 'planejamento' && cidadeAtiva && (
          <PlanejamentoView
            cidade={cidadeAtiva}
            destinos={destinos}
            carregando={carregando}
            ocupado={ocupado}
            salvando={salvando}
            aoTrocarCidade={aoTrocarCidade}
            aoCliqueMapa={aoCliqueMapa}
            aoRemover={aoRemover}
            aoSubir={(indice) => aoMover(indice, indice - 1)}
            aoDescer={(indice) => aoMover(indice, indice + 1)}
            aoSalvar={aoSalvarViagem}
          />
        )}

        {modo === 'minhas-viagens' && (
          <div className="pagina-viagens">
            <header className="pagina-viagens__cabecalho">
              <h1>Minhas viagens</h1>
              <button type="button" className="btn-primario" onClick={aoIrHome}>
                Nova viagem
              </button>
            </header>
            <MinhasViagens
              viagens={viagens}
              carregando={carregandoViagens}
              aoAbrirViagem={aoAbrirViagem}
              aoNovaViagem={aoIrHome}
              aoRemover={aoRemoverViagem}
              removendoId={removendoId}
            />
          </div>
        )}

        {modo === 'viagem-detalhe' && (
          <>
            {carregandoViagem || !viagemAtual?.titulo ? (
              <p className="loading pagina-viagens__loading">Carregando viagem…</p>
            ) : (
              <ViagemDetalhe
                viagem={viagemAtual}
                aoVoltarLista={aoMinhasViagens}
                aoNovaViagem={aoIrHome}
              />
            )}
          </>
        )}
      </main>
    </>
  )
}
