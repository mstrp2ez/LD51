"use strict";


class RenderSnapshot{
	constructor(){
		
	}
	generateRenderSnapshot(items){
		let canvas=window.canvas.getCanvas();
		let ctx=canvas.getContext('2d');
		ctx.fillStyle='#000';
		ctx.clearRect(0,0,canvas.width,canvas.height);
		
		let maxX=0;
		let maxY=0;
		for(let i=0;i<items.length;i++){
			let item=items[i];
			let x=item.x+item.getWidth();
			let y=item.y+item.getHeight();
			maxX=x>maxX?x:maxX;
			maxY=y>maxY?y:maxY;
		}
		
		let numIterX=Math.floor(maxX/canvas.width)+1;
		let numIterY=Math.floor(maxY/canvas.height)+1;
		let scaleX=1;
		let scaleY=1;
		
		//let tmp=$(`<canvas width="${numIterX*canvas.width}" height="${numIterY*canvas.height}"></canvas>`)[0];
		let tmp=document.createElement('canvas');
		tmp.setAttribute('width',numIterX*maxX);//canvas.width);
		tmp.setAttribute('height',numIterY*maxY);//canvas.height);
		let tmpCtx=tmp.getContext('2d');
		
		
		for(let iterY=0;iterY<numIterY;iterY++){
			for(let iterX=0;iterX<numIterX;iterX++){
				ctx.save();
					for(let i=0;i<items.length;i++){
						let item=items[i];  //temporarily offset item so that top left becomes 0,0 (based on shift in x and y) 
						let tx=item.x;
						let ty=item.y;
						item.x-=canvas.width*iterX;
						item.y-=canvas.height*iterY;
						item.onRender(ctx);
						
						item.x=tx;
						item.y=ty;
					}
					
					let cw=Math.min(canvas.width,maxX);
					let ch=Math.min(canvas.height,maxY)
					let imgData=ctx.getImageData(0,0,cw,ch);
					tmpCtx.putImageData(imgData,iterX*cw,iterY*ch);
					ctx.clearRect(0,0,canvas.width,canvas.height);
				ctx.restore();
			}
		}

		return {'src':tmp.toDataURL(),'scalex':scaleX,'scaley':scaleY};
	}
}