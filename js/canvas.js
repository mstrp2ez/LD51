"use strict";


(function(){
	
	class Canvas{
		constructor(){
			this.canvas=null;
			this.context=null;
			this.backbuffer=null;
			this.bbcontext=null;
			this.bgcolor='#fff';
		}
		setBgColor(color){
			this.bgcolor=color;
		}
		getFrontBufferCanvas(){
			return this.canvas;
		}
		getFrontBufferContext(){
			return this.context;
		}
		createCanvas(width,height,id){
			let newCanvas=document.createElement('canvas');
			newCanvas.setAttribute("id",id);
			newCanvas.setAttribute("width",width);
			newCanvas.setAttribute("height",height);
			return newCanvas;
		}
		build(target,width,height,id){
			let newCanvas=this.createCanvas(width,height,id);
			this.canvas=newCanvas;
			this.context=this.canvas.getContext('2d');
			this.context.imageSmoothingEnabled=false;
			target.appendChild(newCanvas);
			
			this.backbuffer=this.createCanvas(width,height,id+"-bb");//$(`<canvas id="${id}-bb" width="${width}" height="${height}"></canvas>`)[0];
			this.bbcontext=this.backbuffer.getContext('2d');
			this.bbcontext.imageSmoothingEnabled=false;
		}
		clearScreen(){
			this.context.fillStyle=this.bgcolor;
			this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
			
			this.bbcontext.fillStyle=this.bgcolor;
			this.bbcontext.fillRect(0,0,this.backbuffer.width,this.backbuffer.height);
		}
		
		getContext(){
			return this.context;
		}
		
		getCanvas(){
			return this.canvas;
		}
	}
	
	
	
	
	
	window.Canvas=Canvas;
	
})();