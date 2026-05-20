/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'
import { apiGeocoding } from '../api/geocoding'
import IconeExplorador from './IconeExplorador'
import './BarraBusca.css'

const DEBOUNCE_MS = 450
const MIN_CARACTERES = 2

function IconeLocal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export default function BarraBusca({ aoBuscar, erroExterno }) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [erroLocal, setErroLocal] = useState(null)
  const [listaAberta, setListaAberta] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  const erro = erroExterno ?? erroLocal

  useEffect(() => {
    function aoClicarFora(evento) {
      if (containerRef.current && !containerRef.current.contains(evento.target)) {
        setListaAberta(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)

    const consulta = termo.trim()
    if (consulta.length < MIN_CARACTERES) {
      setSugestoes([])
      setListaAberta(false)
      setBuscandoSugestoes(false)
      return
    }

    setBuscandoSugestoes(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const resultados = await apiGeocoding.buscar(consulta, 5)
        setSugestoes(resultados)
        setListaAberta(resultados.length > 0)
      } catch {
        setSugestoes([])
        setListaAberta(false)
      } finally {
        setBuscandoSugestoes(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [termo])

  async function confirmarBusca(texto) {
    const consulta = (texto ?? termo).trim()
    if (!consulta) {
      setErroLocal('Digite o nome de uma cidade.')
      return
    }

    if (consulta.length < MIN_CARACTERES) {
      setErroLocal('Digite pelo menos 2 caracteres.')
      return
    }

    setBuscando(true)
    setErroLocal(null)

    try {
      const resultados = await apiGeocoding.buscar(consulta, 5)
      if (resultados.length === 0) {
        setErroLocal('Nenhum local encontrado. Tente outro nome.')
        setListaAberta(false)
        return
      }

      const consultaNorm = normalizar(consulta)
      const cidade =
        resultados.find((item) => normalizar(item.nome) === consultaNorm) ?? resultados[0]

      setTermo(cidade.nome)
      setListaAberta(false)
      aoBuscar(cidade)
    } catch (err) {
      setErroLocal(err.message)
    } finally {
      setBuscando(false)
    }
  }

  function aoEnviar(evento) {
    evento.preventDefault()
    confirmarBusca()
  }

  function aoSelecionarSugestao(cidade) {
    setTermo(cidade.nome)
    setListaAberta(false)
    setErroLocal(null)
    aoBuscar(cidade)
  }

  function aoAlterarTermo(valor) {
    setTermo(valor)
    setErroLocal(null)
  }

  const termoValido = termo.trim().length >= MIN_CARACTERES
  const carregandoAutocomplete = buscandoSugestoes && termoValido
  const mostrarSugestoes =
    carregandoAutocomplete || (listaAberta && sugestoes.length > 0)

  return (
    <section className="home-busca" aria-label="Buscar cidade de destino">
      <div className="home-busca__intro">
        <IconeExplorador className="home-busca__logo" />
        <h2 className="home-busca__titulo">Para onde você vai?</h2>
        <p className="home-busca__texto">
          Busque uma cidade e monte sua rota clicando nos pontos do mapa.
        </p>
      </div>

      <div className="home-busca__campo" ref={containerRef}>
        <form
          className={`barra-busca${carregandoAutocomplete || buscando ? ' barra-busca--carregando' : ''}`}
          onSubmit={aoEnviar}
        >
          <span
            className={`barra-busca__icone${carregandoAutocomplete ? ' barra-busca__icone--loading' : ''}`}
            aria-hidden={!carregandoAutocomplete}
          >
            {carregandoAutocomplete ? (
              <span className="barra-busca__spinner" aria-label="Buscando cidades" />
            ) : (
              <IconeLocal />
            )}
          </span>
          <input
            type="search"
            className="barra-busca__input"
            placeholder="Ex.: São Paulo, Curitiba, Salvador…"
            value={termo}
            onChange={(e) => aoAlterarTermo(e.target.value)}
            onFocus={() => (sugestoes.length > 0 || carregandoAutocomplete) && setListaAberta(true)}
            autoComplete="off"
            disabled={buscando}
            aria-label="Nome da cidade"
            aria-busy={carregandoAutocomplete}
            aria-expanded={mostrarSugestoes}
            aria-controls="sugestoes-cidades"
            aria-invalid={Boolean(erro)}
          />
          <button
            type="submit"
            className="barra-busca__botao"
            disabled={buscando || carregandoAutocomplete}
          >
            {buscando ? (
              <>
                <span className="barra-busca__spinner barra-busca__spinner--botao" aria-hidden />
                <span>Buscando…</span>
              </>
            ) : (
              'Buscar'
            )}
          </button>
        </form>

        {mostrarSugestoes && (
          <ul id="sugestoes-cidades" className="barra-busca__sugestoes" role="listbox">
            {carregandoAutocomplete ? (
              <li className="barra-busca__status" role="status">
                <span className="barra-busca__spinner barra-busca__spinner--lista" aria-hidden />
                Buscando cidades…
              </li>
            ) : (
              sugestoes.map((cidade) => (
                <li key={cidade.id} role="option">
                  <button
                    type="button"
                    className="barra-busca__sugestao"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => aoSelecionarSugestao(cidade)}
                  >
                    <span className="barra-busca__sugestao-nome">{cidade.nome}</span>
                    <span className="barra-busca__sugestao-pais">
                      {cidade.rotulo || 'Brasil'}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        {erro && (
          <p className="barra-busca__erro" role="alert">
            {erro}
          </p>
        )}

        <p className="barra-busca__credito">
          Busca de cidades via OpenStreetMap (Nominatim)
        </p>
      </div>
    </section>
  )
}
