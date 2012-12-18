PropertiesSidebar = function() {
	
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
	 * Appends a new model to the list of displayed models.
	 * 
	 * @param	objectID: The ID of the model object. 
	 */
	this.addModelToDisplayedModelsList = function(objectID) {
		
	}
}
