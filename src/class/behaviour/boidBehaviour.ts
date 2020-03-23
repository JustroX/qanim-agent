import { MotionBehaviour } from './motionBehaviour';
import { Behaviour } from '../../behaviour';
import { Vector2 } from '../../lib/vector';
import { Transform } from '../../lib/transform';

import {
	BOIDS,
	VISION_RADIUS
} from '../meta/boids';

import {  WrapBehaviour } from './wrapBehaviour';

interface BoidState {
	transform: Transform,
	acceleration: Vector2,
	velocity: Vector2
}

class CohesionBehaviour extends Behaviour{
	constructor(){
		super();

		this.onUpdate((state, dt)=>{
			const { position } = state.getTransform();
			const velocity = state.get('velocity');
			const target = this.targetPosition(position, velocity);
			const dx = target.sub(position);
			const distance = dx.mag();
			const speed = Math.min(distance, 100);

			if(distance>0) {
				dx.normalize().mul(speed);
				state.get('velocity').add(dx);
			}
		});
	}

	private isInFront(myPosition: Vector2, myDirection: Vector2, position: Vector2) {
		const dx = myPosition.sub(position);
		const heading = dx.normalize();

		if(myDirection.magRel()==0)
			return true;
		const directon = myDirection.normalizeImm();
		const delta = directon.sub(heading);
		return delta.x >= 0;
	}

	private targetPosition(myPosition: Vector2, myVelocity: Vector2){
		const distance = VISION_RADIUS*VISION_RADIUS;

		const nearMe =  BOIDS.filter(boid=>{
			const { position } = boid.state.getTransform();
			if(position == myPosition)
				return false;
			const dx = myPosition.sub(position);
			return dx.magRel() <= distance && this.isInFront(myPosition,myVelocity,position);
		});

		const v = new Vector2(0,0);
		nearMe.forEach( boid => {
			const { position } = boid.state.getTransform();
			v.add(position);
		});

		if(nearMe.length)
			return v.div(nearMe.length);
		return myPosition;
	}

}

class AlignmentBehaviour extends Behaviour{
	constructor(){
		super();

		this.onUpdate((state, dt)=>{
			const { position } = state.getTransform();
			const velocity= state.get('velocity');
			const dx = this.flockSpeed(position,velocity);
			const distance = dx.mag();
			const speed = Math.min(distance, 30);

			if(distance>0) {
				state.get('velocity').add(dx.normalize().mul(2*speed));
			}
		});
	}

	private isInFront(myPosition: Vector2, myDirection: Vector2, position: Vector2) {
		const dx = myPosition.sub(position);
		const heading = dx.normalize();

		if(myDirection.magRel()==0)
			return true;
		const directon = myDirection.normalizeImm();
		const delta = directon.sub(heading);
		return delta.x >= 0;
	}

	private flockSpeed(myPosition: Vector2, myVelocity: Vector2){
		const distance = VISION_RADIUS*VISION_RADIUS;

		const nearMe =  BOIDS.filter(boid=>{
			const { position } = boid.state.getTransform();
			if(position == myPosition)
				return false;

			const dx = myPosition.sub(position);
			return dx.magRel() <= distance && this.isInFront(myPosition,myVelocity,position);
		});

		const v = new Vector2(0,0);
		nearMe.forEach( boid => {
			const velocity= boid.state.get('velocity');
			v.add(velocity);
		});

		if(nearMe.length)
			return v.div(nearMe.length);
		return v;
	}

}

class AvoidanceBehaviour extends Behaviour{
	constructor(){
		super();

		this.onUpdate((state, dt)=>{
			const { position } = state.getTransform();
			const dx = this.separationForce(position);
			const distance = dx.mag();
			const speed = Math.min(10*distance, 30);

			if(distance>0) {
				dx.normalize().mul(-2*speed);
				state.get('velocity').add(dx);
			}
		});
	}

	private separationForce(myPosition: Vector2){
		const distance = 30*30;

		const nearMe =  BOIDS.filter(boid=>{
			const { position } = boid.state.getTransform();
			if(position == myPosition)
				return false;
			const dx = myPosition.sub(position);
			return dx.magRel() <= distance;
		});

		const v = new Vector2(0,0);
		nearMe.forEach( boid => {
			const { position } = boid.state.getTransform();
			v.add( position.sub(myPosition));
		});

		if(nearMe.length)
			return v.div(nearMe.length);
		return v;
	}

}

export class BoidBehaviour extends MotionBehaviour {
	constructor(){
		super();

		let prev = new Vector2(0,0);
		this.addChildren(
			new Behaviour((state, dt)=>{
				const velocity = state.get('velocity');
				prev.set(velocity);
				velocity.set(0,0);
			}),
			new CohesionBehaviour(),
			new AvoidanceBehaviour(),
			new AlignmentBehaviour(),
			new Behaviour((state, dt)=>{
				const velocity = state.get('velocity');
				const acceleration = state.get('acceleration');
				const speed = Math.min(velocity.mag(),100);

				if(speed!=0)
					acceleration.set(velocity.normalizeImm().mul(50*speed));
				
				const v = Math.min(prev.mag(),80);
				prev.normalize().mul(v);
				velocity.set(prev);
				// if(speed!=0) {
				// 	prev.add(velocity);
				// 	prev.normalize();
				// 	prev.mul(10*speed);
				// }
			}),
			new WrapBehaviour()
		);
	}
}