import { chars, Columns, minVowels, StartingChars, vowels } from "./defaults";
import { Cube } from "./render/Cube";
import Random from "seedrandom";

/**
 * @type {{columns: Cube[][], selected: Cube[], random: Random.PRNG, running: boolean }}
 */
export const game = {
    columns: new Array(Columns).fill(true).map(() => []),
    selected: [],
    random: Random("pre-game"),
    running: false,
};

let intervalId = null;

function addCharacter(char, col) {
    // create a cube for the given character
    const cube = new Cube(char);

    cube.moveTo(col);
    cube.add();
}

function getRandomCharacter() {
    const index = Math.floor(chars.length * game.random.quick());
    return chars[index];
}

function getRandomVowel() {
    const index = Math.floor(vowels.length * game.random.quick());
    return vowels[index];
}

/**
 * Load and start the game
 *
 * @param {string} [seed]
 */
export async function loadGame(seed) {
    seed = typeof seed === "string" ? seed : defaultSeed();
    // setup the seeded random number generator
    game.random = Random(seed);

    // Get the list of characters
    let characters = new Array(StartingChars)
        .fill(true)
        .map(() => getRandomCharacter());

    let loopCount = 0;

    // count the number of vowels and ensure a minimum amount is reached
    while (
        characters.reduce(
            (acc, char) => (vowels.includes(char) ? acc + 1 : acc),
            0
        ) < minVowels &&
        loopCount++ < 100
    ) {
        const replaceIndex = Math.floor(
            characters.length * game.random.quick()
        );
        characters[replaceIndex] = getRandomVowel();
    }

    // add the characters to the game
    let i = 0;
    for (const char of characters) {
        i++;
        const col = i > 20 ? 0 : i % 10;
        addCharacter(char, col);

        await new Promise((r) => setTimeout(r, 1000 / StartingChars));
    }

    resumeGame();
}

/**
 * Pause the game clocks
 */
export function pauseGame() {
    console.log("Pause");

    clearInterval(intervalId);
    intervalId = null;
}

/**
 * Resume or setup all game clocks
 */
export function resumeGame() {
    console.log("Resume");
    game.running = true;
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        // return;
        // spawn a new character
        const char =
            game.random.quick() > 0.25
                ? getRandomCharacter()
                : getRandomVowel();

        addCharacter(char, 0);
    }, 10 * 1000);
}

window.addEventListener("blur", () => pauseGame());
window.addEventListener("focus", () => resumeGame());

function defaultSeed() {
    const date = new Date();
    date.setHours(
        date.getHours(),
        Math.floor(date.getMinutes() / 30) * 30,
        0,
        0
    );
    return `${date.toDateString()}-${date.toTimeString()}`.replace(/\s/g, "");
}
