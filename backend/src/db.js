require('./polyfill-node')

const Datastore = require('nedb')
const path = require('path')
const fs = require('fs')

const pastaDados = path.join(__dirname, '..', 'data')
if (!fs.existsSync(pastaDados)) {
  fs.mkdirSync(pastaDados, { recursive: true })
}

const destinos = new Datastore({
  filename: path.join(pastaDados, 'destinations.db'),
  autoload: true,
})

destinos.ensureIndex({ fieldName: 'order' })

module.exports = { destinos }
