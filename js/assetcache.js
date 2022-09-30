"use strict";


class AssetCache{
	constructor(){
		this.cache={};
	}
	getItem(path){
		const idx=path.replace("/","");
		return this.cache.hasOwnProperty(idx)?this.cache[idx]:null;
	}
	_fetch(path){
	//	return fetch(path).then((data)=>;
	}
	
}