'use strict'

const app = angular.module( 'App', [
  'ui.router',
  'ngRoute',
  'ngMaterial'
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


app.controller('MainController', function ($scope) {

  $scope.title = 'Hello'

})
