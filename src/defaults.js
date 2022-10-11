export const Width = Math.min(window.innerWidth, 400);

export const Columns = 10;
/**
 * The default gridsize in the game
 */
export const GridSize = Width / Columns;
export const GridPadding = 2;
export const SelectionStroke = 2.5;

export const StartingChars = 30;
export const minVowels = 8;

/**
 * The list of letters available
 */
export const chars = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
export const vowels = "aeiou".toUpperCase().split("");

/**
 * The list of colours available
 */
export const colours = [
    "#00f",
    "#0aa",
    "#0af",
    "#0f0",
    "#0fa",
    "#0ff",
    "#50a",
    "#50f",
    "#5aa",
    "#5af",
    "#5f0",
    "#5fa",
    "#5ff",
    "#a05",
    "#a0f",
    "#a5a",
    "#a5f",
    "#aaf",
    "#aff",
    "#f05",
    "#f50",
    "#f5f",
    "#fa0",
    "#faa",
    "#faf",
    "#ff0",
];
