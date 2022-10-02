"use strict";


(function(){
	class MenuHandler extends SceneItem{
		constructor(params){
			super(params);

		}
		onKeydown(){
			window.currentScene.loadScene("assets/scenes/scene0.json");
		}
	}
	window.MenuHandler=MenuHandler;
})();