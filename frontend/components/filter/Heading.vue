<script setup lang="ts">
import { ref, computed } from 'vue';
import PAGINATION from "@/constants/pagination";
import { useRouter } from "vue-router";
import { useFilterStore } from '@/stores/filter';
import SelectedFilters from '@/components/filter/SelectedFilters.vue';
import Filters from '@/components/filter/Filters.vue';
import Pagination from '@/components/filter/Pagination.vue';
import OptionSelector from '@/components/common/OptionSelector.vue';
import SvgFilters from '@/components/svg/Filters.vue';
import SvgSort from '@/components/svg/Sort.vue';
import SvgChevron from '@/components/svg/Chevron.vue';
import type { ISubcategory, ISubsubcategory, ISelectedFilters } from '@/typescript/interfaces';

interface ISortData {
  id: number,
  name: string;
  value: string;
}

const props = defineProps<{
  subcategory: ISubcategory | undefined;
  subsubcategory?: ISubsubcategory | undefined;
}>();

const router = useRouter();
const filterStore = useFilterStore();
const SORT_DATA: ISortData[] = [
  {
    id: 1,
    name: 'Highest rating',
    value: 'rating_desc',
  },
  {
    id: 2,
    name: 'Lowest price',
    value: 'price_asc',
  },
  {
    id: 3,
    name: 'Highest price',
    value: 'price_desc',
  },
  {
    id: 4,
    name: 'Name: A to Z',
    value: 'name_asc',
  },
  {
    id: 5,
    name: 'Name: Z to A',
    value: 'name_desc',
  }
];
const SWIPE_THRESHOLD = 50;
const selectedSorting = ref<string | null>(null);
const isShowSortPopup = ref<boolean>(false);
const isShowFilterPopup = ref<boolean>(false);
const isOpenSelect = ref<boolean>(false);
const oldSelectedFilters = ref<ISelectedFilters | null>(null);
let touchStartY = 0;
let touchMoveY = 0;

const totalProducts = computed(() => {
  return filterStore.filterMeta.count || 0;
});

const activeSelectedSorting = computed(() => {
  return SORT_DATA.find(e => e.value === selectedSorting.value);
});

const isFilterChanges = computed(() => {
  const old = oldSelectedFilters.value ?? {} as ISelectedFilters;

  return (Object.keys(old) as (keyof ISelectedFilters)[]).some(key => {
    return JSON.stringify(old[key]) !== JSON.stringify(filterStore.selectedFilters[key]);
  });
});

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches[0]) {
    touchStartY = event.touches[0].clientY;
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (event.touches[0]) {
    touchMoveY = event.touches[0]?.clientY;
  }
};

const handleTouchEnd = () => {
  const swipeDistance = touchMoveY - touchStartY;

  if (swipeDistance > SWIPE_THRESHOLD) {
    isShowSortPopup.value = false;
    isShowFilterPopup.value = false;
    filterStore.loadProducts = true;
    document.body.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';
  }

  touchMoveY = 0;
  touchStartY = 0;
};

const selectOption = (value: string) => {
  filterStore.page = 1;

  if (selectedSorting.value === value) {
    selectedSorting.value = null;
    filterStore.sort = null;
  } else {
    selectedSorting.value = value;
    filterStore.sort = value;
  }

  filterStore.buildParams();

  isOpenSelect.value = false;
  isShowSortPopup.value = false;
  document.body.classList.remove('overflow-hidden');
  document.body.style.paddingRight = '';
};

const toggleSortPopup = () => {
  if (isShowSortPopup.value) {
    isShowSortPopup.value = false;
    document.body.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';
  } else {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    isShowSortPopup.value = true;
    document.body.classList.add('overflow-hidden');
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  }
};

const toggleFilterPopup = () => {
  if (isShowFilterPopup.value) {
    isShowFilterPopup.value = false;
    document.body.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';

    filterStore.loadProducts = true;

    if (oldSelectedFilters.value) {
      filterStore.selectedFilters = oldSelectedFilters.value;
    }
  } else {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    isShowFilterPopup.value = true;
    document.body.classList.add('overflow-hidden');
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    filterStore.loadProducts = false;

    oldSelectedFilters.value = JSON.parse(JSON.stringify(filterStore.selectedFilters));
  }
};

const loadProducts = () => {
  const params: Record<string, number> = {
    ...filterStore.queryParams,
    subcategory: props.subcategory?.id ?? 0
  };
  if (props.subsubcategory) {
    params.subsubcategory = props.subsubcategory.id;
  }

  isShowFilterPopup.value = false;
  document.body.classList.remove('overflow-hidden');
  document.body.style.paddingRight = '';

  filterStore.loadProducts = true;
  filterStore.fetchProducts(params);
  router.replace({ query: filterStore.queryParams });
};
</script>

<template>
  <div class="flex flex-col md:flex-row lg:justify-end gap-2 mb-3 lg:mb-5">
    <div class="flex flex-wrap lg:hidden gap-2">
      <div
        data-testid="filters-button"
        class="flex justify-between items-center px-3 py-2 border border-gray-400 rounded-md bg-white cursor-pointer
          hover:border-gray-600 transition-brand select-none"
        @click="toggleFilterPopup"
      >
        <svg-filters class="w-5 mr-2" />
        <span>Filters</span>
      </div>

      <div
        data-testid="sorting-button"
        class="flex justify-between items-center px-3 py-2 border border-gray-400 rounded-md bg-white cursor-pointer
          hover:border-gray-600 transition-brand select-none"
        @click="toggleSortPopup"
      >
        <svg-sort class="w-5 mr-2 rotate-180" />
        <span>Sorting</span>
      </div>
    </div>

    <div
      v-if="totalProducts > PAGINATION.perPage"
      class="ml-auto lg:ml-0 lg:mr-auto"
    >
      <pagination />
    </div>

    <div class="relative hidden lg:flex w-44 select-none">
      <div
        class="z-30 relative flex justify-between items-center w-full px-3 py-2 border cursor-pointer bg-white hover:border-gray-700
          transition-brand"
        :class="[isOpenSelect ? 'rounded-b-none border-gray-600' : 'rounded-md border-gray-500']"
        @click="isOpenSelect = !isOpenSelect"
      >
        <span
          class="mr-2 transition-brand"
          :class="[isOpenSelect ? 'text-black' : 'text-gray-900']"
        >
          {{ selectedSorting && activeSelectedSorting ? activeSelectedSorting.name : 'Sort By' }}

        </span>
        <svg-chevron
          class="w-3.5 text-gray-900 transition-brand"
          :class="{ 'rotate-180': isOpenSelect }"
        />
      </div>

      <div
        class="z-20 absolute top-full left-0 w-full border border-t-0 border-gray-600 rounded-b-md shadow-gray-hard bg-white
          overflow-hidden"
        :class="[isOpenSelect ? 'block' : 'hidden']"
      >
        <div
          v-for="option in SORT_DATA"
          :key="option.id"
          class="py-1 px-3 hover:bg-gray-400 transition-brand cursor-pointer"
          :class="{ 'bg-gray-300': activeSelectedSorting?.id === option.id }"
          @click="selectOption(option.value)"
        >
          {{ option.name }}
        </div>
      </div>
    </div>
  </div>

  <div
    data-testid="sort-popup"
    class="z-50 fixed top-0 left-0 flex lg:hidden w-full h-full bg-black/70 transition-[visibility,opacity] duration-500 ease-in-out"
    :class="[isShowSortPopup ? 'opacity-100 visible' : 'opacity-0 invisible delay-300']"
    @click.self="toggleSortPopup"
  >
    <div
      class="relative flex flex-col w-full mt-auto rounded-t-xl overflow-auto bg-gray-200 shadow-gray-hard
        transition-all duration-500 ease-in-out"
      :class="[isShowSortPopup ? 'max-h-full delay-75' : 'max-h-0']"
    >
      <div class="p-2.5 md:p-5 pt-9 md:pt-9">
        <div class="absolute top-3 left-1/2 w-32 h-1 rounded-full -translate-x-1/2 bg-gray-600"></div>
        <div
          class="absolute top-0 left-0 right-0 h-16"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        ></div>

        <div class="py-3 px-4 rounded-t-lg mb-1 shadow-gray-light bg-white">
          <div class="text-lg">Sort by</div>
        </div>

        <form class="py-3 px-4 rounded-b-lg shadow-gray-light bg-white">
          <div
            v-for="option in SORT_DATA"
            :key="option.id"
            class="mb-2.5 last:mb-0"
          >
            <option-selector
              :model-value="selectedSorting"
              type="radio"
              :value="option.value"
              name="sort"
              @update:model-value="value => selectOption(String(value))"
            >
              <span class="text-[15px] -mt-0.5">{{ option.name }}</span>
            </option-selector>
          </div>
        </form>
      </div>
    </div>
  </div>

  <form
    data-testid="filter-popup"
    class="z-50 fixed top-0 left-0 flex lg:hidden w-full h-full bg-black/70 transition-[visibility,opacity] duration-500 ease-in-out"
    :class="[isShowFilterPopup ? 'opacity-100 visible' : 'opacity-0 invisible delay-300']"
    @click.self="toggleFilterPopup"
  >
    <div
      class="relative flex flex-col w-full h-[calc(100%-100px)] rounded-t-xl mt-auto bg-gray-200 shadow-gray-hard
        transition-all duration-500 ease-in-out"
      :class="[isShowFilterPopup ? 'max-h-full delay-75' : 'max-h-0']"
    >
      <div class="absolute top-3 left-1/2 block lg:hidden w-32 h-1 rounded-full -translate-x-1/2 bg-gray-600"></div>
      <div
        class="absolute top-0 left-0 right-0 h-16"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      ></div>

      <div class="px-2.5 md:px-5 pt-9 md:pt-9 pb-1 text-xl font-bold">Filters</div>

      <div class="flex-shrink p-2.5 md:p-5 pt-4 md:pt-4 pb-16 overflow-y-auto">
        <selected-filters />

        <filters
          :subcategory="subcategory"
          :subsubcategory="subsubcategory"
          is-popup
        />
      </div>

      <div
        v-if="isFilterChanges"
        class="fixed bottom-0 w-full py-3 px-2.5 md:px-5 bg-white rounded-t-xl shadow-gray-light-reverse"
      >
        <button
          type="button"
          class="button button_violet w-full"
          @click="loadProducts"
        >
          Show {{ totalProducts }} products
        </button>
      </div>
    </div>
  </form>
</template>