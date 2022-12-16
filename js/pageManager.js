import { NetworkError, ErrorHandler, log } from "./coreUtilities.js";
import { dataStorage } from "./dataStorage.js";

const pageManager = {
  target: null,
  page: null,
  init: () => {
    const attributes = pageManager.getHash();
    const body = document.getElementById("page-credits");
    if (body) {
      pageManager.loaderAdd("content");
      pageManager.get("credits");
      dataStorage.setSession("credit_query", attributes);
    } else {
      if (attributes.page) {
        pageManager.loaderAdd("content");
        pageManager.get(attributes.page);
        dataStorage.setSession("search_query", attributes);
      } else {
        pageManager.loaderAdd("content");
        pageManager.get("home");
        document.getElementById("navbar").classList.add("home");
      }
    }
  },
  get: (page, target = "content") => {
    pageManager.target = target;
    pageManager.page = page;
    if (page.length != 0) {
      pageManager.loaderAdd(target);
      pageManager.fetchPage(page);
    } else {
      new ErrorHandler(
        "<b>Something went wrong</b>",
        `${page} is empty`,
        "error"
      );
    }
  },
  getHash: () => {
    let hash = location.hash;
    let [_, type, page, query, pagination] = hash.split("/");

    return {
      type: type ?? false,
      page: page ?? false,
      query: query ?? false,
      pagination: pagination ?? false,
    };
  },
  set: (attributes, location = "") => {
    const base = "#",
      type = attributes.type ? `/${attributes.type}` : "",
      page = attributes.page ? `/${attributes.page}` : "",
      query = attributes.query ? `/${attributes.query}` : "",
      pagination = attributes.pagination ? `/${attributes.pagination}` : "";

    const url = `${type}${page}${query}${pagination}`;

    if (location) {
      window.location = `${location}${base}${type}${page}${query}${pagination}`;
    } else {
      window.location.hash = `${type}${page}${query}${pagination}`;
    }
    document.title = `Chillflix - ${toCaps(attributes.page)} ${toCaps(
      decodeURIComponent(attributes.query)
    )}`;
  },
  fetchPage: (page) => {
    const pageName = `${page}.html`;
    const path = "../sections/";

    fetch(`${path}${pageName}`)
      .then((response) => {
        if (response.status == 404) {
          throw new NetworkError("Page not found", response);
        } else if (!response.ok) {
          new ErrorHandler(
            "<b>Something went wrong</b>",
            `${response.statusText}`,
            "error"
          );
          throw new NetworkError("Failed page load", response);
        } else {
          return response.text();
        }
      })
      .then((html) => {
        const htmlParser = new DOMParser();
        let DOMhtml = htmlParser.parseFromString(html, "text/html");
        pageManager.insert(DOMhtml);

        return DOMhtml;
      })
      .then((content) => {
        const getTarget = document.getElementById(pageManager.target);
        const additionalFetch = getTarget.querySelectorAll("[data-fetch]");
        if (additionalFetch.length > 0) {
          additionalFetch.forEach((element) => {
            let id = pageManager.genID();
            let target = element.dataset.fetch;
            element.setAttribute("id", id);
            pageManager.get(target, id);
          });
        }
        return content;
      })
      .then(() => {
        pageManager.loaderRemove(pageManager.target);
      })
      .catch((error) => {
        new ErrorHandler(
          "<b>Something went wrong</b>",
          `${path}${pageName} ${error}`,
          "error"
        );
        throw new NetworkError("Failed getting template", error);
      });
  },
  insert: (html) => {
    const content = document.getElementById(pageManager.target);
    content.innerHTML = html.body.innerHTML;
    pageManager.triggerEvent();
  },
  triggerEvent: () => {
    const contentAdded = new CustomEvent("contentLoaded", {
      detail: {
        target: pageManager.target,
        element: pageManager.page,
      },
    });
    document.dispatchEvent(contentAdded);
  },
  pagination: (results) => {
    const totalPages = results.total_pages;
    const currentPage = results.page;
    const htmlTarget = document.getElementById("pagination");

    document.querySelector(".total-results .num").innerHTML =
      results.total_results;
    document.querySelector(".total-pages .start").innerHTML = currentPage;
    document.querySelector(".total-pages .end").innerHTML = totalPages;

    if (totalPages > 1) {
      const ulPag = document.createElement("ul");
      ulPag.classList.add("pagination");
      for (let i = 1; i <= totalPages; i++) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        item.classList.add("pagination-item");

        if (currentPage == i) {
          item.classList.add("active");
          link.innerHTML = `<span class="sr-only">Page </span>${i}<span class="sr-only"> of ${totalPages}. Current page</span>`;
        } else {
          link.innerHTML = `<span class="sr-only">Page </span>${i}<span class="sr-only"> of ${totalPages}</span>`;
        }

        const hash = pageManager.getHash();
        const path = `./#/${hash.type}/${hash.page}/${hash.query}${
          i == 1 ? "" : `/${i}`
        }`;

        link.setAttribute("href", path);
        item.append(link);
        ulPag.append(item);
      }

      htmlTarget.innerHTML = ulPag.outerHTML;
    }
  },
  genID: () => {
    const randID = (Math.random() + 1).toString(36).substring(7);
    return randID;
  },
  loaderAdd: (target) => {
    let targetElmt = document.getElementById(target);
    targetElmt.classList.add("loading-ctn");
  },
  loaderRemove: (target) => {
    let targetElmt = document.getElementById(target);
    targetElmt.classList.remove("loading-ctn");
  },
};

export { pageManager };
function toCaps(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
