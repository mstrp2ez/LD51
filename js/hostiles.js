"use strict";


class Hostile extends SpriteAnimation{
	constructor(params){
		super(params);
		
		this.dead=false;
		this.lastNode=null;
		this.moveTime=2000;
		this.moveDelta=0;
		this.currentTargetNode=null;
		this.lastUpdate=0;
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		
		this.hp=params.hp??=2;
		this.col=params.col ??= 0;
		this.row=params.row ??= 0;
		this.target=params.target ??= null;
		this.color = params.color ??= '#0f0';
		this.speed= params.speed ??= 1;
		
		this.offset={x:0,y:0};
		if(params.offset!==undefined){
			const offsetMin={x:-params.offset.x,y:-params.offset.y};
			const offsetMax={x:params.offset.x,y:params.offset.y};
			this.offset={x:rand(offsetMin.x,offsetMax.x),y:rand(offsetMin.y,offsetMax.y)};
		}
		
	}
	isDead(){
		return this.dead;
	}
	onUpdate(time){
		if(this.isDead()){
			this.die();
			return;
		}
		
		if(this.moveTargetList==null){
			const tm=SceneManager.getItemById('tilemap');
			if(!tm.isLoaded()){return;}
			this.lastNode=tm.getTileByColRow(this.col,this.row);
			this.target=tm.getTilesByType(EndTile)[0];
			let end=null;
			if(this.target==null){
				end=tm.getRandomPathableNode();
			}else{
				end=tm.getTileByColRow(this.target.col,this.target.row);
			}
			
			const as=new AStar();
			this.moveTargetList=as.path(this.lastNode,end);
		}
		
		if(this.currentTargetNode==null){
			this.currentTargetNode=this.moveTargetList.pop();
			const node=this.currentTargetNode.node;		
			const subDivs=node.getPathingSubdivisions();
			node.subdiv=subDivs[randomNumberBetween(0,subDivs.length)];
		}
		if(this.moveTargetList.length<=0&&this.currentTargetNode==null){
			this.moveTargetList=null;
			this.die();
			return;
		}
		
		if(this.lastUpdate==0){this.lastUpdate=time;}
		
		const deltaT=time-this.lastUpdate;
		this.lastUpdate=time;
		let t=(10000-this.speed);
		t=t==0?0.1:t;
		const dt=deltaT/t;
		this.moveDelta+=dt; //divide by time to move from a to b
		
		if(this.currentTargetNode!==null){
			this.moveTowardsNode(this.lastNode,this.currentTargetNode.node);
		}
		if(this.moveDelta>=1){
			this.lastNode=this.currentTargetNode.node;
			this.col=this.lastNode.col;
			this.row=this.lastNode.row;
			
			//this.currentTargetNode.node.setSelected(false);
			this.currentTargetNode=null;
			
			this.moveDelta=0;
		} 
		super.onUpdate(time);
	}
	/* Load(src){
		super.Load(src).then(()=>{
			this.setAnimation("walk_left");
		});
	} */
	moveTowardsNode(source,target){
		target=target.subdiv;   //go towards subdivision node in tile
		
		const sourceX=source.col*source.w+source.w/2-this.w/2;
		//const targetX=target.col*target.w+target.w/2-this.w/2;
		const targetX=target.x+target.w/2-this.w/2;
		const sourceY=source.row*source.h+source.h/2-this.h/2;
		//const targetY=target.row*target.h+target.h/2-this.h/2;
		const targetY=target.y+target.h/2-this.h/2;
		const delta={x:sourceX-targetX,y:sourceY-targetY};
		this.calculateAnimation(delta);
		
		this.x=lerpBetween(sourceX,targetX,this.moveDelta);
		this.y=lerpBetween(sourceY,targetY,this.moveDelta);
	}
	calculateAnimation(delta){
		
		if(Math.abs(delta.x)>Math.abs(delta.y)){
			if(delta.x<0){
				this.setAnimation("walk_right");
			}else{
				this.setAnimation("walk_left");
			}
		}else{
			if(delta.y<0){
				this.setAnimation("walk_down");
			}else{
				this.setAnimation("walk_up");
			}
		}
	}
	onHit(agent){
		this.hp-=agent.dmg;
		if(this.hp<=0&&!this.isDead()){
			this.die();
			const tower=agent.getParentTower();
			if(tower!==undefined){
				tower.onKill(this);
			}
		}
	}
	die(){
		this.dead=true;
		SceneManager.removeItem(this);
		this.Unload();
	}
	getSpeed(){
		return this.speed;
	}
	setSpeed(speed){
		this.speed=speed;
	}
}


class Zombie extends Hostile{
	constructor(params){
		super(params);
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		
	}
	
	onRender(ctx){
		super.onRender(ctx);
		
		if(this.animsrc.length<=0){
			ctx.fillStyle=this.color;
			ctx.fillRect(this.x+this.offset.x,this.y+this.offset.y,this.w,this.h);
		}
	}
	onUpdate(time){
		super.onUpdate(time);
	}
}

window.Zombie=Zombie;

class Runner extends Hostile{
	constructor(params){
		super(params);
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
	}
	onUpdate(time){
		super.onUpdate(time);
	}
	onRender(ctx){
		ctx.fillStyle="#999";//this.color;
		ctx.fillRect(this.x+this.offset.x,this.y+this.offset.y,this.w,this.h);
	}
}

window.Runner=Runner;


class EntitySpawner extends SceneItem{
	constructor(params){
		super(params);
		
		this.spawnedEntities=[];
		this.lastUpdate=0;
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
		
		this.spawnRate=params.spawnrate ??= 1000;
		this.spawnTemplate=params.spawnTemplate??=null;
	}
	onUpdate(time){
		
		const delta=time-this.lastUpdate;
		if(delta>=this.spawnRate){
			this.spawnEntity();
			this.lastUpdate=time;
		}
	}
	spawnEntity(){
		if(this.spawnTemplate==null){return;}
		let ent=new window[this.spawnTemplate.type]();
		ent.loadFromProperties(this.template);
		ent.x=this.x;
		ent.y=this.y;
		SceneManager.append(ent);
	}
}

window.EntitySpawner=EntitySpawner;