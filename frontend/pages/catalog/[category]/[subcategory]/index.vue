<script setup lang="ts">
import { useRoute } from "vue-router";
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MainFilter from '@/components/filter/Main.vue';
import type { ICategory, ICrumbs } from '@/typescript/interfaces';

useSeoMeta({
  title: 'Shop Artistic Supplies - ArtiVana Collection',
  description: 'Explore the ArtiVana catalog and discover a wide range of artistic supplies for every creative project.'
});

const route = useRoute();
const categories = inject<Ref<ICategory[]>>('categories', ref([]));

const getCategory = computed(() => {
  return categories.value.find(e => e.slug === route.params.category);
});

const getSubcategory = computed(() => {
  return getCategory.value?.subcategories.find(e => e.slug === route.params.subcategory);
});

if (!getSubcategory.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  });
}

const dataCrumbs = computed(() => {
  const data: Record<string, ICrumbs> = {};

  if (route.name && getCategory.value && getSubcategory.value) {
    data[getCategory.value.slug] = {
      name: String(route.name).replace(/(\-category).*/, '$1'),
      real_name: getCategory.value.name,
      params: {
        category: getCategory.value.slug
      }
    };

    data[getSubcategory.value.slug] = {
      real_name: getSubcategory.value.name,
    };
  }

  return data;
});
</script>

<template>
  <div>
    <section class="section">
      <div class="container">
        <breadcrumbs :data-crumbs="dataCrumbs" />

        <h1 class="like-h1">{{ getSubcategory?.name }}</h1>

        <div class="grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-5 lg:my-7">
          <nuxt-link
            v-for="subsubcategory in getSubcategory?.subsubcategories"
            :to="{
              name: 'catalog-category-subcategory-subsubcategory',
              params: { category: route.params.category, subcategory: route.params.subcategory, subsubcategory: subsubcategory.slug }
            }"
            class="relative flex items-center h-14 md:h-16 lg:h-20 px-4 rounded-lg shadow-gray-light hover:shadow-gray-hard
            no-hover-shadow-light:hover bg-white transition-brand"
          >
            <div class="z-10 absolute top-0 left-0 flex items-end w-full h-full">
              <div class="z-[-1] absolute top-1/2 left-8 md:left-9 lg:left-[44px] w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16
              rounded-full -translate-y-1/2 -translate-x-1/2 bg-gray-400">
              </div>
              <img
                :src="subsubcategory.image ?? 'images/default.jpg'"
                :alt="subsubcategory.name"
                class="h-[calc(100%+10px)]"
              >
            </div>

            <div
              class="text-xs md:text-sm lg:text-base !leading-tight font-bold py-3 ml-[56px] md:ml-[72px] lg:ml-[88px]"
            >
              {{ subsubcategory.name }}</div>
          </nuxt-link>
        </div>

        <main-filter :subcategory="getSubcategory" />
      </div>
    </section>
  </div>
</template>