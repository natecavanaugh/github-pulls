#Github Pulls

This app shows all of your pull requests across your different repositories, and even across the branches in those repos.

To download, just go to the [Releases](https://github.com/natecavanaugh/github-pulls/releases) tab and download the latest zip file.

![Github Pulls](http://alterform.com/github-pulls/ghp.png?v=0.2.0)

#Building locally

You can now build locally using gulp. Make sure you have gulp installed globally (`npm -g install gulp`), and from the root of this project, run:
`npm install`.
Once the dependencies are all installed, you can run a few different tasks:

To just build the file, run: `gulp build`.
To build, and install the Application, run: `gulp build:install`
If you'd like to modify the files, and have it update on the fly, you can do: `gulp build:watch`

Note: *This currently only works on the mac, still need to add build/deploy functionality for Windows/Linux, though if you're running locally, you could modify the build task to add build support for Linux and Windows*