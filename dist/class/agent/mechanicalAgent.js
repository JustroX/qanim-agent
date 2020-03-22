"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("../../agent");
const imageAppearance_1 = require("../appearance/imageAppearance");
const motionBehaviour_1 = require("../behaviour/motionBehaviour");
class MechanicalAgent extends agent_1.Agent {
    constructor() {
        super();
        this.behaviour = new motionBehaviour_1.MotionBehaviour();
        this.appearance = new imageAppearance_1.ImageAppearance();
    }
    setMotion(newVelocity) {
        const { velocity } = this.state.getAll();
        velocity.set(newVelocity);
    }
}
exports.MechanicalAgent = MechanicalAgent;
