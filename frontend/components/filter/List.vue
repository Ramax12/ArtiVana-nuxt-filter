<script setup lang="ts">
import { useFilterStore } from '@/stores/filter';
import CardVertical from '@/components/card/CardVertical.vue';

const filterStore = useFilterStore();

const products = computed(() => {
  return filterStore.products || {};
});
</script>

<template>
  <div
    v-if="products.length"
    class="relative xs:flex flex-wrap gap-3 sm:gap-4"
    :class="{ 'after:absolute after:top-0 after:left-0 after:w-full after:h-full opacity-20': filterStore.isLoading }"
  >
    <card-vertical
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>
  <p
    v-else-if="!filterStore.isLoading"
    class="text-sm lg:text-xl"
  >Poof! The products have vanished! Or maybe they just haven’t arrived yet. Stay tuned!</p>
</template>