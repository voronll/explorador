import { useEffect, useState } from 'react'

const formularioVazio = { name: '', lat: '', lng: '' }

export default function FormularioDestino({ aoEnviar, desabilitado, coordenadasDoMapa }) {
  const [formulario, setFormulario] = useState(formularioVazio)

  useEffect(() => {
    if (!coordenadasDoMapa) return
    setFormulario((anterior) => ({
      ...anterior,
      lat: coordenadasDoMapa.lat.toFixed(6),
      lng: coordenadasDoMapa.lng.toFixed(6),
    }))
  }, [coordenadasDoMapa])

  function aoAlterarCampo(e) {
    const { name, value } = e.target
    setFormulario((anterior) => ({ ...anterior, [name]: value }))
  }

  async function aoEnviarFormulario(e) {
    e.preventDefault()
    await aoEnviar({
      name: formulario.name.trim(),
      lat: Number(formulario.lat),
      lng: Number(formulario.lng),
    })
    setFormulario(formularioVazio)
  }

  return (
    <form className="destination-form" onSubmit={aoEnviarFormulario}>
      <h2>Adicionar destino</h2>
      <div className="form-grid">
        <label>
          Nome
          <input
            name="name"
            type="text"
            placeholder="Ex.: São Paulo"
            value={formulario.name}
            onChange={aoAlterarCampo}
            required
            disabled={desabilitado}
          />
        </label>
        <label>
          Latitude
          <input
            name="lat"
            type="number"
            step="any"
            placeholder="-23.55"
            value={formulario.lat}
            onChange={aoAlterarCampo}
            required
            disabled={desabilitado}
          />
        </label>
        <label>
          Longitude
          <input
            name="lng"
            type="number"
            step="any"
            placeholder="-46.63"
            value={formulario.lng}
            onChange={aoAlterarCampo}
            required
            disabled={desabilitado}
          />
        </label>
      </div>
      <button type="submit" disabled={desabilitado}>
        Adicionar à rota
      </button>
    </form>
  )
}
