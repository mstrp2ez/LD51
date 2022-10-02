"use strict";


(function(){
	
	const HIGH_ZONE_HIT=2;
	const MID_ZONE_HIT=1;
	const LOW_ZONE_HIT=0;
	class Conveyor extends SceneItem{
		constructor(params){
			super(params);
			this.crateGenerator=null;
			this.hitZones={lowZone:{s:0,e:100},midZone:{s:50,e:50},highZone:{s:10,e:150}};
			this.crategentarget="crategen";
			
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			
			this.hitZones=params.hitZones??=this.hitZones;
			this.crategentarget=params.target??=this.crategentarget;
		}
		
		postLoad(){
			this.crateGenerator=SceneManager.getItemById(this.crategentarget);
		}
		onUpdate(time){
			super.onUpdate(time);
		}
		onRender(ctx){
			super.onRender(ctx);
			
			const wc=this.calculateWorldCoordinates();
			const colors=['#0a0','#00a','#a00'];
			let colorIdx=0;
			ctx.save();
				ctx.globalAlpha=0.2;
				for(const obj in this.hitZones){
					ctx.fillStyle=colors[colorIdx%colors.length];
					colorIdx++;
					const zone=this.hitZones[obj];
					const x=wc.x+zone.s;
					const y=wc.y;
					const w=zone.e;
					ctx.fillRect(x,y,w,60);
				}
			ctx.restore();
		}
		onHit(key){
			if(!this.crateGenerator){return;}
			
			const crates=this.crateGenerator.getCrates();
			crates.forEach(crate => {
				if(crate.getKey()!=key){return;}
				
				if(this.isInZone(crate,this.hitZones.highZone)){
					crate.onHit(HIGH_ZONE_HIT);
					return;
				}
				if(this.isInZone(crate,this.hitZones.midZone)){
					crate.onHit(MID_ZONE_HIT);
					return;
				}
				if(this.isInZone(crate,this.hitZones.lowZone)){
					crate.onHit(LOW_ZONE_HIT);
					return;
				}
			}); 
		}
		isInZone(obj,zone){
			const wc=this.calculateWorldCoordinates();
			const cw=obj.calculateWorldCoordinates();
			if(cw.x>=wc.x+zone.s){
				if(cw.x<wc.x+(zone.s+zone.e)){
					return true;
				}
			}
			return false;
		}
	}
	window.Conveyor=Conveyor;
})();