import { NetworkError, ErrorHandler, log } from "./coreUtilities.js";
import { dataStorage } from "./dataStorage.js";
import { pageManager } from "./pageManager.js";

const moviesAPI = {
  baseURL: "https://api.themoviedb.org",
  api_key: "c835c80ce6c6afeca4aad5839c1db9d3",
  movieSearchURL: null,
  tvSearchURL: null,
  movieCreditsURL: null,
  tvCreditsURL: null,
  init: () => {
    moviesAPI.movieSearchURL = `${moviesAPI.baseURL}/3/search/movie?api_key=${moviesAPI.api_key}`;
    moviesAPI.tvSearchURL = `${moviesAPI.baseURL}/3/search/tv?api_key=${moviesAPI.api_key}`;
    moviesAPI.search();
  },
  search: () => {
    const query = dataStorage.getSession("search_query");

    switch (query.type) {
      case "movies":
        moviesAPI.findMovies(query, "movie");
        break;
      case "tv":
        moviesAPI.findMovies(query, "tv");
        break;
    }
  },
  findMovies: (query, type) => {
    const pagination = query.pagination ? `&page=${query.pagination}` : "";
    let url;

    if (type == "movie") {
      url = `${moviesAPI.movieSearchURL}&query=${query.query}${pagination}`;
    } else if (type == "tv") {
      url = `${moviesAPI.tvSearchURL}&query=${query.query}${pagination}`;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          new ErrorHandler(
            "<b>Something went wrong</b>",
            `${response.statusText}`,
            "error"
          );
          throw new NetworkError("Failed page load", response);
        }
        return response.json();
      })
      .then((data) => {
        if (data.total_results == 0) {
          pageManager.get("no-results", "search-results");
        }
        const results = data.results;

        pageManager.set({
          type: query.type,
          page: query.page,
          query: query.query,
          pagination:
            data.total_pages > 1 && data.page >= 2 ? data.page : false,
        });

        return results;
      })
      .then((content) => {
        const cards = moviesAPI.build(content, type);
        return cards;
      })
      .then((cards) => {
        const results = document.getElementById("search-results");
        results.append(cards);
      })
      .catch((error) => {
        new ErrorHandler("<b>Something went wrong</b>", `${error}`, "error");
        throw new NetworkError("Failed fetching " + type, error);
      });
  },
  build: (data, kind, type = false) => {
    const cards = document.createElement("div");

    let html = data
      .map((obj, index) => {
        if (index > 5) return;
        const movieID = obj.id;
        let moviePoster = moviesAPI.getImage(obj.poster_path, "poster", "xx");
        if (!moviePoster) moviePoster = "../images/poster.svg";

        const date = new Date(obj.release_date).toLocaleDateString();
        const movieTitle = obj.original_title ?? obj.original_name;
        const rating = obj.vote_average;

        let ratingClass = "";

        if (rating <= 4) {
          ratingClass = "low-score";
        } else if (rating <= 7.4) {
          ratingClass = "average-score";
        } else if (rating >= 7.5) {
          ratingClass = "good-score";
        }

        if (type == "single") {
          cards.classList.add("card-wrapper");
          cards.classList.add("row");
          let movieBanner = moviesAPI.getImage(
            obj.backdrop_path,
            "backdrop",
            "lg"
          );
          if (!movieBanner) movieBanner = "../images/banner.svg";
          let genres = obj.genres
            .map((gen) => {
              return `<li>${gen.name}</li>`;
            })
            .join("");

          let prodCompanies = obj.production_companies
            .map((company) => {
              const logo = moviesAPI.getImage(company.logo_path, "logo", "lg");
              let companyInfo =
                logo != false
                  ? `<li><img src="${logo}" alt="${company.name} logo"></li>`
                  : `<li>${company.name}</li>`;
              return companyInfo;
            })
            .join("");

          let language = obj.spoken_languages
            .map((lang) => {
              return `<li>${lang.name}</li>`;
            })
            .join("");

          return `
          <div class="banner"><img src="${movieBanner}" alt="Banner of: ${movieTitle}"></div>
          <div class="card col-xs-12">
            <img src="${moviePoster}" alt="${kind} poster of: ${movieTitle}">
            <div class="card-body">
              <h3 class="title">${movieTitle} <span class="tagline">${obj.tagline}</span></h3>
              <p class="description">${obj.overview}</p>
              <p class="date">${date}</p>
              <p class="vote-count ${ratingClass}">${rating}</p>
              <ul>${genres}</ul>
              <ul>${prodCompanies}</ul>
              <ul>${language}</ul>
            </div>
          </div>`;
        } else if (type == "featured") {
          cards.classList.add("d-flex");

          return `
          <div class="d-flex align-items-stretch">
          <div class="card h-100">
          <div class="card-header">
          
          <a href="/credits/#/${kind}/${movieID}"><img src="${moviePoster}" class="card-img-top" alt="${kind} poster of: ${movieTitle}"></a>
          
          </div>
          
              <div class="card-footer bg-light">
              <div class="d-grid gap-2">

              <span data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top"
            data-bs-content="${movieTitle}" data-bs-trigger="hover focus">
              <a href="/credits/#/${kind}/${movieID}" class="btn btn-primary w-100">View more <span class="sr-only"> about ${movieTitle}</span></a>
              </span>
              </div>
            </div></div>
          </div>`;
        } else {
          return `
          <div class="card mb-3 border-primary text-bg-dark">
            <div class="row g-1">
            
              <div class="col-md-4">
                <img src="${moviePoster}" class="img-fluid rounded-start" alt="${kind} poster of: ${movieTitle}">
              </div>
              <div class="col-md-8 position-relative">
              <div class="card-header"><h3 class="card-title">${movieTitle}</h3></div>
                <div class="card-body">
                  <p class="card-text">${obj.overview}</p>
                        
                </div>
                <div class="col card-footer position-absolute bottom-0 start-0 w-100 d-flex">
                <p class="card-text flex-grow-1"><small class="text-muted">Release date: ${date}</small></p>
                <p class="position-absolute bottom-0 vote-count ${ratingClass}">${rating}</p>
                  <a href="/credits/#/${kind}/${movieID}" class="btn btn-primary ">View more information<span class="sr-only"> about ${movieTitle}</span></a>
                </div>

              </div>
            </div>
          </div>`;
        }
      })
      .join("");

    cards.innerHTML = html;

    return cards;
  },
  getImage: (image, type, size = "og") => {
    const imgBaseURL = `https://image.tmdb.org/t/p/`;
    let img = false;

    if (image) {
      const imgSize = {
        backdrop: { xs: "w300", md: "w780", lg: "w1280", og: "original" },
        logo: {
          xs: "w45",
          sm: "w92",
          md: "w154",
          lg: "w185",
          xl: "w300",
          xx: "w500",
          og: "original",
        },
        poster: {
          xs: "w92",
          sm: "w154",
          md: "w185",
          lg: "w342",
          xl: "w500",
          xx: "w780",
          og: "original",
        },
        profile: { xs: "w45", md: "w185", lg: "h632", og: "original" },
        still: { xs: "w92", md: "w185", lg: "w300", og: "original" },
      };

      const imgW = imgSize[type][size];

      img = `${imgBaseURL}/${imgW}${image}`;
    }
    return img;
  },
  getItem: () => {
    const attributes = pageManager.getHash();
    const type = attributes.type;
    const id = attributes.page;
    let urlAPI;
    switch (type) {
      case "movie":
        urlAPI = `${moviesAPI.baseURL}/3/movie/${id}?api_key=${moviesAPI.api_key}`;
        break;
      case "tv":
        urlAPI = `${moviesAPI.baseURL}/3/tv/${id}?api_key=${moviesAPI.api_key}`;
        break;
    }

    fetch(urlAPI)
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
          return response.json();
        }
      })
      .then((content) => {
        const movieTitle = content.original_title ?? content.original_name;
        document.title = `Chillflix - ${movieTitle} Credits and Information`;
        const cards = moviesAPI.build([content], type, "single");
        return cards;
      })
      .then((cards) => {
        const results = document.getElementById("movie-details");
        results.append(cards);
        return true;
      })
      .then((cont) => {
        if (cont) {
          moviesAPI.getCredits();
        }
      })
      .catch((error) => {
        throw new NetworkError(`Failed fetching ${type}`, error);
      });
  },
  getCredits: () => {
    const attributes = pageManager.getHash();
    const type = attributes.type;
    const id = attributes.page;
    let urlAPI;

    switch (type) {
      case "movie":
        urlAPI = `${moviesAPI.baseURL}/3/movie/${id}/credits?api_key=${moviesAPI.api_key}`;
        break;
      case "tv":
        urlAPI = `${moviesAPI.baseURL}/3/tv/${id}/credits?api_key=${moviesAPI.api_key}`;
        break;
    }

    fetch(urlAPI)
      .then((response) => {
        if (!response.ok) {
          new ErrorHandler(
            "<b>Something went wrong</b>",
            `${response.statusText}`,
            "error"
          );
          throw new NetworkError("Failed page load", response);
        }
        return response.json();
      })
      .then((data) => {
        const accordion = document.createElement("div");
        accordion.classList.add("row", "row-cols-1", "row-cols-md-6");

        const cast = data.cast;

        let theCast = cast
          .map((people) => {
            let picture = moviesAPI.getImage(
              people.profile_path,
              "profile",
              "lg"
            );
            if (!picture) picture = "../images/profile.svg";
            return `  <div class="col">
              <div class="card h-100">
                <img src="${picture}" class="card-img-top" alt="...">
                <div class="card-body">
                  <h5 class="card-title">${people.name}</h5>
                  <small class="text-muted">Plays:${people.character}</small>
                </div>
              </div>
            </div>`;
          })
          .join("");

        accordion.innerHTML = theCast;

        return accordion;
      })
      .then((content) => {
        const results = document.getElementById("credits");
        results.append(content);
      })
      .catch((error) => {
        new ErrorHandler("<b>Something went wrong</b>", `${error}`, "error");
        throw new NetworkError("Failed fetching movies", error);
      });
  },
  getFeatured: (type) => {
    const apiURL = `https://api.themoviedb.org/3/${type}/popular?api_key=${moviesAPI.api_key}&region=CA`;

    fetch(apiURL)
      .then((response) => {
        if (!response.ok) {
          new ErrorHandler(
            "<b>Something went wrong</b>",
            `${response.statusText}`,
            "error"
          );
          throw new NetworkError("Failed to load featured movies", response);
        }
        return response.json();
      })
      .then((data) => {
        const content = data.results;
        return content;
      })
      .then((content) => {
        const cards = moviesAPI.build(content, type, "featured");
        return cards;
      })
      .then((cards) => {
        const results = document.getElementById(`featured-${type}`);
        results.append(cards);
        return true;
      })
      .then(() => {
        if (type == "movie") moviesAPI.getFeatured("tv");
        return true;
      })
      .then(() => {
        if (type == "tv") {
          const popoverTriggerList = document.querySelectorAll(
            '[data-bs-toggle="popover"]'
          );
          const popoverList = [...popoverTriggerList].map(
            (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
          );
        }
      })
      .catch((error) => {
        new ErrorHandler("<b>Something went wrong</b>", `${error}`, "error");
        throw new NetworkError("Failed fetching movies", error);
      });
  },
};
export { moviesAPI };

function toCaps(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
