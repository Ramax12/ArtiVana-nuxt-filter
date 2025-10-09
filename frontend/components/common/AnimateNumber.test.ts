import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimatedPrice from '@/components/common/AnimateNumber.vue';
import priceFormat from '@/utils/price-format.js';

vi.mock('@/utils/price-format', () => ({
  default: vi.fn((v: string) => v + ' ₽'),
}));

describe('animated-price', () => {
  let rafCallbacks: Array<FrameRequestCallback> = [];
  let rafId = 0;

  beforeEach(() => {
    let now = 0;
    vi.spyOn(global, 'performance', 'get').mockReturnValue({
      now: () => now,
    } as unknown as Performance);

    rafCallbacks = [];
    rafId = 0;

    vi.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => {
      cb(performance.now() + 400);
      return 1 as unknown as number;
    });
    vi.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial value', () => {
    const wrapper = mount(AnimatedPrice, { props: { to: 1000 } });

    expect(wrapper.text()).toBe('1000 ₽');
    expect(priceFormat).toHaveBeenCalledWith('1000');
  });

  it('updates value when prop changes', async () => {
    const wrapper = mount(AnimatedPrice, { props: { to: 500 } });
    const vm = wrapper.vm as any;

    await wrapper.setProps({ to: 1500 });

    expect(vm.animatedValue).toBe(1500);
    expect(wrapper.text()).toBe('1500 ₽');
  });

  it('resets previous animation when new value comes', async () => {
    const wrapper = mount(AnimatedPrice, { props: { to: 0 } });
    const vm = wrapper.vm as any;

    await wrapper.setProps({ to: 100 });
    await wrapper.setProps({ to: 200 });

    rafCallbacks.forEach(cb => cb(0));

    expect(vm.animatedValue).toBe(200);
    expect(wrapper.text()).toBe('200 ₽');
  });
});
