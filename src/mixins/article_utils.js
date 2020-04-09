/*
  Functions we use on an array of articles
  Used in multiple components
*/
export default {
  methods: {
    /*
      given a list of articles
      return maxYear
    */
    getMaxYear(articles) {
      var maxYear = Number.MAX_VALUE;
      articles.forEach(article => {
        if (!Number.isNaN(article.year)) {
          if (maxYear === Number.MAX_VALUE || article.year > maxYear) {
            maxYear = article.year;
          }
        }
      });
      return maxYear;
    },
    /*
      given a list of articles
      return minYear
    */
    getMinYear(articles) {
      var minYear = Number.MIN_VALUE;
      articles.forEach(article => {
        if (!Number.isNaN(article.year)) {
          if (minYear === Number.MIN_VALUE || article.year < minYear) {
            minYear = article.year;
          }
        }
      });
      return minYear;
    },
    /*
      given list of articles
      return set of source_types
    */
    getSourceTypes(articles) {
      var sourceTypes = new Set();
      articles.forEach(article => {
        if (article.source_type) {
          sourceTypes.add(article.source_type);
        }
      });

      return sourceTypes;
    }
  }
};
