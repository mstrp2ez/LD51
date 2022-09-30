"use strict";

(function(){
	window.menuOpen=false;
	var INPUT_CAPTURE_ID=0;
	class Widget{
		constructor(params,parent){
			this.name=params.name===undefined?"":params.name;
			this.x=params.x===undefined?0:params.x;
			this.y=params.y===undefined?0:params.y;
			this.w=params.w===undefined?0:params.w;
			this.h=params.h===undefined?0:params.h;
			this.visible=params.visible===undefined?true:params.visible;
			this.bgcolor=params.bgcolor===undefined?false:params.bgcolor;
			this.border=params.border===undefined?false:params.border;
			this.borderWidth=params.borderwidth===undefined?2:params.borderwidth;
			this.anim=null;
			this.loaded=false;
			this.img=null;
			this.updateTask=null;
			this.selected=params.selected===undefined?false:params.selected;
			this.lifespan=params.lifespan===undefined?-1:params.lifespan;
			this.currentAlpha=1;
			this.lastUpdate=0;
			this.onShowAnimationName=params.onShowAnimationName?params.onShowAnimationName:"IDLE";
			this.onCloseAnimationName=params.onCloseAnimationName?params.onCloseAnimationName:"IDLE";
			this.onEnterCustom=params.onEnter===undefined?false:params.onEnter;
			this.onLeaveCustom=params.onLeave===undefined?false:params.onLeave;
			this.active=params.active===undefined?false:params.active;
			this.forceDimensions=params.forceDimensions===undefined?false:params.forceDimensions;
			this.eventBroadcaster=new EventBroadcaster(this);
			this.worldSpaceParent=null;
			
			if(params.onupdate!==undefined){
				let pattern=/\$\{(.*)\}/;
				let res=params.onupdate.match(pattern);
				if(res!==null){
					this.updateTask=res[1];
				}
			}
			if(params.imgsrc!==undefined){
				this.img=new Sprite();
				this.img.load({'src':params.imgsrc}).then(this.onLoaded.bind(this));
			}
			if(params.animsrc!==undefined){
				this.anim=new SpriteAnimation({'x':0,'y':0,'w':this.w,'h':this.h});
				this.anim.Load(params.animsrc);
				this.anim.registerEventlistener("animation_loaded",function(){
					this.anim.setAnimation(this.onShowAnimationName);
					this.anim.registerEventlistener("end_of_animation",function(){
						this.anim.setAnimation("IDLE");
						return false;
					}.bind(this));
					return false;
				}.bind(this));
			}
			
			this.gradient=params.gradient===undefined?false:params.gradient;
			if(this.gradient){
				this.createGradient();
			}
			
			if(parent){
				//this.parent=parent;
				parent.addChild(this);
			}
			this.children=[];
			this.calculateDimensions();
		}
		setWorldSpaceParent(parent){
			this.worldSpaceParent=parent;
		}
		hasWorldSpaceParent(){
			return this.worldSpaceParent!=null;
		}
		calculateDimensions(){
			let p=this.parent;
			if(p==null){
				const canvas=window.canvas.getCanvas();
				p={w:canvas.width,h:canvas.height};
			}
			const findDim=(dim)=>{
				const pattern=/(\d+)%/;
				const wp=String(dim).match(pattern);
				if(wp!==null&&wp.length>1){
					return wp[1];
				}
				return null;
			}
			
			if(String(this.w).endsWith("%")){
				const w=findDim(this.w);
				this.w=p.w*(w/100);
			}
			
			if(String(this.h).endsWith("%")){
				const h=findDim(this.h);
				this.h=p.h*(h/100);
			}
			
			if(String(this.x).endsWith("%")){
				const x=findDim(this.x);
				this.x=p.w*(x/100);
			}
			if(String(this.y).endsWith("%")){
				const y=findDim(this.y);
				this.y=p.h*(y/100);
			}
		}
		removeChild(child){
			let idx=this.children.indexOf(child);
			if(idx!==-1){
				this.children.splice(idx,1)[0].detach();
			}
		}
		setAlpha(alpha){
			this.currentAlpha=alpha;
			if(this.currentAlpha<=0){this.currentAlpha=0;}
		}
		getAlpha(){
			return this.currentAlpha;
		}
		getEventBroadcaster(){
			return this.eventBroadcaster;
		}
		onKeydown(event){
			for(let i=0;i<this.children.length;i++){
				this.children[i].onKeydown(event);
			}
		}
		onClick(event){
			let hit=false;
			if(this.parent!=undefined){
				if(!this.isVisible()){return true;}
				hit=this.hitTest({x:event.offsetX,y:event.offsetY});
				if(hit){
					event.widget=this;
					this.eventBroadcaster.fireEvent("onClick");
				}
			}
			this.children.forEach(x => {
				if(!x.onClick(event)){
					hit=true;
				}
			});
			
			return !hit;
		}
		onMousemove(event){
			if(this.parent&&!this.isVisible()){return true;}
			return true;
		}
		onMousedown(event){
			if(!this.isVisible()){return true;}
			let ret=true;
			if(this.parent==undefined||this.parent==null){
				for(let i=0;i<this.children.length;i++){
					if(!this.children[i].onMousedown(event)){
						ret=false;
						break;
					}
				}
				return ret;
			}
		
			let point={x:event.offsetX,y:event.offsetY};
			ret=this.hitTest(point);
			if(ret){
				event.widget=this;
				for(let i=0;i<this.children.length;i++){
					this.children[i].onMousedown(event);
				}
			}else{
				for(let i=0;i<this.children.length;i++){
					if(!this.children[i].onMousedown(event)){
						ret=false;
						break;
					}
				}
			}
		
			return !ret;
		}
		
		onMouseup(event){
			if(!this.isVisible()){return true;}
			let ret=true;
			if(this.parent==undefined&&this.parent==null){
				for(let i=0;i<this.children.length;i++){
					if(!this.children[i].onMouseup(event)){
						ret=false;
						break;
					}
				}
				return ret;
			}
		
			ret=this.hitTest({x:event.offsetX,y:event.offsetY});
			if(ret){
				event.widget=this;
				for(let i=0;i<this.children.length;i++){
					this.children[i].onMouseup(event);
				}
			}else{
				for(let i=0;i<this.children.length;i++){
					if(!this.children[i].onMouseup(event)){
						ret=false;
						break;
					}
				}
			}
		
			return !ret;
		}
		hitTest(point){
			if(this.hasWorldSpaceParent()){
				point=window.Camera.screenSpaceToWorldSpace(point);
			}
			
			const wc=this.calculateCoordinates();
			const offsetX=point.x;
			const offsetY=point.y;
			const dx=offsetX-wc.x;
			const dy=offsetY-wc.y;
			if(dx>=0&&dx<=this.w){
				if(dy>=0&&dy<=this.h){
					return true;
				}
			}
			return false;
		}
		setActive(active){
			this.active=active;
			for(let i=0;i<this.children.length;i++){
				let child=this.children[i];
				if(child.setActive!==undefined){
					child.setActive(active);
				}
			}
		}
		forceUnfocus(){
			this.setActive(false);
			this.children.forEach(x=>x.forceUnfocus());
		}
		getWidgetsByType(type){
			let ret=[];
			for(let i=0;i<this.children.length;i++){
				let child=this.children[i];
				if(child instanceof type){
					ret.push(child);
				}
				ret=ret.concat(child.getWidgetsByType(type));
			}
			return ret;
		}
		createGradient(){
			let ctx=window.canvas.getContext();
			let grad=ctx.createLinearGradient(this.x,this.y,this.x+this.w,this.y+this.h);
			grad.addColorStop(0,this.gradient.start);
			grad.addColorStop(1,this.gradient.end);
			this.gradient=grad;
		}
		isVisible(){
			return this.visible;
		}
		getName(){
			return this.name;
		}
	}
	Widget.prototype.LoadImg=function(src){
		this.loaded=false;
		this.img=new Sprite();
		this.img.load(src).then(this.onLoaded.bind(this));
	}
	Widget.prototype.LoadAnimation=function(src){
		this.anim=new SpriteAnimation({'x':0,'y':0,'w':this.w,'h':this.h});
		this.anim.Load(src);
		//this.addChild(this.anim);
	}
	Widget.prototype.onLoaded=function(){
		this.loaded=true;
		if(this.forceDimensions){
			this.w=this.img.image.width;
			this.h=this.img.image.height;
		}
	}
	Widget.prototype.addChild=function(child){
		this.children.push(child);
		child.setParent(this);
	}
	Widget.prototype.Select=function(){
		this.selected=true;
	}
	Widget.prototype.Deselect=function(){
		this.selected=false;
	}
	Widget.prototype.getWidgetByName=function(name){
		let ret=null;
		for(let i=0;i<this.children.length;i++){
			let child=this.children[i];
			if(child.name===name){
				return child;
			}else{
				ret=child.getWidgetByName(name);
				if(ret!==null){
					return ret;
				}
			}
		}
		return ret;
	}
	Widget.prototype.setParent=function(parent){
		if(this.parent){
			this.detach();
		}
		this.parent=parent;
	}
	Widget.prototype.hasParent=function(){
		return this.parent!==null&&this.parent!==undefined;
	}
	Widget.prototype.detach=function(){
		this.parent=null;
	}
	Widget.prototype.onUpdate=function(time){
		if(this.lastUpdate==0){this.lastUpdate=time;}
		if(this.updateTask!==undefined){
			eval(this.updateTask);
		}
		if(this.anim){
			this.anim.onUpdate(time);
		}
		if(this.lifespan>-1){
			let delta=time-this.lastUpdate;
			if(delta>this.lifespan){
				this.setVisibility(false);
				this.lastUpdate=time;
			}
		}
		
		for(let i=0;i<this.children.length;i++){
			let child=this.children[i];
			child.onUpdate(time);
		}
		
	}
	Widget.prototype.setVisibility=function(visible){
		if(this.anim&&this.visible!=visible){
			this.anim.setAnimation(visible?this.onShowAnimationName:this.onCloseAnimationName);
			this.anim.registerEventlistener("end_of_animation",function(){
				this.visible=visible;
			}.bind(this));
		}else{
			this.visible=visible;
		}
	}
	Widget.prototype.toggleVisibility=function(){
		this.setVisibility(!this.visible);
	}
	Widget.prototype.getAnimation=function(){
		return this.anim;
	}
	Widget.prototype.renderBackground=function(ctx,wc){
		if(this.img!==null){
			if(this.loaded){
				ctx.drawImage(this.img.Image(),wc.x,wc.y,this.w,this.h);
			}		
		}else if (this.bgcolor){
			ctx.fillStyle=this.bgcolor;;
			ctx.fillRect(wc.x,wc.y,this.w,this.h);
		}else if(this.gradient){
			ctx.fillStyle=this.gradient;
			ctx.fillRect(wc.x,wc.y,this.w,this.h);
		}
	}
	Widget.prototype.renderBorder=function(ctx,wc){
		if(this.border){
			ctx.strokeStyle=this.border;
			ctx.lineWidth=this.borderWidth;
			ctx.strokeRect(wc.x,wc.y,this.w,this.h);
		}
	}
	Widget.prototype.onRender=function(ctx){
		if(!this.isVisible()){return;}
		let wc=this.calculateCoordinates();
		ctx.save();
		ctx.globalAlpha=this.currentAlpha;
		
		this.renderBackground(ctx,wc);
		
		if(this.anim){
			this.anim.x=wc.x;
			this.anim.y=wc.y;
			this.anim.onRender(ctx);
		}
		
		this.renderBorder(ctx,wc);
		
		if(this.selected){
			ctx.strokeStyle='#e6b800';
			ctx.lineWidth=2;
			ctx.strokeRect(wc.x,wc.y,this.w,this.h);
		}
		ctx.restore();
		for(let i=0;i<this.children.length;i++){
			let child=this.children[i];
			if(!child.hasWorldSpaceParent()){
				child.onRender(ctx);
			}
		}
	}
	Widget.prototype.calculateCoordinates=function(){
		let wc={'x':this.x,'y':this.y};
		const p=this.hasWorldSpaceParent()==false?this.hasParent()?this.parent:null:this.worldSpaceParent;
		if(p!==null){
			let pwc=p.calculateCoordinates();
			wc.x+=pwc.x;
			wc.y+=pwc.y;
		}else{
			wc.x=this.x;
			wc.y=this.y;
		}
		return wc;
	}
	Widget.prototype.Unload=function(){
		for(let i=0;i<this.children.length;i++){
			this.children[i].Unload();
		}
	}
	window.Widget=Widget;
	
	/* class WorldspaceWidget extends SceneItem{
		
	} */
	
	class TextWidget extends Widget{
		constructor(params,parent){
			super(params,parent);
			this.color=params.color===undefined?'#fff':params.color;
			this.font=params.font===undefined?'16px sans-serif':params.font;
			this.text=params.text;
			this.align=params.align===undefined?'start':params.align;
			
		}
	}
	
	TextWidget.prototype.onRender=function(ctx){
		if(!this.isVisible()){return;}
		let wc=this.calculateCoordinates();
		ctx.save();
			ctx.globalAlpha=this.getAlpha();
			
			ctx.fillStyle=this.color;
			ctx.textBaseline='top';
			ctx.font=this.font;
			ctx.textAlign=this.align;
			ctx.fillText(this.text,wc.x,wc.y);
		ctx.restore();
		
		for(let i=0;i<this.children.length;i++){
			let child=this.children[i];
			child.onRender(ctx);
		}
	}
	window.TextWidget=TextWidget;
	
	class SplashTextWidget extends TextWidget{
		constructor(params,parent){
			super(params,parent);
			this.duration=params.duration??=1000;
			this.lastUpdate=0;
			
		}
		onUpdate(time){
			if(time-this.lastUpdate>=this.duration){
				this.setVisibility(false);
				this.lastUpdate=time;
			}
		}
		splashText(text,duration){
			this.duration=duration;
			this.text=text??="";
			this.setVisibility(true);
			this.lastUpdate=performance.now();
		}
	}
	window.SplashTextWidget=SplashTextWidget;
	
	class WidgetBtn extends Widget{
		constructor(params,parent){
			super(params,parent);
			this.data = params.data ??= {};
		}
		getData(){
			return this.data;
		}
		onMousedown(event){
			return super.onMousedown(event);
		}
	}
	window.WidgetBtn=WidgetBtn;
	
	const FONT_SIZE=24;
	class ScrollingCombatText extends Widget{
		constructor(params){
			super(params);
			this.active=params.active==undefined?true:params.active;
			this.scrollspeed=params.scrollspeed==undefined?1:params.scrollspeed;
			this.alphafadespeed=params.alphafadespeed==undefined?1:params.alphafadespeed;
			this.lifespan=params.lifespan==undefined?1:params.lifespan;
			this.color=params.color==undefined?"#fff":params.color;
			this.currentAlpha=1;
			this.items=[];
			this.lastUpdate=0;
			this.updateDelay=2;
		}
		push(text){
			let movedist=((this.scrollspeed>0)?1:-1)*FONT_SIZE;
			for(let i=0;i<this.children.length;i++){
				this.children[i].y+=movedist*(i+1);
			}
			let newC=new TextWidget({'w':this.w,'h':13,'text':text,'color':this.color,'font':'24px sans-serif'});
			newC.lifespan=this.lifespan;
			this.addChild(newC);
		}
		onRender(ctx){
			ctx.save();
			for(let i=0;i<this.children.length;i++){
				let child=this.children[i];
				child.onRender(ctx);
			}
			ctx.restore();
		}
		onUpdate(time){
			if(!this.active){return;}
			
			if(time-this.lastUpdate>=this.updateDelay){
			
				for(let i=0;i<this.children.length;i++){
					let child=this.children[i];
					child.y+=this.scrollspeed;
					child.setAlpha(child.getAlpha()-this.alphafadespeed);
					if(child.lifespan--<=0||child.y>this.y+this.h){
						this.removeChild(child);
					}
				}
				this.lastUpdate=time;
			}
		}
	}
	window.ScrollingCombatText=ScrollingCombatText;
	
	class CommandWidgetItem extends TextWidget{
		constructor(params){
			super(params);
			this.setSelected(params.selected===undefined?false:true);
			this.commands=params.commands===undefined?null:params.commands;
		}
		
		isSelected(){
			return this.selected;
		}
		onLeave(){
			
		}
	}
	CommandWidgetItem.prototype.onCommand=function(target){
		if(target==undefined||this.commands==null){return;}
		for(let i=0;i<this.commands.length;i++){
			target[this.commands[i]]();
		}
	}
	
	CommandWidgetItem.prototype.setSelected=function(selected){
		this.selected=selected;
		if(selected){
			if(this.font.indexOf('bolder')===-1){
				this.font='bolder '+this.font;
			}
		}else{
			this.font=this.font.replace('bolder ','');
		}
	}
	CommandWidgetItem.prototype.onRender=function(ctx){
		let wc=this.calculateCoordinates();
		
		ctx.fillStyle=this.color;
		ctx.textBaseline='top';
		ctx.font=this.font;
		ctx.textAlign=this.align;
		ctx.fillText(this.text,wc.x,wc.y);
		
		for(let i=0;i<this.children.length;i++){
			let child=this.children[i];
			child.onRender(ctx);
		}
	}
	window.CommandWidgetItem=CommandWidgetItem;
	
	const KEY_ARROW_DOWN=40;
	const KEY_ARROW_UP=38;
	const KEY_RETURN=13;
	const KEY_ESCAPE=27;
	class CommandWidget extends Widget{
		constructor(params){
			super(params);
			this.selectedIdx=0;
			this.active=params.active===undefined?false:params.active;
			this.target=null;
		}
	}
	CommandWidget.prototype.onKeydown=function(event, target){
		switch(event.which){
			case KEY_ARROW_DOWN:
				this.selectNext();
			break;
			case KEY_ARROW_UP:
				this.selectPrevious();
			break;
			case KEY_RETURN:
				this.onCommand(target);
			break;
		}
		this.updateSelection();
	}
	
	CommandWidget.prototype.onCommand=function(target){
		this.children[this.selectedIdx].onCommand(target);
	}
	
	CommandWidget.prototype.updateSelection=function(){
		if(this.children.length<=0){return;}
		for(let i=0;i<this.children.length;i++){
			let child=this.children[i];
			child.setSelected(false);
		}
		this.children[this.selectedIdx].setSelected(true);
	}
	
	CommandWidget.prototype.selectNext=function(){
		let idx=this.selectedIdx;
		this.selectedIdx=idx+1<this.children.length?idx+1:0;
	}
	CommandWidget.prototype.selectPrevious=function(){
		let idx=this.selectedIdx;
		this.selectedIdx=idx-1>=0?idx-1:this.children.length-1;
	}
		
	
	window.CommandWidget=CommandWidget;
	
	class MenuWidget extends Widget{
		constructor(params){
			super(params);
			this.inputCID=INPUT_CAPTURE_ID;
			INPUT_CAPTURE_ID++;
			this.active=params.active==undefined?false:params.active;
			this.toggleKey=params.togglekey==undefined?KEY_RETURN:params.togglekey;
			this.setActive(this.active);
			this.leaveTarget=null;
			this.selectedIdx=0;
			
			let returnWidget=params.returnwidget===undefined?false:params.returnwidget;
			if(returnWidget!==false){
				let gui=window.currentScene.GUI;
				this.leaveTarget=gui.getWidgetByName(returnWidget);
			}
		}
		setActive(active){
			super.setActive(active);
			
			$(document).off(`keydown.guikeydown${this.inputCID}`);
			if(active){
				$(document).on(`keydown.guikeydown${this.inputCID}`,this.onKeydown.bind(this));
			}
		}
		onKeydown(event){
			if(!this.active){return;}
			switch(event.which){
				case KEY_ARROW_DOWN:
					this.selectNext();
				break;
				case KEY_ARROW_UP:
					this.selectPrevious();
				break;
				case this.toggleKey:
					this.onCommand();
				break;
				case KEY_ESCAPE:
					this.onLeave();
				break;
				
			}
			this.updateSelection();
			return true;
		}
		
		onFocus(){
			//this.unFocusAll();
			
			this.setActive(true);
			this.setVisibility(true);
		}
		onLeave(){
			if(this.leaveTarget===null){return;}
			this.setActive(false);
			this.setVisibility(false);
			
			this.leaveTarget.setVisibility(true);
			this.leaveTarget.setActive(true);
			
		}
		unFocusAll(){
			let gui=window.currentScene.GUI;
			gui.unFocusAll();
			
		}
		toggleActive(){
			this.setActive(!this.active);
		}
		getSelected(){
			return this.children[this.selectedIdx];
		}
		onCommand(target){
			let optionItems=this.getOptionItems();
			if(optionItems.length<=0){return;}
			let selection=this.getSelected();
			optionItems[this.selectedIdx].onCommand(target,this);
		}
		onToggle(){
			this.toggleActive();
		}
		updateSelection(){
			let optionItems=this.getOptionItems();
			if(optionItems.length<=0){return;}
			for(let i=0;i<optionItems.length;i++){
				let child=optionItems[i];
				child.setSelected(false);
			}
			optionItems[this.selectedIdx].setSelected(true);
		}
		selectNext(){
			let optionItems=this.getOptionItems();
			if(optionItems.length<=0){return;}
			let idx=this.selectedIdx;
			this.selectedIdx=idx+1<optionItems.length?idx+1:0;
		}
		selectPrevious(){
			let optionItems=this.getOptionItems();
			if(optionItems.length<=0){return;}
			let idx=this.selectedIdx;
			this.selectedIdx=idx-1>=0?idx-1:optionItems.length-1;
		}
		getOptionItems(){
			let ret=[];
			for(let i=0;i<this.children.length;i++){
				let child=this.children[i];
				if(child instanceof MenuWidgetOptionItem){
					ret.push(child);
				}
			}
			return ret;
		}
		Unload(){
			super.Unload();
			this.setActive(false);
		}
	}
	window.MenuWidget=MenuWidget;
	
	class MenuWidgetOptionItem extends TextWidget{
		constructor(params){
			super(params);
			this.toggleTarget=params.toggle===undefined?false:params.toggle;
		}
		onCommand(target,returnTarget){
			if(this.toggleTarget){
				let gui=window.currentScene.GUI;
				let targetWidget=gui.getWidgetByName(this.toggleTarget);
				if(targetWidget!==null){
					targetWidget.onFocus();
				}
				returnTarget.setActive(false);
			}
		}
		setSelected(selected){
			this.selected=selected;
			if(selected){
				if(this.font.indexOf('bolder')===-1){
					this.font='bolder '+this.font;
				}
			}else{
				this.font=this.font.replace('bolder ','');
			}
		}
	}
	
	window.MenuWidgetOptionItem = MenuWidgetOptionItem;
	
	class MenuWidgetOptionImageItem extends MenuWidgetOptionItem{
		constructor(params){
			super(params);
		}
		onRender(ctx){
			super.onRender(ctx);
			if(!this.visible){return;}
			let wc=this.calculateCoordinates();
			ctx.save();
			ctx.globalAlpha=this.currentAlpha;
			if(this.img!==null){
				if(this.loaded){
					ctx.drawImage(this.img.Image(),wc.x,wc.y,this.w,this.h);
				}
			}else if (this.bgcolor){
				ctx.fillStyle=this.bgcolor;;
				ctx.fillRect(wc.x,wc.y,this.w,this.h);
			}
			if(this.anim){
				this.anim.x=wc.x;
				this.anim.y=wc.y;
				this.anim.onRender(ctx);
			}
			if(this.selected){
				ctx.strokeStyle='#e6b800';
				ctx.lineWidth=2;
				ctx.strokeRect(wc.x,wc.y,this.w,this.h);
			}
			ctx.restore();
			for(let i=0;i<this.children.length;i++){
				let child=this.children[i];
				child.onRender(ctx);
			}
		}
	}
	window.MenuWidgetOptionImageItem=MenuWidgetOptionImageItem;
	
	class MenuWidgetOptionPlayerEquipItem extends MenuWidgetOptionImageItem{
		constructor(params,parent){
			super(params);
			this.targetKey=params.equipkey;
		}
		onCommand(target,returnTarget){
			if(window.Equipment.equipItem(this.targetKey,JSON.parse(window.Session.getItem("equipitem")).item)){
				if(this.toggleTarget){
					let gui=window.currentScene.GUI;
					let targetWidget=gui.getWidgetByName(this.toggleTarget);
					if(targetWidget!==null){
						targetWidget.onFocus();
					}
				}
				returnTarget.onLeave();
			}else{
				let tempMessage=new TextWidget({'x':5,'y':120,'w':80,'h':20,'text':'Already equiped'});
				let guiParent=this.parent;
				guiParent.addChild(tempMessage);
				setTimeout(function(){
					guiParent.removeChild(tempMessage);
				},1000);
			}
		}
	}
	window.MenuWidgetOptionPlayerEquipItem=MenuWidgetOptionPlayerEquipItem;
	
	class TextMenuList extends MenuWidget{
		constructor(params,parent){
			super(params);
			this.dataSource=params.datasource===undefined?null:params.datasource;
			if(window[this.dataSource]!==undefined){
				let key=params.datakey===undefined?"":params.datakey;
				let ds=new window[this.dataSource](key);
				let dataText=ds.list();
				let y=18;
				
				let collected={};
				for(let i=0;i<dataText.length;i++){
					let item=dataText[i];
					if(collected[item.name]===undefined){
						collected[item.name]={'count':1,'item':item};
					}else{
						collected[item.name].count++;
					}
				}
				
				let iconTypes={'weapon':'assets/gui/icons/weaponico.png','armor':'assets/gui/icons/armorico.png'};
				let i=0;
				for(let idx in collected){
					let item=collected[idx];
					if(item.item.type!==undefined){
						let ico=new Widget({'x':7,
							'y':28+y*i,
							'w':16,
							'h':16,
							'imgsrc':iconTypes[item.item.type]
						});
						this.addChild(ico);
					}
					let option=new EquipItemMenuItem({'x':25,
						'y':y*i+31,
						'w':this.w,
						'h':16,
						'font':'14px sans-serif',
						'text':item.item.name + ' ('+item.count + 'x)',
						'toggle':'ItemUseMenu',
						/* 'returnwidget':parent.getName(), */
						'item':item});
					
					this.addChild(option);
					
					i++;
				}
			}
		}
	}
	window.TextMenuList=TextMenuList;
	
	class EquipItemMenuItem extends MenuWidgetOptionItem{
		constructor(params){
			super(params);
			this.item=params.item===undefined?null:params.item;
		}
		onCommand(target,returnTarget){
			super.onCommand(target,returnTarget);
			window.Session.setItem("equipitem",JSON.stringify(this.item));
		}
	}
	window.EquipItemMenuItem=EquipItemMenuItem;
	
	const KEY_RIGHT=39;
	const KEY_LEFT=37;
	class EquipItemMenuWidget extends MenuWidget{
		constructor(params){
			super(params);
			this.item=null;
		}
		setTargetItem(item){
			this.item=item;
		}
		onKeydown(event){
			if(!this.active){return;}
			switch(event.which){
				case KEY_RIGHT:
					this.selectNext();
				break;
				case KEY_LEFT:
					this.selectPrevious();
				break;
				case KEY_ESCAPE:
					this.onLeave();
				break;
				case KEY_RETURN:
					this.onCommand(this.toggleTarget,this);
				break;
			}
			this.updateSelection();
		}
	}
	window.EquipItemMenuWidget=EquipItemMenuWidget;
	
	const PLAYER_STATISTICS_KEY="statistics";
	class CharacterStatisticWidget extends MenuWidget{
		constructor(params){
			super(params);
			this.charName=params.charname==undefined?'':params.charname;
			
			if(this.charName!==undefined){
				let pattern=/\$\{(name)(\d*)\}/;
				let res=this.charName.match(pattern);
				if(res!==null){
					this.charName=window.getPlayerName(parseInt(res[2]));
				}
			}
			let character=getPartyCharacterFromName(this.charName,PLAYER_PARTY_KEY);
			let nameWidget=new TextWidget({'x':7,'y':28,'w':150,'h':40,'font':window.TEXT_SUB_CAPTION,'text':character.name});
			this.addChild(nameWidget);
			
			this.populateStatistics(character);
		}
		populateStatistics(character){
			let keys=JSON.parse(Session.getItem(PLAYER_STATISTICS_KEY));
			
			for(let i=0;i<keys.length;i++){
				let key=keys[i];
				if(character[key]!==undefined){
					let nwC=new TextWidget({'x':9,'y':58+(i*10),'w':80,'h':40,'font':window.TEXT_SMALL,'text':key+': '});
					let nwV=new TextWidget({'x':89,'y':58+(i*10),'w':40,'h':40,'font':window.TEXT_SMALL,'text':character[key]});
					this.addChild(nwC);
					this.addChild(nwV);
				}
			}
		}
	}
	window.CharacterStatisticWidget = CharacterStatisticWidget;
	
	const DIALOG_PADDING=10;
	const DIALOG_SKIP_KEY=32;
	class DialogWidget extends TextWidget{
		constructor(params,parent){
			super(params,parent);
			this.textIndex=0;
			this.scrollSpeed=params.scrollspeed===undefined?2000:params.scrollspeed;
			this.lastUpdate=0;
			this.fullPartIndex=0;
			this.textIndex=0;
			this.textParts=[];
			this.done=false;
			this.close=false;
			this.fontSize=parseInt(this.font);
			
			this.calculateTextParts();
			
			$(document).on(`keydown.guikeydowndialog`,this.onKeydown.bind(this));
		}
		Unload(){
			$(document).off(`keydown.guikeydowndialog`,this.onKeydown.bind(this));
		}
		onKeydown(event){
			if(event.which==DIALOG_SKIP_KEY){
				if(!this.done){
					this.done=true;
					this.fullPartIndex=this.textParts.length;
				}else{
					if(this.hasParent()){
						this.parent.removeChild(this);
					}
					this.Unload();
					this.close=true;
				}
			}
			return true;
		}
		isDone(){
			return this.done;
		}
		shouldClose(){
			return this.close;
		}
		calculateTextParts(){
			let ctx=window.canvas.getContext();
			let parts=this.text.split(" ");
			let lineStr="";
			let rowLen=0;
			let rowLenMax=0;
			ctx.save();
				ctx.fillStyle=this.color;
				ctx.textBaseline='top';
				ctx.font=this.font;
				ctx.textAlign=this.align;
				for(let i=0;i<parts.length;i++){
					let w=ctx.measureText(parts[i]+" ").width;
					if(w+rowLen>this.w-DIALOG_PADDING){
						this.textParts.push(lineStr);
						rowLenMax=rowLenMax<rowLen?rowLen:rowLenMax;
						rowLen=0;
						lineStr="";
					}
					lineStr+=parts[i]+" ";
					rowLen+=w;
				}
				this.textParts.push(lineStr);
			ctx.restore();
			
			rowLenMax=rowLenMax==0?rowLen:rowLenMax;
			this.h=this.textParts.length*this.fontSize+(DIALOG_PADDING*2);
			this.w=rowLenMax+(DIALOG_PADDING*2);
		}
		onRender(ctx){
			let wc=this.calculateCoordinates();
			
			ctx.save();
				ctx.globalAlpha=this.getAlpha();
				this.renderBackground(ctx,wc);
				this.renderBorder(ctx,wc);
				
				ctx.fillStyle=this.color;
				ctx.textBaseline='top';
				ctx.font=this.font;
				ctx.textAlign=this.align;
				let i=0;
				for(;i<this.fullPartIndex;i++){
					ctx.fillText(this.textParts[i],wc.x+DIALOG_PADDING,wc.y+(i*this.fontSize)+DIALOG_PADDING);
				}
				if(!this.done){
					ctx.fillText(this.textParts[this.fullPartIndex].substring(0,this.textIndex),wc.x+DIALOG_PADDING,wc.y+(i*this.fontSize)+DIALOG_PADDING);
				}
			ctx.restore();

			for(let i=0;i<this.children.length;i++){
				let child=this.children[i];
				child.onRender(ctx);
			}
		}
		
		onUpdate(time){
			let delta=time-this.lastUpdate;
			if(!this.done&&delta>this.scrollSpeed){
				this.textIndex++;
				if(this.textIndex>=this.textParts[this.fullPartIndex].length){
					this.textIndex=0;
					this.fullPartIndex++;
					if(this.fullPartIndex>=this.textParts.length){
						this.done=true;
						this.fullPartIndex=this.textParts.length;
					}
				}
				
				
				this.lastUpdate=time;
			}
		}
	}
	window.DialogWidget=DialogWidget;
	
	
	class MenuWidgetCharacterSelect extends MenuWidget{
		constructor(params){
			super(params);
			
			let party=JSON.parse(window.Session.getItem(PLAYER_PARTY_KEY));
			
			party.forEach(function(item,index,org){
				this.addCharacter(item,index);
			}.bind(this));
			
			
		}
		addCharacter(character,index){
			let widget=new MenuWidgetOptionItem({'x':5,'y':28+16*index,'text':character.name,'font':'14px sans-serif','selected':index==0,"toggle":`char_${index}_statistic`});
			this.addChild(widget);
		}
	}
	window.MenuWidgetCharacterSelect=MenuWidgetCharacterSelect;
	
	class GridWidget extends Widget{
		constructor(params,parent){
			super(params,parent);
			let wc=this.calculateCoordinates();
			
			this.gridCellSize=setOrDefault(params,"gridcellsize",32);
			this.grid=new Grid();
			this.grid.loadFromProperties({'x':wc.x,'y':wc.y,'gridcellsize':this.gridCellSize,'w':this.w,'h':this.h});
			this.gridSelector=new GridSelector();
			this.gridSelector.loadFromProperties({'x':0,'y':0,'id':this.name+'gridselector','gridcellsize':this.gridCellSize,'w':this.gridCellSize,'h':this.gridCellSize,'registerclick':false,'alpha':0.3,'color':'#aaf'});
			this.grid.append(this.gridSelector);
			
			if(params.keymap!==undefined){
				this.gridSelector.setKeymap({'LEFT':params.keymap.LEFT,'RIGHT':params.keymap.RIGHT,'UP':params.keymap.UP,'DOWN':params.keymap.DOWN,'SELECT':params.keymap.SELECT,'REMOVE':params.keymap.REMOVE});
			}
			
			//SceneManager.append(this.grid);
		}
		
		onRender(ctx){
			super.onRender(ctx);
			let wc=this.calculateCoordinates();
			this.grid.onRender(ctx);
		}
		getPicker(){return this.gridSelector;}
		
	}
	window.GridWidget=GridWidget;
	
	class GUI{
		constructor(params){
			const cnvs=window.canvas.getCanvas();
			this.root=new Widget({  //root widget
				'x':0,
				'y':0,
				'w':cnvs.width,
				'h':cnvs.height,
				'name':'root'
			})
			if(params&&params.src!==undefined){
				this.Load(params.src);
			}
			//$(document).on(`keydown.guikeydown`,this.onKeydown.bind(this));
		}
		onKeydown(event){
			return this.root.onKeydown(event);
		}
		onMousemove(event){
			return this.root.onMousemove(event);
		}
		onClick(event){
			return this.root.onClick(event);
		}
		onMousedown(event){
			return this.root.onMousedown(event);
		}
		onMouseup(event){
			return this.root.onMouseup(event);
		}
		unFocusAll(){
			this.root.forceUnfocus();
		}
		isWidgetVisibleByName(name){
			let widget=this.getWidgetByName(name);
			return widget.isVisible();
		}
		appendToRoot(widget){
			this.getRoot().addChild(widget);
		}
		removeFromRoot(widget){
			this.getRoot().removeChild(widget);
		}
		getRoot(){
			return this.root;
		}
	}
	GUI.prototype.getWidgetsByType=function(type){
		return this.root.getWidgetsByType(type);
	}
	GUI.prototype.onRender=function(ctx){
		this.root.onRender(ctx);
	}
	GUI.prototype.onUpdate=function(time){
		this.root.onUpdate(time);
	}
	GUI.prototype.loadFromProperties=function(item){
		if(item.src!==undefined){
			this.Load(item.src);
		}
	}
	GUI.prototype.getWidgetByName=function(name){
		return this.root.getWidgetByName(name);
	}
	GUI.prototype.Load=function(src,call){
		return fetch(src)
			.then(response => response.json())
			.then(data => { this.parseJSON(data,this.root)})
			.then(call);
	}
	GUI.prototype.parseJSON=function(data,parent){
		let widgets=data.widgets;
		for(let i=0;i<widgets.length;i++){
			let obj=widgets[i];
			let type=obj.type;
			
			let newWidget=new window[type](obj,parent);
			//parent.addChild(newWidget);
			
			if(obj.widgets!==undefined){
				this.parseJSON(obj,newWidget);
			}
		}
	}
	
	GUI.prototype.Unload=function(){
		this.root.Unload();
		$(document).off(`keydown.guikeydown`);
	}
	
	window.GUI=GUI;
	
})();