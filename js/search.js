import { NetworkError, ErrorHandler, log } from "./coreUtilities.js";
import { pageManager } from "./pageManager.js";
import { moviesAPI } from "./moviesAPI.js";

const search = {
  form: null,
  init: () => {
    search.form = document.getElementById("search");
    search.listenForm();
  },
  listenForm: () => {
    const form = search.form;
    if (form) {
      form.addEventListener("submit", function (evt) {
        evt.preventDefault();
        const data = search.formData();
        pageManager.set({
          page: "search",
          type: data.get("kind"),
          query: data.get("search"),
        });
      });
    } else {
      new ErrorHandler(
        "<b>Something went wrong</b>",
        `The form is not valid`,
        "error"
      );
    }
  },
  formData: () => {
    var formData = new FormData(search.form);
    return formData;
  },
};

export { search };
