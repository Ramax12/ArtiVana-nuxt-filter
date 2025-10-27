<script setup lang='ts'>
import { ref, useTemplateRef, watch, onMounted, onBeforeUnmount } from 'vue';
import priceFormat from '@/utils/price-format';
import BaseInput from '@/components/common/BaseInput.vue';
import RangeSlider from '@/components/common/RangeSlider.vue';

const props = defineProps<{
  modelValue: (number | null)[];
  names: string[];
  min: number;
  max: number;
  baseMin: number;
  baseMax: number;
  suffix: string;
  format: string;
  placeholder?: string;
  isOpenSlider?: boolean;
}>();

const emits = defineEmits(['update:modelValue']);

const localValue = ref<(number | null)[]>(props.modelValue);
const rangeInputElement = useTemplateRef<HTMLInputElement>('rangeInputElement');
const isOpen = ref<boolean>(props.isOpenSlider ?? false);

watch(() => props.modelValue, value => {
  localValue.value = value;
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (event: Event) => {
  if (!props.isOpenSlider && rangeInputElement.value && !rangeInputElement.value.contains(event.target as HTMLElement)) {
    isOpen.value = false;
  }
};

const onClickToOpen = () => {
  isOpen.value = true;
};

const changeValue = (type: string) => {
  let min = localValue.value[0] ?? null;
  let max = localValue.value[1] ?? null;

  if (min !== null && min < props.baseMin) {
    min = props.baseMin;
  } else if (min !== null && min > props.baseMax) {
    min = max || props.baseMax;
  } else if (min !== null && max !== null && min > max && type === 'min') {
    max = min;
  }

  if (max !== null && max > props.baseMax) {
    max = props.baseMax;
  } else if (max !== null && max < props.baseMin) {
    max = min || props.baseMin;
  } else if (min !== null && max !== null && max < min && type === 'max') {
    min = max;
  }

  localValue.value = [min, max];

  emits('update:modelValue', localValue.value);
};
</script>

<template>
  <div
    ref="rangeInputElement"
    class="w-full"
    @click="onClickToOpen"
  >
    <div class="flex items-center gap-1.5 mb-4">
      <base-input
        v-model="localValue[0]"
        :format="format"
        :name="names[0] ?? ''"
        inputmode="numeric"
        :extra-label="`${placeholder} from`"
        :suffix="suffix"
        :placeholder="min ? `from ${priceFormat(String(min))} ₽` : ''"
        autocomplete="off"
        @change-value="changeValue('min')"
      />

      <div class="w-5 h-px bg-gray-700"></div>

      <base-input
        v-model="localValue[1]"
        :format="format"
        :name="names[1] ?? ''"
        inputmode="numeric"
        :extra-label="`${placeholder} to`"
        :suffix="suffix"
        :placeholder="max ? `to ${priceFormat(String(max))} ₽` : ''"
        autocomplete="off"
        @change-value="changeValue('max')"
      />
    </div>

    <div
      v-if="isOpen"
      class="px-3 my-2.5"
    >
      <range-slider
        :modelValue="localValue"
        :min="baseMin"
        :max="baseMax"
        @update:model-value="value => emits('update:modelValue', value)"
      />
    </div>
  </div>
</template>
