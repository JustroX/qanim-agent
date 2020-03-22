import { Behaviour } from '../../behaviour';
import { Vector2 } from '../../lib/vector';
import { Transform } from '../../lib/transform';


interface MotionState {
	transform: Transform,
	acceleration: Vector2,
	velocity: Vector2
}


export class MotionBehaviour extends Behaviour {
	constructor(){
		super();
		this.onBirth((state)=>{
			const { 
				acceleration,
				velocity
			} = state.getAll();
			
			if(!acceleration)
				state.set('acceleration',new Vector2(0,0));
			if(!velocity)
				state.set('velocity',new Vector2(0,0));
		});

		this.onUpdate((state, dt)=>{
			if(!dt) return;
			const { 
				acceleration,
				velocity,
				transform
			} = state.getAll() as MotionState;

			const { position } = transform as Transform;
			position.add( velocity.mulImm(dt) );
			velocity.add( acceleration.mulImm(dt) );

			let child = this.childFirst;
			while(child) {
				if(child.update) 
					child.update(state,dt);
				child = child.next;
			}
		});
	}
}