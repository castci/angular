'use strict';

var global = angular.module('system');

/**
* Factory for Local Storage services at the app.
**/
global.factory('globalLS', ['$window', function($window) {
	return {
		//Set value on LocalStorage
		set: function(key, value) {
			$window.localStorage[key] = value;
		},

		//Get value from LocalStorage
		get: function(key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		},

		setObject: function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},

		getObject: function(key) {
			return JSON.parse($window.localStorage[key] || '{}');
		},

    getObjectById: function(key, id) {      
      var arrayObjs = JSON.parse($window.localStorage[key]) || null;
      return $.grep(arrayObjs, function (e) {
         return e.id == id;
      })
    },

		clearAll: function() {
			return $window.localStorage = null;
		}
	}
}]);

/**
* This service Initialize the Local Storage at the beginin.
**/
global.service('globalService', function (globalLS) {
	this.setInitAmounts = function (argument) {
		var banks = [{id:1, name:"Bank 1", amount : 200},{id:2, name:"Bank 2", amount : 200}];
    var bag = 0;
		globalLS.setObject('banks', banks);
    globalLS.set('bag', bag);
    globalLS.set('commit', 'false');

	}
});


/**
* Directive for validate currency
* Downloaded from github https://github.com/fiestah/angular-money-directive
**/
global.directive('money', function () {
  'use strict';
  var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;

  function link(scope, el, attrs, ngModelCtrl) {
    var min = parseFloat(attrs.min || 0);
    var precision = parseFloat(attrs.precision || 2);
    var lastValidValue;

    function round(num) {
      var d = Math.pow(10, precision);
      return Math.round(num * d) / d;
    }

    function formatPrecision(value) {
      return parseFloat(value).toFixed(precision);
    }

    function formatViewValue(value) {
      return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
    }


    ngModelCtrl.$parsers.push(function (value) {
      if (angular.isUndefined(value)) {
        value = '';
      }

      // Handle leading decimal point, like ".5"
      if (value.indexOf('.') === 0) {
        value = '0' + value;
      }

      // Allow "-" inputs only when min < 0
      if (value.indexOf('-') === 0) {
        if (min >= 0) {
          value = null;
          ngModelCtrl.$setViewValue('');
          ngModelCtrl.$render();
        } else if (value === '-') {
          value = '';
        }
      }

      var empty = ngModelCtrl.$isEmpty(value);
      if (empty || NUMBER_REGEXP.test(value)) {
        lastValidValue = (value === '')
          ? null
          : (empty ? value : parseFloat(value));
      } else {
        // Render the last valid input in the field
        ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
        ngModelCtrl.$render();
      }

      ngModelCtrl.$setValidity('number', true);
      return lastValidValue;
    });
    ngModelCtrl.$formatters.push(formatViewValue);

    var minValidator = function(value) {
      if (!ngModelCtrl.$isEmpty(value) && value < min) {
        ngModelCtrl.$setValidity('min', false);
        return undefined;
      } else {
        ngModelCtrl.$setValidity('min', true);
        return value;
      }
    };
    ngModelCtrl.$parsers.push(minValidator);
    ngModelCtrl.$formatters.push(minValidator);

    if (attrs.max) {
      var max = parseFloat(attrs.max);
      var maxValidator = function(value) {
        if (!ngModelCtrl.$isEmpty(value) && value > max) {
          ngModelCtrl.$setValidity('max', false);
          return undefined;
        } else {
          ngModelCtrl.$setValidity('max', true);
          return value;
        }
      };

      ngModelCtrl.$parsers.push(maxValidator);
      ngModelCtrl.$formatters.push(maxValidator);
    }

    // Round off
    if (precision > -1) {
      ngModelCtrl.$parsers.push(function (value) {
        return value ? round(value) : value;
      });
      ngModelCtrl.$formatters.push(function (value) {
        return value ? formatPrecision(value) : value;
      });
    }

    el.bind('blur', function () {
      var value = ngModelCtrl.$modelValue;
      if (value) {
        ngModelCtrl.$viewValue = formatPrecision(value);
        ngModelCtrl.$render();
      }
    });
  }

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };
});

