
/*
 * GET home page.
 */
var telephony = require('../telephony');
var t = telephony.Shift8;
var mysql      = require('mysql');
/* var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'leadmill',
  password : 'leadmill'
}); */
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'didchecker',
  password : 'didchecker'
});

var oracle = require('oracle');

var connString = "(DESCRIPTION =(ADDRESS_LIST =(ADDRESS = (PROTOCOL = TCP)(HOST = lva1doradev90.cvdsxiegyd4k.us-east-1.rds.amazonaws.com)(PORT = 1521)))(CONNECT_DATA =(SID = LEGACYDB)))";
var connectData = {
    "tns": connString,
    "user": "apricot",
    "password": "apri-cot"
}; 


/* var connectData = {
    hostname: "lva1doradev90.cvdsxiegyd4k.us-east-1.rds.amazonaws.com",
    port: 1521,
    sid: "legacydb", // System ID (SID)
    user: "apricot",
    password: "apri-cot"
}; */ 

oracle.connect(connectData, function(err, connection) {
    if (err) { console.log("Error connecting to db:", err); return; }
    connection.execute("SELECT systimestamp FROM dual", [], function(err, results) {
        if (err) { console.log("Error executing query:", err); return; }

        console.log(results);
        connection.close(); // call only when query is finished executing
    });

});

/*oracle.connect(connectData, function(err, connection) {
    if (err) { console.log("Error connecting to db:", err); return; }
    hubQuery = 'select h.HUB_NAME as hub, count(*) as dids from did d inner join hub h on h.hub_id=d.hub_id group by h.hub_name';
    connection.execute(hubQuery, [], function(err, results) {
        if (err) { console.log("Error executing query:", err); return; }

        console.log(results);
        connection.close(); // call only when query is finished executing
    });
    
});*/


function query(query){

  connection.query(query, function(err, rows, fields) {
    if (err) {
      throw err;
      return -1;
    } else {

      console.log('Query successful: ', rows[0]);
      return rows;

    }
  });

}

function genCalls(element, index, array) {
    console.log("a[" + index + "] = " + element);
    console.log(element.rangefrom);
    console.log(element.rangeto);
    ac = element.ac;
    rangeTo = element.rangeto;
    rangeFrom = element.rangefrom;
    rangeCount = (rangeTo-rangeFrom)+1;
    console.log("Processing " +ac+ "" + rangeFrom + " to " +ac+ " " + rangeTo + " for a total of " + rangeCount + " calls.");
    for (i=0; i < rangeCount; i++) {
      phone = rangeFrom + i;
      dialString = ac.toString() + phone.toString();
      //console.log(dialString + ": processing call " + (i+1));
      result = makeCall("dialString");
      console.log(dialString + ": processing call " + (i+1) + ": " + result);
    }

}

function makeCall(dialstring){
  channel = dialstring;
  context = "outdial";
  exten = "1111111111@handledial";
  callerID = "0255544422";
      console.log("Placing Call to " + dialstring);
  t.originate(channel, context, exten, 1, 2000, callerID, 1, function(error, response){  
    if(error) {
      console.log(error);
      return error;
    } else {
      console.log(response);
      return response;
    }
  });    

}

t.on('event', function( event ) {
        //console.log("Event");
        if (event.event=="Dial" && event.subevent=="Begin"){
          console.log(event);
          ani = event.calleridnum;
          did = event.dialstring.split("/")[1];
          uniqueid = event.uniqueid;
          destuniqueid = event.destuniqueid;
          channel = event.destination;
          theQuery = "INSERT INTO didchecker.calldetail (uniqueid, did, ani, callstart, astChannel) VALUES ('" + destuniqueid + "','" + did + "','" + ani + "',now(),'" + channel + "')";
          console.log(theQuery);
          connection.query(theQuery,function(err, res){
            if(err){console.log(err);}
            if(res){console.log(res);}
          })
        
        }
        if(event.event=="VarSet"){
          switch (event.variable) { 
            case "SIPcause":
              //console.log(event);
              break;
            case "SIPcode":
              //console.log(event);
              break;
            case "SIPmsg":
              //console.log(event);
              break;
            otherwise:
              break;
          }
          
        }
         if(event.event=="Trying"||event.event=="Progressing"){
          console.log(event);
          if(event.event=="Progressing" && event.userdata!='(null)'){
            console.log("Dropping before answer...");
            t.hangup(event.channelname);
          }
        }
        
});

exports.index = function(req, res){
  res.render('didchecker', { title: 'Asterisk Dialer' })
  console.log("GET:INDEX");
};

exports.didchecker = function(req, res){
  res.render('didchecker', { title: 'DID Checker' })
  console.log("GET:DIDCHECKER");
};

exports.test = function(req, res){
  //res.render('index', { title: 'Express' })
  console.log("GET:TEST");
  res.send("GET:TEST - SUCCESS!!!");
};

exports.sendCalls = function(req, res){
	console.log("SENDCALLS")
	console.log(req.body);
  	var ANIBlock = req.body.ANIBlock
	, numCalls = req.param('NumCalls')
	, destination = req.param('Destination')
	, extension = req.param('Extension')
	, DTMF = req.param('DTMF')
	, DTMFDelay = req.param('DTMFDelay')
	, interval = req.param('Interval');
  
  res.json(req.body);
  
  //t.originate(channel, context, exten, priority, application, data, timeout, callerID, variable, account, async, codecs, function(error, response){  });

  console.log("GET:CALL")

};

exports.callDID = function(req, res) {

  //if(req.query){did = req.query.did;} else { did = req.param('did')}
  did = req.param('did');
  console.log(did);
  channel = "local/"+did;
  context = "dummy-exten";
  exten =  "100";
  priority = 1;
  callerID = '"Autodialer"<6026067001>';
  async = 1;
  application = null;
  data=null;
  timeout=null;
  variable = null;
  account=null;
  codecs=null;

  t.originate(channel, context, exten, priority, application, data, timeout, callerID, variable, account, async, codecs, function(error, response){ 
    if(error){ 
      console.log(error);
      res.send(error);
    } else {
      console.log(response);
      res.send(response);
    }
    
   });
  console.log("GET:CALLDID");
};

exports.listCommands = function(req, res){
 
  t.listCommands(function(error, response) {
    console.log(response);
    res.json(response);
  });
  console.log("GET:LISTCOMMANDS");

};

exports.listChannels = function(req, res){
 
  t.getActiveChannels(function(error, response) {
    console.log(response);
    res.json(response);
  });
  console.log("GET:LISTCHANNELS");

};

exports.areaList = function(req, res){
  
  response = [{"state": "NSW",
              "cca" : "CANBERRA",
               "numbers": 30000}]; 
  res.json(response);
  console.log("GET:areaList");

};
exports.stateList = function(req, res){
  
  //response = [{"item": "NSW","count": 30000}];
  theQuery = 'SELECT state as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas GROUP BY state';
  

  connection.query(theQuery, function(err, rows, fields){
    console.log(rows);
    if(rows){
      res.json(rows);
    } else {
      res.json([{"item": "ERR","count":0}]);
    }


  });
  
  console.log("GET:stateList");

};
exports.cityList = function(req, res){
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);
  //response = [{"item": "CANBERRA","count": 30000}];
  whereClause = "WHERE state = '" + req.query.state + "'";
  groupClause = "GROUP BY cca"; 
  theQuery = "SELECT cca as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas " + whereClause + " " + groupClause;
  console.log(theQuery);
  connection.query(theQuery, function(err, rows, fields){
    console.log(rows);
    if(rows){
      res.json(rows);
    } else {
      res.json([{"item": "ERR","count":0}]);
    }
    
  });
  console.log("GET:cityList");

};
exports.acList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE state = '" + req.query.state + "' AND cca = '" + req.query.city + "'";
  groupClause = "GROUP BY ac"; 
  theQuery = "SELECT ac as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas " + whereClause + " " + groupClause;
  connection.query(theQuery, function(err, rows, fields){
    console.log(rows);
    if(rows){
      res.json(rows);
    } else {
      res.json([{"item": "ERR","count":0}]);
    }

  });
  console.log("GET:acList");

};

exports.rangeList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE state = '" + req.query.state + "' AND cca = '" + req.query.city + "'";
  groupClause = "GROUP BY fullrange"; 
  theQuery = "SELECT fullrange as item, sum((rangeTo-rangeFrom)+1) as count FROM LeadMill.areas " + whereClause + " " + groupClause;
  connection.query(theQuery, function(err, rows, fields){
    console.log(rows);
    if(rows){
      res.json(rows);
    } else {
      res.json([{"item": "ERR","count":0}]);
    }

  });
  console.log("GET:rangeList");

};


exports.hubList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE d.status in (0,1)";
  groupClause = "GROUP by h.hub_id, h.hub_name"; 
  theQuery = "select h.hub_id as id, h.HUB_NAME as item, count(*) as count from did d inner join hub h on h.hub_id=d.hub_id " + whereClause + " " + groupClause;
  
  oracle.connect(connectData, function(err, connection) {
    if (err) { console.log("Error connecting to db:", err); return; }
    //hubQuery = 'select h.HUB_NAME as hub, count(*) as dids from did d inner join hub h on h.hub_id=d.hub_id group by h.hub_name';
    connection.execute(theQuery, [], function(err, results) {
        if (err) {
          console.log("Error executing query:", err);
          res.json([{"item": "ERR","count":0}]);
          return;
        }

        res.json(results);
        console.log(results);
        connection.close(); // call only when query is finished executing
    });
    
  });

  console.log("GET:hubList");

};

exports.didList = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  console.log(req.query);
  whereClause = "WHERE hub_id ='" + req.query.hub + "' AND status in (0,1)";
  groupClause = ""; 
  theQuery = "select did as item from did " + whereClause + " " + groupClause;
  console.log(theQuery);
  oracle.connect(connectData, function(err, connection) {
    if (err) { console.log("Error connecting to db:", err); return; }
    //hubQuery = 'select h.HUB_NAME as hub, count(*) as dids from did d inner join hub h on h.hub_id=d.hub_id group by h.hub_name';
    connection.execute(theQuery, [], function(err, results) {
        if (err) {
          console.log("Error executing query:", err);
          res.json([{"item": "ERR","count":0}]);
          return;
        }

        res.json(results);
        console.log(results);
        connection.close(); // call only when query is finished executing
    });
    
  });

  console.log("GET:didList");

};


exports.doRange = function(req, res){
  
  //response = [{"item": "07","count": 30000}]; 
  whereClause = "WHERE state = '" + req.query.state + "' AND cca = '" + req.query.city + "' AND fullrange = '" + req.query.range + "'";
  theQuery = "SELECT ac, rangefrom, rangeto FROM LeadMill.areas " + whereClause;
  connection.query(theQuery, function(err, rows, fields){
    console.log(rows);
    if(rows){
      res.json(rows);
      rows.forEach(genCalls);
    } else {
      res.json([{"item": "ERR","count":0}]);
    }

  });
  console.log("GET:doRange");

};

exports.procCall = function(vars){
    if(vars.agi_context=='outbound'){
      console.log("Call Hungup, gathering causes.");
      channel = vars.agi_channel;
      ani = vars.callerid;
      uniqueid = vars.agi_uniqueid;
      SIPcause = vars.agi_arg_1;
      SIPcode = vars.agi_arg_2;
      SIPmsg = vars.agi_arg_3;
      console.log("SIP Cause: " + SIPcause);
      console.log("SIP Code: " + SIPcode);
      console.log("SIP Message: " + SIPmsg);
      theQuery ="UPDATE didchecker.calldetail set sipcause='"+SIPcause+"', sipcode='"+SIPcode+"', sipmsg='"+SIPmsg+"', callend=now() WHERE uniqueid='"+uniqueid+"'";
      console.log(theQuery);
      connection.query(theQuery,function(err, res){
        if(err){console.log(err);}
        if(res){console.log(res);}
    })
      
    }
    if(vars.agi_context=='inbound'){
      console.log("Call hit LeaseHawk system, HOORAY!!!");
      ani = vars.agi_callerid;
      did = vars.agi_extension;
      theQuery ="UPDATE didchecker.calldetail set received=true WHERE did='"+did+"' AND ani='"+ani+"'";
      console.log(theQuery);
      connection.query(theQuery,function(err, res){
        if(err){console.log(err);}
        if(res){console.log(res);}
      })

    }

}