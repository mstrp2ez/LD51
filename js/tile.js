"use strict";

(function(){

	class Tile extends Sprite{
		constructor(params){
			super(params);
			this.img=null;
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.img=setOrDefault(params,'img',null);
		}
		onRender(ctx){
			//ctx.save();
				/* if(this.layer!=window.tileLayer&&!window.renderAllLayers){
					ctx.globalAlpha=0.4;
				} */
				super.onRender(ctx);
			//ctx.restore();
		}
		onUpdate(time){
			super.onUpdate(time);
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!=-1){return null;}
			
			return super.Serialize(obj,exempt);
		}
		getWidth(){
			return this.w;
		}
		getHeight(){
			return this.h;
		}
		setLayer(layer){
			super.setLayer(layer);
			this.id=`Tile ${this.x}-${this.y}-${this.layer}`;
		}
	}
	window.Tile=Tile;
	
	class CollisionTile extends SceneItem{
		constructor(params){
			super(params);
			
			this.noDraw=false;
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.noDraw=setOrDefault(params,"nodraw",false);
		}
		onRender(ctx){
			if(this.layer!=window.tileLayer){
				return;
			}
			ctx.save();
				super.onRender(ctx);
			ctx.restore();
		}
	}
	window.CollisionTile=CollisionTile;
	
})();