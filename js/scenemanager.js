"use strict";

(function(){

	class SceneItem{
		constructor(params){
			this.serializable=true;
			if(params){
				this.x=params.x==undefined?0:params.x;
				this.y=params.y==undefined?0:params.y;
				this.w=params.w==undefined?0:params.w;
				this.h=params.h==undefined?0:params.h;
				this.layer=params.layer==undefined?0:params.layer;
				this.serializable=setOrDefault(params,"serializable",true);
			}
			
			this.children=[];
			this.parent=null;
			this.id="";
			this.tags=[];
			this.loaded=false;
			this.noDraw=true;
			this.selected=false;
			this.eventBroadCaster=new EventBroadcaster(this);
			this.name="";
		}
		loadFromProperties(params){
			this.x=params.x??=0;
			this.y=params.y??=0;
			this.w=params.w??=0;
			this.h=params.h??=0;
			this.layer=params.layer??=0;
			this.tags=params.tags??=this.tags;
			this.id=params.id??="";
			this.noDraw=params.nodraw??=true;
			this.name=params.name??="";
			this.serializable=params.serializable??=true;
		}
		append(child){
			if(child.id.length>0){
				if(this.getChildById(child.id)!==null){
					console.log(`Attempted to append child ${child.id} with conflicting id`);
					return;
				}
			}
			this.children.push(child);
			child.parent=this;
		}
		removeChild(c){
			let idx=this.children.indexOf(c)
			if(idx!=-1){
				this.children.splice(idx,1);
			}
		}
		onRender(ctx,gui){
			if(!this.noDraw){
				var wc=this.calculateWorldCoordinates();
				ctx.fillStyle="#fff";
				ctx.fillRect(wc.x,wc.y,this.w,this.h);
			}
			if(this.isSelected()){
				this.drawSelectionBox(ctx);
			}

			for(var i=0;i<this.children.length;i++){
				this.children[i].onRender(ctx,gui);
			}
		}
		drawSelectionBox(ctx){
			ctx.beginPath();
			ctx.strokeStyle='#ff0';
			ctx.moveTo(this.x,this.y);
			ctx.lineTo(this.x+this.w,this.y);
			ctx.lineTo(this.x+this.w,this.y+this.h);
			ctx.lineTo(this.x,this.y+this.h);
			ctx.stroke();
		}
		toggleSelected(){
			this.setSelected(!this.selected);
		}
		setSelected(selected){
			this.selected=selected;
			this.eventBroadCaster.fireEvent('selected');
			for(let i=0;i<this.children.length;i++){
				this.children[i].setSelected(this.selected);
			}
		}
		isSelected(){
			return this.selected;
		}
		postLoad(){
			this.children.forEach(x => x.postLoad());
		}
		Unload(){
			
		}
		
		/*
			Return false from overloaded versions to stop "propagation"
		*/
		onClick(event){
			let ret=true;
			this.children.forEach(x => {
				if(!x.onClick(event)){
					ret=false;
				}
			});
			return ret;
		}
		getChildById(id){
			for(let i=0;i<this.children.length;i++){
				if(this.children[i].id==id){return this.children[i];}
			}
			return null;
		}
		registerEntitySelect(callback){
			this.eventBroadCaster.registerEventListener('selected',callback);
		}
		Serialize(obj,exempt){
			if(exempt.indexOf(this.id)!==-1){return null;}
			if(!this.serializable){return null;}
			obj.x=this.x;
			obj.y=this.y;
			obj.w=this.w;
			obj.h=this.h;
			obj.layer=parseInt(this.layer);
			obj.id=this.id;
			obj.tags=this.tags.slice();
			obj.noDraw=this.noDraw;
			obj.type=this.constructor.name;
			obj.name=this.name;
			
			if(this.children.length>0){
				obj.children=[];
				for(let i=0;i<this.children.length;i++){
					let ret=this.children[i].Serialize({},exempt);
					if(ret){
						obj.children.push(ret);
					}
				}
			}
			return obj;
		}
		getWidth(){
			return this.w;
		}
		getHeight(){
			return this.h;
		}
		Copy(){
			let obj=this.Serialize({},[]);
			let no=new window[this.constructor.name]();
			no.loadFromProperties(obj);
			return no;
		}
		setLayer(layer){
			this.layer=layer;
		}
		getId(){
			return this.id;
		}
		onUpdate(time){
			for(var i=0;i<this.children.length;i++){
				this.children[i].onUpdate(time);
			}
		}
		addTag(tag){
			if(this.tags.indexOf(tag)==-1){
				this.tags.push(tag);
			}
		}
		removeTag(tag){
			let idx=this.tags.indexOf(tag);
			if(idx!==-1){
				this.tags.splice(idx,1);
			}
		}
		containsTag(tag){
			for(let i=0;i<this.tags.length;i++){
				if(this.tags[i]==tag){
					return true;
				}
			}
			return false;
		}
		containsAnyTags(tag){
			for(let i=0;i<this.tags.length;i++){
				for(let j=0;j<tags.length;j++){
					if(this.tags[i]==tags[j]){
						return true;
					}
				}
			}
			return false;
		}
		calculateWorldCoordinates(){
			if(this.parent!==null){
				const p=this.parent;
				const pwc=p.calculateWorldCoordinates();
				return {'x':this.x+pwc.x,'y':this.y+pwc.y};
			}
			return {'x':this.x,'y':this.y};
		}
		getItemsByTypes(types){
			let ret=[];
			this.children.forEach(x => {
				types.forEach(type => {
					if(x instanceof window[type]){
						ret.push(x);
					}
					ret=ret.concat(x.getItemsByTypes(types));
				});
			});
			return ret;
		}
	}
	window.SceneItem=SceneItem;
	
	class Interactable extends SceneItem{
		constructor(params){
			super(params);
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
		}
		interact(caller){
		}
		proximity(caller){
		}
	}
	window.Interactable=Interactable;
	
	class SceneManager{
		constructor(){
			this.tickTime=16;
			this.lastUpdate=0;
			this.items=[];
			this.numSprites=0;
			this.spritesLoaded=0;
			this.zoom=1;
			this.mouseState={x:0,y:0,mbd:false};
			
			
		}
		onCanvasClick(event){
			const gui=window.currentScene.getGUI();
			const noPrevent=gui.onClick(event);
			
			if(noPrevent){
				for(let i=this.items.length-1;i>=0;i--){
					const item=this.items[i];
					if(item.onClick){
						if(!item.onClick(event)){
							break;
						}
					}
				}
			}
		}
		onCanvasMousedown(event){
			
			const gui=window.currentScene.getGUI();
			const noPrevent=gui.onMousedown(event);
			this.sort();
			if(noPrevent){
				const ox=event.offsetX;
				const oy=event.offsetY;
				this.mouseState={x:ox,origin:{x:ox,y:oy},y:oy,mbd:true};
				
				this.items.forEach(x => {
					if(x.onMousedown){
						x.onMousedown(event);
					}
				});
			}
			
		}
		onCanvasMouseup(event){
			const gui=window.currentScene.getGUI();
			const noPrevent=gui.onMouseup(event);
			
			if(noPrevent){
				this.mouseState=Object.assign(this.mouseState,{mbd:false});
				
				for(let i=0;i<this.items.length;i++){
					const item=this.items[i];
					if(item.onMouseup){
						if(item.onMouseup(event)==false){
							break;
						}
					}
				}
			}
		}
		onCanvasMousemove(event){
			const gui=window.currentScene.getGUI();
			const noPrevent=gui.onMousemove(event);
			
			if(noPrevent){
				if(this.mouseState.mbd){
					this.mouseState=Object.assign(this.mouseState,{x:event.offsetX,y:event.offsetY});
					event.preventDefault();
					return false;
				}
				this.items.forEach(x => {
					if(x.onMousemove){
						x.onMousemove(event);
					}
				});
			}
		}
		onScroll(event){
			const c=window.Camera;
			const point=c.screenSpaceToWorldSpace({x:event.offsetX,y:event.offsetY});
			c.zoomAt(point.x,point.y,event.deltaY/1000);
			
			event.preventDefault();
			return false;
		}
		zoomView(amount){
			this.zoom-=amount;
			if(this.zoom<0.3){
				this.zoom=0.3;
			}
			if(this.zoom>1.0){
				this.zoom=1.0;
			}
			
		}
		postLoad(){
			document.addEventListener('wheel',this.onScroll.bind(this),{passive:false});
			const canvas=window.canvas.getCanvas();
			canvas.addEventListener('mousedown',this.onCanvasMousedown.bind(this));
			canvas.addEventListener('mouseup',this.onCanvasMouseup.bind(this));
			canvas.addEventListener('mousemove',this.onCanvasMousemove.bind(this));
			canvas.addEventListener('click',this.onCanvasClick.bind(this));
			
			
			for(let i=0;i<this.items.length;i++){
				this.items[i].postLoad();
			}
		}
		removeItem(item){
			let removed=this.items.splice(this.items.indexOf(item),1);
			if(removed.length>0){
				this.generateLayerImage(removed[0].layer);
			}
			
			return item;
		}
		getByLayer(layer){
			let ret=[];
			for(let i=0;i<this.items.length;i++){
				let item=this.items[i];
				if(item.layer==layer){
					ret.push(item);
				}
			}
			return ret;
		}
		getAllItems(){
			return this.items;
		}
		getHighestLayer(){
			let maxL=0;
			for(let i=0;i<this.items.length;i++){
				maxL=this.items[i].layer>maxL?this.items[i].layer:maxL;
			}
			return maxL;
		}
		getNonEmptyLayer(excempt){
			if(excempt===undefined){excempt=[];}
			let nonEmpty=[];
			for(let i=0;i<this.items.length;i++){
				let item=this.items[i];
				if(nonEmpty.indexOf(item.layer)==-1&&excempt.indexOf(item.layer)==-1){
					nonEmpty.push(item.layer);
				}
			}
			return nonEmpty;
		}
		getNonEmptyLayerByType(type){
			let nonEmpty=[];
			for(let i=0;i<this.items.length;i++){
				let item=this.items[i];
				if(item instanceof type&&nonEmpty.indexOf(item.layer)==-1){
					nonEmpty.push(item.layer);
				}
			}
			return nonEmpty;
		}
		captureLayerAsImage(layer,types){
			let items=this.getByLayer(layer);
			items=items.filter(item => {
				for(let i=0;i<types.length;i++){
					if(item instanceof types[i]){
						return true;
					}
				}
				return false;
			});
			
			
			return this.captureScene(items);
		}
		captureSceneAsImage(types){
			let items=this.getAllItems();
			items=items.filter(item => {
				for(let i=0;i<types.length;i++){
					if(item instanceof types[i]){
						return true;
					}
				}
				return false;
			});
			
			
			return this.captureScene(items);
		}
		captureCollisionMap(layer){
			let items=this.getByLayer(layer);
			
			let step=32;
			let nodemap=[];
			for(let i=0;i<items.length;i++){
				let item=items[i];
				let col=Math.round(item.x/step);
				let row=Math.round(item.y/step);
				//colstr+=`c${col}r${row}`;
				nodemap.push({'col':col,'row':row});
			}
			
			let loc=new Location();
			loc.loadFromProperties({'collisionmap':nodemap,'step':step,'layer':0,'id':'collisionmap'});
			
			return loc;
		}
		getSceneMaxX(){
		}
		getSceneMaxY(){
			
		}
		getSceneMaxDimensions(items){
			items=items==undefined?this.items:items;
			let maxX=0;
			let maxY=0;
			for(let i=0;i<items.length;i++){
				let item=items[i];
				let x=item.x+item.getWidth();
				let y=item.y+item.getHeight();
				maxX=x>maxX?x:maxX;
				maxY=y>maxY?y:maxY;
			}
			return {maxX:maxX,maxY:maxY};
		}
		captureScene(items){
			let canvas=window.canvas.getCanvas();
			let ctx=canvas.getContext('2d');
			ctx.fillStyle='#000';
			ctx.clearRect(0,0,canvas.width,canvas.height);
			
			let maxDimensions=this.getSceneMaxDimensions(items);
			const maxX=maxDimensions.maxX;
			const maxY=maxDimensions.maxY;
			
			let numIterX=Math.floor(maxX/canvas.width)+1;
			let numIterY=Math.floor(maxY/canvas.height)+1;
			let scaleX=1;
			let scaleY=1;
			
			let tmp=$(`<canvas width="${numIterX*canvas.width}" height="${numIterY*canvas.height}"></canvas>`)[0];
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
						
						let imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
						tmpCtx.putImageData(imgData,iterX*canvas.width,iterY*canvas.height);
						ctx.clearRect(0,0,canvas.width,canvas.height);
					ctx.restore();
				}
			}

			return {'src':tmp.toDataURL(),'scalex':scaleX,'scaley':scaleY};
		}
		generateLayerImage(layer){
			let ni=this.captureLayerAsImage(layer,[Tile]);
			ni.id=`LayerImage-${layer}`;
			ni.layer=layer;
			let li=this.getItemById(`LayerImage-${layer}`);
			if(li==null){
				let layerImage=new LayerImage();
				layerImage.loadFromProperties(ni);
				this.append(layerImage);
			}else{
				li.loadFromProperties(ni);
			}
		}
		onSpriteLoaded(){
			this.spritesLoaded++;
			if(this.spritesLoaded>=this.numSprites){
				let layers=this.getNonEmptyLayerByType(Sprite);
				for(let i=0;i<layers.length;i++){
					this.generateLayerImage(layers[i]);
				}
			}
		}
		removeLayer(layer){
			let rem=this.getByLayer(layer);
			for(let i=0;i<rem.length;i++){
				this.removeItem(rem[i]);
			}
		}
		getSelectedEntities(){
			return this.items.filter(e => e.isSelected());
		}
		getItemsByTypes(types){
			let ret=[];
			this.items.forEach(x => {
				types.forEach(type => {
					if(x instanceof window[type]){
						ret.push(x);
					}
					ret=ret.concat(x.getItemsByTypes(types));
				})
			});
			return ret;
		}
		removeItem(item){
			const idx=this.items.indexOf(item);
			if(idx!=-1){
				this.items.splice(idx,1);
			}
		}
		updateMousedrag(){
			if(this.mouseState.mbd){
				const c=window.Camera;
				let origin=c.getOrigin();
				
				let delta={x:(this.mouseState.origin.x-this.mouseState.x)/10,y:(this.mouseState.origin.y-this.mouseState.y)/10};
				delta.x*=c.scale;
				delta.y*=c.scale;
				origin={x:origin.x+delta.x,y:origin.y+delta.y};
				
				c.setOrigin(origin);
			}
		}
	}
	
	SceneManager.prototype.append=function(item,redraw){
		this.items.push(item);
		this.sort();
	}
	
	SceneManager.prototype.onRender=function(ctx){
		let c=window.Camera;
		c.preRender(ctx);
		for(var i=0;i<this.items.length;i++){
			let item=this.items[i];
			ctx.save();
				item.onRender(ctx);
			ctx.restore();
		}
		c.postRender(ctx);
	}
	
	SceneManager.prototype.onUpdate=function(time){
		if(time-this.lastUpdate>this.tickTime){
			this.items.forEach(x => x.onUpdate(time));
			this.lastUpdate=time;
		}
		this.updateMousedrag();
		
		window.Camera.onUpdate(time);
	}
	SceneManager.prototype.getItemsByType=function(type){
		let ret=[];
		for(let i=0;i<this.items.length;i++){
			if(this.items[i] instanceof type){
				ret.push(this.items[i]);
			}
		}
		return ret;
	}
	SceneManager.prototype.isInViewport=function(item){
		var canvas=window.canvas.getCanvas();
		let c=window.Camera;
		let x=item.x;
		let y=item.y;
		let halfW=canvas.width/1.5;
		let halfH=canvas.height/1.5;
		if(x>c.centerx-halfW&&x<c.centerx+halfW){
			if(y>=c.centery-halfH&&y<c.centery+halfH){
				return true;
			}
		}
		return false;
	}
	
	SceneManager.prototype.getItemById=function(id){
		return this.items.find(x => x.id==id);
	}
	SceneManager.prototype.sort=function(){
		this.items.sort(function(a,b){
			var al=a.layer;
			var bl=b.layer;
			if(al<bl){
				return -1;
			}
			if(al>bl){
				return 1;
			}
			return 0;
		});
	}
	SceneManager.prototype.getItemsByTags=function(tags){
		let ret=[];
		for(let i=0;i<this.items.length;i++){
			let item=this.items[i];
			if(item.containsAnyTags(tags)){
				ret.push(item);
			}
		}
		return ret;
	}
	SceneManager.prototype.Unload=function(){
		for(let i=0;i<this.items.length;i++){
			if(this.items[i].Unload){
				this.items[i].Unload();
			}
			this.items[i]=null;
		}
		this.items.length=0;
	}
	SceneManager.prototype.exportScene=function(includeGUI,exempt){
		let obj={'items':[]};
		for(let i=0;i<this.items.length;i++){
			let ret=this.items[i].Serialize({},exempt);
			if(ret){
				obj.items.push(ret);
			}
		}
		return obj;
	}
	SceneManager.prototype.exportSceneByTags=function(tags){
		let items=this.getItemsByTags(tags);
		let obj={'items':[]};
		for(let i=0;i<items.length;i++){
			let ret=items[i].Serialize({},[]);
			if(ret){
				obj.items.push(ret);
			}
		}
		return obj;
	}
	
	
	window.SceneManager=new SceneManager();
	
	class Camera{
		constructor(params){
			/* this.centerx=0;
			this.centery=0; */
			this.origin={x:0,y:0};
			this.scale=1;
			this.target=null;
		}
		screenSpaceToWorldSpace(point){
			let c=window.canvas.getCanvas();
			return {x:(point.x - this.origin.x) / this.scale,y:(point.y - this.origin.y) / this.scale};
		}
		translate(ctx){
			let c=window.canvas.getCanvas();
			ctx.translate(Math.floor(-this.origin.x+(c.width/2)),Math.floor(-this.origin.y+(c.height/2)));
		}
		zoomAt(x,y,zoom){
			this.scale-=zoom;
			if(this.scale<0.3){this.scale=0.3;return;}
			if(this.scale>1.0){this.scale=1.0;return;}
			this.origin.x = x - (x - this.origin.x) * this.scale;
			this.origin.y = y - (y - this.origin.y) * this.scale;
		}
		preRender(ctx){
			ctx.setTransform(this.scale,0,0,this.scale,this.origin.x,this.origin.y);
		}
		postRender(ctx){
			ctx.setTransform(1,0,0,1,0,0);
		}
		getOrigin(){
			return this.origin;
		}
		setOrigin(origin){
			this.origin=origin;
		}
		getZoomFactor(){
			return this.scale;
		}
	}
	Camera.prototype.setTarget=function(target){
		this.target=target;
	}
	
	Camera.prototype.onUpdate=function(time){
		let c=window.canvas.getCanvas();
	/* 	if(this.origin.x<(-c.width+c.width/4)*this.scale){
			this.origin.x=(-c.width+c.width/4)*this.scale;
		}
		if(this.origin.x>(c.width-c.width/2)*this.scale){
			this.origin.x=(c.width-c.width/2)*this.scale;
		}
		if(this.origin.y<(-c.height-c.height/2)*this.scale){
			this.origin.y=(-c.height-c.height/2)*this.scale;
		}
		if(this.origin.y>(c.height-c.height/2)*this.scale){
			this.origin.y=(c.height-c.height/2)*this.scale;
			
		} */
		
		if(!this.target){return;}
		//this.origin={x:this.target.x,y:this.target.y};
	}
	window.Camera=new Camera();
	
})();