/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import { apiDestinos } from './api/cliente'
import BarraBusca from './components/BarraBusca'
import PlanejamentoView from './components/PlanejamentoView'
import Header from './components/Header'
import { mockReversoGeocode } from './mocks/cidades'
import './App.css'

export default function App() {
  const [modo, setModo] = useState('home')
  const [cidadeAtiva, setCidadeAtiva] = useState(null)
  const [destinos, setDestinos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState(null)

  const carregarDestinos = useCallback(async () => {
    setErro(null)
    const lista = await apiDestinos.listar()
    setDestinos(lista)
  }, [])

  useEffect(() => {
    if (modo !== 'planejamento') return

    setCarregando(true)
    carregarDestinos()
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [modo, carregarDestinos])

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

  function aoBuscarCidade(cidade) {
    setCidadeAtiva(cidade)
    setModo('planejamento')
    setErro(null)
  }

  function aoTrocarCidade() {
    setModo('home')
    setCidadeAtiva(null)
    setErro(null)
  }

  function aoCliqueMapa(lat, lng) {
    if (!cidadeAtiva || ocupado) return

    const nome = mockReversoGeocode(lat, lng, cidadeAtiva.nome)
    executarAcao(() => apiDestinos.criar({ name: nome, lat, lng }))
  }

  function aoRemover(id) {
    return executarAcao(() => apiDestinos.remover(id))
  }

  function aoMover(indiceOrigem, indiceDestino) {
    const ids = destinos.map((d) => d._id)
    ;[ids[indiceOrigem], ids[indiceDestino]] = [ids[indiceDestino], ids[indiceOrigem]]
    return executarAcao(() => apiDestinos.reordenar(ids))
  }

  const classeMain =
    modo === 'home' ? 'app app--home' : 'app app--planejamento'

  return (
    <>
      <Header />

      <main className={classeMain}>
        {erro && modo === 'planejamento' && (
          <div className="alert alert-error alert--flutuante" role="alert">
            {erro}
          </div>
        )}

        {modo === 'home' ? (
          <BarraBusca aoBuscar={aoBuscarCidade} />
        ) : (
          <PlanejamentoView
            cidade={cidadeAtiva}
            destinos={destinos}
            carregando={carregando}
            ocupado={ocupado}
            aoTrocarCidade={aoTrocarCidade}
            aoCliqueMapa={aoCliqueMapa}
            aoRemover={aoRemover}
            aoSubir={(indice) => aoMover(indice, indice - 1)}
            aoDescer={(indice) => aoMover(indice, indice + 1)}
          />
        )}
      </main>
    </>
  )
}
