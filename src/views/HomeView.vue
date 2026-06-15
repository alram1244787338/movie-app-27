<template>
  <HeroSection @open-search="openSearch" />

  <section class="mb-16">
    <LoadingSpinner v-if="homeLoading" />
    <MovieCarousel v-else :movies="carouselMovies" />
  </section>

  <CategoryGrid
    :categories="categories"
    :loading="homeLoading && !categories.length"
    @select-genre="navigateToGenre"
  />

  <FavoriteMoviesSection
    v-if="store.displayFavorites.length > 0"
    :movies="store.displayFavorites"
  />

  <MovieGrid
    title="Najlepiej oceniane"
    link-to="/movies?sort=top_rated"
    :movies="topRatedMovies"
    :loading="homeLoading && !topRatedMovies.length"
  />

  <StatsSection
    :total-movies="TOTAL_MOVIES"
    :categories-count="categories.length"
    :favorites-count="store.favorites.length"
  />

  <SearchModal
    v-if="searchIsOpen"
    v-model="searchQuery"
    :search-results="searchResults"
    @close="closeSearch"
    @select="(id: number) => selectMovie(id, router)"
    @input="debouncedSearch"
  />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMoviesStore } from "../stores/movies";
import { useHomeData } from "../composables/useHomeData";
import { useSearchModal } from "../composables/useSearchModal";

import HeroSection from "../components/home/HeroSection.vue";
import CategoryGrid from "../components/home/CategoryGrid.vue";
import FavoriteMoviesSection from "../components/home/FavoriteMoviesSection.vue";
import MovieGrid from "../components/home/MovieGrid.vue";
import StatsSection from "../components/home/StatsSection.vue";
import SearchModal from "../components/home/SearchModal.vue";
import MovieCarousel from "../components/home/MovieCarousel.vue";
import LoadingSpinner from "../components/common/LoadingSpinner.vue";

const TOTAL_MOVIES = 10000;

const router = useRouter();
const store = useMoviesStore();

const {
  carouselMovies,
  categories,
  topRatedMovies,
  loading: homeLoading,
  load: loadHomeData,
} = useHomeData();

const {
  isOpen: searchIsOpen,
  query: searchQuery,
  results: searchResults,
  open: openSearch,
  close: closeSearch,
  debouncedSearch,
  selectMovie,
} = useSearchModal();

function navigateToGenre(id: number, name: string) {
  router.push({
    path: "/movies",
    query: { genre: id, name },
  });
}

onMounted(() => {
  loadHomeData();
});
</script>
