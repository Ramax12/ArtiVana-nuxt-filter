import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RangeInput from '@/components/filter/RangeInput.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import RangeSlider from '@/components/common/RangeSlider.vue';

describe('RangeInput', () => {
  let wrapper: any;

  const props = {
    modelValue: [10, 50],
    names: ['minPrice', 'maxPrice'],
    min: 0,
    max: 100,
    baseMin: 0,
    baseMax: 100,
    suffix: '₽',
    format: 'number',
  };

  beforeEach(() => {
    wrapper = mount(RangeInput, {
      props,
      global: {
        stubs: { BaseInput, RangeSlider },
      },
      attachTo: document.body,
    });
  });

  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  global.ResizeObserver = ResizeObserver;

  it('opens slider on click', async () => {
    expect(wrapper.vm.isOpen).toBe(false);

    await wrapper.trigger('click');

    expect(wrapper.vm.isOpen).toBe(true);
  });

  it('closes slider on click outside when isOpenSlider is false', async () => {
    wrapper.vm.isOpen = true;

    document.body.click();
    await new Promise(r => setTimeout(r, 0));

    expect(wrapper.vm.isOpen).toBe(false);
  });

  it('does not close on outside click when isOpenSlider is true', async () => {
    await wrapper.setProps({ isOpenSlider: true });
    wrapper.vm.isOpen = true;

    document.body.click();
    await new Promise(r => setTimeout(r, 0));

    expect(wrapper.vm.isOpen).toBe(true);
  });

  it('clamps max to baseMax', async () => {
    wrapper.vm.localValue = [10, 200];
    wrapper.vm.changeValue('max');

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.localValue[1]).toBe(props.baseMax);
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
  });

  it('clamps min to baseMin', async () => {
    wrapper.vm.localValue = [-10, 50];
    wrapper.vm.changeValue('min');

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.localValue[0]).toBe(props.baseMin);
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
  });

  it('ensures min is not greater than max', async () => {
    wrapper.vm.localValue = [80, 50];
    wrapper.vm.changeValue('min');

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.localValue[1]).toBe(80);
  });

  it('ensures max is not less than min', async () => {
    wrapper.vm.localValue = [20, 10];
    wrapper.vm.changeValue('max');

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.localValue[0]).toBe(10);
  });

  it('emits update:modelValue when BaseInput triggers change-value', async () => {
    const inputs = wrapper.findAllComponents(BaseInput);

    await inputs[0].vm.$emit('change-value', 'min');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
  });
});
