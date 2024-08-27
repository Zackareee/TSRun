## TSRun: AI-assisted command-line utility ##

TSRun is a wrapper script that guesses command fixes using the Gemini API.

### Installation ###

Add your Gemini API key to `~/.bashrc` or equivalent:

```shell
export GEMINI_API_KEY=<your API key here>
```

Then, checkout the repo, and run:

```shell
npm install
npm install -g ts-node
```

Finally, add a symlink to `run.ts` somewhere on your `$PATH`:

```shell
ln -s $PWD/run.ts /usr/local/bin/t
```

Enjoy AI-assisted commandline autocompletion! :D

### Usage ###

Simply call the shortcut for TSRun before any command.

![image](https://github.com/user-attachments/assets/53cfab2e-97d2-45ef-8f4b-6ce8034646e2)

![image](https://github.com/user-attachments/assets/1ec43204-ff79-4800-b2f7-7759c8eb5a08)

### Contributions ###

I wrote TSRun in an afternoon after being frustrated by having to copy-paste
broken commands into AI websites. I wrote it as a tool to help make myself more
productive, and less frustrated.

Contributions welcome. :)

