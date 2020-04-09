/* Vue component */
<template>
  <div>
    <!-- checkboxes to show/hide additional columns -->
    <section>
      <b-tooltip
        label="Check which additional columns to show or hide"
        position="is-right"
      >
        <b-field horizontal label="Show/Hide">
          <b-checkbox native-value="DOI" v-model="checkedColums"
            >DOI</b-checkbox
          >
          <b-checkbox native-value="References" v-model="checkedColums"
            >References</b-checkbox
          >
          <b-checkbox native-value="Citations" v-model="checkedColums"
            >Citations</b-checkbox
          >
          <b-checkbox native-value="Added" v-model="checkedColums"
            >Added</b-checkbox
          >
          <b-checkbox native-value="Abstract" v-model="checkedColums"
            >Abstract</b-checkbox
          >
        </b-field>
      </b-tooltip>
    </section>
    <section>
      <b-table
        ref="table"
        :data="articles"
        bordered
        narrowed
        detailed
        :key="forceRender"
        :loading="loading"
        :selected.sync="articleToSelect"
        :default-sort-direction="defaultSortDirectionValue"
        :default-sort="defaultSortValue"
        show-detail-icon
        :opened-detailed="defaultOpenedDetails"
        detail-key="doi"
        @details-open="row => closerOtherDetails(row)"
      >
        <template slot-scope="props">
          <b-table-column field="title" label="Title" sortable width="600">
            <div v-if="props.row.cacheMiss">
              <b-tooltip
                label="Not in cache; click to force download"
                position="is-right"
              >
                <b-button
                  class="is-warning"
                  size="is-small"
                  @click="getCacheMiss(props.row.doi)"
                >
                  <i class="fas fa-cloud-download-alt"></i>
                </b-button>
              </b-tooltip>
            </div>

            {{ props.row.title || "&nbsp;" }}
          </b-table-column>

          <b-table-column field="author" label="Author" sortable width="600">
            {{ props.row.author || "&nbsp;" }}
          </b-table-column>

          <b-table-column
            field="year"
            label="Year"
            width="100"
            sortable
            numeric
            centered
            >{{ props.row.year || "&nbsp;" }}</b-table-column
          >

          <b-table-column
            field="doi"
            label="DOI"
            sortable
            :visible="checkedColums.includes('DOI')"
            centered
            width="80"
            >{{ props.row.doi || "&nbsp;" }}</b-table-column
          >

          <b-table-column
            field="reference.length"
            label="R#"
            sortable
            :visible="checkedColums.includes('References')"
            centered
            numeric
            width="80"
            >{{ props.row.reference.length || "&nbsp;" }}</b-table-column
          >

          <b-table-column
            field="citation.length"
            label="C#"
            sortable
            :visible="checkedColums.includes('Citations')"
            centered
            numeric
            width="80"
            >{{ props.row.citation.length || "&nbsp;" }}</b-table-column
          >

          <b-table-column
            field="added"
            label="Added"
            :visible="checkedColums.includes('Added')"
            sortable
            centered
            :custom-sort="sortDate"
            width="250"
          >
            <div v-if="props.row.added">
              {{ new Date(props.row.added).toLocaleString("en-GB") }}
            </div>
          </b-table-column>
          <b-table-column
            field="abstract"
            label="Abstract"
            sortable
            :visible="checkedColums.includes('Abstract')"
            centered
            width="80"
            >{{ props.row.abstract ? "Available" : "&nbsp;" }}</b-table-column
          >
          <b-table-column
            :visible="false"
            field="select"
            label="select"
            numeric
            sortable
            >{{ props.row.select }}</b-table-column
          >
        </template>

        <!-- What to show if table is empty -->
        <template slot="empty">
          <section class="section">
            <div class="content has-text-grey has-text-centered">
              <p>
                <i class="fas fa-frown"></i>
              </p>
              <p>Nothing here.</p>
            </div>
          </section>
        </template>

        <!-- What to show if the row is expanded -->
        <template slot="detail" slot-scope="props">
          <DetailsCard v-bind:article="props.row" />
        </template>
      </b-table>
    </section>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import DetailsCard from "@/components/DetailsCard.vue";

export default {
  name: "ArticleTable",
  props: {
    articles: Array,
    defaultSortDirection: String,
    defaultSort: String,
    highlightArticle: Object
  },
  components: {
    DetailsCard
  },
  data() {
    return {
      defaultOpenedDetails: [],
      checkedColumnsValues: this.$electronstore.get("columnsVisible"),
      defaultSortDirectionValue: this.defaultSortDirection,
      defaultSortValue: this.defaultSort,
      forceRender: 0
    };
  },
  computed: {
    ...mapState(["selectedArticle", "downloading"]),

    articleToSelect: {
      get: function() {
        return this.selectedArticle;
      },
      /*
        if the article selection has changed
        let our parent component know about it
      */
      set: function(article) {
        if (!article.cacheMiss) {
          this.setSelectedArticle(article);
          this.$emit("selectedArticleChanged", article);
        }
      }
    },
    /*
      If a download has started/completed
      let our parent component know about it
    */
    loading: function() {
      if (this.downloading !== 0) {
        // something started loading
        this.$emit("startedLoading");
        return true;
      } else {
        this.$emit("endedLoading");
        return false;
      }
    },
    checkedColums: {
      /*
        Due to how Buefy handles checkboxes,
        we have to make use of a proxy variable
      */
      get: function() {
        return this.checkedColumnsValues;
      },
      set: function(value) {
        this.checkedColumnsValues = value;
        this.$electronstore.set("columnsVisible", this.checkedColumnsValues);
      }
    }
  },
  methods: {
    ...mapMutations(["setSelectedArticle"]),
    /*
      When table entry's details are opened
      close all others
    */
    closerOtherDetails(row) {
      this.defaultOpenedDetails = [row.doi];
    },
    /*
      Sort method for dates
      
      Inspired by
      
      https://github.com/buefy/buefy/issues/529
    */
    sortDate(a, b, isAsc) {
      if (isAsc) {
        return new Date(b.added).getTime() - new Date(a.added).getTime();
      } else {
        return new Date(a.added).getTime() - new Date(b.added).getTime();
      }
    },
    /*
      Notify parent that user clicked on an article which
      was not in cache
    */
    getCacheMiss(doi) {
      this.$emit("cacheMissArticleClicked", doi);
    }
  },
  watch: {
    /*
      Mostly used by the reference list component

      This will
          deselect all previously selected articles
          set the sort order of the ArticleTable to descending by select
          force a sort and rerender the table to make the article in question
          be the first
    */
    highlightArticle(articleToHighlight) {
      var prevSelection = this.articles.find(article => article.select === 1);
      if (prevSelection) {
        prevSelection.select = 0;
      }
      articleToHighlight.select = 1;
      this.defaultOpenedDetails = [articleToHighlight.doi];

      this.defaultSortDirectionValue = "DESC";
      this.defaultSortValue = "select";
      this.$refs.table.initSort();

      this.forceRender++;
    }
  }
};
</script>
