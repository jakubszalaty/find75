'use strict'

const PORT = process.env.APP_PORT || 1337

const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.use('/', express.static('assets'))

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`)
})
