import { mount } from '@vue/test-utils';
import { describe, vi, it, expect, beforeAll } from 'vitest';
import RangeSlider from '@/components/common/RangeSlider.vue';

describe('range-slider', () => {
  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  });

  it('renders single thumb slider', async () => {
    const wrapper = mount(RangeSlider, {
      props: {
        modelValue: 5,
        min: 0,
        max: 10,
      },
    });

    expect(wrapper.find('[data-testid="range-slider"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="range-slider-thumb-wrapper"]').length).toBe(2);
  });

  it('renders double thumb slider', async () => {
    const wrapper = mount(RangeSlider, {
      props: {
        modelValue: [2, 8],
        min: 0,
        max: 10,
      },
    });

    const thumbs = wrapper.findAll('[data-testid="range-slider-thumb-wrapper"]');
    expect(thumbs.length).toBe(2);
    expect(wrapper.find('[data-testid="range-slider-thumb"]').exists()).toBe(true);
  });

  it('emits update:modelValue on click (single slider)', async () => {
    vi.useFakeTimers();

    const wrapper = mount(RangeSlider, {
      attachTo: document.body,
      props: {
        modelValue: 3,
        min: 0,
        max: 10,
      },
    });

    Object.defineProperty(wrapper.find('[data-testid="range-slider"]').element, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        width: 100,
        height: 10,
        top: 0,
        right: 100,
        bottom: 10,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    await wrapper.find('[data-testid="range-slider"]').trigger('click', { clientX: 50 });

    vi.advanceTimersByTime(300);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const val = wrapper.emitted('update:modelValue')?.[0]?.[0];
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(10);

    vi.useRealTimers();
  });

  it('emits update:modelValue on click (double slider)', async () => {
    vi.useFakeTimers();

    const wrapper = mount(RangeSlider, {
      attachTo: document.body,
      props: {
        modelValue: [1, 9],
        min: 0,
        max: 10,
      },
    });

    Object.defineProperty(wrapper.find('[data-testid="range-slider"]').element, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        width: 100,
        height: 10,
        top: 0,
        right: 100,
        bottom: 10,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    await wrapper.find('[data-testid="range-slider"]').trigger('click', { clientX: 20 });

    vi.advanceTimersByTime(300);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as number[];
    expect(Array.isArray(emitted)).toBe(true);
    expect(emitted.length).toBe(2);

    vi.useRealTimers();
  });
});
