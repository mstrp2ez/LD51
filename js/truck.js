"use strict";


(function(){
	const MAX_STAGES=4;
	class Truck extends SpriteAnimation{
		constructor(params){
			super(params);
			
			this.progress=0;
			this.maxprogress=100;
			//progress from 0 to 100%, every x% go to next animation. Progress is increased more or less depending on the quality of the components delivered
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			
		}
		setProgress(prog){
			this.progress=prog;
			if(this.progress>100){
				this.progress=0;
				this.setAnimation("finished");
				this.registerEventlistener("end_of_animation",function(){
					const gs=window.GameState;
					gs.setIncome(gs.getIncome()+10500);
					this.setAnimation("stage0");
					this.stopAtEndOfAnimation=true;
					return false;
				}.bind(this));
			}else{
				this.setAnimation("stage"+this.calculateStage());
			}
			
			this.stopAtEndOfAnimation=true;
		}
		getProgress(){
			return this.progress;
		}
		calculateStage(){
			const step=this.maxprogress/MAX_STAGES;
			return Math.floor(this.progress/step);
		}
		onUpdate(time){
			super.onUpdate(time);
			
			
			
		}
		onRender(ctx){
			super.onRender(ctx);
			
			const wc=this.calculateWorldCoordinates();
			ctx.save();
				ctx.fillStyle="#333";
				ctx.font="24px sans-serif";
				ctx.fillText("Progress: "+this.progress+"%",wc.x,wc.y);
			ctx.restore();
		}
		
	}
	window.Truck=Truck;
	
})();