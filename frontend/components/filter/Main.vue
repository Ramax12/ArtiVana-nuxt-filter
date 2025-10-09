<script setup lang="ts">
import MAX_SCREEN_WIDTH from '@/constants/max-screen-width';
import PAGINATION from "@/constants/pagination";
import { useRouter, useRoute } from "vue-router";
import { useFilterStore } from '@/stores/filter';
import Filtration from '@/components/filter/Filtration.vue';
import Heading from '@/components/filter/Heading.vue';
import List from '@/components/filter/List.vue';
import Pagination from '@/components/filter/Pagination.vue';
import type { ISubcategory, ISubsubcategory } from '@/typescript/interfaces';

const props = defineProps<{
  subcategory: ISubcategory | undefined;
  subsubcategory?: ISubsubcategory | undefined;
}>();

const router = useRouter();
const route = useRoute();
const filterStore = useFilterStore();
const filterElement = useTemplateRef<HTMLElement>('filterElement');
let debounceTimer: ReturnType<typeof setTimeout>;

const baseParams: Record<string, number> = {
  subcategory: props.subcategory?.id ?? 0
};
if (props.subsubcategory) {
  baseParams.subsubcategory = props.subsubcategory.id;
}

filterStore.parseQuery(route.query, baseParams);

watch(() => filterStore.queryParams, value => {
  const params: Record<string, number> = {
    ...value,
    subcategory: props.subcategory?.id ?? 0
  };
  if (props.subsubcategory) {
    params.subsubcategory = props.subsubcategory.id;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (filterStore.loadProducts) {
      filterStore.fetchProducts(params);
      syncUrlWithFilters(value);
    }
    filterStore.fetchFilters(params);
  }, 300);
});

const totalProducts = computed(() => {
  return filterStore.filterMeta.count || 0;
});

const syncUrlWithFilters = (value: Record<string, any>) => {
  router.replace({ query: value });
};

const scrollTo = () => {
  if (filterElement.value) {
    const top = filterElement.value.getBoundingClientRect().top + window.scrollY - (window.innerWidth > MAX_SCREEN_WIDTH.laptop ? 116 : 0);
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
};
</script>

<template>
  <div
    ref="filterElement"
    class="lg:flex"
  >
    <filtration
      :subcategory="subcategory"
      :subsubcategory="subsubcategory"
    />
    <div class="lg:w-[calc(100%-324px)]">
      <heading
        :subcategory="subcategory"
        :subsubcategory="subsubcategory"
      />

      <list />

      <div
        v-if="totalProducts > PAGINATION.perPage"
        class="m-auto my-6"
      >
        <pagination @scroll-to="scrollTo" />
      </div>
    </div>
  </div>
</template>