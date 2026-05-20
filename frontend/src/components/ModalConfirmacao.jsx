import { useEffect } from 'react'
import './ModalConfirmacao.css'

export default function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  carregando = false,
  aoConfirmar,
  aoCancelar,
}) {
  useEffect(() => {
    if (!aberto) return

    function aoTeclar(evento) {
      if (evento.key === 'Escape' && !carregando) aoCancelar()
    }

    document.addEventListener('keydown', aoTeclar)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = ''
    }
  }, [aberto, carregando, aoCancelar])

  if (!aberto) return null

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={carregando ? undefined : aoCancelar}
    >
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        aria-describedby="modal-mensagem"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo" className="modal__titulo">
          {titulo}
        </h2>
        <p id="modal-mensagem" className="modal__mensagem">
          {mensagem}
        </p>
        <div className="modal__acoes">
          <button
            type="button"
            className="modal__btn modal__btn--secundario"
            onClick={aoCancelar}
            disabled={carregando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--perigo"
            onClick={aoConfirmar}
            disabled={carregando}
          >
            {carregando ? 'Excluindo…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
