<?php

	if(!isset($_GET['file'])) {
		return;
	}
	
	$file = $_GET['file'];
	
	unlink('../objects/' . $file . '.json');
	unlink('../objects/' . $file . '.stl');
	
?>