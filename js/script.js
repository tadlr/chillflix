import { NetworkError, ErrorHandler, log } from "./coreUtilities.js";
import { pageManager } from "./pageManager.js";
import { moviesAPI } from "./moviesAPI.js";
import { search } from "./search.js";

document.addEventListener(
  "DOMContentLoaded",
  () => {
    pageManager.init();

    window.addEventListener("popstate", function (event) {
      pageManager.init();
    });

    document.addEventListener("contentLoaded", (event) => {
      const page = event.detail.element;

      switch (page) {
        case "home":
          moviesAPI.getFeatured("movie");
          search.init();
          break;
        case "search":
          moviesAPI.init();
          search.init();
          break;
        case "credits":
          moviesAPI.getItem();

          search.init("/");
          break;
      }
    });
  },
  false
);
