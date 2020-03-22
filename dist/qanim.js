"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const behaviour_1 = require("./behaviour");
class Qanim {
    constructor() {
        this.agents = {};
        this.agentsList = [];
        this.screens = {};
        this.saintPetersList = [];
        this.running = false;
        this.fps = 30;
        this.state = new state_1.State();
        this.behaviour = new behaviour_1.Behaviour();
    }
    add(agent) {
        const { id } = agent;
        this.agents[id] = agent;
        this.agentsList.push(agent);
        agent.state.set('game', this);
        if (this.running && agent.behaviour.birth)
            agent.behaviour.birth(agent.state);
    }
    kill(agent) {
        this.saintPetersList.push(agent);
    }
    createCanvas(label = "main", width = 500, height = 500) {
        if (this.screens[label])
            throw new Error(`Screen ${label} is already set.`);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        this.screens[label] = canvas;
        return canvas;
    }
    getCanvas(label = "main") {
        return this.screens[label];
    }
    addCanvasToElement(el, screen = "main") {
        const canvas = this.screens[screen];
        if (!canvas)
            throw new Error(`Screen ${screen} does not exist.`);
        el.appendChild(canvas);
    }
    run() {
        this.initialization();
        this.running = true;
        let t_ = 0;
        const renderingFunction = () => {
            requestAnimationFrame((t) => {
                const dt = t_ == 0 ? 0 : t - t_;
                t_ = t;
                this.loop(dt / 1000);
                const canvas = this.screens['main'];
                const ctx = canvas.getContext('2d');
                if (ctx)
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.agentsList.forEach(agent => {
                    const { appearance, state } = agent;
                    const { draw } = appearance;
                    if (draw && ctx)
                        draw(state, ctx);
                });
                renderingFunction();
            });
        };
        renderingFunction();
    }
    enableScreen(label = 'main') {
    }
    loop(dt) {
        this.update(dt);
        this.garbageCollection();
    }
    initialization() {
        this.agentsList.forEach(agent => {
            const { behaviour, state } = agent;
            const { birth } = behaviour;
            if (birth)
                birth(state);
        });
    }
    update(dt) {
        if (this.behaviour.update)
            this.behaviour.update(this.state, dt);
        this.agentsList.forEach(agent => {
            const { behaviour, state } = agent;
            const { update } = behaviour;
            if (update)
                update(state, dt);
        });
    }
    garbageCollection() {
        this.saintPetersList.forEach(agent => {
            const { id, behaviour } = agent;
            delete this.agents[id];
            const index = this.agentsList.indexOf(agent);
            if (index >= 0)
                this.agentsList.splice(index, 1);
        });
    }
}
exports.Qanim = Qanim;
