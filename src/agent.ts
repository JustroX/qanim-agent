import { State } from './state';
import { Behaviour } from './behaviour';
import { Appearance } from './appearance';
import { v4 as uuidv4 } from 'uuid';

export class Agent{
	id: string = uuidv4();
	state: State;
	behaviour: Behaviour;
	appearance: Appearance;
	
	constructor(){
		this.state = new State();
		this.behaviour = new Behaviour();
		this.appearance = new Appearance();
	}
}