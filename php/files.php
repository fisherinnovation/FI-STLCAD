<?php
	$files = array();
	if ($handle = opendir('../objects')) {
	    while (false !== ($entry = readdir($handle))) {
	        if ($entry != '' && $entry != "." && $entry != "..") {
	            $filename = explode('.', $entry);
				if($filename[sizeof($filename) - 1] == 'json') {
	            	array_push($files, $entry);
				}
	        }
	    }
	    closedir($handle);
		
		$output = json_encode($files);
		
		print_r($output);
	}
?>