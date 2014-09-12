'use strict';

angular.element(document).ready(function($scope) {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the Bankapp
   	angular.bootstrap(document, ['bankApp']);
});