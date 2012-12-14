<?php

	// server needs a good cpu!  Might need to make timeout higher if server chokes on really really big models...
	set_time_limit(3000);
	
	include('convert.php');
	
	$data = array();
	
	if($_FILES["userfile"]["size"] < 5000000) {
		$newFileName = time();
		$ext = explode('.', $_FILES["userfile"]["name"]);
		$_FILES["userfile"]["name"] = $newFileName . '.' . $ext[sizeof($ext) - 1];
		
		if ($_FILES["userfile"]["error"] > 0) {
	    	$data['error'] = $_FILES["userfile"]["error"];
		} else {
		    if (file_exists("../uploads/" . $_FILES["userfile"]["name"])) {
	      		$data['error'] = $_FILES["userfile"]["name"] . " already exists. ";
				echo json_encode($data);
				return;
	      	} else {
				move_uploaded_file($_FILES["userfile"]["tmp_name"], "../uploads/" . $_FILES["userfile"]["name"]);
				$data['location'] = "../uploads/" . $_FILES["userfile"]["name"];
				
				// Validate this is a STL before moving into system.
				if($ext[sizeof($ext) - 1] != 'stl') {
					$data['error'] = "Unknown file type. ";
					echo json_encode($data);
					return;
				}
				
				// Move to objects directory
				if(!copy($data['location'], '../objects/' . $_FILES["userfile"]["name"])) {
				    $data['error'] = "Failed to copy file to objects directory.";
					echo json_encode($data);
					return;
				}
				
				// Convert STL to JSON for Three.js
				$file = '../objects/' . $_FILES["userfile"]["name"];
				$file_parts = pathinfo($file);
				$handle = fopen($file, 'rb');
				
				if ($handle == FALSE) {
					$data['error'] = "Failed to open file $file";
					echo json_encode($data);
					return;
				}
				
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
				$filename = preg_replace("/\\.[^.\\s]{3,4}$/", "", $file);
				$fh = fopen('../objects/' . $filename . '.json', 'w') or die("can't open file");
				fwrite($fh, $json);
				fclose($fh);
				
				$data['location'] = $filename;
	      	}
		}
	}
	
	echo json_encode($data);
	
?>