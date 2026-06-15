<template>
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-6">Przeglądaj według gatunku</h2>
    <LoadingSpinner v-if="loading" />
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <div
        v-for="category in categories"
        :key="category.id"
        @click="$emit('selectGenre', category.id, category.name)"
        class="p-4 rounded-lg text-center hover:bg-blue-600 hover:text-white transition duration-300 shadow cursor-pointer"
      >
        <span class="font-medium">{{ category.name }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Category } from "../../types/Category";
import LoadingSpinner from "../common/LoadingSpinner.vue";

defineProps({
  categories: {
    type: Array as () => Category[],
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["selectGenre"]);
</script>
