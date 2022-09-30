"use strict";


(function(){
	const DIALOG_PADDING=10;
	const PROXIMITY_LIFE_SPAN=1500;
	const INTERACTABLE_PROXIMITY_DISTANCE=64;
	const INTERACTABLE_INTERACT_DISTANCE=50;
	const NPC_INTERACT_KEY=69;
	class NPC extends Interactable{
		constructor(params,parent){
			super(params);
			this.anim=null;
			this.animSrc="";
			this.loaded=false;
			this.lastUpdate=0;
			this.idleChangeTime=10000;
			this.dialog={};
			this.activeDialogIndex=0;
			this.activeDialog=false;
			this.proximityLastUpdate=0;
			this.proximityLifespan=false;
			this.playerHandle=null;
			this.playerHasLeftProximity=true;
			this.interactRange=0;
			this.proximityRange=INTERACTABLE_PROXIMITY_DISTANCE;
			this.proximityIndex=0;
			this.interactIndex=0;
			
			$(document).on(`keydown.NPC`,this.onKeydown.bind(this));
		}
		onKeydown(event){
			if(event.which==NPC_INTERACT_KEY){
				if(this.dialog.interact!==undefined){
					if(distanceTo(this.playerHandle,this)<this.interactRange){
						this.removeDialog();
						this.interact();
					}
				}
			}
		}
		Unload(){
			this.removeDialog();
			$(document).off(`keydown.NPC`);
		}
		
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.animSrc=params.animsrc===undefined?params.animSrc:params.animsrc;
			this.dialog=params.dialog===undefined?false:params.dialog;
			this.interactRange=params.interactrange===undefined?INTERACTABLE_INTERACT_DISTANCE:params.interactrange;
			this.proximityRange=params.proximityRange===undefined?INTERACTABLE_PROXIMITY_DISTANCE:params.proximityRange;
			
			this.loadAnimation();
		}
		postLoad(){
			this.playerHandle=SceneManager.getItemById('player');
			let tilemap=SceneManager.getItemById('tilemap');
			if(!tilemap){return;}
			tilemap.registerEventListener('tilemap_loaded',function(tm){
				let tile=tm.getTileByCoord(this.x,this.y);
				if(tile==null){return;}
				tile.setIndex(15);
				tm.calculateNeighbors();
			}.bind(this));
		}
		loadAnimation(){
			if(this.anim!=null){
				this.anim.Unload();
				this.removeChild(this.anim);
			}
			this.anim=new SpriteAnimation({'serializable':false});
			this.anim.registerEventlistener('animation_loaded',function(){
				this.anim.setRandomAnimation(false);
				this.loaded=true;
			}.bind(this));
			this.anim.Load(this.animSrc);
			this.append(this.anim);
		}
		onRender(ctx){
			if(!this.loaded){return;}
			
			if(this.activeDialog){
				this.activeDialog.onRender(ctx);
			}
			
			super.onRender(ctx);
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!==-1){return null;}
			obj.animSrc=this.animSrc;
			obj.dialog=this.dialog;
			obj.interactRange=this.interactRange;
			obj.proximityRange=this.proximityRange;
			
			return super.Serialize(obj,exempt);
		}
		onUpdate(time){
			if(!this.loaded){return;}
			
			if(time-this.lastUpdate>this.idleChangeTime){
				this.anim.setRandomAnimation(false);
				this.lastUpdate=time;
			}
			
			if(this.activeDialog){
				this.activeDialog.onUpdate(time);
				if(this.activeDialog.shouldClose()){
					this.removeDialog();
				}else if(this.activeDialog.isDone()){
					if(this.proximityLifespan==false){
						this.proximityLifespan=time+PROXIMITY_LIFE_SPAN;
					}else if(this.proximityLifespan-time<=0){
						this.removeDialog();
					}
				}
			}else{
				if(this.dialog.proximity!==undefined&&this.dialog.proximity.length>0){
					let dist=distanceTo(this.playerHandle,this);
					if(dist<this.proximityRange){
						if(this.playerHasLeftProximity){
							this.proximity();
							this.proximityLastUpdate=time;
							this.playerHasLeftProximity=false;
						}
					}else{
						this.playerHasLeftProximity=true;
					}
				}
			}
			
			super.onUpdate(time);
		}
		interact(caller){
			if(!this.loaded||!this.dialog){return;}
			if(this.activeDialog===false){
				if(this.dialog.interact!==undefined&&this.dialog.interact.length>0){
					this.activeDialogIndex=0;
					this.createDialog(this.dialog.interact[this.activeDialogIndex]);
				}
			}else{
				this.removeDialog(this.activeDialog);
				this.createDialog(this.dialog.interact[this.activeDialogIndex]);
			}
		}
		proximity(caller){
			if(!this.loaded||!this.dialog){return;}
			if(!this.activeDialog){
				if(this.dialog.proximity!==undefined&&this.dialog.proximity.length>0){
					let text=this.dialog.proximity[this.proximityIndex];
					this.createDialog(text);
					this.proximityIndex++;
					if(this.proximityIndex>=this.dialog.proximity.length){this.proximityIndex=0;}
				}
			} 
		}
		createDialog(text){
			let wc=this.calculateWorldCoordinates();
			let dialogBox=new DialogWidget({'x':wc.x,
				'y':wc.y,
				'w':175,
				'h':100,
				'scrollspeed':50,
				'gradient':{
					'start':'#0A1638',
					'end':'#122968'
				},
				'border':'#eee',
				'text':text,
				'layer':100});
			dialogBox.y=wc.y-(dialogBox.h+DIALOG_PADDING);
			this.activeDialog=dialogBox;
		}
		removeDialog(){
			if(this.activeDialog){
				this.activeDialog.Unload();
			}
			this.activeDialog=false;
			this.proximityLifespan=false;
		}
	}
	
	window.NPC=NPC;
	
	
})();