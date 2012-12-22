ContextMenu = function(thingiview) {
	var menuViews = ['general', 'object-selected'];
	var menuItems = [
						[
							'Undo',
							'Paste',
							'Level All Objects on Platform',
							'Center All Objects on Platform'
						],
						[
							'Undo',
							'Copy',
							'Paste',
							'Delete',
							'Level on Platform',
							'Center on Platform'
						]
					];
					
	var _this = this;
	var inited = false;
	
	$(document).bind("contextmenu", function(event) { 
		event.preventDefault();
	    
	    if(thingiview.getSelectedObject() != null) {
	    	setContextView('object-selected');
	    } else {
	    	setContextView('general');
	    }
	    
	    $("#context-menu").css({ top:event.pageY + "px", left:event.pageX + "px" });
	    $("#context-menu").fadeIn(100);
	    
	    if(!inited) {
	    	// General menu items
	    	
	    	// Object menu items
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
		setContextView('general');
	}
	
	
	/**
	 * 
	 */
	function setContextView(view) {
		if(view == menuViews[0]) {
			// General View
			var menuHTML = '';
			var l = menuItems[0].length;
			for(var i = 0; i < l; i++) {
				menuHTML += '<li><a href="#" class="' + menuItems[0][i].replace(/\s/g, '').toLowerCase() + '">' + menuItems[0][i] + '</a></li>';
			}
			$('#context-menu ul').html(menuHTML);
		} else if(view == menuViews[1]) {
			// Object Selected View
			var menuHTML = '';
			var l = menuItems[1].length;
			for(var i = 0; i < l; i++) {
				menuHTML += '<li><a href="#" class="' + menuItems[1][i].replace(/\s/g, '').toLowerCase() + '">' + menuItems[1][i] + '</a></li>';
			}
			$('#context-menu ul').html(menuHTML);
		}
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