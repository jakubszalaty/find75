'use strict'

/**
 * Load modules
 */
const http = require('http')
const express = require('express')
const fs = require('fs')
const request = require('request-promise')
const _ = require('lodash')

/**
 * Set port to listening
 * @type {Number | String}
 */
const PORT = process.env.port || process.env.PORT || 8080

/**
 * Object for cached data from remote server
 * @type {Object}
 */
const cachedData = {
    buses: null,
    time: 0,
}

const security = false
/**
 * Setup express app
 */
const app = express()

app.use('/', express.static('assets'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/busStops', (req, res) => {
    // simple security
    if (security && !req.headers.referer) return res.status(403).end()
    res.sendFile(__dirname + '/busStops.json')
})

app.get('/busRoute', (req, res) => {
    const gmvid = req.query.gmvid
    // simple security
    if (security && (!req.headers.referer || !gmvid)) return res.status(403).end()

    getBusRoute(gmvid)
        .then(data => {
            const response = _.map(data.features, feature => {
                return _.map(feature.geometry.coordinates, cords => {
                    // reverse cords
                    return [cords[1], cords[0]]
                })
            })
            return res.json(response)
        })
        .catch(err => {
            return res.status(500).json({ msg: 'Error' })
        })
})

app.get('/buses', (req, res) => {
    // simple security
    if (security && !req.headers.referer) return res.status(403).end()
    // return res.sendFile(__dirname + '/buses.json')
    // if last request was longer than 5s make request again
    // if not print data from cached variable
    if (Math.abs(new Date().getTime() - cachedData.time) > 5000) {
        getBuses()
            .then(data => {
                cachedData.buses = data
                cachedData.time = new Date()
                return res.json(data)
            })
            .catch(err => {
                return res.status(500).json({ msg: 'Error' })
            })
    } else {
        return res.json(cachedData.buses)
    }
})

/**
 * Setup http server
 */
const server = http.createServer(app).listen(PORT, 1, () => {
    // Init unpdate busStops.json
    updateBusStops()
    // Update busStops.json ones per hour
    setInterval(() => {
        updateBusStops()
    }, 1000 * 60 * 60)
})

server.on('request', (req, res) => {
    console.log(`${new Date().toISOString().replace(/T|Z/g, ' ')}: ${res.req.method} : ${res.req.url} `)
})

/**
 * Get bus stops positions
 * @return {Promise}
 */
function getBusStops() {
    const obj = {
        uri: 'http://www.zditm.szczecin.pl/json/slupki.inc.php',
        json: true,
    }
    return new Promise((resolve, reject) => {
        request(obj)
            .then(res => {
                let data = _.uniqBy(res, 'nrzespolu')
                return resolve(data)
            })
            .catch(err => {
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
        json: true,
    }
    return new Promise((resolve, reject) => {
        request(obj)
            .then(res => {
                return resolve(res)
            })
            .catch(err => {
                return reject(err)
            })
    })
}

/**
 * Get position of the bus's route
 * @return {Promise}
 */
function getBusRoute(gmvid) {
    const obj = {
        uri: `http://www.zditm.szczecin.pl/json/trasy.inc.php?gmvid=${gmvid}`,
        json: true,
    }
    return new Promise((resolve, reject) => {
        request(obj)
            .then(res => {
                return resolve(res)
            })
            .catch(err => {
                return reject(err)
            })
    })
}

/**
 * Update bus stops positions
 * @return {Promise}
 */
function updateBusStops() {
    return getBusStops().then(data => {
        fs.writeFileSync('busStops.json', JSON.stringify(data, null, 4))
    })
}
