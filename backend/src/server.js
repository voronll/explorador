require('./polyfill-node')

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const rotasDestinos = require('./routes/destinos')
const rotasRota = require('./routes/rota')

const app = express()
const PORTA = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/destinos', rotasDestinos)
app.use('/api/rota', rotasRota)

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`)
})
