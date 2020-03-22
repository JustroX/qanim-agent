import { Appearance } from '../../appearance';

export class ImageAppearance extends Appearance{
    constructor() {
        super();
        this.draw = (state, ctx) => {
            const { transform } = state.getAll();
            const { position } = transform;
            const { x, y } = position;
            this.store.sprites.forEach((sprite: HTMLImageElement) => {
                const { width, height } = sprite;
                ctx.drawImage(sprite, Math.floor(x - width / 2), Math.floor(y - height / 2));
            });
        };
        this.store.sprites = [];
    }
    loadImage(url: string, width: number, height: number) {
        const img = new Image(width, height);
        img.src = url;
        this.store.sprites = [img];
    }
    addSprite(url: string, width: number, height: number) {
        const img = new Image(width, height);
        img.src = url;
        this.store.sprites.push(img);
    }
}