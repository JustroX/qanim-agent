"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Matrix {
    constructor(...args) {
        this.value = [];
        for (let row of args)
            this.value.push(row);
    }
}
exports.Matrix = Matrix;
