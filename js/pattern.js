"use strict";

class Pattern{
	constructor(){
		this.pattern=[];
	}
	generatePattern(){
		for(let i=0;i<100;i++){
			this.pattern.push(rand(0,4));
		}
		return this.pattern;
	}
	getPattern(){
		return this.pattern;
	}
}