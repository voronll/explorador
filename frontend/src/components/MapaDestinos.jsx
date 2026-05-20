import { useEffect, useMemo } from 'react'
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
import RotaAnimada, { chaveGeometria } from './RotaAnimada'
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

function AjustarVisao({ destinos, cidadeAtiva, geometria }) {
  const mapa = useMap()

  useEffect(() => {
    if (geometria?.length >= 2) {
      mapa.fitBounds(geometria, { padding: [48, 48] })
      return
    }

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
  }, [destinos, cidadeAtiva, geometria, mapa])

  return null
}

function centroInicial(cidadeAtiva) {
  if (cidadeAtiva) return [cidadeAtiva.lat, cidadeAtiva.lng]
  return CENTRO_BRASIL
}

function obterLinhaRota(destinos, geometria, carregandoRota) {
  if (geometria?.length >= 2) return geometria
  if (carregandoRota || destinos.length < 2) return null
  return destinos.map((d) => [d.lat, d.lng])
}

export default function MapaDestinos({
  destinos,
  cidadeAtiva,
  geometria,
  carregandoRota = false,
  aoCliqueMapa,
  desabilitado,
  painel = false,
  interativo = true,
}) {
  const linhaRota = obterLinhaRota(destinos, geometria, carregandoRota)
  const rotaPelasRuas = geometria?.length >= 2
  const idAnimacaoRota = useMemo(() => chaveGeometria(geometria), [geometria])
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

      {interativo && !desabilitado && aoCliqueMapa && (
        <CliqueNoMapa aoClique={aoCliqueMapa} />
      )}
      <AjustarVisao destinos={destinos} cidadeAtiva={cidadeAtiva} geometria={geometria} />

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

      {linhaRota && rotaPelasRuas && (
        <RotaAnimada
          posicoes={linhaRota}
          idAnimacao={idAnimacaoRota}
          pelasRuas
        />
      )}
      {linhaRota && !rotaPelasRuas && (
        <Polyline
          positions={linhaRota}
          pathOptions={{
            color: '#ff385c',
            weight: 3,
            opacity: 0.5,
            dashArray: '8 8',
          }}
        />
      )}
    </MapContainer>
  )

  const dicaMapa = desabilitado
    ? 'Salvando parada…'
    : carregandoRota
      ? 'Traçando rota pelas ruas…'
      : 'Clique no mapa para adicionar uma parada à rota.'

  if (painel) {
    return (
      <div className="mapa-section mapa-section--painel">
        <p className="mapa-dica mapa-dica--painel">{dicaMapa}</p>
        <div className="mapa-container mapa-container--painel">{conteudoMapa}</div>
      </div>
    )
  }

  return (
    <section className="mapa-section">
      <h2>Mapa</h2>
      <p className="mapa-dica">{dicaMapa}</p>
      <div className="mapa-container">{conteudoMapa}</div>
    </section>
  )
}
