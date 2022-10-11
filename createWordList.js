// run with node createWordList.js
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
    input: fs.createReadStream("./wordlist.txt", { encoding: "utf-8" }),
    output: process.stdout,
    terminal: false,
});

let started = false;

let list = [];

rl.on("line", (word) => {
    if (word === "---") {
        started = true;
        return;
    }
    if (!started || !word) {
        return;
    }

    // check that the word contains only valid characters
    if (/[^a-z]/i.test(word)) {
        return;
    }

    list.push(word.toLowerCase());
});

rl.on("close", () => {
    console.log("Read Completed");

    // sort the list
    list = list.sort();

    // remove duplicates
    const tmpList = [];
    for (const word of list) {
        if (!tmpList.includes(word)) {
            tmpList.push(word);
        }
    }

    console.log("Completed.");
    fs.writeFileSync(
        "./src/wordList.js",
        `export const wordList = ${JSON.stringify(tmpList, null, 4)};\n`,
        { encoding: "utf-8" }
    );
});
