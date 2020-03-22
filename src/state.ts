import { Transform } from './lib/transform';
import { Dictionary } from './lib/interfaces';

interface StateConfig{
	setDefault?: boolean
}

export class State{
	store: Dictionary<any> = {};

	setState( newState: Dictionary<any>  ) {
		for(let x in newState)
			if(newState.hasOwnProperty(x))
				this.store[x] = newState[x];
	}

	set(key: string, val: any){
		this.store[key] = val;
	}

	get(key: string) {
		return this.store[key];
	}

	getAll<T>() {
		return this.store as T;
	}

	constructor(config: StateConfig = {}){
		const {
			setDefault
		} = config;

		if(setDefault || setDefault == undefined) {
			this.set('transform',new Transform());
		}
	}


	getTransform() {
		return this.get('transform') as Transform;
	}
}