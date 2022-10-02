"use strict";


(function(){
	
	class CrateGenerator extends SceneItem{
		constructor(params){
			super(params);
			this.rate=1000;
			this.template={};
			this.lastUpdate=performance.now();
			this.heroPoint={};
			this.cooldown=1000;
			this.count=5;
			this.currentCount=this.count;
			this.onCooldown=false;
			this.cooldownCount=performance.now();
			this.clockid="noclock";
			this.offset=0;
			this.warningBeaconTarget="notarget";
			this.warningbeacon=null;
			this.crateSpeed=1;
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.rate = params.rate ??= this.rate;
			this.template = params.template ??= this.template;
			this.heroPoint=params.heropoint ??= this.heroPoint;
			this.cooldown=params.cooldown ??= this.cooldown;
			this.count=params.count ??= this.count;
			this.currentCount=this.count;
			this.clockid=params.clockid??=this.clockid;
			this.offset=params.offset ??= this.offset;
			this.lastUpdate+=this.offset;
			this.warningBeaconTarget=params.warningbeacontarget??=this.warningBeaconTarget;
		}
		postLoad(){
			this.children.forEach(x => x.postLoad());
			this.warningbeacon=SceneManager.getItemById(this.warningBeaconTarget);
		}
		onUpdate(time){
			
			
			const dead=this.children.filter(x => {
				return x.isDead();
			});
			dead.forEach(x => { 
				x.Unload();
				this.children.splice(this.children.indexOf(x),1);
			});
			
			if(!this.onCooldown){
				const delta=time-this.lastUpdate;
				if(delta > this.rate){
					this.spawnCrate();
					this.currentCount--;
					if(this.currentCount<=0){
						this.endWave();
					}
					
					this.lastUpdate=time;
				}
			}else{
				const delta=time-this.cooldownCount;
				const clock=SceneManager.getItemById(this.clockid);
				const diff=Math.floor(this.cooldown-delta);
				
				if(diff<=0){
					this.newWave();
				}
				if(clock){
					clock.setClock(Math.floor(diff/1000));
				}
			}
			super.onUpdate(time);
		}
		setCrateSpeed(speed){
			this.crateSpeed=speed;
		}
		getCrateSpeed(){
			return this.crateSpeed;
		}
		setRate(rate){
			this.rate=rate;
			if(rate<500){this.rate=500;}
		}
		getRate(){
			return this.rate;
		}
		newWave(){
			this.onCooldown=false;
			this.currentCount=this.count;
			if(this.warningbeacon!=null){
				this.warningbeacon.setAnimation("warning");
			}
		}
		endWave(){
			this.onCooldown=true;
			this.cooldownCount=performance.now();
			if(this.warningbeacon!=null){
				this.warningbeacon.setAnimation("allclear");
			}
			
			/* const clock=SceneManager.getItemById(this.clockid);
			if(clock){
				clock.setClock(this.cooldown/1000);
				//clock.startClock(true);
			} */
		}
		spawnCrate(){
			const newCrate=new Crate();
			const templ=Object.assign({x:0,y:0,cache:true,speed:this.crateSpeed},this.template);
			newCrate.loadFromProperties(templ).then(x => {
				this.append(newCrate);
				newCrate.postLoad();

				const gs=window.GameState;				
				if(gs!==undefined){
					gs.setCost(gs.getCost()+newCrate.cost);
				}
			});
			
			
		}
		getCrates(){
			return this.children;
		}
		getHeroPoint(){
			return this.heroPoint;
		}
	}
	window.CrateGenerator=CrateGenerator;
	
	class Crate extends SpriteAnimation{
		constructor(params){
			super(params);
			this.endpoint={};
			this.startpoint={};
			this.dead=false;
			this.key=rand(97,122);
			this.isHit=false;
			this.creationComplete=false;
			this.isDestroying=false;
			this.destroyTarget="";
			this.cost=100;
			this.quality=0;
			this.speed=1;
		}
		loadFromProperties(params){
			return super.loadFromProperties(params).then(x => {
				this.endpoint = params.endpoint ??= {x:800,y:100};
				this.startpoint={x:this.x,y:this.y};
				this.destroyTarget=params.destroytarget;
				this.speed=params.speed??=this.speed;
			});
		}
		setSpeed(speed){
			this.speed=speed;
		}
		getQuality(){
			return this.quality;
		}
		postLoad(){
			this.setAnimation("create");
			this.registerEventlistener("end_of_animation",this.onCreateAnimationEnd.bind(this));
		}
		onCreateAnimationEnd(){
			this.setAnimation("idle");
			this.creationComplete=true;
		}
		onUpdate(time){
			if(this.dead){return;}
			super.onUpdate(time);
			if(!this.creationComplete){return;}
			this.x+=this.speed;
			
			const wc=this.calculateWorldCoordinates();
			if(wc.x>=this.endpoint.x){
				this.onDestroy();
			}
		}
		onRender(ctx){
			if(this.dead){return;}
			super.onRender(ctx);
			if(this.isHit||!this.creationComplete){return;}

			const wc=this.calculateWorldCoordinates();
			ctx.fillStyle='#eee';
			ctx.font="24px sans-serif";
			ctx.fillText(String.fromCharCode(this.key),wc.x+this.getWidth()/3,wc.y+this.getHeight()/1.5);
		}
		onDestroy(){
			if(this.isDestroying){return;}
			this.isDestroying=true;
			this.creationComplete=false;
			this.setAnimation("destroy");
			this.stopAtEndOfAnimation=true;
			this.registerEventlistener("end_of_animation",function(){
				this.dead=true;
				return false;
			}.bind(this));
			
			const destroyAnim=SceneManager.getItemById(this.destroyTarget);
			if(!destroyAnim){return;}
			destroyAnim.setAnimation("destroy");
			destroyAnim.registerEventlistener("end_of_animation",function(){
				destroyAnim.setAnimation("idle");
				return false;
			}.bind(this));
			
			const truck=SceneManager.getItemById("truck");
			if(truck!=undefined){
				truck.setProgress(truck.getProgress()+this.quality);
			}
		}
		isDead(){
			return this.dead;
		}
		getKey(){
			return this.key;
		}
		onHit(zone){
			if(this.isHit){return;}
			const conv=["badquality","midquality","goodquality"];
			this.quality=zone*5;
			if(zone<0||zone>=conv.length){return;}
			this.setAnimation(conv[zone]);
			this.isHit=true;
		}
	}
	window.Crate=Crate;
	
})()