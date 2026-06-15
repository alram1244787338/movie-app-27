<template>
  <div class="w-full" role="search" aria-label="Filtry filmów">
    <h2 id="filters-heading" class="font-medium text-lg mb-4">Filtry</h2>
    <div class="w-full space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
        <FilterDropdown
          v-model="categoryModel"
          :options="categoryOptions"
          placeholder="Wszystkie kategorie"
          icon="bx-category"
          aria-labelledby="filters-heading"
          id="category-filter"
          label="Kategoria"
        />

        <FilterDropdown
          v-model="yearModel"
          :options="yearOptions"
          placeholder="Dowolny rok"
          icon="bx-calendar"
          aria-labelledby="filters-heading"
          id="year-filter"
          label="Rok"
        />

        <FilterDropdown
          v-model="ratingModel"
          :options="ratingOptions"
          placeholder="Dowolna ocena"
          icon="bx-star"
          aria-labelledby="filters-heading"
          id="rating-filter"
          label="Ocena"
        />

        <FilterDropdown
          v-model="sortOptionModel"
          :options="sortOptions"
          placeholder="Sortowanie"
          icon="bx-sort-alt-2"
          aria-labelledby="filters-heading"
          id="sort-filter"
          label="Sortowanie"
        />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="w-full sm:w-fit">
          <SearchInput
            v-model="localSearchQuery"
            placeholder="Szukaj filmów..."
            class="lg:min-w-[500px]"
            aria-label="Wyszukiwarka filmów"
            id="movie-search"
          />
        </div>
        <button
          @click="clearAllFilters"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 whitespace-nowrap"
          :class="{ 'opacity-70 cursor-not-allowed': !hasActiveFilters }"
          :disabled="!hasActiveFilters"
          aria-label="Wyczyść wszystkie filtry"
        >
          <span>Wyczyść filtry</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Category } from "../../types/Category";
import FilterDropdown from "../common/FilterDropdown.vue";
import SearchInput from "../common/SearchInput.vue";
import { DEFAULT_SORT } from "../../constants/filterConstants";

interface FilterOption {
  value: string;
  label: string;
}

const props = defineProps<{
  searchQuery: string;
  category: string;
  sortOption: string;
  year: string;
  rating: string;
  categories: Category[];
  years: number[];
  ratings: FilterOption[];
}>();

const emit = defineEmits<{
  "update:searchQuery": [value: string];
  "update:category": [value: string];
  "update:sortOption": [value: string];
  "update:year": [value: string];
  "update:rating": [value: string];
}>();

const localSearchQuery = ref(props.searchQuery);
const debounceTimeout = ref<number | null>(null);
const DEBOUNCE_DELAY = 500;

watch(
  () => props.searchQuery,
  (newValue) => {
    if (newValue !== localSearchQuery.value) {
      localSearchQuery.value = newValue;
    }
  }
);

watch(localSearchQuery, (newValue) => {
  if (debounceTimeout.value !== null) {
    clearTimeout(debounceTimeout.value);
  }

  debounceTimeout.value = window.setTimeout(() => {
    emit("update:searchQuery", newValue);
    debounceTimeout.value = null;
  }, DEBOUNCE_DELAY);
});

const categoryModel = computed({
  get: () => props.category,
  set: (value: string) => emit("update:category", value),
});

const sortOptionModel = computed({
  get: () => props.sortOption,
  set: (value: string) => emit("update:sortOption", value),
});

const yearModel = computed({
  get: () => props.year,
  set: (value: string) => emit("update:year", value),
});

const ratingModel = computed({
  get: () => props.rating,
  set: (value: string) => emit("update:rating", value),
});

const hasActiveFilters = computed(() => {
  return (
    props.searchQuery !== "" ||
    props.category !== "" ||
    props.year !== "" ||
    props.rating !== "" ||
    props.sortOption !== DEFAULT_SORT
  );
});

const clearAllFilters = () => {
  emit("update:searchQuery", "");
  emit("update:category", "");
  emit("update:year", "");
  emit("update:rating", "");
  emit("update:sortOption", DEFAULT_SORT);
};

const categoryOptions = computed<FilterOption[]>(() => {
  return [
    { value: "", label: "Wszystkie kategorie" },
    ...props.categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ];
});

const yearOptions = computed<FilterOption[]>(() => {
  return [
    { value: "", label: "Dowolny rok" },
    ...props.years.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
  ];
});

const ratingOptions = computed<FilterOption[]>(() => {
  return [{ value: "", label: "Dowolna ocena" }, ...props.ratings];
});

const sortOptions: FilterOption[] = [
  { value: DEFAULT_SORT, label: "Popularne" },
  { value: "title.asc", label: "Tytuł (A-Z)" },
  { value: "title.desc", label: "Tytuł (Z-A)" },
  { value: "primary_release_year.desc", label: "Rok (najnowsze)" },
  { value: "primary_release_year.asc", label: "Rok (najstarsze)" },
  { value: "vote_average.desc", label: "Ocena (najwyższa)" },
  { value: "vote_average.asc", label: "Ocena (najniższa)" },
];
</script>
