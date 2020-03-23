import { Behaviour } from '../../behaviour';
import { Vector2 } from '../../lib/vector';
import { Transform } from '../../lib/transform';

declare const WIDTH: number;
declare const HEIGHT: number;

interface MotionState {
	transform: Transform,
	acceleration: Vector2,
	velocity: Vector2
}


export class WrapBehaviour extends Behaviour {
	constructor(){
		super();
		this.onUpdate((state, dt)=>{
			if(!dt) return;

			let child = this.childFirst;
			while(child) {
				if(child.update) 
					child.update(state,dt);
				child = child.next;
			}

			const { 
				acceleration,
				velocity,
				transform
			} = state.getAll() as MotionState;

			const { position } = transform as Transform;
			position.x = ( position.x +  WIDTH ) % WIDTH;
			position.y = ( position.y + HEIGHT )% HEIGHT;
		});
	}
}