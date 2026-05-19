/**
 * Dados mockados de cidades — substituir por /api/geocoding quando o backend estiver pronto.
 * bbox: [[sul, oeste], [norte, leste]] (formato Leaflet)
 */
export const CIDADES_MOCK = [
  {
    id: 'sao-paulo',
    nome: 'São Paulo',
    lat: -23.5505,
    lng: -46.6333,
    zoom: 11,
    bbox: [
      [-23.82, -46.95],
      [-23.35, -46.36],
    ],
  },
  {
    id: 'rio-de-janeiro',
    nome: 'Rio de Janeiro',
    lat: -22.9068,
    lng: -43.1729,
    zoom: 11,
    bbox: [
      [-23.08, -43.8],
      [-22.75, -43.1],
    ],
  },
  {
    id: 'salvador',
    nome: 'Salvador',
    lat: -12.9777,
    lng: -38.5016,
    zoom: 12,
    bbox: [
      [-13.05, -38.65],
      [-12.85, -38.35],
    ],
  },
  {
    id: 'belo-horizonte',
    nome: 'Belo Horizonte',
    lat: -19.9167,
    lng: -43.9345,
    zoom: 11,
    bbox: [
      [-20.05, -44.1],
      [-19.78, -43.78],
    ],
  },
  {
    id: 'curitiba',
    nome: 'Curitiba',
    lat: -25.4284,
    lng: -49.2733,
    zoom: 11,
    bbox: [
      [-25.58, -49.45],
      [-25.35, -49.15],
    ],
  },
  {
    id: 'florianopolis',
    nome: 'Florianópolis',
    lat: -27.5954,
    lng: -48.548,
    zoom: 11,
    bbox: [
      [-27.75, -48.7],
      [-27.45, -48.4],
    ],
  },
  {
    id: 'brasilia',
    nome: 'Brasília',
    lat: -15.7939,
    lng: -47.8828,
    zoom: 11,
    bbox: [
      [-15.95, -48.05],
      [-15.65, -47.75],
    ],
  },
  {
    id: 'recife',
    nome: 'Recife',
    lat: -8.0476,
    lng: -34.877,
    zoom: 12,
    bbox: [
      [-8.15, -35.05],
      [-7.95, -34.82],
    ],
  },
]

function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function buscarCidadesMock(termo, limite = 5) {
  const consulta = normalizar(termo)
  if (!consulta) return []

  return CIDADES_MOCK.filter((cidade) => normalizar(cidade.nome).includes(consulta)).slice(
    0,
    limite,
  )
}

export function resolverCidadeMock(termo) {
  const consulta = normalizar(termo)
  if (!consulta) return null

  const exata = CIDADES_MOCK.find((cidade) => normalizar(cidade.nome) === consulta)
  if (exata) return exata

  const resultados = buscarCidadesMock(termo, 1)
  return resultados[0] ?? null
}

/** Simula reverse geocoding ao clicar no mapa */
export function mockReversoGeocode(lat, lng, nomeCidade) {
  return `Parada em ${nomeCidade} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
}
