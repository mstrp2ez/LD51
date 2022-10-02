"use strict";

(function(){
	class Bootstrap{
		constructor(){
			window.tileLayer=1;
			window.renderAllLayers=false;
			var scene=new window.Scene(window.canvas);
			
			let sceneSrc='assets/scenes/start.json';
			
			scene.loadScene(sceneSrc);
		}
	}
	
	window.Bootstrap=Bootstrap;
})();