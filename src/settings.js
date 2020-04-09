/*
  Electron Store to save application settings
*/
import SettingsStore from "electron-store";

// Validation schema for settings
const settingsSchema = {
  httpProxy: {
    type: "string",
    default: ""
  },
  httpsProxy: {
    type: "string",
    default: ""
  },
  noProxy: {
    type: "string",
    default: ""
  },
  crossRefApi: {
    type: "string",
    format: "url",
    default: "http://api.crossref.org/works/"
  },
  openCitationsApi: {
    type: "string",
    format: "url",
    default: "https://opencitations.net/index/api/v1/metadata/"
  },
  columnsVisible: {
    type: "array",
    items: {
      type: "string",
      default: ""
    },
    default: []
  },
  downloadThrottle: {
    type: "number",
    default: 8,
    minimum: 0,
    maximum: 12
  },
  CacheTTL: {
    type: "number",
    default: 7
  },
  dev: {
    type: "boolean",
    default: false
  }
};

export default new SettingsStore({
  schema: settingsSchema,
  name: "citagoras-electron"
});
