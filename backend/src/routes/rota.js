const express = require('express')
const { destinos } = require('../db')
const { calcularRota } = require('../services/rotas')

const router = express.Router()

function executar(consulta) {
  return new Promise((resolve, reject) => {
    consulta((err, resultado) => (err ? reject(err) : resolve(resultado)))
  })
}

function resumoVazio(mensagem) {
  return {
    trechos: [],
    total: { distanciaMetros: 0, duracaoSegundos: 0 },
    geometria: [],
    provedor: 'OSRM',
    mensagem,
  }
}

router.post('/preview', async (req, res) => {
  const { destinos: lista } = req.body ?? {}

  if (!Array.isArray(lista)) {
    return res.status(400).json({ error: 'destinos deve ser um array' })
  }

  if (lista.length < 2) {
    return res.json(resumoVazio('Adicione pelo menos dois destinos para calcular a rota.'))
  }

  const erros = []
  lista.forEach((destino, indice) => {
    if (typeof destino.name !== 'string' || !destino.name.trim()) {
      erros.push(`destinos[${indice}].name é obrigatório`)
    }
    if (!Number.isFinite(Number(destino.lat)) || !Number.isFinite(Number(destino.lng))) {
      erros.push(`destinos[${indice}]: lat e lng inválidos`)
    }
  })

  if (erros.length) {
    return res.status(400).json({ error: 'Dados inválidos', details: erros })
  }

  try {
    const ordenados = [...lista]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((destino, indice) => ({
        name: destino.name.trim(),
        lat: Number(destino.lat),
        lng: Number(destino.lng),
        order: indice,
      }))

    const resumo = await calcularRota(ordenados)
    res.json(resumo)
  } catch (err) {
    res.status(502).json({
      error: 'Erro ao calcular rota',
      details: err.message,
    })
  }
})

router.get('/resumo', async (req, res) => {
  try {
    const lista = await executar((cb) =>
      destinos.find({}).sort({ order: 1 }).exec(cb),
    )

    if (lista.length < 2) {
      return res.json(resumoVazio('Adicione pelo menos dois destinos para calcular a rota.'))
    }

    const resumo = await calcularRota(lista)
    res.json(resumo)
  } catch (err) {
    res.status(502).json({
      error: 'Erro ao calcular rota',
      details: err.message,
    })
  }
})

module.exports = router
