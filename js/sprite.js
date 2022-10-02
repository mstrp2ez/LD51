"use strict";

(function(){

	class Sprite extends SceneItem{
		constructor(params){
			super(params);
			this.image=null;
			this.loaded=false;
			this.scalex=1;
			this.scaley=1;
			this.eventbroadcaster=new EventBroadcaster();
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			
			this.scalex=params.scalex===undefined?1:params.scalex;
			this.scaley=params.scaley===undefined?1:params.scaley;
			this.load(params).then(()=>{this.loaded=true});
		}
		onRender(ctx){
			
			if(!this.loaded){return;}
			const wc=this.calculateWorldCoordinates();
			
			ctx.drawImage(this.image,wc.x,wc.y,this.image.width,this.image.height);
			super.onRender(ctx);
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!=-1){return null;}
			obj.src=this.image.src;
			obj.scalex=this.scalex;
			obj.scaley=this.scaley;
			return super.Serialize(obj,exempt);
		}
		getEventBroadcaster(){
			return this.eventbroadcaster;
		}
		isLoaded(){
			return this.loaded;
		}
		getWidth(){
			if(this.isLoaded()){
				return this.image.width*(1/this.scalex);
			}
			return this.w;
		}
		getHeight(){
			if(this.isLoaded()){
				return this.image.height*(1/this.scaley);
			}
			return this.h;
		}
		async load(params){
			return new Promise((resolve,reject) => {
				this.image=new Image();
				this.image.addEventListener('load',() => {
					resolve(this.image);
				});
				this.image.src=params.src
			});
		}
		onLoad(){
			this.loaded=true;
			this.eventbroadcaster.fireEvent('loaded');
		}
	}
	
	Sprite.prototype.Image=function(){
		return this.image;
	}
	
	Sprite.prototype.Unload=function(){
		this.image.onload=null;
		this.image=null;
	}
	
	
	window.Sprite=Sprite;
})();