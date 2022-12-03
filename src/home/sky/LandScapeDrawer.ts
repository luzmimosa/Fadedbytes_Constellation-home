import {LandscapeController} from "../LandscapeController";
import {ConstellationStar} from "./Constellation";

const STAR_COLOR = "#FFFFFF";
const LINE_COLOR = "#FFFFFF80";

export class LandScapeDrawer {

    private readonly canvas: HTMLCanvasElement = this.landscapeController.canvas;
    private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d")!!;

    private colors = {
        SKY: {
            top: "#002650",
            bottom: "#003b73",
            gradient: undefined as CanvasGradient | undefined
        }
    }

    constructor(
        private readonly landscapeController: LandscapeController
    ) {
        this.calculateGradients()
    }

    // SETUP
    private calculateGradients() {
        // create top to bottom gradient with colors from this.colors.SKY
        this.colors.SKY.gradient = this.context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        this.colors.SKY.gradient.addColorStop(0, this.colors.SKY.top);
        this.colors.SKY.gradient.addColorStop(1, this.colors.SKY.bottom);
    }

    public draw() {
        this.removeBackground();
        this.drawSky();
        this.drawLinks();
        this.drawStars();
    }

    private removeBackground() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawSky() {
        this.context.fillStyle = this.colors.SKY.gradient!!;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawLinks() {
        this.context.strokeStyle = LINE_COLOR;

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

                this.drawLine(x1, y1, x2, y2);
            }
        }
    }

    private drawLine(x1: number, y1: number, x2: number, y2: number) {

        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    private drawStars() {

        this.context.fillStyle = STAR_COLOR;

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

                this.drawStar(star, calculatedPosition.x, calculatedPosition.y);
            }
        }
    }

    private drawStar(star: ConstellationStar, x: number, y: number) {
        this.context.beginPath();
        this.context.arc(x, y, star.size, 0, 2 * Math.PI);
        this.context.fill();
    }
}