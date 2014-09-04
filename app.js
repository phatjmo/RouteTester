
/**
 * Module dependencies.
 */

var express = require('express')
  , telephony = require('./telephony')
  , redis = require("redis")
  , routes = require('./routes');



var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/didchecker', routes.didchecker);
//app.post('/call', routes.call);
app.get('/test',routes.test);
app.post('/sendCalls',routes.sendCalls);
app.get('/sendCalls',routes.sendCalls);
app.get('/callDID',routes.callDID);
app.post('/callDID',routes.callDID);
app.get('/listCommands',routes.listCommands);
app.get('/listChannels',routes.listChannels);
app.get('/areaList',routes.areaList);
app.get('/stateList',routes.stateList);
app.get('/cityList',routes.cityList);
app.get('/acList',routes.acList);
app.get('/rangeList',routes.rangeList);
app.get('/hubList',routes.hubList);
app.get('/didList',routes.didList);
app.get('/doRange',routes.doRange);

app.listen(3000, function(){
  console.log("Carrier Simulator is ready and waiting on port %d in %s mode", app.address().port, app.settings.env);
});

require('agi').createServer(function(context) {
  //context is a new instance of agi.Context for each new agi session
  //immedately after asterisk connects to the node process
  context.on('variables', function(vars) {
    console.log('received new call from: ' + vars.agi_callerid + ' with uniqueid: ' + vars.agi_uniqueid + 'channel: ' + vars.agi_channel);    
    routes.procCall(vars);
    if(vars.agi_context=='inbound'){
      console.log("Inbound");
      //context.hangup();
    }
/*    if(vars.agi_context=='outbound'){
      console.log("Call Hungup, gathering causes.");
      SIPcause = vars.agi_arg_1;
      SIPcode = vars.agi_arg_2;
      SIPmsg = vars.agi_arg_3;
      console.log("SIP Cause: " + SIPcause);
      console.log("SIP Code: " + SIPcode);
      console.log("SIP Message: " + SIPmsg);
    }*/
    //console.log(vars);

  });
  /*context.on('response', function(msg){
    console.log(msg);
  });
  context.getVariable('CHANNEL', function(err,res){
    if(err){console.log(err)}
    if(res){console.log(res)}
  });
  context.getVariable('CDR(dstchannel)', function(err,res){
    if(err){console.log(err)}
    if(res){console.log(res)}
  });  
  context.getVariable('DIALSTATUS', function(err,res){
    if(err){console.log(err)}
    if(res){console.log(res)}
  });
  context.getVariable('HANGUPCAUSE', function(err,res){
    if(err){console.log(err)}
    if(res){console.log(res)}
  });
    context.getVariable('SIPcode', function(err,res){
    if(err){console.log(err)}
    if(res){console.log(res)}
  });  
  context.getVariable('SIPcause', function(err,res){
    if(err){console.log(err)}
    if(res){console.log(res)}
  });
  context.getVariable('SIPmsg', function(msg){
    console.log(msg);
  });
  context.on('msg', function(msg){
    console.log(msg);
  });*/
    
  context.end();

}).listen(6969);
