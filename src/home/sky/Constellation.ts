
export class ConstellationManager {
    public constellations = new Map<
        Constellation,
        {
            x: number,
            y: number,
            sizeMultiplier: number
        }>;

    public addConstellation(constellation: Constellation, x: number, y: number, sizeMultiplier: number) {
        this.constellations.set(constellation, {x, y, sizeMultiplier});
    }
}


export class Constellation {

    public readonly width = this.stars.reduce((max, star) => Math.max(max, star.relativePosition.x), 0);
    public readonly height = this.stars.reduce((max, star) => Math.max(max, star.relativePosition.y), 0);

    public readonly lines: ConstellationLine[] = [];

    constructor(
        public readonly name: string,
        public readonly stars: ConstellationStar[],
        public readonly connections: {starIndex: number, otherStarIndex: number}[]
    ) {
        for (let connection of connections) {
            if (connection.starIndex >= stars.length || connection.otherStarIndex >= stars.length) continue;

            let star = stars[connection.starIndex];
            let otherStar = stars[connection.otherStarIndex];

            this.lines.push(new ConstellationLine(star, otherStar));
        }
    }
}

export class ConstellationStar {
    constructor(
        public readonly size: StarSize,
        public readonly relativePosition: {
            x: number,
            y: number
        }

    ) {}
}

export class ConstellationLine {
    constructor(
        public readonly start: ConstellationStar,
        public readonly end: ConstellationStar
    ) {}
}

export enum StarSize {
    Small = 1.4,
    Medium = 2,
    Large = 2.6
}

export const DEFAULT_MANAGER = new ConstellationManager();

export function fromPositionsArray(
    name: string,
    positions: {x: number, y: number}[],
    lines: {starIndex: number, otherStarIndex: number}[],
    sizes: {smalls: number[], larges: number[]},
) {
    let stars: ConstellationStar[] = [];

    for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let size = sizes.smalls.includes(i) ? StarSize.Small : sizes.larges.includes(i) ? StarSize.Large : StarSize.Medium;

        stars.push(new ConstellationStar(size, position));
    }

    return new Constellation(name, stars, lines);

}

const ConstellationData = {
    MORA: {
        stars: [
            {"x":0.32053742802303264,"y":0.30806142034548945},
            {"x":0.45681381957773515,"y":0.31190019193857965},
            {"x":0.46641074856046066,"y":0.24856046065259116},
            {"x":0.45009596928982726,"y":0.1890595009596929},
            {"x":0.4059500959692898,"y":0.14587332053742802},
            {"x":0.5777351247600768,"y":0.0508637236084453},
            {"x":0.7888675623800384,"y":0.025911708253358926},
            {"x":1,"y":0.2600767754318618},
            {"x":0.738003838771593,"y":0.45489443378119004},
            {"x":0.5239923224568138,"y":0.5969289827255279},
            {"x":0.3522072936660269,"y":0.47888675623800386},
            {"x":0.2034548944337812,"y":0.3522072936660269},
            {"x":0.10460652591170826,"y":0.34836852207293667},
            {"x":0.0047984644913627635,"y":0.42610364683301344},
            {"x":0,"y":0.23896353166986564},
            {"x":0.5671785028790787,"y":0.2543186180422265}
        ],
        lines: [
            {starIndex: 0, otherStarIndex: 1},
            {starIndex: 1, otherStarIndex: 2},
            {starIndex: 2, otherStarIndex: 3},
            {starIndex: 3, otherStarIndex: 4},
            {starIndex: 4, otherStarIndex: 5},
            {starIndex: 5, otherStarIndex: 6},
            {starIndex: 6, otherStarIndex: 7},
            {starIndex: 7, otherStarIndex: 8},
            {starIndex: 8, otherStarIndex: 9},
            {starIndex: 9, otherStarIndex: 10},
            {starIndex: 10, otherStarIndex: 0},
            {starIndex: 0, otherStarIndex: 11},
            {starIndex: 11, otherStarIndex: 12},
            {starIndex: 12, otherStarIndex: 13},
            {starIndex: 12, otherStarIndex: 14}
        ],
        sizes: {
            smalls: [
                2,
                3,
                9,
                10,
                11
            ],
            larges: [
                0,
                7,
                15
            ]
        }
    }
}

export const CONSTELLATIONS = {
    MORA: fromPositionsArray(
        "Mora",
        ConstellationData.MORA.stars,
        ConstellationData.MORA.lines,
        ConstellationData.MORA.sizes
    )
}