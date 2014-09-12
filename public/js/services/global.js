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
* This directive draw a chart with the entities movements 
**/
global.directive("linearChart", function ($window) {
  return {
    restrict :  "EA",
    template: "<div></div>",
    link  : function (scope, elem, attrs){
      //ToDo
      var fData = scope[attrs.chartData];
      var pathClass = "path";
      var d3 = $window.d3;
      var rawSvg = elem.find("div")[0];
      var svg = d3.select(rawSvg);

      function dashboard(){
        var barColor = 'steelblue';
        function segColor(c){ return {low:"#807dba", mid:"#e08214",high:"#41ab5d"}[c]; }
        
        fData.forEach(function(d){d.total=d.freq.low+d.freq.mid+d.freq.high;});
        function histoGram(fD){
          var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
          hGDim.w = 500 - hGDim.l - hGDim.r, 
          hGDim.h = 300 - hGDim.t - hGDim.b;
              
          //create svg for histogram.
          var hGsvg = svg.append("svg")
              .attr("width", hGDim.w + hGDim.l + hGDim.r)
              .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
              .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

          // create function for x-axis mapping.
          var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                  .domain(fD.map(function(d) { return d[0]; }));

          // Add x-axis to the histogram svg.
          hGsvg.append("g").attr("class", "x axis")
              .attr("transform", "translate(0," + hGDim.h + ")")
              .call(d3.svg.axis().scale(x).orient("bottom"));

          // Create function for y-axis map.
          var y = d3.scale.linear().range([hGDim.h, 0])
                  .domain([0, d3.max(fD, function(d) { return d[1]; })]);

          // Create bars for histogram to contain rectangles and freq labels.
          var bars = hGsvg.selectAll(".bar").data(fD).enter()
                  .append("g").attr("class", "bar");
          
          //create the rectangles.
          bars.append("rect")
              .attr("x", function(d) { return x(d[0]); })
              .attr("y", function(d) { return y(d[1]); })
              .attr("width", x.rangeBand())
              .attr("height", function(d) { return hGDim.h - y(d[1]); })
              .attr('fill',barColor)
              .on("mouseover",mouseover)// mouseover is defined below.
              .on("mouseout",mouseout);// mouseout is defined below.
              
          //Create the frequency labels above the rectangles.
          bars.append("text").text(function(d){ return d3.format(",")(d[1])})
              .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
              .attr("y", function(d) { return y(d[1])-5; })
              .attr("text-anchor", "middle");
          
          function mouseover(d){  // utility function to be called on mouseover.
              // filter for selected state.
              var st = fData.filter(function(s){ return s.State == d[0];})[0],
                  nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
                 
              // call update functions of pie-chart and legend.    
              pC.update(nD);
              leg.update(nD);
          }
          
          function mouseout(d){    // utility function to be called on mouseout.
              // reset the pie-chart and legend.    
              pC.update(tF);
              leg.update(tF);
          }
          
          // create function to update the bars. This will be used by pie-chart.
          hG.update = function(nD, color){
              // update the domain of the y-axis map to reflect change in frequencies.
              y.domain([0, d3.max(nD, function(d) { return d[1]; })]);
              
              // Attach the new data to the bars.
              var bars = hGsvg.selectAll(".bar").data(nD);
              
              // transition the height and color of rectangles.
              bars.select("rect").transition().duration(500)
                  .attr("y", function(d) {return y(d[1]); })
                  .attr("height", function(d) { return hGDim.h - y(d[1]); })
                  .attr("fill", color);

              // transition the frequency labels location and change value.
              bars.select("text").transition().duration(500)
                  .text(function(d){ return d3.format(",")(d[1])})
                  .attr("y", function(d) {return y(d[1])-5; });            
          }        
          return hG;
        }

        // function to handle pieChart.
        function pieChart(pD){
            var pC ={},    pieDim ={w:250, h: 250};
            pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
                    
            // create svg for pie chart.
            var piesvg = svg.append("svg")
                .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
                .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
            
            // create function to draw the arcs of the pie slices.
            var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

            // create a function to compute the pie slice angles.
            var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

            // Draw the pie slices.
            piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
                .each(function(d) { this._current = d; })
                .style("fill", function(d) { return segColor(d.data.type); })
                .on("mouseover",mouseover).on("mouseout",mouseout);

            // create function to update pie-chart. This will be used by histogram.
            pC.update = function(nD){
                piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                    .attrTween("d", arcTween);
            }        
            // Utility function to be called on mouseover a pie slice.
            function mouseover(d){
                // call the update function of histogram with new data.
                hG.update(fData.map(function(v){ 
                    return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
            }
            //Utility function to be called on mouseout a pie slice.
            function mouseout(d){
                // call the update function of histogram with all data.
                hG.update(fData.map(function(v){
                    return [v.State,v.total];}), barColor);
            }
            // Animating the pie-slice requiring a custom function which specifies
            // how the intermediate paths should be drawn.
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) { return arc(i(t));    };
            }    
            return pC;
        }

        // function to handle legend.
        function legend(lD){
            var leg = {};
                
            // create table for legend.
            var legend = svg.append("table").attr('class','legend');
            
            // create one row per segment.
            var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
                
            // create the first column for each segment.
            tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
                .attr("width", '16').attr("height", '16')
          .attr("fill",function(d){ return segColor(d.type); });
                
            // create the second column for each segment.
            tr.append("td").text(function(d){ return d.type;});

            // create the third column for each segment.
            tr.append("td").attr("class",'legendFreq')
                .text(function(d){ return d3.format(",")(d.freq);});

            // create the fourth column for each segment.
            tr.append("td").attr("class",'legendPerc')
                .text(function(d){ return getLegend(d,lD);});

            // Utility function to be used to update the legend.
            leg.update = function(nD){
                // update the data attached to the row elements.
                var l = legend.select("tbody").selectAll("tr").data(nD);

                // update the frequencies.
                l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

                // update the percentage column.
                l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
            }
            
            function getLegend(d,aD){ // Utility function to compute percentage.
                return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
            }

            return leg;
        }

        // calculate total frequency by segment for all state.
        var tF = ['low','mid','high', 'superHigh'].map(function(d){ 
            return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
        });    
        
        // calculate total frequency by state for all segment.
        var sF = fData.map(function(d){return [d.State,d.total];});

        var hG = histoGram(sF), // create the histogram.
            pC = pieChart(tF), // create the pie-chart.
            leg= legend(tF);  // create the legend.

      }

      // function setChartParameters(){
      //   xScale = d3.scale.linear()
      //              .domain([salesDataToPlot[0].hour, salesDataToPlot[salesDataToPlot.length - 1].hour])
      //              .range([padding + 5, rawSvg.clientWidth - padding]);
       
      //               yScale = d3.scale.linear()
      //                 .domain([0, d3.max(salesDataToPlot, function (d) {
      //                   return d.sales;
      //                 })])
      //              .range([rawSvg.clientHeight - padding, 0]);
       
      //   xAxisGen = d3.svg.axis()
      //                .scale(xScale)
      //                .orient("bottom")
      //                .ticks(salesDataToPlot.length - 1);
       
      //   yAxisGen = d3.svg.axis()
      //                .scale(yScale)
      //                .orient("left")
      //                .ticks(5);
       
      //   lineFun = d3.svg.line()
      //               .x(function (d) {
      //                 return xScale(d.hour);
      //               })
      //               .y(function (d) {
      //                 return yScale(d.sales);
      //               })
      //               .interpolate("basis");
      // }
                
      // function drawLineChart() {
       
      //   setChartParameters();
       
      //   svg.append("svg:g")
      //      .attr("class", "x axis")
      //      .attr("transform", "translate(0,180)")
      //      .call(xAxisGen);
       
      //    svg.append("svg:g")
      //       .attr("class", "y axis")
      //       .attr("transform", "translate(20,0)")
      //       .call(yAxisGen);
       
      //    svg.append("svg:path")
      //       .attr({
      //         d: lineFun(salesDataToPlot),
      //         "stroke": "blue",
      //         "stroke-width": 2,
      //         "fill": "none",
      //         "class": pathClass
      //    });
      // }
       
      dashboard();


    }
  }
})



/**
* Directive for validate currency
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

