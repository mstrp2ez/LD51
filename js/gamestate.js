"use strict";


(function(){
	
	class GameState{
		constructor(){
			this.income=0;
			this.cost=0;
			this.gameover=false;
		}
		setGameOver(go){
			this.gameover=go;
		}
		getGameOver(){
			return this.gameover;
		}
		setIncome(inc){
			this.income=inc;
		}
		getIncome(){
			return this.income;
		}
		setCost(cost){
			this.cost=cost;
		}
		getCost(){
			return this.cost;
		}
		getProfit(){
			return this.income-this.cost;
		}

	}
	window.GameState=new GameState();
	
})();