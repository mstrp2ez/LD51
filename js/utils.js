"use strict";

const BACKEND_PATH='backend/';

function distanceTo(p0,p1){
	let dx=p1.x-p0.x;
	let dy=p1.y-p0.y;
	return Math.sqrt(dx*dx+dy*dy);
}
function lerpBetween(a,b,t){
	return a+(b-a)*t;
}
function moveTowards(e0,e1,speed){
	let dx=e1.x-e0.x;
	let dy=e1.y-e0.y;
	const d=Math.sqrt(dx*dx+dy*dy);
	
	dx/=d;
	dy/=d;
	
	dx*=speed;
	dy*=speed;
	e0.x+=dx;
	e0.y+=dy;
}
function hitTest(point,area){
	const offsetX=point.x;
	const offsetY=point.y;
	const dx=offsetX-area.x;
	const dy=offsetY-area.y;
	if(dx>=0&&dx<=area.w){
		if(dy>=0&&dy<=area.h){
			return true;
		}
	}
	return false;
}
function normalize(vec){
	let len=Math.sqrt(vec.x*vec.x+vec.y*vec.y);
	if(len==0){len=0.01;}
	vec.x/=len;
	vec.y/=len;
	
	return vec;
}
function smoothstep(a,b,value){
	if(value<a){return 0;}
	if(value>=b){return 1;}
	const t=(value-a)/(b-a);
	return t*t*(3-2*t);
}

class EventBroadcaster{
	constructor(owner){
		this.eventListeners={};
		this.owner=owner;
	}
	registerEventListener(event,callback){
		if(this.eventListeners.hasOwnProperty(event)){
			this.eventListeners[event].push(callback);
		}else{
			this.eventListeners[event]=[callback];
		}
	}
	fireEvent(event){
		if(this.eventListeners.hasOwnProperty(event)){
			for(let i=0;i<this.eventListeners[event].length;i++){
				this.eventListeners[event][i](this.owner);
			}
		}
	}
	Unload(){
		this.eventListeners=null;
		this.owner=null;
	}
}

function nextPo2(n){
	return Math.pow(2,Math.ceil(Math.log(n)/Math.log(2)));
}

function _get(idx,obj){
	let n=idx.indexOf('.');
	if(n>0){
		let sub=idx.substr(0,n);
		return _get(idx.substr(n+1),obj[sub]);
	}
	
	return obj[idx]==undefined?undefined:obj[idx];
}
function _set(idx,obj,val){
	let n=idx.indexOf('.');
	if(n>0){
		let sub=idx.substr(0,n);
		if(obj[sub]===undefined){
			obj[sub]={};
			_set(idx.substr(n+1),obj[sub],val);
		}else if(typeof obj[sub]=='object'){
			_set(idx.substr(n+1),obj[sub],val);
		}else{
			throw "Index reference contains non-object";
		}
	}else{
		obj[idx]=val;
	}
}

function rand(a,b){
	let min = Math.ceil(a);
	let max = Math.floor(b);
	return Math.floor(Math.random() * (max - min + 1) + min);
} //min-max inclusive

function randomNumberBetween(min,max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function setOrDefault(obj,key,def){
	return obj.hasOwnProperty(key)?obj[key]:def;
}