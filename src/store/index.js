import Vue from "vue";
import Vuex from "vuex";

import db from "./modules/db";
import cache from "./modules/cache";
import remote from "./modules/remote";

import pThrottle from "p-throttle";

Vue.use(Vuex);

const actions = {
  // cache actions
  startDownloading(context) {
    context.commit("startDownloading");
  },
  finishDownloading(context) {
    context.commit("finishDownloading");
  },
  setSearchString(context, value) {
    context.commit("setSearchString", value);
  },
  initCache(context) {
    context.dispatch("cache/init");
  },
  addCache(context, article) {
    context.dispatch("cache/add", article);
  },
  addBulkCache(context, articles) {
    context.dispatch("cache/bulkAdd", articles);
  },
  removeCache(context, doi) {
    context.dispatch("cache/remove", doi);
  },
  flushCache(context) {
    context.dispatch("cache/flush");
  },

  // article achtions
  initArticles(context) {
    context.dispatch("db/init");
  },
  removeArticle(context, doi) {
    context.dispatch("db/remove", doi);
  },
  flushArticles(context) {
    context.dispatch("db/flush");
  },

  addArticle(context, doi) {
    // check if it exists in cache
    if (state.cached.has(doi)) {
      var found = state.cached.get(doi);

      // check if entry exceeds cache life time
      var date_difference = Math.floor(
        (Date.now() - Date.parse(found.cached)) / (1000 * 60 * 60 * 24)
      );

      if (date_difference < this._vm.$electronstore.get("CacheTTL")) {
        context.dispatch("db/add", found);
        context.dispatch("prefetchCitationData", found);
        return found;
      }
    }
    // if it didn't exist or did exist but exceeded CacheTTL
    return context
      .dispatch("remote/getOne", doi)
      .then(found => {
        context.dispatch("cache/add", found);
        context.dispatch("db/add", found);
        context.dispatch("prefetchCitationData", found);
        return found;
      })
      .catch(error => {
        context.commit("addToErrorLog", JSON.stringify(error));
      });
  },

  getOne(context, doi) {
    return context
      .dispatch("remote/getOne", doi)
      .then(found => {
        context.dispatch("cache/add", found);
      })
      .catch(error => {
        context.commit("addToErrorLog", JSON.stringify(error));
      });
  },

  prefetchCitationData(context, article) {
    var all = article.reference.concat(article.citation);
    var doisToFetch = [];
    all.forEach(doi => {
      if (state.cached.has(doi)) {
        var found = state.cached.get(doi);
        var date_difference = Math.floor(
          (Date.now() - Date.parse(found.cached)) / (1000 * 60 * 60 * 24)
        );
        if (date_difference < this._vm.$electronstore.get("CacheTTL")) {
          doisToFetch.push(doi);
        }
      } else {
        doisToFetch.push(doi);
      }
    });
    context.commit("setDownloadTotal", doisToFetch.length);
    context.commit("setDownloadTracker", doisToFetch.length);

    var downloadThrottle = this._vm.$electronstore.get("downloadThrottle");

    if (downloadThrottle === 0) {
      context
        .dispatch("remote/getMultiple", doisToFetch)
        .then(data => {
          context.dispatch("cache/bulkAdd", data);
        })
        .catch(error => {
          context.commit("addToErrorLog", JSON.stringify(error));
        });
    } else {
      const throttled = pThrottle(
        doi => {
          return context
            .dispatch("remote/getOne", doi)
            .then(found => {
              context.dispatch("cache/add", found);
              context.commit("setDownloadTracker", state.downloadTracker - 1);

              return found;
            })
            .catch(error => {
              context.commit("addToErrorLog", JSON.stringify(error));
            });
        },
        downloadThrottle,
        1000
      );

      doisToFetch.forEach(doi => {
        throttled(doi);
      });
    }
  }
};

const getters = {
  getArticle: state => doi => {
    return state.articles.find(article => article.doi === doi);
  },
  checkArticle: state => doi => {
    if (state.articles.find(article => article.doi === doi)) {
      return true;
    } else {
      return false;
    }
  },
  getCacheEntry: state => doi => {
    return state.cached.get(doi);
  },

  checkCache: state => doi => {
    return state.cached.has(doi);
  },
  getSearchString: state => () => {
    return state.searchString;
  },
  getFilteredArticles: state => () => {
    return state.articles;
  },
  getBreadcrumbs: state => () => {
    return state.breadcrumbs;
  },

  getFilteredCache: state => dois => {
    var list = [];
    dois.forEach(doi => {
      if (state.cached.has(doi)) {
        var toAdd = state.cached.get(doi);

        list.push(toAdd);
      } else {
        // cache miss - create dummy
        list.push({
          doi: doi,
          cacheMiss: true,
          citation: [],
          reference: []
        });
      }
    });
    return list;
  },
  getErrorLogAsText: state => () => {
    return state.errorLog.join("\n");
  }
};

const mutations = {
  // cache commits
  addCache(state, cachie) {
    state.cached.set(cachie.doi, cachie);
  },
  bulkAddCache(state, cachies) {
    cachies.forEach(cachie => {
      state.cached.set(cachie.doi, cachie);
    });
  },
  removeCache(state, doi) {
    state.cached.delete(doi);
  },
  flushCache(state) {
    state.cached = new Map();
  },

  // article commits
  initArticles(state, articles) {
    state.articles = articles;
  },
  addArticle(state, article) {
    state.articles.push(article);
  },
  removeArticle(state, doi) {
    var doiToRemove = state.articles
      .map(entry => {
        return entry.doi;
      })
      .indexOf(doi);
    state.articles.splice(doiToRemove, 1);
  },
  flushArticles(state) {
    state.articles = [];
  },

  // others
  setSearchString(state, searchString) {
    state.searchString = searchString;
  },
  setSelectedArticle(state, article) {
    state.selectedArticle = article;
  },
  setSelectedSourceType(state, sourceType) {
    state.selectedSourceType = sourceType;
  },
  startDownloading(state) {
    state.downloading++;
  },
  finishDownloading(state) {
    state.downloading--;
  },
  setDownloadTotal(state, downloadTotal) {
    state.downloadTotal = downloadTotal;
  },
  setDownloadTracker(state, downloadTracker) {
    state.downloadTracker = downloadTracker;
  },
  addBreadcrumb(state, crumb) {
    state.breadcrumbs.add(crumb);
  },
  wipeBreadcrumbs(state) {
    state.breadcrumbs = new Set();
  },
  addToErrorLog(state, message) {
    state.errorLog.push(new Date().toISOString() + " " + message);
  }
};

const state = {
  articles: [],
  breadcrumbs: new Set(),
  cached: new Map(),
  downloading: 0,
  downloadTotal: 0,
  downloadTracker: 0,
  errorLog: [],
  searchString: "",
  selectedArticle: {},
  selectedSourceType: ""
};

export default new Vuex.Store({
  actions,
  getters,
  mutations,
  state,
  modules: {
    cache,
    db,
    remote
  },
  strict: true
});
