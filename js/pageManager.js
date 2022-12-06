import { NetworkError, ErrorHandler, log } from "./coreUtilities.js";
const pageManager = {
  target: null,
  page: null,
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
  set: (attributes) => {
    log(attributes);
    const base = "#",
      page = attributes.page ? `/${attributes.page}` : "",
      type = attributes.type ? `/${attributes.type}` : "",
      query = attributes.query ? `/${encodeURI(attributes.query)}` : "";
    window.location.hash = `${page}${type}${query}`;
  },
  fetchPage: (page) => {
    const pageName = `${page}.html`;
    const path = "/sections/";

    fetch(`${path}${pageName}`)
      .then((response) => {
        if (!response.ok) {
          new ErrorHandler(
            "<b>Something went wrong</b>",
            `${path}${pageName} ${response.statusText}`,
            "error"
          );
          throw new NetworkError("Failed page load", response);
        }
        return response.text();
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
        throw new NetworkError("Failed getting template", response);
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
  genID: () => {
    const randID = (Math.random() + 1).toString(36).substring(7);
    return randID;
  },
};

export { pageManager };
