<?php

	$raft = false;
	$fillPercentage = 10;
	$solidLayers = 2;
	$filamentDiameter = 1.82;
	$travelFeedRate = 150;
	
	exec('python -u skeinforge/skeinforge_application/skeinforge.py -p "slicing-pref/Replicator slicing defaults" "--option" "raft.csv:Add Raft, Elevate Nozzle, Orbit:=False" "--option" "raft.csv:None=false" "--option" "raft.csv:Empty Layers Only=false" "--option" "raft.csv:Everywhere=true" "--option" "raft.csv:Exterior Only=false" "--option" "alteration.csv:Name of Start File:=" "--option" "alteration.csv:Name of End File:=" "--option" "fill.csv:Infill Solidity (ratio):=0.2" "--option" "speed.csv:Feed Rate (mm/s):=80" "--option" "speed.csv:Travel Feed Rate (mm/s):=150" "--option" "speed.csv:Flow Rate Setting (float):=80.0" "--option" "dimension.csv:Filament Diameter (mm):=1.82" "--option" "carve.csv:Edge Width over Height (ratio):=4.0" "--option" "inset.csv:Infill Width over Thickness (ratio):=4.0" "--option" "carve.csv:Layer Height (mm):=0.1" "--option" "fill.csv:Solid Surface Thickness (layers):=12" "--option" "fill.csv:Extra Shells on Alternating Solid Layer (layers):=2" "--option" "fill.csv:Extra Shells on Base (layers):=2" "--option" "fill.csv:Extra Shells on Sparse Layer (layers):=2" "temp/UNIFIED_MESH_HACK.stl"');
	
?>