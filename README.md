#Github Pulls

This app shows all of your pull requests across your different repositories, and even across the branches in those repos.

To download, just go to the [Releases](https://github.com/natecavanaugh/github-pulls/releases) tab and download the latest zip file.

#Building locally

If you want to edit and build the file locally, you can do that by going to build/osx/ and running build.sh.
The only requirement is that you have node-webkit.app inside of your Applications directory (and it must be version 0.3.2, which you can get from [here](https://github.com/rogerwang/node-webkit/wiki/Downloads-of-old-versions#v032-nov-7-2012))

#TODO
* node-webkit v.0.3.3 introduced [injecting of a global window object into require(d) files](https://github.com/rogerwang/node-webkit/issues/164) and for whatever reason, this is causing a JS error inside of the YUI files.  
I'm not sure why, but need to investigate more.
* I'd like to support building this for Windows and Linux, which should be doable, but haven't had time to attempt it.
* The code is far below my usual standards, architecture-wise. Again, it was done to get it out the door, but want to reorganize to be much cleaner.

