ContextMenu = function(thingiview) {
	
	var menuItems = [
						'Undo',
						'Copy',
						'Paste',
						'Delete',
						'Level on Platform',
						'Center on Platform'
					]; 
	
	var _this = this;
	var inited = false;
	
	$(document).bind("contextmenu", function(event) { 
	    event.preventDefault();
	    
	    $("#context-menu").css({ top:event.pageY + "px", left:event.pageX + "px" });
	    $("#context-menu").fadeIn(100);
	    
	    if(!inited) {
	    	$('#context-menu .delete').bind('click', onContextDeleteClick);
	    	$('#context-menu .levelonplatform').bind('click', onContextLevelOnPlatformClick);
	    	$('#context-menu .centeronplatform').bind('click', onContextCenterOnPlatformClick);
	    	
	    	inited = true;
	    }
	}).bind("click", function(event) {
	    $("#context-menu").fadeOut(100);
	});
	
	init();
	
	/**
	 * ContextMenu Constructor
	 */
	function init() {
		// Append items to menu
		var menuHTML = '';
		var l = menuItems.length;
		for(var i = 0; i < l; i++) {
			menuHTML += '<li><a href="#" class="' + menuItems[i].replace(/\s/g, '').toLowerCase() + '">' + menuItems[i] + '</a></li>';
		}
		$('#context-menu ul').html(menuHTML);
	}
	
	
	/**
	 * 
	 */
	function onContextLevelOnPlatformClick(e) { thingiview.levelObject(); }
	
	
	/**
	 * 
	 */
	function onContextCenterOnPlatformClick(e) { thingiview.centerModel(); }
	
	/**
	 * 
	 */
	function onContextDeleteClick(e) { thingiview.removeSelectedObject(); }
}