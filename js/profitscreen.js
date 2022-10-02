"use strict";


(function(){
	
	class ProfitScreen extends Sprite{
		constructor(params){
			super(params);
			
			this.income=0;
			this.cost=0;
			this.profit=0;
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			
		}
		onUpdate(time){
			super.onUpdate(time);
			
			const gs=window.GameState;
			if(gs==undefined){return;}
			
			this.income=gs.getIncome();
			this.cost=gs.getCost();
			this.profit=gs.getProfit();
			
		}
		onRender(ctx){
			super.onRender(ctx);
			
			const wc=this.calculateWorldCoordinates();
			ctx.save();
				ctx.fillStyle="#5A893B";
				ctx.font="18px sans-serif";
				ctx.fillText("Income: $"+this.income,wc.x+35,wc.y+35);
				ctx.fillText("Cost: $"+this.cost,wc.x+35,wc.y+55);
				ctx.fillText("Profit: $"+this.profit,wc.x+35,wc.y+75);
			ctx.restore();
		}
	}
	
	window.ProfitScreen=ProfitScreen;
})();