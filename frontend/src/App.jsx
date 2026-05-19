import { useCallback, useEffect, useState } from 'react'
import { apiDestinos } from './api/cliente'
import FormularioDestino from './components/FormularioDestino'
import ListaDestinos from './components/ListaDestinos'
import ResumoRota from './components/ResumoRota'
import MapaDestinos from './components/MapaDestinos'
import './App.css'

export default function App() {
  const [destinos, setDestinos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState(null)
  const [pontoSelecionado, setPontoSelecionado] = useState(null)

  const carregarDestinos = useCallback(async () => {
    setErro(null)
    const lista = await apiDestinos.listar()
    setDestinos(lista)
  }, [])

  useEffect(() => {
    carregarDestinos()
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [carregarDestinos])

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

  function aoCriar(dados) {
    return executarAcao(async () => {
      await apiDestinos.criar(dados)
      setPontoSelecionado(null)
    })
  }

  function aoCliqueMapa(lat, lng) {
    setPontoSelecionado({ lat, lng })
  }

  function aoRemover(id) {
    return executarAcao(() => apiDestinos.remover(id))
  }

  function aoMover(indiceOrigem, indiceDestino) {
    const ids = destinos.map((d) => d._id)
    ;[ids[indiceOrigem], ids[indiceDestino]] = [ids[indiceDestino], ids[indiceOrigem]]
    return executarAcao(() => apiDestinos.reordenar(ids))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Explorador</h1>
        <p>Planeje sua rota de viagem — adicione destinos e defina a ordem.</p>
      </header>

      {erro && (
        <div className="alert alert-error" role="alert">
          {erro}
        </div>
      )}

      <MapaDestinos
        destinos={destinos}
        pontoSelecionado={pontoSelecionado}
        aoCliqueMapa={aoCliqueMapa}
        desabilitado={ocupado}
      />

      <FormularioDestino
        aoEnviar={aoCriar}
        desabilitado={ocupado}
        coordenadasDoMapa={pontoSelecionado}
      />

      <section className="route-section">
        <h2>Sua rota</h2>
        {carregando ? (
          <p className="loading">Carregando destinos…</p>
        ) : (
          <ListaDestinos
            destinos={destinos}
            aoRemover={aoRemover}
            aoSubir={(indice) => aoMover(indice, indice - 1)}
            aoDescer={(indice) => aoMover(indice, indice + 1)}
            desabilitado={ocupado}
          />
        )}
      </section>

      <section className="route-section">
        <h2>Distância e tempo</h2>
        <ResumoRota destinos={destinos} />
      </section>
    </div>
  )
}
