export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawText(text, x, y, color = '#FFF', size = 8, align = 'center') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px monospace`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
    }

    drawTextWithShadow(text, x, y, color = '#FFF', shadowColor = '#000', size = 8, align = 'center') {
        this.ctx.font = `bold ${size}px monospace`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = shadowColor;
        this.ctx.fillText(text, x + 1, y + 1);
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }

    drawRectOutline(x, y, w, h, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(Math.round(x), Math.round(y), w, h);
    }
}
