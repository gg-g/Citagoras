import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

// axios HTTP client library
import Axios from "axios";
Vue.http = Vue.prototype.$http = Axios;

// Buefy; Bulma components for Vue
import Buefy from "buefy";
import 'buefy/dist/buefy.css'
Vue.use(Buefy, { defaultIconPack: "fa" });

// Vue2Vis; Vis components for Vue
import { Timeline } from "vue2vis";
Vue.component("timeline", Timeline);

// attach settings store to Vue instance
import SettingsStore from "./settings";
Vue.prototype.$electronstore = SettingsStore;

// Nprogress for window wide progress bar
import NProgress from "nprogress";
Vue.prototype.$nprogress = NProgress;

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.config.productionTip = false;

/*
  Set up global error Handler to catch Vue errors

  Inspired by
  https://jsfiddle.net/Linusborg/z84wspcg/
*/
Vue.config.errorHandler = function(error, vm, info) {
  var handler,
    current = vm;
  if (vm.$options.errorHandler) {
    handler = vm.$options.errorHandler;
  } else {
    while (current.$parent) {
      current = current.$parent;
      if ((handler = current.$options.errorHandler)) break;
    }
  }
  if (handler) {
    handler.call(current, error, vm, info);
  }
  // eslint-disable-next-line no-console
  else console.error(error);
};

new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    /*
      Prevent blank screen in Electron builds; known issue

      https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/commonIssues.html#blank-screen-on-builds-but-works-fine-on-serve
    */
    this.$router.push("/");
  }
}).$mount("#app");
