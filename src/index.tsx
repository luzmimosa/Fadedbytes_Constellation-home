
import React from "react";
import {createRoot} from "react-dom/client";
import {Constellation, CONSTELLATIONS, ConstellationStar, DEFAULT_MANAGER, StarSize} from "./home/sky/Constellation";
import {Landscape} from "./home/Landscape";
import {LandscapeController} from "./home/LandscapeController";

import "./index.css";
import {ImageToConstellation} from "./devtools/ImageToConstellation";

const root = createRoot(document.getElementById("root")!!);

// testConstellation
DEFAULT_MANAGER.addConstellation(
    new Constellation(
        "Constelación de las cuatro puntas",
        [
            new ConstellationStar(StarSize.Large, {x: 0, y: 0}),
            new ConstellationStar(StarSize.Medium, {x: 0, y: 100}),
            new ConstellationStar(StarSize.Medium, {x: 100, y: 0}),
            new ConstellationStar(StarSize.Medium, {x: 100, y: 100})
        ],
        [
            {starIndex: 0, otherStarIndex: 1},
            {starIndex: 1, otherStarIndex: 2},
            {starIndex: 2, otherStarIndex: 3}
        ]
    ),
    150,
    150,
    1
);

DEFAULT_MANAGER.addConstellation(CONSTELLATIONS.MORA, 500, 300, 400)

const landscapeController = new LandscapeController(window.innerWidth, window.innerHeight, DEFAULT_MANAGER);


root.render(
    <Landscape controller={landscapeController} />
    //<ImageToConstellation image={"/constellations/mora.png"} />
)