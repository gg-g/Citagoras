/*
  Main DB
*/

import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-upsert"));

const DB = new PouchDB("Incitation");

const actions = {
  /*
    Initializes state by reading all saved entries
  */
  init({ commit }) {
    DB.allDocs({
      include_docs: true
    })
      .then(result => {
        var docs = result.rows.map(row => {
          return row.doc;
        });
        commit("initArticles", docs, {
          root: true
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  },
  remove({ commit }, doi) {
    DB.get(doi)
      .then(entry => {
        DB.remove(entry).then(() => {
          commit("removeArticle", doi, {
            root: true
          });
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  },
  add({ commit }, entry) {
    entry.added = new Date();
    entry._id = entry.doi;

    // DB.upsert(entry.doi, function(entry) {
    //   return entry;
    // })
    //   .then(() => {
    //     commit("addArticle", entry, {
    //       root: true
    //     });
    //   })
    //   .catch(error => {
    //     // eslint-disable-next-line no-console
    //     console.error(error);
    //   });

    DB.putIfNotExists(entry.doi, entry)
      .then(() => {
        commit("addArticle", entry, {
          root: true
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  },
  flush({ commit }) {
    DB.allDocs()
      .then(result => {
        result.rows.map(row => {
          return DB.remove(row.id, row.value.rev);
        });
      })
      .then(() => {
        commit("flushArticles", true, {
          root: true
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.errors(error);
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
