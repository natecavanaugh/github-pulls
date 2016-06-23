# Github Pulls

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [About](#about)
- [Download](#download)
- [Features](#features)
- [Screenshots](#screenshots)
- [Building locally](#building-locally)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## About
This app shows all of your GitHub pull requests and issues across your different repositories, and even across the branches in those repos.
Now with version 1.0, we support Mac, Linux and Windows builds, as well as in app updates.

![Github Pulls](/../screenshots/images/cozy.png?raw=true "Github Pulls")

## Download
To download, just go to the [Releases](https://github.com/natecavanaugh/github-pulls/releases) tab and download the latest zip file.

## Features
- Displays all of your GitHub pull requests and issues, sorted by repo and branch
- You can also watch arbitrary repos on github
- Display pull request CI status, as well as the comment count
- Three types of display: Compact, Cozy (the default), and Comfortable
- Collapsible repos
- Peek collapsed repos without permanently expanding them
- Automatically link JIRA-style tickets to a JIRA server
- New Lexicon theme
- Updates can be automatically installed

## Screenshots

<table width="100%">
	<tr>
		<th width="33%">Cozy</th>
		<th width="33%">Compact</th>
		<th width="33%">Comfortable</th>
	</tr>
	<tr>
		<td align="center"><img src="/../screenshots/images/cozy.png?raw=true" width="100" /></td>
		<td align="center"><img src="/../screenshots/images/compact.png?raw=true" width="100" /></td>
		<td align="center"><img src="/../screenshots/images/comfortable.png?raw=true" width="100" /></td>
	</tr>
	<tr>
		<th>Configuration</th>
		<th>Display Styles</th>
		<th>Collapsed Repos</th></tr>
	<tr>
		<td align="center"><img src="/../screenshots/images/config.png?raw=true" width="100" /></td>
		<td align="center"><img src="/../screenshots/images/management_bar.png?raw=true" width="100" /></td>
		<td align="center"><img src="/../screenshots/images/collapsed.png?raw=true" width="100" /></td>
	</tr>
</table>



## Building locally

This branch has changed to using Electron and Redux with React (using the [Electon React Boilerplate](https://github.com/chentsulin/electron-react-boilerplate) setup).

To build locally, follow the following steps:
1. Run `npm install` from the root of the project
2. Run `npm run dev`
3. Make your changes, and the app will update live

We use [electron-builder](https://github.com/electron-userland/electron-builder) to build the packages and installers for the different operating systems, and use [electron-gh-releases](https://github.com/jenslind/electron-gh-releases) to handle notifying users of an update.