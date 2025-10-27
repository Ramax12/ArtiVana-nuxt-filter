<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFilterStore } from '@/stores/filter';
import OptionSelector from '@/components/common/OptionSelector.vue';
import RangeInput from '@/components/filter/RangeInput.vue';
import SvgChevron from '@/components/svg/Chevron.vue';
import type { ISubcategory, ISubsubcategory, IProductDTO } from '@/typescript/interfaces';

const props = withDefaults(defineProps<{
  subcategory: ISubcategory | undefined;
  subsubcategory?: ISubsubcategory | undefined;
  isPopup?: boolean;
}>(),
  {
    isPopup: false,
  },
);

const filterStore = useFilterStore();

const DEFAULT_NUMBER_OF_ITEMS_SHOWN = 5;
const OPEN_CATEGORIES_BY_DEFAULT = ['subsubcategory', 'price', 'brand', 'rating'];
const isCategoryOpen = ref<string[]>([...OPEN_CATEGORIES_BY_DEFAULT]);
const isShownItem = ref<string[]>([]);

onMounted(() => {
  addOpenedCategories();
});

const filters = computed(() => {
  return filterStore.filterMeta.filters || {};
});

const addOpenedCategories = () => {
  const prefix = `${props.subcategory?.id}-${props.subsubcategory?.id}-`;
  const openedCategories: string[] = JSON.parse(localStorage.getItem('opened-categories') || '[]');

  openedCategories.forEach(str => {
    if (str.startsWith(prefix)) {
      const rest = str.slice(prefix.length);
      isCategoryOpen.value.push(rest);
    }
  });
};

const joinCategoryName = (category: string): string => {
  return `${props.subcategory?.id}-${props.subsubcategory?.id}-${category}`;
};

const onCategoryClick = (name: string) => {
  if (isCategoryOpen.value.includes(name)) {
    if (!OPEN_CATEGORIES_BY_DEFAULT.includes(name)) {
      let raw: string[] = JSON.parse(localStorage.getItem('opened-categories') || '[]');
      raw = raw.filter(e => e !== joinCategoryName(name));

      localStorage.setItem('opened-categories', JSON.stringify(raw));
    }

    isCategoryOpen.value = isCategoryOpen.value.filter(e => e !== name);
  } else {
    if (!OPEN_CATEGORIES_BY_DEFAULT.includes(name)) {
      const raw: string[] = JSON.parse(localStorage.getItem('opened-categories') || '[]');

      raw.push(joinCategoryName(name));
      localStorage.setItem('opened-categories', JSON.stringify(raw));
    }

    isCategoryOpen.value.push(name);
  }
};

const brandFilters = computed(() => {
  if (isShownItem.value.includes('brand')) {
    return filters.value.standard.brands;
  } else {
    return filters.value.standard.brands.slice(0, DEFAULT_NUMBER_OF_ITEMS_SHOWN);
  }
});

const onButtonShowMoreClick = (name: string) => {
  if (isShownItem.value.includes(name)) {
    isShownItem.value = isShownItem.value.filter(e => e !== name);
  } else {
    isShownItem.value.push(name);
  }
};

const changeValue = () => {
  filterStore.page = 1;
  filterStore.buildParams();
};
</script>

<template>
  <div
    v-if="!subsubcategory"
    class="shadow-gray-light mb-4"
  >
    <div
      data-testid="category-header-subsubcategory"
      class="flex justify-between items-center py-2 px-4 mb-1 lg:hover:shadow-gray-hard no-hover-shadow bg-white
        cursor-pointer transition-brand select-none"
      :class="[isCategoryOpen.includes('subsubcategory') ? 'rounded-t-lg' : 'rounded-lg']"
      @click="onCategoryClick('subsubcategory')"
    >
      <div class="font-bold select-text">Department</div>
      <svg-chevron
        class="w-4 transition-brand"
        :class="{ 'rotate-180': isCategoryOpen.includes('subsubcategory') }"
      />
    </div>

    <div
      class="py-3 flex-col items-start px-4 rounded-b-lg bg-white"
      :class="[isCategoryOpen.includes('subsubcategory') ? 'flex' : 'hidden']"
    >
      <div
        v-for="subsub in filters.standard?.subsubcategories ?? []"
        :key="subsub.id"
        class="relative mb-2.5 last:mb-0"
        :class="{ 'pointer-events-none opacity-50': subsub.count === 0 }"
      >
        <option-selector
          :model-value="filterStore.selectedFilters.subsubcategories.includes(subsub.id)"
          name="subsubcategory"
          @update:model-value="checked => filterStore.updateSelectedFilters('subsubcategories', subsub.id, !!checked)"
        >
          <div class="flex items-center -mt-0.5">
            <span class="text-[15px]">{{ subsub.name }}</span>
            <span
              class="pl-0.5 text-xs text-gray-600"
              :class="{ 'hidden': subsub.count === 0 }"
            >
              ({{ subsub.count }})
            </span>
          </div>
        </option-selector>
      </div>
    </div>
  </div>

  <div class="shadow-gray-light mb-4">
    <div
      class="flex justify-between items-center py-2 px-4 mb-1 lg:hover:shadow-gray-hard no-hover-shadow bg-white
        cursor-pointer transition-brand select-none"
      :class="[isCategoryOpen.includes('price') ? 'rounded-t-lg' : 'rounded-lg']"
      @click="onCategoryClick('price')"
    >
      <div class="font-bold select-text">Price</div>
      <svg-chevron
        class="w-4 transition-brand"
        :class="{ 'rotate-180': isCategoryOpen.includes('price') }"
      />
    </div>

    <div
      class="py-2 px-4 rounded-b-lg bg-white"
      :class="[isCategoryOpen.includes('price') ? 'flex' : 'hidden']"
    >
      <div class="relative flex flex-col items-start w-full">
        <range-input
          v-model="filterStore.selectedFilters.price"
          :names="['min_price', 'max_price']"
          :min="filters.standard?.price.range[0] ?? 0"
          :max="filters.standard?.price.range[1] ?? 0"
          :base-min="filters.standard?.price.base_range[0] ?? 0"
          :base-max="filters.standard?.price.base_range[1] ?? 0"
          suffix=" ₽"
          format="price"
          placeholder="Price"
          is-open-slider
          @update:model-value="changeValue"
        />
      </div>
    </div>
  </div>

  <div
    v-if="filters.standard?.brands.length"
    class="shadow-gray-light mb-4"
  >
    <div
      class="flex justify-between items-center py-2 px-4 mb-1 lg:hover:shadow-gray-hard no-hover-shadow bg-white
        cursor-pointer transition-brand select-none"
      :class="[isCategoryOpen.includes('brand') ? 'rounded-t-lg' : 'rounded-lg']"
      @click="onCategoryClick('brand')"
    >
      <div class="font-bold select-text">Brand</div>
      <svg-chevron
        class="w-4 transition-brand"
        :class="{ 'rotate-180': isCategoryOpen.includes('brand') }"
      />
    </div>

    <div
      class="py-3 flex-col items-start px-4 rounded-b-lg bg-white"
      :class="[isCategoryOpen.includes('brand') ? 'flex' : 'hidden']"
    >
      <div
        v-for="(brand, key) in brandFilters"
        :key="key"
        class="relative mb-2.5 last:mb-0"
        :class="{ 'pointer-events-none opacity-50': brand.count === 0 }"
      >
        <option-selector
          :model-value="filterStore.selectedFilters.brands.includes(brand.id)"
          name="brand"
          @update:model-value="checked => filterStore.updateSelectedFilters('brands', brand.id, !!checked)"
        >
          <div class="flex items-center -mt-0.5">
            <span class="text-[15px]">{{ brand.name }}</span>
            <span
              class="pl-0.5 text-xs text-gray-600"
              :class="{ 'hidden': brand.count === 0 }"
            >
              ({{ brand.count }})
            </span>
          </div>
        </option-selector>
      </div>

      <div
        v-if="filters.standard.brands.length >= DEFAULT_NUMBER_OF_ITEMS_SHOWN"
        data-testid="show-more-button"
        class="relative text-sm text-brand leading-4 mt-0.5 border-b border-dashed border-brand cursor-pointer
          hover:text-brand-hover hover:border-brand-hover transition-brand"
        @click="onButtonShowMoreClick('brand')"
      >
        <span>{{ isShownItem.includes('brand') ? 'Show Less' : 'Show More' }}</span>
        <span v-if="!isShownItem.includes('brand')"> ({{ filters.standard.brands.length - 5 }})</span>
      </div>
    </div>
  </div>

  <div class="shadow-gray-light mb-4">
    <div
      class="flex justify-between items-center py-2 px-4 mb-1 lg:hover:shadow-gray-hard no-hover-shadow
      bg-white cursor-pointer transition-brand select-none"
      :class="[isCategoryOpen.includes('rating') ? 'rounded-t-lg' : 'rounded-lg']"
      @click="onCategoryClick('rating')"
    >
      <div class="font-bold select-text">Rating</div>
      <svg-chevron
        class="w-4 transition-brand"
        :class="{ 'rotate-180': isCategoryOpen.includes('rating') }"
      />
    </div>

    <div
      class="py-3 flex-col items-start px-4 rounded-b-lg bg-white"
      :class="[isCategoryOpen.includes('rating') ? 'flex' : 'hidden']"
    >
      <div
        class="relative mb-2.5 last:mb-0"
        :class="{ 'pointer-events-none opacity-50': filters.standard?.rating.count === 0 }"
      >
        <option-selector
          v-model="filterStore.selectedFilters.rating"
          name="rating"
          @update:model-value="changeValue"
        >
          <div class="leading-none">
            <div class="flex text-[15px] leading-4 mt-0.5">
              <span>Highest rating</span>
              <span
                class="pl-0.5 text-xs text-gray-600"
                :class="{ 'hidden': filters.standard?.rating.count === 0 }"
              >
                ({{ filters.standard?.rating.count }})
              </span>
            </div>
            <span class="text-xs text-gray-600">only 4 and 5</span>
          </div>
        </option-selector>
      </div>
    </div>
  </div>

  <div
    v-for="(chars, key) in filters.characteristics"
    :key="key"
    class="shadow-gray-light mb-4"
  >
    <div
      class="flex justify-between items-center py-2 px-4 mb-1 lg:hover:shadow-gray-hard no-hover-shadow
        bg-white cursor-pointer transition-brand select-none"
      :class="[isCategoryOpen.includes(chars.name) ? 'rounded-t-lg' : 'rounded-lg']"
      @click="onCategoryClick(chars.name)"
    >
      <div class="font-bold select-text">{{ chars.name }}</div>
      <svg-chevron
        class="w-4 transition-brand"
        :class="{ 'rotate-180': isCategoryOpen.includes(chars.name) }"
      />
    </div>

    <div
      class="py-3 flex-col items-start px-4 rounded-b-lg bg-white"
      :class="[isCategoryOpen.includes(chars.name) ? 'flex' : 'hidden']"
    >
      <div
        v-for="char in (isShownItem.includes(chars.name) ? chars.options : chars.options.slice(0, DEFAULT_NUMBER_OF_ITEMS_SHOWN))"
        :key="char.id"
        class="relative mb-2.5 last:mb-0"
        :class="{ 'pointer-events-none opacity-50': char.count === 0 }"
      >
        <option-selector
          :model-value="filterStore.selectedFilters.characteristics[chars.value]?.includes(char.id) ?? false"
          :name="char.name"
          @update:model-value="checked => filterStore.updateSelectedFilters(`characteristics[${chars.value}]`, char.id, !!checked)"
        >
          <div class="flex items-center -mt-0.5">
            <span class="text-[15px]">{{ char.name }}</span>
            <span
              class="pl-0.5 text-xs text-gray-600"
              :class="{ 'hidden': char.count === 0 }"
            >
              ({{ char.count }})
            </span>
          </div>
        </option-selector>
      </div>

      <div
        v-if="chars.options.length >= DEFAULT_NUMBER_OF_ITEMS_SHOWN"
        class="relative text-sm text-brand leading-4 mt-0.5 border-b border-dashed border-brand cursor-pointer
          hover:text-brand-hover hover:border-brand-hover transition-brand"
        @click="onButtonShowMoreClick(chars.name)"
      >
        <span>{{ isShownItem.includes(chars.name) ? 'Show Less' : 'Show More' }}</span>
        <span v-if="!isShownItem.includes(chars.name)"> ({{ chars.options.length - 5 }})</span>
      </div>
    </div>
  </div>
</template>