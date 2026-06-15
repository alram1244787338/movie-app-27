import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getCategories,
  getFilteredMovies,
} from "../services/movieApi";
import type { MovieDetails, Movie } from "../types/Movie";
import type { Category } from "../types/Category";

interface FilterParams {
  page?: number;
  genre?: number;
  year?: number;
  [key: string]: any;
}

interface FetchResult {
  movies: Movie[];
  total: number;
  page: number;
  totalPages: number;
}

export const useMoviesStore = defineStore("movies", () => {
  const movies = ref<Movie[]>([]);
  const currentMovie = ref<MovieDetails | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const favorites = ref<Movie[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const isSearchMode = ref(false);
  const lastSearchQuery = ref("");
  const categories = ref<Category[]>([]);

  const initializeFavorites = () => {
    try {
      const saved = localStorage.getItem("favorites");
      if (saved) {
        favorites.value = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading favorites from localStorage:", e);
      favorites.value = [];
    }
  };

  initializeFavorites();

  const hasError = computed(() => error.value !== null);
  const hasMovies = computed(() => movies.value.length > 0);
  const isFirstPage = computed(() => currentPage.value === 1);
  const isLastPage = computed(() => currentPage.value === totalPages.value);

  async function fetchData<T>(
    fetchFn: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchFn();
      return result;
    } catch (e) {
      error.value = errorMessage;
      console.error(errorMessage, e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function search(query: string, page = 1): Promise<void> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    isSearchMode.value = true;
    lastSearchQuery.value = trimmedQuery;

    const result = await fetchData(
      () => searchMovies(trimmedQuery, page),
      "Nie udało się wyszukać filmów"
    );

    if (result) {
      movies.value = result.results;
      totalPages.value = result.totalPages;
      currentPage.value = page;
    }
  }

  async function fetchPopularMovies(page = 1): Promise<void> {
    isSearchMode.value = false;

    const result = await fetchData(
      () => getPopularMovies(page),
      "Nie udało się pobrać popularnych filmów"
    );

    if (result) {
      movies.value = result.results;
      totalPages.value = result.totalPages;
      currentPage.value = page;
    }
  }

  async function fetchCategories(): Promise<Category[]> {
    const data = await fetchData(
      () => getCategories(),
      "Nie udało się pobrać kategorii"
    );

    if (data) {
      categories.value = data;
    }
    return data || [];
  }

  async function fetchFilteredMovies(
    filterParams: FilterParams
  ): Promise<FetchResult> {
    const result = await fetchData(
      () => getFilteredMovies(filterParams),
      "Nie udało się pobrać przefiltrowanych filmów"
    );

    if (result) {
      movies.value = result.results;
      currentPage.value = filterParams.page || 1;
      totalPages.value = result.totalPages;

      return {
        movies: result.results,
        total: result.totalResults,
        page: filterParams.page || 1,
        totalPages: result.totalPages,
      };
    }

    return { movies: [], total: 0, page: 1, totalPages: 0 };
  }

  async function goToPage(page: number): Promise<void> {
    if (page < 1 || page > totalPages.value) return;

    if (isSearchMode.value && lastSearchQuery.value) {
      await search(lastSearchQuery.value, page);
    } else {
      await fetchPopularMovies(page);
    }
  }

  async function fetchMovieDetails(id: number): Promise<void> {
    const result = await fetchData(
      () => getMovieDetails(id),
      "Nie udało się pobrać szczegółów filmu"
    );

    if (result) {
      currentMovie.value = result;
    }
  }

  function toggleFavorite(movie: Movie): void {
    const index = favorites.value.findIndex((m) => m.id === movie.id);

    if (index === -1) {
      favorites.value.push(movie);
    } else {
      favorites.value.splice(index, 1);
    }

    try {
      localStorage.setItem("favorites", JSON.stringify(favorites.value));
    } catch (e) {
      console.error("Error saving favorites to localStorage:", e);
    }
  }

  function isFavorite(id: number): boolean {
    return favorites.value.some((movie) => movie.id === id);
  }

  return {
    // State
    movies,
    currentMovie,
    loading,
    error,
    favorites,
    currentPage,
    totalPages,
    isSearchMode,
    categories,

    // Computed
    hasError,
    hasMovies,
    isFirstPage,
    isLastPage,

    // Actions
    search,
    fetchPopularMovies,
    fetchCategories,
    fetchFilteredMovies,
    goToPage,
    fetchMovieDetails,
    toggleFavorite,
    isFavorite,
  };
});
