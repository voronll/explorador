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

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__marca">
          <IconeExplorador />
          <div className="site-header__textos">
            <h1 className="site-header__titulo">Explorador</h1>
            <p className="site-header__subtitulo">Seu melhor guia</p>
          </div>
        </div>
      </div>
    </header>
  )
}
