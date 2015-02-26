var express = require('express');
var router = express.Router();
var mf = require('my_functions')

var data=new Object()
var start_i =new Object();
var stop_i=new Object();
/* GET home page. */

var riv_type_list
mf.get_compatible_riv_list('./public/riv',function(b){riv_type_list=b}) // ottiene la lista dei rivelatori di cui esiste un layout

router.get('/', function(req, res) {
        mf.check_alive(req.client, function (revealers, types) {
                rlist=revealers.list
                rtypes=types
                res.render('index', {types:rtypes, k:rtypes.length, list:rlist, l:rlist.length});
        })
});

router.get('/riv/:type/:ip', function(req, res) {
// controlla se per questo tipo di rivelatore esiste un layout, altrimenti carica la pagina 'norevealer'
        if (riv_type_list.indexOf(req.params.type) == -1) res.render('norevealer'); 
        else {
                mf.check_property(req.client, req.params.type, req.params.ip, function(property) {
                        res.render('geiger', {property:JSON.stringify(property), obj:property});
                })
        }
});

router.get('/data_table/:ip', function(req, res) {
	res.render('data_table', { data: data[req.params.ip], l:data[req.params.ip].length });
});

router.post('/setss/:ip', function(req,res) {
        start_i[req.params.ip]= new Date(req.body.start.toString());
        stop_i[req.params.ip]= new Date(req.body.stop.toString());
        });

router.post('/en/:ip', function(req,res) {
        var zmq = req.zmq;

        var zmqc = zmq.socket('req'); // zmq client
		  checkflag=0;
        zmqc.connect('tcp://'+req.params.ip+':5555');        
        zmqc.send (JSON.stringify(req.body));
        zmqc.on('message', function(reply) {
	        			zmqc.close()
                	res.send(reply)
                	checkflag=1;
                });
        setTimeout(function () {
        				if (checkflag==0)
        				{
        					zmqc.close()
        					res.send('*** NO RESPONSE ***')
        				}
        			}, 1000)
        });

// pagine di dati temporanei
router.get('/atmdata/:type/:ip', function(req,res) {
        // GET REDIS CLIENT
        var client=req.client
        var ip=req.params.ip
        var keyword = req.params.type+":"+req.params.ip+":";
        // check if start and stop exists
        if (typeof start_i[ip] === 'undefined' || typeof stop_i[ip] === 'undefined') {                
                start= new Date()                
                start.setTime(start.getTime() - 5*60*60*1000);               
                stop= new Date() 
        }
        else {
                var start = start_i[ip].getTime();
                var stop = stop_i[ip].getTime();
        }
        // void array to clear data
        var tmp = new Array();
        // GET ALL DATA BETWEEN START AND STOP
        client.keys(keyword+"*", function(err,keys)
                {
                if (err) return console.log(err);
                else if (keys) read_data(keys,0)
                else res.json(null)   
                });

        function read_data(keys, i) {
                if (i < keys.length) {
                        client.hgetall(keys[i], function (err, obj) {
                                if (err) console.log(err);
                                if (obj.time > start && obj.time < stop) {
                                        tmp.push(obj);
                                        data[ip]=tmp
                                };
                                i++
                                read_data(keys, i)
                        });
                }
                else next()
        }  
        function next() {
                if(data[ip]) res.json(data[ip]);
                else res.json(null)
                }
});

router.get('/livedata/:type/:ip', function(req,res) {
        // GET REDIS CLIENT
        var client=req.client
        var ip=req.params.ip
        var keyword = req.params.type+":"+req.params.ip+":LASTDATA";
        
        client.hget(keyword, 'dose', function (err, value) {
                if (err) console.log(err);
                res.json(value);
                });
});

router.get('/riv_property/:type/:ip', function(req, res) {
        mf.check_property(req.client, req.params.type, req.params.ip, function(property) {
                res.json(property);
                })
});

module.exports = router;

