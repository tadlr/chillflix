import { log } from "./coreUtilities.js";
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
          moviesAPI.getFeatured("tv");
          search.init();
          break;
        case "search":
          document.getElementById("main-banner").classList.add("search");
          moviesAPI.init();
          search.init();
          break;
        case "credits":
          search.init("/");
          moviesAPI.getItem();
          break;
      }
    });

    const header = document.getElementById("navbar");
    window.onscroll = () => {
      let winPosition = window.pageYOffset;

      winPosition < 70
        ? header.classList.add("top")
        : header.classList.remove("top", "navbar-dark");

      winPrevPosition > winPosition
        ? (header.style.top = "0")
        : (header.style.top = "-150px");

      winPrevPosition = winPosition;
    };

    let winPrevPosition = window.pageYOffset;
    winPrevPosition < 70
      ? header.classList.add("top")
      : header.classList.remove("top");

    const toggle = document.querySelectorAll("[name=kind]");
    const banner = document.getElementById("main-banner");

    if (toggle.length > 0) {
      const label = document.getElementsByClassName("title-kind");
      toggle.forEach((item) => {
        item.addEventListener("change", () => {
          let value = item.value;

          banner.classList.remove("type-tv", "type-movies");
          banner.classList.add(`type-${value}`);

          const visibleMedia = document.querySelectorAll(
            ".featured--media.show"
          );

          visibleMedia.forEach((each) => {
            each.classList.remove("show");
          });

          const featured = document.getElementById(`featured-${value}`);

          if (featured) featured.classList.add("show");

          log(featured, visibleMedia);

          if (value == "tv") value = "tv shows";
          label[0].innerHTML = value;
        });
      });
    }

    //
  },
  false
);
