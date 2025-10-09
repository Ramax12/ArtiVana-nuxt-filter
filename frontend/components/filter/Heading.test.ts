import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Heading from '@/components/filter/Heading.vue';
import { createTestingPinia } from '@pinia/testing';
import { useFilterStore } from '@/stores/filter.js';

const mockRouterReplace = vi.fn();

vi.mock('vue-router', () => {
  return {
    useRouter: () => ({
      replace: mockRouterReplace,
    }),
  };
});

describe('heading', () => {
  let wrapper: ReturnType<typeof mount>;
  let filterStore: ReturnType<typeof useFilterStore>;

  beforeEach(() => {
    mockRouterReplace.mockClear();

    wrapper = mount(Heading, {
      props: {
        subcategory: {
          id: 10,
          slug: 'Subcatslug',
          name: 'Subcat',
          image: '/img/sub-cat-image.jpg',
          subsubcategories: [
            {
              id: 100,
              slug: 'Subsubcatslug',
              name: 'Subsubcat',
              image: '/img/subsubcat-image.jpg',
            },
          ],
        },
      },
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
          }),
        ],
        stubs: {
          SelectedFilters: true,
          Filters: true,
          Pagination: true,
          OptionSelector: true,
        },
      },
    });

    filterStore = useFilterStore();
    filterStore.filterMeta = {
      count: 20,
      filters: {
        standard: {
          subsubcategories: [],
          brands: [],
          price: {
            base_range: [0, 0],
            range: [0, 0],
          },
          rating: {
            count: 0,
          },
        },
        characteristics: [],
      },
    };
    filterStore.queryParams = { foo: 1 };
    filterStore.selectedFilters = {
      subsubcategories: [],
      price: [null, null],
      brands: [],
      rating: false,
      characteristics: {},
    };
    filterStore.fetchProducts = vi.fn();
    filterStore.buildParams = vi.fn();
  });

  it('toggles filter popup', async () => {
    const vm = wrapper.vm as any;

    expect(vm.isShowFilterPopup).toBe(false);
    await wrapper.find('[data-testid="filters-button"]').trigger('click');
    expect(vm.isShowFilterPopup).toBe(true);
    await wrapper.find('[data-testid="filter-popup"]').trigger('click.self');
    expect(vm.isShowFilterPopup).toBe(false);
  });

  it('toggles sort popup', async () => {
    const vm = wrapper.vm as any;

    expect(vm.isShowSortPopup).toBe(false);
    await wrapper.find('[data-testid="sorting-button"]').trigger('click');
    expect(vm.isShowSortPopup).toBe(true);
    await wrapper.find('[data-testid="sort-popup"]').trigger('click.self');
    expect(vm.isShowSortPopup).toBe(false);
  });

  it('selects a sort option and calls buildParams', async () => {
    const vm = wrapper.vm as any;

    await vm.selectOption('price_desc');
    expect(filterStore.sort).toBe('price_desc');
    expect(filterStore.buildParams).toHaveBeenCalled();
  });

  it('closes popups on swipe down', async () => {
    const vm = wrapper.vm as any;

    vm.isShowSortPopup = true;
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientY: 200 }] as any,
    });
    const touchMove = new TouchEvent('touchmove', {
      touches: [{ clientY: 300 }] as any,
    });
    await vm.handleTouchStart(touchStart);
    await vm.handleTouchMove(touchMove);
    await vm.handleTouchEnd();
    expect(vm.isShowSortPopup).toBe(false);
  });

  it('shows button when filters changed', async () => {
    const vm = wrapper.vm as any;

    vm.oldSelectedFilters = {
      ...filterStore.selectedFilters,
      brands: [1],
    };
    expect(vm.isFilterChanges).toBe(true);
  });
});
