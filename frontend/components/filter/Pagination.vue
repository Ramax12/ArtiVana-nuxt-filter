<script setup lang="ts">
import PAGINATION from "@/constants/pagination";
import { useFilterStore } from '@/stores/filter';

const emits = defineEmits(['scroll-to']);

const filterStore = useFilterStore();

const totalProducts = computed(() => {
  return filterStore.filterMeta.count || 0;
});

const pages = computed(() => {
  return Array.from({ length: Math.ceil(totalProducts.value / PAGINATION.perPage) }, (_, i) => i + 1);
});

const goToPage = (page: number) => {
  if (page !== filterStore.page) {
    filterStore.page = page;
    filterStore.buildParams();
    emits('scroll-to');
  }
};
</script>

<template>
  <nav
    class="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 text-sm sm:text-base leading-6 sm:leading-7">

    <span
      v-for="page in pages"
      :key="page"
      class="w-[34px] sm:w-[42px] py-1 sm:py-1.5 text-center border rounded-md bg-white shadow-gray-light"
      :class="[
        filterStore.page === page ? 'text-brand border-brand cursor-default' :
          'border-gray-400 hover:border-gray-600 transition-brand cursor-pointer'
      ]"
      @click="goToPage(page)"
    >
      {{ page }}
    </span>
  </nav>
</template>