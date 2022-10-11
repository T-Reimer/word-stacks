import Konva from "konva";
import { GridSize, SelectionStroke, Width } from "../defaults";
import { isValidWord } from "../findWords";
import { game } from "../game";
import { Cube } from "./Cube";

export const selectionLayer = new Konva.Layer();

const wordGroup = new Konva.Group({
    x: Width / 2 - GridSize * 2.5,
    y: GridSize / 2,
});
selectionLayer.add(wordGroup);

const validWordOptions = {
    fill: "#6b6",
    stroke: "#2f2",
};
const inValidWordOptions = {
    fill: "#b66",
    stroke: "#f22",
};

const wordBackground = new Konva.Rect({
    x: 0,
    y: 0,
    height: GridSize / 2,
    width: GridSize * 5,
    ...inValidWordOptions,
    strokeWidth: 1,
    shadowColor: "#ddd",
    shadowEnabled: true,
});
wordGroup.add(wordBackground);

const selectedWord = new Konva.Text({
    x: 0,
    y: 0,
    padding: 4,
    width: wordBackground.width(),
    text: "",
    fontSize: 16,
    align: "center",
});
wordGroup.add(selectedWord);

// create the selection rectangle
const rect = new Konva.Rect({
    x: Width / 2,
    y: 0,
    height: 0,
    width: 0,
    opacity: 0,
    stroke: "#fff",
    strokeWidth: SelectionStroke,
    listening: false,
});
selectionLayer.add(rect);

const animation = new Konva.Animation(() => {
    let completed = true;

    // update the target opacity
    const opacity = target.opacity - rect.opacity();
    if (Math.abs(opacity) < 0.01) {
        rect.opacity(target.opacity);
    } else {
        rect.opacity(rect.opacity() + opacity / 10);
        completed = false;
    }

    // update the x location
    const x = target.x - rect.x();
    // update the y location
    const y = target.y - rect.y();

    if (Math.abs(y) < 1 && Math.abs(x) < 1) {
        rect.x(target.x);
        rect.y(target.y);
    } else {
        // move the cube towards position
        rect.x(rect.x() + x / 15);
        rect.y(rect.y() + y / 15);
        completed = false;
    }

    // update the height
    const height = target.height - rect.height();
    // update the width
    const width = target.width - rect.width();

    if (Math.abs(height) < 1 && Math.abs(width) < 1) {
        rect.height(target.height);
        rect.width(target.width);
    } else {
        rect.height(rect.height() + height / 15);
        rect.width(rect.width() + width / 15);
        completed = false;
    }

    if (completed) {
        animation.stop();
    }
}, selectionLayer);

const target = {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    opacity: 0,
};

/**
 * @type {Cube[]}
 */
const removeCubes = [];
const removeAnimation = new Konva.Animation(() => {
    let completed = true;
    const targetOpacity = 0;

    // update the target opacity
    for (const cube of removeCubes) {
        if (cube.group.opacity() === targetOpacity) {
            cube.remove();

            cube.group.destroyChildren();
            cube.group.destroy();
        } else {
            completed = false;

            const opacity = targetOpacity - cube.group.opacity();

            if (Math.abs(opacity) < 0.01) {
                cube.group.opacity(targetOpacity);
            } else {
                cube.group.opacity(cube.group.opacity() + opacity / 10);
            }
        }
    }

    if (completed) {
        removeAnimation.stop();
    }
}, selectionLayer);

// setup the click listener for the valid word clicked
wordGroup.on("click tap", () => {
    if (wordBackground.fill() === validWordOptions.fill) {
        const selected = game.selected.slice();
        removeCubes.push(...selected);

        // clear the game selection
        game.selected = [];
        target.opacity = 0;
        selectedWord.text("");

        wordBackground.fill(inValidWordOptions.fill);
        wordBackground.stroke(inValidWordOptions.stroke);

        animation.start();

        // remove the selected characters from the list
        for (const cube of selected) {
            // remove the cube from the list
            const index = game.columns[cube.columnIndex].indexOf(cube);
            game.columns[cube.columnIndex].splice(index, 1);
        }

        removeAnimation.start();
    }
});

/**
 * Toggles the selection value of the given cube
 *
 * @param {Cube} cube
 */
export function toggleSelection(cube) {
    const index = game.selected.indexOf(cube);
    if (index >= 0) {
        game.selected.splice(index, 1);
    } else {
        game.selected.push(cube);
    }

    // validate that all the selected values are valid in a row
    if (game.selected.length > 0) {
        // check if the selection is full vertical
        const isVertical = (() => {
            for (const selection of game.selected) {
                if (selection.columnIndex !== cube.columnIndex) {
                    return false;
                }
            }
            return true;
        })();

        // check if the selection is full horizontal
        const isHorizontal = (() => {
            let match = [];
            for (const selection of game.selected) {
                if (match.includes(selection.columnIndex)) {
                    return false;
                }
                match.push(selection.columnIndex);
            }

            return true;
        })();

        let wordValue = "";
        if (isHorizontal && isVertical) {
            // should be only one value in the list which is valid.
            // no additional checks needed
            wordValue = cube.letter;
        } else if (isHorizontal) {
            // check that there aren't any gaps
            let match = game.selected.map((cube) => cube.columnIndex);
            const verticalIndex = game.columns[cube.columnIndex].indexOf(cube);

            // get the min and max values of the list
            const min = Math.min(...match);
            const max = Math.max(...match);

            for (let i = min; i <= max; i++) {
                if (!match.includes(i)) {
                    // there is a missing value.
                    game.selected = [cube];
                    wordValue = cube.letter;
                    break;
                }

                wordValue += game.columns[i][verticalIndex].letter;
            }

            // after the loop there should be no missing values so the selection is correct
            // --
        } else if (isVertical) {
            // check that there is no gaps in the column
            const match = game.selected.map((cube) =>
                game.columns[cube.columnIndex].indexOf(cube)
            );

            // get the min and max indexes
            const min = Math.min(...match);
            const max = Math.max(...match);

            for (let i = min; i <= max; i++) {
                if (!match.includes(i)) {
                    // missing index found
                    game.selected = [cube];
                    wordValue = cube.letter;
                    break;
                }

                wordValue += game.columns[cube.columnIndex][i].letter;
            }

            // after the loop there should be no missing values so the selection is correct
            // --
        } else {
            game.selected = [cube];
            wordValue = cube.letter;
        }

        selectedWord.text(wordValue);

        // check if the word is valid
        isValidWord(wordValue).then((valid) => {
            if (valid) {
                wordBackground.fill(validWordOptions.fill);
                wordBackground.stroke(validWordOptions.stroke);
            } else {
                if (isVertical) {
                    const reverseWord = wordValue.split("").reverse().join("");
                    isValidWord(reverseWord).then((valid) => {
                        if (valid) {
                            wordBackground.fill(validWordOptions.fill);
                            wordBackground.stroke(validWordOptions.stroke);

                            selectedWord.text(reverseWord);
                        } else {
                            wordBackground.fill(inValidWordOptions.fill);
                            wordBackground.stroke(inValidWordOptions.stroke);
                        }
                    });
                }

                wordBackground.fill(inValidWordOptions.fill);
                wordBackground.stroke(inValidWordOptions.stroke);
            }
        });

        // update the highlighted section
        const xRange = game.selected.map((cube) => cube.target.x);
        const yRange = game.selected.map((cube) => cube.target.y);

        target.x = Math.min(...xRange);
        target.y = Math.min(...yRange);

        target.width = Math.max(...xRange) + GridSize - target.x;
        target.height = Math.max(...yRange) + GridSize - target.y;
        target.opacity = 1;
    } else {
        target.opacity = 0;
        selectedWord.text("");

        wordBackground.fill(inValidWordOptions.fill);
        wordBackground.stroke(inValidWordOptions.stroke);
    }

    animation.start();
}
