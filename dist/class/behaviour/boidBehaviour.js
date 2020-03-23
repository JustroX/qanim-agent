"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const motionBehaviour_1 = require("./motionBehaviour");
const behaviour_1 = require("../../behaviour");
const vector_1 = require("../../lib/vector");
const boids_1 = require("../meta/boids");
const wrapBehaviour_1 = require("./wrapBehaviour");
class CohesionBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            const { position } = state.getTransform();
            const velocity = state.get('velocity');
            const target = this.targetPosition(position, velocity);
            const dx = target.sub(position);
            const distance = dx.mag();
            const speed = Math.min(distance, 100);
            if (distance > 0) {
                dx.normalize().mul(speed);
                state.get('velocity').add(dx);
            }
        });
    }
    isInFront(myPosition, myDirection, position) {
        const dx = myPosition.sub(position);
        const heading = dx.normalize();
        if (myDirection.magRel() == 0)
            return true;
        const directon = myDirection.normalizeImm();
        const delta = directon.sub(heading);
        return delta.x >= 0;
    }
    targetPosition(myPosition, myVelocity) {
        const distance = boids_1.VISION_RADIUS * boids_1.VISION_RADIUS;
        const nearMe = boids_1.BOIDS.filter(boid => {
            const { position } = boid.state.getTransform();
            if (position == myPosition)
                return false;
            const dx = myPosition.sub(position);
            return dx.magRel() <= distance && this.isInFront(myPosition, myVelocity, position);
        });
        const v = new vector_1.Vector2(0, 0);
        nearMe.forEach(boid => {
            const { position } = boid.state.getTransform();
            v.add(position);
        });
        if (nearMe.length)
            return v.div(nearMe.length);
        return myPosition;
    }
}
class AlignmentBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            const { position } = state.getTransform();
            const velocity = state.get('velocity');
            const dx = this.flockSpeed(position, velocity);
            const distance = dx.mag();
            const speed = Math.min(distance, 30);
            if (distance > 0) {
                state.get('velocity').add(dx.normalize().mul(2 * speed));
            }
        });
    }
    isInFront(myPosition, myDirection, position) {
        const dx = myPosition.sub(position);
        const heading = dx.normalize();
        if (myDirection.magRel() == 0)
            return true;
        const directon = myDirection.normalizeImm();
        const delta = directon.sub(heading);
        return delta.x >= 0;
    }
    flockSpeed(myPosition, myVelocity) {
        const distance = boids_1.VISION_RADIUS * boids_1.VISION_RADIUS;
        const nearMe = boids_1.BOIDS.filter(boid => {
            const { position } = boid.state.getTransform();
            if (position == myPosition)
                return false;
            const dx = myPosition.sub(position);
            return dx.magRel() <= distance && this.isInFront(myPosition, myVelocity, position);
        });
        const v = new vector_1.Vector2(0, 0);
        nearMe.forEach(boid => {
            const velocity = boid.state.get('velocity');
            v.add(velocity);
        });
        if (nearMe.length)
            return v.div(nearMe.length);
        return v;
    }
}
class AvoidanceBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            const { position } = state.getTransform();
            const dx = this.separationForce(position);
            const distance = dx.mag();
            const speed = Math.min(10 * distance, 30);
            if (distance > 0) {
                dx.normalize().mul(-2 * speed);
                state.get('velocity').add(dx);
            }
        });
    }
    separationForce(myPosition) {
        const distance = 30 * 30;
        const nearMe = boids_1.BOIDS.filter(boid => {
            const { position } = boid.state.getTransform();
            if (position == myPosition)
                return false;
            const dx = myPosition.sub(position);
            return dx.magRel() <= distance;
        });
        const v = new vector_1.Vector2(0, 0);
        nearMe.forEach(boid => {
            const { position } = boid.state.getTransform();
            v.add(position.sub(myPosition));
        });
        if (nearMe.length)
            return v.div(nearMe.length);
        return v;
    }
}
class BoidBehaviour extends motionBehaviour_1.MotionBehaviour {
    constructor() {
        super();
        let prev = new vector_1.Vector2(0, 0);
        this.addChildren(new behaviour_1.Behaviour((state, dt) => {
            const velocity = state.get('velocity');
            prev.set(velocity);
            velocity.set(0, 0);
        }), new CohesionBehaviour(), new AvoidanceBehaviour(), new AlignmentBehaviour(), new behaviour_1.Behaviour((state, dt) => {
            const velocity = state.get('velocity');
            const acceleration = state.get('acceleration');
            const speed = Math.min(velocity.mag(), 100);
            if (speed != 0)
                acceleration.set(velocity.normalizeImm().mul(50 * speed));
            const v = Math.min(prev.mag(), 80);
            prev.normalize().mul(v);
            velocity.set(prev);
            // if(speed!=0) {
            // 	prev.add(velocity);
            // 	prev.normalize();
            // 	prev.mul(10*speed);
            // }
        }), new wrapBehaviour_1.WrapBehaviour());
    }
}
exports.BoidBehaviour = BoidBehaviour;
