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
