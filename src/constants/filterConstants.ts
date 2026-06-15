/**
 * Movie filter constants
 *
 * Single source of truth for filter defaults and URL query key names.
 * All sort values use TMDB API dot notation (e.g. "popularity.desc").
 */

export const DEFAULT_SORT = "popularity.desc";
export const DEFAULT_PAGE = 1;
export const ITEMS_PER_PAGE = 20;

/** URL query parameter keys */
export const QUERY_KEYS = {
  SEARCH: "search",
  CATEGORY: "category",
  SORT: "sort",
  YEAR: "year",
  RATING: "rating",
  PAGE: "page",
} as const;
