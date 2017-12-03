// Load Google Charts
google.load('visualization', '1', {
  packages: ['corechart']
});

numPointsToPlot = '1955'; // Default Values For Chart Type
TypeofChart = '1 Week'; // Default Values For Chart Type

function drawChart() { // the rest of the script is this function
  //google.setOnLoadCallback(drawChart);	// calls callback when both Charts and DOM is loaded

  // Fields: 1= Temp, 2= Humidity 3= Pressure
  var dataField1 = 'field1'; // Chart 1	(1st line)
  var dataField2 = 'field2'; // Chart 2	(2nd line)
  var dataField3 = 'field3'; // Chart 3	(3rd line)
  // DO NOT READ MORE DATA POINTS THAN YOU HAVE STORED IN THINGSPEAK! Upload every 5 minutes = 288 data points per day and 1 week = 1955 data points
  var startDate = ''; // alternate - not tested - will likely screw up gauges unless a new counter is added.
  var endDate = ''; // (see above)

  /////////////////////////////////// Get the Data  ////////////////////////////////////////
  // setup for request to ThingSpeak ... 
  var urlOption = 'https://api.thingspeak.com/channels/' + chan1 + '/feed.json?api_key= + key1 +';
  var dataOption = {
    results: numPointsToPlot,
    start: startDate,
    end: endDate
  };

  // make the request to ThingSpeak ... ()JSONP to enable cross-domain ajax calls)
  var jsonData = $.ajax({
    url: urlOption,
    data: dataOption,
    dataType: 'jsonp',
  }).done(function(results) {

    /////////////////////////////////// Prep the Data  ////////////////////////////////////////
    //  Copy the time series and data from the JSON object into the Google Charts object

    var chartData2 = new google.visualization.DataTable();
    chartData2.addColumn('datetime', 'Time');
    chartData2.addColumn('number', 'Temperature'); // Temperature
    chartData2.addColumn('number', 'Humidity'); // Humidity
    chartData2.addColumn('number', 'Pressure'); // Pressure

    $.each(results.feeds, function(i, row) {
      chartData2.addRow([
        (new Date(row.created_at)),
        parseFloat(row[dataField1]), // 3 fields in chart
        parseFloat(row[dataField2]),
        parseFloat(row[dataField3]),
      ]);



    });

    ////////////////////////////////// Setup the Charts  //////////////////////////////////////
var formatter = new google.visualization.DateFormat({pattern: 'EEE d MMM yyyy h:mm a'});
formatter.format(chartData2, 0);
    var ChartOptions2 = {
	title: 'ESP8266 NodeMCU BME280 ' + TypeofChart + ' Chart',
	titleTextStyle: {color: 'blue'},
	backgroundColor: {fill: 'transparent'},
	legend: {position: 'top', alignment: 'left', textStyle: {color: 'Purple'}},
	lineWidth: 2,
//	animation: {startup: true, duration: 50, easing: 'linear'}, // Duration is very low to just flash to indicate the chart has changed. Does not work with Zoom chart.
	curveType: 'function', // smooth the lines
	colors: ['red', 'yellow', 'green'],
	explorer: {
//		actions: ['dragToZoom', 'rightClickToReset'], // vs DragToPan with mouse wheel to zoom
		axis: 'horizontal',
		keepInBounds: true,
		zoomDelta: .5,
		maxZoomIn: 20.0},
          
        };
    

    ////////////////////////////////// Show the Charts  //////////////////////////////////////

    var googleChart2 = new google.visualization.LineChart($('#chartDiv').get(0));
    googleChart2.draw(chartData2, ChartOptions2);
    document.getElementById('HighTemp').innerHTML = chartData2.getColumnRange(1).max; // High Temp For The Week / 24 Hrs
    document.getElementById('LowTemp').innerHTML = chartData2.getColumnRange(1).min; // Low Temp For the Week / 24 Hrs
    document.getElementById('HighHumid').innerHTML = chartData2.getColumnRange(2).max; // High Humidity For The Week / 24 Hrs
    document.getElementById('LowHumid').innerHTML = chartData2.getColumnRange(2).min; // Low Humidity For the Week / 24 Hrs
    document.getElementById('HighPress').innerHTML = chartData2.getColumnRange(3).max; // High Pressure For The Week / 24 Hrs
    document.getElementById('LowPress').innerHTML = chartData2.getColumnRange(3).min; // Low Pressure For the Week / 24 Hrs

  }); //end .done(function(results)

} //end drawChart() function
