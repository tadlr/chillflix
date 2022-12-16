import { ErrorHandler } from "./coreUtilities.js";
import { pageManager } from "./pageManager.js";
import { dataStorage } from "./dataStorage.js";

const search = {
  form: null,
  init: (location = false) => {
    search.form = document.getElementById("search-form");
    const query = pageManager.getHash();
    const body = document.getElementById("page-credits");
    if (query && !body) {
      const searchValue = query.query ? decodeURIComponent(query.query) : false;
      const type = query.type ?? false;
      if (searchValue) search.form.querySelector("#search").value = searchValue;
      if (type) search.form.querySelector("#" + type).checked = true;
    }

    search.listenForm(location);
  },
  listenForm: (location) => {
    const form = search.form;
    search.form.querySelector("#search-btn").disabled = false;

    // const verifySearch = dataStorage.getSession("is_search");
    // if (verifySearch) {
    //   dataStorage.deleteSession("is_search");
    // } else {
    if (form) {
      form.addEventListener("submit", function (evt) {
        evt.preventDefault();
        const data = search.formData();
        pageManager.loaderAdd("content");
        pageManager.set(
          {
            page: "search",
            type: data.get("kind"),
            query: encodeURIComponent(data.get("search")),
          },
          location
        );
        pageManager.loaderRemove("content");
        dataStorage.setSession("is_search", true);
      });
    } else {
      new ErrorHandler(
        "<b>Something went wrong</b>",
        `The form is not valid`,
        "error"
      );
    }
    // }
  },
  formData: () => {
    var formData = new FormData(search.form);
    return formData;
  },
};

export { search };
