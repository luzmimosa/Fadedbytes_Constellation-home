
import React from "react";
import {createRoot} from "react-dom/client";
import {CONSTELLATIONS, DEFAULT_MANAGER} from "./home/sky/Constellation";
import {Landscape} from "./home/Landscape";
import {LandscapeController} from "./home/LandscapeController";

import "./index.css";
import {ImageToConstellation} from "./devtools/ImageToConstellation";

const root = createRoot(document.getElementById("root")!!);
const landscapeController = new LandscapeController(window.innerWidth, window.innerHeight, DEFAULT_MANAGER);

addConstellations();

root.render(
    <Landscape controller={landscapeController} />
    //<ImageToConstellation image={"/constellations/mora.png"} />
)

function addConstellations() {
    // Mora
    DEFAULT_MANAGER.addConstellation(
        CONSTELLATIONS.MORA,
        Math.round(Math.random() * (window.innerWidth - 150)),
        Math.round(Math.random() * (window.innerHeight - 150)),
        150
    );
}