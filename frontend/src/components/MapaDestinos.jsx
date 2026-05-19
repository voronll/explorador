import { useEffect } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const CENTRO_BRASIL = [-14.235, -51.9253]
const ZOOM_INICIAL = 4

function criarIconeNumerado(numero) {
  return L.divIcon({
    className: 'marcador-numero',
    html: `<span>${numero}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

const iconePreview = L.divIcon({
  className: 'marcador-preview',
  html: '<span>+</span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

function CliqueNoMapa({ aoClique }) {
  useMapEvents({
    click(e) {
      aoClique(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function AjustarVisao({ destinos, pontoSelecionado }) {
  const mapa = useMap()

  useEffect(() => {
    const pontos = destinos.map((d) => [d.lat, d.lng])
    if (pontoSelecionado) {
      pontos.push([pontoSelecionado.lat, pontoSelecionado.lng])
    }

    if (pontos.length === 0) {
      mapa.setView(CENTRO_BRASIL, ZOOM_INICIAL)
      return
    }

    if (pontos.length === 1) {
      mapa.setView(pontos[0], 10)
      return
    }

    mapa.fitBounds(pontos, { padding: [48, 48] })
  }, [destinos, pontoSelecionado, mapa])

  return null
}

export default function MapaDestinos({ destinos, pontoSelecionado, aoCliqueMapa, desabilitado }) {
  const linhaRota = destinos.map((d) => [d.lat, d.lng])

  return (
    <section className="mapa-section">
      <h2>Mapa</h2>
      <p className="mapa-dica">
        {desabilitado
          ? 'Aguarde a operação em andamento…'
          : 'Clique no mapa para preencher latitude e longitude no formulário.'}
      </p>
      <div className="mapa-container">
        <MapContainer
          center={CENTRO_BRASIL}
          zoom={ZOOM_INICIAL}
          scrollWheelZoom
          className="mapa-leaflet"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {!desabilitado && <CliqueNoMapa aoClique={aoCliqueMapa} />}
          <AjustarVisao destinos={destinos} pontoSelecionado={pontoSelecionado} />

          {destinos.map((destino, indice) => (
            <Marker
              key={destino._id}
              position={[destino.lat, destino.lng]}
              icon={criarIconeNumerado(indice + 1)}
            >
              <Popup>
                <strong>
                  {indice + 1}. {destino.name}
                </strong>
                <br />
                {Number(destino.lat).toFixed(4)}, {Number(destino.lng).toFixed(4)}
              </Popup>
            </Marker>
          ))}

          {pontoSelecionado && (
            <Marker
              position={[pontoSelecionado.lat, pontoSelecionado.lng]}
              icon={iconePreview}
            />
          )}

          {linhaRota.length >= 2 && (
            <Polyline positions={linhaRota} pathOptions={{ color: '#aa3bff', weight: 3 }} />
          )}
        </MapContainer>
      </div>
    </section>
  )
}
