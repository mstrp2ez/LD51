"use strict";


(function(){
	
	class Hero extends SpriteAnimation{
		constructor(params){
			super(params);
			this.conveyorIdx=0;
			this.conveyorMovementKeys=[38,40]
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
		}
		onKeydown(event){
			
			if(this.conveyorMovementKeys.indexOf(event.which)!=-1){
				if(event.which==38){
					this.setActiveConveyor(0);
				}else if(event.which==40){
					this.setActiveConveyor(1);
				}
				return;
			}
			
			const conveyor=SceneManager.getItemById("conveyor"+this.conveyorIdx);
			if(!conveyor){return;}
			
			conveyor.onHit(event.key.charCodeAt(0));
			
			this.setAnimation("cut");
			this.registerEventlistener("end_of_animation",function(){
				this.setAnimation("idle");
				return false;
			}.bind(this));
		}
		setActiveConveyor(idx){
			if(idx!=this.conveyorIdx){
				this.setAnimation("poof");
				this.registerEventlistener("end_of_animation",function(){
					this.setAnimation("idle");
					return false;
				}.bind(this));
			}
			this.conveyorIdx=idx;
			const conveyor=SceneManager.getItemById("crategen"+this.conveyorIdx);
			const point=conveyor.getHeroPoint();
			this.x=point.x;
			this.y=point.y;
		}
	}
	
	
	window.Hero=Hero;
	
})();