import { useEffect, useRef, useState } from 'react'
import { buscarCidadesMock, resolverCidadeMock } from '../mocks/cidades'
import './BarraBusca.css'

export default function BarraBusca({ aoBuscar, erroExterno }) {
  const [termo, setTermo] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [erroLocal, setErroLocal] = useState(null)
  const [listaAberta, setListaAberta] = useState(false)
  const containerRef = useRef(null)

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

  function aoAlterarTermo(valor) {
    setTermo(valor)
    setErroLocal(null)
    const encontradas = buscarCidadesMock(valor)
    setSugestoes(encontradas)
    setListaAberta(valor.trim().length > 0 && encontradas.length > 0)
  }

  function confirmarBusca(texto) {
    const consulta = (texto ?? termo).trim()
    if (!consulta) {
      setErroLocal('Digite o nome de uma cidade.')
      return
    }

    const cidade = resolverCidadeMock(consulta)
    if (!cidade) {
      setErroLocal('Cidade não encontrada. Tente São Paulo, Rio de Janeiro, Salvador…')
      setListaAberta(false)
      return
    }

    setErroLocal(null)
    setTermo(cidade.nome)
    setListaAberta(false)
    aoBuscar(cidade)
  }

  function aoEnviar(evento) {
    evento.preventDefault()
    confirmarBusca()
  }

  function aoSelecionarSugestao(cidade) {
    confirmarBusca(cidade.nome)
  }

  return (
    <section className="home-busca" aria-label="Buscar cidade de destino">
      <div className="home-busca__intro">
        <h2 className="home-busca__titulo">Para onde você vai?</h2>
        <p className="home-busca__texto">
          Busque uma cidade e monte sua rota clicando nos pontos do mapa.
        </p>
      </div>

      <div className="home-busca__campo" ref={containerRef}>
        <form className="barra-busca" onSubmit={aoEnviar}>
          <span className="barra-busca__icone" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.75" />
            </svg>
          </span>
          <input
            type="search"
            className="barra-busca__input"
            placeholder="Ex.: São Paulo, Rio de Janeiro…"
            value={termo}
            onChange={(e) => aoAlterarTermo(e.target.value)}
            onFocus={() => sugestoes.length > 0 && setListaAberta(true)}
            autoComplete="off"
            aria-label="Nome da cidade"
            aria-expanded={listaAberta}
            aria-controls="sugestoes-cidades"
            aria-invalid={Boolean(erro)}
          />
          <button type="submit" className="barra-busca__botao">
            Buscar
          </button>
        </form>

        {listaAberta && (
          <ul id="sugestoes-cidades" className="barra-busca__sugestoes" role="listbox">
            {sugestoes.map((cidade) => (
              <li key={cidade.id} role="option">
                <button
                  type="button"
                  className="barra-busca__sugestao"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aoSelecionarSugestao(cidade)}
                >
                  <span className="barra-busca__sugestao-nome">{cidade.nome}</span>
                  <span className="barra-busca__sugestao-pais">Brasil</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {erro && (
          <p className="barra-busca__erro" role="alert">
            {erro}
          </p>
        )}
      </div>
    </section>
  )
}
