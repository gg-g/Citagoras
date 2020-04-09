<template>
  <div>
    <!-- nav bar with add button -->
    <nav class="navbar has-background-grey-lighter">
      <div class="navbar-menu">
        <div class="navbar-end">
          <div class="navbar-item">
            <b-tooltip label="Enter a DOI to add an article" position="is-left">
              <b-button class="is-link" @click="isAddDialogVisible = true">
                <i class="fas fa-plus-circle"></i> Add DOI
              </b-button>
            </b-tooltip>
          </div>
        </div>
      </div>
    </nav>

    <!-- Article filtering controls -->
    <div class="columns">
      <div class="column is-one-third">
        <div v-if="filterMinYear !== Number.MIN_VALUE">
          <b-field horizontal label="Years" custom-class="is-small">
            <b-tooltip label="Adjust min and max year" position="is-right">
              <b-input
                style="width:5em;"
                type="number"
                v-model.number="filterMinYear"
                :min="minYear"
                :max="filterMaxYear"
                size="is-small"
              ></b-input>

              <b-input
                style="width:5em;"
                type="number"
                v-model.number="filterMaxYear"
                :min="filterMinYear"
                :max="maxYear"
                size="is-small"
              ></b-input>
            </b-tooltip>
            <b-tooltip label="Reset min and max year" position="is-right">
              <b-button @click="resetFilterYears" size="is-small"
                >Reset</b-button
              >
            </b-tooltip>
          </b-field>
        </div>
      </div>
      <div class="column is-one-third">
        <div v-if="sourceTypes.size !== 0">
          <b-tooltip
            label="Show selected source types"
            position="is-right"
            custom-class="is-small"
          >
            <b-field horizontal label="Types" custom-class="is-small">
              <b-select v-model="selectedSourceType" size="is-small">
                <option value>All</option>
                <option
                  v-for="sourceType in Array.from(sourceTypes)"
                  :value="sourceType"
                  :key="sourceType"
                  >{{ sourceType }}</option
                >
              </b-select>
            </b-field>
          </b-tooltip>
        </div>
      </div>
      <div class="column is-one-third">
        <b-field horizontal position="is-right">
          <b-input
            type="search"
            icon-pack="fas"
            size="is-small"
            icon="search"
            v-model="stringToSearch"
            placeholder="Search title or author..."
          />
        </b-field>
      </div>
    </div>

    <!-- Main Article Table -->
    <ArticleTable
      :articles="filteredArticles"
      defaultSortDirection="ASC"
      defaultSort="title"
      @endedLoading="resetFilters"
    />

    <!-- model dialog box to add a DOI -->
    <b-modal :active.sync="isAddDialogVisible" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Add a DOI</p>
        </header>
        <section class="modal-card-body">
          <b-field label="DOI">
            <b-input v-model="doiToFetch" minlength="2" required></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot buttons is-right">
          <b-button @click="isAddDialogVisible = false">Close</b-button>
          <b-button class="is-primary" @click="addDoi">Add</b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import ArticleTable from "@/components/ArticleTable.vue";
import utils from "@/mixins/utils";
import article_utils from "@/mixins/article_utils";

export default {
  name: "ArticleList",
  components: {
    ArticleTable
  },
  mixins: [article_utils, utils],
  data() {
    return {
      isAddDialogVisible: false,
      doiToFetch: "",
      stringToSearch: "",

      filterMinYear: Number.MIN_VALUE,
      filterMaxYear: Number.MAX_VALUE,

      selectedSourceType: ""
    };
  },
  created() {
    this.filterMinYear = this.minYear;
    this.filterMaxYear = this.maxYear;
  },
  computed: {
    ...mapState(["articles"]),
    ...mapGetters(["getArticle"]),
    maxYear: function() {
      return this.getMaxYear(this.articles);
    },
    minYear: function() {
      return this.getMinYear(this.articles);
    },
    sourceTypes: function() {
      return this.getSourceTypes(this.articles);
    },
    /*
      Main data retrieval function which feeds the table

      applies all possible filters
    */
    filteredArticles: function() {
      var filteredList = [];
      var regex = new RegExp(this.stringToSearch, "i");
      this.articles.forEach(article => {
        if (
          article.year <= this.filterMaxYear &&
          article.year >= this.filterMinYear &&
          (article.author.match(regex) ||
            article.title.match(regex) ||
            article.abstract.match(regex) ||
            article.source_title.match(regex)) &&
          article.source_type.match(this.selectedSourceType)
        ) {
          filteredList.push(article);
        }
      });
      return filteredList;
    }
  },
  methods: {
    ...mapActions(["addArticle"]),
    ...mapMutations(["setSelectedArticle"]),
    resetFilters() {
      this.resetFilterYears();
      this.stringToSearch = "";
      this.selectedSourceType = "";
    },
    resetFilterYears() {
      this.filterMinYear = this.minYear;
      this.filterMaxYear = this.maxYear;
    },
    /*
      After user clicks add in Add DOI dialog

      If the DOI is already in the Article List
        show a notification
        select/expand it
      If not
        white space trim the user entry
        add it
    */
    addDoi() {
      this.isAddDialogVisible = false;
      this.resetFilterYears();

      // trim whitespace
      this.doiToFetch = this.doiToFetch.trim();

      // catch users trying to enter an empty string
      if (this.doiToFetch === "") {
        this.toastWarning("I can't do much with an empty string");
      } else {
        // try to get the article
        var found = this.getArticle(this.doiToFetch);

        // if found, tell user and highlight article
        if (found) {
          this.toastGood("This DOI already exists in your bibliography");
          this.setSelectedArticle(found);
        } else {
          this.addArticle(this.doiToFetch).then(added => {
            this.setSelectedArticle(added);
          });
        }

        this.doiToFetch = "";
      }
    }
  }
};
</script>
