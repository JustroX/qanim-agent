import { Agent } from './agent';
import { State } from './state';
import { Behaviour} from './behaviour';
import { Dictionary } from './lib/interfaces';

export class Qanim {
	state: State;
	behaviour: Behaviour;

	agents: Dictionary<Agent> = {};
	agentsList: Agent[] = [];

	screens: Dictionary<HTMLCanvasElement> = {};
	saintPetersList: Agent[] = [];

	running: boolean  =false;

	fps: number = 30;

	constructor() {
		this.state = new State();
		this.behaviour = new Behaviour();
	}

	add(agent: Agent) {
		const {id} = agent;
		this.agents[id] = agent;
		this.agentsList.push(agent);
		agent.state.set('game',this);

		if(this.running && agent.behaviour.birth)
			agent.behaviour.birth(agent.state);
	} 

	kill(agent: Agent){
		this.saintPetersList.push(agent);
	}

	createCanvas(	
		label: string = "main",
		width: number = 500,
		height: number = 500
	) {
		if(this.screens[label])
			throw new Error(`Screen ${label} is already set.`);

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		this.screens[label] = canvas;
		return canvas;
	}

	getCanvas(label: string = "main") {
		return this.screens[label];
	}

	addCanvasToElement(el: HTMLElement, screen: string = "main") {
		const canvas = this.screens[screen];
		if(!canvas)
			throw new Error(`Screen ${screen} does not exist.`);
		el.appendChild(canvas);
	}

	run() {
		this.initialization();
		this.running = true;
		let t_ = 0;
		const renderingFunction = ()=>{
			requestAnimationFrame((t: number)=>{

				const dt = t_ == 0? 0: t - t_;
				t_ = t;
				
				this.loop(dt/1000);
				
				const canvas = this.screens['main'];
				const ctx = canvas.getContext('2d');
				if(ctx)
					ctx.clearRect(0, 0, canvas.width, canvas.height);

				this.agentsList.forEach(agent => {
					const { appearance, state } = agent;
					const { draw } = appearance;
					if(draw && ctx)
						draw(state,ctx);
				});


				renderingFunction();
			});
		};

		renderingFunction();
	}

	enableScreen(label: string = 'main') {
	}

	private loop(dt: number) {
		this.update(dt);
		this.garbageCollection();
	}

	private initialization() {
		this.agentsList.forEach(agent => {
			const { behaviour, state } = agent;
			const { birth } = behaviour;
			if(birth) birth(state);
		});
	}

	private update(dt: number) {
		if(this.behaviour.update)
			this.behaviour.update(this.state,dt);
		this.agentsList.forEach(agent => {
			const { behaviour, state } = agent;
			const { update } = behaviour;
			if(update) update(state, dt);
		});
	}

	private garbageCollection() {
		this.saintPetersList.forEach(agent => {
			const {id, behaviour} = agent;
			delete this.agents[id];
			const index = this.agentsList.indexOf(agent);
			if(index>=0)
				this.agentsList.splice(index,1);
		});
	}
}