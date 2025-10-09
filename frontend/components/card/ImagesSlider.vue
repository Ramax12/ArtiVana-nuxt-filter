<script setup lang="ts">
import { Swiper as swiper, SwiperSlide as swiperSlide } from 'swiper/vue';
import { Mousewheel } from 'swiper/modules';
import MAX_SCREEN_WIDTH from '@/constants/max-screen-width';
import type { Swiper } from 'swiper';

const props = defineProps<{
  images: string[];
  name: string;
}>();

const CURRENT_ELEMENTS = 6;
const SWIPER_OPTIONS = {
  slidesPerView: 1,
  threshold: 40,
  mousewheel: {
    forceToAxis: true,
  },
};
const swiperSlider = ref<Swiper | null>(null);
const isHoveredItem = ref<boolean>(false);

const onSwiper = (slider: Swiper) => {
  swiperSlider.value = slider;
};

const swiperMouseEnter = (keySlide: number) => {
  swiperSlider.value?.slideTo(keySlide, 0);
  isHoveredItem.value = true;
};

const swiperMouseLeave = () => {
  swiperSlider.value?.slideTo(0, 0);
};
const mouseOver = () => {
  if (window.innerWidth <= MAX_SCREEN_WIDTH.laptop) {
    isHoveredItem.value = true;
  }
};
</script>

<template>
  <div class="absolute top-0 right-0 bottom-0 left-0">
    <swiper
      v-bind="SWIPER_OPTIONS"
      :modules="[Mousewheel]"
      class="swiper-gallery h-full"
      @swiper="onSwiper"
      @touchmove="mouseOver"
      @mouseenter="mouseOver"
    >
      <swiper-slide
        v-for="(image, key) in images.slice(0, CURRENT_ELEMENTS)"
        :key="key"
        class="relative rounded-t-lg bg-white"
      >
        <img
          :src="key === 0 || key === 1 || isHoveredItem ? image : ''"
          :alt="name"
          class="w-full h-full object-contain rounded-t-lg"
        >

        <div
          v-if="key === (CURRENT_ELEMENTS - 1) && images.length > CURRENT_ELEMENTS"
          class="z-10 absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col rounded-t-lg bg-black/40"
        >
          <div class="text-white font-bold">
            <span class="text-xl">+ </span>
            <span class="text-3xl">{{ images.length - CURRENT_ELEMENTS }}</span>
          </div>
          <div class="text-white font-bold text-2xl">Viev All</div>
        </div>
      </swiper-slide>
    </swiper>

    <div class="swiper-gallery-pagination-bullets">
      <div
        v-for="(image, key) in images.slice(0, CURRENT_ELEMENTS)"
        :key="key"
        class="swiper-pagination-bullet"
        :class="{ 'swiper-pagination-bullet-active': swiperSlider?.activeIndex === key }"
        @mouseenter="swiperMouseEnter(key)"
        @mouseleave="swiperMouseLeave"
      ></div>
    </div>
  </div>
</template>