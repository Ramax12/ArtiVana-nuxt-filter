import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import InputCard from '@/components/card/BaseInput.vue';
import INPUT_CARD_VALUE from '@/constants/input-card-value.js';

describe('input-card', () => {
  it('renders initial value', () => {
    const wrapper = mount(InputCard, {
      props: { modelValue: 5, stock: 10 },
    });

    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('5');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(InputCard, {
      props: { modelValue: 0, stock: 100 },
    });
    const input = wrapper.find('input');

    await input.setValue('123456');

    const expectedValue = Number('123456'.slice(0, INPUT_CARD_VALUE.maximumCount));
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([expectedValue]);
  });

  it('blurs input on Enter key', async () => {
    const wrapper = mount(InputCard, {
      props: { modelValue: 0, stock: 100 },
    });
    const input = wrapper.find('input');
    const blurSpy = vi.spyOn(input.element, 'blur');

    await input.trigger('keydown', { key: 'Enter' });
    expect(blurSpy).toHaveBeenCalled();
  });
});
