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

    $stateProvider.state('main', {
      url: '/',
      views: {
        'main': {
          controller: 'MainController as MainCtrl',
          templateUrl: 'htmls/main.html'
        }
      }
    })
  }
])

app.controller('IndexController', function ($scope) {})

app.controller('MainController', function ($scope, $mdSidenav, $http, $mdToast, NgMap) {
  const vm = this
  vm.title = 'Find 75'

  vm.toggleLeft = buildToggler('left')
  vm.getMatchesStops = getMatchesStops
  vm.getMatchesBuses = getMatchesBuses
  vm.setNewCenter = setNewCenter
  vm.showBus = showBus
  vm.busStop = null
  vm.allBuses = false

  getBusStops()

  getBuses()


  function showBus(bus){
    NgMap.getMap().then((map)=>{
      map.setCenter({lat: parseFloat(bus.lat), lng: parseFloat(bus.lon)})
      map.setZoom(14)
    })
  }

  function setNewCenter(){
    document.activeElement.blur()
    NgMap.getMap().then((map)=>{
      if(vm.busStop)
        map.setCenter({lat:vm.busStop.szerokoscgeo, lng: vm.busStop.dlugoscgeo})
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
      setTimeout(()=>{
        getBuses()
      },5000)
    }).catch((err)=>{
      showToast('Aktualizacja pozycji autobusów nie powiodła się')
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
