"use strict";

var $=function(sel){
	let r=document.querySelectorAll(sel);
	if(r.length==1){
		return r[0];
	}
	return r;
}



	document.addEventListener('DOMContentLoaded',function(){
		let canvas1=new window.Canvas();
		
		canvas1.build(document.querySelector('.content'), 1920,1080,'canvas');
		window.canvas=canvas1;
		canvas1.clearScreen();
		new window.Bootstrap(); //Bootstraps first scene
		
		
		
	});
	
function onFullscreen(){
	const canvas=document.getElementById("canvas");
	canvas.requestFullscreen();
}
	
	
	
