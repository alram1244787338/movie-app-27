import { ref } from "vue";
import type { Router } from "vue-router";
import { searchMovies } from "../services/movieApi";
import type { Movie } from "../types/Movie";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 5;

/**
 * Composable zarządzający modalem szybkiego wyszukiwania.
 * Obsługuje otwieranie/zamykanie, debouncing inputu, wyniki i nawigację.
 */
export function useSearchModal() {
  const isOpen = ref(false);
  const query = ref("");
  const results = ref<Movie[]>([]);

  let timeout: ReturnType<typeof setTimeout> | null = null;

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    query.value = "";
    results.value = [];
  }

  function debouncedSearch() {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (query.value.length < MIN_QUERY_LENGTH) {
      results.value = [];
      return;
    }

    timeout = setTimeout(async () => {
      try {
        const { results: found } = await searchMovies(query.value);
        results.value = found.slice(0, RESULTS_LIMIT);
      } catch (error) {
        console.error("Błąd wyszukiwania filmów:", error);
        results.value = [];
      }
    }, DEBOUNCE_MS);
  }

  function selectMovie(id: number, router: Router) {
    close();
    router.push(`/movie/${id}`);
  }

  return {
    isOpen,
    query,
    results,
    open,
    close,
    debouncedSearch,
    selectMovie,
  };
}
