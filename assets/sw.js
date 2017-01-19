const CACHE_NAME = 'assets'
const CACHE_NAME_DYNAMIC = 'webs'

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Opened cache')
      return cache.addAll([
        '/',
        // angular
        '/node_modules/angular/angular.js',
        '/node_modules/angular-aria/angular-aria.js',
        '/node_modules/angular-animate/angular-animate.js',
        '/node_modules/angular-route/angular-route.js',
        '/node_modules/angular-ui-router/release/angular-ui-router.js',
        '/node_modules/angular-material/angular-material.js',
        '/node_modules/ngmap/build/scripts/ng-map.js',
        '/node_modules/moment/moment.js',
        '/node_modules/moment/locale/pl.js',
        // other js
        // '//maps.google.com/maps/api/js?key=AIzaSyCMYoOUapEGWW2Q9H1MIo4Q3b2AkHJZibs',
        '/node_modules/lodash/lodash.js',
        '/js/app.js',
        // css
        '/node_modules/angular-material/angular-material.css',
        '/css/index.css',
        // fonts
        // 'https://fonts.googleapis.com/icon?family=Material+Icons',
        // manifest
        '/manifest.json',
        // service worker
        // '/sw.js'
      ])
    })
    )
})


// self.addEventListener('activate', function(event) {
//   console.log('activate')
//   event.waitUntil(
//     caches.keys().then(function(cacheNames) {
//       return Promise.all(
//         cacheNames.filter(function(cacheName) {
//           // Return true if you want to remove this cache,
//           // but remember that caches are shared across
//           // the whole origin
//           return cacheNames == CACHE_NAME
//         }).map(function(cacheName) {
//           return caches.delete(cacheName)
//         })
//       )
//     })
//   )
// })




self.addEventListener('fetch', function(event) {
  // console.log(event.request)
  if( event.request.url.match(/htmls\//g) ){

    event.respondWith(
      caches.match(event.request).then(function(response) {

        caches.open(CACHE_NAME_DYNAMIC).then(function(cache) {
          return fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone())
            return response
          })
        })

        return response || fetch(event.request)
      })


    )


  }else{

    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request)
      })
    )

  }
})
