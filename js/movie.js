const TOP_MOVIES_API = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${CONFIG.TMDB_API_KEY}&page=1`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?&api_key=${CONFIG.TMDB_API_KEY}&query=`;

const searchInput = document.querySelector("#movieSearch");
const movieGrid = document.querySelector("#movieGrid");
const spinner = document.querySelector("#loadingSpinner");
const sectionTitle = document.querySelector("#sectionTitle");
let debounceTimer = null;

async function getMovies(API_URL) {
  toggleLoading(true);
  const res = await fetch(API_URL);
  const data = await res.json();
  toggleLoading(false);
  console.log(data.results);
  if (data.results) {
    sectionTitle.textContent = "Popular Movies";
    showMovies(data.results);
  } else {
    showError("Couldn't load movies — check your internet connection.");
  }
}

function showMovies(movies) {
  let html = "";
  movies.forEach((movie) => {
    let posterHTML = "";
    const { title, poster_path, vote_average, overview, id, release_date } =
      movie;

    if (poster_path && poster_path !== "N/A") {
      posterHTML = `<img src="${IMG_PATH + poster_path}" alt="${title}" loading="lazy">`;
    } else {
      posterHTML = '<div class="no-poster"><i class="bi bi-film"></i></div>';
    }

    html += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="movie-card" onclick="openDetails('${id}')" style="cursor:pointer">
          ${posterHTML}
          <div class="card-body">
            <h6 class="card-title" title="${title}">${title}</h6>
            <span class="badge bg-secondary">${release_date}</span>
          </div>
        </div>
      </div>`;
  });

  movieGrid.innerHTML = html;
}

async function searchMovies(query) {
  if (query.length < 3) return;
  toggleLoading(true);
  sectionTitle.textContent = `Result for "${query}"`;
  const res = await fetch(SEARCH_API + query);
  const data = await res.json();
  toggleLoading(false);
  if (res.status === 200) {
    showMovies(data.results);
  } else {
    showError(data.Error || "No movies found.");
  }
}
function showError(msg) {
  movieGrid.innerHTML =
    '<div class="col-12 error-message"><i class="bi bi-exclamation-circle"></i><p>' +
    msg +
    "</p></div>";
}
// search as user types with debounce
searchInput.addEventListener("keyup", function () {
  let query = this.value.trim();
  clearTimeout(debounceTimer);

  if (query === "") {
    sectionTitle.textContent = "Popular Movies";
    getMovies(TOP_MOVIES_API);
    return;
  }

  sectionTitle.textContent = `Results for "${query}"`;
  debounceTimer = setTimeout(function () {
    searchMovies(query);
  }, 400);
});

getMovies(TOP_MOVIES_API);
function toggleLoading(show) {
  if (show) {
    spinner.classList.add("active");
    movieGrid.innerHTML = "";
  } else {
    spinner.classList.remove("active");
  }
}
async function openDetails(id) {
  const modalTitle = document.querySelector("#modalTitle");
  const modalBody = document.querySelector("#modalBody");
  const modal = new bootstrap.Modal(document.querySelector("#movieModal"));

  modalTitle.textContent = "Loading...";
  modalBody.innerHTML =
    '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
  modal.show();

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${CONFIG.TMDB_API_KEY}`,
  );
  const movie = await res.json();
  console.log(movie);
  if (res.status !== 200) {
    modalBody.innerHTML = '<p class="text-danger">Could not load details.</p>';
    return;
  }
  modalTitle.textContent = movie.title;

  let posterHTML = "";
  if (movie.poster_path && movie.poster_path !== "N/A") {
    posterHTML = `<img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}" class="img-fluid rounded" style="max-height:400px" loading="lazy">`;
  }

  modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-4 text-center mb-3">${posterHTML}</div>
        <div class="col-md-8">
          <p><strong>Year:</strong> ${movie.release_date}</p>
          <p><strong>Runtime:</strong> ${movie.runtime} Min.</p>
          <p><strong>Genre:</strong> ${movie.genres.map((g) => g.name).join(", ")}</p>
          
          <p><strong>IMDb Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}/10</p>
          <hr>
          <p><strong>Plot:</strong></p>
          <p>${movie.overview}</p>
        </div>
      </div>`;
}
