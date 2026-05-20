export default function ListaDestinos({
  destinos,
  aoRemover,
  aoSubir,
  aoDescer,
  desabilitado,
  somenteLeitura = false,
  mensagemVazia = 'Nenhum destino na rota ainda. Adicione o primeiro no mapa.',
}) {
  if (destinos.length === 0) {
    return <p className="empty-state">{mensagemVazia}</p>
  }

  return (
    <ol className="destination-list">
      {destinos.map((destino, indice) => (
        <li key={destino._id ?? `parada-${indice}`} className="destination-item">
          <span className="destination-order">{indice + 1}</span>
          <div className="destination-info">
            <strong>{destino.name}</strong>
          </div>
          {!somenteLeitura && (
            <div className="destination-actions">
              <button
                type="button"
                title="Subir"
                onClick={() => aoSubir(indice)}
                disabled={desabilitado || indice === 0}
                aria-label={`Subir ${destino.name}`}
              >
                ↑
              </button>
              <button
                type="button"
                title="Descer"
                onClick={() => aoDescer(indice)}
                disabled={desabilitado || indice === destinos.length - 1}
                aria-label={`Descer ${destino.name}`}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => aoRemover(destino._id)}
                disabled={desabilitado}
                aria-label={`Remover ${destino.name}`}
              >
                Remover
              </button>
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
