Shift8 = require('node-shift8')

var t = new Shift8({
        'server':       '127.0.0.1',
        'port':         8088,
        'manager':      'nodejs',
        'secret':       'nodejs',
        'ajam':         '/mxml'
});

t.on('connected', function() {
  t.waitEvent(true);

  t.ping(function( error, response ) {
    if(error) console.log(error);
    console.log(response);
  });
});

t.on('error', function( error ) {
        console.log("Error: " + error);
});

t.on('event', function( event ) {
        //console.log("Event");
        //console.log(event);
        //if(event.event=="VarSet"){
          //switch (event.variable) { }
          //console.log(event);
        //}
});

t.on('disconnected', function() {
        console.log("Bye Bye");
});

t.login();

exports.Shift8 = t;