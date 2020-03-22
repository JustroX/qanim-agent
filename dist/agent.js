"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const behaviour_1 = require("./behaviour");
const appearance_1 = require("./appearance");
const uuid_1 = require("uuid");
class Agent {
    constructor() {
        this.id = uuid_1.v4();
        this.state = new state_1.State();
        this.behaviour = new behaviour_1.Behaviour();
        this.appearance = new appearance_1.Appearance();
    }
}
exports.Agent = Agent;
