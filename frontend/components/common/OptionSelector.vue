<script setup lang="ts">
import SvgCheck from '@/components/svg/Check.vue';

const props = withDefaults(defineProps<{
  type?: 'checkbox' | 'radio';
  name: string;
  value?: string;
}>(),
  {
    type: 'checkbox',
  },
);

const checked = defineModel<boolean | string | null>();

const pressRadio = () => {
  if (props.type === 'radio' && checked.value === props.value) {
    checked.value = null;
  }
};
</script>

<template>
  <label class="group/checkbox flex items-start gap-2.5 cursor-pointer">
    <input
      v-model="checked"
      :type="type"
      :value="value"
      :name="name"
      class="peer hidden"
      @click="pressRadio"
    >
    <div
      class="relative w-[18px] min-w-[18px] h-[18px] border border-gray-500 group-hover/checkbox:border-gray-600 transition-brand
        select-none"
      :class="[
        type === 'radio' ? `rounded-full peer-checked:border-brand before:absolute before:top-1/2 before:left-1/2
          before:w-2 before:h-2 peer-checked:before:bg-brand before:rounded-full before:-translate-y-1/2 before:-translate-x-1/2` :
          'rounded peer-checked:bg-brand'
      ]"
    >
      <svg-check
        v-if="type === 'checkbox'"
        class="absolute top-1/2 left-1/2 w-2.5 text-white -translate-y-1/2 -translate-x-1/2"
      />
    </div>

    <slot></slot>
  </label>
</template>