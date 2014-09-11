/*! Carrier Simulator Interface logic file
* Written by: Justin Zimmer
* * ***********************/
$.ajaxSetup({ cache: false });
var statTimer = "";
var jsonChannels = [];
var theDIDs = [];
var progressbar = [];
var progressLabel = [];
var dialog = [];
var chanInterval = null;
var progressBar = function()
  {
    var xhr = new window.XMLHttpRequest();
    doSpinner(true);
    //doDialog("open");
    //progressbar.progressbar("value",false);
    //Upload progress

    xhr.upload.addEventListener("progress", function(evt){
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        //Do something with upload progress
        console.log('Upload Progress: %d',percentComplete);
        //progress(percentComplete*100);
      }
    }, false);
    //Download progress
    xhr.addEventListener("progress", function(evt){
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        //Do something with download progress
        console.log('Download Progress: %d',percentComplete);
        //progress(percentComplete*100);
      }
    }, false);
    xhr.addEventListener("load", function(evt){
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        //Do something with download progress
       console.log('Loaded: %d',percentComplete);
        //progress(percentComplete*100);
        //doDialog("close");
        doSpinner(false);
        
      }
    }, false);    
    xhr.addEventListener("error", function(evt){
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        //Do something with download progress
        console.log('Error: %d',percentComplete);
        //progress(100);
      }
    }, false);  
    xhr.addEventListener("abort", function(evt){
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        //Do something with download progress
        console.log('Aborted: %d',percentComplete);
        //progress(100);
      }
    }, false);  

     //success: doDialog("close")
    return xhr;
  }
 
function doSpinner(state){
  var opts = {
    lines: 13, // The number of lines to draw
    length: 40, // The length of each line
    width: 30, // The line thickness
    radius: 60, // The radius of the inner circle
    corners: 0.5, // Corner roundness (0..1)
    rotate: 53, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#fff', // #rgb or #rrggbb or array of colors
    speed: 1.3, // Rounds per second
    trail: 100, // Afterglow percentage
    shadow: true, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };
  if(state){
    overlay("overlay",true);
    $("#spinner").spin(opts);
  } else {
    overlay("overlay",false);
    $("#spinner").spin(false);
  }
}

function overlay(element,state){
  
  if(state){
    $("#"+element).css("display", "block");
    $("#"+element).height($(window).height());
    $("#"+element).width($(window).width());
    $("#"+element).fadeTo(1000, 0.4);
  } else {
    $("#"+element).fadeTo(1000, 0);
    $("#"+element).css("display", "none");
  }

}

function doDialog(state){
    dialog.dialog(state);
 }

function progress(value) {
      console.log(value);
      progressbar.progressbar( "value", value );
 
 }

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

function hangChan(channel) {
  var cmdJSON = {
    channel: channel
  };

  $.ajax({
      type: "POST",
      url: "/hangChan",
      data: cmdJSON,
      async: false
     
  })
    .done(function( msg ) {
      //alert(msg);
      console.log( msg[0].response + ": " + msg[0].message );
    })
    .fail(function( jqHR, textStatus ) {
      console.log( "Failed: " + textStatus );
    });

}

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
  		data: { name: "John", location: "Boston" },
      //xhr: progressBar
	})
  	.done(function( msg ) {
    	console.log( msg );
      fillChanList( msg );
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
  		data: { name: "John", location: "Boston" },
      xhr: progressBar
	})
  	.done(function( msg ) {
    	console.log( "Commands: " + msg );
    	$('#dispChannels').html(msg.response.toString());
  	})
  	.fail(function( jqHR, textStatus ) {
    	console.log( "Failed: " + textStatus );
  	});
};

function didList(type, id){
  theDIDs = [];
  //didTable.ajax.url( '/didList?hub='+hub ).load();
  //progressbar.progressbar({value: false});
  //dialog.dialog("open");
  $.ajax({
      type: "GET",
      url: "/didList",
      data: { 
              type: type,
              id: id
             },
      xhr: progressBar

  })
    .done(function( results ) {
      console.log( "Results: " + results );
      theDIDs = results;
      console.log(results);
      fillDIDList(theDIDs);
      

    })
    .fail(function( jqHR, textStatus ) {
      console.log( "Failed: " + textStatus );
    });

};

function fillDIDList(list){
  //console.log("FillDIDList");
  //console.log(list);
  counter = 0
  didTable.clear();
  $.each(list, function() {
    //if(counter<100){
    //console.log(this);
    if (this.ITEM) {
      //console.log("Upper Case");
      text = this.ITEM;
    } else {
      text = this.item;
    }
    callButton = '<button onclick="makeCall('+"'"+text+"'"+'); return false;">Call Me</button>';
    msgSpan = '<span id="msg' + text + '"></span>';
    iconSpan = '<img id="icon' + text + '" src="images/select.png" style="display:none; height:50%;">';
    //dids.append($("<tr />").html("<td>"+text+'</td><td>'+callButton+'</td><td>'+msgSpan+'</td>'));
   
    didRow = {
      "0": text,
      "1": callButton,
      "2": msgSpan,
      "3": iconSpan
    };
    //console.log(didRow);
    didTable.row.add(didRow).draw();
    //}    
    counter++;
  });
  //$("button").button();
}

function fillChanList(list){
  //console.log("FillChanList");
  //console.log(list);
  counter = 0
  chanTable.clear().draw();
  $.each(list, function() {
    if(this.event && this.channel){
      if(this.context == "default" && this.application != ""){
        //console.log(this);
        hangButton = '<button onclick="hangChan('+"'"+this.channel+"'"+'); return false;">Hangup</button>';
        chanRow = {
          "0": this.extension,
          "1": this.calleridnum,
          "2": this.channel,
          "3": this.channelstatedesc,
          "4": this.duration,
          "5": hangButton
        };
        //console.log(chanRow);
        chanTable.row.add(chanRow).draw();
        counter++;
      }
    }
  });
  //$("button").button();
}

function popLists(list){
  var theList = $("#"+list);
  theList.empty();
  theList.append("<option value='' selected='selected'>Pick One!</option>");

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
    dataType: "json",
    xhr: progressBar
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

function callDIDs(list){
  console.log(list);
  var cmdJSON = {
    didList: list    
  };

  $.ajax({
      type: "POST",
      url: "/callDIDs",
      data: cmdJSON,
      xhr: progressBar
  })
    .done(function( msg ) {
      console.log( msg );
    })
    .fail(function( jqHR, textStatus ) {
      console.log( "Failed: " + textStatus );
    });

};

function uploadDIDs(){
  theDIDs = [];
  //adata = new FormData($("form")[0]);
  data = new FormData($("#didUpload")[0]);
  //console.log(adata);
  console.log(data);
  $.ajax({
      url: '/didUpload',  //Server script to process data
      type: 'POST',
      xhr: progressBar,
      //Ajax events
      //beforeSend: beforeSendHandler,
      //success: completeHandler,
      //error: errorHandler,
      // Form data
      data: data,
      //Options to tell jQuery not to process data or worry about content-type.
      cache: false,
      contentType: false,
      processData: false
  })
    .done(function( res ){
      //console.log( res );
      theDIDs = res;
      //console.log(theDIDs);
      fillDIDList(theDIDs);
    })
    .fail(function( jqHR, textStatus ) {
      console.log( "Failed: " + textStatus );
    });
/*  xhr: function() {  // Custom XMLHttpRequest
          var myXhr = $.ajaxSettings.xhr();
          if(myXhr.upload){ // Check if upload property exists
              myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
          }
          return myXhr;
      }*/

}

function progressHandlingFunction(e){
    if(e.lengthComputable){
      console.log("%d of %d",e.loaded, e.total);
        $('progress').attr({value:e.loaded,max:e.total});
    }
}