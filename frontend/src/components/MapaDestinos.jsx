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

function CliqueNoMapa({ aoClique }) {
  useMapEvents({
    click(e) {
      aoClique(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function AjustarVisao({ destinos, cidadeAtiva }) {
  const mapa = useMap()

  useEffect(() => {
    const pontos = destinos.map((d) => [d.lat, d.lng])

    if (pontos.length >= 2) {
      mapa.fitBounds(pontos, { padding: [48, 48] })
      return
    }

    if (pontos.length === 1) {
      mapa.setView(pontos[0], 13)
      return
    }

    if (cidadeAtiva?.bbox) {
      mapa.fitBounds(cidadeAtiva.bbox, { padding: [32, 32] })
      return
    }

    if (cidadeAtiva) {
      mapa.setView([cidadeAtiva.lat, cidadeAtiva.lng], cidadeAtiva.zoom ?? 11)
      return
    }

    mapa.setView(CENTRO_BRASIL, ZOOM_INICIAL)
  }, [destinos, cidadeAtiva, mapa])

  return null
}

function centroInicial(cidadeAtiva) {
  if (cidadeAtiva) return [cidadeAtiva.lat, cidadeAtiva.lng]
  return CENTRO_BRASIL
}

export default function MapaDestinos({
  destinos,
  cidadeAtiva,
  aoCliqueMapa,
  desabilitado,
  painel = false,
}) {
  const linhaRota = destinos.map((d) => [d.lat, d.lng])
  const zoom = cidadeAtiva?.zoom ?? ZOOM_INICIAL

  const conteudoMapa = (
    <MapContainer
      center={centroInicial(cidadeAtiva)}
      zoom={zoom}
      scrollWheelZoom
      className={painel ? 'mapa-leaflet mapa-leaflet--painel' : 'mapa-leaflet'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {!desabilitado && <CliqueNoMapa aoClique={aoCliqueMapa} />}
      <AjustarVisao destinos={destinos} cidadeAtiva={cidadeAtiva} />

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

      {linhaRota.length >= 2 && (
        <Polyline positions={linhaRota} pathOptions={{ color: '#ff385c', weight: 3 }} />
      )}
    </MapContainer>
  )

  if (painel) {
    return (
      <div className="mapa-section mapa-section--painel">
        <p className="mapa-dica mapa-dica--painel">
          {desabilitado
            ? 'Salvando parada…'
            : 'Clique no mapa para adicionar uma parada à rota.'}
        </p>
        <div className="mapa-container mapa-container--painel">{conteudoMapa}</div>
      </div>
    )
  }

  return (
    <section className="mapa-section">
      <h2>Mapa</h2>
      <p className="mapa-dica">
        {desabilitado
          ? 'Aguarde a operação em andamento…'
          : 'Clique no mapa para adicionar paradas.'}
      </p>
      <div className="mapa-container">{conteudoMapa}</div>
    </section>
  )
}
