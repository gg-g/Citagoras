import Vue from "vue";
/*
  Call to REST API COCI
  https://opencitations.net/index/api/v1
*/

/*
  Helper functions
*/

function convertListtoArray(string) {
  var array = string.replace(/"/g, "").split("; ");
  return array;
}

/*
  Cleanup function to format response
*/
function cleanUp(found) {
  // initialize all values
  var entry = {
    doi: "",
    author: "",
    title: "",
    link: "",
    year: "",
    source_id: "",
    source_title: "",
    issue: "",
    volume: "",
    page: "",
    abstract: "",
    citation: [],
    reference: [],
    source_type: ""
  };

  // loop over the simple 1:1 mappings
  var simple_mappings = [
    "author",
    "title",
    "source_id",
    "source_title",
    "issue",
    "volume",
    "page"
  ];

  simple_mappings.forEach(k => {
    if (k in found) {
      entry[k] = found[k];
    }
  });

  // now deal with the more involved attributes

  if ("doi" in found) {
    entry.doi = found.doi.toLowerCase();
  }

  if ("citation" in found) {
    entry.citation = convertListtoArray(found.citation);
    entry.citation = Array.from(new Set(entry.citation));
    entry.citation.map(c => c.toLowerCase());
  }

  if ("reference" in found) {
    entry.reference = convertListtoArray(found.reference);
    entry.reference = Array.from(new Set(entry.reference));
    entry.reference.map(r => r.toLowerCase());
  }

  if ("year" in found) {
    entry.year = parseInt(found.year, 10);
  }

  if ("oa_link" in found) {
    entry.link = found.oa_link;
  }

  entry.providerdata = {};
  var providerdata = {};
  providerdata.reference_reported = "";
  providerdata.reference_found = "";
  providerdata.citation_reported = "";
  providerdata.citation_found = "";

  if ("reference" in found) {
    providerdata.reference_reported = entry.reference.length;
    providerdata.reference_found = entry.reference.length;
  }
  if ("citation_count" in found) {
    providerdata.citation_reported = found["citation_count"];
  }
  if ("citation" in found) {
    providerdata.citation_found = entry.citation.length;
  }
  entry.providerdata[found.source] = providerdata;
  return entry;
}

/*
  Constants
*/

// eslint-disable-next-line no-unused-vars
const API_URL = "https://w3id.org/oc/index/api/v1";
// const API_URL = "/oc/index/api/v1";

const actions = {
  /*
    https://opencitations.net/index/api/v1#/metadata/{dois}
    The metadata endpoint of OC returns all metadata for a given doi

    returned fields
      author: the semicolon-separated list of authors of the bibliographic entity;
      year
      title
      source_title
      source_id: the semicolon-separated list of identifiers
      volume
      issue
      page
      doi
      reference: the semicolon-separated DOIs of all the entities cited by the bibliographic entity
                according to the citation data available in all the OpenCitations Indexes;
      citation: the semicolon-separated DOIs of all the entities that cite the bibliographic entity
                according to the citation data available in all the OpenCitations Indexes;
      citation_count: the number of citations received by the bibliographic entity;
      oa_link: the link to the Open Access version of the bibliographic entity, if available.
  */
  getOne(context, doi) {
    return Vue.http
      .get(API_URL + "/metadata/" + doi)
      .then(response => {
        return cleanUp(response.data[0]);
      })
      .catch(error => {
        throw error.response;
      });
  },

  /*
      given a string representing a doi
      retrieve all references
    */
  getReferences(context, doi) {
    return Vue.http
      .get(API_URL + "/references/" + doi)
      .then(response => {
        var references = {};
        references.list = [];

        response.data.forEach(r => {
          // coci => 10.1201/9781315371795-5
          references.list.push(r.cited.replace("coci => ", "").toLowerCase());
        });

        references.providerdata = {};
        var providerdata = {};

        providerdata.reference_reported = references.list.length;

        references.list = Array.from(new Set(references.list));
        providerdata.reference_found = references.list.length;

        references.providerdata["OpenCitations"] = providerdata;

        return references;
      })
      .catch(error => {
        throw error.response;
      });
  },

  /*
      given a string representing a doi
      retrieve all citations
    */
  getCitations(context, doi) {
    return Vue.http
      .get(API_URL + "/citations/" + doi)
      .then(response => {
        var citations = {};
        citations.list = [];

        response.data.forEach(r => {
          // coci => 10.1201/9781315371795-5
          citations.list.push(r.citing.replace("coci => ", "").toLowerCase());
        });

        citations.providerdata = {};
        var providerdata = {};

        providerdata.citation_reported = citations.list.length;

        citations.list = Array.from(new Set(citations.list));
        providerdata.citation_found = citations.list.length;

        citations.providerdata["OpenCitations"] = providerdata;

        return citations;
      })
      .catch(error => {
        throw error.response;
      });
  },

  /*
    Convenience function to get both citations and references
  */
  getCitationsAndReferences(context, doi) {
    var citsAndRefs = {};
    citsAndRefs.citation = [];
    citsAndRefs.reference = [];
    citsAndRefs.providerdata = {};

    return context
      .dispatch("getCitations", doi)
      .then(citations => {
        citsAndRefs.citation = citations.list;
        citsAndRefs.providerdata = citations.providerdata;
        return context
          .dispatch("getReferences", doi)
          .then(references => {
            citsAndRefs.reference = references.list;
            citsAndRefs.providerdata["OpenCitations"] = {
              ...citsAndRefs.providerdata["OpenCitations"],
              ...references.providerdata["OpenCitations"]
            };
            return citsAndRefs;
          })
          .catch(error => {
            throw error.response;
          });
      })
      .catch(error => {
        throw error.response;
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
