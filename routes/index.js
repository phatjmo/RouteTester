
/*
 * GET home page.
 */
var t = require('../telephony');
//var database = require('../database.json');
var params = require('../params.json');
var logger = require('../utils/logger.js');
var db = require('../utils/db.js');
var num = require('../utils/numbers.js');
//Converter Class
var Converter=require("csvtojson").core.Converter;
var fs=require("fs");
//var pauseable = require('pauseable')
//  , EventEmitter = require('events').EventEmitter;
//var call = [];
//var ee = new EventEmitter();
var database = params.database;
var interval = 1000/params.dialer.cps
//logger.log('silly',interval);
//logger.log('silly',params);
//var call = "inactive";
//var sleep = require('teddybear');
//logger.log('silly',JSON.parse(database));
//logger.log('silly',database);
//var t = telephony.Shift8;

db.query("show tables","MySQL", function(err, rows){
    logger.log('silly',"Inside CB");
    if (err) {logger.error('silly','Query %s',err)};
    if (rows) {logger.log('silly','%d Row()s returned.',rows.length)};
});

function genCalls(element, index, array) {
    var phone = "";
    var dialString = "";
    var ani = "";
    var rangeTo = "";
    var rangeFrom = "";
    var rangeCount = 0;
    var delay = 0;

    logger.log('silly',"a[" + index + "] = " + element);
    logger.log('silly',element.rangefrom);
    logger.log('silly',element.rangeto);
    ac = element.ac;
    rangeTo = element.rangeto;
    rangeFrom = element.rangefrom;
    rangeCount = (rangeTo-rangeFrom)+1;
    logger.log('silly',"Processing " +ac+ " " + rangeFrom + " to " +ac+ " " + rangeTo + " for a total of " + rangeCount + " calls. Dialing at " + params.cps + " calls per second.");
    for (i=0; i < rangeCount; i++) {
      phone = rangeFrom + i;
      dialString = ac.toString() + phone.toString();
      ani = '04'+phone.toString();
      //logger.log('silly',dialString + ": processing call " + (i+1));
      //sleep(500);
      delay = i*interval;
      logger.log('silly',dialString + ": processing call " + (i+1) + " timeout: " + delay + ", i: " + i +", interval: " + interval);
      logger.log('silly',"makeCall('"+dialString+"','"+ani+"')");
      setTimeout(t.makeCall, delay, dialString, ani);
      
    }

}

exports.index = function(req, res){
  res.render(params.homepage, { title: 'Asterisk Dialer' })
  logger.log('silly',"GET:INDEX");
};

exports.didchecker = function(req, res){
  res.render('didchecker', { title: 'DID Checker' })
  logger.log('silly',"GET:DIDCHECKER");
};

exports.leadMill = function(req, res){
  res.render('index', { title: 'Asterisk Dialer' })
  logger.log('silly',"GET:LEADMILL");
};

exports.test = function(req, res){
  //res.render('index', { title: 'Express' })
  logger.log('silly',"GET:TEST");
  res.send("GET:TEST - SUCCESS!!!");
};

exports.callDID = function(req, res) {

  //if(req.query){did = req.query.did;} else { did = req.param('did')}
  did = req.param('did');
  logger.log('silly',did);
  channel = "local/"+did;
  context = "dummy-exten";
  exten =  "100";
  priority = 1;
  ani = "6026067001";
  callerID = '"Autodialer"<'+ani+'>';
  async = 1;
  application = null;
  data=null;
  timeout=null;
  variable = null;
  account=null;
  codecs=null;

  t.makeCall(did, ani, function(err, response){
    if (err) {
      logger.error(err);
      res.send(err);
    } else {
      logger.log('silly',response);
      res.send(response);
    }
  })
/*  t.originate(channel, context, exten, priority, application, data, timeout, callerID, variable, account, async, codecs, function(error, response){ 
    if(error){ 
      //logger.log('silly',error);
      res.send(error);
    } else {
      //logger.log('silly',response);
      res.send(response);
    }
    
   });*/
  logger.log('silly',"GET:CALLDID");
};

exports.listCommands = function(req, res){
 
  t.listCommands(function(error, response) {
    logger.log('silly',response);
    res.json(response);
  });
  logger.log('silly',"GET:LISTCOMMANDS");

};

exports.listChannels = function(req, res){
 
  t.listChannels(function(error, response) {
    logger.log('silly',response);
    res.json(response);
  });
  logger.log('silly',"GET:LISTCHANNELS");

};

exports.stateList = function(req, res){
  
  //response = [{"item": "NSW","count": 30000}];
  theQuery = 'SELECT state as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas GROUP BY state';
  
  db.query(theQuery,"MySQL",function(err,rows){
    if(err){
      logger.log('silly',err);
      res.json([{"item": "ERR","count":0}]);
    } else if(rows){
      logger.log('silly','%d row(s) returned.',rows.length);
      res.json(rows);
    }
  });
  
  logger.log('silly',"GET:stateList");

};
exports.cityList = function(req, res){
  logger.log('silly',req.body);
  logger.log('silly',req.params);
  logger.log('silly',req.query);
  //response = [{"item": "CANBERRA","count": 30000}];
  whereClause = "WHERE state = '" + req.query.state + "'";
  groupClause = "GROUP BY cca"; 
  theQuery = "SELECT cca as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas " + whereClause + " " + groupClause;
  logger.log('silly',theQuery);

  db.query(theQuery,"MySQL",function(err,rows){
    if(err){
      logger.log('silly',err);
      res.json([{"item": "ERR","count":0}]);
    } else if(rows){
      logger.log('silly','%d row(s) returned.',rows.length);
      res.json(rows);
    }
  });

  logger.log('silly',"GET:cityList");

};
exports.acList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE state = '" + req.query.state + "' AND cca = '" + req.query.city + "'";
  groupClause = "GROUP BY ac"; 
  theQuery = "SELECT ac as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas " + whereClause + " " + groupClause;
  
  db.query(theQuery,"MySQL",function(err,rows){
    if(err){
      logger.log('silly',err);
      res.json([{"item": "ERR","count":0}]);
    } else if(rows){
      logger.log('silly','%d row(s) returned.',rows.length);
      res.json(rows);
    }
  });

  logger.log('silly',"GET:acList");

};

exports.rangeList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE state = '" + req.query.state + "' AND cca = '" + req.query.city + "'";
  groupClause = "GROUP BY fullrange"; 
  theQuery = "SELECT fullrange as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas " + whereClause + " " + groupClause;
  db.query(theQuery,"MySQL",function(err,rows){
    if(err){
      logger.log('silly',err);
      res.json([{"item": "ERR","count":0}]);
    } else if(rows){
      logger.log('silly','%d row(s) returned.',rows.length);
      res.json(rows);
    }
  });

  logger.log('silly',"GET:rangeList");

};


exports.hubList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE d.status in (0,1)";
  groupClause = "GROUP by h.hub_id, h.hub_name"; 
  theQuery = "select h.hub_id as id, h.HUB_NAME as item, count(*) as count from did d inner join hub h on h.hub_id=d.hub_id " + whereClause + " " + groupClause;
  db.query(theQuery,"Oracle",function(err,rows){
    if(err){
      logger.log('silly',err);
      res.json([{"item": "ERR","count":0}]);
    } else if(rows){
      logger.log('silly','%d row(s) returned.',rows.length);
      res.json(rows);
    }
  });

  logger.log('silly',"GET:hubList");

};

exports.didList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  logger.log('silly',req.query);
  
  switch (req.query.type) {
    case "hub":
      whereClause = "WHERE hub_id ='" + req.query.id + "' AND status in (0,1)";
      break;
    case "customer":
      whereClause = "WHERE customer_id ='" + req.query.id + "' AND status in (0,1)";
      break;
    default:
      whereClause = "WHERE status in (0,1)";
  }
      groupClause = ""; 
      theQuery = "select did as item from did " + whereClause + " " + groupClause;

  logger.log('silly',theQuery);
  
  db.query(theQuery,"Oracle",function(err,rows){
    if(err){
      logger.log('silly',err);
      res.json([{"item": "ERR","count":0}]);
    } else if(rows){
      logger.log('silly','%d row(s) returned.',rows.length);
      res.json(rows);
    }
  });

  logger.log('silly',"GET:didList");

};

exports.callDIDs = function(req, res) {
    //var did = "";
    //logger.log("silly",req);
    var didList = req.param("didList");
    logger.log("silly",didList);
    var ani = "";
    var delay = 0;
    var counter = 0;
    var statuses = [];
    var response = function(err, res){
      if (err){
        logger.error(err);
      } else {
        logger.log("silly",res);
        //res.send(res);
      }
    };
    didList.forEach(function(did) {  
      if(did.ITEM){
        extension = did.ITEM;
      } else {
        extension = did.item;
      }
      ani = '602606'+ num.leftPad(num.randomInt(0,9999),4);
      //logger.log('silly',dialString + ": processing call " + (i+1));
      //sleep(500);
      counter++;
      delay = counter*interval;
      logger.log('silly',"makeCall('%s','%s') after %dms",extension, ani, delay);
      setTimeout(t.makeCall, delay, extension, ani, response);
    });
    res.send("Complete");


 
}

exports.hangChan = function(req, res){
  channel = req.body.channel;
  t.hangup(channel, function(error, response){
    if(error){
      //logger.error(error);
      res.send(error);
    } else {
      //logger.log("silly",response);
      res.send(response);
    }

  })

}


exports.doRange = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE state = '" + req.query.state + "' AND cca = '" + req.query.city + "' AND fullrange = '" + req.query.range + "'";
  theQuery = "SELECT ac, rangefrom, rangeto FROM areas " + whereClause;
  
  db.query(theQuery,"MySQL",function(err,rows){
    if(err){
      logger.log('silly',err);
      res.json([{"item": "ERR","count":0}]);
    } else if(rows){
      logger.log('silly','%d row(s) returned.',rows.length);
      res.json(rows);
    }
  });  

  logger.log('silly',"GET:doRange");

};

exports.didUpload = function(req, res){
  file = req.files.didFile;
  body = req.body
  logger.log("silly",file);
  //logger.log("silly",body);
  logger.log("silly","File %s uploaded, and it's %d bytes. This is a %s file.",file.name,file.size,file.type);

  var csvFileName=file.path;
  var fileStream=fs.createReadStream(csvFileName);
  //new converter instance
  var param={};
  var csvConverter=new Converter(param);

  //end_parsed will be emitted once parsing finished
  csvConverter.on("end_parsed",function(jsonObj){
     logger.log("silly",jsonObj); //here is your result json object
     res.json(jsonObj);
     fs.unlink(csvFileName);
  });

  //read from file
  fileStream.pipe(csvConverter);


  logger.log("silly","POST:DIDUPLOAD");
  //res.send("YAY FILE RECEIVED!");
}

exports.procCall = function(vars){
    if(vars.agi_context==params.asterisk.obcontext){
      logger.log('silly',"Call Hungup, gathering causes.");
      channel = vars.agi_channel;
      ani = vars.callerid;
      uniqueid = vars.agi_uniqueid;
      SIPcause = vars.agi_arg_1;
      SIPcode = vars.agi_arg_2;
      SIPmsg = vars.agi_arg_3;
      //logger.log('silly',"SIP Cause: " + SIPcause);
      //logger.log('silly',"SIP Code: " + SIPcode);
      //logger.log('silly',"SIP Message: " + SIPmsg);
      theQuery ="UPDATE calldetail set sipcause='"+SIPcause+"', sipcode='"+SIPcode+"', sipmsg='"+SIPmsg+"', callend=now() WHERE uniqueid='"+uniqueid+"'";
      //logger.log('silly',theQuery);
      db.query(theQuery,"MySQL",function(err,res){
        if(err){
          logger.error('silly',err);
        } else if(res){
          logger.log('silly',res);
        }
      });
    }
    if(vars.agi_context==params.asterisk.ibcontext){
      logger.log('silly',"Call hit LeaseHawk system, HOORAY!!!");
      ani = vars.agi_callerid;
      did = vars.agi_extension;
      theQuery ="UPDATE calldetail set received=true WHERE did='"+did+"' AND ani='"+ani+"'";
      logger.log('silly',theQuery);
      db.query(theQuery,"MySQL",function(err,res){
        if(err){
          logger.error('silly',err);
        } else if(res){
          logger.log('silly',res);
        }
      });
    }

}