"use strict";
const TILE_SIZE=128;
(function(){
	
	class Tile extends SceneItem{
		constructor(img,x,y,index,variation){
			super({'x':x*TILE_SIZE,'y':y*TILE_SIZE,'w':TILE_SIZE,'h':TILE_SIZE,'layer':0});
			this.col=x;
			this.row=y;
			this.index=index;
			this.variation=variation;
			this.img=img;
			this.selected=false;
			this.topleft=null;
			this.top=null;
			this.topright=null;
			this.left=null;
			this.right=null;
			this.bottomleft=null;
			this.bottom=null;
			this.bottomright=null;
			this.debug=false;
			this.debugStyle={color:'#f33',lw:4}
			this.pathingSubdivisions=[];
			this.generateSubdivisions();
		}
		generateSubdivisions(){
			const subWidth=this.w/2;
			const subHeight=this.h/2;
			let col=0;
			let row=0;
			const numSubdivisions=4;
			for(let i=0;i<numSubdivisions;i++){
				if(col*subWidth>=this.w){
					col=0;
					row++;
				}
				this.pathingSubdivisions.push({
					x:this.x+col*subWidth,
					y:this.y+row*subHeight,
					w:subWidth,
					h:subHeight
				});
				col++;
			}
		}
		Unload(){
			this.img=null;
			
			super.Unload();
		}
		debugDraw(ctx){
			ctx.save();
				ctx.strokeStyle=this.debugStyle.color;
				ctx.lineWidth=this.debugStyle.lw;
				ctx.font="24px sans-serif";
				
				//ctx.strokeRect(this.x,this.y,this.w,this.h);
				//ctx.strokeText(this.index, this.x+this.w/2,this.y+this.h/2);
				ctx.fillStyle="#aaf";
				ctx.globalAlpha=0.5;
				this.pathingSubdivisions.forEach((sub)=>{
					ctx.fillRect(sub.x,sub.y,sub.w,sub.h);
				});
			ctx.restore();
		}
		getPathingSubdivisions(){
			return this.pathingSubdivisions;
		}
		getNeighbors(){
			return [this.left,/* this.topleft, */this.top,/* this.topright, */this.right,/* this.bottomright, */this.bottom,/* this.bottomleft */];
		}
		setSelected(sel){
			this.selected=sel;
		}
		toggleSelected(){
			this.selected=!this.selected;
		}
		isSelected(){
			return this.selected;
		}
		onClick(event){
			this.toggleSelected();
			this.toggleBuildPanel(this.selected);
		}
		onRender(ctx){
			if(this.norender){return;}
			let img=this.img;
			const sw=TILE_SIZE;//this.w;
			const sh=TILE_SIZE;//this.h;
			
			if(this.img!==null){
				ctx.drawImage(img,sw*this.index,this.variation*sh,sw,sh,this.x,this.y,TILE_SIZE,TILE_SIZE);
			}
			
			if(this.selected){
				ctx.save();
					ctx.globalAlpha=0.5;
					ctx.fillStyle='#f33';
					ctx.fillRect(this.x,this.y,TILE_SIZE,TILE_SIZE);
				ctx.restore();
			}
			//this.debugDraw(ctx);
			/* if(this.debug&&this.index!=15&&this.selected){
				
			} */
		}
		getIndex(){
			return this.index;
		}
		setIndex(index){
			this.index=index;
		}
		getCol(){
			return this.col;
		}
		getRow(){
			return this.row;
		}
	}
	
	class StartTile extends Tile{
		constructor(img,x,y,index,variation){
			super(img,x,y,index,variation);
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
		}
	}
	window.StartTile=StartTile;
	
	class LightSourceTile extends Tile{
		constructor(img,x,y,index,variation){
			super(img,x,y,index,variation);
			
			this.lightRadius=100;//params.lightradius??=100;
			this.lightFalloff=100;//params.lightfalloff??=100;
			//if(params){this.loadFromProperties(params);}
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			
			
		}
		getLightRadius(){
			return this.lightRadius;
		}
		getLightFalloff(){
			return this.lightFalloff;
		}
	}
	window.LightSourceTile=LightSourceTile;
	
	
	class EndTile extends LightSourceTile{
		constructor(img,x,y,index,variation){
			super(img,x,y,index,variation);
			
			this.lightRadius=400;
			this.generator=new GeneratorTower({
				x:this.x,
				y:this.y
			});
			this.generator.loadFromProperties({});
			SceneManager.append(this.generator);
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
		}
	}
	window.EndTile=EndTile;
	
	
	
	class Tilemap extends SceneItem{
		constructor(p_Params){
			super(p_Params);
			this.loaded=false;
			this.tiles=[];
			this.row=0;
			this.id="";
			this.bitmapdata=null;
			this.bitmapsrc=null;
			this.spritesrc=null;
			this.sprite=null;
			this.mbdTile=null;
		}
		
		loadFromProperties(params){
			super.loadFromProperties(params);
			this.bitmapsrc=params.bitmapsrc;
			this.spritesrc=params.spritesrc;
			this.id=params.hasOwnProperty("id")?params.id:"";
			
			return this.Load();
		}
		
		Unload(){
			for(let i=0;i<this.tiles.length;i++){
				this.tiles[i] = null;
			}
			if(this.sprite!=null){
				this.sprite.Unload();
			}
			this.tiles.length=0;
			this.sprite=null;
			this.bitmapdata=null;
			this.spritesrc=null;
		}
		getTileByScreenSpaceCoords(point){
			const camera=window.Camera;
			const coords=camera.screenSpaceToWorldSpace(point);
			const size=TILE_SIZE;

			const col=Math.floor(coords.x/size);
			const row=Math.floor(coords.y/size);
			
			const t=this.getTileByColRow(
				col,
				row
			);
			
			return t;
		}
		onMousedown(event){
			this.mbdTile=this.getTileByScreenSpaceCoords({x:event.offsetX,y:event.offsetY});
			event.preventDefault();
			
		}
		onMouseup(event){
			/* const t=this.getTileByScreenSpaceCoords({x:event.offsetX,y:event.offsetY});
			if(t&&this.mbdTile==t&&t.index==15){
				this.tiles.forEach(x => x==t?null:x.setSelected(false));
				t.onClick(event);
			}
			event.preventDefault(); */
		}
		onClick(event){
			const t=this.getTileByScreenSpaceCoords({x:event.offsetX,y:event.offsetY});
			if(t&&this.mbdTile==t&&t.index==15){
				this.tiles.forEach(x => x==t?null:x.setSelected(false));
				t.onClick(event);
				return false;
			}
			event.preventDefault();
			return true;
		}
		getWidth(){
			let maxX=0;
			this.tiles.forEach(x=>{
				maxX=(x.x+x.w)>maxX?(x.x+x.w):maxX;
			});
			return maxX;
		}
		getHeight(){
			let maxY=0;
			this.tiles.forEach(x=>{
				maxY=(x.y+x.h)>maxY?(x.y+x.h):maxY;
			});
			return maxY;
		}
		getTileByColRow(col,row){
			return this.tiles.find(x => x.col==col&&x.row==row);
		}
		arrangeChildren(){
			this.children.forEach(child => {
				const t=this.getTileByColRow(child.col,child.row);
				if(t!==undefined&&child.setPosition!==undefined){
					child.setPosition({x:t.x+this.x,y:t.y+this.y});
				}
			});
		}
		Load(){
			let bitmap=new window.Sprite();
			this.sprite=new Sprite();
			return this.sprite.load({src:this.spritesrc}).then( () => {
				return bitmap.load({src:this.bitmapsrc}).then((img)=>{
					
					const isFilled=function(data,idx){
						return (data[idx]==0&&data[idx+1]==0&&data[idx+2]==0);//&&data[idx+3];
					}
					const isStartTile=function(data,idx){
						return (data[idx]==0&&data[idx+1]==255&&data[idx+2]==0);
					}
					const isEndTile=function(data,idx){
						return (data[idx]==0&&data[idx+1]==0&&data[idx+2]==255);
					}
					const isLightSource=function(data,idx){
						return (data[idx]==255&&data[idx+1]==0&&data[idx+2]==255);
					}
					var bm=img;//.Image();
					
					var tempCanvas=document.createElement('canvas');
					tempCanvas.setAttribute("width",bm.width);//$('<canvas width="'+bm.width+'" height="'+bm.height+'"></canvas>')[0];
					tempCanvas.setAttribute("height",bm.height);
					
					var ctx=tempCanvas.getContext('2d');
					ctx.drawImage(bm,0,0);
					this.bitmapdata=ctx.getImageData(0,0,bm.width,bm.height);
					
					var bd=this.bitmapdata;
					var row=bd.width;
					this.row=row;
					var width=bd.width;
					var height=bd.height;
					var end=width*height;
					
					var data=bd.data;
					var c=0;
					var y=0,x=0;
					for(var i=0;i<bd.width*bd.height*4;i+=4){
						if(c%width==0&&c!=0){
							y++;
							x=0;
						}

						var index=0;
						var current=x+(y*row);
						let tile=null;
						if(!isFilled(data,current*4)){
							const up=x+((y-1)*row);
							if(up<0||isFilled(data,up*4)){
								index+=1;
							}
							const right=x+1+(y*row);
							if(right>=(y+1)*row||isFilled(data,right*4)){
								index+=2;
							}
							const down=x+((y+1)*row);
							if(down>end||isFilled(data,down*4)){
								index+=4;
							}
							const left=x-1+(y*row);
							if(left<0||left<y*row||isFilled(data,left*4)){
								index+=8;
							} 
							//index=8;
							if(isStartTile(data,current*4)){
								tile=new StartTile(this.sprite.Image(),x,y,index,0);
							}else if(isEndTile(data,current*4)){
								tile=new EndTile(this.sprite.Image(),x,y,index,0);
							}else if(isLightSource(data,current*4)){
								tile=new LightSourceTile(this.sprite.Image(),x,y,index,0);
								
							}else{
								tile=new Tile(this.sprite.Image(),x,y,index,0);
							}
						}else{
							index=15;
							tile=new Tile(this.sprite.Image(),x,y,index,Math.floor(Math.random() * 4));
						}
						tile.layer=0;
						this.tiles.push(tile);
						
						x++;
						c++;
					}
					this.calculateNeighbors();
					
					this.sortChildren();
					
				}).then(this.arrangeChildren.bind(this)).then(this.onLoaded.bind(this));
			});
		}
		postLoad(){
			this.children.forEach(x => x.postLoad());
		}
		onRender(ctx){
			this.tiles.forEach(x=>x.onRender(ctx));
			super.onRender(ctx);
		}
		onUpdate(time){
			super.onUpdate(time);
			this.tiles.forEach(x=>x.onUpdate(time));
		}
		sortChildren(){
			this.children.sort((a,b) => a.layer-b.layer);
		}
		onLoaded(){
			this.loaded=true;
		}
		isLoaded(){
			return this.loaded;
		}
		getSelectedTile(){
			const sel=this.tiles.filter(x=>x.isSelected());
			return sel.length>0?sel[0]:null;
		}
		getRandomPathableNode(){
			const pathables=this.tiles.filter(x => x.index!==15);
			return pathables[rand(0,pathables.length-1)];
		}
		getTilesByIndex(index){
			var ret=[];
			for(var i=0;i<this.tiles.length;i++){
				var tile=this.tiles[i];
				if(tile.getIndex()==index){
					ret.push(tile);
				}
			}
			return ret;
		}
		getTileByCoord(x,y){
			for(let i=0;i<this.tiles.length;i++){
				let tile=this.tiles[i];
				if(tile.x<=x&&tile.x+tile.w>x){
					if(tile.y<=y&&tile.y+tile.h>y){
						return tile;
					}
				}
			}
			return null;
		}
		getTilesByType(type){
			return this.tiles.filter(x=>x instanceof type);
		}
		calculateNeighbors(){
			let row=this.row;
			let up=-row;
			let down=row;
			let left=-1;
			let right=1;
			let upleft=-row-1;
			let upright=-row+1;
			let downleft=row-1;
			let downright=row+1;
			let tiles=this.tiles;
			for(let i=0;i<tiles.length;i++){
				let tile=tiles[i];
				let currentRow=Math.floor(i/row);
				
				if(i+up>=0){
					tile.top=tiles[i+up];
				}
				if(i+down<tiles.length){
					tile.bottom=tiles[i+down];
				}
				if(i+left>=i-(i%row)){
					tile.left=tiles[i+left];
				}
				if(i+right<(currentRow+1)*row){
					tile.right=tiles[i+right];
				}
				if(i+upleft>=0&&i+upleft>=i-(i%row)-row){
					tile.topleft=tiles[i+upleft];
				}
				if(i+upright>0&&i+upright<row*currentRow){
					tile.topright=tiles[i+upright];
				}
				if(i+downleft<tiles.length&&i+downleft>=row*(currentRow+1)){
					tile.bottomleft=tiles[i+downleft];
				}
				if(i+downright<tiles.length&&i+downright<row*(currentRow+2)){
					tile.bottomright=tiles[i+downright];
				}
			}
		}
	}
	window.Tilemap=Tilemap;
	
	/* class Location extends Tilemap{
		constructor(p_Params){
			super(p_Params);
			this.spriteloaded=0;
			this.tiles=[];
			this.row=0;
			this.id="";
			this.background=null;
			this.backgroundsrc=null;
			this.collisionmap=null;
			this.collisionmapsrc=null;
			this.eventBroadcaster=new EventBroadcaster(this);
		}
		
		loadFromProperties(p_properties){
			//super.loadFromProperties(p_properties);
			this.x=p_properties.x;
			this.y=p_properties.y;
			this.w=p_properties.w;
			this.h=p_properties.h;
			this.layer=p_properties.layer;
			this.backgroundsrc=p_properties.backgroundsrc;
			this.collisionmapsrc=p_properties.collisionmapsrc;
			this.id=p_properties.hasOwnProperty("id")?p_properties.id:"";
			
			this.Load();
		}
		Load=function(){
			if(this.backgroundsrc){
				this.background=new Sprite({'src':this.backgroundsrc,'success':function(img){
					this.spriteloaded++;
				}.bind(this)});
			}
			if(this.collisionmapsrc){
				this.collisionmap=new Sprite({'src':this.collisionmapsrc,'success':function(img){
					this.spriteloaded++;
					this.buildCollisionmap(img);
				}.bind(this)});
			}
		}
		registerEventListener(event,callback){
			this.eventBroadcaster.registerEventListener(event,callback);
		}
		buildCollisionmap(img){
			var bm=img.Image();
			var tempCanvas=$('<canvas width="'+bm.width+'" height="'+bm.height+'"></canvas>')[0];
			
			var ctx=tempCanvas.getContext('2d');
			ctx.drawImage(bm,0,0);
			this.bitmapdata=ctx.getImageData(0,0,bm.width,bm.height);
			
			var bd=this.bitmapdata;
			var row=bd.width;
			this.row=row;
			var width=bd.width;
			var height=bd.height;
			var end=width*height;
			
			var data=bd.data;
			var c=0;
			var y=0,x=0;
			for(var i=0;i<bd.width*bd.height*4;i+=4){
				if(c%width==0&&c!=0){
					y++;
					x=0;
				}

				var index=0;
				var current=x+(y*row);
				if(!isFilled(data,current*4)){
					var up=x+((y-1)*row);
					if(up<0||isFilled(data,up*4)){
						index+=1;
					}
					var right=x+1+(y*row);
					if(right<(y+1)*row&&isFilled(data,right*4)){
						index+=2;
					}
					var down=x+((y+1)*row);
					if(down>end||isFilled(data,down*4)){
						index+=4;
					}
					var left=x-1+(y*row);
					if(left<0||left<(y-1)*row||isFilled(data,left*4)){
						index+=8;
					}
				}else{
					index=15;
				}
				var tile=new Tile(null,x,y,index,0);
				tile.norender=true;
				this.tiles.push(tile);
				SceneManager.append(tile);
				x++;
				c++;
			}
			//this.spriteloaded+=1;
			this.calculateNeighbors();
			SceneManager.sort();
			this.eventBroadcaster.fireEvent('tilemap_loaded');
		}
		
		onRender(ctx){
			if(this.spriteloaded<2){return;}
			
			ctx.drawImage(this.background.Image(),0,0);
			super.onRender(ctx);
		}
	}
	
	window.Location=Location; */
})();