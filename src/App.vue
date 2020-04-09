/* App Component Sets up HTTP client library hooks Loads style sheets Sets
global styles */
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
import utils from "@/mixins/utils";

export default {
  name: "citagoras-electron",
  mixins: [utils],
  created() {
    /*
      HTTP interceptors configuration

      This allows us to call additional functions when
      axios completes HTTP requests.

      Here we use it to update downloadstatus
      and notify the user in case of errors

      https://github.com/axios/axios
    */
    this.$http.interceptors.request.use(
      config => {
        this.startDownloading();
        return config;
      },
      error => {
        this.finishDownloading();
        this.toastBad("Error requesting data: " + error);
        return Promise.reject(error);
      }
    );
    this.$http.interceptors.response.use(
      response => {
        this.finishDownloading();
        return response;
      },
      error => {
        this.finishDownloading();
        this.toastBad("Error retrieving data: " + error);
        return Promise.reject(error);
      }
    );

    this.$nprogress.configure({ showSpinner: false });
    this.$electronstore.set("dev", false);
  },

  /*
    Error Handler function which catches and logs all errors
    Also outputs to console
  */
  errorHandler: function(error, object, info) {
    this.addToErrorLog(error + " " + info + " " + this.dumpObject(object));
    // eslint-disable-next-line no-console
    console.log(error);
  },
  methods: {
    ...mapActions(["startDownloading", "finishDownloading"]),
    ...mapMutations(["addToErrorLog"])
  }
};
</script>

<style>
/*
  Set app wide font & take up whole window
*/
html,
body,
#app {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  height: 100%;
}
/*
  Force colums to stretch all the way downs
*/
.columns {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
}

/*
  customize progress bar
*/
#nprogress .bar {
  background: #7957d5;

  width: 100%;
  height: 4px;
}

/*
  give buttons more space
*/
.button_p {
  margin-top: 20px;
  text-align: center;
  margin-bottom: 20px;
}
</style>
