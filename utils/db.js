var params = require('../params.json');
//logger.log('silly',params.database.mysql);
var database = params.database;
var logger = require('../utils/logger.js');

if (database.mysql) {
  var mysql = require('mysql');
  /* var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'leadmill',
    password : 'leadmill'
  }); */

  var connMySQL = mysql.createConnection({
    host     : database.mysql.host,
    user     : database.mysql.user,
    password : database.mysql.password,
    database : database.mysql.database
  });
}

if (database.oracle) {

  var oracle = require('oracle');

  //var connString = "(DESCRIPTION =(ADDRESS_LIST =(ADDRESS = (PROTOCOL = TCP)(HOST = lva1doradev90.cvdsxiegyd4k.us-east-1.rds.amazonaws.com)(PORT = 1521)))(CONNECT_DATA =(SID = LEGACYDB)))";
  var connectData = {
      "tns": database.oracle.tns,
      "user": database.oracle.user,
      "password": database.oracle.password
  }; 


/* var connectData = {
    hostname: "lva1doradev90.cvdsxiegyd4k.us-east-1.rds.amazonaws.com",
    port: 1521,
    sid: "legacydb", // System ID (SID)
    user: "apricot",
    password: "apri-cot"
}; */ 

  oracle.connect(connectData, function(err, connection) {
      if (err) { logger.log('silly',"Error connecting to db:", err); return; }
      connection.execute("SELECT systimestamp FROM dual", [], function(err, results) {
          if (err) { logger.log('silly',"Error executing query:", err); return; }

          logger.log('silly',results);
          connection.close(); // call only when query is finished executing
      });

  });
}

exports.query = function(query, conn, cb){

  switch (conn.toUpperCase()) {
  	case "MYSQL":
  		if(!connMySQL){
  			return cb(new Error('No MySQL database is configured for this instance.'));
  			break;
  		} else {
  	  		connMySQL.query(query, function(err, rows, fields) {
    			if (err) {
	      			//throw err;
      				return cb(err);
    			} else {
				    logger.log('silly','Query successful: ', rows);
      				return cb(null,rows);
		    	}
  			});
  		}
  		break;
  	case "ORACLE":
  		if(!oracle) {
  			return cb(new Error('No Oracle database is configured for this instance.'));
  			break;
  		} else {
	  		oracle.connect(connectData, function(err, connection) {
	      		if (err) { 
	      			logger.log('silly',"Error connecting to db:", err); 
	      			return cb(err); 
	      		}
	      		connection.execute(query, [], function(err, rows) {
	          		if (err) {
	          			logger.log('silly',"Error executing query:", err);
	          			return cb(err);
	          		} else {
				        logger.log('silly',rows);
				        return cb(null,rows);
	          		}	
	          		connection.close(); // call only when query is finished executing
	      		});

	  		});
  		}
  		break;
  	default:
  		return cb(new Error('There is no support for that database at this time.'));
  		break;
  }


}