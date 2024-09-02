#!/usr/bin/env ts-node

import { execSync, ExecException } from "child_process";
import readline from 'readline';
import fs from 'fs';
import os from 'os';

const GEMINIURL = `https://generativelanguage.googleapis.com/v1beta/models/`
    + `gemini-1.5-flash-latest:generateContent?key=`
    + process.env.GEMINI_API_KEY

const PROMPT = (context: string, error: string | Buffer, command: string) => 
    `My last five commands ran are: ${context}. I have an error; ${error}. my `
    + `command is: ${command}. Provide a suggested command in the format of `
    + `["command"], replacing "command" with your suggestion. Have a list of `
    + `minimum 1 suggestion and maximum 3. For example ["echo hello"] Provide `
    + `the full command rather than correcting a single incorrect syntax, ie `
    + `YES: ["rm foo.txt"] NO: ["rm"]. Return your command(s) as a valid array `
    + `in the form ["echo hello", "echo Hello"] and nothing else. Do not `
    + `preface any text with backticks. my last five commands may be entirely `
    + `unrelated, they are provided to aid in returning a contextual result.`;

const FGYELLOW: string = "\x1b[33m"
const FGCYAN: string = "\x1b[36m"
const RESET: string = "\x1b[0m"

async function main() : Promise<void> {
    // We can safely remove the first two arguments, as they will reliably be 
    // ts-node and the filename of this script.
    let cmd: string = process.argv.slice(2).join(" ");
    while (true) {
        try {
            const stdout: string = execSync(cmd, {encoding: "ascii"});
            console.log(stdout);
            process.exit();
        }
        catch (err: unknown) {
            // Nothing meaninful to do if err is not an ExecException
            const error: ExecException = err as ExecException
            const stderr: string =
                error.stderr !== undefined ? error.stderr : "";
            let geminiText: [string];
            try {
                const lastFiveLines: string[] = await lastFiveCommands();
                // Gemini API expectes the context as a string, so converting to 
                // a string of a list.
                const commandsAsString: string = lastFiveLines.join(", ");
                geminiText = await callGemini(commandsAsString, stderr, cmd);
            }
            catch (geminiError) {
                // If theres an error with the API call, nothing meaninful can 
                // be done, so we print the error and exit. 
                //
                // This includes bad api keys, invalid urls, etc. Nothing more 
                // can be done without external changes
                console.log(geminiError)
                process.exit();
            }
    
            console.log(`${FGCYAN}Did you mean:${RESET}`)
            for (let i = 0; i < geminiText.length; i++) {
                console.log(`${FGYELLOW}${i + 1}. ${geminiText[i]}${RESET}`)
            }

            readline.emitKeypressEvents(process.stdin);
            if (process.stdin.isTTY)
                process.stdin.setRawMode(true);

            console.log(
                `Enter a number 1 - 9 of command to run, or q to quit\n`
            );

            // Using a promise await here so the while loop is blocked until a 
            // key is pressed. 
            await new Promise<void>((callback) => {
                process.stdin.on('keypress', (chunk, key) => {
                    if (key && Number(key.name)) {
                        cmd = geminiText[Number(key.name) - 1]
                    } else {
                        process.exit();
                    }
                    callback()
                });
            })
        }
    }
}

async function lastFiveCommands() : Promise<string[]> {
    // Fetch the last five commands from zsh_history (if it exists) for context 
    // TODO: Check bash_history if zsh_history doesn't exist. 
    const home: string = os.homedir()
    if (fs.existsSync(`${home}/.zsh_history`)) {
        const data: string = fs.readFileSync(
            `${home}/.zsh_history`, 
            {encoding: 'utf8'},
        ) 
        const lines: string[] = data.split('\n');
        const commands: string[] = lines.slice(-5);
        return commands;
    }
    return [""];
}

async function callGemini(
    context: string, 
    error: string | Buffer, 
    command: string
    ) : Promise<any> {

    // TODO: bubble up try catch outside of callGemini()
    try {
        const response = await fetch(
            GEMINIURL,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: PROMPT(context, error, command)
                        }]
                    }]
                })
            });

        const data = await response.json();
        const responseText: string = 
            await data.candidates[0].content.parts[0].text;
        return JSON.parse(responseText);
    }
    catch (e) {
        console.log(e);
    }
}

main();