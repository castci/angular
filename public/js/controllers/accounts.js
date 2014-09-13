'use strict';

var accountsCtrl = angular.module('accountsCtrl');
accountsCtrl.controller('AccountsCtrl', ['$scope', '$route', '$location', '$modal', '$window', 'globalLS', 'globalService', function ($scope, $route, $location, $modal, $window, globalLS, globalService) {
	
	var banks = globalLS.getObject('banks');

	/**
	* If localStorage is empty initialize the banks and bag accounts.
	**/
	if(Object.keys(banks).length == 0){
	 	globalService.setInitAmounts();
	}

	/**
	* List banks storages in localStorage
	**/
	$scope.listBanks = function () {
		var movements = globalLS.getObject('movements');
		$scope.banks = globalLS.getObject('banks');
		$scope.bag   = globalLS.get('bag');
		$scope.commit = globalLS.get('commit');
		$scope.movements = (Object.keys(movements).length == 0) ? false : true;
	}

	/**
	* Function that depend of action exectute deposit or withdraw
	**/
	$scope.actionEntity = function (bankId, type) {
		var entity;
		$scope.actionType = type;

		if(bankId){
			entity = globalLS.getObjectById('banks', bankId);
			$scope.entity = entity[0]; 
		} else {
			entity = {
				'name' : "Pocket"
			};
			$scope.entity = entity; 
		}
	 	
		var modalInstance = $modal.open({
			templateUrl: 'views/modal.html',
			controller : ModalInstanceCtrl, 
			resolve: {
				action : function () {
					return {
						"type" : $scope.actionType,
						"entity" : $scope.entity	
					}
				}
			}
		});

		modalInstance.result.then(function () {
			$route.reload();
		}, function () {
			//Todo
		});
	}

	$scope.save = function() {
		globalLS.set("commit", 'true');
		$location.path('/movements');
	}
}]);

var recordMovements = function(entity, type, amount, totalBag) {
	var movemnts, 
		movement = {
			"type"   : type,
			"entity" : entity,
			"amount" : amount,
			"totalBag" : totalBag,
			"created" : new Date()
		};


}

/*/
* This controller contain the main action that you can do (deposit, withdraw, create).
**/
var ModalInstanceCtrl = function ($scope, $location, $modalInstance, action, globalLS) {

	var bag = ~~globalLS.get('bag');
	var banks = globalLS.getObject('banks');

	$scope.actionType = action.type;
	$scope.entity = action.entity;
	$scope.maxAmount = action.type === 'deposit' || action.type === 'create' ?  bag : $scope.entity.amount;


	// Private function that records movements of entities.
	var _saveMovements = function(entity, action, amount){
		var movements =	globalLS.getObject('movements'),
			movement = {
				"entity" : entity,
				"action" : action,
				"amount" : amount,				
				"created" : ~~(new Date().getTime() / 1000)
			};
		
		movements = Object.keys(movements).length > 0 ?  globalLS.getObject('movements') : [];

		movements.push(movement);
		globalLS.setObject('movements', movements);
	}

	$scope.submitAmount = function (isValid) {
		if(isValid) {
			var amount = this.amount;
			switch ($scope.actionType) {
				case 'deposit':

					var total = bag - amount;

					for(var bank in banks){
						if (banks[bank].id === $scope.entity.id) {
						 	banks[bank].amount += amount;
						}
					}
					_saveMovements($scope.entity.name, 'deposit', amount);
					_saveMovements('Pocket', 'withdraw', amount);

				break;

				case 'withdraw': 
					var total = bag + amount;
					globalLS.set('bag', total);
					globalLS.setObject('commit', false );
					for(var bank in banks){
						if (banks[bank].id === $scope.entity.id) {
						 	banks[bank].amount -= amount;
						}
					}

					_saveMovements($scope.entity.name, 'withdraw', amount);
					_saveMovements('Pocket', 'deposit', amount);

				break;

				case 'create':
					var id = banks.length,

						name = "Bank " + ++id,
						total = bag - amount;

					var bank = {
						"id"    : id,
						"name"  : name,
						"amount" : amount 
					} 

					banks.push(bank);

					_saveMovements($scope.entity.name, 'create', amount);
					_saveMovements('Pocket', 'withdraw', amount);
				break;

			}
			globalLS.set('bag', total);
			globalLS.setObject('banks', banks);
			$modalInstance.close();
		}
		
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
};