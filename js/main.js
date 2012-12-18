$(document).ready(init);

var appVersion = '0.0.4 unstable';
var stlLoadDialog = false;
var generateGCodeDialog = false;
var fileListURL = 'php/files.php';
var filesJSON;
var fileListOpen = false;
var activeModel;
var rotating = false;

function init() {
	// You may want to place these lines inside an onload handler
  	//CFInstall.check({
    //	mode: "inline", // the default
    //	node: "prompt"
  	//});
	
	loadFileList();
  	loadDefaultModel();
  	initFileDrop();			// Setup file drag and drop actions.
    
    // Disable mobile page scrolling
    $(document).bind('touchmove', function (e) { 
	    if (e.target === document.documentElement) {
	        e.preventDefault(); 
	    }
	});
  	
  	// UI Click Events
  	$('#viewer').bind('click', onViewerClick);
  	$('#stl-load').bind('keydown', onSTLURLKeyDown); 
  	$('#nav-download-stl').bind('click', onDownloadSTLButtonClick);
  	
  	// Display the current build information.
  	displayBuildInformation();
}


/**
 * Sets up the file drag and drop actions on the body of the page. 
 */
function initFileDrop() {
    $('body').filedrop({
	    fallback_id: 'upload_button',   // An identifier of a standard file input element
	    url: 'php/upload.php',         	// Upload handler, handles each file separately
	    paramname: 'userfile',          // POST parameter name used on serverside to reference file
	    data: { },
	    headers: {          			// Send additional request headers
	        'header': 'value'
	    },
	    error: function(err, file) {
	        switch(err) {
	            case 'BrowserNotSupported':
	                console.log('Browser does not support html5 drag and drop.');
	            break;
	            
	            case 'TooManyFiles':
	                console.log('You have attempted to upload too many files.')
	            break;
	            
	            case 'FileTooLarge':
	            	console.log('Selected file was too large to upload.')
	            break;
	            
	            default:
	            break;
	        }
	    },
	    maxfiles: 1,
	    maxfilesize: 20,    // Max file size in MBs
	    dragOver: function() {
	        console.log('Drag over #dropzone');
	        //$('body').css({"background-color":"#666666"});
	    },
	    dragLeave: function() {
	        //console.log('Drag leave #dropzone');
	        //$('body').css({"background-color":"#ffffff"});
	    },
	    docOver: function() {
	        //console.log('Drag over document');
	    },
	    docLeave: function() {
	        //console.log('Drag leave document');
	    },
	    drop: function() {
	        console.log('Drop!');
	       // $('body').css({"background-color":"#ffffff"});
	    },
	    uploadStarted: function(i, file, len){
	        // a file began uploading
	        // i = index => 0, 1, 2, 3, 4 etc
	        // file is the actual file of the index
	        // len = total files user dropped
	        console.log('Upload started!');
	        
	        //$("#progressbar").fadeIn();
	    },
	    uploadFinished: function(i, file, response, time) {
	        // response is the data you got back from server in JSON format.
	        console.log('Upload Finished! ' + response['location']);
	        
	        //$("#progressbar").fadeOut();
	        
	        loadFileList();
	        
	        $.getJSON('objects/' + response['location'] + '.json', function(data) {
	       		activeModel = response['location'];
				thingiview.loadArray(eval(data));
			});
	    },
	    progressUpdated: function(i, file, progress) {
	        // this function is used for large files and updates intermittently
	        // progress is the integer value of file being uploaded percentage to completion
	        console.log('progressUpdated: ' + progress);
	        //$("#progressbar").progressbar({ value:progress });
	    },
	    speedUpdated: function(i, file, speed) {
	        // speed in kb/s
	    },
	    rename: function(name) {
	        // name in string format
	        // must return alternate name as string
	    },
	    beforeEach: function(file) {
	        // file is a file object
	        // return false to cancel upload
	    },
	    afterAll: function() {
	        // runs after all files have been uploaded or otherwise dealt with
	    }
	});
}

function displayBuildInformation() {
	var div = document.createElement("div");
	div.style.position = "absolute";
	div.style.left = "10px";
	div.style.bottom = "5px";
	div.style.color = "white";
	div.style.zIndex = 10000;
	div.style.opacity = 0.3;
	div.innerHTML = "Build " + appVersion;
	
	document.body.appendChild(div);
}


function openGCodeFromText(gCode) {
  	object = createObjectFromGCode(gCode);
  	thingiview.removeObject();
  	thingiview.addObject(new THREE.Mesh(object, new THREE.MeshBasicMaterial({color:'0xffffff',wireframe:true})));
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
	  			html += '<tr><td><span class="filename">' + val + '</span></td><td><a class="btn btn-inverse load ' + key + '">Load Model</a></td></tr>';
	  		} else {
	  			val = val.split('.');
	  			val = val[0];
	  			html += '<tr><td><span class="filename" contenteditable>' + val + '</span></td><td><a class="btn btn-danger delete ' + key + '">Delete</a> <a class="btn btn-inverse load ' + key + '">Load Model</a></td></tr>';
	  		}
	  	});
	  	
	  	$('#file-list').html(html);
	  	$('#file-list .load').bind('click', onLoadSTLFromListButtonClick);
	  	$('#file-list .delete').bind('click', onNavSTLDeleteButtonClick);
	 });
}

function onDownloadSTLButtonClick(e) {
	if(activeModel == '') return;
	
	// Stip the JSON from filename.
	var filename = activeModel.split('.');
	
	// Download the STL 
	window.open('objects/' + filename[0] + '.stl', '_blank');
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
}



function onViewerClick(e) {
	//
}


function loadDefaultModel() {
	thingiview = new Thingiview("viewer");
  	//thingiview.setObjectColor('#C0D8F0');
  	thingiview.initScene();
  	// thingiview.setShowPlane(true);
  	
  	$.getJSON('objects/demo.json', function(data) {
  		activeModel = 'demo.json';
		thingiview.loadArray(eval(data));
	});
}


/**
 * Updates the selected models position in the properties sidebar.
 * 
 * @param	x:
 * @param	y:
 * @param	z: 
 */
function updateModelPositionProperties(x, y, z) {
	$('#model-properties .x-val').val(x);
	$('#model-properties .y-val').val(y);
	$('#model-properties .z-val').val(z);
}


/**
 * Updates the selected models scale in the properties sidebar.
 * 
 * @param	x:
 * @param	y:
 * @param	z: 
 */
function updateModelScaleProperties(x, y, z) {
	$('#model-properties .x-scale').val(x);
	$('#model-properties .y-scale').val(y);
	$('#model-properties .z-scale').val(z);
}
