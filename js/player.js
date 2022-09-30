"use strict";

(function(){
	
	class AnimationCollection{
		constructor(){
			this.items=[];
		}
		append(item){
			this.items.push(item);
		}
	}
	AnimationCollection.prototype.each=function(callback){
		for(let i=0;i<this.items.length;i++){
			callback(this.items[i]);
		}
	}
	
	const PLAYER_PADDING_Y=0;
	const PLAYER_KEY_RIGHT=39;
	const PLAYER_KEY_LEFT=37;
	const PLAYER_KEY_UP=38;
	const PLAYER_KEY_DOWN=40;
	
	
	window.INVENTORY_STATS_KEY="Inventory";
	class Player extends SceneItem{
		constructor(params){
			super(params);
			this.keyMap=[];
			this.hp=100;
			this.mana=10;
			this.id='player';
			this.moveTarget=null;
			this.keyMap.fill(false,0);
			this.loaded=true;
			this.animsrc="";
			this.didMove=false;
			this.moveCount=0;
			this.animationCollection=new AnimationCollection();
			this.currentScene=window.currentScene;
			this.inWorldScene=false;
			this.lastUpdate=0;
			this.target=null;
			this.keys=Array(256).fill(false);
			//this.interactables=[];
			
			this.movementTranslationMap=[-1,2,4,3,6,-1,5,-1,0,1,-1,-1,7,-1,-1,-1];

		 /* 	$(document).on('keydown.Player',this.onKeydown.bind(this));
			$(document).on('keyup.Player',this.onKeyup.bind(this)); */
			//$(window.canvas.getCanvas()).on('mousedown.Player',this.onMousedown.bind(this));
			
		}
		loadFromProperties(p_properties){
			super.loadFromProperties(p_properties);
			this.layer=p_properties.hasOwnProperty("layer")?p_properties.layer:"";
			this.animsrc=p_properties.animsrc==undefined?false:p_properties.animsrc;
			this.id=p_properties.hasOwnProperty("id")?p_properties.id:"";
			this.hp=p_properties.hasOwnProperty("hp")?p_properties.hp:100;
			this.mana=p_properties.hasOwnProperty("mana")?p_properties.mana:10;
			/* if(window.currentScene.getSceneProperty('worldscene')){
				this.loadFromSession();
			} */
			if(this.animsrc!=false){
				if(this.getChildById(this.id+'_playeranim')==null){
					let anim=new SpriteAnimation();
					anim.loadFromProperties({'x':0,'y':0,'animsrc':this.animsrc,'id':this.id+'_playeranim','serializable':false});
					this.append(anim);
				}
			}
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!=-1){return null;}
			
			obj.hp=this.hp;
			obj.mana=this.mana;
			obj.animsrc=this.animsrc;
			
			
			return super.Serialize(obj,exempt);
		}
		postLoad(){
			//this.interactables=window.SceneManager.getItemsByType(Interactable);
		}
		setLocation(x,y){
			this.x=x;
			this.y=y;
			
			this.saveLocation();
		}
		append(child){
			super.append(child);
			if(child.type=="Animation"){
				this.animationCollection.append(child);
			}
		}
		onKeydown(event){
			if(window.menuOpen){return;}
			this.keys[event.which]=true;
		}
		onKeyup(event){
			if(window.menuOpen){return;}
			this.keys[event.which]=false;
		}
		saveLocation(){
			window.Session.setItem('player',JSON.stringify(
				{
					'x':this.x,
					'y':this.y
				}
			));
		}
		Unload(){
		/* 	$(window.canvas.getCanvas()).off('keydown.Player');
			$(window.canvas.getCanvas()).off('keyup.Player');
			
			this.saveLocation();
			
			this.GUI=null; */
			super.Unload();
		}
		loadFromSession(){
			if(!window.Session.hasItem('player')){return;}
			let saved=JSON.parse(window.Session.getItem('player'));
			this.x=Math.round(saved.x);
			this.y=Math.round(saved.y);
		}
	}
	
	
	Player.prototype.onUpdate=function(time){
		for(var i=0;i<this.children.length;i++){
			this.children[i].onUpdate(time);
		}
	}

	Player.prototype.updateAnimationAfterMovement=function(dx,dy){
		if(Math.abs(dx)>=Math.abs(dy)){
			if(dx>0){
				this.animationCollection.each(function(item){item.setAnimation("walk_right");});
			}else{
				this.animationCollection.each(function(item){item.setAnimation("walk_left");});
			}
		}else{
			if(dy>0){
				this.animationCollection.each(function(item){item.setAnimation("walk_down");});
			}else{
				this.animationCollection.each(function(item){item.setAnimation("walk_up");});
			}
		}
	}
	
	Player.prototype.onRender=function(ctx){
		var wc=this.calculateWorldCoordinates();
		
		for(var i=0;i<this.children.length;i++){
			this.children[i].onRender(ctx);
		}
	}
	/* Player.prototype.onKeyup=function(event){
		let w=event.which;
		this.keyMap[w]=false;
	}
	Player.prototype.onKeydown=function(event){
		let w=event.which;
		this.keyMap[w]=true;
		
	} */
	
	window.Player=Player;
	
	
	
})();