"use strict";

const WAVE_DELAY=10000;
class WaveManager extends SceneItem{
	constructor(params){
		super(params);
		
		this.lastUpdate=0;
		this.transitionTime=0;
		this.transition=true;
		this.waveIdx=0;
		this.waves=[];
		this.currentWave=null;
	}
	loadFromProperties(params){
		this.waveDelay=params.wavedelay??=WAVE_DELAY;
		this.transitionTime=this.waveDelay;
		this.splashTextID=params.splashtextid??='';
		
		const gui=window.currentScene.getGUI();
		this.splashTextWidget=gui.getWidgetByName(this.splashTextID);
		if(this.splashTextWidget==null){
			throw "Splash text widget not present";
		}
		
		setTimeout(this.startWave.bind(this),this.waveDelay);
	}
	append(child){
		super.append(child);
		if(child instanceof MonsterWave){
			this.waves.push(child);
		}
	}
	isCurrentWaveComplete(){
		const currentWave=this.getCurrentWave();
		return currentWave?currentWave.isComplete():null;
	}
	getCurrentWave(){
		if(this.waveIdx>=this.waves.length||this.waveIdx<0){return null;}
		return this.waves[this.waveIdx];
	}
	startWave(){
		this.transition=false;
		this.transitionTime=this.waveDelay;
		const currentWave=this.getCurrentWave();
		if(currentWave){
			this.splashTextWidget.splashText(currentWave.name,2000);
		}
	}
	nextWave(){
		this.waveIdx++;
	}
	endWave(){
		this.transition=true;
		
		this.nextWave();
		setTimeout(this.startWave.bind(this),this.waveDelay);
	}
	onUpdate(time){
		if(this.isCurrentWaveComplete()){
			this.endWave();
		}
		if(!this.transition){
			const currentWave=this.getCurrentWave();
			if(currentWave!==null){
				currentWave.onUpdate(time);
			}
		}else{
			if(time-this.lastUpdate>1000){
				this.transitionTime-=1000;
				this.splashTextWidget.splashText("Next wave starts in: "+this.transitionTime/1000,1000);
				this.lastUpdate=time;
			}
		}
	}
}
window.WaveManager=WaveManager;

class MonsterWave extends SceneItem{
	constructor(params){
		super(params);
		
		this.lastUpdate=0;
		this.spawnedHostiles=[];
	}
	loadFromProperties(params){
		this.waves=params.wave??=[];
		this.name=params.name??="Wave ???";
		this.col=params.col??=0;
		this.row=params.row??=0;
		this.endCol=params.endcol;
		this.endRow=params.endrow;
		this.spawnPoints=[];
		this.target=null;
		if(this.endCol&&this.endRow){
			this.target={col:this.endCol,row:this.endRow};
		}
		
		this.x=this.col*TILE_SIZE;
		this.y=this.row*TILE_SIZE;
		
		this.waves.forEach(x => x.lastUpdate=0);
		
		
	}
	postLoad(){
		const tm=SceneManager.getItemById("tilemap");
		const startTiles=tm.getTilesByType(window.StartTile);
		startTiles.forEach(x => {
			this.spawnPoints.push(x);
		});
		this.spawnPoints.push({col:this.col,row:this.row});
	}
	onRender(ctx){
		ctx.fillStyle='#f00';
		ctx.fillRect(this.x,this.y,32,32);
	}
	onUpdate(time){
		this.waves.forEach(wave => {
			if(wave.count>0&&time-wave.lastUpdate>wave.interval){
				wave.lastUpdate=time;
				wave.count-=1;
				this.spawnMonster(wave.type,wave.template);
			}
		});
		//this.spawnedHostiles=this.spawnedHostiles.filter(x => x.isDead());
	}
	isComplete(){
		const remaining=this.waves.filter(x => x.count>0);
		const alive=this.spawnedHostiles.filter(x => !x.isDead());
		return remaining.length<=0&&alive.length<=0;
	}
	spawnMonster(type,template){
		try{
			const startTile=this.spawnPoints[rand(0,this.spawnPoints.length-1)];
			template = Object.assign(template, {col:startTile.col,row:startTile.row,target:this.target});
			let newMonster=new window[type]();
			newMonster.loadFromProperties(template);
			this.spawnedHostiles.push(newMonster);
			SceneManager.append(newMonster);
		}catch(error){
			console.error(error);
		}
	}
}

window.MonsterWave = MonsterWave;