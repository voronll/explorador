import './Header.css'

function IconeExplorador() {
  return (
    <svg
      className="site-header__icone"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="16" cy="16" r="16" fill="currentColor" />
      <path
        d="M16 8.5c-3.59 0-6.5 2.69-6.5 6 0 4.88 6.5 9 6.5 9s6.5-4.12 6.5-9c0-3.31-2.91-6-6.5-6Z"
        fill="#fff"
      />
      <circle cx="16" cy="14.5" r="2.25" fill="currentColor" />
    </svg>
  )
}

export default function Header({ aoIrHome, aoMinhasViagens }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button type="button" className="site-header__marca" onClick={aoIrHome}>
          <IconeExplorador />
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
