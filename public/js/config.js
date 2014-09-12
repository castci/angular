'use strict';

//Setting up route

angular.module('bankApp').config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/',{
    templateUrl: 'views/accounts.html',
    controller : 'AccountsCtrl'
  })
  .when('/movements', {
  	templateUrl:'views/movements.html',
  	controller : 'MovementsCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
}]);

//Setting HTML5 Location Mode
angular.module('bankApp').config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
}
]);
