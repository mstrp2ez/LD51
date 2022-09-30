"use strict";

(function(){


	class Grid extends SceneItem{
		constructor(){
			super();
			this.borderWidth=1;
			this.borderColor='#fff';
			this.gridCellSize=32;
			this.numRows=0;
			this.numCols=0;
			this.alpha=0.7;
			this.render=false;
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.borderWidth=setOrDefault(params,"borderwidth",1);
			this.borderColor=setOrDefault(params,"bordercolor",'#fff');
			this.gridCellSize=setOrDefault(params,"gridcellsize",32);
			this.id=setOrDefault(params,"id","");
			this.alpha=setOrDefault(params,"alpha",this.alpha);
			this.render=setOrDefault(params,"visible",false);
			
			let cnvs=window.canvas.getCanvas();
			this.gridWidth=setOrDefault(params,"w",cnvs.width);
			this.gridHeight=setOrDefault(params,"h",cnvs.height);
			
			let w=this.gridWidth;
			let h=this.gridHeight;
			this.numCols=Math.ceil(w/this.gridCellSize);
			this.numRows=Math.ceil(h/this.gridCellSize);
			
		}
		toggleGrid(){
			this.render=!this.render;
		}
		show(){
			this.render=true;
		}
		hide(){
			this.render=false;
		}
		setColor(color){
			this.borderColor=color;
		}
		onRender(ctx){
			if(this.render){
				ctx.save();
					ctx.setTransform(1,0,0,1,0,0);
					ctx.globalAlpha=this.alpha;
					ctx.lineWidth=this.borderWidth;
					ctx.strokeStyle=this.borderColor;
					ctx.beginPath();
						for(let i=0;i<this.numRows;i++){
							let sy=this.gridCellSize*i;
							ctx.moveTo(this.x,this.y+sy);
							ctx.lineTo(this.x+this.gridWidth,this.y+sy);
							ctx.stroke();
						}
					ctx.beginPath();
						for(let i=0;i<this.numCols;i++){
							let sx=this.gridCellSize*i;
							ctx.moveTo(this.x+sx,this.y);
							ctx.lineTo(this.x+sx,this.y+this.gridHeight);
							ctx.stroke();
						}
				ctx.restore();
			}
			super.onRender(ctx);
		}
		Unload(){
		}
	}
	window.Grid=Grid;
	
	class GridSelector extends SceneItem{
		constructor(){
			super();
			this.color='#fff';
			this.onCapture=undefined;
			this.target=null;
			this.targetItem=null;
			this.render=true;
			this.collisionMapMode=false;
			this.gridCellSize=0;
			this.keymap={'LEFT':37,'RIGHT':39,'UP':38,'DOWN':40,'SELECT':32,'REMOVE':46};
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.color=setOrDefault(params,'color',this.color);
			this.gridCellSize=setOrDefault(params,'gridcellsize',32);
			this.alpha=setOrDefault(params,'alpha',1);
			this.target=setOrDefault(params,'target',null);
			
			if(this.target){
				if(this.target.type=='GUI'){
					let gui=window.currentScene.getGUI();
					this.targetItem=gui.getWidgetByName(this.target.name);
				}
			}
			
			this.registerClick=setOrDefault(params,'registerclick',false);
			if(this.registerClick){
				$(document).on('click.GridSelector'+this.id,this.onClick.bind(this));
			}else{
				$(document).on('keydown.GridSelector'+this.id,this.onKeydown.bind(this));
			}
			this.updateCoordinateInputs();
		}
		getGridCellSize(){
			return this.gridCellSize;
		}
		setKeymap(map){
			this.keymap=map;
		}
		onClick(event){
			if(!this.parent){return;}
			
			let x=event.offsetX;
			let y=event.offsetY;
			if(x<this.parent.x||y<this.parent.y){return;}
			
			let col=Math.floor((x-this.parent.x)/this.gridCellSize);
			let row=Math.floor((y-this.parent.y)/this.gridCellSize);
			this.x=col*this.gridCellSize;
			this.y=row*this.gridCellSize;
		}
		onKeydown(event){
			let wich=event.which;
			let ae=document.activeElement;
			if(ae !== undefined && ae.tagName == "TEXTAREA"){
				return;
			}
			
			
			if(!this.registerClick){
				if(wich==this.keymap.LEFT){
					//if(this.x-this.width>=0){
						this.x-=this.w;
					//}
				}
				if(wich==this.keymap.RIGHT){
					//if(this.x+this.width<this.maxW){
						this.x+=this.w;
					//}
				}
				if(wich==this.keymap.UP){
					//if(this.y-this.height>=0){
						this.y-=this.h;
					//}
				}
				if(wich==this.keymap.DOWN){
					//if(this.y+this.height<this.maxH){
						this.y+=this.h;
					//}
				}
				if(wich==this.keymap.SELECT){
					let tile=SceneManager.getItemById(`Tile ${this.x}-${this.y}-${window.tileLayer}`);
					if(tile){
						this.removeTileAtCurrentPos();
					}
					let content=null;
					if(this.isCollisionMapMode()){
						content=new CollisionTile();
						content.loadFromProperties({'id':`CollisionTile ${this.x}-${this.y}-${window.tileLayer}`,'x':this.x,'y':this.y,'w':this.w,'h':this.h,'layer':window.tileLayer});
					}else{
						let img=this.captureTargetCellContent();
						content=new Tile();
						content.loadFromProperties({'id':`Tile ${this.x}-${this.y}-${window.tileLayer}`,'x':this.x,'y':this.y,'w':this.w,'h':this.h,'src':img,'layer':window.tileLayer});
					}
					
					SceneManager.append(content);
				}
				if(wich==this.keymap.REMOVE){
					this.removeTileAtCurrentPos();
				}
			}

			this.updateCoordinateInputs();
			//event.preventDefault();
			
		}
		updateCoordinateInputs(){
			let gsx=$('#gs-x');
			if(gsx.length>0){
				gsx.val(this.x);
			}
			let gsy=$('#gs-y');
			if(gsy.length>0){
				gsy.val(this.y);
			}
		}
		
		removeTileAtCurrentPos(){
			let tile=SceneManager.getItemById(`Tile ${this.x}-${this.y}-${window.tileLayer}`);
			if(tile==null){
				tile=SceneManager.getItemById(`CollisionTile ${this.x}-${this.y}-${window.tileLayer}`);
			}
			if(tile){
				SceneManager.removeItem(tile);
			}
		}
		setCollisionMapMode(mode){
			this.collisionMapMode=mode;
		}
		isCollisionMapMode(){
			return this.collisionMapMode;
		}
		captureTargetCellContent(){
			let t=this.targetItem.getPicker();
			
			let cnvs=window.canvas.getCanvas();
			let ctx=cnvs.getContext('2d');
			let wc=t.calculateWorldCoordinates();

			let img=this.targetItem.img.Image();//ctx.getImageData(wc.x,wc.y,t.w,t.h);
			let tmp=$(`<canvas width="${img.width}" height="${img.height}"></canvas>`)[0];
			let tmpCtx=tmp.getContext('2d');
			tmpCtx.drawImage(img,t.x,t.y,t.w,t.h,0,0,t.w,t.h);
			
			return tmp.toDataURL();
			
		}
		hide(){this.render=false;}
		show(){this.render=true;}
		setColor(color){
			this.color=color;
		}
		onRender(ctx){
			if(this.render){
				let wc=this.calculateWorldCoordinates();

				ctx.save();
					ctx.globalAlpha=this.alpha;
					ctx.fillStyle=this.color;
					ctx.fillRect(wc.x,wc.y,this.w,this.h);
				
				ctx.restore();
				super.onRender(ctx);
			}
		}
		Unload(){
			$(document).off('keydown.GridSelector'+this.id);
			$(document).off('click.GridSelector'+this.id);
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!=-1){return null;}
			obj.target=this.target;
			obj.color=this.color;
			obj.render=this.render;
			
			return super.Serialize(obj,exempt);
		}
	}
	window.GridSelector=GridSelector;
	
})();