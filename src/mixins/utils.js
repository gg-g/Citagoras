import * as util from "util";
/*
  Utility functions available for multiple components
*/
export default {
  methods: {
    /*
      Javascript assigns objects by reference.
      Sometimes we just want to clone an object to avoid
      modifying the original object
      
      Given an object, convert it to JSON and create a clone
      based on the JSON parsed.
    */
    copyObject(objIn) {
      return JSON.parse(JSON.stringify(objIn));
    },
    /*
      Dump an object, limiting depth to 1 to avoid circular references
      Mostly used in error reporting.

      Relies on node utils
    */
    dumpObject(objIn) {
      return util.inspect(objIn, { depth: 1 });
    },
    /*
      Snackbars - blocking user notifications
    */
    // Something bad happened & I really want acknowledgement
    snackBad(message) {
      this.$snackbar.open({
        message: message,
        type: "is-danger",
        position: "is-top"
      });
    },
    // Something good happened & I really want acknowledgement
    snackGood(message) {
      this.$snackbar.open({
        message: message,
        type: "is-danger",
        position: "is-top"
      });
    },
    /*
      Toasts - non blocking user notifications
    */
    // Something good happened
    toastGood(message) {
      this.$toast.open({
        message: message,
        type: "is-success",
        class: "is-small"
      });
    },
    // Something happened
    toastWarning(message) {
      this.$toast.open({
        message: message,
        type: "is-warning",
        class: "is-small"
      });
    },
    // Something bad happened
    toastBad(message) {
      this.$toast.open({
        message: message,
        type: "is-danger",
        class: "is-small"
      });
    }
  }
};
