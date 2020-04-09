/* Vue component */
<template>
  <div>
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

    <!-- Only show when there is something to display -->
    <div v-if="timelineItems.length > 0">
      <!-- Graph Controls -->
      <div class="columns">
        <div class="column">
          <b-tooltip label="Split into quantiles" position="is-right">
            <b-field horizontal label="Quantiles" custom-class="is-small">
              <b-select
                v-model="quantiles"
                size="is-small"
                @input="timelineShowAllGroups"
              >
                <option>1</option>
                <option>2</option>
                <option selected>3</option>
                <option>4</option>
              </b-select>
            </b-field>
          </b-tooltip>
        </div>
        <div class="column">
          <!-- Show checkboxes to show different groups -->
          <div v-if="groups.length > 1">
            <b-field horizontal label="Show/Hide" custom-class="is-small">
              <div v-for="item in groups" :key="item.id">
                <b-checkbox
                  :native-value="item.class"
                  v-model="quantilesVisible"
                  size="is-small"
                  @input="$refs.timeline.redraw()"
                  >{{ item.content }}</b-checkbox
                >
              </div>
            </b-field>
          </div>
        </div>
        <div class="column is-one-fifth" />
        <div class="column">
          <b-tooltip label="Order by ranking in count" position="is-right">
            <b-field horizontal label="Ranking" custom-class="is-small">
              <b-select v-model="rankingValue" size="is-small">
                <option selected>Citations</option>
                <option>References</option>
              </b-select>
            </b-field>
          </b-tooltip>
        </div>

        <div class="column is-one-fifth">
          <b-button
            class="is-pulled-right"
            @click="timelineFitGraph"
            size="is-small"
            >Fit</b-button
          >
          <b-button
            class="is-pulled-right"
            @click="timelineZoomInGraph"
            size="is-small"
            >Zoom In</b-button
          >
          <b-button
            class="is-pulled-right"
            @click="timelineZoomOutGraph"
            size="is-small"
            >Zoom Out</b-button
          >
        </div>
      </div>
      <!-- Timeline Graph -->
      <timeline
        ref="timeline"
        :key="forceRender"
        :items="timelineItems"
        :groups="groups"
        :options="options"
        @select="timelineSelect"
        @double-click="timelineDoubleClick"
      ></timeline>
    </div>

    <div style="margin-top:10px;">
      <ArticleTable
        :key="forceRender"
        :highlightArticle="highlightArticle"
        :articles="filteredArticles"
        defaultSortDirection="ASC"
        defaultSort="title"
        @selectedArticleChanged="timelineSetSelection"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import ArticleTable from "@/components/ArticleTable.vue";
import utils from "@/mixins/utils";
import article_utils from "@/mixins/article_utils";

export default {
  name: "TabContent",
  props: {
    dois: Array
  },
  components: {
    ArticleTable
  },
  mixins: [article_utils, utils],
  data() {
    return {
      loading: false,
      stringToSearch: "",

      filterMinYear: Number.MIN_VALUE,
      filterMaxYear: Number.MAX_VALUE,

      rankingValue: "Citations",
      quantiles: 3,
      quantilesVisible: [],
      selectedSourceType: "",
      highlightArticle: {},
      forceRender: 0,

      contentTypes: {
        default: {
          present: '<i class="fas fa-file"></i>',
          absent: '<i class="far fa-file"></i>'
        },
        book: {
          present: '<i class="fas fa-book"></i>',
          absent: '<i class="fas fa-book"></i>'
        },
        article: {
          present: '<i class="fas fa-file"></i>',
          absent: '<i class="far fa-file"></i>'
        }
      }
    };
  },
  created() {
    this.timelineShowAllGroups();
    this.filterMinYear = this.minYear;
    this.filterMaxYear = this.maxYear;
  },
  computed: {
    ...mapState(["selectedArticle"]),
    ...mapGetters(["checkArticle", "getFilteredCache", "getCacheEntry"]),
    maxYear: function() {
      return this.getMaxYear(this.getFilteredCache(this.dois));
    },
    minYear: function() {
      return this.getMinYear(this.getFilteredCache(this.dois));
    },
    sourceTypes: function() {
      return this.getSourceTypes(this.getFilteredCache(this.dois));
    },
    options: function() {
      return {
        timeAxis: { scale: "year" },
        order: this.timelineSort,
        selectable: true,
        editable: {
          add: false,
          updateTime: false,
          updateGroup: false,
          remove: false,
          overrideItems: true
        },
        minHeight: "300px",
        min: new Date(this.filterMinYear - 1, 0, 1),
        max: new Date(this.filterMaxYear + 2, 0, 1)
      };
    },

    /*
      Dynamically creates groups based on quantiles; max 4
    */
    groups: function() {
      var groupList = [];
      for (var q = 1; q <= this.quantiles; q++) {
        var id = this.quantiles - q + 1;
        groupList.push({
          id: id,
          content: Math.ceil((q / this.quantiles) * 100) + "%",
          factor: q / this.quantiles,
          class: "group" + id,
          visible: this.quantilesVisible.includes("group" + id)
        });
      }
      return groupList;
    },
    filteredArticles: function() {
      var filteredList = [];
      var regex = new RegExp(this.stringToSearch, "i");
      this.getFilteredCache(this.dois).forEach(article => {
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
    },
    timelineItems: function() {
      var timelineItems = this.copyObject(this.filteredArticles);

      // prepare for grouping
      timelineItems.sort(this.timelineSort);

      // create array of quantile cutoffs
      var quantilePositions = this.groups.map(a =>
        Math.floor(a.factor * (timelineItems.length + 1))
      );
      var quantilePositionsPointer = 0;

      for (var t = 0; t < timelineItems.length; t++) {
        // quantilePositionsPointer point to index of next quantile
        // if equal to t, we shift to the next quantile
        if (t === quantilePositions[quantilePositionsPointer]) {
          quantilePositionsPointer++;
        }
        timelineItems[t].group = this.groups[quantilePositionsPointer].id;
        timelineItems[t].start = new Date(timelineItems[t].year, 0, 1);
        timelineItems[t].id = timelineItems[t].doi;
        this.timelineItemFillContent(timelineItems[t]);
      }

      this.timelineSetWindow(this.filterMinYear, this.filterMaxYear);

      return timelineItems;
    }
  },
  methods: {
    ...mapActions(["addArticle", "getOne"]),
    ...mapMutations(["setSelectedArticle"]),
    resetFilterYears() {
      this.filterMinYear = this.minYear;
      this.filterMaxYear = this.maxYear;
    },
    timelineShowAllGroups() {
      this.quantilesVisible = ["group1", "group2", "group3", "group4"];
    },
    timelineSort(a, b) {
      if (this.rankingValue === "Citations") {
        return a.citation.length - b.citation.length;
      } else {
        return a.reference.length - b.reference.length;
      }
    },
    /*
      sets content and colour of timeline item
      depending on its status and type
    */
    timelineItemFillContent(timelineItem) {
      // fill in tooltip
      timelineItem.title =
        "<p>" +
        timelineItem.title +
        "</p><p>" +
        timelineItem.author +
        "</p><p>Citations: " +
        timelineItem.citation.length +
        "</p><p>References: " +
        timelineItem.reference.length +
        "</p>";
      // check presence in article list
      var presence = "";
      if (this.checkArticle(timelineItem.doi)) {
        presence = "present";
        timelineItem.className = "group" + timelineItem.group + "_present";
      } else {
        presence = "absent";
        timelineItem.className = "group" + timelineItem.group;
      }
      // determine sourcetype for icon
      var sourceType = "";
      if (timelineItem.source_type) {
        this.sourceTypes.add(timelineItem.source_type);
        sourceType = timelineItem.source_type;
      } else {
        sourceType = "default";
      }
      switch (true) {
        case /book/.test(sourceType):
          timelineItem.content = this.contentTypes["book"][presence];
          break;
        case /article/.test(sourceType):
          timelineItem.content = this.contentTypes["article"][presence];
          break;
        default:
          timelineItem.content = this.contentTypes["default"][presence];
          break;
      }
    },

    /*
      Graph node actions
    */

    // select the selected article on the graph
    timelineSetSelection(event) {
      this.$refs.timeline.setSelection(event.doi, { focus: false });
    },

    // highlight the selected graph node in the table
    timelineSelect(selection) {
      if (selection.items.length !== 0) {
        var selectedDoi = selection.items[0];
        this.setSelectedArticle(this.getCacheEntry(selectedDoi));
        this.highlightArticle = this.getCacheEntry(selectedDoi);
      }
    },
    /*
      If user double-clicks a timeline item,
      then the corresponding article will be added
    */
    timelineDoubleClick(doubleClick) {
      if (doubleClick.item) {
        if (!this.checkArticle(doubleClick.item)) {
          this.addArticle(doubleClick.item);
        }
      }
    },

    /*
      Graph zoom controls
    */

    timelineFitGraph() {
      this.$refs.timeline.fit();
    },
    timelineZoomInGraph() {
      this.$refs.timeline.zoomIn(0.2);
    },
    timelineZoomOutGraph() {
      this.$refs.timeline.zoomOut(0.2);
    },
    timelineSetWindow(lower, upper) {
      if (this.$refs.timeline) {
        this.$refs.timeline.setOptions({
          min: new Date(lower - 1, 0, 1),
          max: new Date(upper + 2, 0, 1)
        });
        this.$refs.timeline.setWindow(
          new Date(lower - 1, 0, 1),
          new Date(upper + 2, 0, 1)
        );
      }
    },
    updateAllChildComponents() {
      this.forceRender++;
    }
  },
  watch: {
    /*
      Force redraw of timeline after quantilesVisible changes
      to flush stale visual artefacts
    */
    quantilesVisible() {
      this.updateAllChildComponents();
    }
  }
};
</script>
<style>
@import "~vue2vis/dist/vue2vis.css";
/*
  Override some defaults to make selection stand out more
 */
.vis-item.vis-selected {
  border-color: #7957d5;
  border-width: 3px;
}
.vis-item.vis-selected.vis-line {
  border-width: 3px;
  border-color: #7957d5;
}
.vis-item.vis-selected.vis-dot {
  border-color: #7957d5;
}
div.vis-tooltip {
  font-size: 13px;
  background-color: #7957d5;
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  font-family: "Helvetica", "Arial", sans-serif;
  color: #ffffff;
  border: 0px;
  margin: 5px;
}
.vis-timeline {
  overflow: unset !important;
}
.vis-item.group4 {
  background-color: #e2b822;
}
.vis-item.group3 {
  background-color: #e29822;
}
.vis-item.group2 {
  background-color: #e27822;
}
.vis-item.group1 {
  background-color: #e25822;
}
.vis-item.group4_present {
  background-color: #12bb00;
}
.vis-item.group3_present {
  background-color: #129b00;
}
.vis-item.group2_present {
  background-color: #127b00;
}
.vis-item.group1_present {
  background-color: #125b00;
}
</style>
