/* Vue component given an article object displays a file card with all details
if an attribute is not available, show whitespace */
<template>
  <div>
    <article class="media">
      <!-- Show add and download button -->
      <figure class="media-left">
        <div v-if="checkArticle(article.doi)">
          <p class="button_p">
            <b-tooltip
              label="Explore references and citations for this article"
              position="is-right"
            >
              <b-button class="is-link" @click="openReferences(article.doi)">
                <i class="fas fa-shoe-prints"></i>
              </b-button>
            </b-tooltip>
          </p>
        </div>
        <div v-if="!checkArticle(article.doi)">
          <p class="button_p">
            <b-tooltip label="Add article" position="is-right">
              <b-button
                class="is-link"
                :disabled="checkArticle(article.doi)"
                @click="addArticle(article.doi)"
              >
                <i class="fas fa-plus"></i>
              </b-button>
            </b-tooltip>
          </p>
        </div>
        <p class="button_p">
          <b-tooltip label="View online copy" position="is-right">
            <b-button
              class="is-link"
              :disabled="article.link === ''"
              @click="openInBrowser(article.link)"
            >
              <i class="fas fa-file-download"></i>
            </b-button>
          </b-tooltip>
        </p>

        <p class="button_p">
          <b-tooltip label="View CrossRef Entry" position="is-right">
            <b-button
              class="is-link"
              @click="openInBrowser(crossRefApiLink + article.doi)"
              >CR</b-button
            >
          </b-tooltip>
        </p>

        <p class="button_p">
          <b-tooltip label="View OpenCitations Entry" position="is-right">
            <b-button
              class="is-link"
              @click="openInBrowser(openCitationsApiLink + article.doi)"
              >OC</b-button
            >
          </b-tooltip>
        </p>

        <p class="button_p">
          <b-tooltip label="View Discrepancy Report" position="is-right">
            <b-button class="is-link" @click="isDiscrepancyDialogVisible = true"
              ><i class="fas fa-balance-scale"></i
            ></b-button>
          </b-tooltip>
        </p>
        <!-- 
        <p class="button_p">
        <b-tooltip label="Reload data for this article" position="is-right">
          <b-button
            class="is-warning"
            @click="reloadArticle(article.doi)"
            ><i class="fas fa-redo"></i></b-button
          >
        </b-tooltip>
      </p> -->
      </figure>
      <!-- Show data of expanded article -->
      <div class="media-content">
        <div class="content">
          <div class="box">
            <div class="columns">
              <div class="column is-2">
                <p>Publication:</p>
                <p>Type:</p>
                <p>Identifier:</p>
                <p>Volume:</p>
                <p>Issue:</p>
                <p>Page:</p>
                <p>DOI:</p>
                <p>Citation Count:</p>
                <p>Reference Count:</p>
              </div>
              <div class="column is-4">
                <p>{{ article.source_title || "&nbsp;" }}</p>
                <p>{{ article.source_type || "&nbsp;" }}</p>
                <p>{{ article.source_id || "&nbsp;" }}</p>
                <p>{{ article.volume || "&nbsp;" }}</p>
                <p>{{ article.issue || "&nbsp;" }}</p>
                <p>{{ article.page || "&nbsp;" }}</p>
                <p>{{ article.doi || "&nbsp;" }}</p>
                <p>{{ article.citation.length || "&nbsp;" }}</p>
                <p>{{ article.reference.length || "&nbsp;" }}</p>
              </div>
              <div>
                <p v-html="article.abstract"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="media-right">
        <div v-if="checkArticle(article.doi)">
          <p class="button_p">
            <b-tooltip
              label="Delete article from list"
              position="is-left"
              type="is-danger"
            >
              <b-button class="is-danger" @click="removeArticle(article.doi)">
                <i class="fas fa-trash"></i>
              </b-button>
            </b-tooltip>
          </p>
        </div>
      </div>
    </article>

    <!-- model dialog box for discrepancy report -->
    <b-modal
      :active.sync="isDiscrepancyDialogVisible"
      :width="640"
      scroll="keep"
    >
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Discrepancy Report</p>
        </header>
        <section class="modal-card-body">
          <div v-for="(data, provider) in article.providerdata" :key="provider">
            <b-field horizonal :label="provider"></b-field>
            <div class="box">
              <div class="columns">
                <div class="column">
                  <p>Reference Reported:</p>
                  <p>Reference Found:</p>
                  <p>Citation Reported:</p>
                  <p>Citation Found:</p>
                </div>
                <div class="column">
                  <p>{{ data.reference_reported || "&nbsp;" }}</p>
                  <p>{{ data.reference_found || "&nbsp;" }}</p>
                  <p>{{ data.citation_reported || "&nbsp;" }}</p>
                  <p>{{ data.citation_found || "&nbsp;" }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot buttons is-right">
          <b-button @click="isDiscrepancyDialogVisible = false">Close</b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import electron from "@/mixins/electron";

export default {
  name: "DetailsCard",
  props: ["article"],
  mixins: [electron],
  data() {
    return {
      isDiscrepancyDialogVisible: false
    };
  },
  computed: {
    ...mapGetters(["checkArticle"]),
    crossRefApiLink: function() {
      return this.$electronstore.get("crossRefApi");
    },
    openCitationsApiLink: function() {
      return this.$electronstore.get("openCitationsApi");
    }
  },
  methods: {
    ...mapActions(["addArticle", "removeArticle"]),
    ...mapMutations(["wipeBreadcrumbs"]),
    openReferences(doi) {
      this.wipeBreadcrumbs;
      this.$router.push({ name: "ReferenceList", params: { doi: doi } });
    }
  }
};
</script>
