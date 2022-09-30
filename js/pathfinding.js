"use strict";

(function(){
	
	class AStarNode{
		constructor(node){
			this.node=node;
			this.parent=null;
			this.f=0;
			this.g=0;
			this.h=0;
		}
	}
	
	AStarNode.prototype.attach=function(child){
		child.setParent(this);
	}
	
	AStarNode.prototype.setParent=function(parent){
		this.parent=parent;
	}
	AStarNode.prototype.setG=function(g){
		this.g=g;
	}
	AStarNode.prototype.getG=function(){
		if(this.hasParent()){
			return this.g+this.parent.getG();
		}
		return this.g;
	}
	AStarNode.prototype.setH=function(h){
		this.h=h;
	}
	AStarNode.prototype.hasParent=function(){
		return this.parent!==null&&this.parent!==undefined;
	}
	AStarNode.prototype.calculateF=function(){
		this.f=this.g+this.h;
	}
	AStarNode.prototype.getF=function(){
		return this.f;
	}
	AStarNode.prototype.getNeighbors=function(){
		return this.node.getNeighbors();
	}
	
	class PathFinder extends SceneItem{
		constructor(params){
			super(params);
			
			this.targetNode=null;
		}
		loadFromProperties(params){
			super.loadFromProperties(params);
			
			this.pathNodeSourceTarget=params.pathnodetarget ??= null;
		}
		getPathNodes(){
			const pathNodeSource=SceneManager.getItemById(this.pathNodeSourceTarget);
			return pathNodeSource.getPathingNodes();
		}
	}
	
	
	class AStar{
		constructor(){
			
		}
	}

	function find(collection,node){
		for(let i=0;i<collection.length;i++){
			if(collection[i].node==node){
				return i;
			}
		}
		return -1;
	}
	
	AStar.prototype.calculateH=function(n1,n2){
		return Math.abs((n2.x-n1.x)/n1.w)+Math.abs((n2.y-n1.y)/n1.h);
	}
	
	AStar.prototype.path=function(start,end){
		let startNode=new AStarNode(start);
		startNode.setH(this.calculateH(end,start));
		startNode.setG(0);
		
		let open=[startNode];
		let closed=[];
		while(open.length>0){
			let node=open.shift();
			let neighbors=node.getNeighbors();
			for(let i=0;i<neighbors.length;i++){
				let n=neighbors[i];
				if(n!==null){
					if(n.index!=15){
						if(find(closed,n)!==-1){continue;}
						let currentNode=null;
						let nodeIndex=find(open,n);
						if(nodeIndex!==-1){
							currentNode=open[nodeIndex];
							let oldG=currentNode.getG();
							let p=currentNode.parent;
							node.attach(currentNode);
							let newG=currentNode.getG();
							if(newG>oldG){
								p.attach(currentNode);
							}
						}else{
							currentNode=new AStarNode(n);
							node.attach(currentNode);
							open.push(currentNode);
						}
						let tempG=i%2==0?10:14;
						currentNode.setG(tempG);
						currentNode.setH(Math.abs((n.x-end.x)/n.w)+Math.abs((n.y-end.y)/n.h));
						currentNode.calculateF();
					}
				}
			}
			closed.push(node);
			if(node.node==end){
				break;
			}
			open.sort(function(a,b){
				let af=a.getF();
				let bf=b.getF();
				if(af<bf){
					return -1;
				}
				if(af>bf){
					return 1;
				}
				return 0;
			});
		}
		let c=closed.pop();
		let ret=[];
		while(c.parent){
			ret.push(c);
			c=c.parent;
		}
		return ret;
	}
	window.AStar=AStar;
	
})();