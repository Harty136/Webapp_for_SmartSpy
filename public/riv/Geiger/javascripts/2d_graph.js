////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/////////////////// STARTING FUNCTION //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

$(function () {
        document.getElementById("DataLoaded").style.visibility = "hidden";
        window.onload = function(){
                UpdateLiveData();
                setInterval(UpdateLiveData, 10000);
        }
        var chart = new Highcharts.Chart(options_line);
        document.getElementById("console").innerHTML = ('Geiger data viewer CONSOLE');
});

$(function(){
        AnyTime.picker( "start");
        AnyTime.picker( "stop");
        });

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////// FUNZIONI SCRITTE DA ME //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


function AddDataSerie() {
        document.getElementById("console").innerHTML = ('loading . . .');
        property=JSON.parse(document.getElementById("property").innerHTML)
                options_line.title.text = property.type;
                options_line.subtitle.text = property.IP;
        
        $.getJSON( '/atmdata/'+property.type+'/'+property.IP, function(data ) {
                if (JSON.stringify(data)=='null') document.getElementById("console").innerHTML = ('NO DATA PRESENT');
                else {
                        //SORT DATA BY TIME
                        data.sort(function(a,b) {
                                return a.time - b.time;
                        });

                        // definisco gli oggetti data_series e data_range legati all'indice di serie
                        var data_series= {
                                        "name": "serie #"+series_index,
                                        "data": [],
                                        "zIndex": 2,
                                        "marker": {
                                                "lineWidth": 1
                                                },
                                        "_colorIndex": series_index,
                                        "_symbolIndex": series_index
                                     }
                        var data_range= {
                                        "linkedTo": ":previous",
                                        "name": "range "+series_index,
                                        "type": "arearange",
                                        "data": [],
                                        "lineWidth": 0,
                                        "fillOpacity": 0.3,
                                        "zIndex": 1,
                                        "_colorIndex": series_index
                                     }
                        series_index++;
                        
                        // imposto i valori xy dai dati acquisiti
                        for(var i = 0, len = data.length; i < len; i++) {
                                //i dati sono salvati secondo il fuso orario GMT+0 (la BBB è impostata con quel fuso)
                                x=parseFloat(data[i].time)+parseFloat(60*60*1000) // aggiungo l'ora di fuso orario
                                var xy=JSON.parse('['+x+','+data[i].dose+' ]');
                                y_meno = parseFloat(data[i].dose)-parseFloat(data[i].error);
                                y_piu = parseFloat(data[i].dose)+parseFloat(data[i].error);
                                var xyerr=JSON.parse('['+x+','+y_piu+','+y_meno+' ]');
                                data_series.data.push(xy);
                                data_range.data.push(xyerr);
                        }
                        options_line.series.push(data_series, data_range);
                        var chart = new Highcharts.Chart(options_line);

                        document.getElementById("DataLoaded").style.visibility = "visible";
                        document.getElementById("console").innerHTML = ('loaded '+data.length+' elements');
                }
        });
};

////////////////////////////////////////////////////////////////////////////////

function ShowHistogram(data_from_series) {
        document.getElementById("console").innerHTML = ('loading . . .');
        property=JSON.parse(document.getElementById("property").innerHTML)
                options_hist.title.text = property.type;
                options_hist.subtitle.text = property.IP;
        
                var data_series= {
                                "name": "histogram",
                                "data": [],
                                "_colorIndex": 6,
                                "_symbolIndex": 6
                             }
                var data_array = [];
                // imposto i valori xy dai dati acquisiti
                for(var i = 0, len = data_from_series.length; i < len; i++) {
                        x=JSON.parse(data_from_series[i].y)
                        data_array.push(x);
                }
            
                var values = get_data_n_bins(data_array, 30) 
                // clear old data
                options_hist.series.splice(0);
        
                data_series.data=(values[0])
                options_hist.series.push(data_series);
                options_hist.xAxis.categories=(values[1]);
                
                var chart = new Highcharts.Chart(options_hist);
        
        document.getElementById("DataLoaded").style.visibility = "visible";
        document.getElementById("console").innerHTML = ('loaded Histogram for selected serie');
};
function get_data_n_bins(datah, bins_number) {
        
        datah.sort();

        datah_max = datah[datah.length-1]
        datah_min = datah[0]

        var step = (datah_max-datah_min)/bins_number;

        count = new Array(bins_number+1).join('0').split('').map(parseFloat)
        
        filldabins(0)

        function filldabins(i) {
                if (i<datah.length) {
                        for (j=0; j<bins_number; j++) {
                                if (datah[i] < datah_min+(j+1)*step) {
                                        count[j] ++
                                        i++
                                        filldabins(i)
                                        }
                        }
                }
        }
        bins=[]
        for (j=0; j<bins_number; j++) {
                bins = bins+''+(datah_min+(j)*step).toPrecision(2) +'-'+ (datah_min+(j+1)*step).toPrecision(2)+','
        }
        bins=bins.split(',')
        bins.pop()
        
        return [count, bins]
}

////////////////////////////////////////////////////////////////////////////////
function ClearAllData() {
        document.getElementById("DataLoaded").style.visibility = "hidden";
        series_index=0;
        options_line.series.splice(0);
        var chart = new Highcharts.Chart(options_line);
        document.getElementById("console").innerHTML = (JSON.stringify(options_line.series));
        };

////////////////////////////////////////////////////////////////////////////////
var lastData;
function UpdateLiveData() {  
        property=JSON.parse(document.getElementById("property").innerHTML)
        av=property.alarm_value
        pb_txt='[{from:0.0,to:'+av/2+',color:"#55BF3B"},{from:'+av+',to:'+3*av+',color:"#DDDF0D"},{from:'+3*av+',to:'+4*av+',color:"#DF5353"}]'
          $.getJSON( '/livedata/'+property.type+'/'+property.IP, function( data ) {
                if (data==lastData) {}
                else {
                        options_gauge.series[0].data[0]=(data*1);
                        options_gauge.yAxis.plotBands=eval(pb_txt);
                        options_gauge.yAxis.max=4*av;
                        var LD = new Highcharts.Chart(options_gauge);
                        lastData=data;
                }
        });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/////////////// OPZIONI PER I GRAFICI DI HIGHCHART /////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var options_line={
        chart : {
            renderTo: 'grafico',
	    zoomType: 'x',
            panning: true,
            panKey: 'ctrl',
            backgroundColor: null //'rgba(255, 255, 255, 0.8)'
        },
			credits: {
				enabled: false
				},
        title: {
            text: 'Title',
            x: -20 //center
        },
        subtitle: {
            text: 'IP: -',
            x: -20
        },
        xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                        second: '%Y-%m-%d<br/>%H:%M:%S',
                        minute: '%Y-%m-%d<br/>%H:%M',
                        hour: '%Y-%m-%d<br/>%H:%M',
                        day: '%Y<br/>%m-%d',
                        week: '%Y<br/>%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    }
        },
        yAxis: {
            title: {
                text: 'Dose (uSh)'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
	
        tooltip: {
                enabled:true,
                shared:true,
                formatter: function () {
                                d=new Date(this.x)
                                h=d.getHours()-1; // fuso orario
                                m=d.getMinutes()
                                if (m<10) m='0'+m;
                                if (h<10) h='0'+h;
                                var txt='<i>'+h+':'+m+'<br>Dose: <b>'+this.points[0].y+'</b> uS/h'
                                return txt 
                }/**/
            //pointFormat: "Dose: {series.name}: <b>{point.y:.3f}</b> uSh"
        },		
	plotOptions: {
		line: {
			dataLabels: {
				enabled: false
			},
			enableMouseTracking: true
		},
                series: {
                        events: {
                            legendItemClick: function () {
                                ShowHistogram(this.data)
                                        }
                                }
                        }
	},
        series: [] 
    };

var options_hist={
        chart : {
            type: 'column',
            renderTo: 'grafico',
	    zoomType: 'x',
            panning: true,
            panKey: 'ctrl',
            backgroundColor: null //'rgba(255, 255, 255, 0.8)'
        },
	credits: {
		enabled: false
		},
        title: {
            text: 'Title',
            x: -20 //center
        },
        subtitle: {
            text: 'IP: -',
            x: -20
        },
        xAxis: {
                categories: [],
                labels: {
                        step: 1
                        }
        },
        yAxis: {
                title: {
                text: 'Dose (uSh)'
                }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
	
        tooltip: {
            pointFormat: "{point.y} events"
        },		
	plotOptions: {
		line: {
			dataLabels: {
				enabled: false
			},
			enableMouseTracking: true
		},
                series: {
                        events: {
                            legendItemClick: function (e) {
                                var chart = new Highcharts.Chart(options_line);
                            }
                        }
                },
                column: {
                    groupPadding: 0,
                    pointPadding: 0,
                    borderWidth: 0
                }
	},
        series: [] 
    };

var series_index=0;

var options_gauge={
        chart: {
            type: 'gauge',
            renderTo: 'LiveData',
            backgroundColor: null
        },
        exporting: {
            enabled:false
        },
        credits: {
		enabled: false
		},
        title: {
            text: ''
        },pane: {
            startAngle: -150,
            endAngle: 150,
            background: [ {
                borderWidth: 0,
                outerRadius: '89%'
            }, {
                borderWidth: 3,
                outerRadius: '45%'
            }]
        },
        yAxis: {
            min: 0.0,
            max: 0.8,

            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',

            tickPixelInterval: 80,
            tickWidth: 3,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            title: {
                text: 'uS/h'
            },
            plotBands: [{
                from: 0.0,
                to: 0.1,
                color: '#55BF3B' // green
            }, {
                from: 0.2,
                to: 0.5,
                color: '#DDDF0D' // yellow
            }, {
                from: 0.5,
                to: 0.8,
                color: '#DF5353' // red
            }]
        },
        plotOptions: {
                series: {
                        animation:false
                }
        },
        series: [{
                    name: 'Live Data',
                    data: [0.0],
                    tooltip: {
                        valueSuffix: ' uS/h'
                    }
                }]

    }

