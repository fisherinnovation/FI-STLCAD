PropertiesSidebar = function(thingiverse) {
	
	// X Position Dragging
	$('#model-properties .x-val').draggableInput({
		type: 'float',
      	min: -1000.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .x-val').on('change',function(e) {
    	var val = $('#model-properties .x-val').val();	
    	thingiverse.setSelectedXPostion(val);
    });
    
    // Y Position Dragging
    $('#model-properties .y-val').draggableInput({
		type: 'float',
      	min: -1000.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .y-val').on('change',function(e) {
    	var val = $('#model-properties .y-val').val();	
    	thingiverse.setSelectedYPostion(val);
    });
    
    // Z Position Dragging
    $('#model-properties .z-val').draggableInput({
		type: 'float',
      	min: -1000.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .z-val').on('change',function(e) {
    	var val = $('#model-properties .z-val').val();	
    	thingiverse.setSelectedZPostion(val);
    });
    
    
    // X Scale Dragging
	$('#model-properties .x-scale').draggableInput({
		type: 'float',
      	min: 0.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .x-scale').on('change',function(e) {
    	var val = $('#model-properties .x-scale').val();	
    	thingiverse.setSelectedXScale(val);
    });
    
    // Y Scale Dragging
    $('#model-properties .y-scale').draggableInput({
		type: 'float',
      	min: 0.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .y-scale').on('change',function(e) {
    	var val = $('#model-properties .y-scale').val();	
    	thingiverse.setSelectedYScale(val);
    });
    
    // Z Scale Dragging
    $('#model-properties .z-scale').draggableInput({
		type: 'float',
      	min: 0.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .z-scale').on('change',function(e) {
    	var val = $('#model-properties .z-scale').val();	
    	thingiverse.setSelectedZScale(val);
    });
    
    
    // X Rotation Dragging
	$('#model-properties .x-rotation').draggableInput({
		type: 'float',
      	min: -1000.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .x-rotation').on('change',function(e) {
    	var val = $('#model-properties .x-rotation').val();	
    	thingiverse.setSelectedXRotation(val);
    });
    
    // Y Rotation Dragging
    $('#model-properties .y-rotation').draggableInput({
		type: 'float',
      	min: -1000.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .y-rotation').on('change',function(e) {
    	var val = $('#model-properties .y-rotation').val();	
    	thingiverse.setSelectedYRotation(val);
    });
    
    // Z Rotation Dragging
    $('#model-properties .z-rotation').draggableInput({
		type: 'float',
      	min: -1000.0,
      	max: 1000.0,
      	scrollPrecision: 0.01,
      	precision: 20
    });
    $('#model-properties .z-rotation').on('change',function(e) {
    	var val = $('#model-properties .z-rotation').val();	
    	thingiverse.setSelectedZRotation(val);
    });
    
    
    /**
     * Enables the object controls.
     */
    this.enableObjectControls = function() {
    	
    }
    
    
    /**
     * Disables the object controls.
     */
    this.disableObjectControls = function() {
    	$('#model-properties .x-val').addClass('disabled');
    }
    
    
	/**
	 * Updates the selected models position in the properties sidebar.
	 * 
	 * @param	x:
	 * @param	y:
	 * @param	z: 
	 */
	this.updateModelPositionProperties = function(x, y, z) {
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
	this.updateModelScaleProperties = function(x, y, z) {
		$('#model-properties .x-scale').val(x);
		$('#model-properties .y-scale').val(y);
		$('#model-properties .z-scale').val(z);
	}
	
	
	/**
	 * Updates the selected models rotation in the properties sidebar.
	 * 
	 * @param	x:
	 * @param	y:
	 * @param	z: 
	 */
	this.updateModelRotationProperties = function(x, y, z) {
		$('#model-properties .x-rotation').val(x);
		$('#model-properties .y-rotation').val(y);
		$('#model-properties .z-rotation').val(z);
	}
	
	
	/**
	 * Appends a new model to the list of displayed models.
	 * 
	 * @param	objectID: The ID of the model object. 
	 */
	this.addModelToDisplayedModelsList = function(objectID) {
		
	}
}
