$(document).ready(init);

var stlLoadDialog = false;
var generateGCodeDialog = false;
var fileListURL = 'php/files.php';
var filesJSON;
var fileListOpen = false;
var activeModel;
var rotating = false;

function init() {
	// You may want to place these lines inside an onload handler
  	CFInstall.check({
    	mode: "inline", // the default
    	node: "prompt"
  	});
	
	loadFileList();
  	loadDefaultModel();
  	
  	$(document).mousemove(function(e){
  		//console.log($(window).width());
  		//console.log(e.pageX);
  		if(!fileListOpen) {
  			if(e.pageX > $(window).width() - 50) {
      			showFileList();
      		}
      	}
      	
      	if(fileListOpen) {
      		if(e.pageX < $(window).width() - 510) {
      			hideFileList();
      		}
      	} else {
      		//hideFileList();
      	}
    }); 
  	
  	// UI Click Events
  	$('#viewer').bind('click', onViewerClick);
  	$('#controls #nav-stl-load').bind('click', onNavSTLLoadButtonClick);
  	$('#controls .rotation-button').bind('click', onControlsRotationButtonClick);
  	$('#stl-load').bind('keydown', onSTLURLKeyDown); 
  	$('#nav-generate-gcode').bind('click', onGenerateGCodeButtonClick);
  	$('#nav-download-stl').bind('click', onDownloadSTLButtonClick);
}

function onGenerateGCodeButtonClick(e) {
	generateGCodeDialog = true;
	$('#gcode-options').fadeIn(250);
}

function onControlsRotationButtonClick(e) {
	if(rotating) {
		rotating = false;
		$('#controls .rotation-button').html('ROTATION OFF');
		thingiview.setRotation(false);
	} else {
		rotating = true;
		$('#controls .rotation-button').html('ROTATION ON');
		thingiview.setRotation(true);
	}
}

function onNavSTLDeleteButtonClick(e) {
	var classnames = $(this).attr('class').split(' ');
	var filename = classnames[3];
	filename = filesJSON[filename].split('.');
	filename = filename[0];
	
	$.getJSON('php/delete.php?file=' + filename, function(data) {
		loadFileList();
		loadDefaultModel();
	});
}

function loadFileList() {
	$.getJSON(fileListURL, function(data) {
		filesJSON = data;
		var html = '';
	  	$.each(data, function(key, val) {
	  		// Place file into document.
	  		if(val == 'demo.json') {
	  			val = val.split('.');
	  			val = val[0];
	  			html += '<li><span class="filename">' + val + '</span> <a class="btn btn-inverse load ' + key + '">Load Model</a></li>';
	  		} else {
	  			val = val.split('.');
	  			val = val[0];
	  			html += '<li><span class="filename" contenteditable>' + val + '</span> <a class="btn btn-danger delete ' + key + '">Delete</a> <a class="btn btn-inverse load ' + key + '">Load Model</a></li>';
	  		}
	  	});
	  	
	  	$('#file-list').html(html);
	  	$('#file-list li .load').bind('click', onLoadSTLFromListButtonClick);
	  	$('#file-list li .delete').bind('click', onNavSTLDeleteButtonClick);
	  	
	  	/*
	  	$('#file-list li .filename').live('focus', function() {
			before = $(this).html();
		}).live('blur keyup paste', function() { 
		  	if (before != $(this).html()) { 
		  		$(this).trigger('change'); 
		  	}
		});
		
		$('#file-list li .filename').live('change', function() {console.log('changed')});
		*/
	 });
}

function onDownloadSTLButtonClick(e) {
	if(activeModel == '') return;
	
	// Stip the JSON from filename.
	var filename = activeModel.split('.');
	
	// Download the STL 
	window.open('objects/' + filename[0] + '.stl', '_blank');
}

function hideFileList() {
	fileListOpen = false;
	
	$('#file-selector').animate({
		right: '-510px'
	  }, 500, function() {
	    // Animation complete.
	    loadFileList();
	});
}

function showFileList() {
	 fileListOpen = true;
	 
	$('#file-selector').animate({
		right: '0px'
	  }, 500, function() {
	    // Animation complete.
		loadFileList();
	});
}

function onLoadSTLFromListButtonClick(e) {
	var classnames = $(this).attr('class').split(' ');
	var modelID = classnames[3];
	
	$.getJSON('objects/' + filesJSON[modelID], function(data) {
		activeModel = filesJSON[modelID];
		thingiview.loadArray(eval(data));
	});
	
	loadFileList();
}

function onSTLURLKeyDown(e) {
	url = $('#stl-url').val();
	
	if(e.which == 13) {
		if(validateURL(url)) {
			loadSTLURL(url);
		}
	}
}

function validateURL(textval) {
  var urlregex = new RegExp("^(http:\/\/www.|https:\/\/www.|ftp:\/\/www.|www.){1}([0-9A-Za-z]+\.)");
  return urlregex.test(textval);
}

function loadThingiverseURL(url) {
	console.log('Loading Model: ' + url);
	
	modelID = url.split(':');
	modelID = modelID[modelID.length - 1];
	
	thingiview.loadJSON("../php/json.php?file=http://thingiverse.com/download:" + modelID);
	stlLoadDialog = false;
	$('#thingiverse-load').hide();
}

function loadSTLURL(url) {
	console.log('Loading Model: ' + url);
	
	thingiview.loadJSON("../php/json.php?file=" + url);
	stlLoadDialog = false;
	$('#stl-load').hide();
}

function onControlsClick(e) {
	if(stlLoadDialog) $('#thingiverse-load').hide();
}

function onViewerClick(e) {
	if(generateGCodeDialog) $('#gcode-options').fadeOut(250);
	if(stlLoadDialog) $('#stl-load').fadeOut(250);
}

function onNavSTLLoadButtonClick(e) {
	stlLoadDialog = true;
	$('#stl-load').fadeIn(250); 
}

function loadDefaultModel() {
	thingiview = new Thingiview("viewer");
  	thingiview.setObjectColor('#C0D8F0');
  	thingiview.initScene();
  	// thingiview.setShowPlane(true);
  	
  	$.getJSON('objects/demo.json', function(data) {
  		activeModel = 'demo.json';
		thingiview.loadArray(eval(data));
	});
}
