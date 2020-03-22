export class Vector2{
	readonly coords: [number,number] = [0,0];

	constructor(x: number,y: number){
		this.coords[0] = x;
		this.coords[1] = y;
	}

	get x() {
		return this.coords[0];
	}

	get y() {
		return this.coords[1];
	}

	set x(val: number) {
		this.coords[0] = val;
	}
	set y(val: number) {
		this.coords[1] = val;
	}

	set(x: number | Vector2, y: number) {
		if(x instanceof Vector2) {
			this.coords[0] = x.coords[0];
			this.coords[1] = x.coords[1];
		}
		else {
			this.coords[0] = x;
			this.coords[1] = y;
		}
	}

	add( dv: [number,number] | Vector2 ) {
		if(dv instanceof Vector2) {
			this.coords[0] += dv.coords[0];
			this.coords[1] += dv.coords[1];
		}
		else {
			this.coords[0] += dv[0];
			this.coords[1] += dv[1];
		}
	}

	sub( dv: [number,number] | Vector2 ) {
		if(dv instanceof Vector2) {
			const dx = this.coords[0] - dv.coords[0];
			const dy = this.coords[1] - dv.coords[1];
			return new Vector2(dx,dy);
		}
		else {
			const dx = this.coords[0] - dv[0];
			const dy = this.coords[1] - dv[1];
			return new Vector2(dx,dy);
		}
	}

	mul(p: number) {
		this.coords[0] *= p;
		this.coords[1] *= p;
		return this;
	}

	div(p: number) {
		this.coords[0] /= p;
		this.coords[1] /= p;
		return this;
	}

	mulImm(p: number) {
		return new Vector2(this.coords[0]*p, this.coords[1]*p);
	}

	divImm(p: number) {
		return new Vector2(this.coords[0]/p, this.coords[1]/p);
	}

	mag() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}

	normalize() {
		const mag = this.mag();
		return this.div(mag);
	}

	normalizeImm() {
		const mag = this.mag();
		return this.divImm(mag);
	}
	
}