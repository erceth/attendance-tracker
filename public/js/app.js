var app = angular.module('app', ['ui.router', 'ui.bootstrap']);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("menu");
    
    $stateProvider.state('menu', {
      url: '/menu',
      templateUrl: "view/menu.html",
      controller: "menuCtrl"
    })
    .state('attendee', {
      url: '/attendee/:id',
      templateUrl: "view/attendee.html",
      controller: "attendeeCtrl"
    });
    
});