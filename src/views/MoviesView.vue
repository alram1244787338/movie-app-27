<template>
  <h1 class="sr-only">
    {{ pageTitle }}
  </h1>
  <section
    class="flex flex-col md:flex-row md:items-center md:justify-between mb-10"
  >
    <MoviesFilters
      v-model:searchQuery="search"
      v-model:category="category"
      v-model:sortOption="sort"
      v-model:year="year"
      v-model:rating="rating"
      :categories="store.categories"
      :years="availableYears"
      :ratings="availableRatings"
    />
  </section>

  <LoadingSpinner v-if="store.loading" />
  <section v-else>
    <h2 class="font-medium text-lg mb-4">Filmy</h2>
    <MoviesGrid :movies="filteredMovies" :empty-message="emptyResultsMessage" />
    <div class="flex items-center justify-end mt-10">
      <Pagination
        v-if="totalPages > 1"
        :current-page="page"
        :total-pages="totalPages"
        @change-page="changePage"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMoviesStore } from "../stores/movies";
import type { Category } from "../types/Category";
import MoviesFilters from "../components/movies/MoviesFilters.vue";
import MoviesGrid from "../components/movies/MoviesGrid.vue";
import LoadingSpinner from "../components/common/LoadingSpinner.vue";
import Pagination from "../components/common/Pagination.vue";
import { useMoviesFilter } from "../composables/useMoviesFilter";

const store = useMoviesStore();

const {
  search,
  category,
  sort,
  year,
  rating,
  page,
  filteredMovies,
  totalPages,
} = useMoviesFilter(store);

// ── Presentation-only computed (no filter logic here) ──

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 1900; i--) {
    years.push(i);
  }
  return years;
});

const availableRatings = [
  { value: "9", label: "9+ Wybitne" },
  { value: "8", label: "8+ Bardzo dobre" },
  { value: "7", label: "7+ Dobre" },
  { value: "6", label: "6+ Powyżej przeciętnej" },
  { value: "5", label: "5+ Przeciętne" },
];

const pageTitle = computed(() => {
  if (category.value) {
    const cat: Category | undefined = store.categories.find(
      (c: Category) => c.id === Number(category.value)
    );
    return cat ? `Filmy: ${cat.name}` : "Wszystkie filmy";
  }
  if (year.value) return `Filmy z roku ${year.value}`;
  if (rating.value) return `Filmy z oceną ${rating.value}+`;
  if (search.value) return `Wyniki wyszukiwania: "${search.value}"`;
  return "Wszystkie filmy";
});

const emptyResultsMessage = computed(() => {
  if (search.value) {
    return `Nie znaleziono filmów pasujących do wyszukiwania "${search.value}"`;
  }
  if (category.value || year.value || rating.value) {
    return "Nie znaleziono filmów pasujących do wybranych filtrów";
  }
  return "Nie znaleziono filmów";
});

// ── Page change handler ──

function changePage(newPage: number) {
  if (newPage === page.value) return;
  page.value = newPage;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
