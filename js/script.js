import { NetworkError, ErrorHandler, log } from "./coreUtilities.js";
import { pageManager } from "./pageManager.js";
import { moviesAPI } from "./moviesAPI.js";
import { search } from "./search.js";

document.addEventListener(
  "DOMContentLoaded",
  () => {
    pageManager.get("home");
    window.addEventListener("popstate", function (event) {
      // Log the state data to the console
      console.log(event.state);
      console.log(event);
    });

    document.addEventListener("contentLoaded", (event) => {
      const page = event.detail.element;
      log(page);
      switch (page) {
        case "form":
          search.init();
          break;
        default:
          break;
      }
    });
  },
  false
);

// const catOS = {
//   init: () => {
//     catOS.getCATegory();
//     catOS.changeListen("meow-input");
//   },
//   changeListen: (element) => {
//     const selectCAT = document.getElementById(element);
//     selectCAT.addEventListener("change", function (e) {
//       document.getElementById("content").classList.add("fadeout");
//       document.getElementById("content").classList.remove("fadein");
//       const selectValue = selectCAT.options[selectCAT.selectedIndex].value;

//       if (selectValue != "false") {
//         catOS.loader(true);
//         catOS.fetchCats(selectValue);
//       } else {
//         document.querySelector(".banner").classList.remove("active");
//         document.querySelector(".banner-bx").classList.remove("expanded");
//       }
//     });
//   },
//   getCATegory: () => {
//     fetch("https://api.thecatapi.com/v1/categories")
//       .then((response) => {
//         if (!response.ok) throw new NetworkError("Failed API Call", response);
//         return response.json();
//       })
//       .then((data) => {
//         catOS.populateSelect(data);
//       })
//       .catch((error) => {
//         new ErrorHandler("<b>Something went wrong</b>", error, "error");
//       });
//   },
//   populateSelect: (data) => {
//     const list = document.getElementById("meow-input");
//     const defaultOption = list.querySelector("option[disable][selected]");

//     let categoryOptions = data
//       .map((obj) => {
//         return `
//             <option value="${obj.id}">${toCapitalize(obj.name)}</option>`;
//       })
//       .join("");

//     list.innerHTML = categoryOptions;
//     list.prepend(defaultOption);

//     return list;
//   },
//   fetchCats: (id) => {
//     document.getElementById("content").classList.remove("fadein");

//     const params = {
//       api_key:
//         "live_6nEeyAzxtyl479OCezMzCeNUZIWtBs6ZwBEgbgubHzuMc8IoHLxBqZn0VhCoU8aQ",
//       size: "medium",
//       mime_types: "jpg",
//       format: "json",
//       order: "RANDOM",
//       limit: 12,
//       category_ids: id,
//     };

//     const url = `https://api.thecatapi.com/v1/images/search?api_key=${params.api_key}&size=${params.size}&mime_types=${params.mime_types}&format=${params.format}&order=${params.order}&limit=${params.limit}&category_ids=${params.category_ids}`;

//     fetch(url)
//       .then((response) => {
//         if (!response.ok) throw new NetworkError("Failed API Call", response);
//         return response.json();
//       })
//       .then((data) => {
//         let cats = catOS.displayFelines(data);
//         catOS.animate();
//         catOS.insetInPage(cats);
//       })
//       .catch((error) => {
//         new ErrorHandler("<b>Something went wrong</b>", error, "error");
//       });
//   },
//   displayFelines: (data) => {
//     const cards = document.createElement("div");
//     cards.classList.add("row");
//     cards.classList.add("card-container");

//     let CATS = data
//       .map((obj) => {
//         let catName = catOS.getCatName(obj.id);
//         return `
//           <div class="card col-sm-12 col-md-3 col-lg-4">
//             <img src="${obj.url}" class="card-img-top" alt="Cat Name: ${catName}">
//             <div class="card-body">
//               <p class="card-text">${catName}</p>
//             </div>
//           </div>`;
//       })
//       .join("");

//     cards.innerHTML = CATS;

//     return cards;
//   },
//   insetInPage: (element) => {
//     let content = document.getElementById("content");
//     content.innerHTML = "";
//     content.append(element);
//     setTimeout(() => {
//       content.classList.remove("fadeout");
//       content.classList.add("fadein");
//       catOS.loader(false);
//     }, 1700);
//   },
//   getCatName: (catID) => {
//     let catNames = localStorage.getItem("catNames")
//       ? JSON.parse(localStorage.getItem("catNames"))
//       : {};
//     let name;
//     if (Object.keys(catNames).length != 0) {
//       name = catNames[catID];
//     }

//     if (!name) {
//       name = pickRandomName();
//       catNames[catID] = name;
//       localStorage.setItem("catNames", JSON.stringify(catNames));
//     }

//     return name;
//   },
//   animate: () => {
//     setTimeout(function () {
//       let elmt = document.querySelector(".banner");
//       elmt.classList.add("active");

//       setTimeout(() => {
//         let elmtD = document.querySelector(".banner-bx");
//         elmt.classList.add("expanded");
//       }, 1800);
//     }, 1000);
//   },
//   loader: (action) => {
//     if (action) {
//       document.querySelector(".loading").classList.add("active");
//     } else {
//       document.querySelector(".loading").classList.remove("active");
//     }
//   },
// };

// function toCapitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }
