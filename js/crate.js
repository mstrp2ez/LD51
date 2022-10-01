"use strict";


(function(){
	
	class CrateGenerator extends SceneItem{
		constructor(params){
			super(params);
			this.rate=1000;
			this.template={};
			this.lastUpdate=performance.now();
			this.heroPoint={};
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.rate = params.rate ??= this.rate;
			this.template = params.template ??= this.template;
			this.heroPoint=params.heropoint ??= this.heroPoint;
		}
		postLoad(){
			this.children.forEach(x => x.postLoad());
		}
		onUpdate(time){
			super.onUpdate(time);
			
			const dead=this.children.filter(x => {
				return x.isDead();
			});
			dead.forEach(x => { 
				x.Unload();
				this.children.splice(this.children.indexOf(x),1);
			});
			
			const delta=time-this.lastUpdate;
			if(delta > this.rate){
				this.spawnCrate();
				this.lastUpdate=time;
			}
		}
		spawnCrate(){
			const newCrate=new Crate();
			const templ=Object.assign({x:0,y:0},this.template);
			newCrate.loadFromProperties(templ).then(x => {
				this.append(newCrate);
				newCrate.postLoad();
			});
			
			
		}
		getCrates(){
			return this.children;
		}
		getHeroPoint(){
			return this.heroPoint;
		}
	}
	window.CrateGenerator=CrateGenerator;
	
	class Crate extends SpriteAnimation{
		constructor(params){
			super(params);
			this.endpoint={};
			this.startpoint={};
			this.dead=false;
			this.key=rand(97,122);
			this.isHit=false;
			this.creationComplete=false;
			this.destroyTarget="";
		}
		loadFromProperties(params){
			return super.loadFromProperties(params).then(x => {
				this.endpoint = params.endpoint ??= {x:800,y:100};
				this.startpoint={x:this.x,y:this.y};
				this.destroyTarget=params.destroytarget;
			});
		}
		postLoad(){
			this.setAnimation("create");
			this.registerEventlistener("end_of_animation",this.onCreateAnimationEnd.bind(this));
		}
		onCreateAnimationEnd(){
			this.setAnimation("idle");
			this.creationComplete=true;
		}
		onUpdate(time){
			super.onUpdate(time);
			if(!this.creationComplete){return;}
			this.x+=2;
			
			const wc=this.calculateWorldCoordinates();
			if(wc.x>=this.endpoint.x){
				//this.x=this.startpoint.x;
				this.onDestroy();
			}
		}
		onRender(ctx){
			super.onRender(ctx);
			
			if(this.isHit||!this.creationComplete){return;}
			const wc=this.calculateWorldCoordinates();
			ctx.fillStyle='#eee';
			ctx.font="24px sans-serif";
			ctx.fillText(String.fromCharCode(this.key),wc.x+this.getWidth()/3,wc.y+this.getHeight()/1.5);
		}
		onDestroy(){
			this.creationComplete=false;
			this.setAnimation("destroy");
			this.registerEventlistener("end_of_animation",function(){
				this.dead=true;
				return false;
			}.bind(this));
			
			const destroyAnim=SceneManager.getItemById(this.destroyTarget);
			if(!destroyAnim){return;}
			destroyAnim.setAnimation("destroy");
			destroyAnim.registerEventlistener("end_of_animation",function(){
				destroyAnim.setAnimation("idle");
				return false;
			}.bind(this));
			
		}
		isDead(){
			return this.dead;
		}
		getKey(){
			return this.key;
		}
		onHit(zone){
			if(this.isHit){return;}
			const conv=["badquality","midquality","goodquality"];
			if(zone<0||zone>=conv.length){return;}
			this.setAnimation(conv[zone]);
			this.isHit=true;
		}
	}
	window.Crate=Crate;
	
})()