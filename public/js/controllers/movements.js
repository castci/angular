'use strict';

var movementsCtrl = angular.module('movementsCtrl');

movementsCtrl.controller('MovementsCtrl', ['$scope', '$route', '$location', '$filter', 'globalLS', 'ngTableParams', function ($scope, $route, $location, $filter, globalLS, ngTableParams) {
	var commit = globalLS.get('commit');
	console.log(commit);
	if(!commit){
		return $location.path('/');
	}
	
	$scope.showMovements = function () {
		var movements = globalLS.getObject('movements');
		$scope.data = movements;
		$scope.tableParams = new ngTableParams({
			page: 1,
			count: 10
		}, {
			total: movements.length,
			getData: function($defer, params) {
				var orderedData = params.sorting() ? $filter('orderBy')(movements, params.orderBy()) : movements;

				$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			}
		});
		
		var dataGraph = {};

		for(var mov in movements ){
			if(!dataGraph.hasOwnProperty(movements[mov].created)) dataGraph[movements[mov].created] = [];
			dataGraph[movements[mov].created].push(movements[mov].amount);
		}

		var data1 = [];
		var x = 0
		for(var data in dataGraph){
			data1.push({
				x : x++,
				val_0: dataGraph[data][0],
				val_1: dataGraph[data][1]
			}); 
		}

		$scope.data1 = data1;

		$scope.options = {
			stacks: [{axis: "y", series: ["id_0", "id_1"]}],
			lineMode: "cardinal",
			series: [{
				id: "id_0",
				y: "val_0",
				label: "Entity",
				type: "column",
				color: "#1f77b4",
				axis: "y"
			},
			{
				id: "id_1",
				y: "val_1",
				label: "hola",
				type: "column",
				color: "#ff7f0e",
				axis: "y"
			}],
			axes: {x: {type: "linear", key: "x"}, y: {type: "linear", min:0}},
			tension: 0.7,
			tooltip: {mode: "scrubber"},
			drawLegend: false,
			drawDots: false,
			columnsHGap: 5
		};
	}
}]);