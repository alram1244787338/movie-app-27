import { ref } from "vue";
import {
  getPopularMovies,
  getCategories,
  getTopRatedMovies,
} from "../services/movieApi";
import type { Movie } from "../types/Movie";
import type { Category } from "../types/Category";

const CAROUSEL_LIMIT = 10;
const TOP_RATED_LIMIT = 8;

/**
 * Composable zarządzający ładowaniem danych dla strony głównej.
 * Zwraca refs z danymi oraz funkcję `load()` do równoległego pobrania.
 */
export function useHomeData() {
  const carouselMovies = ref<Movie[]>([]);
  const categories = ref<Category[]>([]);
  const topRatedMovies = ref<Movie[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      const [popularResult, categoriesResult, topRatedResult] =
        await Promise.all([
          getPopularMovies(1),
          getCategories(),
          getTopRatedMovies(1),
        ]);

      carouselMovies.value = popularResult.results.slice(0, CAROUSEL_LIMIT);
      categories.value = categoriesResult;
      topRatedMovies.value = topRatedResult.results.slice(0, TOP_RATED_LIMIT);
    } catch (error) {
      console.error("Błąd ładowania danych strony głównej:", error);
    } finally {
      loading.value = false;
    }
  }

  return {
    carouselMovies,
    categories,
    topRatedMovies,
    loading,
    load,
  };
}
