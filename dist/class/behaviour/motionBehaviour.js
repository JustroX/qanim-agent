"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const behaviour_1 = require("../../behaviour");
const vector_1 = require("../../lib/vector");
class MotionBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onBirth((state) => {
            const { acceleration, velocity } = state.getAll();
            if (!acceleration)
                state.set('acceleration', new vector_1.Vector2(0, 0));
            if (!velocity)
                state.set('velocity', new vector_1.Vector2(0, 0));
        });
        this.onUpdate((state, dt) => {
            if (!dt)
                return;
            const { acceleration, velocity, transform } = state.getAll();
            const { position } = transform;
            position.add(velocity.mulImm(dt));
            velocity.add(acceleration.mulImm(dt));
            let child = this.childFirst;
            while (child) {
                if (child.update)
                    child.update(state, dt);
                child = child.next;
            }
        });
    }
}
exports.MotionBehaviour = MotionBehaviour;
