#!/usr/bin/env ts-node

import { execSync, ExecException } from "child_process";
import readline from 'readline';


const FgYellow: string = "\x1b[33m"
const FgCyan: string = "\x1b[36m"
const Reset: string = "\x1b[0m"

async function main() {
    // We can safely remove the first two arguments, as they will reliably be 
    // ts-node and the filename of this script.
    let cmd: string = process.argv.slice(2).join(" ");
    while (true) {
        try {
            const stdout: string = execSync(cmd, {encoding: "ascii"})
            console.log(stdout);
            process.exit();
        }
        catch (err: unknown) {
            // Nothing meaninful to do if err is not an ExecException
            const error: ExecException = err as ExecException
            const stderr: string = error.stderr !== undefined ? error.stderr : "";
            let geminiText: [string];
            try {
                geminiText = await callGemini(stderr, cmd);
            }
            catch (geminiError) {
                console.log(geminiError)
                process.exit();
            }
            
            console.log(`${FgCyan}Did you mean:${Reset}`)
            for (let i = 0; i < geminiText.length; i++) {
                console.log(`${FgYellow}${i + 1}. ${geminiText[i]}${Reset}`)
            }

            readline.emitKeypressEvents(process.stdin);
            if (process.stdin.isTTY)
                process.stdin.setRawMode(true);

            console.log(`Enter a number 1 - 9 of command to run, or q to quit\n`);

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

async function callGemini(error: string | Buffer, command: string) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `I have an error ${error}. my command is: ${command}. Provide a suggested command in the format of ["command"], replacing "command" with your suggestion. Have a list of minimum 1 suggestion and maximum 3. For example ["echo hello"] Provide the full command rather than correcting a single incorrect syntax, ie YES: ["rm foo.txt"] NO: ["rm"]. Return your command(s) as a valid array in the form ["echo hello", "echo Hello"] and nothing else. Do not preface any text with backticks`
                        }]
                    }]
                })
            })
        const data = await response.json();
        const responseText: string = await data.candidates[0].content.parts[0].text
        return JSON.parse(responseText);
    }
    catch (e) {
        console.log(e);
    }
}

main()