const {
	Qanim,
	MechanicalAgent,
	Behaviour,
	Vector2
} = QanimLibrary;

const qanim = new Qanim();

const WIDTH = window.screen.width-50;
const HEIGHT = window.screen.height-200;
const middleOfScreen = new Vector2(WIDTH/2,HEIGHT/2);

let FORCE = 1000;
function createAgent() {
	const agent = new MechanicalAgent();
	agent.appearance.loadImage('../sprites/circle.png');
	agent.state.getTransform().position.set(new Vector2( Math.random()*WIDTH , Math.random()*HEIGHT ));
	agent.state.set('velocity',new Vector2( Math.random()*200 , Math.random()*200 ));
	
	agent.behaviour.addChildren(new Behaviour((state, dt)=>{
		const acceleration = state.get('acceleration'); 
		const position = state.getTransform().position;
		const dx = middleOfScreen.sub(position);
		const force = dx.div(1000).mul(FORCE);
		acceleration.set(force);
	}));

	agent.behaviour.addChildren(new Behaviour((state, dt)=>{
		const acceleration = state.get('acceleration'); 
		acceleration.set(acceleration.mulImm(0.9));
	}));

	return agent;
}

qanim.createCanvas('main',WIDTH,HEIGHT);
qanim.addCanvasToElement(document.body);

qanim.run();
let count = 0;
qanim.behaviour.update = (state,dt)=>{
	if(count++<100)
		qanim.add(createAgent());
};
