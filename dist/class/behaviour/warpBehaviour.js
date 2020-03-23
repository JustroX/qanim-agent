"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const behaviour_1 = require("../../behaviour");
class Warp extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            if (!dt)
                return;
            let child = this.childFirst;
            while (child) {
                if (child.update)
                    child.update(state, dt);
                child = child.next;
            }
            const { acceleration, velocity, transform } = state.getAll();
            const { position } = transform;
            position.x = (position.x + WIDTH) % WIDTH;
            position.y = (position.y + HEIGHT) % HEIGHT;
        });
    }
}
exports.Warp = Warp;
