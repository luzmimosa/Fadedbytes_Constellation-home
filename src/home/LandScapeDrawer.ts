import {LandscapeController} from "./LandscapeController";
import {ConstellationStar, StarSize} from "./sky/Constellation";

const STAR_COLORS = [
    "#ffffff",
    "#f0f0f0",
    "#e0e0e0"
];
const STAR_COLOR = () => {
    return STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
};
const BACKGROUND_STAR_COLORS = [
    "#FFFFFFAA",
    "#FFFFFF99",
    "#FFFFFF88",
    "#FFFFFF77",
]
const BACKGROUND_STAR_COLOR = () => {
    return BACKGROUND_STAR_COLORS[Math.floor(Math.random() * BACKGROUND_STAR_COLORS.length)];
};
const LINE_COLOR = "#52a2ff";

export class LandScapeDrawer {

    private readonly starDensity: number = 0.005;
    private backgroundStars: Array<{x: number, y: number, size: StarSize}> = [];

    private readonly canvas: HTMLCanvasElement = this.landscapeController.canvas;
    private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d")!!;

    private colors = {
        SKY: {
            top: "#000000",
            bottom: "#001b33",
            gradient: undefined as CanvasGradient | undefined
        }
    }

    constructor(
        private readonly landscapeController: LandscapeController
    ) {
        this.calculateGradients()
        this.calculateBackgroundStars()
    }

    // SETUP
    public calculateGradients() {
        // create top to bottom gradient with colors from this.colors.SKY
        this.colors.SKY.gradient = this.context.createLinearGradient(this.landscapeController.width / 2, 0, this.landscapeController.width / 2, this.canvas.height);
        this.colors.SKY.gradient.addColorStop(0, this.colors.SKY.top);
        this.colors.SKY.gradient.addColorStop(1, this.colors.SKY.bottom);
    }

    public calculateBackgroundStars() {

        this.backgroundStars = [];
        for (let x = 0; x < this.landscapeController.width; x+= 4) {
            for (let y = 0; y < this.landscapeController.height; y+= 4) {
                if (Math.abs(LandScapeDrawer.coordinateHash(x, y) / 0xffffffff) < this.starDensity) {
                    this.backgroundStars.push({
                            x: x,
                            y: y,
                            size: Math.random() < 1 ? StarSize.Small : StarSize.Medium
                        }
                    )
                }
            }
        }
    }


    // DRAW

    public draw(seed: number) {
        this.removeBackground();
        this.drawSky(seed);
        this.drawLinks(seed);
        this.drawStars(seed);
    }

    private removeBackground() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawSky(seed: number) {

        this.context.fillStyle = this.colors.SKY.gradient!!;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //return;

        for (let backgroundStar of this.backgroundStars) {
            if (backgroundStar.size === StarSize.Small) {
                this.drawSmallStar(backgroundStar.x, backgroundStar.y, BACKGROUND_STAR_COLOR());
            } else {
                this.drawLargeStar(backgroundStar.x, backgroundStar.y, seed, BACKGROUND_STAR_COLOR());
            }
        }
    }

    private static coordinateHash(x: number, y: number) {
        let c1 = 0xcc9e2d51;
        let c2 = 0x1b873593;

        let n = x;
        n = Math.imul(n, c1);
        n = Math.imul(n << 15 | n >>> -15, c2);
        n = Math.imul(n << 13 | n >>> -13, 5);

        n = (n + y) | 0;
        n = Math.imul(n ^ n >>> 16, 0x85ebca6b);
        n = Math.imul(n ^ n >>> 13, 0xc2b2ae35);
        return n ^ n >>> 16;
    }

    private drawLinks(seed: number) {

        let constellations = this.landscapeController.constellationManager.constellations;

        for (let constellation of constellations.keys()) {
            let info = constellations.get(constellation)!!;
            let originPosition = {
                x: info.x,
                y: info.y
            };
            let sizeMultiplier = info.sizeMultiplier

            for (let line of constellation.lines) {
                let x1 = originPosition.x + (line.start.relativePosition.x * sizeMultiplier);
                let y1 = originPosition.y + (line.start.relativePosition.y * sizeMultiplier);
                let x2 = originPosition.x + (line.end.relativePosition.x * sizeMultiplier);
                let y2 = originPosition.y + (line.end.relativePosition.y * sizeMultiplier);

                let lineSeed = seed
                    + line.start.relativePosition.x * 700
                    + line.start.relativePosition.y * 700
                    + line.end.relativePosition.x * 700
                    + line.end.relativePosition.y * 700;

                //use Math.sin to get a value between 0 and 255
                let originOpacity = Math.floor((Math.sin((lineSeed * 2) / 4) + 1) / 2 * 128) - (seed % 4);
                let endOpacity = Math.floor((Math.sin((lineSeed) / 4) + 1) / 2 * 128) - (seed % 4);

                this.drawLine(x1, y1, x2, y2, originOpacity, endOpacity);
            }
        }
    }

    private drawLine(x1: number, y1: number, x2: number, y2: number, originOpacity: number = 255, endOpacity: number = 255) {

        if (originOpacity > 255) originOpacity = 255;
        if (originOpacity < 0) originOpacity = 0;
        if (endOpacity > 255) endOpacity = 255;
        if (endOpacity < 0) endOpacity = 0;

        this.context.beginPath();

        let originHexOpacity = originOpacity.toString(16)
        let endHexOpacity = endOpacity.toString(16)
        if (originHexOpacity.length == 1) {
            originHexOpacity = "0" + originHexOpacity;
        }
        if (endHexOpacity.length == 1) {
            endHexOpacity = "0" + endHexOpacity;
        }

        // set line color to gradient from x1,y1 to x2,y2 with opacity
        let gradient = this.context.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, LINE_COLOR + originHexOpacity);
        gradient.addColorStop(1, LINE_COLOR + endHexOpacity);
        this.context.strokeStyle = gradient;

        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    private drawStars(seed: number) {

        let constellations = this.landscapeController.constellationManager.constellations;
        for (let constellation of constellations.keys()) {
            let info = constellations.get(constellation)!!;
            let originPosition = {
                x: info.x,
                y: info.y
            };
            let sizeMultiplier = info.sizeMultiplier

            for (let star of constellation.stars) {
                let calculatedPosition = {
                    x: originPosition.x + (star.relativePosition.x * sizeMultiplier),
                    y: originPosition.y + (star.relativePosition.y * sizeMultiplier)
                }

                this.drawStar(star, calculatedPosition.x, calculatedPosition.y, seed + (star.relativePosition.x * 1000) + (star.relativePosition.y * 1000));
            }
        }
    }

    private drawStar(star: ConstellationStar, x: number, y: number, seed: number, color: string = STAR_COLOR()) {
        switch (star.size) {
            case StarSize.Small:
                this.drawSmallStar(x, y, color);
                break;
            case StarSize.Medium:
                this.drawMediumStar(x, y, seed, color);
                break;
            case StarSize.Large:
                this.drawLargeStar(x, y, seed, color);
                break;
        }
    }

    private drawSmallStar(x: number, y: number, color: string = STAR_COLOR()) {
        this.context.beginPath();
        this.context.fillStyle = color;

        this.context.shadowColor = color;
        this.context.shadowBlur = 2;

        this.context.arc(x, y, 0.8, 0, 2 * Math.PI);
        this.context.fill();

        this.context.shadowBlur = 0;
        this.context.closePath();
    }

    private drawMediumStar(x: number, y: number, seed: number, color: string = STAR_COLOR()) {
        this.context.beginPath();
        this.context.fillStyle = color;

        this.context.shadowColor = color;
        this.context.shadowBlur = 10;

        this.context.arc(x, y, 1.5, 0, 2 * Math.PI);
        this.context.fill();

        this.context.shadowBlur = 0;
        this.context.closePath();
    }

    private drawLargeStar(x: number, y: number, seed: number, color: string = STAR_COLOR()) {
        this.context.beginPath();
        this.context.fillStyle = color;

        this.context.shadowColor = color;
        this.context.shadowBlur = 20;

        this.context.arc(x, y, 2.5, 0, 2 * Math.PI);
        this.context.fill();

        this.context.closePath();
    }
}