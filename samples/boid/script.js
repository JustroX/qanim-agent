const {
	Qanim,
	BoidAgent,
	Behaviour,
	Vector2
} = QanimLibrary;

const qanim = new Qanim();

const WIDTH = window.screen.width-50;
const HEIGHT = window.screen.height-200;
const middleOfScreen = new Vector2(WIDTH/2,HEIGHT/2);

let FORCE = 1000;
function createAgent() {
	const agent = new BoidAgent();
	agent.appearance.loadImage('../sprites/circle.png');
	agent.state.getTransform().position.set(new Vector2( Math.random()*WIDTH , Math.random()*HEIGHT ));
	agent.state.set('velocity',new Vector2( 100 - Math.random()*200 , 100 - Math.random()*200 ));
	return agent;
}

qanim.createCanvas('main',WIDTH,HEIGHT);
qanim.addCanvasToElement(document.body);

let count = 0;
while(count++<100)
	qanim.add(createAgent());

qanim.run();
