"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Behaviour {
    constructor(update, opts) {
        this.name = 'behaviour-' + uuid_1.v4().slice(0, 5);
        this.children = {};
        if (update)
            this.onUpdate(update);
        if (opts) {
            const { name } = opts;
            this.name = name;
        }
    }
    onBirth(fn) {
        this.birth = fn;
    }
    onUpdate(fn) {
        this.update = fn;
    }
    onDeath(fn) {
        this.death = fn;
    }
    chain(behaviour) {
        this.next = behaviour;
    }
    deleteChildren() {
        for (let child in this.children) {
            if (this.children.hasOwnProperty(child))
                delete this.children[child];
        }
    }
    setChildren(...children) {
        this.deleteChildren();
        this.childEnd = undefined;
        children.forEach(child => {
            if (this.childEnd)
                this.childEnd.chain(child);
            else
                this.childFirst = child;
            const { name } = child;
            this.children[name] = child;
            this.childEnd = child;
        });
    }
    addChildren(...children) {
        children.forEach(child => {
            if (this.childEnd)
                this.childEnd.chain(child);
            else
                this.childFirst = child;
            this.childEnd = child;
        });
    }
}
exports.Behaviour = Behaviour;
