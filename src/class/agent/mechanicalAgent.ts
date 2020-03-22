import { Agent } from '../../agent';
import { ImageAppearance } from '../appearance/imageAppearance';
import { MotionBehaviour } from '../behaviour/motionBehaviour';
import { Vector2 } from '../../lib/vector';

export class MechanicalAgent extends Agent {
	constructor() {
		super();
		this.behaviour = new MotionBehaviour();
		this.appearance = new ImageAppearance();
	}

	setMotion(newVelocity: Vector2) {
		const { velocity } = this.state.getAll();	
		velocity.set(newVelocity);
	}
}