<script setup lang="ts">
import SelectedFilters from '@/components/filter/SelectedFilters.vue';
import Filters from '@/components/filter/Filters.vue';
import type { ISubcategory, ISubsubcategory } from '@/typescript/interfaces';

const props = defineProps<{
  subcategory: ISubcategory | undefined;
  subsubcategory: ISubsubcategory | undefined;
}>();

</script>

<template>
  <form class="hidden lg:block w-80 min-w-80 mr-8">
    <selected-filters />

    <filters :subcategory="subcategory" :subsubcategory="subsubcategory" />
  </form>
</template>