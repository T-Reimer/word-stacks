import Konva from "konva";
import { Columns, GridSize, Width } from "../defaults";
import { selectionLayer } from "./selection";

// setup the canvas size
const height = window.innerHeight;

// setup the konva stage
export const stage = new Konva.Stage({
    container: "canvas",
    width: Width,
    height: height,
});

// setup the visual columns
export const gridLayer = new Konva.Layer();
stage.add(gridLayer);

// render the grid
for (let i = 0; i < Columns + 1; i++) {
    const x = i * GridSize;

    const line = new Konva.Line({
        points: [x, 0, x, stage.height()],
        stroke: "#555",
        strokeWidth: 1.5,
        opacity: 0.25,
    });
    gridLayer.add(line);
}

// setup the game layer
export const gameLayer = new Konva.Layer();
stage.add(gameLayer);

// add the selection layer
stage.add(selectionLayer);
