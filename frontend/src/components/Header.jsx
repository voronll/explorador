import './Header.css'
import IconeExplorador from './IconeExplorador'

export default function Header({ aoIrHome, aoMinhasViagens }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button type="button" className="site-header__marca" onClick={aoIrHome}>
          <IconeExplorador className="site-header__icone" />
          <div className="site-header__textos">
            <span className="site-header__titulo">Explorador</span>
            <span className="site-header__subtitulo">Seu melhor guia de viagens!</span>
          </div>
        </button>

        <nav className="site-header__nav">
          <button type="button" className="site-header__nav-btn" onClick={aoMinhasViagens}>
            Minhas viagens
          </button>
        </nav>
      </div>
    </header>
  )
}
