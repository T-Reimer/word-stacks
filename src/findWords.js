import { game } from "./game";

const scheduled = [];
let isRunning = false;

const wordList = import("./wordList");

export async function isValidWord(word) {
    const list = await wordList;

    return list.wordList.includes(word.toLowerCase());
}

/**
 * Get the words in the current game setup in the given column
 *
 * @param {number} colIndex
 * @param {number} rowIndex
 */
export function searchColumn(colIndex, rowIndex) {
    const colWord = game.columns[colIndex].map((cube) => cube.letter);
    scheduleWord(colWord.join(""));
    scheduleWord(colWord.reverse().join(""));

    const rowWords = game.columns
        .map((col) => {
            if (col[rowIndex]) {
                return col[rowIndex].letter;
            }
            return " ";
        })
        .join("")
        .split(" ")
        .filter(Boolean);

    rowWords.forEach(scheduleWord);

    console.log({ colWord: colWord.join(""), rowWords });
}

/**
 * Schedule a word to lookup
 *
 * @param {string} value
 */
export function scheduleWord(value) {
    value = value.toLowerCase();
    if (!scheduled.includes(value)) {
        scheduled.push(value);
    }

    if (!isRunning) {
        findWords(scheduled.shift());
        isRunning = true;
    }
}

/**
 * Find words in the given string
 *
 * @param {string} value
 */
export async function findWords(value) {
    isRunning = true;

    const { wordList } = await import("./wordList");
    const validWords = [];

    console.time("lookup: " + value);
    for (const word of wordList) {
        if (value.includes(word)) {
            validWords.push(word);
        }
    }
    console.timeEnd("lookup: " + value);
    console.log({ validWords });

    if (scheduled.length === 0) {
        isRunning = false;
    } else {
        setTimeout(() => findWords(scheduled.shift()), 50);
    }
}
window.findWords = findWords;
