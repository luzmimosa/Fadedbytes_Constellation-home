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
const LINE_COLOR = () => "#ffffff09";
const PULSE_COLOR = "#ffffff33";

export class LandScapeDrawer {

    private static DEBUG = {
        activated: true,

        drawer: {
            totalFrames: 0,
            framesLastSecond: 0,
            framesUntilLastSecond: 0
        }
    }

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

        if (LandScapeDrawer.DEBUG.activated) {
            setInterval(() => {
                LandScapeDrawer.DEBUG.drawer.framesLastSecond = LandScapeDrawer.DEBUG.drawer.totalFrames - LandScapeDrawer.DEBUG.drawer.framesUntilLastSecond;
                LandScapeDrawer.DEBUG.drawer.framesUntilLastSecond = LandScapeDrawer.DEBUG.drawer.totalFrames;
            }, 1000);
        }
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

        if (LandScapeDrawer.DEBUG.activated) LandScapeDrawer.DEBUG.drawer.totalFrames++;

        this.removeBackground();
        this.drawSky(seed);
        this.drawLinks(seed);
        this.drawStars(seed);

        this.drawDebug()
    }

    private drawDebug() {

        if (!LandScapeDrawer.DEBUG.activated) return;
        this.context.fillStyle = "#FFFFFF";
        this.context.font = "10px Arial";
        this.context.fillText("FPS: " + LandScapeDrawer.DEBUG.drawer.framesLastSecond, 10, 10);
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
                this.drawSmallStar(backgroundStar.x, backgroundStar.y, false, BACKGROUND_STAR_COLOR());
            } else {
                this.drawLargeStar(backgroundStar.x, backgroundStar.y, false, seed, BACKGROUND_STAR_COLOR());
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

            for (let i = 0; i < constellation.lines.length; i++) {

                let line = constellation.lines[i];
                let x1 = originPosition.x + (line.start.relativePosition.x * sizeMultiplier);
                let y1 = originPosition.y + (line.start.relativePosition.y * sizeMultiplier);
                let x2 = originPosition.x + (line.end.relativePosition.x * sizeMultiplier);
                let y2 = originPosition.y + (line.end.relativePosition.y * sizeMultiplier);



                this.drawLine(
                    x1, y1,
                    x2, y2,
                    Math.abs(Math.sin((seed * i) / 256)),
                );
            }
        }
    }

    private drawLine(x1: number, y1: number, x2: number, y2: number, pulseLocation: number = 0.5) {

        this.context.beginPath();
        let gradient = this.context.createLinearGradient(x1 / 2, y1 / 2, x2 * 2, y2 * 2);

        gradient.addColorStop(0, LINE_COLOR());
        gradient.addColorStop(1, LINE_COLOR());

        if (pulseLocation >= 0 && pulseLocation <= 1) {
            gradient.addColorStop(pulseLocation, PULSE_COLOR);
        }

        this.context.strokeStyle = gradient;
        this.context.lineWidth = 1;
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);

        this.context.stroke();

        this.context.closePath();

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

    private drawStar(star: ConstellationStar, x: number, y: number, seed: number, bright: boolean = false, color: string = STAR_COLOR()) {
        switch (star.size) {
            case StarSize.Small:
                this.drawSmallStar(x, y, bright, color);
                break;
            case StarSize.Medium:
                this.drawMediumStar(x, y, bright, seed, color);
                break;
            case StarSize.Large:
                this.drawLargeStar(x, y, bright, seed, color);
                break;
        }
    }

    private drawSmallStar(x: number, y: number, bright: boolean = false, color: string = STAR_COLOR()) {
        this.context.beginPath();
        this.context.fillStyle = color;

        this.context.shadowColor = color;
        this.context.shadowBlur = 2;

        this.context.fillRect(x, y, 0.8 * 2, 0.8 * 2);
        this.context.fill();

        this.context.shadowBlur = 0;
        this.context.closePath();
    }

    private drawMediumStar(x: number, y: number, bright: boolean = false, seed: number, color: string = STAR_COLOR()) {
        this.context.beginPath();
        this.context.fillStyle = color;

        if (bright) {
            this.context.shadowColor = color;
            this.context.shadowBlur = 10;
        }

        this.context.arc(x, y, 1.5, 0, 2 * Math.PI);
        this.context.fill();

        this.context.shadowBlur = 0;
        this.context.closePath();
    }

    private drawLargeStar(x: number, y: number, bright: boolean = false, seed: number, color: string = STAR_COLOR()) {
        this.context.beginPath();
        this.context.fillStyle = color;

        if (bright) {
            this.context.shadowColor = color;
            this.context.shadowBlur = 20;
        }

        this.context.arc(x, y, 2.5, 0, 2 * Math.PI);
        this.context.fill();

        this.context.closePath();
    }
}