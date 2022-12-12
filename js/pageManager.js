import { NetworkError, ErrorHandler, log } from "./coreUtilities.js";
import { dataStorage } from "./dataStorage.js";
const pageManager = {
  target: null,
  page: null,
  init: () => {
    const attributes = pageManager.getHash();
    const body = document.getElementById("page-credits");
    if (body) {
      pageManager.get("credits");
      dataStorage.setSession("credit_query", attributes);
    } else {
      if (attributes.page) {
        pageManager.get(attributes.page);
        dataStorage.setSession("search_query", attributes);
      } else {
        pageManager.get("home");
      }
    }
  },
  get: (page, target = "content") => {
    pageManager.target = target;
    pageManager.page = page;
    if (page.length != 0) {
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
      attributes.query
    )}`;
  },
  fetchPage: (page) => {
    const pageName = `${page}.html`;
    const path = "/sections/";

    fetch(`${path}${pageName}`)
      .then((response) => {
        if (response.status == 404) {
          pageManager.get("404");
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
    if (totalPages > 1) {
      log(currentPage);
      // pageManager.fetchPage("pagination", "pagination");

      const path = "/sections/";

      fetch(`${path}pagination.html`)
        .then((response) => {
          if (response.status == 404) {
            pageManager.get("404");
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
          const content = document.getElementById("pagination");
          content.innerHTML = DOMhtml.body.innerHTML;

          return DOMhtml;
        })
        .then((content) => {})
        .catch((error) => {
          new ErrorHandler("<b>Something went wrong</b>", `${error}`, "error");
          throw new NetworkError("Failed getting template", error);
        });
    }
  },
  genID: () => {
    const randID = (Math.random() + 1).toString(36).substring(7);
    return randID;
  },
};

export { pageManager };
function toCaps(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
