import {ConstellationManager} from "./sky/Constellation";
import {LandScapeDrawer} from "./sky/LandScapeDrawer";

export class LandscapeController {

    private _canvas: HTMLCanvasElement | undefined;
    private drawer: LandScapeDrawer | undefined;

    set canvas(canvas: HTMLCanvasElement) {
        if (this._canvas) throw new Error("Canvas already set");
        this._canvas = canvas;

        this.init();
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas!!;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    constructor(
        private _width: number = window.innerWidth,
        private _height: number = window.innerHeight,

        public constellationManager: ConstellationManager,
    ) {
        this.addListeners();
    }

    // SETUP
    private addListeners() {
        // resize listener
        window.addEventListener("resize", () => {
            this._width = window.innerWidth;
            this._height = window.innerHeight;
            this.handleResize();
        });

        setInterval(() => this.tick(), 1000 / 165);
    }

    private init() {
        this.handleResize();

        this.drawer = new LandScapeDrawer(this);
    }

    // TICK
    private tick() {
        this.drawer?.draw()
    }


    // HANDLERS
    private handleResize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
}