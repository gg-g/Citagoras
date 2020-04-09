/*
  Main parent Component
*/
<template>
  <div class="columns is-gapless">
    <div class="column is-1 has-background-grey-lighter">
      <nav class="navbar is-dark">
        <div class="navbar-item has-text-light">Citagoras</div>
      </nav>
      <aside class="menu">
        <p class="button_p">
          <b-tooltip label="Import a text file of DOIs" position="is-right">
            <b-button class="is-link sideBarButton" @click="importArticleList" size="is-small">
              <i class="fas fa-file-import"></i>
              Import
            </b-button>
          </b-tooltip>
        </p>
        <p class="button_p">
          <b-tooltip label="Export your bibliography as a text file of DOIs" position="is-right">
            <b-button class="is-link sideBarButton" @click="exportArticleList" size="is-small">
              <i class="fas fa-file-export"></i>
              Export
            </b-button>
          </b-tooltip>
        </p>
                
        <p class="button_p">
          <b-tooltip label="Save your bibliography data in JSON format" position="is-right">
            <b-button class="is-link sideBarButton" @click="saveArticleList" size="is-small">
              <i class="fas fa-save"></i>
              Save
            </b-button>
          </b-tooltip>
        </p>
        <p class="button_p">
          <b-tooltip label="Change settings" position="is-right">
            <b-button class="is-link sideBarButton" @click="isSettingsDialogVisible = true" size="is-small">
              <i class="fas fa-cog"></i>
              Settings
            </b-button>
          </b-tooltip>
        </p>
      </aside>
    </div>

    <div class="column">
      <router-view :key="$route.fullPath + Date.now()"></router-view>
    </div>

    <!-- model dialog box for settings -->
    <b-modal :active.sync="isSettingsDialogVisible" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Settings</p>
        </header>
        <section class="modal-card-body">
          <b-field label="CrossRef API Endpoint">
            <b-input v-model="settings.crossRefApi"></b-input>
          </b-field>

          <b-field label="OpenCitations API Endpoint">
            <b-input v-model="settings.openCitationsApi"></b-input>
          </b-field>

          <div>
            <b-tooltip
              label="Throttle to limit requests/second when prefetching data; set to 0 to disable"
              position="is-right"
            >
              <b-field label="Download throttle">
                <b-input
                  style="width:5em;"
                  type="number"
                  min="0"
                  max="12"
                  v-model.number="settings.downloadThrottle"
                ></b-input>
              </b-field>
            </b-tooltip>
          </div>
          <div class="level">
            <div
              v-if="settings.downloadThrottle===0"
            >This will hit APIs hard which isn't considered nice</div>
          </div>
          <div class="level">
            <b-field>
              <b-tooltip label="View log" position="is-right">
                <b-button class="is-link" @click="isLogDialogVisible = true">
                  <i class="fas fa-scroll"></i>
                  Log
                </b-button>
              </b-tooltip>
            </b-field>
          </div>

          <div>
            <b-tooltip
              label="Cache Time To Live in days; if cached copy exceeds this amount in days, it will be refetched"
              position="is-right"
            >
              <b-field label="Cache TTL">
                <b-input
                  style="width:5em;"
                  type="number"
                  min="0"
                  v-model.number="settings.CacheTTL"
                ></b-input>
              </b-field>
            </b-tooltip>
          </div>


          <b-field horizonal label="Show Development Options">
            <b-checkbox v-model="settings.dev"></b-checkbox>
          </b-field>
          <div v-if="settings.dev">
            <b-field>
              <b-button class="is-danger" @click="wipeCache">
                <i class="fas fa-eraser"></i>Wipe Cache
              </b-button>
            </b-field>
            <b-field>
              <b-button class="is-danger" @click="wipeEntries">
                <i class="fas fa-eraser"></i>Wipe Entries
              </b-button>
            </b-field>
          </div>
        </section>
        <footer class="modal-card-foot buttons is-right">
          <b-button @click="settingsClosed">Close</b-button>
          <b-button @click="settingsConfirmed" class="is-primary">Apply Changes</b-button>
        </footer>
      </div>
    </b-modal>

    <!-- model dialog box for log -->
    <b-modal :active.sync="isLogDialogVisible" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Log</p>
        </header>
        <section class="modal-card-body">
          <div class="level">
            <textarea :value="getErrorLogAsText()" rows="10" cols="80"></textarea>
          </div>
        </section>

        <footer class="modal-card-foot buttons is-right">
          <b-button @click="isLogDialogVisible=false">Close</b-button>
          <b-button @click="saveAsText(getErrorLogAsText(), 'errorlog')">Save as Text</b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import electron from "@/mixins/electron";
import utils from "@/mixins/utils";

export default {
  name: "Main",
  mixins: [utils, electron],
  data() {
    return {
      isSettingsDialogVisible: false,
      isLogDialogVisible: false,
      settings: {}
    };
  },
  created() {
    // initialize settings, cache and article store from persistent data
    this.settings = this.$electronstore.store;
    this.initCache();
    this.initArticles();
  },
  computed: {
    ...mapState([
      "articles",
      "downloading",
      "downloadTotal",
      "downloadTracker",
      "errorLog"
    ]),
    ...mapGetters(["getErrorLogAsText", "getArticle"])
  },
  methods: {
    ...mapActions([
      "addArticle",
      "initCache",
      "initArticles",
      "flushCache",
      "flushArticles"
    ]),
    wipeCache() {
      this.flushCache();
      this.toastGood("Cache wiped");
    },
    wipeEntries() {
      this.flushArticles();
      this.toastGood("Articles wiped");
    },
    exportArticleList() {
      var doisToExport = this.articles.map(article => article.doi).join("\n");
      this.saveAsText(doisToExport, "export");
    },
    saveArticleList() {
      this.saveAsJSON(this.articles, "article-list");
    },
    importArticleList() {
      var alreadyFound = [];
      this.openAsText()
        .then(content => {
          content.forEach(line => {
            // check if it is already in article list
            var found = this.getArticle(line);
            if (found) {
              alreadyFound.push(line);
            } else {
              this.addArticle(line);
            }
          });
        })
        .catch(error => {
          // when user clicks cancel, this ends up here as well
          // since s/he clicked cancel, we ignore
          // only report on the real errors
          if (error) {
            this.toastBad(error);
          }
        });
    },
    settingsClosed() {
      this.isSettingsDialogVisible = false;
      this.settings = this.$electronstore.store;
    },
    settingsConfirmed() {
      // trim whitespace
      this.settings["crossRefApi"] = this.settings["crossRefApi"].trim();
      this.settings["openCitationsApi"] = this.settings[
        "openCitationsApi"
      ].trim();

      // check if Api links end on /
      // if not, add one
      if (!this.settings["crossRefApi"].endsWith("/")) {
        this.settings["crossRefApi"] += "/";
      }

      if (!this.settings["openCitationsApi"].endsWith("/")) {
        this.settings["openCitationsApi"] += "/";
      }
      try {
        this.$electronstore.store = this.settings;
        this.isSettingsDialogVisible = false;
      } catch (error) {
        this.snackBad("Invalid settings" + error);
      }
    }
  },
  watch: {
    /*
      watcher on downloading to determine the download progress
    */
    downloading(newValue, oldValue) {
      if (newValue === 0 && this.downloadTracker === 0) {
        this.$nprogress.done();
      } else if (oldValue === 0 && this.downloadTracker !== 0) {
        this.$nprogress.start();
      } else {
        this.$nprogress.set(
          (1.1 * (this.downloadTotal - this.downloadTracker)) /
            this.downloadTotal
        );
      }
    }
  }
};
</script>
<style>
.sideBarButton {
  width: 100px;
}
</style>