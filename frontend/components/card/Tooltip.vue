<script setup lang="ts">
import SvgCopy from '@/components/svg/Copy.vue';

const props = defineProps<{
  article: number;
}>();

const isShowTooltip = ref<boolean>(false);

const showTooltip = (event: Event, articleText: number) => {
  event.preventDefault;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(String(articleText))
      .then(() => isShowTooltip.value = true)
      .catch(err => console.error('Copy error:', err));

    setTimeout(() => {
      isShowTooltip.value = false;
    }, 2000);
  }
};
</script>

<template>
  <div
    class="group relative flex items-center text-sm cursor-pointer"
    @click="showTooltip($event, article)"
  >
    <svg-copy class="w-5 text-accent mr-1" />
    <span class="text-xs lg:text-sm mr-1">Article</span>
    <span class="text-xs lg:text-sm font-bold">{{ article }}</span>
    <div
      class="z-30 absolute -top-full left-0 text-sm py-1.5 px-2 rounded-md -mt-5 bg-gray-600 transition duration-200 ease-in-out
        after:absolute after:-bottom-1.5 after:left-2.5 after:w-0 after:h-0 after:border-l-8 after:border-r-8 after:border-t-8
        after:border-transparent after:-translate-x-1/2 after:border-t-gray-600"
      :class="{ 'pointer-events-none opacity-0': !isShowTooltip }"
    >
      Article&nbsp;copied
    </div>
  </div>
</template>