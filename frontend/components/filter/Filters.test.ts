import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Filters from '@/components/filter/Filters.vue';
import { createTestingPinia } from '@pinia/testing';
import { useFilterStore } from '@/stores/filter.js';

describe('filters', () => {
  let wrapper: any;
  let filterStore: ReturnType<typeof useFilterStore>;

  beforeEach(() => {
    localStorage.clear();
    wrapper = mount(Filters, {
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
        stubs: {
          OptionSelector: {
            name: 'OptionSelector',
            template: '<div />',
            emits: ['update:model-value'],
          },
          RangeInput: {
            name: 'RangeInput',
            template: '<div />',
            emits: ['change-value'],
          },
          CompareGroup: true,
        },
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
          }),
        ],
      },
    });

    filterStore = useFilterStore();
    filterStore.selectedFilters = {
      subsubcategories: [],
      price: [0, 1000],
      brands: [],
      rating: false,
      characteristics: {},
    };
    filterStore.filterMeta = {
      count: 40,
      filters: {
        standard: {
          subsubcategories: [{ id: 1, name: 'Lenses', count: 5 }],
          brands: [
            { id: 1, name: 'Brand1', count: 1 },
            { id: 2, name: 'Brand2', count: 1 },
            { id: 3, name: 'Brand3', count: 1 },
            { id: 4, name: 'Brand4', count: 1 },
            { id: 5, name: 'Brand5', count: 1 },
            { id: 6, name: 'Brand6', count: 1 },
          ],
          price: { base_range: [0, 0], range: [0, 1000] },
          rating: { count: 5 },
        },
        characteristics: [
          {
            id: 1,
            name: 'Color',
            value: 'color',
            options: [
              { id: 1, name: 'Red', count: 2 },
              { id: 2, name: 'Blue', count: 3 },
            ],
          },
        ],
      },
    };
    filterStore.buildParams = vi.fn();
    filterStore.updateSelectedFilters = vi.fn();
  });

  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  global.ResizeObserver = ResizeObserver;

  it('toggles category open/close on click', async () => {
    const categoryHeader = wrapper.find('[data-testid="category-header-subsubcategory"]');

    await categoryHeader.trigger('click');
    expect(wrapper.vm.isCategoryOpen).not.toContain('subsubcategory');

    await categoryHeader.trigger('click');
    expect(wrapper.vm.isCategoryOpen).toContain('subsubcategory');
  });

  it('calls store updateSelectedFilters on option click', async () => {
    const option = wrapper.findComponent({ name: 'OptionSelector' });

    await option.vm.$emit('update:model-value', true);
    expect(filterStore.updateSelectedFilters).toHaveBeenCalled();
  });

  it('shows more brands on "Show More" click', async () => {
    const showMore = wrapper.find('[data-testid="show-more-button"]');

    await showMore.trigger('click');
    expect(wrapper.vm.isShownItem).toContain('brand');
  });
});
