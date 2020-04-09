import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      children: [
        {
          path: "",
          name: "ArticleList",
          component: require("@/components/ArticleList").default
        },
        {
          path: "references/:doi",
          name: "ReferenceList",
          component: require("@/components/ReferenceList").default
        }
      ],
      component: require("@/views/Main").default
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
