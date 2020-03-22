"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transform_1 = require("./lib/transform");
class State {
    constructor(config = {}) {
        this.store = {};
        const { setDefault } = config;
        if (setDefault || setDefault == undefined) {
            this.set('transform', new transform_1.Transform());
        }
    }
    setState(newState) {
        for (let x in newState)
            if (newState.hasOwnProperty(x))
                this.store[x] = newState[x];
    }
    set(key, val) {
        this.store[key] = val;
    }
    get(key) {
        return this.store[key];
    }
    getAll() {
        return this.store;
    }
    getTransform() {
        return this.get('transform');
    }
}
exports.State = State;
