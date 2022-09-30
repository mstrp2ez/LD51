"use strict";


(function(){
	
	class Crate extends Sprite{
		constructor(params){
			super(params);
			this.endpoint={};
			this.startpoint={};
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			
			this.endpoint = params.endpoint ??= {x:800,y:100};
			this.startpoint={x:this.x,y:this.y};
		}
		onUpdate(time){
			this.x+=2;
			
			if(this.x>=this.endpoint.x){
				this.x=this.startpoint.x;
			}
		}
		
		
	}
	window.Crate=Crate;
	
})()