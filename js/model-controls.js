THREE.ModelControls = function (thingiview, object, domElement, propertiesSidebar) {
	THREE.EventTarget.call(this);

	var _this = this,
	
	STATE = { 
				NONE:-1,
				ROTATE:0,
				ZOOM:1,
				PAN:2
			};

	this.object					= object;
	this.domElement				= ( domElement !== undefined ) ? domElement : document;

	// API
	this.enabled				= true;
	this.screen					= { width: 0, height: 0, offsetLeft: 0, offsetTop: 0 };
	this.radius					= ( this.screen.width + this.screen.height ) / 4;
	this.rotateSpeed			= 1.0;
	this.zoomSpeed				= 1.2;
	this.panSpeed				= 0.3;
	this.noRotate				= false;
	this.noZoom					= false;
	this.noPan					= false;
	this.staticMoving			= false;
	this.dynamicDampingFactor	= 0.2;
	this.minDistance			= 0;
	this.maxDistance			= Infinity;
	this.target					= new THREE.Vector3();

	var lastPosition		= new THREE.Vector3();
	var projector			= thingiview.getProjector();
	var camera				= thingiview.getCamera();
	var objects				= thingiview.getObjects();
	var plane				= thingiview.getPlane();
	var mouse				= new THREE.Vector2();
	var offset				= new THREE.Vector3();
	
	var INTERSECTED
	var SELECTED;
	var _selectedObject; 								// The selected object
	var controls			= thingiview.getControls();	// Refernce to the controls
	var _keyPressed			= -1;
	var _state				= STATE.NONE;
	var _eye 				= new THREE.Vector3();
	var _rotateStart 		= new THREE.Vector3();
	var _rotateEnd 			= new THREE.Vector3();
	var _zoomStart 			= new THREE.Vector2();
	var _zoomEnd 			= new THREE.Vector2();
	var _panStart 			= new THREE.Vector2();
	var _panEnd 			= new THREE.Vector2();

	// Events
	var changeEvent = { type: 'change' };

	/**
	 * Returns the current key pressed. 
	 * -1 if nothing pressed.
	 */
	this.getKeypressed = function() { return _keyPressed; }
	
	
	/**
	 * 
	 */
	this.handleResize = function () {
		this.screen.width = window.innerWidth;
		this.screen.height = window.innerHeight;
		this.screen.offsetLeft = 0;
		this.screen.offsetTop = 0;
		this.radius = ( this.screen.width + this.screen.height ) / 4;
	};
	
	
	/**
	 * 
	 */
	this.handleEvent = function ( event ) {
		if ( typeof this[ event.type ] == 'function' ) {
			this[ event.type ]( event );
		}
	};

	
	/**
	 * 
	 */
	this.getMouseOnScreen = function ( clientX, clientY ) {
		return new THREE.Vector2(
			( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5,
			( clientY - _this.screen.offsetTop ) / _this.radius * 0.5
		);
	};

	
	/**
	 * 
	 */
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
	
	
	/**
	 * 
	 */
	this.rotateCamera = function () {
		var angle = Math.acos(_rotateStart.dot(_rotateEnd) / _rotateStart.length() / _rotateEnd.length());
		if(angle) {
			var axis = (new THREE.Vector3()).cross(_rotateStart, _rotateEnd).normalize(), quaternion = new THREE.Quaternion();
			
			angle *= _this.rotateSpeed;

			quaternion.setFromAxisAngle(axis, -angle);
			quaternion.multiplyVector3(_eye);
			quaternion.multiplyVector3(_this.object.up);
			quaternion.multiplyVector3(_rotateEnd);

			if (_this.staticMoving) {
				_rotateStart.copy(_rotateEnd);
			} else {
				quaternion.setFromAxisAngle(axis, angle * (_this.dynamicDampingFactor - 1.0));
				quaternion.multiplyVector3(_rotateStart);
			}
		}
	};

	
	/**
	 * 
	 */
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

	
	/**
	 * 
	 */
	this.panCamera = function () {
		if(_keyPressed != 16) return;
		
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

	
	/**
	 * 
	 */
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

	
	/**
	 * 
	 */
	this.update = function () {
		_eye.copy( _this.object.position ).subSelf( _this.target );

		if(!_this.noRotate) _this.rotateCamera();
		if( !_this.noZoom) _this.zoomCamera();
		if(!_this.noPan) _this.panCamera();
		
		_this.object.position.add(_this.target, _eye);
		_this.checkDistances();
		_this.object.lookAt(_this.target);

		if(lastPosition.distanceToSquared(_this.object.position) > 0) {
			_this.dispatchEvent(changeEvent);
			lastPosition.copy(_this.object.position);
		}
	};
	

	/**
	 * Called on key press down.
	 * 
	 * @param	event:
	 */
	function keydown(event) {
		_keyPressed = event.keyCode; // Logged the keycode of the pressed key.
	}


	/**
	 * Called on key press up.
	 * 
	 * @param	event:
	 */
	function keyup(event) {
		_keyPressed = -1; // Reset the logged key value.
	}


	/**
	 * Called on mouse button down.
	 * 
	 * @param	event:
	 */
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
		if(intersects.length > 0) {
			
			SELECTED = intersects[0].object;
			_selectedObject = intersects[0].object;
			thingiview.setSelectedObject(_selectedObject);
			
			// Pass the selected object to the main scene class.
			thingiview.setSelectedObject(_selectedObject);
			
			var l = objects.length;
			for(var i = 0; i < l; i++) {
				objects[i].material.color.setHex(thingiview.getObjectColor());
			}
			//thingiview.setObjectColor(thingiview.getObjectColor());
			
			// Mark the selected object
			_selectedObject.material.color.setHex(0xFF9999);
			
			// Update the properties display with the new position and scale vector.
			propertiesSidebar.enableObjectControls();
			propertiesSidebar.updateModelPositionProperties(_selectedObject.position.x, _selectedObject.position.y, _selectedObject.position.z);
			propertiesSidebar.updateModelScaleProperties(_selectedObject.scale.x, _selectedObject.scale.y, _selectedObject.scale.z);
			propertiesSidebar.updateModelRotationProperties(_selectedObject.rotation.x, _selectedObject.rotation.y, _selectedObject.rotation.z);
			
			var intersects = ray.intersectObject(plane);
			offset.copy(intersects[0].point).subSelf(plane.position);
		} else {
			thingiview.setSelectedObject(null);
			
			// Nothing was selected, clear all previous selections.
			var l = objects.length;
			for(var i = 0; i < l; i++) {
				objects[i].material.color.setHex(thingiview.getObjectColor());
			}
			
			propertiesSidebar.disableObjectControls();
			propertiesSidebar.updateModelPositionProperties('', '', '');
			propertiesSidebar.updateModelScaleProperties('', '', '');
			propertiesSidebar.updateModelRotationProperties('', '', '');
		}
		
		// Scene manipulation
		if(_state === STATE.NONE) {
			_state = event.button;
			
			if(_state == STATE.ROTATE && _keyPressed == '16') {
				_state = STATE.PAN;
			}
			
			if (_state === STATE.ROTATE && !_this.noRotate) {
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall(event.clientX, event.clientY);
			} else if (_state === STATE.ZOOM && !_this.noZoom) {
				_zoomStart = _zoomEnd = _this.getMouseOnScreen(event.clientX, event.clientY);
			} else if (!this.noPan) {
				_panStart = _panEnd = _this.getMouseOnScreen(event.clientX, event.clientY);
			}
		}
	}

	
	/**
	 * Called on mouse movement.
	 * 
	 * @param	event:
	 */
	function mousemove(event) {
		if (!_this.enabled ) return;
		
		var preX = mouse.x;
		var preV = mouse.y;
		
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		// Check if an object was selected prior to mouse move.
		if(SELECTED && _keyPressed != -1) {
			var intersects = ray.intersectObject(plane);
			SELECTED.position.copy(intersects[0].point.subSelf(offset));
			
			// Update the properties display with the new position vector.
			propertiesSidebar.updateModelPositionProperties(SELECTED.position.x, SELECTED.position.y, SELECTED.position.z);
			propertiesSidebar.updateModelScaleProperties(SELECTED.scale.x, SELECTED.scale.y, SELECTED.scale.z);
			propertiesSidebar.updateModelRotationProperties(SELECTED.rotation.x, SELECTED.rotation.y, SELECTED.rotation.z);
			
			return;
		}
		
		// Check for intersections.
		var intersects = ray.intersectObjects(objects);
		if(intersects.length > 0) {
			if (INTERSECTED != intersects[0].object) {
				if(INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

				INTERSECTED = intersects[0].object;
				
				plane.position.copy(INTERSECTED.position);
				plane.lookAt(camera.position);
			}
		} else {
			INTERSECTED = null;
		}

		// Scene manipulation
		if ( _state === STATE.NONE ) {
			return;
		} else if ( _state === STATE.ROTATE && !_this.noRotate ) {
			_rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );
		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {
			_zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );
		} else if ( _state === STATE.PAN && !_this.noPan && SELECTED == null) {
			_panEnd = _this.getMouseOnScreen( event.clientX, event.clientY );
		}
	}

	
	/**
	 * Called on mouse button up.
	 * 
	 * @param	event:
	 */
	function mouseup(event) {
		event.preventDefault();
		event.stopPropagation();

		if (INTERSECTED) {
			plane.position.copy(INTERSECTED.position);
			SELECTED = null;
		}

		_state = STATE.NONE;
	}
	
	
	/**
	 * Called on mouse wheel movement.
	 *  
 	 * @param 	event:
	 */
	function mousewheel(event) {
		if ( ! _this.enabled ) return;

		event.preventDefault();
		event.stopPropagation();

    	var rolled = 0;

		// Firefox check
    	if (event.wheelDelta === undefined) {
	      	rolled = -40 * event.detail;
    	} else {
      		rolled = event.wheelDelta;
    	}

   	 	if (rolled > 0) {
      		_zoomStart.y += 1; // Up
    	} else {
      		_zoomStart.y -= 1; // Down
    	}
	}
	
	
	this.domElement.addEventListener( 'mousemove', mousemove, false );
	this.domElement.addEventListener( 'mousedown', mousedown, false );
	this.domElement.addEventListener( 'mouseup', mouseup, false );
	this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false );
	this.domElement.addEventListener( 'mousewheel', mousewheel, false );

	window.addEventListener('keydown', keydown, false);
	window.addEventListener('keyup', keyup, false);

	this.handleResize();
};