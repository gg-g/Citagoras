/*
  Disk cache
*/

import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-upsert"));

const CACHE = new PouchDB("Cache");

const actions = {
  /*
    Initializes the cache by reading all saved entries
  */
  init({ commit }) {
    CACHE.allDocs({
      include_docs: true
    })
      .then(result => {
        var docs = result.rows.map(row => {
          return row.doc;
        });
        commit("bulkAddCache", docs, {
          root: true
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  },
  /*
    given a doi,
    removes entry from cache
  */
  remove({ commit }, doi) {
    commit("removeCache", doi, {
      root: true
    });

    CACHE.get(doi)
      .then(entry => {
        return CACHE.remove(entry);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  },
  /*
    given an array of entries,
    adds to cache
  */
  bulkAdd({ commit }, arrayEntries) {
    var date = new Date();
    arrayEntries.forEach(element => {
      element.cached = date;
      // element.type = "article";
      element._id = element.doi;
    });
    CACHE.bulkDocs(arrayEntries).then(() => {
      commit("bulkAddCache", arrayEntries, {
        root: true
      });
    });
  },
  /*
    given an entry,
    adds to cache
  */
  add({ commit }, entry) {
    entry.cached = new Date();
    entry._id = entry.doi;

    CACHE.upsert(entry.doi, function() {
      return entry;
    })
      .then(() => {
        commit("addCache", entry, {
          root: true
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  },
  flush({ commit }) {
    CACHE.allDocs()
      .then(result => {
        result.rows.map(row => {
          return CACHE.remove(row.id, row.value.rev);
        });
      })
      .then(() => {
        commit("flushCache", true, {
          root: true
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }
};

const getters = {};

const mutations = {};

const state = {};

export default {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
  strict: true
};
