const express = require('express')
const { viagens } = require('../db')

const router = express.Router()

function executar(consulta) {
  return new Promise((resolve, reject) => {
    consulta((err, resultado) => (err ? reject(err) : resolve(resultado)))
  })
}

function validarCidade(cidade) {
  const erros = []
  if (!cidade || typeof cidade !== 'object') {
    erros.push('cidade é obrigatória')
    return erros
  }
  if (typeof cidade.nome !== 'string' || !cidade.nome.trim()) {
    erros.push('cidade.nome é obrigatório')
  }
  if (!Number.isFinite(Number(cidade.lat)) || !Number.isFinite(Number(cidade.lng))) {
    erros.push('cidade.lat e cidade.lng devem ser números válidos')
  }
  return erros
}

function validarDestinos(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return ['destinos deve ser um array com pelo menos uma parada']
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
  return erros
}

router.get('/', async (req, res) => {
  try {
    const lista = await executar((cb) =>
      viagens.find({}).sort({ createdAt: -1 }).exec(cb),
    )
    res.json(lista)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar viagens', details: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const documento = await executar((cb) => viagens.findOne({ _id: req.params.id }, cb))
    if (!documento) {
      return res.status(404).json({ error: 'Viagem não encontrada' })
    }
    res.json(documento)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar viagem', details: err.message })
  }
})

router.post('/', async (req, res) => {
  const { cidade, destinos, resumoRota, titulo } = req.body ?? {}
  const erros = [...validarCidade(cidade), ...validarDestinos(destinos)]

  if (erros.length) {
    return res.status(400).json({ error: 'Dados inválidos', details: erros })
  }

  try {
    const paradasOrdenadas = [...destinos]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((destino, indice) => ({
        name: destino.name.trim(),
        lat: Number(destino.lat),
        lng: Number(destino.lng),
        order: indice,
      }))

    const documento = {
      titulo: typeof titulo === 'string' && titulo.trim() ? titulo.trim() : `Viagem em ${cidade.nome.trim()}`,
      cidade: {
        id: cidade.id ?? null,
        nome: cidade.nome.trim(),
        rotulo: cidade.rotulo ?? '',
        lat: Number(cidade.lat),
        lng: Number(cidade.lng),
        zoom: cidade.zoom ?? 11,
        bbox: cidade.bbox ?? null,
      },
      destinos: paradasOrdenadas,
      resumoRota: resumoRota ?? null,
      createdAt: new Date().toISOString(),
    }

    const criada = await executar((cb) => viagens.insert(documento, cb))
    res.status(201).json(criada)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar viagem', details: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const removidas = await executar((cb) =>
      viagens.remove({ _id: req.params.id }, {}, cb),
    )
    if (removidas === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover viagem', details: err.message })
  }
})

module.exports = router
