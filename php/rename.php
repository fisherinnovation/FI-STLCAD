<?php

	if(!isset($_GET['old'])) return;
	if(!isset($_GET['new'])) return;

	$old =$_GET['old'];
	$new = $_GET['new'];

	rename('../objects/' . $old . '.json', '../objects/' . $new . '.json');
	rename('../objects/' . $old . '.stl', '../objects/' . $new . '.stl');

?>