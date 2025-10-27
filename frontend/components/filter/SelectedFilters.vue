<script setup lang="ts">
import { computed } from 'vue';
import { useFilterStore } from '@/stores/filter';
import priceFormat from '@/utils/price-format';
import type { IFilterDataItemCharacteristics } from '@/typescript/interfaces';

const filterStore = useFilterStore();

const filters = computed(() => {
  return filterStore.filterMeta.filters || {};
});

const hasActiveFilters = computed(() => {
  return Object.values(filterStore.selectedFilters).some(value => {
    if (Array.isArray(value)) {
      return value.some(v => v !== null && v !== undefined);
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0;
    }
    return !!value;
  });
});

const selectedSubsubcategoryNames = computed(() => {
  return (filterStore.selectedFilters.subsubcategories || [])
    .map(id => filters.value.standard.subsubcategories.find(e => e.id === id)?.name)
    .filter(Boolean)
    .join(', ');
});

const selectedBrandNames = computed(() => {
  return (filterStore.selectedFilters.brands || [])
    .map(id => filters.value.standard.brands.find(e => e.id === id)?.name)
    .filter(Boolean)
    .join(', ');
});

const getCurrentCharacteristic = (value: string): IFilterDataItemCharacteristics | undefined => {
  return filters.value.characteristics.find(e => e.value === value);
};

const selectedCharacteristicNames = (value: string, ids: number[]): string => {
  return ids.map(id => filters.value.characteristics.find(e => e.value === value)?.options.find(e => e.id === id)?.name)
    .filter(Boolean)
    .join(', ');
};

const removeFilter = (key: string) => {
  filterStore.page = 1;
  if (key === 'subsubcategories' || key === 'brands') {
    filterStore.selectedFilters[key] = [];
  } else if (key === 'price') {
    filterStore.selectedFilters[key] = [null, null];
  } else if (key === 'rating') {
    filterStore.selectedFilters[key] = false;
  } else if (key.startsWith('characteristics[')) {
    const match = key.match(/^characteristics\[(.+)\]$/);

    if (match) {
      const characteristicName = match[1];

      if (characteristicName) {
        delete filterStore.selectedFilters.characteristics[characteristicName];
      }
    }
  }

  filterStore.buildParams();
};

const clearAllFilters = () => {
  filterStore.resetFilters();
};
</script>

<template>
  <div
    v-if="hasActiveFilters"
    class="mb-5"
  >
    <div class="flex justify-between items-center py-2 px-4 rounded-t-lg mb-1 shadow-gray-light bg-white">
      <div class="text-lg font-bold">Selected filters</div>
      <div
        data-testid="clear-all-button"
        class="hover:text-brand-hover cursor-pointer transition-brand select-none"
        @click="clearAllFilters"
      >Clear all</div>
    </div>

    <div class="flex flex-wrap gap-2 py-3 px-4 rounded-b-lg shadow-gray-light bg-white">
      <div
        v-if="filterStore.selectedFilters.subsubcategories.length"
        class="flex items-center px-3 py-1.5 border border-gray-400 rounded-md bg-white transition-brand"
      >
        <span
          data-testid="subsubcategory-text"
          class="text-sm"
        >Department: {{ selectedSubsubcategoryNames }}</span>

        <div
          data-testid="subsubcategories-item"
          class="relative text-4xl cursor-pointer leading-9 w-6 h-6 origin-center text-center ml-1
            before:absolute before:top-1/2 before:left-1/2 before:w-4 before:h-0.5 before:bg-gray-500 before:-translate-x-1/2
            before:-translate-y-1/2 before:animation-rotate-minus
            after:absolute after:top-1/2 after:left-1/2 after:w-4 after:h-0.5 after:bg-gray-500 after:-translate-x-1/2
            after:-translate-y-1/2 after:animation-rotate-plus"
          @click="removeFilter('subsubcategories')"
        >
        </div>
      </div>

      <div
        v-if="filterStore.selectedFilters.price[0] || filterStore.selectedFilters.price[1]"
        class="flex items-center px-3 py-1.5 border border-gray-400 rounded-md bg-white transition-brand"
      >
        <span
          data-testid="price-text"
          class="text-sm"
        >Price:
          <template v-if="filterStore.selectedFilters.price[0] && filterStore.selectedFilters.price[1]">
            {{ `${priceFormat(String(filterStore.selectedFilters.price[0]))} ₽ –
            ${priceFormat(String(filterStore.selectedFilters.price[1]))} ₽` }}
          </template>
          <template v-else-if="filterStore.selectedFilters.price[0]">
            {{ `from ${priceFormat(String(filterStore.selectedFilters.price[0]))} ₽` }}
          </template>
          <template v-else-if="filterStore.selectedFilters.price[1]">
            {{ `to ${priceFormat(String(filterStore.selectedFilters.price[1]))} ₽` }}
          </template>
        </span>

        <div
          class="relative text-4xl cursor-pointer leading-9 w-6 h-6 origin-center text-center ml-1
            before:absolute before:top-1/2 before:left-1/2 before:w-4 before:h-0.5 before:bg-gray-500 before:-translate-x-1/2
            before:-translate-y-1/2 before:animation-rotate-minus
            after:absolute after:top-1/2 after:left-1/2 after:w-4 after:h-0.5 after:bg-gray-500 after:-translate-x-1/2
            after:-translate-y-1/2 after:animation-rotate-plus"
          @click="removeFilter('price')"
        >
        </div>
      </div>

      <div
        v-if="filterStore.selectedFilters.brands.length"
        class="flex items-center px-3 py-1.5 border border-gray-400 rounded-md bg-white transition-brand"
      >
        <span
          data-testid="brand-text"
          class="text-sm"
        >Brand: {{ selectedBrandNames }}</span>

        <div
          class="relative text-4xl cursor-pointer leading-9 w-6 h-6 origin-center text-center ml-1
            before:absolute before:top-1/2 before:left-1/2 before:w-4 before:h-0.5 before:bg-gray-500 before:-translate-x-1/2
            before:-translate-y-1/2 before:animation-rotate-minus
            after:absolute after:top-1/2 after:left-1/2 after:w-4 after:h-0.5 after:bg-gray-500 after:-translate-x-1/2
            after:-translate-y-1/2 after:animation-rotate-plus"
          @click="removeFilter('brands')"
        >
        </div>
      </div>

      <div
        v-if="filterStore.selectedFilters.rating"
        class="flex items-center px-3 py-1.5 border border-gray-400 rounded-md bg-white transition-brand"
      >
        <span
          data-testid="rating-text"
          class="text-sm"
        >Rating: 4+ stars</span>

        <div
          class="relative text-4xl cursor-pointer leading-9 w-6 h-6 origin-center text-center ml-1
            before:absolute before:top-1/2 before:left-1/2 before:w-4 before:h-0.5 before:bg-gray-500 before:-translate-x-1/2
            before:-translate-y-1/2 before:animation-rotate-minus
            after:absolute after:top-1/2 after:left-1/2 after:w-4 after:h-0.5 after:bg-gray-500 after:-translate-x-1/2
            after:-translate-y-1/2 after:animation-rotate-plus"
          @click="removeFilter('rating')"
        >
        </div>
      </div>


      <div
        v-for="(ids, characteristic) in filterStore.selectedFilters.characteristics || {}"
        :key="characteristic"
        class="flex items-center px-3 py-1.5 border border-gray-400 rounded-md bg-white transition-brand"
      >
        <span
          data-testid="characteristic-text"
          class="text-sm"
        >
          {{ getCurrentCharacteristic(characteristic)?.name }}: {{ selectedCharacteristicNames(characteristic, ids) }}
        </span>

        <div
          class="relative text-4xl cursor-pointer leading-9 w-6 h-6 origin-center text-center ml-1
            before:absolute before:top-1/2 before:left-1/2 before:w-4 before:h-0.5 before:bg-gray-500 before:-translate-x-1/2
            before:-translate-y-1/2 before:animation-rotate-minus
            after:absolute after:top-1/2 after:left-1/2 after:w-4 after:h-0.5 after:bg-gray-500 after:-translate-x-1/2
            after:-translate-y-1/2 after:animation-rotate-plus"
          @click="removeFilter(`characteristics[${characteristic}]`)"
        >
        </div>
      </div>
    </div>
  </div>
</template>