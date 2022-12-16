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

        document.querySelector("#search-title .query").innerHTML =
          decodeURIComponent(query.query);
        pageManager.pagination(data);

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
        const movieID = obj.id;
        let moviePoster = moviesAPI.getImage(obj.poster_path, "poster", "og");
        if (!moviePoster) moviePoster = "./images/poster.svg";

        const releaseDate = obj.first_air_date ?? obj.release_date;
        const date = new Date(releaseDate).toLocaleDateString();
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
          // cards.classList.add("card-wrapper");
          // cards.classList.add("row");
          let movieBanner = moviesAPI.getImage(
            obj.backdrop_path,
            "backdrop",
            "lg"
          );
          if (!movieBanner) movieBanner = "./images/banner.svg";
          let genres = obj.genres
            .map((gen) => {
              return `<li class="list-group-item">${gen.name}</li>`;
            })
            .join("");

          let prodCompanies = obj.production_companies
            .map((company) => {
              const logo = moviesAPI.getImage(company.logo_path, "logo", "lg");
              let companyInfo =
                logo != false
                  ? `<li class="list-group-item"><img src="${logo}" alt="${company.name} logo"><small>${company.name}</small></li>`
                  : `<li class="list-group-item text">${company.name}</li>`;
              return companyInfo;
            })
            .join("");

          let language = obj.spoken_languages
            .map((lang) => {
              return `<li class="list-group-item">${lang.name}</li>`;
            })
            .join("");
          cards.classList.add("single-movie");
          return `
            <div class="single-movie">
              <header class="banner credit-banner" style="background-image: url(${movieBanner});">
                  <div class="container">
                      <div class="row align-items-center">
                          <div class="col">
                              <h1 class="title sr-only"> <!-- Hidden element. Steve I wasn't able to make it look good -->
                                <span class="kind">${kind}</span>
                                <span class="main-title">${movieTitle}</span>
                                <span class="tagline">${obj.tagline}</span>
                              </h1>
                          </div>
                      </div>
                  </div>
              </header>
              <div class="container movie-details">
                  <div class="col-left">
                      <div class="sticky">
                      <img src="${moviePoster}" class="movie poster" alt="${kind} poster of: ${movieTitle}">
                      </div>
                      </div>
                      <div class="col-right">
                      <section class="card-body">
                      <h2 class="card-title">${movieTitle}</h2>
                      <p class="date">Release date: ${date}</p>
                      <p class="card-text"><span class="description">${obj.overview}</span></p>
                          <p class="vote-count">Popular rating: <span class="${ratingClass}">${rating}</span></p>
                          <p class="list-title">Genre</p> <ul class="list-group list-group-horizontal credit-genre">${genres}</ul>
                          <p class="list-title">Production Company</p> <ul class="list-group list-group-horizontal credit-company">
                          ${prodCompanies}</ul>
                          <p class="list-title">Language</p> <ul class="list-group list-group-horizontal credit-lang">${language}
                          </ul>
                      </section>
                      <section>
                          <h3>Cast</h3>
                          <div class="movie-credits card-group" id="credits"></div>
                      </section>
                  </div>
              </div>
          </div>`;
        } else if (type == "featured") {
          if (index > 3) return;
          cards.classList.add("container");

          return `
          <a class="card" href="./credits.html#/${kind}/${movieID}"
            aria-label="${movieTitle}">
            <img src="${moviePoster}" class="card-img-top" alt="${kind} poster of: ${movieTitle}">
            <div class="card__content">
                <h3 class="card__title sr-only">${movieTitle}</h3>
                <span class="btn">View more <span class="sr-only"> about ${movieTitle}</span></span>
            </div>
          </a>`;
        } else {
          cards.classList.add("container");
          const shortTxT = obj.overview.substring(0, 70) + "...";
          return `
          
          <a class="card" href="./credits.html#/${kind}/${movieID}"
            aria-label="${movieTitle}">
            <img src="${moviePoster}" class="card-img-top" alt="${kind} poster of: ${movieTitle}">
            <div class="card__content">
                <h3 class="card__title">${movieTitle}</h3>
                <p class="card-text">${shortTxT}</p>  
                
            </div>
            <div class="card__footer">
              <p class="card-text"><small class="text-muted">Release date: ${date}</small></p>
              <p class="position-absolute bottom-0 vote-count">Popular rating: <span class="${ratingClass}">${rating}</span></p>
              <span class="btn">View more <span class="sr-only"> about ${movieTitle}</span></span>
            </div>
          </a>`;
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
        accordion.classList.add("container");

        const cast = data.cast;

        let theCast = cast
          .map((people) => {
            let picture = moviesAPI.getImage(
              people.profile_path,
              "profile",
              "lg"
            );
            if (!picture) picture = "./images/profile.svg";
            return `
            <div class="card">
              <img src="${picture}" class="card-img-top" alt="${people.name} portrait">
              <div class="card__content">
                  <h3 class="card__title">${people.name}</h3>
                  <small class="card-text">Plays: ${people.character}</small>
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
