ContextMenu = function(thingiview) {
	
	var _this = this;
	var inited = false;
	
	$(document).bind("contextmenu", function(event) { 
	    event.preventDefault();
	    
	    $("#context-menu").css({ top:event.pageY + "px", left:event.pageX + "px" });
	    $("#context-menu").fadeIn(100);
	    
	    if(!inited) {
	    	$('#context-menu .delete').bind('click', _this.onContextDeleteClick);
	    	inited = true;
	    }
	}).bind("click", function(event) {
	    $("#context-menu").fadeOut(100);
	});
	
	
	/**
	 * 
	 */
	this.onContextDeleteClick = function() {
		thingiview.removeSelectedObject();
	}
}