"use strict";

(function(){
	const DEFAULT_FRAME_DURATION=33;
	class AnimationFrame{
		constructor(params){
			this.sx=params.x;
			this.sy=params.y;
			this.sw=params.w;
			this.sh=params.h;
			this.duration=params.duration==undefined?DEFAULT_FRAME_DURATION:params.duration;
		}
		getWidth(){
			return this.sw;
		}
		getHeight(){
			return this.sh;
		}
	}
	
	class Animation{
		constructor(params){
			this.frames=[];
			this.name=params.name;
			let fr=params.frames;
			for(var i=0;i<fr.length;i++){
				this.frames.push(new AnimationFrame(fr[i]));
			}
		}
	}
	
	class SpriteAnimation extends SceneItem{
		constructor(params){
			super(params);
			this.animationData=null;
			this.animsrc="";
			this.animations=[];
			this.spritemap=new window.Sprite();
			this.loaded=false;
			this.currentFrame=0;
			this.currentAnimation=0;
			this.lastAnimationUpdate=0;
			this.type="Animation";
			this.stopAtEndOfAnimation=false;
			this.eventListeners={};
			this.randomAnimation=false;
			
			/* if(params.src!==undefined){
				this.animsrc=params.src;
				this.Load(params.src);
			} */
			//SceneManager.add(this);
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!==-1){return null;}
			obj.animsrc=this.animsrc;
			obj.randomAnimation=this.randomAnimation;
			
			return super.Serialize(obj,exempt)
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.animsrc=params.animsrc;
			this.randomAnimation=params.randomAnimation==undefined?this.randomAnimation:(params.randomAnimation=='true')?true:false;
			
			this.Load(this.animsrc);
		}
		getCurrentFrame(){
			if(this.loaded==false){return false;}
			return this.animations[this.currentAnimation].frames[this.currentFrame];
		}
		getNumAnimations(){
			return this.animations.length;
		}
		getAnimationNames(){
			let ret=[];
			for(let i=0;i<this.getNumAnimations();i++){
				ret.push(this.animations[i].name);
			}
			return ret;
		}
		/* setRandomAnimation(stop){
			let names=this.getAnimationNames();
			let max=names.length;
			this.setAnimation(names[Math.floor(Math.random()*max)],stop);
		} */
		Unload(){
			this.eventListeners={};
			this.spritemap=null;
		}
		setRandomAnimation(){
			let numAnims=this.animations.length;
			let min = 0;
			let max = numAnims;
			
			let anim=Math.floor(Math.random() * (max - min) + min);
			if(this.animations!==null&&this.animations[anim]!==null){
				let animation=this.animations[anim];
				this.setAnimation(animation.name,false);
			}
		}
	}
	
	
	SpriteAnimation.prototype.Load=function(p_Src){
		return fetch(p_Src).then(data => data.json()).then(data => {
			this.animationData=data;
			this.currentFrame=0;
			this.currentAnimation=0;
			
			this.spritemap=new window.Sprite();
			return this.spritemap.load({'src':this.animationData.spritesrc}).then(()=>{
				this.loaded=true;
				this.fireEvent("animation_loaded");
				
				let animations=this.animationData.animations;
				for(var j=0;j<animations.length;j++){
					this.animations.push(new Animation(animations[j]));
				}
			});
		});
	}
	
	SpriteAnimation.prototype.setAnimation=function(name,stop){
		if(!this.loaded){return;}
		const current=this.animations[this.currentAnimation];
		const anim=this.animations.find(item => item.name==name);
		if(anim!==undefined){
			const index=this.animations.indexOf(anim);
			if(index!=this.currentAnimation){
				this.currentAnimation=index;
				this.currentFrame=0;
				this.stopAtEndOfAnimation=stop;
			}
		}
	}
	
	SpriteAnimation.prototype.onUpdate=function(time){
		if(this.loaded==false){return;}
		let delta=time-this.lastAnimationUpdate;
		let currentAnimation=this.animations[this.currentAnimation];
		let currentFrame=currentAnimation.frames[this.currentFrame];
		let frameDuration=currentFrame.duration;
		if(delta>frameDuration){
			this.currentFrame++;
			if(this.currentFrame>=currentAnimation.frames.length){
				this.fireEvent("end_of_animation");
				this.currentFrame=this.stopAtEndOfAnimation?this.currentFrame-1:0;
				if(this.randomAnimation){
					this.setRandomAnimation();
				}
			}
			this.lastAnimationUpdate=time;
		}
	}
	SpriteAnimation.prototype.registerEventlistener=function(event,callback){
		if(!this.eventListeners.hasOwnProperty(event)){
			this.eventListeners[event]=[callback];
		}else{
			this.eventListeners[event].push(callback);
		}
	}
	
	SpriteAnimation.prototype.fireEvent=function(event){
		if(this.eventListeners.hasOwnProperty(event)){
			for(let i=0;i<this.eventListeners[event].length;i++){
				let ret=this.eventListeners[event][i](this.animations[this.currentAnimation]);
				if(ret===false){
					this.eventListeners[event].splice(i,1);
				}
			}
		}
	}
	
	SpriteAnimation.prototype.onRender=function(ctx){
		if(this.loaded==false){return;}
		let wc=this.calculateWorldCoordinates();
		let currentAnimation=this.animations[this.currentAnimation];
		let img=this.spritemap.Image();
		let frames=currentAnimation.frames;
		
		let f=frames[this.currentFrame];
		ctx.drawImage(img,f.sx,f.sy,f.sw,f.sh,wc.x,wc.y,f.sw,f.sh);
		
		if(this.isSelected()){
			ctx.save();
				ctx.globalAlpha=1.0;
				ctx.global
				ctx.beginPath();
				ctx.strokeStyle='#ff0';
				ctx.moveTo(wc.x,wc.y);
				ctx.lineTo(wc.x+f.sw,wc.y);
				ctx.lineTo(wc.x+f.sw,wc.y+f.sh);
				ctx.lineTo(wc.x,wc.y+f.sh);
				ctx.lineTo(wc.x,wc.y);
				ctx.stroke();
			ctx.restore();
		}
	}
	
	SpriteAnimation.prototype.onSpriteLoad=function(img){
		
	}
	
	
	window.SpriteAnimation=SpriteAnimation;
	
})();