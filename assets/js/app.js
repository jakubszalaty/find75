'use strict'

const app = angular.module( 'App', [
  'ui.router',
  'ngRoute',
  'ngMaterial',
  'ngMap'
])

app.config([
  '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/')

    $stateProvider
      .state('main', {
        url: '/',
        views: {
          'main': {
            controller: 'MainController as MainCtrl',
            templateUrl: 'htmls/main.html'
          }
        }
      })

      .state('main.station', {
        url: 'station/:id',
        views: {
          'content': {
            controller: 'StationController as StationCtrl',
            templateUrl: 'htmls/station.html'
          }
        }
      })

      .state('main.line', {
        url: 'line/:id',
        views: {
          'content': {
            controller: 'LineController as LineCtrl',
            templateUrl: 'htmls/station.html'
          }
        }
      })

  }
])

app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .accentPalette('pink')
})


app.controller('MainController', function ($scope, $mdSidenav, $http, $mdToast, NgMap) {
  const vm = this
  vm.title = 'Find 75'

  vm.toggleLeft = buildToggler('left')
  vm.getMatchesStops = getMatchesStops
  vm.getMatchesBuses = getMatchesBuses
  vm.setNewCenter = setNewCenter
  vm.showBus = showBus
  vm.getSelectedLine = getSelectedLine
  vm.showLine = showLine
  vm.getAllLines = getAllLines
  vm.setCurrentPosCenter = setCurrentPosCenter
  vm.busStop = null
  vm.allBuses = false
  vm.busRoute = null

  let centerLine = false

  getBusStops()

  getBuses()

  function getAllLines(){

    let lines = []
    lines = _.uniqBy(vm.buses, 'linia')
    return lines
  }

  function showLine(line,gmvid){
    vm.busStop = null
    vm.allBuses = false
    vm.selectedLine = line
    centerLine = true
    if(gmvid)
      getBusRoute(gmvid)

  }

  function getSelectedLine(){

    if(!vm.selectedLine)
      return []

    const bounds = new google.maps.LatLngBounds()

    const buses = _.filter(vm.buses, (value)=>{

      const isSelected = value.linia === vm.selectedLine

      if(centerLine && isSelected){
        if(value.lat && value.lon){
          bounds.extend( new google.maps.LatLng(parseFloat(value.lat), parseFloat((value.lon))) )
        }
      }

      return isSelected
    })

    if(centerLine){
      centerLine = false

      NgMap.getMap().then((map)=>{
        map.setCenter(bounds.getCenter())
        map.fitBounds(bounds)
      })

    }

    return buses
  }

  function showBus(bus){
    NgMap.getMap().then((map)=>{
      map.setCenter({lat: parseFloat(bus.lat), lng: parseFloat(bus.lon)})
      map.setZoom(15)
    })
  }

  function setNewCenter(){
    document.activeElement.blur()
    NgMap.getMap().then((map)=>{
      if(vm.busStop){
        map.setCenter({lat:vm.busStop.szerokoscgeo, lng: vm.busStop.dlugoscgeo})
        map.setZoom(15)
      }
    })

    return
  }

  function setCurrentPosCenter(){
    NgMap.getMap().then((map)=>{
      const currentPos = map.markers[0]
      if(currentPos){
        map.setCenter({lat:currentPos.getPosition().lat(), lng: currentPos.getPosition().lng()})
        map.setZoom(15)
      }
    })

    return
  }

  function getMatchesBuses(busStop){
    if(vm.allBuses)
      return vm.buses

    if(!busStop)
      return []

    const buses = _.filter(vm.buses, (value)=>{
      return value.z === busStop.nazwa || value.do === busStop.nazwa
    })
    return buses
  }

  function getMatchesStops(searchText){
    const search = new RegExp(searchText,'gim')
    const stops = _.filter(vm.busStops, (value)=>{
      return value.nazwa.match(search)
    })
    return stops
  }

  function getBusStops(){
    $http.get('/busStops').then((response)=>{
      vm.busStops = response.data
      // showToast('Przystanki pobrane')
    }).catch((err)=>{
      showToast('Nie można pobrać przystanków')
    })
  }

  function getBuses(){
    $http.get('/buses').then((response)=>{
      vm.buses = response.data
      // showToast('Przystanki pobrane')
    }).catch((err)=>{
      showToast('Aktualizacja pozycji autobusów nie powiodła się')
    }).then(()=>{
      setTimeout(()=>{
        getBuses()
      },5000)
    })
  }

  function getBusRoute(gmvid){
    $http.get(`/busRoute?gmvid=${gmvid}`).then((response)=>{
      vm.busRoute = response.data
      // showToast('Przystanki pobrane')
    }).catch((err)=>{
      showToast('Nie można pobrać trasy lini')
    })
  }
  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle()
    }
  }

  function showToast(text){
    if(!text)
      return console.error('Value not set')
    $mdToast.show(
      $mdToast.simple()
        .textContent(text)
        .position('bottom left')
    )
  }

  // function getLocation() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(showPosition, showError)
  //   } else {
  //     showToast('Geolocation is not supported by this browser.')
  //   }
  // }

  // function showPosition(position) {
  //   // showToast('Latitude: ' + position.coords.latitude + ' Longitude: ' + position.coords.longitude)
  //   NgMap.getMap().then((map)=>{
  //     map.setCenter({lat:position.coords.latitude, lng: position.coords.longitude})
  //   })

  // }

  // function showError(error) {
  //   switch(error.code) {
  //   case error.PERMISSION_DENIED:
  //     showToast('User denied the request for Geolocation.')
  //     break
  //   case error.POSITION_UNAVAILABLE:
  //     showToast('Location information is unavailable.')
  //     break
  //   case error.TIMEOUT:
  //     showToast('The request to get user location timed out.')
  //     break
  //   case error.UNKNOWN_ERROR:
  //     showToast('An unknown error occurred.')
  //     break
  //   }
  // }

})

app.controller('StationController', function ($scope, $mdToast, NgMap) {

})

app.controller('LineController', function ($scope, $mdToast, NgMap) {

})


const lines = {
  anz: 'autobus nocny',
  adz: 'autobus dzienny zwykły',
  ada: 'autobus dzienny zastępczy',
  adp: 'autobus dzienny pospieszny',
  tdz: 'tramwaj'
}

app.filter('line', function() {
  return function(input) {
    return lines[input]
  }
})
