"use strict";

(function(){
	class ImageCache{
		constructor(){
			this.items={};
		}
		loadImage(src,callback){
			if(this.items[src]==undefined){
				let ni=new Image();
				ni.onload=callback;
				ni.src=src;
				this.items[src]=ni;
				
				return ni;
			}else{
				if(callback!==undefined){
					callback();
				}
				return this.items[src];
			}
		}
	}
	window.ImageCache=new ImageCache();
})();