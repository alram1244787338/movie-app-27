<template>
  <HeroSection @open-search="openSearch" />

  <section class="mb-16">
    <LoadingSpinner v-if="loading" />
    <MovieCarousel v-else :movies="carouselMovies" />
  </section>

  <CategoryGrid
    :categories="categories"
    :loading="loading && !categories.length"
    @select-genre="navigateToGenre"
  />

  <FavoriteMoviesSection
    v-if="favoritesPreview.length > 0"
    :movies="favoritesPreview"
  />

  <MovieGrid
    title="Najlepiej oceniane"
    link-to="/movies?sort=top_rated"
    :movies="topRatedMovies"
    :loading="loading && !topRatedMovies.length"
  />

  <StatsSection
    :total-movies="totalMovies"
    :categories-count="categories.length"
    :favorites-count="favoritesCount"
  />

  <SearchModal
    v-if="isSearchOpen"
    v-model="searchQuery"
    :search-results="searchResults"
    @close="closeSearch"
    @select="goToMovie"
    @input="onSearchInput"
  />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../components/home/HeroSection.vue";
import CategoryGrid from "../components/home/CategoryGrid.vue";
import FavoriteMoviesSection from "../components/home/FavoriteMoviesSection.vue";
import MovieGrid from "../components/home/MovieGrid.vue";
import StatsSection from "../components/home/StatsSection.vue";
import SearchModal from "../components/home/SearchModal.vue";
import MovieCarousel from "../components/home/MovieCarousel.vue";
import LoadingSpinner from "../components/common/LoadingSpinner.vue";

import { useHomeData } from "../composables/useHomeData";
import { useSearchModal } from "../composables/useSearchModal";

const router = useRouter();

const {
  loading,
  carouselMovies,
  categories,
  topRatedMovies,
  favoritesPreview,
  favoritesCount,
  totalMovies,
  load,
} = useHomeData();

const {
  isOpen: isSearchOpen,
  query: searchQuery,
  results: searchResults,
  open: openSearch,
  close: closeSearch,
  onInput: onSearchInput,
  goToMovie,
} = useSearchModal();

function navigateToGenre(id: number, name: string) {
  router.push({
    path: "/movies",
    query: { genre: id, name },
  });
}

onMounted(load);
</script>
