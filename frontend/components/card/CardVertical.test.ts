import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CardVertical from '@/components/card/CardVertical.vue';
import { useCartStore } from '@/stores/cart.js';
import { useFavoriteStore } from '@/stores/favorite.js';
import { useCompareStore } from '@/stores/compare.js';

const mockRouterReplace = vi.fn();

vi.mock('vue-router', () => {
  return {
    useRouter: () => ({
      replace: mockRouterReplace,
    }),
  };
});

vi.mock('@/stores/cart.js', () => ({
  useCartStore: () => ({
    getProductQuantity: () => null,
    updateCart: vi.fn(),
  }),
}));

vi.mock('@/stores/favorite.js', () => ({
  useFavoriteStore: () => ({
    isProductInFavorite: () => false,
    updateFavorite: vi.fn(),
  }),
}));
vi.mock('@/stores/compare.js', () => ({
  useCompareStore: () => ({
    isProductInCompare: () => false,
    updateCompare: vi.fn(),
  }),
}));

describe('card-vertical', () => {
  let wrapper: any;

  beforeEach(() => {
    mockRouterReplace.mockClear();

    wrapper = mount(CardVertical, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
      props: {
        product: {
          id: 111111,
          slug: 'slug',
          category: {
            id: 1,
            name: 'CatName',
            slug: 'catslug',
          },
          subcategory: {
            id: 10,
            name: 'SubcatName',
            slug: 'subcatslug',
          },
          subsubcategory: {
            id: 100,
            name: 'SubsubcatName',
            slug: 'subsubcatslug',
          },
          name: 'Name',
          article: 11111,
          brand: {
            id: 1,
            name: 'Neewer',
          },
          final_price: 10000,
          stock: 10,
          images: [],
          chars_general: {
            country_id: 1,
          },
          tags: ['New Arrival', 'Best Seller'],
        },
      },
    });
  });

  it('increases and decreases quantity', async () => {
    const input = wrapper.findComponent({ name: 'BaseInput' });

    expect(input.vm.modelValue).toBe(1);

    await wrapper.find('[data-testid="increase-button"]').trigger('click');
    expect(input.vm.modelValue).toBe(2);

    await wrapper.find('[data-testid="decrease-button"]').trigger('click');
    expect(input.vm.modelValue).toBe(1);
  });

  it('toggles popup correctly', async () => {
    expect(wrapper.vm.isShowPopup).toBe(false);
    wrapper.vm.togglePopup();
    expect(wrapper.vm.isShowPopup).toBe(true);
    wrapper.vm.togglePopup();
    expect(wrapper.vm.isShowPopup).toBe(false);
  });
});
