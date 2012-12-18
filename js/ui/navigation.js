Navigation = function(thingiview) {
	_this = this;
	
	
	this.init = function() {
		// Navigation events
		$('#nav-download-stl').bind('click', _this.onDownloadSTLButtonClick);
		$('#nav-new-project').bind('click', _this.onNewProjectClick);
	}
	
	/**
	 * 
	 */
	this.onNewProjectClick = function(e) {
		thingiview.removeAllObjects();
	}
	
	
	/**
	 * Loads the cached list of previously used objects.
	 */
	this.loadFileList = function() {
		$.getJSON(fileListURL, function(data) {
			filesJSON = data;
			var html = '';
		  	$.each(data, function(key, val) {
		  		// Place file into document.
		  		if(val == 'demo.json') {
		  			val = val.split('.');
		  			val = val[0];
		  			html += '<li><a class="load ' + key + '" href="#">' + val + '</a></li>';
		  		} else {
		  			val = val.split('.');
		  			val = val[0];
		  			html += '<li><a class="load ' + key + '" href="#">' + val + '</a></li>';
		  		}
		  	});
		  	
		  	$('#file-list').html(html);
		  	$('#file-list .load').bind('click', _this.onLoadSTLFromListButtonClick);
		  	//$('#file-list .delete').bind('click', _this.onNavSTLDeleteButtonClick);
		});
	}
	
	
	/**
	 * Loads a selected model from the model list into the 
	 * active scene.
	 */
	this.onLoadSTLFromListButtonClick = function(e) {
		var classnames = $(this).attr('class').split(' ');
		var modelID = classnames[1];
		
		$.getJSON('objects/' + filesJSON[modelID], function(data) {
			activeModel = filesJSON[modelID];
			thingiview.loadArray(eval(data));
		});
		
		$('#file-selector').modal('toggle');
		
		_navigation.loadFileList();
	}
	
	
	/**
	 * 
	 */
	this.onNavSTLDeleteButtonClick = function(e) {
		var classnames = $(this).attr('class').split(' ');
		var filename = classnames[1];
		filename = filesJSON[filename].split('.');
		filename = filename[0];
		
		$.getJSON('php/delete.php?file=' + filename, function(data) {
			_navigation.loadFileList();
			loadDefaultModel();
		});
	}
	
	
	/**
	 * 
	 */
	this.onDownloadSTLButtonClick = function(e) {
		if(activeModel == '') return;
		
		// Stip the JSON from filename.
		var filename = activeModel.split('.');
		
		// Download the STL 
		window.open('objects/' + filename[0] + '.stl', '_blank');
	}
	
}