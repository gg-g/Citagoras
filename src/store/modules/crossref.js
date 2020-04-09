import Vue from "vue";

/*
  Call to CrossRef API
  https://github.com/CrossRef/rest-api-doc
*/

/*
  Constants
*/

const API_URL = "http://api.crossref.org/works/";

/*
    https://github.com/CrossRef/rest-api-doc#crossref-rest-api

    Specify a User-Agent header that properly identifies your script
    or tool and that provides a means of contacting you via email
    using "mailto:"
*/

// const CONTACT_INFO = "mailto=gg66@student.london.ac.uk";

/*
  It would be the polite thing to do, however some browsers
  refuse to set the user-agent

  https://github.com/axios/axios/issues/1231

  For now, we disable it
*/
// const REQUEST_CONFIG = {
//   headers: {
//     "content-Type": "application/json",
//     "user-agent": CONTACT_INFO
//     // "Accept": "/",
//     // "Cache-Control": "no-cache",
//     // "Cookie": document.cookie
//   }
// };
const REQUEST_CONFIG = {};

// development mode proxying
// const API_URL = "/cr";

/*
  Helper functions
*/

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

  if ("DOI" in found) {
    entry.doi = found.DOI.toLowerCase();
  }

  if ("author" in found) {
    entry.author = (authorList => {
      var authors = [];
      authorList.forEach(author => {
        var fullAuthorName = "";
        if (author.family) {
          fullAuthorName = author.family;
        }
        if (author.given) {
          fullAuthorName += " " + author.given;
        }
        authors.push(fullAuthorName);
      });
      return authors.join(", ");
    })(found.author);
  }

  if ("title" in found) {
    if (found.title.length > 0) {
      entry.title = found.title[0];
    }
  }

  if ("URL" in found) {
    entry.link = found.URL;
  }

  if ("issued" in found) {
    entry.year = parseInt(found["issued"]["date-parts"][0][0], 10);
  }

  // flatten and chain the list of identifiers
  if ("issn-type" in found) {
    entry.source_id = found["issn-type"]
      .map(i => i.type + ": " + i.value)
      .join("; ");
  } else if ("" in found) {
    entry.source_id = found["isbn-type"]
      .map(i => i.type + ": " + i.value)
      .join("; ");
  }

  if ("container-title" in found) {
    if (found["container-title"].length > 0) {
      entry.source_title = found["container-title"][0];
    }
  }

  if ("volume" in found) {
    entry.volume = found["volume"];
  }

  if ("journal-issue" in found) {
    entry.issue = found["journal-issue"]["issue"];
  }

  if ("reference" in found) {
    found.reference.forEach(r => {
      if ("DOI" in r) {
        entry.reference.push(r.DOI.toLowerCase());
      }
    });
  }

  if ("type" in found) {
    entry.source_type = found["type"];
  }

  // filter out duplicates
  entry.reference = Array.from(new Set(entry.reference));

  if ("page" in found) {
    entry.page = found.page;
  }

  if ("abstract" in found) {
    // abstracts are in encoded jats format
    // being blunt here
    entry.abstract = found.abstract
      .replace(/<\/*jats:p>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }
  // crossref publishes amount of articles deposited by publisher
  // even when references are not made public
  if ("source" in found) {
    entry.providerdata = {};
    var providerdata = {};
    providerdata.reference_reported = 0;
    providerdata.reference_found = 0;
    providerdata.citation_reported = 0;
    providerdata.citation_found = 0;
    if ("reference-count" in found) {
      providerdata.reference_reported = found["reference-count"];
      providerdata.reference_found = entry.reference.length;
    }
    if ("is-referenced-by-count" in found) {
      providerdata.citation_reported = found["is-referenced-by-count"];
    }
    entry.providerdata[found.source] = providerdata;
  }

  return entry;
}

const actions = {
  getOne(context, doi) {
    return Vue.http
      .get(API_URL + doi, REQUEST_CONFIG)
      .then(response => {
        if (response) {
          return cleanUp(response.data.message);
        }
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
