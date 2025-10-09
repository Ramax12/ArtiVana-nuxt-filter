<script setup lang='ts'>
import { ref, useTemplateRef, watch, onMounted, onUnmounted, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: (number | null)[] | number;
    min: number;
    max: number;
    sliderWidth?: number;
    thumbWidth?: number;
    interval?: number;
  }>(),
  {
    interval: 1,
  }
);

const emits = defineEmits(['update:modelValue']);

const sliderValue = ref<(number | null)[] | number>(0);
const isDragging = ref<boolean>(false);
const rangeSliderElement = useTemplateRef<HTMLInputElement>('rangeSliderElement');
const rangeSliderThumbElement = useTemplateRef<HTMLInputElement>('rangeSliderThumbElement');
const sliderWidth = ref<number>(0);
const thumbPosition = ref<number | null>(null);
const thumbPositionSecond = ref<number | null>(null);
const targetThumbId = ref<string>('0');
const movementThumbsOnClick = ref<boolean>(false);
const durationTransitionThumbs = 200;
let resizeTimer: ReturnType<typeof setTimeout>;

watch(() => props.modelValue, value => {
  if (JSON.stringify(value) !== JSON.stringify(sliderValue.value)) {
    movementThumbsOnClick.value = true;

    if (Array.isArray(props.modelValue)) {
      sliderValue.value = [...props.modelValue];
    } else {
      sliderValue.value = props.modelValue;
    }
    updateThumbPosition();

    setTimeout(() => {
      movementThumbsOnClick.value = false;
    }, durationTransitionThumbs);
  }
}, { deep: true });

watch(() => props.min, value => {
  updateThumbPosition();
});

onMounted(() => {
  if (rangeSliderElement.value) {
    sliderWidth.value = rangeSliderElement.value.clientWidth;

    const resizeObserver = new ResizeObserver(() => {
      const width = rangeSliderElement.value?.clientWidth || 0;

      if (width > 0) {
        sliderWidth.value = width;
        updateThumbPosition();
      }
    });

    resizeObserver.observe(rangeSliderElement.value);
    onUnmounted(() => resizeObserver.disconnect());
  }
});

const sliderTrackWidth = computed(() => {
  return props.sliderWidth ?? sliderWidth.value;
});

const sliderThumbWidth = computed(() => {
  return props.thumbWidth ?? (rangeSliderThumbElement.value?.clientWidth || 0);
});

const numberEntryPoints = computed(() => {
  return props.max - props.min;
});

const calculateThumbPosition = (value: number) => {
  const sliderThumbWidthPercentage = (sliderThumbWidth.value / 2) * 100 / sliderTrackWidth.value;
  return ((value - props.min) / numberEntryPoints.value) * sliderTrackWidth.value * 100 / sliderTrackWidth.value - sliderThumbWidthPercentage;
};

const updateThumbPosition = () => {
  if (Array.isArray(props.modelValue)) {
    thumbPosition.value = calculateThumbPosition(props.modelValue[0] ?? props.min);
    thumbPositionSecond.value = calculateThumbPosition(props.modelValue[1] ?? props.max);
  } else {
    thumbPosition.value = calculateThumbPosition(props.modelValue);
  }
};

const startDrag = (event: MouseEvent | TouchEvent) => {
  targetThumbId.value = (event.target as HTMLElement).id;
  isDragging.value = true;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('touchend', stopDrag);
};

const onDrag = (event: MouseEvent | TouchEvent) => {
  if (isDragging.value) {
    updateThumbPosition();
    updateValue(event);
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);
};

const onClickSlider = (event: MouseEvent) => {
  const rect = (rangeSliderElement.value as HTMLElement).getBoundingClientRect();
  const positionOnClick = (event.clientX - rect.left) * 100 / sliderTrackWidth.value;
  const positionDisplacement = (event.clientX - rect.left - sliderThumbWidth.value / 2) * 100 / sliderTrackWidth.value;

  movementThumbsOnClick.value = true;

  if (Array.isArray(props.modelValue) && thumbPosition.value !== null && thumbPositionSecond.value !== null) {
    const distanceLeft = Math.abs(positionOnClick - thumbPosition.value);
    const distanceRight = Math.abs(positionOnClick - thumbPositionSecond.value);

    if (distanceLeft < distanceRight) {
      thumbPosition.value = positionDisplacement;
      targetThumbId.value = '0';
    } else {
      thumbPositionSecond.value = positionDisplacement;
      targetThumbId.value = '1';
    }
  } else {
    thumbPosition.value = positionDisplacement;
  }

  setTimeout(() => {
    movementThumbsOnClick.value = false;
  }, durationTransitionThumbs);
  updateValue(event);
};

const debounce = (value: (number | null)[] | number) => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    emits('update:modelValue', value);
  }, 300);
};

const updateValue = (event: MouseEvent | TouchEvent) => {
  const rect = (rangeSliderElement.value as HTMLElement).getBoundingClientRect();
  const offsetX = event instanceof MouseEvent ? event.clientX - rect.left : (event.touches[0] ? event.touches[0].clientX - rect.left : 0);
  const percentage = offsetX / sliderTrackWidth.value;

  const calculateValue =
    Math.round(Math.min(Math.max(percentage * (numberEntryPoints.value) + props.min, props.min), props.max) / props.interval) * props.interval;

  if (Array.isArray(props.modelValue)) {
    sliderValue.value = props.modelValue;

    if (targetThumbId.value === '0') {
      if (props.modelValue[1] === null || props.modelValue[1] !== null && calculateValue < (props.modelValue[1] ?? 0)) {
        sliderValue.value[0] = calculateValue;
      }
    } else if (targetThumbId.value === '1') {
      if (props.modelValue[0] === null || props.modelValue[0] !== null && calculateValue > (props.modelValue[0] ?? 0)) {
        sliderValue.value[1] = calculateValue;
      }
    }

    debounce([...sliderValue.value]);
  } else {
    sliderValue.value = calculateValue;

    debounce(sliderValue.value);
  }
};
</script>

<template>
  <div
    ref="rangeSliderElement"
    data-testid="range-slider"
    class="relative h-1.5 rounded-[3px] bg-gray-700 cursor-pointer select-none"
    @mousedown.stop="startDrag"
    @touchstart.stop="startDrag"
    @click.stop="onClickSlider"
  >
    <div
      class="relative h-full bg-brand select-none
        before:absolute before:top-0 before:-left-3 before:w-6 before:h-full before:rounded-l-[3px] before:bg-brand
        after:absolute after:top-0 after:-right-3 after:w-6 after:h-full after:rounded-r-[3px]after:bg-brand"
      :style="{ width: `${sliderTrackWidth}px` }"
    >
    </div>
    <div
      id="0"
      ref="rangeSliderThumbElement"
      data-testid="range-slider-thumb-wrapper"
      class="absolute top-1/2 w-6 h-6 -translate-y-1/2 select-none"
      :class="{ 'transition-[left] duration-200 ease-in-out': movementThumbsOnClick }"
      :style="{ left: `${thumbPosition}%` }"
    >
      <div
        v-show="thumbPosition !== null"
        data-testid="range-slider-thumb"
        class="w-full h-full border-2 border-brand rounded-full bg-white cursor-pointer select-none box-border pointer-events-none"
      ></div>
    </div>

    <div
      id="1"
      data-testid="range-slider-thumb-wrapper"
      class="absolute top-1/2 w-6 h-6 -translate-y-1/2 select-none"
      :style="{ left: thumbPositionSecond + '%' }"
    >
      <div
        v-if="thumbPositionSecond !== null"
        data-testid="range-slider-thumb"
        class="w-full h-full border-2 border-brand rounded-full bg-white cursor-pointer select-none box-border pointer-events-none"
      ></div>
    </div>
  </div>
</template>
