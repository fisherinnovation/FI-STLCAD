<?php

	// server needs a good cpu!  Might need to make timeout higher if server chokes on really really big models...
	set_time_limit(3000);
	
	include('convert.php');
	
	if(!isset($_GET['file'])) {
		echo 'No file!';
		return;
	}
	
	$file = $_GET['file'];
	
	// Check for the Thingiverse redirect to amazon.
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $file);
	curl_setopt($ch, CURLOPT_HEADER, TRUE);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, FALSE);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	$a = curl_exec($ch);
	if(preg_match('#Location: (.*)#', $a, $r))
	 	$l = trim($r[1]);
	
	if(!empty($l)) $file = $l;
	
	// Create a filename for the cached STL data.
	$filename = date("Y-m-dH:i:s");
	
	// Download the file to the web server.
	$ch = curl_init($file);
	$fp = fopen('../objects/' . $filename . '.stl', 'wb');
	curl_setopt($ch, CURLOPT_FILE, $fp);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_exec($ch);
	curl_close($ch);
	fclose($fp);
	
	//$file = '../objects/' . $filename . '.stl';
		
	$file_parts = pathinfo($file);
	$handle = fopen($file, 'rb');
	
	if ($handle == FALSE) trigger_error("Failed to open file $file");
	
	$contents = "";
	
	while (!feof($handle)) $contents .= fgets($handle);
	
	$contents = preg_replace('/$\s+.*/', '', $contents);
	
	switch($file_parts['extension']){
	  	case 'stl':
	    	if (stripos($contents, 'solid') === FALSE) {
	      		$result = parse_stl_binary($handle);
	    	} else {
	      		$result = parse_stl_string($contents);
	    	}  
	    break;
	  
	  	case 'obj':
	    	$result = parse_obj_string($contents);
	    break;
	}
	
	$json = json_encode($result);
	
	// Save JSON
	$fh = fopen('../objects/' . $filename . '.json', 'w') or die("can't open file");
	fwrite($fh, $json);
	fclose($fh);
	
	echo $json;

?>