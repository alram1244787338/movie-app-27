import { ref, computed } from "vue";
import { useMoviesStore } from "../stores/movies";
import { getTopRatedMovies } from "../services/movieApi";
import type { Movie } from "../types/Movie";

// Liczba elementów prezentowanych w poszczególnych sekcjach strony głównej.
// Trzymane w jednym miejscu, aby zmiana reguł wyświetlania nie wymagała
// zaglądania do widoku ani do magazynu.
const CAROUSEL_LIMIT = 10;
const TOP_RATED_LIMIT = 8;
const FAVORITES_PREVIEW_LIMIT = 4;
const TOTAL_MOVIES_ESTIMATE = 10000;

export function useHomeData() {
  const store = useMoviesStore();

  // Pojedyncza flaga ładowania dla wstępnego pobrania danych strony głównej.
  const loading = ref(false);

  // Dane wyłącznie dla strony głównej — nie trafiają do magazynu.
  const topRatedMovies = ref<Movie[]>([]);

  // Sekcje pochodne — czerpią ze współdzielonego stanu w magazynie,
  // a widok nie musi znać limitów wyświetlania.
  const carouselMovies = computed(() => store.movies.slice(0, CAROUSEL_LIMIT));
  const favoritesPreview = computed(() =>
    store.favorites.slice(0, FAVORITES_PREVIEW_LIMIT)
  );
  const categories = computed(() => store.categories);
  const favoritesCount = computed(() => store.favorites.length);

  async function loadTopRated(): Promise<void> {
    try {
      const { results } = await getTopRatedMovies(1);
      topRatedMovies.value = results.slice(0, TOP_RATED_LIMIT);
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
    }
  }

  async function load(): Promise<void> {
    loading.value = true;
    try {
      await Promise.all([
        store.fetchPopularMovies(),
        store.fetchCategories(),
        loadTopRated(),
      ]);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    carouselMovies,
    categories,
    topRatedMovies,
    favoritesPreview,
    favoritesCount,
    totalMovies: TOTAL_MOVIES_ESTIMATE,
    load,
  };
}
