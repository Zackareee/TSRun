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
ln -s $PWD/run.ts /usr/local/bin/r
```

Enjoy AI-assisted commandline autocompletion! :D

### Usage ###

Simply call the shortcut for TSRun before any command.

<img width="793" alt="image" src="https://gist.github.com/user-attachments/assets/c7d4ca4f-19b6-49fb-a06e-084fcde1fb06">

<img width="793" alt="image" src="https://gist.github.com/user-attachments/assets/df4ffd8e-2d25-4101-adec-be2cf5ea3d94">


### Contributions ###

I wrote TSRun in an afternoon after being frustrated by having to copy-paste
broken commands into AI websites. I wrote it as a tool to help make myself more
productive, and less frustrated.

Contributions welcome. :)

