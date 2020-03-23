import { Agent } from '../../agent';
import { ImageAppearance } from '../appearance/imageAppearance';
import { BoidBehaviour } from '../behaviour/boidBehaviour';
import { Vector2 } from '../../lib/vector';
import { BOIDS } from '../meta/boids';


export class BoidAgent extends Agent {
	constructor() {
		super();
		this.behaviour = new BoidBehaviour();
		this.appearance = new ImageAppearance();
		BOIDS.push(this);
	}

	setMotion(newVelocity: Vector2) {
		const { velocity } = this.state.getAll();	
		velocity.set(newVelocity);
	}
}