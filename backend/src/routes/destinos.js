const express = require('express')
const { destinos } = require('../db')

const router = express.Router()

function executar(consulta) {
  return new Promise((resolve, reject) => {
    consulta((err, resultado) => (err ? reject(err) : resolve(resultado)))
  })
}

function coordenadaValida(valor, minimo, maximo) {
  const n = Number(valor)
  return Number.isFinite(n) && n >= minimo && n <= maximo
}

function validarCorpoDestino(corpo, { parcial = false } = {}) {
  const erros = []
  const { name, lat, lng } = corpo ?? {}

  if (!parcial || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      erros.push('name é obrigatório e deve ser texto não vazio')
    }
  }

  if (!parcial || lat !== undefined) {
    if (!coordenadaValida(lat, -90, 90)) {
      erros.push('lat deve ser um número entre -90 e 90')
    }
  }

  if (!parcial || lng !== undefined) {
    if (!coordenadaValida(lng, -180, 180)) {
      erros.push('lng deve ser um número entre -180 e 180')
    }
  }

  return erros
}

async function obterProximaOrdem() {
  const ultimo = await executar((cb) =>
    destinos.findOne({}).sort({ order: -1 }).exec(cb),
  )
  return ultimo ? ultimo.order + 1 : 0
}

async function renumerarOrdens() {
  const documentos = await executar((cb) =>
    destinos.find({}).sort({ order: 1 }).exec(cb),
  )
  for (let i = 0; i < documentos.length; i++) {
    if (documentos[i].order !== i) {
      await executar((cb) =>
        destinos.update({ _id: documentos[i]._id }, { $set: { order: i } }, {}, cb),
      )
    }
  }
}

router.get('/', async (req, res) => {
  try {
    const lista = await executar((cb) =>
      destinos.find({}).sort({ order: 1 }).exec(cb),
    )
    res.json(lista)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar destinos', details: err.message })
  }
})

router.patch('/reordenar', async (req, res) => {
  const { ids } = req.body ?? {}
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids deve ser um array não vazio' })
  }

  try {
    const todos = await executar((cb) => destinos.find({}).exec(cb))
    if (ids.length !== todos.length) {
      return res.status(400).json({
        error: 'ids deve conter exatamente todos os destinos cadastrados',
      })
    }

    const idsValidos = new Set(todos.map((d) => d._id))
    for (const id of ids) {
      if (!idsValidos.has(id)) {
        return res.status(400).json({ error: `ID inválido: ${id}` })
      }
    }

    for (let i = 0; i < ids.length; i++) {
      await executar((cb) =>
        destinos.update({ _id: ids[i] }, { $set: { order: i } }, {}, cb),
      )
    }

    const lista = await executar((cb) =>
      destinos.find({}).sort({ order: 1 }).exec(cb),
    )
    res.json(lista)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao reordenar destinos', details: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const documento = await executar((cb) => destinos.findOne({ _id: req.params.id }, cb))
    if (!documento) {
      return res.status(404).json({ error: 'Destino não encontrado' })
    }
    res.json(documento)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar destino', details: err.message })
  }
})

router.post('/', async (req, res) => {
  const erros = validarCorpoDestino(req.body)
  if (erros.length) {
    return res.status(400).json({ error: 'Dados inválidos', details: erros })
  }

  try {
    const order = await obterProximaOrdem()
    const documento = {
      name: req.body.name.trim(),
      lat: Number(req.body.lat),
      lng: Number(req.body.lng),
      order,
      createdAt: new Date().toISOString(),
    }
    const criado = await executar((cb) => destinos.insert(documento, cb))
    res.status(201).json(criado)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar destino', details: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const erros = validarCorpoDestino(req.body, { parcial: false })
  if (erros.length) {
    return res.status(400).json({ error: 'Dados inválidos', details: erros })
  }

  try {
    const atualizados = await executar((cb) =>
      destinos.update(
        { _id: req.params.id },
        {
          $set: {
            name: req.body.name.trim(),
            lat: Number(req.body.lat),
            lng: Number(req.body.lng),
            updatedAt: new Date().toISOString(),
          },
        },
        {},
        cb,
      ),
    )
    if (atualizados === 0) {
      return res.status(404).json({ error: 'Destino não encontrado' })
    }
    const atualizado = await executar((cb) => destinos.findOne({ _id: req.params.id }, cb))
    res.json(atualizado)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar destino', details: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const removidos = await executar((cb) =>
      destinos.remove({ _id: req.params.id }, {}, cb),
    )
    if (removidos === 0) {
      return res.status(404).json({ error: 'Destino não encontrado' })
    }
    await renumerarOrdens()
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover destino', details: err.message })
  }
})

module.exports = router
