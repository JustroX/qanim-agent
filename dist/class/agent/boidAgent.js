"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("../../agent");
const imageAppearance_1 = require("../appearance/imageAppearance");
const boidBehaviour_1 = require("../behaviour/boidBehaviour");
const boids_1 = require("../meta/boids");
class BoidAgent extends agent_1.Agent {
    constructor() {
        super();
        this.behaviour = new boidBehaviour_1.BoidBehaviour();
        this.appearance = new imageAppearance_1.ImageAppearance();
        boids_1.BOIDS.push(this);
    }
    setMotion(newVelocity) {
        const { velocity } = this.state.getAll();
        velocity.set(newVelocity);
    }
}
exports.BoidAgent = BoidAgent;
