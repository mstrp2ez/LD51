"use strict";

(function(){
	
	class Exit extends SceneItem{
		constructor(params){
			super(params);
			this.lastUpdate=0;
			this.updateDelay=100;
			this.respawnlocation=null;
			this.target=null;
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.target=params.target;
			
			this.respawnlocation=params.respawnlocation===undefined?null:params.respawnlocation;
		}
		onUpdate(time){
			/* if(time-this.lastUpdate>this.updateDelay){
				let player=window.SceneManager.getItemById("player");
				if(!player.didMove){return;}
				let cx=this.x;
				let cy=this.y;
				let cw=this.w;
				let ch=this.h;
				
				let px=player.x;
				let py=player.y;
				if(px>=cx&&px<cx+cw){
					if(py>=cy&&py<cy+ch){
						if(this.hasRespawnLocation()){
							window.Session.setItem("spawn",JSON.stringify(this.respawnlocation));
						}
						window.currentScene.loadScene(this.target);
					}
				}
				
				
				this.lastUpdate=time;
			} */
			super.onUpdate(time);
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!=-1){return null;}
			obj.respawnlocation=this.respawnlocation;
			obj.updateDelay=this.updateDelay;
			obj.target=this.target;
			
			return super.Serialize(obj,exempt);
		}
		hasRespawnLocation(){
			return this.respawnlocation!=null;
		}
		onRender(ctx){
			super.onRender(ctx);
			ctx.fillStyle='#0ff';
			ctx.fillRect(this.x,this.y,this.w,this.h);
			
			ctx.strokeStyle='#fff';
			ctx.beginPath();
				ctx.moveTo(this.x,this.y);
				ctx.lineTo(this.x+this.w,this.y);
				ctx.lineTo(this.x+this.w,this.y+this.h);
				ctx.lineTo(this.x,this.y+this.h);
				ctx.lineTo(this.x,this.y);
			ctx.stroke();
		}
	}
	
	window.Exit=Exit;
	
	
	class City extends Exit{
		constructor(params){
			super(params);
		}
	}
	
	window.City=City;
	
	/* class Location extends SceneItem{
		constructor(p_Params){
			super(p_Params);
			this.spriteloaded=0;
			this.tiles=[];
			this.row=0;
			this.id="";
			this.background=null;
			this.backgroundsrc=null;
			this.collisionmap=null;
			this.collisionmapsrc=null;
			this.colstring="";
			this.eventBroadcaster=new EventBroadcaster(this);
		}
		
		loadFromProperties(p_properties){
			//super.loadFromProperties(p_properties);
			this.x=p_properties.x;
			this.y=p_properties.y;
			this.w=p_properties.w;
			this.h=p_properties.h;
			this.layer=p_properties.layer;
			this.backgroundsrc=p_properties.backgroundsrc;
			this.collisionmapsrc=p_properties.collisionmapsrc;
			this.id=p_properties.hasOwnProperty("id")?p_properties.id:"";
			this.colstring=p_properties.colstring==undefined?"":p_properties.colstring;
			
			//this.Load();
		}
		setCollisionMapSrc(src){
			this.collisionmapsrc=src;
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!=-1){return null;}
			obj.backgroundsrc=this.backgroundsrc;
			obj.collisionmapsrc=this.collisionmapsrc;
			
			return super.Serialize(obj,exempt);
		}
	} */
	class Location extends SceneItem{
		constructor(param){
			super(param);
			this.collisionmap=[];
			this.step=32;
		}
		loadFromProperties(param){
			super.loadFromProperties(param);
			this.collisionmap=param.collisionmap==undefined?"":param.collisionmap;
			this.step=param.step==undefined?this.step:param.step;
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!=-1){return null;}
			obj.collisionmap=this.collisionmap;
			obj.step=this.step;
			
			return super.Serialize(obj,exempt);
		}
	}
	window.Location=Location;
	
})();