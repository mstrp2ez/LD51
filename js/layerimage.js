"use strict";

(function(){
	
	class LayerImage extends Sprite{
		constructor(params){
			super(params);
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
		}
		setLayer(layer){
			super.setLayer(layer);
			this.id=`LayerImage-${this.layer}`;
		}
	}
	
	window.LayerImage=LayerImage;
	
})();