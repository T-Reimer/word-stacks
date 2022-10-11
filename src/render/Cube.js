import Konva from "konva";
import { gameLayer, stage } from ".";
import { chars, colours, Columns, GridSize } from "../defaults";
import { clampValue } from "../functions";
import { game } from "../game";
import { toggleSelection } from "./selection";

export class Cube {
    /**
     *
     * @param {string} letter
     * @param {number} points
     */
    constructor(letter, points) {
        this.letter = letter.toUpperCase();
        this.points = points || 0;
        const letterIndex = chars.indexOf(this.letter);

        // setup the Game square
        this.square = new Konva.Rect({
            x: 0,
            y: 0,
            height: GridSize,
            width: GridSize,
            fill: colours[letterIndex],
        });

        this.text = new Konva.Text({
            x: 0,
            y: 0,
            text: this.letter,
            fontSize: 22,
            fontFamily: "Calibri",
            fill: "#000",
            height: GridSize,
            width: GridSize,
            align: "center",
            padding: 4,
        });

        this.pointsText = new Konva.Text({
            x: 0,
            y: GridSize - 17,
            text: this.points,
            fontSize: 12,
            fontFamily: "Calibri",
            fill: "#000",
            width: GridSize,
            align: "right",
            padding: 3,
            hitStrokeWidth: 0,
        });

        // setup the block group for Konva
        this.group = new Konva.Group({
            x: stage.width() / 2,
            y: -GridSize,
            height: GridSize,
            width: GridSize,
            draggable: true,
            dragDistance: 10,
            dragBoundFunc: (pos) => {
                if (this.animation.isRunning()) {
                    this.animation.stop();
                }

                return pos;
            },
        });

        // listen for the drag start of the group
        this.group.on("dragstart", () => {
            this.group.zIndex(this.group.getParent().getChildren().length - 1);

            if (this.animation.isRunning()) {
                this.animation.stop();
            }
        });
        // listen for the drag end of the group
        this.group.on("dragend", () => {
            // get the ideal column
            const col = Math.round(this.group.x() / GridSize);

            if (game.selected.includes(this)) {
                toggleSelection(this);
            }

            // set the column using the clamped value
            this.moveTo(clampValue(col, 0, Columns - 1));
        });

        // listen for click/tap events to highlight the given card
        this.group.on("click tap", () => {
            toggleSelection(this);
        });

        // add the text and square to the group
        this.group.add(this.square);
        this.group.add(this.pointsText);
        this.group.add(this.text);

        /**
         * Setup a konva animation to run
         */
        this.animation = new Konva.Animation((frame) => {
            let completed = true;

            // update the x location
            const x = this.target.x - this.group.x();
            // update the y location
            const y = this.target.y - this.group.y();

            if (Math.abs(y) < 1 && Math.abs(x) < 1) {
                this.group.x(this.target.x);
                this.group.y(this.target.y);
            } else {
                // move the cube towards position
                this.group.x(this.group.x() + x / 15);
                this.group.y(this.group.y() + y / 15);
                completed = false;
            }

            if (completed) {
                this.animation.stop();
            }
        }, gameLayer);

        /**
         * The target location
         */
        this.target = { x: 0, y: 0 };

        /**
         * The column index this cube is in
         */
        this.columnIndex = 0;
    }

    /**
     * Remove the square from game
     */
    remove() {
        this.group.remove();
    }

    /**
     * Add the square to the game
     */
    add() {
        gameLayer.add(this.group);
    }

    moveTo(col) {
        // remove from previous column
        const index = game.columns[this.columnIndex].indexOf(this);
        if (index >= 0) {
            game.columns[this.columnIndex].splice(index, 1);
            game.columns[this.columnIndex].forEach((cube) =>
                cube.updateYTarget()
            );
        }

        // update the current column index
        this.columnIndex = col;
        game.columns[this.columnIndex].push(this);

        // update the target locations
        this.target.x = col * GridSize;
        this.updateYTarget();
    }

    updateYTarget() {
        const index = game.columns[this.columnIndex].indexOf(this);
        this.target.y = stage.height() - GridSize - index * GridSize;

        this.animation.start();
    }
}
