import cr from "./crossref";
import oc from "./opencitations";

const actions = {
  getOne(context, doi) {
    return context
      .dispatch("cr/getOne", doi)
      .then(response => {
        return context
          .dispatch("oc/getCitationsAndReferences", doi)
          .then(citsAndRefs => {
            // merge data
            response.citation = Array.from(
              new Set(response.citation.concat(citsAndRefs.citation))
            );
            response.reference = Array.from(
              new Set(response.reference.concat(citsAndRefs.reference))
            );
            response.providerdata = {
              ...response.providerdata,
              ...citsAndRefs.providerdata
            };
            return response;
          })
          .catch(error => {
            throw error;
          });
      })
      .catch(error => {
        throw error;
      });
  },

  getMultiple(context, dois) {
    return Promise.all(
      dois.map(x => context.dispatch("getOne", x).catch(e => e))
    )
      .then(results => {
        return results;
      })
      .catch(error => {
        throw error;
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
  strict: true,
  modules: {
    cr,
    oc
  }
};
