<script setup lang="ts">
import { ref, watch } from 'vue';
import INPUT_CARD_VALUE from '@/constants/input-card-value';

const props = defineProps<{
  modelValue: number;
  stock: number;
}>();

const emits = defineEmits(['update:modelValue']);

const localValue = ref<number>(props.modelValue);

watch(() => props.modelValue, value => {
  localValue.value = value;
});

const onInput = () => {
  const matchedValues = String(localValue.value).match(/\d/g) || [];
  const newValue = matchedValues.join('').slice(0, INPUT_CARD_VALUE.maximumCount);

  if (newValue.length > 0) {
    emits('update:modelValue', Number(newValue));
  }
};

const onInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    (event.target as HTMLInputElement).blur();
  }
};

const onInputChange = () => {
  if (localValue.value > props.stock) {
    localValue.value = props.stock;
  }
  emits('update:modelValue', localValue.value);
};
</script>

<template>
  <input
    v-model="localValue"
    type="number"
    class="text-center text-gray-900"
    @input="onInput"
    @keydown="onInputKeydown"
    @change="onInputChange"
  />
</template>