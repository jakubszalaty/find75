'use strict'

/**
 * Load modules
 */
const http = require('http')
const express = require('express')
const request = require('request-promise')
const _ = require('lodash')

/**
 * Set port to listening
 * @type {Number}
 */
const PORT = process.env.PORT || 80

/**
 * Object for cached data from remote server
 * @type {Object}
 */
const cachedData = {
  buses: null,
  time: 0
}

/**
 * Setup express app
 */
const app = express()

app.use('/', express.static('assets'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/busStops', function (req, res) {
  // simple security
  if(!req.headers.referer)
    return res.status(403).end()
  res.sendFile(__dirname + '/busStops.json')
})

app.get('/buses', function (req, res) {
  // simple security
  if(!req.headers.referer)
    return res.status(403).end()
  // return res.sendFile(__dirname + '/buses.json')
  // if last request was longer than 5s make request again
  // if not print data from cached variable
  if(Math.abs(new Date() - cachedData.time) > 5000){

    getBuses().then(function (data) {
      console.log('Get data from server')
      cachedData.buses = data
      cachedData.time = new Date()
      return res.json(data)
    })
    .catch(function (err) {
      return res.status(500).json({msg:'Error'})
    })

  }else{
    console.log('Get cached data')
    return res.json(cachedData.buses)
  }

})


/**
 * Setup http server
 */
const server = http.createServer(app).listen(PORT)

server.on('request',(req, res) => {
  console.log(`${new Date().toISOString().replace(/T|Z/g,' ')}: ${res.req.method} : ${res.req.url} `)
})


/**
 * Get bus stops positions
 * @return {Promise}
 */
function getBusStops() {
  const obj = {
    uri: 'http://www.zditm.szczecin.pl/json/slupki.inc.php',
    json: true
  }
  return new Promise((resolve, reject) => {
    request(obj).then(function (response) {
      let data = _.uniqBy(response,'nrzespolu')
      return resolve(data)
    })
    .catch(function (err) {
      return reject(err)
    })

  })
}

/**
 * Get current position of the buses
 * @return {Promise}
 */
function getBuses() {
  const obj = {
    uri: 'http://www.zditm.szczecin.pl/json/pojazdy.inc.php',
    json: true
  }
  return new Promise((resolve, reject) => {
    request(obj).then(function (response) {
      return resolve(response)
    })
    .catch(function (err) {
      return reject(err)
    })

  })
}
