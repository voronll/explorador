const express = require('express')
const { destinos } = require('../db')
const { calcularRota } = require('../services/rotas')

const router = express.Router()

function executar(consulta) {
  return new Promise((resolve, reject) => {
    consulta((err, resultado) => (err ? reject(err) : resolve(resultado)))
  })
}

router.get('/resumo', async (req, res) => {
  try {
    const lista = await executar((cb) =>
      destinos.find({}).sort({ order: 1 }).exec(cb),
    )

    if (lista.length < 2) {
      return res.json({
        trechos: [],
        total: { distanciaMetros: 0, duracaoSegundos: 0 },
        geometria: [],
        provedor: 'OSRM',
        mensagem: 'Adicione pelo menos dois destinos para calcular a rota.',
      })
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
