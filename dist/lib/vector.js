"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Vector2 {
    constructor(x, y) {
        this.coords = [0, 0];
        this.coords[0] = x;
        this.coords[1] = y;
    }
    get x() {
        return this.coords[0];
    }
    get y() {
        return this.coords[1];
    }
    set x(val) {
        this.coords[0] = val;
    }
    set y(val) {
        this.coords[1] = val;
    }
    set(x, y) {
        if (x instanceof Vector2) {
            this.coords[0] = x.coords[0];
            this.coords[1] = x.coords[1];
        }
        else {
            if (y === undefined)
                throw new Error('Missing Parameter');
            this.coords[0] = x;
            this.coords[1] = y;
        }
    }
    add(dv) {
        if (dv instanceof Vector2) {
            this.coords[0] += dv.coords[0];
            this.coords[1] += dv.coords[1];
        }
        else {
            this.coords[0] += dv[0];
            this.coords[1] += dv[1];
        }
    }
    sub(dv) {
        if (dv instanceof Vector2) {
            const dx = this.coords[0] - dv.coords[0];
            const dy = this.coords[1] - dv.coords[1];
            return new Vector2(dx, dy);
        }
        else {
            const dx = this.coords[0] - dv[0];
            const dy = this.coords[1] - dv[1];
            return new Vector2(dx, dy);
        }
    }
    mul(p) {
        this.coords[0] *= p;
        this.coords[1] *= p;
        return this;
    }
    div(p) {
        if (p == 0)
            throw new Error('Can not divide vector by 0.');
        this.coords[0] /= p;
        this.coords[1] /= p;
        return this;
    }
    mulImm(p) {
        return new Vector2(this.coords[0] * p, this.coords[1] * p);
    }
    divImm(p) {
        if (p == 0)
            throw new Error('Can not divide vector by 0.');
        return new Vector2(this.coords[0] / p, this.coords[1] / p);
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    magRel() {
        return this.x * this.x + this.y * this.y;
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
exports.Vector2 = Vector2;
