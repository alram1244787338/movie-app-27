import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { searchMovies } from "../services/movieApi";
import type { Movie } from "../types/Movie";

// Reguły szybkiego wyszukiwania — limit podpowiedzi, opóźnienie i próg długości
// zapytania trzymane razem z logiką, a nie rozsiane po widoku.
const SEARCH_RESULTS_LIMIT = 5;
const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function useSearchModal() {
  const router = useRouter();

  const isOpen = ref(false);
  const query = ref("");
  const results = ref<Movie[]>([]);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function clearTimer(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  function open(): void {
    isOpen.value = true;
  }

  function close(): void {
    isOpen.value = false;
    query.value = "";
    results.value = [];
    clearTimer();
  }

  function onInput(): void {
    clearTimer();

    if (query.value.length < MIN_QUERY_LENGTH) {
      results.value = [];
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const { results: found } = await searchMovies(query.value);
        results.value = found.slice(0, SEARCH_RESULTS_LIMIT);
      } catch (error) {
        console.error("Error searching movies:", error);
      }
    }, SEARCH_DEBOUNCE_MS);
  }

  function goToMovie(id: number): void {
    close();
    router.push(`/movie/${id}`);
  }

  onUnmounted(clearTimer);

  return { isOpen, query, results, open, close, onInput, goToMovie };
}
