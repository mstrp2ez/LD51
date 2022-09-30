"use strict";


class FOW extends SceneItem{
	constructor(params){
		super(params);
		
	}
	loadFromProperties(params){
		super.loadFromProperties(params);
	}
	postLoad(){
		
		this.generateFoW();
	}
	getMaxDimensions(){
		const canvas=window.canvas.getCanvas();
		const maxDimensions=SceneManager.getSceneMaxDimensions();
		return {width:Math.max(canvas.width,maxDimensions.maxX),height:Math.max(canvas.height,maxDimensions.maxY)};
	}
	generateFoW(){
		
		const dimensions=this.getMaxDimensions();
		const width=dimensions.width/64;
		const height=dimensions.height/64;

		let data=new Uint8ClampedArray(width*height*4);
		const row=width*4;
		
		const lightSources=this.getLightsources();
		
		const setPixelData=function(d,idx,r,g,b,alpha){
			alpha??=255;
			d[idx]=r;
			d[idx+1]=g;
			d[idx+2]=b;
			d[idx+3]=alpha;
		}
		const inRowColRange=function(x,y,tiles){
			for(let i=0;i<tiles.length;i++){
				const tile=tiles[i];
				if(x>=tile.x&&x<=tile.x+tile.w){
					if(y>=tile.y&&y<=tile.y+tile.h){
						return tile;
					}
				}
			}
			return null;
		}
		
		for(let x=0;x<row;x+=4){
			for(let y=0;y<height;y++){
				const index=x+(y*row);
				let color=null;
				const realX=(x/4)*64;
				const realY=y*64;
				lightSources.forEach(source => {
					const distance=distanceTo({x:realX,y:realY},source);
					const radius=source.getLightRadius();
					const falloff=source.getLightFalloff();
					const tmp=smoothstep(radius,radius+falloff,distance);
					color=color==null?1*tmp:color*tmp;
				});
				
				setPixelData(data,index,0,0,0,color*255);
			}
		}
		//console.log(data);
		createImageBitmap(new ImageData(data,width,height),0,0,width,height).then(
			(sprite)=>{
				this.image=sprite
		});
	}
	getLightsources(){
		const tm=SceneManager.getItemById("tilemap");
		let sources=tm.getTilesByType(LightSourceTile);
		return sources.concat(SceneManager.getItemsByType(LightSource));
	}
	getStructures(){
		const tm=SceneManager.getItemById("tilemap");
		return tm.getTilesByIndex(15);
	}
	onRender(ctx){
		const dimensions=this.getMaxDimensions();
		//ctx.drawImage(this.image,0,0,dimensions.width,dimensions.height);
	}
}
window.FOW=FOW;