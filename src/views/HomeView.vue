<template>
  <HeroSection @open-search="openSearchModal" />

  <section class="mb-16">
    <LoadingSpinner v-if="loading" />
    <MovieCarousel v-else :movies="popularMoviesForCarousel" />
  </section>

  <CategoryGrid
    :categories="categories"
    :loading="loading && !categories.length"
    @select-genre="navigateToGenre"
  />

  <FavoriteMoviesSection
    v-if="favoritesForDisplay.length > 0"
    :movies="favoritesForDisplay"
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
    :favorites-count="store.favorites.length"
  />

  <SearchModal
    v-if="isSearchModalOpen"
    v-model="searchQuery"
    :search-results="searchResults"
    @close="closeSearchModal"
    @select="goToMovie"
    @input="debouncedSearch"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useMoviesStore } from "../stores/movies";

import HeroSection from "../components/home/HeroSection.vue";
import CategoryGrid from "../components/home/CategoryGrid.vue";
import FavoriteMoviesSection from "../components/home/FavoriteMoviesSection.vue";
import MovieGrid from "../components/home/MovieGrid.vue";
import StatsSection from "../components/home/StatsSection.vue";
import SearchModal from "../components/home/SearchModal.vue";
import MovieCarousel from "../components/home/MovieCarousel.vue";
import LoadingSpinner from "../components/common/LoadingSpinner.vue";

import {
  searchMovies,
  getCategories,
  getTopRatedMovies,
} from "../services/movieApi";

import type { Movie } from "../types/Movie";
import type { Category } from "../types/Category";

const router = useRouter();
const store = useMoviesStore();
const popularMoviesForCarousel = ref<Movie[]>([]);
const categories = ref<Category[]>([]);
const topRatedMovies = ref<Movie[]>([]);
const isSearchModalOpen = ref(false);
const searchQuery = ref("");
const searchResults = ref<Movie[]>([]);
const searchTimeout = ref<number | null>(null);
const loading = ref(false);

const totalMovies = ref(10000);

const favoritesForDisplay = computed(() => {
  return store.favorites.slice(0, 4);
});

async function fetchMoviesForCarousel() {
  try {
    popularMoviesForCarousel.value = store.movies.slice(0, 10);
    if (popularMoviesForCarousel.value.length === 0) {
      loading.value = true;
      const { results } = await getPopularMovies(1);
      popularMoviesForCarousel.value = results.slice(0, 10);
      loading.value = false;
    }
  } catch (error) {
    console.error("Error fetching carousel movies:", error);
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    loading.value = true;
    categories.value = await getCategories();
    loading.value = false;
  } catch (error) {
    console.error("Error fetching categories:", error);
    loading.value = false;
  }
}

async function fetchTopRatedMoviesData() {
  try {
    loading.value = true;
    const { results } = await getTopRatedMovies(1);
    topRatedMovies.value = results.slice(0, 8);
    loading.value = false;
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    loading.value = false;
  }
}

function openSearchModal() {
  isSearchModalOpen.value = true;
}

function closeSearchModal() {
  isSearchModalOpen.value = false;
  searchQuery.value = "";
  searchResults.value = [];
}

function debouncedSearch() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      const { results } = await searchMovies(searchQuery.value);
      searchResults.value = results.slice(0, 5);
    } catch (error) {
      console.error("Error searching movies:", error);
    }
  }, 300);
}

function goToMovie(id: number) {
  closeSearchModal();
  router.push(`/movie/${id}`);
}

function navigateToGenre(id: number, name: string) {
  router.push({
    path: "/movies",
    query: { category: String(id) },
  });
}

async function getPopularMovies(page = 1) {
  const { getPopularMovies } = await import("../services/movieApi");
  return await getPopularMovies(page);
}

onMounted(async () => {
  loading.value = true;
  await store.fetchPopularMovies();
  await Promise.all([
    fetchMoviesForCarousel(),
    fetchCategories(),
    fetchTopRatedMoviesData(),
  ]);
  loading.value = false;
});
</script>
