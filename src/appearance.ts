import { Dictionary, Map2 } from './lib/interfaces';
import { State } from './state';

export class Appearance{
	store: Dictionary<any> = {};
	constructor() {}
	draw: Map2<State,CanvasRenderingContext2D,void> | undefined;
	onDraw(draw: Map2<State,CanvasRenderingContext2D,void>) {
		this.draw = draw;
	}
}