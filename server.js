'use strict'

const PORT = process.env.PORT || 80

const http = require('http')

// const https = require('https')
// const fs = require('fs')

const express = require('express')
const request = require('request-promise')

const _ = require('lodash')

const app = express()

app.use('/', express.static('assets'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/busStops', function (req, res) {

  res.sendFile(__dirname + '/busStops.json')
  // const obj = {
  //   uri: 'http://www.zditm.szczecin.pl/json/slupki.inc.php',
  //   json: true
  // }

  // request(obj).then(function (response) {
  //   let data = _.uniqBy(response,'nrzespolu')
  //   res.json(data)
  // })
  // .catch(function (err) {
  //   res.status(500).json({msg:'Error'})
  // })
})

app.get('/buses', function (req, res) {

  // return res.sendFile(__dirname + '/buses.json')
  const obj = {
    uri: 'http://www.zditm.szczecin.pl/json/pojazdy.inc.php',
    json: true
  }

  request(obj).then(function (response) {
    res.json(response)
  })
  .catch(function (err) {
    res.status(500).json({msg:'Error'})
  })
})


// app.listen(PORT, function () {
//   console.log(`App listening on port ${PORT}!`)
// })

http.createServer(app).listen(PORT)

// const privateKey = fs.readFileSync( 'private.key' )
// const certificate = fs.readFileSync( 'certificate.crt' )

// https.createServer({
//   key: privateKey,
//   cert: certificate
// }, app).listen(PORT)
