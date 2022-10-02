"use strict";

(function(){
	
	class Clock extends SceneItem{
		constructor(params){
			super(params);
			this.duration=1000;
			this.time=10;
			this.lastUpdate=0;
			this.intervalHandle=-1;
			this.oneshot=false;
		}
		setClock(time){
			this.time=time;
			if(this.time<0){this.time=0;}
		}
		startClock(oneshot){
			this.oneshot=oneshot;
			this.intervalHandle=setInterval(function(){
				this.time--;
				if(this.time<0){
					if(this.oneshot){
						this.stopClock();
					}
					else{
						this.time=10;
					}
				}
			}.bind(this),this.duration);
		}
		stopClock(){
			clearInterval(this.intervalHandle);
		}
		onRender(ctx){
			super.onRender(ctx);
			
			const wc=this.calculateWorldCoordinates();
			ctx.save();
				ctx.fillStyle='#333';
				ctx.font="24px sans-serif";
				ctx.fillText(''+this.time,wc.x,wc.y);
			ctx.restore();
		}
		
	}
	
	
	window.Clock=Clock;
	
	
})();