Thingiview = function(containerId) {
	scope = this;
  
  	this.containerId = containerId;
  	var container					= document.getElementById(containerId);
  	var camera						= null;
	var scene						= null;
  	var renderer					= null;
  	
  	var object						= null;
  	var objects = [];
  	
  	var plane						= null;
  	var controls					= null;
  	var ambientLight				= null;
  	var frontLight					= null;
  	var backLight		 			= null;
  	var projector;
  	var targetXRotation				= 0;
  	var targetXRotationOnMouseDown	= 0;
  	var mouseX						= 0;
  	var mouseXOnMouseDown			= 0;
  	var mouseXpan					= 0;
  	var mouseYpan					= 0;
  	var mouseDownRightButton		= false;
  	var targetYRotation             = 0;
  	var targetYRotationOnMouseDown  = 0;
  	var mouseY                      = 0;
  	var mouseYOnMouseDown           = 0;
  	var mouseDown                  	= false;
  	var mouseOver                  	= false; 
  	var windowHalfX 				= window.innerWidth / 2;
  	var windowHalfY 				= window.innerHeight / 2
  	var view         				= null;
  	var infoMessage  				= null;
  	//var progressBar  				= null;
  	//var alertBox     				= null;
  	var timer        				= null;
  	var rotateTimer    				= null;
  	var rotateListener 				= null;
  	var wasRotating    				= null;
  	
  	var cameraView 			= 'iso';
  	var cameraZoom 			= 0;
  	var rotate 				= false;
  	var backgroundColor 	= '#606060';
  	var objectMaterial 		= 'solid';
  	var objectColor 		= 0xC0D8F0;
  	var showPlane 			= true;
  	var isWebGl 			= false;

  	if (document.defaultView && document.defaultView.getComputedStyle) {
    	var width  = parseFloat(document.defaultView.getComputedStyle(container, null).getPropertyValue('width'));
    	var height = parseFloat(document.defaultView.getComputedStyle(container, null).getPropertyValue('height'));  
  	} else {
    	var width  = parseFloat(container.currentStyle.width);
    	var height = parseFloat(container.currentStyle.height);
  	}

  	var geometry;
  	var testCanvas;

	/**
	 * Returns a refernce to the active scene. 
	 */
	this.getScene = function() { return scene; }
	
	/**
	 * Returns a refernce to the active projector. 
	 */
	this.getProjector = function() { return projector; }
	
	/**
	 * Returns a reference to the active camera. 
	 */
	this.getCamera = function() { return camera; }
	
	/**
	 * Returns a refernce to the active objects. 
	 */
	this.getObjects = function() { return objects; }
	
	/**
	 * Returns a reference to the active plane. 
	 */
	this.getPlane = function() { return plane; }
	
	/**
	 * Returns a refernce to the active controls. 
	 */
	this.getControls = function() { return controls; }
	
	/**
	 * Levels an object on the build platform (aka. the plane). 
	 */
	this.levelObject = function() {
		// Loop over all the active objects
		for(var i = 0; i < objects.length; i++) {
			var obj = objects[i];
			obj.position.z = 0; // Reposition on the Z axis
		}
	}
	
	this.removeObject = function() {
		scene.remove(object);
	}
	this.addObject = function(obj) {
		scene.remove(object);
		object = obj;
		scene.add(object);
	}

  	this.initScene = function() {
    	container.style.position = 'relative';
    	container.innerHTML = '';
    
	    var fov    = 45,
	        aspect = width / height,
	        near   = 10,
	        far    = 100000;
        
        // Camera
	    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	    
	    // Scene
	  	scene  = new THREE.Scene();
		
		// Lighting
	    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
	    directionalLight.position.x = 1;
	    directionalLight.position.y = 5;
	    directionalLight.position.z = 2;
	    directionalLight.position.normalize();
	    scene.add(directionalLight);
	    
	    directionalLightBack = new THREE.DirectionalLight(0xFFFFFF, 1);
	    directionalLightBack.position.x = -5;
	    directionalLightBack.position.y = 1;
	    directionalLightBack.position.z = 2;
	    directionalLightBack.position.normalize();
	    scene.add(directionalLightBack);
		
	    pointLight = new THREE.PointLight(0xffffff, 1);
	    pointLight.position.x = 0;
	    pointLight.position.y = 15;
	    pointLight.position.z = 0;
	   	scene.add(pointLight);
	
		// Load plane (print bed)
	    if(showPlane) loadPlaneGeometry();
	    
	    projector = new THREE.Projector();
	    
	    //this.setCameraView(cameraView);
	    this.setObjectMaterial(objectMaterial);
	
	    // Check for WebGL compatibility
	    testCanvas = document.createElement('canvas');
	    try {
	    	if (testCanvas.getContext('experimental-webgl')) {
	      		log("Passed WebGL detection!");
	        	isWebGl = true;
	        	
	        	renderer = new THREE.WebGLRenderer({antialias: true});
	        	renderer.gammaOutput = true;
	        	
	        	// renderer = new THREE.CanvasRenderer();
	      	} else {
	        	renderer = new THREE.CanvasRenderer();
	        	log("Failed WebGL detection!");
	      	}
	    } catch(e) {
	      	renderer = new THREE.CanvasRenderer();
	      	log("Failed WebGL detection!");
	    }
	
	    renderer.setSize(width, height);
	    renderer.domElement.style.backgroundColor = backgroundColor;
	  	container.appendChild(renderer.domElement);
	
		// Stats
	    stats = new Stats();
	    stats.setMode(0);
	    stats.domElement.style.position  = 'absolute';
	    stats.domElement.style.top       = '0px';
	    container.appendChild(stats.domElement);
	    
	    // Controls
	    controls = new THREE.ModelControls(this, camera, renderer.domElement);
	    controls.zoomSpeed = 0.08;
	    controls.dynamicDampingFactor = 0.40;
	
		// Use THREEx to monitor the window resize events and update the renderer
		THREEx.WindowResize(renderer, camera);
		
		// Set the initial rotation and camera angles.
		scope.setRotation(rotate);
		scope.centerCamera();
	
	    // Render Scene
	    setInterval( function () {
		    stats.begin();	// https://github.com/mrdoob/stats.js/
		    sceneLoop();
			stats.end();
		}, 1000 / 60 );
	}

	/**
	 * 
	 */
  	function sceneLoop() {
    	if (object) {
			object.updateMatrix();
	      
	      	if (showPlane) {
	        	plane.updateMatrix();
	      	}
	
	      	controls.update();
	    	renderer.render(scene, camera);
        }

    	//requestAnimationFrame(sceneLoop); // And repeat...
  	}
  	
  	/**
  	 * Rotates a specified object on a specified axis.
  	 * 
  	 * @param	object:
  	 * @param	axis:
  	 * @param	radians: 
  	 */
	this.rotateObjectOnAxis = function rotateAroundObjectAxis(object, axis, radians) {
	    var rotObjectMatrix = new THREE.Matrix4();
	    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
	    object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
	    object.rotation.setEulerFromRotationMatrix(object.matrix);
	}

  
  	this.rotateLoop = function() {
  		console.log('rotating');
    	// targetRotation += 0.01;
    	targetXRotation += 0.05;
    	//sceneLoop();
  	}

  
  	this.getShowPlane = function(){
    	return showPlane;
  	}


  	this.setShowPlane = function(show) {
	    showPlane = show;
	    
	    if (show) {
	      	if (scene && !plane) {
	        	loadPlaneGeometry();
	      	}
	     	plane.material[0].opacity = 1;
	      	// plane.updateMatrix();
	    } else {
	      	if (scene && plane) {
	        	// alert(plane.material[0].opacity);
	        	plane.material[0].opacity = 0;
	        	// plane.updateMatrix();
	      	}
    	}
    }


  	this.getRotation = function() {
    	return rotateTimer !== null;
  	}
  	

  	this.setRotation = function(rot) {
	    rotate = rot;
	    
	    if (rotate) {
	      	clearInterval(rotateTimer);
	      	rotateTimer = setInterval(this.rotateLoop, 1000/60);
	    } else {
	      	clearInterval(rotateTimer);
	      	rotateTimer = null;
	    }
	
	    scope.onSetRotation();
  	}


  	this.onSetRotation = function(callback) {
    	if(callback === undefined){
      		if(rotateListener !== null){
        		try{
          			rotateListener(scope.getRotation());
        		} catch(ignored) {}
      		}
    	} else {
      		rotateListener = callback;
    	}
  	}

  	
  	this.setCameraView = function(dir) {  }
  	this.setCameraZoom = function(factor) {  }

  	this.getObjectMaterial = function() {
    	return objectMaterial;
  	}

  	this.setObjectMaterial = function(type) {
    	objectMaterial = type;
    	loadObjectGeometry();
  	}

  	this.setBackgroundColor = function(color) {
    	backgroundColor = color
    
    	if (renderer) renderer.domElement.style.backgroundColor = color;
  	}

  	this.setObjectColor = function(color) {
    	objectColor = parseInt(color.replace(/\#/g, ''), 16); 
    	loadObjectGeometry();
  	}

  	this.loadSTL = function(url) {
    	scope.newWorker('loadSTL', url);
  	}

  	this.loadOBJ = function(url) {
    	scope.newWorker('loadOBJ', url);
  	}
  
  	this.loadSTLString = function(STLString) {
    	scope.newWorker('loadSTLString', STLString);
  	}
  
  	this.loadSTLBinary = function(STLBinary) {
    	scope.newWorker('loadSTLBinary', STLBinary);
  	}
  
  	this.loadOBJString = function(OBJString) {
    	scope.newWorker('loadOBJString', OBJString);
  	}

  	this.loadJSON = function(url) {
    	scope.newWorker('loadJSON', url);
  	}
  
  	this.centerModel = function() {
    	if (geometry){
      		scope.updateMetadata();
      
      		var m = new THREE.Matrix4();
      		m.makeTranslation(-geometry.center.x, -geometry.center.y, -geometry.boundingBox.min.z);
      		geometry.applyMatrix(m);

      		scope.updateMetadata();
    	}
  	}
  
  	this.updateMetadata = function() {
    	geometry.computeBoundingBox();
    	geometry.computeBoundingSphere();

	    //console.log(geometry.boundingBox.min);
	    //console.log(geometry.boundingBox.max);

	    geometry.bounds = new THREE.Vector3(
	      	geometry.boundingBox.max.x - geometry.boundingBox.min.x,
	      	geometry.boundingBox.max.y - geometry.boundingBox.min.y,
	      	geometry.boundingBox.max.z - geometry.boundingBox.min.z
	    );
	    //console.log(geometry.bounds);
	    
	    geometry.center = new THREE.Vector3(
		      (geometry.boundingBox.max.x + geometry.boundingBox.min.x)/2,
		      (geometry.boundingBox.max.y + geometry.boundingBox.min.y)/2,
		      (geometry.boundingBox.max.z + geometry.boundingBox.min.z)/2
	    );
	    //console.log(geometry.center);    
  	}

  	this.centerCamera = function() {
	    if (geometry) { 
	      	scope.updateMetadata();
	      
	      	// set camera position outside and above our object.
	      	distance = geometry.boundingSphere.radius / Math.sin((camera.fov/2) * (Math.PI / 180));
	      	camera.position.x = 0;
	      	camera.position.y = -distance;
	      	camera.position.z = distance;
	
	      	//todo: how to control where it looks at!
	      	//camera.lookAt(new THREE.Vector3(0, 0, geometry.center.z));
	      	//camera.updateProjectionMatrix()
	
	      	//our directional light is out in space
	      	directionalLight.x = geometry.boundingBox.min.x * 2;
	      	directionalLight.y = geometry.boundingBox.min.y * 2;
	      	directionalLight.z = geometry.boundingBox.max.z * 2;
	
	      	//our point light is straight above.
	      	pointLight.x = geometry.center.x;
	     	pointLight.y = geometry.center.y;
	      	pointLight.z = geometry.boundingBox.max.z * 2;
	    } else {
	      	// set to any valid position so it doesn't fail before geometry is available
	      	camera.position.y = -70;
	      	camera.position.z = 70;
			//camera.target.z = 0;
	    }
  	}

  	this.loadArray = function(array) {
	    log("Loading JSON STL data...");
	    
	    geometry = new STLGeometry(array);
	    loadObjectGeometry();
    
	    //scope.setRotation(rotate);
	    //scope.centerCamera();
	    
	    log("Finished loading " + geometry.faces.length + " faces from STL model.");
  	}

  
  	this.newWorker = function(cmd, param) {
    	scope.setRotation(rotate);
  	
    	var worker = new WorkerFacade('js/thingiloader.js');
    
	    worker.onmessage = function(event) {
		      if (event.data.status == "complete") {
			        // scene.removeObject(object);
			        geometry = new STLGeometry(event.data.content);
			        loadObjectGeometry();
			        scope.setRotation(rotate);
			
			        log("finished loading " + geometry.faces.length + " faces.");
			        //thingiview.setCameraView(cameraView);
			        scope.centerCamera();
		      } else if (event.data.status == "complete_points") {
			        geometry = new THREE.Geometry();
			
			        var material = new THREE.ParticleBasicMaterial( { color: 0xff0000, opacity: 1 } );
			
			
			        // material = new THREE.ParticleBasicMaterial( { size: 35, sizeAttenuation: false} );
			        // material.color.setHSV( 1.0, 0.2, 0.8 );
			        
			        for (i in event.data.content[0]) {
			        // for (var i=0; i<10; i++) {
			          vector = new THREE.Vector3( event.data.content[0][i][0], event.data.content[0][i][1], event.data.content[0][i][2] );
			          geometry.vertices.push( vector );
			        }
			
			        particles = new THREE.ParticleSystem( geometry, material );
			        particles.sortParticles = true;
			        particles.updateMatrix();
			        scene.add(particles);
			                                
			        controls.update();
			        renderer.render(scene, camera);
			        
			        scope.setRotation(false);
			        //scope.setRotation(true);
			        log("Finished loading " + event.data.content[0].length + " points.");
			        // scope.centerCamera();
		      } else if (event.data.status == "progress") {
		        	log(event.data.content);
		      } else if (event.data.status == "message") {
		        	log(event.data.content);
		      } else if (event.data.status == "alert") {
		        	scope.displayAlert(event.data.content);
		      } else {
			        alert('Error: ' + event.data);
			        log('Unknown Worker Message: ' + event.data);
		      }
	    }

    	worker.onerror = function(error) {
      		log(error);
      		error.preventDefault();
    	}

   	 	worker.postMessage({'cmd':cmd, 'param':param});
  	}

	
	/**
	 * Creates the plane aka. the print bed.
	 * 
	 * Note: 600px x 600px = 8"x8"
	 */
  	function loadPlaneGeometry() {
  		// Working plane
  		plane = new THREE.Mesh( new THREE.PlaneGeometry( 840, 450, 100, 100 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
		plane.visible = false;
		scene.add(plane);
		
		// The visible print bed.
		var visiblePlane = new Grid(840, 450, 10, new THREE.LineBasicMaterial({ color:0x111111, linewidth:1 }));
  		scene.add(visiblePlane);
  	}


  	function loadObjectGeometry() {
    	if (scene && geometry) {
      		if (objectMaterial == 'wireframe') {
        		// material = new THREE.MeshColorStrokeMaterial(objectColor, 1, 1);
        		material = new THREE.MeshBasicMaterial({ color:objectColor, wireframe:true });
	      	} else {
	        	if (isWebGl) {
	          		material = new THREE.MeshPhongMaterial({ color:objectColor });
		          	// material = new THREE.MeshColorFillMaterial(objectColor);
		          	// material = new THREE.MeshLambertMaterial({color:objectColor});
		          	//material = new THREE.MeshLambertMaterial({color:objectColor, shading: THREE.FlatShading});
	        	} else {
	          		//material = new THREE.MeshLambertMaterial({color:objectColor, shading: THREE.FlatShading});
	          		// material = new THREE.MeshColorFillMaterial(objectColor);
	          		material = new THREE.MeshLambertMaterial({color:objectColor, shading: THREE.FlatShading, wireframe:false, overdraw:true});
	        	}
	      	}
	
	      	object = new THREE.Mesh(geometry, material);
	  		scene.add(object);
	  		
	  		objects.push(object); // Add to the list of active objects
	  		
	       	if (objectMaterial != 'wireframe') {
	       	 	object.overdraw = true;
	        	object.doubleSided = true;
	      	}
	      
	      	object.updateMatrix();
	    
	      	targetXRotation = 0;
	      	targetYRotation = 0;
	
	      	//sceneLoop();
	    }
  	}

};

var STLGeometry = function(stlArray) {
  	// log("building geometry...");
	THREE.Geometry.call(this);

	var scope = this;

	// var vertexes = stlArray[0];
	// var normals  = stlArray[1];
  	// var faces    = stlArray[2];

  	for (var i=0; i<stlArray[0].length; i++) {    
    	v(stlArray[0][i][0], stlArray[0][i][1], stlArray[0][i][2]);
  	}

  	for (var i=0; i<stlArray[1].length; i++) {
    	f3(stlArray[1][i][0], stlArray[1][i][1], stlArray[1][i][2]);
  	}

  	function v(x, y, z) {
    	// log("adding vertex: " + x + "," + y + "," + z);
    	scope.vertices.push( new THREE.Vector3( x, y, z )  );
  	}

  	function f3(a, b, c) {
    	// log("adding face: " + a + "," + b + "," + c)
    	scope.faces.push( new THREE.Face3( a, b, c ) );
  	}

  	// log("computing centroids...");
  	this.computeCentroids();
 	// log("computing normals...");
  	// this.computeNormals();
	this.computeFaceNormals();
	//this.sortFacesByMaterial();
  	// log("finished building geometry");
}

STLGeometry.prototype = new THREE.Geometry();
STLGeometry.prototype.constructor = STLGeometry;

function log(msg) {
  	if (this.console) {
    	console.log(msg);
  	}
}



/* A facade for the Web Worker API that fakes it in case it's missing. 
Good when web workers aren't supported in the browser, but it's still fast enough, so execution doesn't hang too badly (e.g. Opera 10.5).
By Stefan Wehrmeyer, licensed under MIT
*/

var WorkerFacade;
if(!!window.Worker){
	WorkerFacade = (function(){
    	return function(path){
        	return new window.Worker(path);
        };
    }( ));
} else {
    WorkerFacade = (function(){
        var workers = {}, masters = {}, loaded = false;
        var that = function(path){
            var theworker = {}, loaded = false, callings = [];
            theworker.postToWorkerFunction = function(args){
                try{
                    workers[path]({"data":args});
                }catch(err){
                    theworker.onerror(err);
                }
            };
            theworker.postMessage = function(params){
                if(!loaded){
                    callings.push(params);
                    return;
                }
                theworker.postToWorkerFunction(params);
            };
            masters[path] = theworker;
            var scr = document.createElement("SCRIPT");
            scr.src = path;
            scr.type = "text/javascript";
            scr.onload = function(){
                loaded = true;
                while(callings.length > 0){
                    theworker.postToWorkerFunction(callings[0]);
                    callings.shift();
                }
            };
            document.body.appendChild(scr);
            
            var binaryscr = document.createElement("SCRIPT");
            binaryscr.src = 'js/binaryReader.js';
            binaryscr.type = "text/javascript";
            document.body.appendChild(binaryscr);
            
            return theworker;
        };
        that.fake = true;
        that.add = function(pth, worker){
            workers[pth] = worker;
            return function(param){
                masters[pth].onmessage({"data": param});
            };
        };
        that.toString = function(){
            return "FakeWorker('"+path+"')";
        };
        return that;
    }());
}

/* Then just use WorkerFacade instead of Worker (or alias it)

The Worker code must should use a custom function (name it how you want) instead of postMessage.
Put this at the end of the Worker:

	if(typeof(window) === "undefined"){
	    onmessage = nameOfWorkerFunction;
	    customPostMessage = postMessage;
	} else {
	    customPostMessage = WorkerFacade.add("path/to/thisworker.js", nameOfWorkerFunction);
	}
*/