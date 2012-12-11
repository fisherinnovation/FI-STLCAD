<?php

	$url = 'http://www.thingiverse.com/download:1303';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HEADER, TRUE);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, FALSE);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	$a = curl_exec($ch);
	if(preg_match('#Location: (.*)#', $a, $r))
	 $l = trim($r[1]);

	echo $l;
?>