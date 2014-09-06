
/**
 * Module dependencies.
 */

var express = require('express')
  , telephony = require('./telephony')
  , redis = require("redis")
  , routes = require('./routes');

var params = require('./params.json');
var logger = require('./utils/logger.js');
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
app.get('/leadMill', routes.leadMill);
//app.post('/call', routes.call);
app.get('/test',routes.test);
app.post('/sendCalls',routes.sendCalls);
app.get('/sendCalls',routes.sendCalls);
app.get('/callDID',routes.callDID);
app.post('/callDID',routes.callDID);
app.post('/callDIDs',routes.callDIDs);
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
  logger.log('silly',"Carrier Simulator is ready and waiting on port %d in %s mode", app.address().port, app.settings.env);
});

require('agi').createServer(function(context) {
  //context is a new instance of agi.Context for each new agi session
  //immedately after asterisk connects to the node process
  context.on('variables', function(vars) {
    logger.log('silly','received new call from: ' + vars.agi_callerid + ' with uniqueid: ' + vars.agi_uniqueid + 'channel: ' + vars.agi_channel);    
    routes.procCall(vars);
    if(vars.agi_context=='inbound'){
      logger.log('silly',"Inbound");
      //context.hangup();
    }
/*    if(vars.agi_context=='outbound'){
      logger.log('silly',"Call Hungup, gathering causes.");
      SIPcause = vars.agi_arg_1;
      SIPcode = vars.agi_arg_2;
      SIPmsg = vars.agi_arg_3;
      logger.log('silly',"SIP Cause: " + SIPcause);
      logger.log('silly',"SIP Code: " + SIPcode);
      logger.log('silly',"SIP Message: " + SIPmsg);
    }*/
    //logger.log('silly',vars);

  });
  /*context.on('response', function(msg){
    logger.log('silly',msg);
  });
  context.getVariable('CHANNEL', function(err,res){
    if(err){logger.log('silly',err)}
    if(res){logger.log('silly',res)}
  });
  context.getVariable('CDR(dstchannel)', function(err,res){
    if(err){logger.log('silly',err)}
    if(res){logger.log('silly',res)}
  });  
  context.getVariable('DIALSTATUS', function(err,res){
    if(err){logger.log('silly',err)}
    if(res){logger.log('silly',res)}
  });
  context.getVariable('HANGUPCAUSE', function(err,res){
    if(err){logger.log('silly',err)}
    if(res){logger.log('silly',res)}
  });
    context.getVariable('SIPcode', function(err,res){
    if(err){logger.log('silly',err)}
    if(res){logger.log('silly',res)}
  });  
  context.getVariable('SIPcause', function(err,res){
    if(err){logger.log('silly',err)}
    if(res){logger.log('silly',res)}
  });
  context.getVariable('SIPmsg', function(msg){
    logger.log('silly',msg);
  });
  context.on('msg', function(msg){
    logger.log('silly',msg);
  });*/
    
  context.end();

}).listen(6969);
