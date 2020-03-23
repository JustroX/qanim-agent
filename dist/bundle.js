(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QanimLibrary = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const behaviour_1 = require("./behaviour");
const appearance_1 = require("./appearance");
const uuid_1 = require("uuid");
class Agent {
    constructor() {
        this.id = uuid_1.v4();
        this.state = new state_1.State();
        this.behaviour = new behaviour_1.Behaviour();
        this.appearance = new appearance_1.Appearance();
    }
}
exports.Agent = Agent;

},{"./appearance":2,"./behaviour":3,"./state":16,"uuid":18}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Appearance {
    constructor() {
        this.store = {};
    }
    onDraw(draw) {
        this.draw = draw;
    }
}
exports.Appearance = Appearance;

},{}],3:[function(require,module,exports){
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

},{"uuid":18}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("../../agent");
const imageAppearance_1 = require("../appearance/imageAppearance");
const boidBehaviour_1 = require("../behaviour/boidBehaviour");
const boids_1 = require("../meta/boids");
class BoidAgent extends agent_1.Agent {
    constructor() {
        super();
        this.behaviour = new boidBehaviour_1.BoidBehaviour();
        this.appearance = new imageAppearance_1.ImageAppearance();
        boids_1.BOIDS.push(this);
    }
    setMotion(newVelocity) {
        const { velocity } = this.state.getAll();
        velocity.set(newVelocity);
    }
}
exports.BoidAgent = BoidAgent;

},{"../../agent":1,"../appearance/imageAppearance":6,"../behaviour/boidBehaviour":7,"../meta/boids":10}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("../../agent");
const imageAppearance_1 = require("../appearance/imageAppearance");
const motionBehaviour_1 = require("../behaviour/motionBehaviour");
class MechanicalAgent extends agent_1.Agent {
    constructor() {
        super();
        this.behaviour = new motionBehaviour_1.MotionBehaviour();
        this.appearance = new imageAppearance_1.ImageAppearance();
    }
    setMotion(newVelocity) {
        const { velocity } = this.state.getAll();
        velocity.set(newVelocity);
    }
}
exports.MechanicalAgent = MechanicalAgent;

},{"../../agent":1,"../appearance/imageAppearance":6,"../behaviour/motionBehaviour":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appearance_1 = require("../../appearance");
class ImageAppearance extends appearance_1.Appearance {
    constructor() {
        super();
        this.draw = (state, ctx) => {
            const { transform } = state.getAll();
            const { position } = transform;
            const { x, y } = position;
            this.store.sprites.forEach((sprite) => {
                const { width, height } = sprite;
                ctx.drawImage(sprite, Math.floor(x - width / 2), Math.floor(y - height / 2));
            });
        };
        this.store.sprites = [];
    }
    loadImage(url, width, height) {
        const img = new Image(width, height);
        img.src = url;
        this.store.sprites = [img];
    }
    addSprite(url, width, height) {
        const img = new Image(width, height);
        img.src = url;
        this.store.sprites.push(img);
    }
}
exports.ImageAppearance = ImageAppearance;

},{"../../appearance":2}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const motionBehaviour_1 = require("./motionBehaviour");
const behaviour_1 = require("../../behaviour");
const vector_1 = require("../../lib/vector");
const boids_1 = require("../meta/boids");
const wrapBehaviour_1 = require("./wrapBehaviour");
class CohesionBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            const { position } = state.getTransform();
            const velocity = state.get('velocity');
            const target = this.targetPosition(position, velocity);
            const dx = target.sub(position);
            const distance = dx.mag();
            const speed = Math.min(distance, 100);
            if (distance > 0) {
                dx.normalize().mul(speed);
                state.get('velocity').add(dx);
            }
        });
    }
    isInFront(myPosition, myDirection, position) {
        const dx = myPosition.sub(position);
        const heading = dx.normalize();
        if (myDirection.magRel() == 0)
            return true;
        const directon = myDirection.normalizeImm();
        const delta = directon.sub(heading);
        return delta.x >= 0;
    }
    targetPosition(myPosition, myVelocity) {
        const distance = boids_1.VISION_RADIUS * boids_1.VISION_RADIUS;
        const nearMe = boids_1.BOIDS.filter(boid => {
            const { position } = boid.state.getTransform();
            if (position == myPosition)
                return false;
            const dx = myPosition.sub(position);
            return dx.magRel() <= distance && this.isInFront(myPosition, myVelocity, position);
        });
        const v = new vector_1.Vector2(0, 0);
        nearMe.forEach(boid => {
            const { position } = boid.state.getTransform();
            v.add(position);
        });
        if (nearMe.length)
            return v.div(nearMe.length);
        return myPosition;
    }
}
class AlignmentBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            const { position } = state.getTransform();
            const velocity = state.get('velocity');
            const dx = this.flockSpeed(position, velocity);
            const distance = dx.mag();
            const speed = Math.min(distance, 30);
            if (distance > 0) {
                state.get('velocity').add(dx.normalize().mul(2 * speed));
            }
        });
    }
    isInFront(myPosition, myDirection, position) {
        const dx = myPosition.sub(position);
        const heading = dx.normalize();
        if (myDirection.magRel() == 0)
            return true;
        const directon = myDirection.normalizeImm();
        const delta = directon.sub(heading);
        return delta.x >= 0;
    }
    flockSpeed(myPosition, myVelocity) {
        const distance = boids_1.VISION_RADIUS * boids_1.VISION_RADIUS;
        const nearMe = boids_1.BOIDS.filter(boid => {
            const { position } = boid.state.getTransform();
            if (position == myPosition)
                return false;
            const dx = myPosition.sub(position);
            return dx.magRel() <= distance && this.isInFront(myPosition, myVelocity, position);
        });
        const v = new vector_1.Vector2(0, 0);
        nearMe.forEach(boid => {
            const velocity = boid.state.get('velocity');
            v.add(velocity);
        });
        if (nearMe.length)
            return v.div(nearMe.length);
        return v;
    }
}
class AvoidanceBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            const { position } = state.getTransform();
            const dx = this.separationForce(position);
            const distance = dx.mag();
            const speed = Math.min(10 * distance, 30);
            if (distance > 0) {
                dx.normalize().mul(-2 * speed);
                state.get('velocity').add(dx);
            }
        });
    }
    separationForce(myPosition) {
        const distance = 30 * 30;
        const nearMe = boids_1.BOIDS.filter(boid => {
            const { position } = boid.state.getTransform();
            if (position == myPosition)
                return false;
            const dx = myPosition.sub(position);
            return dx.magRel() <= distance;
        });
        const v = new vector_1.Vector2(0, 0);
        nearMe.forEach(boid => {
            const { position } = boid.state.getTransform();
            v.add(position.sub(myPosition));
        });
        if (nearMe.length)
            return v.div(nearMe.length);
        return v;
    }
}
class BoidBehaviour extends motionBehaviour_1.MotionBehaviour {
    constructor() {
        super();
        let prev = new vector_1.Vector2(0, 0);
        this.addChildren(new behaviour_1.Behaviour((state, dt) => {
            const velocity = state.get('velocity');
            prev.set(velocity);
            velocity.set(0, 0);
        }), new CohesionBehaviour(), new AvoidanceBehaviour(), new AlignmentBehaviour(), new behaviour_1.Behaviour((state, dt) => {
            const velocity = state.get('velocity');
            const acceleration = state.get('acceleration');
            const speed = Math.min(velocity.mag(), 100);
            if (speed != 0)
                acceleration.set(velocity.normalizeImm().mul(50 * speed));
            const v = Math.min(prev.mag(), 80);
            prev.normalize().mul(v);
            velocity.set(prev);
            // if(speed!=0) {
            // 	prev.add(velocity);
            // 	prev.normalize();
            // 	prev.mul(10*speed);
            // }
        }), new wrapBehaviour_1.WrapBehaviour());
    }
}
exports.BoidBehaviour = BoidBehaviour;

},{"../../behaviour":3,"../../lib/vector":14,"../meta/boids":10,"./motionBehaviour":8,"./wrapBehaviour":9}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const behaviour_1 = require("../../behaviour");
const vector_1 = require("../../lib/vector");
class MotionBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onBirth((state) => {
            const { acceleration, velocity } = state.getAll();
            if (!acceleration)
                state.set('acceleration', new vector_1.Vector2(0, 0));
            if (!velocity)
                state.set('velocity', new vector_1.Vector2(0, 0));
        });
        this.onUpdate((state, dt) => {
            if (!dt)
                return;
            let child = this.childFirst;
            while (child) {
                if (child.update)
                    child.update(state, dt);
                child = child.next;
            }
            const { acceleration, velocity, transform } = state.getAll();
            const { position } = transform;
            position.add(velocity.mulImm(dt));
            velocity.add(acceleration.mulImm(dt));
        });
    }
}
exports.MotionBehaviour = MotionBehaviour;

},{"../../behaviour":3,"../../lib/vector":14}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const behaviour_1 = require("../../behaviour");
class WrapBehaviour extends behaviour_1.Behaviour {
    constructor() {
        super();
        this.onUpdate((state, dt) => {
            if (!dt)
                return;
            let child = this.childFirst;
            while (child) {
                if (child.update)
                    child.update(state, dt);
                child = child.next;
            }
            const { acceleration, velocity, transform } = state.getAll();
            const { position } = transform;
            position.x = (position.x + WIDTH) % WIDTH;
            position.y = (position.y + HEIGHT) % HEIGHT;
        });
    }
}
exports.WrapBehaviour = WrapBehaviour;

},{"../../behaviour":3}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOIDS = [];
exports.VISION_RADIUS = 100;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var qanim_1 = require("./qanim");
exports.Qanim = qanim_1.Qanim;
var agent_1 = require("./agent");
exports.Agent = agent_1.Agent;
var appearance_1 = require("./appearance");
exports.Appearance = appearance_1.Appearance;
var behaviour_1 = require("./behaviour");
exports.Behaviour = behaviour_1.Behaviour;
var state_1 = require("./state");
exports.State = state_1.State;
var imageAppearance_1 = require("./class/appearance/imageAppearance");
exports.ImageAppearance = imageAppearance_1.ImageAppearance;
var motionBehaviour_1 = require("./class/behaviour/motionBehaviour");
exports.MotionBehaviour = motionBehaviour_1.MotionBehaviour;
var mechanicalAgent_1 = require("./class/agent/mechanicalAgent");
exports.MechanicalAgent = mechanicalAgent_1.MechanicalAgent;
var boidAgent_1 = require("./class/agent/boidAgent");
exports.BoidAgent = boidAgent_1.BoidAgent;
var matrix_1 = require("./lib/matrix");
exports.Matrix = matrix_1.Matrix;
var transform_1 = require("./lib/transform");
exports.Transform = transform_1.Transform;
var vector_1 = require("./lib/vector");
exports.Vector2 = vector_1.Vector2;

},{"./agent":1,"./appearance":2,"./behaviour":3,"./class/agent/boidAgent":4,"./class/agent/mechanicalAgent":5,"./class/appearance/imageAppearance":6,"./class/behaviour/motionBehaviour":8,"./lib/matrix":12,"./lib/transform":13,"./lib/vector":14,"./qanim":15,"./state":16}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
class Transform {
    constructor() {
        this.position = new vector_1.Vector2(0, 0);
    }
}
exports.Transform = Transform;

},{"./vector":14}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./behaviour":3,"./state":16}],16:[function(require,module,exports){
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

},{"./lib/transform":13}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

  return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
}

var _default = bytesToUuid;
exports.default = _default;
module.exports = exports.default;
},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "v1", {
  enumerable: true,
  get: function () {
    return _v.default;
  }
});
Object.defineProperty(exports, "v3", {
  enumerable: true,
  get: function () {
    return _v2.default;
  }
});
Object.defineProperty(exports, "v4", {
  enumerable: true,
  get: function () {
    return _v3.default;
  }
});
Object.defineProperty(exports, "v5", {
  enumerable: true,
  get: function () {
    return _v4.default;
  }
});

var _v = _interopRequireDefault(require("./v1.js"));

var _v2 = _interopRequireDefault(require("./v3.js"));

var _v3 = _interopRequireDefault(require("./v4.js"));

var _v4 = _interopRequireDefault(require("./v5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./v1.js":22,"./v3.js":23,"./v4.js":25,"./v5.js":26}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes == 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Array(msg.length);

    for (var i = 0; i < msg.length; i++) bytes[i] = msg.charCodeAt(i);
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  var i;
  var x;
  var output = [];
  var length32 = input.length * 32;
  var hexTab = '0123456789abcdef';
  var hex;

  for (i = 0; i < length32; i += 8) {
    x = input[i >> 5] >>> i % 32 & 0xff;
    hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  var i;
  var olda;
  var oldb;
  var oldc;
  var oldd;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  var i;
  var output = [];
  output[(input.length >> 2) - 1] = undefined;

  for (i = 0; i < output.length; i += 1) {
    output[i] = 0;
  }

  var length8 = input.length * 8;

  for (i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

var _default = md5;
exports.default = _default;
module.exports = exports.default;
},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rng;
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

function rng() {
  if (!getRandomValues) {
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  }

  return getRandomValues(rnds8);
}

module.exports = exports.default;
},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes == 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Array(msg.length);

    for (var i = 0; i < msg.length; i++) bytes[i] = msg.charCodeAt(i);
  }

  bytes.push(0x80);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);

  for (var i = 0; i < N; i++) {
    M[i] = new Array(16);

    for (var j = 0; j < 16; j++) {
      M[i][j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (var i = 0; i < N; i++) {
    var W = new Array(80);

    for (var t = 0; t < 16; t++) W[t] = M[i][t];

    for (var t = 16; t < 80; t++) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }

    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];

    for (var t = 0; t < 80; t++) {
      var s = Math.floor(t / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

var _default = sha1;
exports.default = _default;
module.exports = exports.default;
},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
var _nodeId;

var _clockseq; // Previous uuid creation time


var _lastMSecs = 0;
var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];
  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    var seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : (0, _bytesToUuid.default)(b);
}

var _default = v1;
exports.default = _default;
module.exports = exports.default;
},{"./bytesToUuid.js":17,"./rng.js":20}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _md = _interopRequireDefault(require("./md5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports.default = _default;
module.exports = exports.default;
},{"./md5.js":19,"./v35.js":24}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.URL = exports.DNS = void 0;

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function uuidToBytes(uuid) {
  // Note: We assume we're being passed a valid uuid string
  var bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, function (hex) {
    bytes.push(parseInt(hex, 16));
  });
  return bytes;
}

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  var bytes = new Array(str.length);

  for (var i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  var generateUUID = function (value, namespace, buf, offset) {
    var off = buf && offset || 0;
    if (typeof value == 'string') value = stringToBytes(value);
    if (typeof namespace == 'string') namespace = uuidToBytes(namespace);
    if (!Array.isArray(value)) throw TypeError('value must be an array of bytes');
    if (!Array.isArray(namespace) || namespace.length !== 16) throw TypeError('namespace must be uuid string or an Array of 16 byte values'); // Per 4.3

    var bytes = hashfunc(namespace.concat(value));
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      for (var idx = 0; idx < 16; ++idx) {
        buf[off + idx] = bytes[idx];
      }
    }

    return buf || (0, _bytesToUuid.default)(bytes);
  }; // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name;
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
},{"./bytesToUuid.js":17}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof options == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }

  options = options || {};

  var rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || (0, _bytesToUuid.default)(rnds);
}

var _default = v4;
exports.default = _default;
module.exports = exports.default;
},{"./bytesToUuid.js":17,"./rng.js":20}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _sha = _interopRequireDefault(require("./sha1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports.default = _default;
module.exports = exports.default;
},{"./sha1.js":21,"./v35.js":24}]},{},[11])(11)
});
