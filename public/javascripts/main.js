/*! Carrier Simulator Interface logic file
* Written by: Justin Zimmer
* * ***********************/
$.ajaxSetup({ cache: false });
var statTimer = "";
var jsonChannels = [];

function sendCalls(){

	var ANIBlock = $('#txtANIBlock').val()
	, destination = $('#txtDestination').val()
	, numCalls = $('#txtNumCalls').val()
	, extension = $('#txtExtension').val()
	, DTMF = $('#txtDTMF').val()
	, DTMFDelay = $('#txtDTMFDelay').val()
	, interval = $('#txtInterval').val();

	var cmdJSON = {
		ANIBlock: ANIBlock,
		NumCalls: numCalls,
		Destination: destination,
		Extension: extension,
		DTMF: DTMF,
		DTMFDelay: DTMFDelay,
		interval: interval
	};

	$.ajax({
  		type: "POST",
  		url: "/sendCalls",
  		data: cmdJSON
	})
  	.done(function( msg ) {
    	console.log( "Data Saved: " + msg );
  	})
  	.fail(function( jqHR, textStatus ) {
    	console.log( "Failed: " + textStatus );
  	});

};

function makeCall(did){

  var cmdJSON = {
    did: did
  };

  $.ajax({
      type: "POST",
      url: "/callDID",
      data: cmdJSON,
      async: false
  })
    .done(function( msg ) {
      //alert(msg);
      console.log( msg[0].response + ": " + msg[0].message );
      if(!$("#msg"+did)) {
        $("#msgmanDID").text(msg[0].response + ": " + msg[0].message);  
      } else {
        $("#msg"+did).text(msg[0].response + ": " + msg[0].message);
      }
    })
    .fail(function( jqHR, textStatus ) {
      console.log( "Failed: " + textStatus );
    });
    //alert("outside ajax");

};

function abortCalls(){

	$.ajax({
  		type: "POST",
  		url: "/abortCalls",
  		data: { name: "John", location: "Boston" }
	})
  	.done(function( msg ) {
    	console.log( "Abort Successful: " + msg );
  	})
  	.fail(function( jqHR, textStatus ) {
    	console.log( "Failed: " + textStatus );
  	});

};

function listChannels(){
	console.log("listChannels()");
	$.ajax({
  		type: "GET",
  		url: "/listChannels",
  		data: { name: "John", location: "Boston" }
	})
  	.done(function( msg ) {
    	console.log( "Channels: " + msg );
  	})
  	.fail(function( jqHR, textStatus ) {
    	console.log( "Failed: " + textStatus );
  	});

};

function listCommands(){
	console.log("listCommands()");
	$.ajax({
  		type: "GET",
  		url: "/listCommands",
  		data: { name: "John", location: "Boston" }
	})
  	.done(function( msg ) {
    	console.log( "Commands: " + msg );
    	$('#dispChannels').html(msg.response.toString());
  	})
  	.fail(function( jqHR, textStatus ) {
    	console.log( "Failed: " + textStatus );
  	});

};

function didList(hub){
  console.log("didList('"+hub+"')");
  dispChannels = $("#dispChannels");
  dispChannels.empty();
  dispChannels.html("<table id='dids'></table>");
  dids = $("#dids");
  dids.append($("<tr/>").append($("<th />").text("DID")));
  $.ajax({
      type: "GET",
      url: "/didList",
      data: { hub: hub }
  })
    .done(function( results ) {
      console.log( "Results: " + results );

      $.each(results, function() {
      console.log(this);
      if (this.ITEM) {
        console.log("Upper Case");
        text = this.ITEM;
      } else {
        text = this.item;
      }
      dids.append($("<tr />").html("<td>"+text+'</td><td><button onclick="makeCall('+"'"+text+"'"+'); return false;">Call Me</button></td><td id="msg'+text+'"></td>'));
    });
      $("button").button();
      

    })
    .fail(function( jqHR, textStatus ) {
      console.log( "Failed: " + textStatus );
    });

};

function popLists(list){
  var theList = $("#"+list);
  theList.empty();
  theList.append($("<option/>").val("").text("Pick One!"));

  switch (list) {

    case "state":
      console.log("Building State List.");
      url = "stateList";
      data = {};
      break;
    case "hub":
      console.log("Building Hub List.");
      url = "hubList";
      data = {};
      break;      
    case "city":
      console.log("Building City List.");
      url = "cityList";
      data = {state: $("#state").val()};
      break;
    case "ac":
      console.log("Building AC List.");
      url = "acList";
      data = {state: $("#state").val(), city: $("#city").val()};
      break;
    case "range":
      console.log("Building Range List.");
      url = "rangeList";
      data = {state: $("#state").val(), city: $("#city").val()};
      break      
    default:
      console.log("Invalid option: " + list);
      return;
  }
  console.log(url);
  console.log(data);
  $.ajax({
    url: url,
    data: data,
    dataType: "json"
    })
  .done(function( result ) {
    //alert(msg);
    //console.log(msg);
    $.each(result, function() {
      console.log(this);
      if (this.ITEM) {
        console.log("Upper Case");
        if(this.ID) { value = this.ID }
        else { value = this.ITEM };
        text = this.ITEM + ": " + this.COUNT;
      } else {
        if(this.id) { value = this.id }
        else { value = this.item };
        text = this.item + ": " + this.count;
      }
      theList.append($("<option />").val(value).text(text));
    });

  })
  .fail(function(jqHR, textStatus) {
    return textStatus; 
  });

}

function doRange(){

  var state = $('#state').val()
  , city = $('#city').val()
  , range = $('#range').val();


  var cmdJSON = {
    state: state,
    city: city,
    range: range
  };

  $.ajax({
      url: "/doRange",
      data: cmdJSON
  })
    .done(function( msg ) {
      console.log( msg );
    })
    .fail(function( jqHR, textStatus ) {
      console.log( "Failed: " + textStatus );
    });

};