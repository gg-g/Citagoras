/* Vue component Parent component of TabContent */
<template>
  <div>
    <!-- Navigation bar -->
    <nav class="navbar has-background-grey-lighter">
      <div class="navbar-menu">
        <div class="navbar-start">
          <!-- Show back button to article list -->
          <div class="navbar-item">
            <b-tooltip label="Go back to article list" position="is-right">
              <b-button class="is-link" @click="backToArticleList">
                <i class="fas fa-step-backward"></i> Back to Article List
              </b-button>
            </b-tooltip>
          </div>
          <div class="navbar-item">
            <b-dropdown hoverable aria-role="list">
              <button class="button is-primary" slot="trigger">
                <span>
                  History
                  <i class="fas fa-caret-down"></i>
                </span>
              </button>

              <b-dropdown-item
                v-for="(item, index) in Array.from(getBreadcrumbs())"
                :key="index"
                has-link
                aria-role="listitem"
              >
                <b-tooltip
                  multilined
                  :label="breadCrumbToolTip(item)"
                  position="is-right"
                >
                  <router-link
                    :to="{ name: 'ReferenceList', params: { doi: item } }"
                  >
                    {{ item }}
                  </router-link>
                </b-tooltip>
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <div class="navbar-item">
        <div class="container is-size-5 	">
          {{ article.title }} -- {{ article.author }}
        </div>
      </div>
    </nav>

    <!-- Two tabs for References and Citations -->
    <b-tabs type="is-toggle is-small" expanded>
      <!-- References -->
      <b-tab-item>
        <template slot="header">
          <b-tag rounded>{{ article.reference.length }}</b-tag>
          <i class="fas fa-angle-double-left"></i>
          <span>Quoting</span>
        </template>
        <keep-alive>
          <TabContent :dois="article.reference"></TabContent>
        </keep-alive>
      </b-tab-item>

      <!-- Citations -->
      <b-tab-item>
        <template slot="header">
          <span>Quoted By</span>
          <i class="fas fa-angle-double-right"></i>
          <b-tag rounded>{{ article.citation.length }}</b-tag>
        </template>
        <keep-alive>
          <TabContent :dois="article.citation"></TabContent>
        </keep-alive>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from "vuex";
import TabContent from "@/components/TabContent.vue";

export default {
  name: "ReferenceList",
  mixins: [],
  components: {
    TabContent
  },
  data() {
    return {
      article: {
        reference: [],
        citation: []
      }
    };
  },
  created() {
    var doi = this.$route.params.doi;
    this.article = this.getArticle(doi);
    this.addBreadcrumb(doi);
  },
  computed: {
    ...mapState(["breadcrumbs"]),
    ...mapGetters([
      "getArticle",
      "getCacheEntry",
      "checkCache",
      "getBreadcrumbs"
    ])
  },
  methods: {
    ...mapMutations(["addBreadcrumb"]),
    breadCrumbGo(doi) {
      this.$router.push({ name: "ReferenceList", params: { doi: doi } });
    },
    backToArticleList() {
      this.$router.push({ name: "ArticleList" });
    },
    breadCrumbToolTip(doi) {
      if (this.checkCache(doi)) {
        var cachee = this.getCacheEntry(doi);
        return cachee.title + " - " + cachee.author;
      }
    }
  }
};
</script>
