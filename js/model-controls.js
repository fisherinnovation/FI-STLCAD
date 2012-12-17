/**
 * @author Eberhard Graether / http://egraether.com/
 */

THREE.ModelControls = function (thingiview, object, domElement) {
	THREE.EventTarget.call(this);

	var _this = this,
	
	STATE = { NONE : -1, ROTATE : 0, ZOOM : 1, PAN : 2 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API
	this.enabled = true;
	this.screen = { width: 0, height: 0, offsetLeft: 0, offsetTop: 0 };
	this.radius = ( this.screen.width + this.screen.height ) / 4;
	this.rotateSpeed = 1.0;
	this.zoomSpeed = 1.2;
	this.panSpeed = 0.3;
	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;
	this.staticMoving = false;
	this.dynamicDampingFactor = 0.2;
	this.minDistance = 0;
	this.maxDistance = Infinity;
	
	// Keyboard interaction
	this.keys = [ 
					65 /*A*/, 
					83 /*S*/, 
					68 /*D*/ 
				];

	// Internals
	this.target = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();
	
	var projector = thingiview.getProjector();
	var camera = thingiview.getCamera();
	var objects = thingiview.getObjects();
	var plane = thingiview.getPlane();
	
	var mouse = new THREE.Vector2();
	var offset = new THREE.Vector3();
	
	var INTERSECTED, SELECTED;
	var controls = thingiview.getControls();
	
	var _rotateObject = false;
	var _keyPressed = false,
	_state = STATE.NONE,

	_eye = new THREE.Vector3(),

	_rotateStart = new THREE.Vector3(),
	_rotateEnd = new THREE.Vector3(),
	_zoomStart = new THREE.Vector2(),
	_zoomEnd = new THREE.Vector2(),
	_panStart = new THREE.Vector2(),
	_panEnd = new THREE.Vector2();

	// Events
	var changeEvent = { type: 'change' };

	// Methods
	this.handleResize = function () {
		this.screen.width = window.innerWidth;
		this.screen.height = window.innerHeight;
		this.screen.offsetLeft = 0;
		this.screen.offsetTop = 0;
		this.radius = ( this.screen.width + this.screen.height ) / 4;
	};

	this.handleEvent = function ( event ) {
		if ( typeof this[ event.type ] == 'function' ) {
			this[ event.type ]( event );
		}
	};

	this.getMouseOnScreen = function ( clientX, clientY ) {
		return new THREE.Vector2(
			( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5,
			( clientY - _this.screen.offsetTop ) / _this.radius * 0.5
		);
	};

	this.getMouseProjectionOnBall = function ( clientX, clientY ) {
		var mouseOnBall = new THREE.Vector3(
			( clientX - _this.screen.width * 0.5 - _this.screen.offsetLeft ) / _this.radius,
			( _this.screen.height * 0.5 + _this.screen.offsetTop - clientY ) / _this.radius,
			0.0
		);

		var length = mouseOnBall.length();
		if ( length > 1.0 ) {
			mouseOnBall.normalize();
		} else {
			mouseOnBall.z = Math.sqrt( 1.0 - length * length );
		}

		_eye.copy( _this.object.position ).subSelf( _this.target );

		var projection = _this.object.up.clone().setLength( mouseOnBall.y );
		projection.addSelf( _this.object.up.clone().crossSelf( _eye ).setLength( mouseOnBall.x ) );
		projection.addSelf( _eye.setLength( mouseOnBall.z ) );

		return projection;
	};

	this.rotateCamera = function () {
		var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );
		if ( angle ) {
			var axis = ( new THREE.Vector3() ).cross( _rotateStart, _rotateEnd ).normalize(), quaternion = new THREE.Quaternion();
			
			angle *= _this.rotateSpeed;

			quaternion.setFromAxisAngle( axis, -angle );
			quaternion.multiplyVector3( _eye );
			quaternion.multiplyVector3( _this.object.up );
			quaternion.multiplyVector3( _rotateEnd );

			if ( _this.staticMoving ) {
				_rotateStart.copy( _rotateEnd );
			} else {
				quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
				quaternion.multiplyVector3( _rotateStart );
			}
		}

	};

	this.zoomCamera = function () {
		var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;
		if ( factor !== 1.0 && factor > 0.0 ) {
			_eye.multiplyScalar( factor );

			if ( _this.staticMoving ) {
				_zoomStart.copy( _zoomEnd );
			} else {
				_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;
			}
		}
	};

	this.panCamera = function () {
		var mouseChange = _panEnd.clone().subSelf( _panStart );
		if ( mouseChange.lengthSq() ) {
			mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

			var pan = _eye.clone().crossSelf( _this.object.up ).setLength( mouseChange.x );
			pan.addSelf( _this.object.up.clone().setLength( mouseChange.y ) );

			_this.object.position.addSelf( pan );
			_this.target.addSelf( pan );

			if ( _this.staticMoving ) {
				_panStart = _panEnd;
			} else {
				_panStart.addSelf( mouseChange.sub( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );
			}
		}
	};

	this.checkDistances = function () {
		if ( !_this.noZoom || !_this.noPan ) {
			if ( _this.object.position.lengthSq() > _this.maxDistance * _this.maxDistance ) {
				_this.object.position.setLength( _this.maxDistance );
			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {
				_this.object.position.add( _this.target, _eye.setLength( _this.minDistance ) );
			}
		}
	};

	this.update = function () {
		_eye.copy( _this.object.position ).subSelf( _this.target );

		if ( !_this.noRotate ) {
			_this.rotateCamera();
		}

		if ( !_this.noZoom ) {
			_this.zoomCamera();
		}

		if ( !_this.noPan ) {
			_this.panCamera();
		}

		_this.object.position.add( _this.target, _eye );
		_this.checkDistances();
		_this.object.lookAt( _this.target );

		if ( lastPosition.distanceToSquared( _this.object.position ) > 0 ) {
			_this.dispatchEvent( changeEvent );
			lastPosition.copy( _this.object.position );
		}
	};

	// Listeners
	function keydown(event) {
		//if (! _this.enabled) return;
		//event.preventDefault();

		var key = event.keyCode;

		//console.log('Key Down: ' + key);

		// SHIFT key
		if(key == '16') {
			_rotateObject = true;
		}

		if(_state !== STATE.NONE) {
			return;
		} else if (key === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {
			_state = STATE.ROTATE;
		} else if (key === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {
			_state = STATE.ZOOM;
		} else if (key === _this.keys[ STATE.PAN ] && !_this.noPan ) {
			_state = STATE.PAN;
		}

		if (_state == STATE.NONE) {
			_keyPressed = true;
		} else {
			_keyPressed = false;
		}
	}

	function keyup( event ) {
		//console.log('Key Up: ' + event.keyCode);
		
		//if ( ! _this.enabled ) return;
		
		_rotateObject = false;
		
		if ( _state !== STATE.NONE ) {
			_state = STATE.NONE;
		}
	}

	function mousedown(event) {
		if (!_this.enabled) return;

		event.preventDefault();
		event.stopPropagation();

		// Check for intersections
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
		var intersects = ray.intersectObjects(objects);
		
		// Check if an intersection with a visible object was made.
		if (intersects.length > 0) {
			// Mark the selected object
			SELECTED = intersects[0].object;
			
			var intersects = ray.intersectObject(plane);
			offset.copy(intersects[0].point).subSelf(plane.position);
		}
		
		// Scene manipulation
		if(_state === STATE.NONE) {
			_state = event.button;
			
			if (_state === STATE.ROTATE && !_this.noRotate) {
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall(event.clientX, event.clientY);
			} else if (_state === STATE.ZOOM && !_this.noZoom) {
				_zoomStart = _zoomEnd = _this.getMouseOnScreen(event.clientX, event.clientY);
			} else if (!this.noPan) {
				_panStart = _panEnd = _this.getMouseOnScreen(event.clientX, event.clientY);
			}
		}
	}

	function mousemove( event ) {
		if (!_this.enabled ) return;
		
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		// Check if an object was selected prior to mouse move.
		if(SELECTED) {
			// Check if we are to rotate the object or move it.
			if(_rotateObject) {
				// Rotation tests
				var xAxis = new THREE.Vector3(1,0,0);
				thingiview.rotateObjectOnAxis(SELECTED, xAxis, Math.PI / 180)
				return;
			} else {
				var intersects = ray.intersectObject(plane);
				SELECTED.position.copy(intersects[0].point.subSelf(offset));
				return;
			}
		}
		
		// Check for intersections.
		var intersects = ray.intersectObjects( objects );
		if(intersects.length > 0 ) {
			if ( INTERSECTED != intersects[ 0 ].object ) {
				if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
				
				// Update the intersected objects color to alert the user
				INTERSECTED.material.color.setHex(0xFF9999);
				
				plane.position.copy( INTERSECTED.position );
				plane.lookAt( camera.position );
			}

			//container.style.cursor = 'pointer';

		} else {
			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			INTERSECTED = null;
			//container.style.cursor = 'auto';
		}

		if ( _keyPressed ) {
			//_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );
			//_zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );
			//_panStart = _panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

			_keyPressed = false;
		}
		
		// Scene manipulation
		if ( _state === STATE.NONE ) {
			return;
		} else if ( _state === STATE.ROTATE && !_this.noRotate ) {
			_rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );
		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {
			_zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );
		} else if ( _state === STATE.PAN && !_this.noPan ) {
			_panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );
		}
	}

	function mouseup( event ) {
		//if ( ! _this.enabled ) return;
		
		event.preventDefault();
		event.stopPropagation();

		if (INTERSECTED) {
			plane.position.copy(INTERSECTED.position);
			SELECTED = null;
		}

		_state = STATE.NONE; // Reset the state.
	}

	function mousewheel( event ) {
		if ( ! _this.enabled ) return;

		event.preventDefault();
		event.stopPropagation();

		/*
		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta / 40;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail / 3;

		}
		*/

    	var rolled = 0;

    	if (event.wheelDelta === undefined) {
	      	// Firefox
	      	// The measurement units of the detail and wheelDelta properties are different.
	      	rolled = -40 * event.detail;
    	} else {
      		rolled = event.wheelDelta;
    	}

   	 	if (rolled > 0) {
      		// up
      		//scope.setCameraZoom(+10);
      		_zoomStart.y += 1;
    	} else {
      		// down
      		//scope.setCameraZoom(-10);
    	  	_zoomStart.y -= 1;
    	}
	}
	
	
	
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousemove', mousemove, false );
	this.domElement.addEventListener( 'mousedown', mousedown, false );
	this.domElement.addEventListener( 'mouseup', mouseup, false );
	this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false );
	this.domElement.addEventListener( 'mousewheel', mousewheel, false );

	window.addEventListener('keydown', keydown, false);
	window.addEventListener('keyup', keyup, false);

	this.handleResize();
};