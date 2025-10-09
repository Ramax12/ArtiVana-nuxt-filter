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

const getSubsubcategory = computed(() => {
  return getSubcategory.value?.subsubcategories.find(e => e.slug === route.params.subsubcategory);
});

if (!getSubsubcategory.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  });
}

const dataCrumbs = computed(() => {
  const data: Record<string, ICrumbs> = {};

  if (route.name && getCategory.value && getSubcategory.value && getSubsubcategory.value) {
    data[getCategory.value.slug] = {
      name: String(route.name).replace(/(\-category).*/, '$1'),
      real_name: getCategory.value.name,
      params: {
        category: getCategory.value.slug
      }
    };

    data[getSubcategory.value.slug] = {
      name: String(route.name).replace(/(\-subcategory).*/, '$1'),
      real_name: getSubcategory.value.name,
      params: {
        category: getCategory.value.slug,
        subcategory: getSubcategory.value.slug
      }
    };

    data[getSubsubcategory.value.slug] = {
      real_name: getSubsubcategory.value.name,
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

        <h1 class="like-h1">{{ getSubsubcategory?.name }}</h1>

        <main-filter
          :subcategory="getSubcategory"
          :subsubcategory="getSubsubcategory"
        />
      </div>
    </section>
  </div>
</template>