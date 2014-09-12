'use strict';

angular.module('bankApp',[
	'ngResource',
	'ui.bootstrap',
	'ngRoute',
	'ngTable',
	'n3-line-chart',
	'system',
	'accountsCtrl',
	'movementsCtrl'
]);

angular.module('system', []);
angular.module('accountsCtrl', []);
angular.module('movementsCtrl', []);




