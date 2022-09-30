"use strict";


class Projectile extends SceneItem{
	constructor(params){
		super(params);
		this.dead=false;
		this.projPattern=new MissileProjectileTravelPattern();
		this.dmg=1;
		this.parentTower=null;
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		
		const travelSide=params.side??=rand(0,100)>50?1:-1;
		this.target=params.target ??= null;
		this.projectileSpeed=params.projectilespeed ??= 10;
		this.parentTower=params.parent ??= null;
		this.projPattern.loadFromProperties({
			target:this.target,
			agent:this,
			side:travelSide
		});
		
	}
	getParentTower(){
		return this.parentTower;
	}
	onRender(ctx){
		super.onRender(ctx);
		ctx.fillStyle='#f00';
		ctx.fillRect(this.x,this.y,this.w,this.h);
	}
	onUpdate(time){
		super.onUpdate(time);
		this.projPattern.onUpdate(time);
	}
	isDead(){
		return this.dead;
	}
	setDead(dead){
		this.dead=dead;
	}
}
class SplashProjectile extends Projectile{
	constructor(params){
		super(params);
		this.dead=false;
		this.projPattern=new SplashProjectileTravelPattern();
		this.dmg=10;
		this.parentTower=null;
		this.splashRadius=50;
	}
	onHit(){
		const hostiles=SceneManager.getItemsByType(Hostile);
		const splashPoint={x:this.x,y:this.y};
		const splashTargets=hostiles.forEach((item) => {
			const d=distanceTo(splashPoint,item);
			if(d<=this.splashRadius){
				item.onHit(this);
			}
		});
		
		this.dead=true;
	}
}

class ProjectileTravelPattern extends SceneItem{
	constructor(params){
		super(params);
		this.target=null;
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		this.target=params.target ??= null;
		this.agent=params.agent ??= null;
	}
	onUpdate(time){
		if(!this.target||!this.agent||this.agent.isDead()){return;}
		this.travelToTarget();
	}
	travelToTarget(){
		let agent=this.agent;
		let target=this.target;
		let dx=target.x-agent.x;
		let dy=target.y-agent.y;
		const d=Math.sqrt(dx*dx+dy*dy);
		
		if(d<=agent.projectileSpeed){
			this.onHit(agent,target);
			return;
		}
		
		dx/=d;
		dy/=d;

		agent.x+=(dx*agent.projectileSpeed);
		agent.y+=(dy*agent.projectileSpeed);
	}
	onHit(agent,target){
		if(target.onHit!==undefined){
			target.onHit(agent);
		}
		target=null;
		agent.setDead(true);
	}
}

class MissileProjectileTravelPattern extends ProjectileTravelPattern{
	constructor(params){
		super(params);
		this.target=null;
		this.lastUpdate=null;
		this.locked=false;
		this.velocity={x:0,y:0};
		this.speed=2;
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		/* this.target=params.target ??= null;
		this.agent=params.agent ??= null; */
		this.side=params.side??=1;
		this.lockOnDelay=params.lockondelay ??= 500;
	}
	onUpdate(time){
		if(!this.target||!this.agent||this.agent.isDead()){return;}
		if(this.lastUpdate==null){
			this.lastUpdate=time;
		}
		if(this.locked){
			super.onUpdate(time);
		}else{
			const d={x:this.target.x-this.agent.x,y:this.target.y-this.agent.y};
			const perpend={x:d.y,y:-d.x};
			let impulse=normalize(perpend);
			impulse={x:impulse.x*this.side,y:impulse.y*this.side};
			
			this.velocity={x:impulse.x*this.speed,y:impulse.y*this.speed};
		}
		this.agent.x+=this.velocity.x;
		this.agent.y+=this.velocity.y;
		
		if(time-this.lastUpdate>this.lockOnDelay){
			this.locked=true;
		}
	}
}

class SplashProjectileTravelPattern extends ProjectileTravelPattern{
	constructor(params){
		super(params);
		this.target=null;
		this.lastUpdate=null;
		this.speed=2;
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		
	}
	onUpdate(time){
		if(!this.target||!this.agent||this.agent.isDead()){return;}
		this.travelToTarget();
	}
	onHit(agent,target){
		agent.onHit();
		const explosion=new AnimationEffect();
		explosion.loadFromProperties({
			src:AnimationEffectTypes_EXPLOSION,
			x:agent.x,
			y:agent.y,
			w:agent.w,
			h:agent.h
		});
		
		SceneManager.append(explosion);
	}
}