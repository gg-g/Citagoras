/*
  Utility functions when running under electron
*/
import electron from "electron";
import fs from "fs";
import util from "util";

export default {
  methods: {
    /*
      Open link in system default browser
    */
    openInBrowser(link) {
      require("electron").shell.openExternal(link);
    },
    /*
      Given array of objects to save and a name
      save as JSON file
    */
    saveAsJSON(contentToSave, name) {
      const app = electron.remote;
      var dialog = app.dialog;
      var content = JSON.stringify(contentToSave, null, 2);
      var saveOptions = {
        filters: [
          {
            name: "JSON",
            extensions: ["json"]
          }
        ],
        defaultPath: `*/${name}.json`
      };
      dialog.showSaveDialog(saveOptions, path => {
        if (path === undefined) return;
        fs.writeFile(path, content, error => {
          if (error) {
            this.toastBad(
              "An error ocurred creating the file " + error.message
            );
          } else {
            this.toastGood("File saved");
          }
        });
      });
    },
    /*
      Given a string to save and a name
      save as text file
    */
    saveAsText(contentToSave, name) {
      const app = electron.remote;
      var dialog = app.dialog;
      var saveOptions = {
        filters: [
          {
            name: "TEXT",
            extensions: ["txt", "text"]
          }
        ],
        defaultPath: `*/${name}.txt`
      };
      dialog.showSaveDialog(saveOptions, path => {
        if (path === undefined) return;
        fs.writeFile(path, contentToSave, error => {
          if (error) {
            this.toastBad(
              "An error ocurred creating the file " + error.message
            );
          } else {
            this.toastGood("File saved");
          }
        });
      });
    },
    /*
      Present an open dialog window to select a text file
      read it in, strip empty lines and return as array
    */
    async openAsText() {
      const app = electron.remote;
      var dialog = app.dialog;

      var openOptions = {
        filters: [
          {
            name: "Text",
            extensions: ["txt", "text"]
          }
        ],
        defaultPath: "*/"
      };

      // get name of text file to read
      var textFile = await new Promise((resolve, reject) => {
        dialog.showOpenDialog(openOptions, path => {
          if (path) {
            resolve(path[0]);
          } else {
            reject(undefined);
          }
        });
      });

      // read it
      var readFile = util.promisify(fs.readFile);

      // return it as array
      // trim empty lines
      return readFile(textFile, "utf8").then(content => {
        var lines = [];
        // skip empty lines
        var regex = new RegExp(/^\s*$/);
        content.split("\n").forEach(line => {
          if (!line.match(regex)) {
            lines.push(line.trim());
          }
        });
        return lines;
      });
    }
  }
};
