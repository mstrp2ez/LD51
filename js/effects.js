"use strict";


class Effect extends SceneItem{
	constructor(params){
		super(params);
		
		this.lastUpdate=null;
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		this.timeToLive=params.timeToLive??=1000;
		
		return new Promise(()=>{});
	}
	onUpdate(time){
		if(this.isDead()){return;}
		super.onUpdate(time);
		if(this.lastUpdate==null){
			this.lastUpdate=time;
		}
		
		if(time-this.lastUpdate>this.timeToLive){
			this.die();
		}
	}
	die(){
		this.setDead(true);
	}
	setDead(dead){
		this.dead=dead;
	}
	isDead(){
		return this.dead;
	}
}

const AnimationEffectTypes_EXPLOSION="assets/effects/explosion.json";

class AnimationEffect extends Effect{
	constructor(params){
		super(params);
		this.loaded=false;
	}
	loadFromProperties(params){
		return super.loadFromProperties(params).then(()=>{
			this.animation=new SpriteAnimation();
			return this.animation.Load(params.src).then(() => {
				this.loaded=true;
			});
		});
	}
	onUpdate(time){
		super.onUpdate(time);
		if(!this.loaded||this.isDead()){return;}
		this.animation.onUpdate(time);
	}
	onRender(ctx){
		super.onRender(ctx);
		if(!this.loaded||this.isDead()){return;}
		this.animation.onRender(ctx);
	}
}
window.AnimationEffect = AnimationEffect;