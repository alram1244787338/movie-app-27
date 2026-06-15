import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMoviesStore } from "../stores/movies";
import {
  DEFAULT_SORT,
  DEFAULT_PAGE,
  ITEMS_PER_PAGE,
  QUERY_KEYS,
} from "../constants/filterConstants";

/**
 * Composable that drives the movie list filter pipeline.
 *
 * Architecture:
 *   URL query  ──(read)──►  writable computed refs  ──►  template / UI
 *        ▲                         │
 *        └──────(write)────────────┘
 *                  │
 *                  ▼
 *            router.push  ──►  route.query changes  ──►  watch fires  ──►  fetch
 *
 * - URL query is the single source of truth for all filter state.
 * - No local refs, no watch-to-watch back-fill, no isInternalNavigation flag.
 * - A single watch on the derived `filters` object triggers every fetch.
 */
export function useMoviesFilter(store: ReturnType<typeof useMoviesStore>) {
  const route = useRoute();
  const router = useRouter();

  // ── Result state ──
  const filteredMovies = ref([]);
  const totalCount = ref(0);
  const totalPages = computed(() =>
    Math.min(500, Math.max(1, Math.ceil(totalCount.value / ITEMS_PER_PAGE)))
  );

  // ── Writable computed refs backed by URL query ──
  // Each ref reads from route.query and writes back via router.push.
  // This eliminates the local-ref + watch-sync pattern entirely.

  const search = computed({
    get: () =>
      (route.query[QUERY_KEYS.SEARCH] as string) || "",
    set: (value: string) => setFilter(QUERY_KEYS.SEARCH, value),
  });

  const category = computed({
    get: () =>
      (route.query[QUERY_KEYS.CATEGORY] as string) || "",
    set: (value: string) => setFilter(QUERY_KEYS.CATEGORY, value),
  });

  const sort = computed({
    get: () =>
      (route.query[QUERY_KEYS.SORT] as string) || DEFAULT_SORT,
    set: (value: string) => setFilter(QUERY_KEYS.SORT, value),
  });

  const year = computed({
    get: () =>
      (route.query[QUERY_KEYS.YEAR] as string) || "",
    set: (value: string) => setFilter(QUERY_KEYS.YEAR, value),
  });

  const rating = computed({
    get: () =>
      (route.query[QUERY_KEYS.RATING] as string) || "",
    set: (value: string) => setFilter(QUERY_KEYS.RATING, value),
  });

  const page = computed({
    get: () => {
      const parsed = parseInt(
        route.query[QUERY_KEYS.PAGE] as string
      );
      return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
    },
    set: (value: number) =>
      updateQuery({ [QUERY_KEYS.PAGE]: value > 1 ? String(value) : "" }),
  });

  // ── Derived snapshot of all filter dimensions (excluding page) ──
  const filters = computed(() => ({
    search: search.value,
    category: category.value,
    sort: sort.value,
    year: year.value,
    rating: rating.value,
  }));

  // ── URL helpers ──

  /**
   * Build a clean query object and push it to the router in a single navigation.
   * Empty / default values are stripped so the URL stays readable.
   */
  function updateQuery(patch: Record<string, string>) {
    const query: Record<string, string> = {};

    const s = patch[QUERY_KEYS.SEARCH] ?? search.value;
    const c = patch[QUERY_KEYS.CATEGORY] ?? category.value;
    const so = patch[QUERY_KEYS.SORT] ?? sort.value;
    const y = patch[QUERY_KEYS.YEAR] ?? year.value;
    const r = patch[QUERY_KEYS.RATING] ?? rating.value;
    const p = patch[QUERY_KEYS.PAGE] ?? String(page.value);

    if (s) query[QUERY_KEYS.SEARCH] = s;
    if (c) query[QUERY_KEYS.CATEGORY] = c;
    if (so && so !== DEFAULT_SORT) query[QUERY_KEYS.SORT] = so;
    if (y) query[QUERY_KEYS.YEAR] = y;
    if (r) query[QUERY_KEYS.RATING] = r;
    if (p && p !== "1") query[QUERY_KEYS.PAGE] = p;

    router.push({ query });
  }

  /**
   * Update one or more filter dimensions and reset page to 1 atomically.
   * Used by the filter UI — every filter change implies a page reset.
   */
  function setFilter(key: string, value: string) {
    updateQuery({ [key]: value, [QUERY_KEYS.PAGE]: "" });
  }

  /**
   * Reset all filters to defaults in a single navigation.
   */
  function resetFilters() {
    updateQuery({
      [QUERY_KEYS.SEARCH]: "",
      [QUERY_KEYS.CATEGORY]: "",
      [QUERY_KEYS.SORT]: "",
      [QUERY_KEYS.YEAR]: "",
      [QUERY_KEYS.RATING]: "",
      [QUERY_KEYS.PAGE]: "",
    });
  }

  // ── Data fetching ──

  async function fetchMovies() {
    try {
      const result = await store.fetchFilteredMovies({
        page: page.value,
        perPage: ITEMS_PER_PAGE,
        search: search.value,
        categoryId: category.value,
        sort: sort.value,
        year: year.value,
        minRating: rating.value,
      });
      filteredMovies.value = result.movies;
      totalCount.value = result.total;
    } catch (error) {
      console.error("Error fetching movies:", error);
      filteredMovies.value = [];
      totalCount.value = 0;
    }
  }

  // ── Single watcher: any filter or page change → fetch ──
  // `immediate: true` handles the initial load, replacing onMounted fetch logic.
  watch(
    () => ({ ...filters.value, page: page.value }),
    () => fetchMovies(),
    { immediate: true }
  );

  // ── Ensure categories are available for the filter dropdown ──
  store.fetchCategories();

  return {
    // Filter state (writable computed refs — use with v-model)
    search,
    category,
    sort,
    year,
    rating,
    page,

    // Actions
    resetFilters,
    fetchMovies,

    // Results
    filteredMovies,
    totalPages,
  };
}
