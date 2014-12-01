var Shift8 = require('node-shift8')
var logger = require('./utils/logger.js');
var db = require('./utils/db.js');
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
    if(error) logger.log('silly',error);
    logger.log('silly','telephony.js - %s',response);
  });
});

t.on('error', function( error ) {
        logger.log('silly',"Error: " + error);
});

t.on('event', function( event ) {
        //logger.log('silly',"Event");
        if (event.event=="Dial" && event.subevent=="Begin"){
          //logger.log('silly',event);
          ani = event.calleridnum;
          did = event.dialstring.split("/")[1];
          uniqueid = event.uniqueid;
          destuniqueid = event.destuniqueid;
          channel = event.destination;
          theQuery = "INSERT INTO calldetail (uniqueid, did, ani, callstart, astChannel) VALUES ('" + destuniqueid + "','" + did + "','" + ani + "',now(),'" + channel + "')";
          //logger.log('silly',theQuery);
          db.query(theQuery,"MySQL",function(err,res){
              if(err){logger.log('silly',err);}
              if(res){
                logger.log('silly',res);
              }
          });
/*          connection.query(theQuery,function(err, res){
            if(err){logger.log('silly',err);}
            if(res){
              //logger.log('silly',res);
            }
          })*/
        
        }
        if(event.event=="VarSet"){
          switch (event.variable) { 
            case "SIPcause":
              //logger.log('silly',event);
              break;
            case "SIPcode":
              //logger.log('silly',event);
              break;
            case "SIPmsg":
              //logger.log('silly',event);
              break;
            otherwise:
              break;
          }
          
        }
        //logger.log('silly',"Event received: %s",event.event);
         if(event.event=="Trying"||event.event=="Progressing"||event.event=="Ringing"){
          logger.log('silly',event);
          if((event.event=="Progressing" || event.event=="Ringing") && event.userdata!='(null)'){
            logger.log('silly',"Dropping before answer...");
            t.hangup(event.channelname);
            call="inactive";
          }
        }
        
});

t.on('disconnected', function() {
        logger.log('silly',"Bye Bye");
});

t.login();

exports.listCommands = function(cb){
 
  t.listCommands(function(error, response) {
    if(error){
      return cb(error);
    } else {
      return cb(null, response);
    }
  });
  logger.log('silly',"T:LISTCOMMANDS");

};

exports.listChannels = function(cb){
 
  t.getActiveChannels(function(error, response) {
    if(error){
      return cb(error);
    } else {
      return cb(null, response);
    }
  });
  logger.log('silly',"T:LISTCHANNELS");

};

exports.makeCall = function(did, ani, cb){
  call = "active";
  did = did;
  logger.log('silly',"Calling " + did + " from " + ani);
  channel = "local/"+did;
  context = "dummy-exten";
  exten =  "100";
  priority = 1;
  if(ani){
    callerID = '"Autodialer"<'+ani+'>';
  } else {
    callerID = '"Autodialer"<6026067001>';  
  }
  
  async = 1;
  application = null;
  data=null;
  timeout=null;
  variable = null;
  account=null;
  codecs=null;

  t.originate(channel, context, exten, priority, application, data, timeout, callerID, variable, account, async, codecs, function(error, response){ 
    if(error){ 
      logger.error("telephony.js:makeCall(("+ did +","+ ani +") - %s",error);
      cb(error);
    } else {
      logger.log('silly',"telephony.js:makeCall("+ did +","+ ani +") - %s",response);
      cb(null, response);
    }
    
   });
  //logger.log('silly',"GET:makeCall");

}

exports.hangup = function(channel, cb){
  t.hangup(channel, function(error, response){
    if(error){
      logger.error("telephony.js:hangup("+ channel + ") - %s",error);
      cb(error);
    } else {
      logger.log('silly',"telephony.js:hangup("+ channel + ") - %s",response);
      cb(null,response);
    }
  });
};

exports.Shift8 = t;