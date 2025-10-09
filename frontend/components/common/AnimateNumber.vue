<script setup lang="ts">
import { ref, watch } from 'vue';
import priceFormat from '@/utils/price-format';

const props = withDefaults(defineProps<{
  to: number;
  duration?: number;
}>(),
  {
    duration: 400
  },
);

const animatedValue = ref<number>(props.to);
let animationFrameId: number | null = null;

watch(() => props.to, value => {
  animateTo(value, props.duration);
});

const animateTo = (finalNumber: number, duration: number) => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  const start = performance.now();
  const startValue = animatedValue.value;
  const diff = finalNumber - startValue;

  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    animatedValue.value = Math.round(startValue + diff * progress);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      animationFrameId = null;
    }
  };

  animationFrameId = requestAnimationFrame(step);
};
</script>

<template>
  <span>{{ priceFormat(String(animatedValue)) }}</span>
</template>
