const express = require('express')
const { buscar, reverso } = require('../services/geocoding')

const router = express.Router()

router.get('/buscar', async (req, res) => {
  const termo = req.query.q ?? ''
  const limite = Math.min(Number(req.query.limit) || 5, 10)

  if (!termo.trim()) {
    return res.status(400).json({ error: 'Parâmetro q é obrigatório' })
  }

  if (termo.trim().length < 2) {
    return res.status(400).json({ error: 'Digite pelo menos 2 caracteres para buscar' })
  }

  try {
    const resultados = await buscar(termo, limite)
    res.json({ resultados, provedor: 'Nominatim (OpenStreetMap)' })
  } catch (err) {
    res.status(502).json({
      error: 'Erro ao buscar local',
      details: err.message,
    })
  }
})

router.get('/reverso', async (req, res) => {
  const { lat, lng } = req.query

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Parâmetros lat e lng são obrigatórios' })
  }

  try {
    const local = await reverso(lat, lng)
    res.json({ ...local, provedor: 'Nominatim (OpenStreetMap)' })
  } catch (err) {
    res.status(502).json({
      error: 'Erro no geocoding reverso',
      details: err.message,
    })
  }
})

module.exports = router
