import { v4 as uuidv4 } from 'uuid';
import { Dictionary, Map } from './lib/interfaces';
import { State } from './state';

export interface BehaviourOptions{
	name: string
}

export class Behaviour{

	name: string = 'behaviour-' + uuidv4().slice(0,5);
	next: Behaviour | undefined;
	birth: Map<State,void> | undefined;
	update: Map<State,void> | undefined;
	death: Map<State,void> | undefined;

	readonly children: Dictionary<Behaviour> = {};
	childFirst: Behaviour | undefined;
	childEnd: Behaviour | undefined;

	onBirth(fn: Map<State,void>){
		this.birth = fn;
	}
	onUpdate(fn: Map<State,void>){
		this.update = fn;
	}
	onDeath(fn: Map<State,void>){
		this.death = fn;
	}

	constructor(update?: Map<State,void>,opts?: BehaviourOptions){
		if(update)
			this.onUpdate(update);
		if (opts) {
			const {name} = opts;
			this.name = name;
		}
	}

	chain(behaviour: Behaviour){
		this.next = behaviour;
	}

	private deleteChildren(){
		for(let child in this.children) {
			if(this.children.hasOwnProperty(child))
				delete this.children[child];
		}
	}

	setChildren(...children: Behaviour[]) {
		this.deleteChildren();
		this.childEnd = undefined;
		children.forEach(child => {
			if(this.childEnd)
				this.childEnd.chain(child);
			else
				this.childFirst = child;

			const { name } = child;
			this.children[name] = child; 
			this.childEnd = child;
		});
	}

	addChildren(...children: Behaviour[]) {
		children.forEach(child => {
			if(this.childEnd) 
				this.childEnd.chain(child);
			else
				this.childFirst = child;
			this.childEnd = child;
		});
	}
}