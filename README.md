# Citagoras
A visualisation tool to help students and researchers discover scientific articles by leveraging publicly available citation metadata.

![Citagoras](/doc/exploration_screen.png)

## Table of contents

  * [Introduction](#introduction)
  * [Requirements](#requirements)
  * [Installation](#installation)
  * [Usage](#usage)
  * [Uninstalling Citagoras](#uninstalling-citagoras)
  * [Questions](#questions)


## Introduction

Citagoras is a tool to help students and researchers discover scientific articles by leveraging publicly available citation metadata and representing it in a way that can help streamline literature discovery. It was developed as part of a project while pursuing a degree. Since test users expressed a favourable opinion, I decided to make it available, hoping that it might be of use to others.

## Requirements

You will need a computer with a working internet connection to use this application.

Citagoras should run on every recent Linux distribution, macOS and Windows. It has been tested on following platforms:

| OS  | Version |
| ---- | ---- |
| Linux  | Ubuntu 18.04, 19.04 |
| macOS  | 10.11 (El Capitan), 10.14 (Mojave) |
| Windows  | 10 Pro Release 1809 |

This application communicates with two publicly online citation providers to retrieve scientific article information.

| Provider  | Reason to connect |
| ---- | ---- |
| https://www.crossref.org/ | Retrieve article metadata |
| https://opencitations.net | Retrieve citations and references |

No personally identifiable information on your computer or your person is sent to them. The only information these public data providers see, are the requests for certain entries coming from an IP address associated at that time with your computer or Internet Service Provider.

## Installation

Citagoras is delivered as a stand-alone application. Downloads are available under the [releases](https://github.com/gg-g/Citagoras/releases/latest)

After downloading it, you should have a zip or executable file in your downloads folder.

### Linux

Citagoras is delivered as an application image. You should be able to run it by double-clicking it in the file explorer of your desktop environment.

If it doesn't run, make sure the executable permissions are set. You can set these permissions by opening a terminal and issuing
```
chmod a+x /path/to/citagoras.AppImage
```

### macOS

Citagoras is delivered as a zipped application. After unzipping the archive, you should be able to double-click the icon to run it. You will have to confirm that you want to run this application.

Should you be presented with a notification that Citagoras cannot be opened because it is from an unidentified developer, you can choose to open the application anyway:

- In the Finder, right-click or hold the Control key on your keyboard while clicking on the application.
- In the menu that pops up near your mouse pointer, select 'Open'.
- Click 'Open' in the dialog window asking you to be sure to open the application.

This notification is triggered by the Gatekeeper software which is an integral part of macOS and checks if the application you wish to launch was created by an Apple identified developer. See https://support.apple.com/en-us/HT202491 for more details.

### Windows

Citagoras is delivered as an executable installer. Double-click the 'citagoras Setup' executable; this will launch the installation.

The installer will create a shortcut on your Desktop as well as create an entry in the Start Menu. Citagoras will be auto-started at the end of the installation procedure


## Usage

After launching, you will be presented with the Citagoras main screen in which you maintain your bibliography of scientific literature.

![Citagoras](/doc/article_actions.png)

On this screen you can add your scientific literature if you know the Digital Object Identifier or DOI by clicking the 'Add DOI' in the upper right hand corner.

Most controls on the screen have a tool tip associated with them. Hover the mouse pointer near a button to display more information.

On the top of the screen you find filter controls to use on your bibliographic entries in the main data table. In the grey left hand side bar, you find buttons to import, export and save your entries as well as a button to access the application's settings.

Clicking the footsteps icon in the details card of an article will take you to the exploration screen.

For a full manual, see the [manual](doc/manual.pdf)

## Uninstalling Citagoras

### Linux

Uninstall Citagoras by deleting the AppImage.

### macOS

Uninstall Citagoras by dragging it to the Trash.

### Windows

Uninstall Citagoras via Settings.

- Launch the Settings app via the Start Menu
- Click the App section in the Settings app
- Search 'citagoras' in the installed applications list to
- Click the entry for Citagoras and click 'Uninstall'

## Acknowledgements

This project used existing libraries and technologies:

| Name  | Location |
| ---- | ---- |
| Axios | https://github.com/axios/axios |
| Buefy | https://buefy.org/ |
| Bulma | https://bulma.io/ |
| Electron | https://electronjs.org/ |
| electron-store | https://github.com/sindresorhus/electron-store |
| Font-Awesome | https://github.com/FortAwesome/Font-Awesome |
| NProgress | https://github.com/rstacruz/nprogress |
| p-throttle | https://github.com/sindresorhus/p-throttle |
| PouchDB | https://pouchdb.com/ |
| PouchDB-Upsert | https://github.com/pouchdb/upsert |
| Vis.js | http://visjs.org/ |
| vue-cli-plugin-electron-builder | https://github.com/nklayman/vue-cli-plugin-electron-builder |
| Vue.js | (Vuex, Vue-Router) https://vuejs.org/ |
| Vue2Vis | https://github.com/alexcode/vue2vis |

Any error or omission is on my behalf. Feel free to correct me where wrong.

## Questions

**Why use a Digital Object Identifier (DOI) as entry? Why can't I just perform a free text search on metadata?**

Working with DOIs as initial entry point is admittedly not user friendly. It also requires knowledge of at least
one starting entry to explore further.

Unfortunately, academic search engines impose usage limitations for the general public by either requiring a subscription, disallowing automated searches or just not offering any programmatic interfaces at all. For this reason, Citagoras did not have any free text search option.
