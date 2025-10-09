<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import MAX_SCREEN_WIDTH from '@/constants/max-screen-width';
import INPUT_CARD_VALUE from '@/constants/input-card-value';
import { useRouter } from "vue-router";
import { useFavoriteStore } from '@/stores/favorite';
import { useCompareStore } from '@/stores/compare';
import { useCartStore } from '@/stores/cart';
import priceFormat from '@/utils/price-format';
import Tooltip from '@/components/card/Tooltip.vue';
import ImagesSlider from '@/components/card/ImagesSlider.vue';
import animateNumber from '@/components/common/AnimateNumber.vue';
import BaseInput from '@/components/card/BaseInput.vue';
import SvgCompare from '@/components/svg/Compare.vue';
import SvgHeart from '@/components/svg/Heart.vue';
import SvgPhoto from '@/components/svg/Photo.vue';
import SvgPlus from '@/components/svg/Plus.vue';
import SvgMinus from '@/components/svg/Minus.vue';
import SvgChevron from '@/components/svg/Chevron.vue';
import type { IProductCutDown } from '@/typescript/interfaces';

interface IButtonState {
  text: string;
  disabled: boolean;
  hiddenSvg: boolean;
  textInPopup: string;
}

const props = withDefaults(defineProps<{
  product: IProductCutDown;
  slider?: boolean;
}>(),
  {
    slider: false,
  },
);

const router = useRouter();
const favoriteStore = useFavoriteStore();
const compareStore = useCompareStore();
const cartStore = useCartStore();

const SWIPE_THRESHOLD = 50;
const modelValue = ref<number>(1);
const isShowPopup = ref<boolean>(false);
const windowWidth = ref(0);
let touchStartY = 0;
let touchMoveY = 0;

onMounted(() => {
  modelValue.value = getQuantityFromCart.value ?? 1;
  windowWidth.value = window.innerWidth;

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const getQuantityFromCart = computed(() => {
  return cartStore.getProductQuantity(props.product.id) ?? null;
});

const getTotalPrice = computed(() => {
  const currentQuantity = modelValue.value !== 1 ? modelValue.value : getQuantityFromCart.value ?? 1;
  return props.product.final_price * currentQuantity;
});

const getDiscountAmount = computed(() => {
  const currentQuantity = modelValue.value !== 1 ? modelValue.value : getQuantityFromCart.value ?? 1;
  return props.product.original_price ? (props.product.original_price - props.product.final_price) * currentQuantity : 0;
});

const buttonState = computed(() => {
  const buttonState: IButtonState = {
    text: '',
    disabled: false,
    hiddenSvg: false,
    textInPopup: ''
  };

  if (getQuantityFromCart.value === null) {
    buttonState.text = 'Add to cart';
    buttonState.disabled = false;
  } else if (modelValue.value === 0 && windowWidth.value > MAX_SCREEN_WIDTH.laptop) {
    buttonState.text = 'Remove from cart';
    buttonState.disabled = false;
  } else if (getQuantityFromCart.value !== modelValue.value && windowWidth.value > MAX_SCREEN_WIDTH.laptop) {
    buttonState.text = 'Change quantity';
    buttonState.disabled = false;
  } else if (windowWidth.value > MAX_SCREEN_WIDTH.laptop) {
    buttonState.text = 'Added to cart';
    buttonState.disabled = true;
  } else {
    buttonState.text = `Added ${getQuantityFromCart.value} psc`;
    if (windowWidth.value > MAX_SCREEN_WIDTH.laptop) {
      buttonState.disabled = true;
    }
  }

  if (modelValue.value === 0) {
    buttonState.textInPopup = 'Remove from cart';
  } else if (getQuantityFromCart.value === modelValue.value) {
    buttonState.textInPopup = `In cart ${getQuantityFromCart.value} pcs`;
  } else {
    buttonState.textInPopup = `Change to ${modelValue.value} pcs`;
  }

  if (getQuantityFromCart.value && windowWidth.value <= MAX_SCREEN_WIDTH.laptop) {
    buttonState.hiddenSvg = false;
  } else {
    buttonState.hiddenSvg = true;
  }

  return buttonState;
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

const onDecreaseButtonClick = () => {
  if (getQuantityFromCart.value !== null && modelValue.value >= INPUT_CARD_VALUE.minimumValue ||
    getQuantityFromCart.value === null && modelValue.value > INPUT_CARD_VALUE.minimumValue) {
    modelValue.value--;
  }
};

const onIncreaseButtonClick = () => {
  if (modelValue.value < props.product.stock) {
    modelValue.value++;
  }
};

const onMainButtonClick = () => {
  if (getQuantityFromCart.value !== null && window.innerWidth <= MAX_SCREEN_WIDTH.laptop && !isShowPopup.value) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    isShowPopup.value = true;
    document.body.classList.add('overflow-hidden');
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  } else {
    if (modelValue.value !== 0 && window.innerWidth <= MAX_SCREEN_WIDTH.laptop &&
      isShowPopup.value && getQuantityFromCart.value === modelValue.value) {
      cartStore.updateCart(props.product.id, modelValue.value);
      router.push({ name: 'cart' });
    }

    cartStore.updateCart(props.product.id, modelValue.value);
    isShowPopup.value = false;
    document.body.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';

    if (modelValue.value === 0) {
      modelValue.value = 1;
    }
  }
};

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
    isShowPopup.value = false;
    document.body.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';
  }

  touchMoveY = 0;
  touchStartY = 0;
};

const togglePopup = () => {
  if (isShowPopup.value) {
    isShowPopup.value = false;
    document.body.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';
  } else {
    isShowPopup.value = true;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.classList.add('overflow-hidden');
    document.body.style.paddingRight = `${scrollBarWidth}px`;

  }
};
</script>

<template>
  <div
    class="group/card mb-6 xs:mb-0 last:mb-0 rounded-lg transition-brand"
    :class="[
      !slider ? `xs:w-[calc(50%-8px)] md:w-[calc(33.3333%-11px)] lg:w-[calc(50%-8px)] xl:w-[calc(33.3333%-11px)] 2xl:w-[calc(25%-12px)
        shadow-gray-light hover:shadow-gray-hard no-hover-shadow-light` : ''
    ]"
  >
    <div class="relative flex flex-col h-full">
      <div
        class="group-hover/card:lg:opacity-100 absolute top-3.5 left-3 right-3 flex items-center gap-2 lg:opacity-0 transition-brand"
      >
        <div
          v-if="product.tags"
          class="z-10 relative hidden sm:block py-1 px-1.5 text-xs rounded-md border border-gray-400 shadow-gray-light
            bg-brand-light/90 select-none"
        >
          {{ product.tags[0] }}
        </div>

        <div
          class="group z-10 relative flex items-center justify-center w-[30px] h-[30px] border border-gray-400 rounded-md ml-auto
          bg-white/90 transition-brand cursor-pointer select-none"
          :class="[
            compareStore.isProductInCompare(product.id) ? 'text-accent shadow-accent-light' : 'text-gray-900 shadow-gray-light'
          ]"
          @click="compareStore.updateCompare(product.id)"
        >
          <svg-compare class="w-6 animation-compare" />
        </div>

        <div
          class="group z-10 relative flex items-center justify-center w-[30px] h-[30px] border border-gray-400 rounded-md bg-white/90
            transition-brand cursor-pointer select-none"
          :class="[
            favoriteStore.isProductInFavorite(product.id) ? 'text-accent shadow-accent-light' : 'text-gray-900 shadow-gray-light'
          ]"
          @click="favoriteStore.updateFavorite(product.id)"
        >
          <svg-heart class="w-6 animation-pulse-little" />
        </div>
      </div>

      <nuxt-link
        :to="{
          name: 'catalog-category-subcategory-subsubcategory-product',
          params: {
            category: product.category.slug,
            subcategory: product.subcategory.slug,
            subsubcategory: product.subsubcategory.slug,
            product: product.slug
          }
        }"
        class="block rounded-t-lg mb-1 bg-white"
      >
        <div class="relative overflow-hidden pt-[100%]">
          <div
            v-if="product.images.length === 0"
            class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-t-lg bg-gray-100"
          >
            <svg-photo class="w-14" />
          </div>

          <div
            v-else-if="product.images.length === 1"
            class="absolute top-0 right-0 bottom-0 left-0"
          >
            <img
              :src="product.images[0]"
              :alt="product.name"
              class="w-full h-full rounded-t-lg object-contain"
            >
          </div>

          <template v-else>
            <images-slider
              :images="product.images"
              :name="product.name"
            />
          </template>
        </div>
      </nuxt-link>

      <div class="flex flex-col flex-grow pt-3 pb-4 px-3 sm:px-4 rounded-b-lg bg-white">
        <nuxt-link
          class="flex flex-col items-start h-full"
          :to="{
            name: 'catalog-category-subcategory-subsubcategory-product',
            params: {
              category: product.category.slug,
              subcategory: product.subcategory.slug,
              subsubcategory: product.subsubcategory.slug,
              product: product.slug
            }
          }"
        >
          <tooltip :article="product.article" />

          <div class="flex flex-col shrink h-full">
            <h3
              class="text-sm lg:text-base !leading-tight font-bold mt-1 mb-3 line-clamp-2 text-ellipsis overflow-hidden"
              :class="{ 'group-hover/card:text-brand transition-brand': slider }"
            >
              {{ product.name }}
            </h3>

            <div class="flex justify-between sm:justify-normal items-start mt-auto mb-2 lg:mb-0">
              <div class="text-sm sm:text-base lg:text-lg !leading-tight font-bold sm:mr-4">
                {{ priceFormat(String(product.final_price)) }}<span> ₽</span>
              </div>

              <div
                v-if="product.original_price"
                class="relative font-bold text-xs sm:text-sm lg:text-base !leading-tight text-gray-600 mt-px
                  after:absolute after:top-1/2 after:left-0 after:w-full after:h-px after:rotate-[3.04rad] after:bg-red-700"
              >
                {{ priceFormat(String(product.final_price)) }}<span> ₽</span>
              </div>
            </div>
          </div>
        </nuxt-link>

        <div
          v-if="!slider"
          class="z-20 lg:absolute top-full left-0 right-0 lg:px-4 lg:pb-4 rounded-b-lg mt-auto lg:-mt-2
            lg:shadow-gray-hard lg:opacity-0 lg:bg-white
            lg:before:absolute before:top-px before:left-0 before:right-0 before:h-2.5 before:-translate-y-2.5 before:bg-white
            group-hover/card:lg:opacity-100 lg:pointer-events-none group-hover/card:lg:pointer-events-auto transition-brand"
        >
          <div class="hidden lg:block">
            <div class="text-sm mb-0.5">{{ product.stock }} pcs in stock</div>

            <div class="flex mt-0.5 mb-2.5">
              <div class="flex items-center mr-3 mb-3.5">
                <div
                  data-testid="decrease-button"
                  class="flex justify-center items-center w-[34px] min-w-[34px] h-[34px] border border-r-0
                  border-gray-500 rounded-l bg-gray-100 transition-brand cursor-pointer select-none no-hover-toogle-button"
                  :class="[
                    getQuantityFromCart !== null && modelValue >= INPUT_CARD_VALUE.minimumValue ||
                      getQuantityFromCart === null && modelValue > INPUT_CARD_VALUE.minimumValue ?
                      'hover:text-gray-90 hover:border-gray-700 cursor-pointer' : 'opacity-40'
                  ]"
                  @click="onDecreaseButtonClick"
                >
                  <svg-minus class="w-4" />
                </div>

                <base-input
                  v-model="modelValue"
                  :stock="product.stock"
                  class="w-14 max-w-14 h-[34px] py-1 px-1 border border-gray-500 hover:border-gray-700
                    focus:border-brand focus:shadow-brand-light transition-brand"
                />

                <div
                  data-testid="increase-button"
                  class="flex justify-center items-center w-[34px] min-w-[34px] h-[34px] border border-l-0
                  border-gray-500 rounded-r bg-gray-100 transition-brand cursor-pointer select-none no-hover-toogle-button"
                  :class="[
                    modelValue < props.product.stock ? 'hover:text-gray-90 hover:border-gray-700 cursor-pointer' : 'opacity-40'
                  ]"
                  @click="onIncreaseButtonClick"
                >
                  <svg-plus class="w-4" />
                </div>
              </div>

              <div>
                <div class="text-sm text-red-700 whitespace-nowrap">
                  Total:
                  <animate-number :to="getTotalPrice" />
                  ₽
                </div>

                <div
                  v-if="product.original_price"
                  class="text-xs text-gray-700 whitespace-nowrap"
                >
                  Savings:
                  <animate-number :to="getDiscountAmount" />
                  ₽
                </div>
              </div>
            </div>
          </div>

          <button
            class="relative button button_violet w-full px-2.5 sm:px-5 text-xs sm:text-sm lg:text-base lg:mb-4"
            :class="[buttonState.disabled ? 'button_disabled' : 'button_violet']"
            @click="onMainButtonClick"
          >
            {{ buttonState.text }}
            <svg-chevron
              class="w-3 ml-1 sm:ml-4"
              :class="{ 'hidden': buttonState.hiddenSvg }"
            />
          </button>
        </div>
      </div>
    </div>

    <div
      class="z-50 fixed top-0 left-0 flex lg:hidden w-full h-full bg-black/70 transition-[visibility,opacity] duration-500 ease-in-out"
      :class="[isShowPopup ? 'opacity-100 visible' : 'opacity-0 lg:opacity-100 invisible lg:visible delay-300']"
      @click.self="togglePopup"
    >
      <div
        class="relative flex flex-col justify-start w-full p-2.5 md:p-5 pt-9 md:pt-9 lg:pt-0 mt-auto rounded-t-xl translate-y-0
        overflow-auto bg-gray-200 shadow-gray-hard transition-all duration-500 ease-in-out"
        :class="[isShowPopup ? 'max-h-full delay-75' : 'max-h-0 lg:max-h-full']"
      >
        <div class="absolute top-3 left-1/2 w-32 h-1 rounded-full -translate-x-1/2 bg-gray-600"></div>
        <div
          class="absolute top-0 left-0 right-0 h-16"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        ></div>

        <div class="text-xl font-bold mb-3">Enter quantity</div>
        <div class="flex items-center border border-gray-600 rounded-md mb-4 bg-white transition-all
        focus-within:border-brand focus-within:shadow-brand-light outline-none">
          <div
            class="h-full py-3.5 px-4 sm:px-8 text-gray-800 select-none"
            :class="[
              getQuantityFromCart !== null && modelValue >= INPUT_CARD_VALUE.minimumValue ||
                getQuantityFromCart === null && modelValue > INPUT_CARD_VALUE.minimumValue ?
                '' : 'opacity-40 pointer-events-none'
            ]"
            @click="onDecreaseButtonClick"
          >
            <svg-minus class="w-4 sm:w-5" />
          </div>

          <base-input
            v-model="modelValue"
            :stock="product.stock"
            class="w-full px-3 py-2 mx-6 bg-white"
          />

          <div
            class="h-full py-3.5 px-4 sm:px-8 text-gray-800 select-none"
            :class="[modelValue < props.product.stock ? '' : 'opacity-40 pointer-events-none']"
            @click="onIncreaseButtonClick"
          >
            <svg-plus class="w-4 sm:w-5" />
          </div>
        </div>

        <div class="flex flex-wrap justify-between gap-3">
          <div class="text-sm md:text-base text-red-700 mb-4 whitespace-nowrap">
            Total:
            <animate-number :to="getTotalPrice" />
            ₽
          </div>
          <div class="text-sm text-gray-700 whitespace-nowrap">
            Savings:
            <animate-number :to="getDiscountAmount" />
            ₽
          </div>
        </div>
        <div class="text-sm mb-1">{{ product.stock }} pcs in stock</div>

        <button
          class="flex flex-col button button_violet w-full mb-6"
          @click="onMainButtonClick"
        >
          {{ buttonState.textInPopup }}
          <div class="font-light text-xs leading-3 text-center">
            {{ getQuantityFromCart === modelValue ? 'View cart' : `In cart ${getQuantityFromCart} pcs` }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>