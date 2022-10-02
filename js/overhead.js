"use strict";

(function(){
	
	class Director extends SpriteAnimation{
		constructor(params){
			super(params);
			this.displayText=false;
			
		}
		loadFromProperties(params){
			return super.loadFromProperties(params).then(()=>{
				this.dialogwidget=new DialogWidget({
					text:"We are really profitable! Let's hire a new manager. ",
					visible:false,
					bgcolor:"#333",
					w:200,
					h:50,
					x:this.getWidth()/1.5,
					y:0,
					scrollspeed:50
				},null);
				this.dialogwidget.setWorldSpaceParent(this);
			});
		}
		say(text,duration){
			this.dialogwidget.reset();
			this.dialogwidget.text=text;
			this.dialogwidget.calculateTextParts();
			this.dialogwidget.visible=true;
			/* setTimeout(function(){
				this.dialogwidget.visible=false;
			}.bind(this),duration); */
		}
		onRender(ctx){
			super.onRender(ctx);
			
			this.dialogwidget.onRender(ctx);
		}
		onUpdate(time){
			super.onUpdate(time);
			
			if(this.dialogwidget.visible){
				if(this.dialogwidget.isDone()){
					this.dialogwidget.visible=false;
				}
			}
			
			this.dialogwidget.onUpdate(time);
		}
	}
	window.Director=Director;
	
	class Manager extends SpriteAnimation{
		constructor(params){
			super(params);
			this.salaryDisplayDuration=2000;
			this.lastUpdate=performance.now();
			this.salary=rand(5000,9000);
			this.showSalary=false;
			
			setInterval(this.giveSalary.bind(this),30000);
		}
		giveSalary(){
			this.showSalary=true;
			this.lastUpdate=performance.now();
			const gs=window.GameState;
			gs.setCost(gs.getCost()+this.salary);
		}
		onUpdate(time){
			super.onUpdate(time);
			
			if(this.showSalary){
				if(time-this.lastUpdate>this.salaryDisplayDuration){
					this.showSalary=false;
					this.lastUpdate=time;
				}
			}
		}
		onRender(ctx){
			super.onRender(ctx);
			if(this.showSalary){
				const wc=this.calculateWorldCoordinates();
				ctx.save();
					ctx.fillStyle="#333";
					ctx.fillRect(wc.x+this.getWidth()/3,wc.y-25,50,20);
					ctx.fillStyle="#78B54F";
					ctx.font="18px sans-serif";
					ctx.fillText("$"+this.salary,wc.x+this.getWidth()/3,wc.y-10);
				ctx.restore();
			}
		}
		
	}
	
	class OverheadManager extends SceneItem{
		constructor(params){
			super(params);
			this.overheadArea={x:600,y:500,w:200,h:300};
			
			this.roles=[
				"manager",
				"PR representative",
				"HR person",
				"agile coach",
				"change leader",
				"innovation officer"
			];
			
			this.intervalHandle=setInterval(this.checkForProfit.bind(this),10000);
		}
		Unload(){
			super.Unload();
			
			clearInterval(this.intervalHandle);
		}
		onUpdate(time){
			super.onUpdate(time);
			
			
		}
		checkForProfit(){
			console.log("check for profit");
			const gs=window.GameState;
			const profit=gs.getProfit();
			if(profit>0){
				this.hireMoreOverhead();
			}else if(profit<0&&profit>-10000){
				this.increaseProduction();
			}else{
				window.GameState.setGameOver(true);
			}
		}
		hireMoreOverhead(){
			const newManager=new Manager();
			newManager.loadFromProperties({
				x:rand(this.overheadArea.x,this.overheadArea.x+this.overheadArea.w),
				y:rand(this.overheadArea.y,this.overheadArea.y+this.overheadArea.h),
				animsrc:"assets/animations/director.json",
				randomAnimation:true
			});
			SceneManager.append(newManager);
			const director=SceneManager.getItemById("director");
			director.say("Wow! We made a real profit this quarter, let's hire a new "+this.roles[rand(0,this.roles.length-1)]+"!",4000);
		}
		increaseProduction(){
			const gen0=SceneManager.getItemById("crategen0");
			const gen1=SceneManager.getItemById("crategen1");
			
			gen0.setRate(gen0.getRate()-100);
			gen0.setCrateSpeed(gen0.getCrateSpeed()+0.1);
			
			gen1.setRate(gen0.getRate()-100);
			gen1.setCrateSpeed(gen0.getCrateSpeed()+0.1);
			
			const director=SceneManager.getItemById("director");
			director.say("#%!&$# We are losing money! Why are the production guys so lazy. Increase production rates now!");
		}
	}
	
	window.OverheadManager=OverheadManager;
})();