// Include required modules. 
var net = require('net');

// Create a TCP server and listen on FastAGI port. 
var server = net.createServer();
server.listen(4573, '127.0.0.7');

// Add a listener for new connections.
server.addListener('connection', fastAGI);

// An array to hold AGI variables submitted from Asterisk.
var agiVars = new Array();

// An array to hold the set of commands we want to send back to Asterisk.
var commands = new Array();

// Return value provided by Asterisk after AGI commands are executed.
var returnValue;

/******************************************************************************
 *	Asterisk AGI Commands.
 ******************************************************************************
 */

// Method to stream an audio file.
function streamFile(file, escapeDigits, offset) {
	var command = "STREAM FILE " + file + " \"" +  escapeDigits + "\"" ;
	if(typeof(offset) != 'undefined') { command += " " +  offset; }
	command += "\n";
	commands.push(command);
}

// Method to say a number.
function sayNumber(number, escapeDigits) {
	var command = "SAY NUMBER " + number + " \"" +  escapeDigits + "\"" + "\n" ;
	commands.push(command);
}

// Method to tell Asterisk to hangup the channel.
function hangup(channel) {
	var command = "HANGUP";
	if(typeof(channel) != 'undefined') { command += " " +  channel; }
	command += "\n";
	commands.push(command);
}

/******************************************************************************
 *	Helper methods.
 ******************************************************************************
 */

// Method to access AGI variables submitted from Asterisk.
function getagiVars(data) {
	var values = data.toString().split("\n");
	for(i=1; i < values.length; i++) {
		var temp = values[i].split(":");
		agiVars[temp[0]] = temp[1];
	}
}

// Method to extract the return value from Asterisk response.
function getReturnValue(data) {
	returnValue = data.substr((data.indexOf("=")+1),1);
}

// Method to prepare the response before sending commands to Asterisk
// Call before stream.write(). 
function prepareResponse() {
	commands.reverse();
}

// Method to render commands one at a time from the commands array.
function renderCommands() {
	return commands.pop();
}

// Prototype method to create size property for agiVars array.
Array.prototype.size = function () {
	var size = this.length ? --this.length : -1;
		for (var item in this) {
			size++;
		}
	return size;
}

// Method to execute AGI logic.
function fastAGI(stream) {
  
  stream.setEncoding('utf8');
  
  stream.addListener('connect', function() {
  	console.log("Got a connection from Asterisk!");
  });
  
  stream.addListener('data', function(data) {
  
  	// When Asterisk starts the AGI script, it will pass channel variables.
  	if(!agiVars.size()) {
  	
	  	// Populate agiVars array.
	  	getagiVars(data);
		
		// Write some debug output.
		console.log("Getting a call from: " + agiVars["agi_calleridname"]);
		
		// Set up the commands to send back to Asterisk, populate the commands array.
		//streamFile("hello-world", "#");
		//streamFile("tt-monkeys", "#");
		//streamFile("goodbye", "#");
		//hangup();
		
		//lookup the dialed number and update table with time and positive receipt.
		lookup = agiVars["agi_extension"];
		//***** Do some stuff here to update didchecker table


		// Prepare the response (just reverses the commands array).		  	
		prepareResponse();
		
		// Start sending commands.
		stream.write(renderCommands());
  	
  	} 
  	
  	// With subsequent responses, Asterisk will send a response code with return value.
  	else {
  	
  		// Check the return value from Asterisk.
  		getReturnValue(data);
  		
  		// After we tell Asterisk to streak audio files, we get a 0 return.
  		if(returnValue == 0) {
  			stream.write(renderCommands()); // Send the next command.
  		}
  		// After we tell Asterisk to hangup, we get a 1 return.
  		else {
  			stream.end();
  		}
  	
  	}
	
  });

  // We don't see this event until we call stream.end().
  stream.addListener('end', function() {
  	console.log("Goodbye Asterisk.");
  	agiVars = new Array();
  	commands = new Array();
  });
  
  stream.addListener('error', function() {
    stream.end();
  });

}