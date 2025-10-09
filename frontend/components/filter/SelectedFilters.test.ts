import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SelectedFilters from '@/components/filter/SelectedFilters.vue';
import { createTestingPinia } from '@pinia/testing';
import { useFilterStore } from '@/stores/filter.js';

describe('selected-filters', () => {
  let wrapper: any;
  let filterStore: ReturnType<typeof useFilterStore>;

  beforeEach(() => {
    wrapper = mount(SelectedFilters, {
      global: {
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
      subsubcategories: [1],
      price: [1000, 2000],
      brands: [1],
      rating: true,
      characteristics: {
        color: [1, 2],
      },
    };
    filterStore.filterMeta = {
      count: 20,
      filters: {
        standard: {
          subsubcategories: [{ id: 1, name: 'Subsubcat', count: 3 }],
          brands: [{ id: 1, name: 'Aputure', count: 9 }],
          price: {
            base_range: [0, 0],
            range: [0, 0],
          },
          rating: {
            count: 0,
          },
        },
        characteristics: [
          {
            id: 1,
            name: 'Color',
            value: 'color',
            options: [
              { id: 1, name: 'Red', count: 4 },
              { id: 2, name: 'Blue', count: 9 },
            ],
          },
        ],
      },
    };
    filterStore.page = 1;
    filterStore.buildParams = vi.fn();
  });

  it('displays the selected subcategory', () => {
    filterStore.selectedFilters.subsubcategories = [1];

    expect(wrapper.find('[data-testid="subsubcategory-text"]').text()).toContain('Department: Subsubcat');
  });

  it('displays the selected brand', () => {
    filterStore.selectedFilters.brands = [10];

    expect(wrapper.find('[data-testid="brand-text"]').text()).toContain('Brand: Aputure');
  });

  it('displays the price "from - to"', () => {
    filterStore.selectedFilters.price = [1000, 2000];

    expect(wrapper.find('[data-testid="price-text"]').text().replace(/\s+/g, ' ')).toContain('1 000 ₽ – 2 000 ₽');
  });

  it('displays the rating', () => {
    filterStore.selectedFilters.rating = true;

    expect(wrapper.find('[data-testid="rating-text"]').text()).toContain('Rating: 4+ stars');
  });

  it('displays the characteristic and its options', () => {
    filterStore.selectedFilters.characteristics = { color: [1, 2] };

    expect(wrapper.find('[data-testid="characteristic-text"]').text()).toContain('Color: Red, Blue');
  });

  it('clears a specific filter (subsubcategories)', async () => {
    filterStore.selectedFilters.subsubcategories = [1];

    await wrapper.find('[data-testid="subsubcategories-item"]').trigger('click');
    expect(filterStore.selectedFilters.subsubcategories).toEqual([]);
    expect(filterStore.buildParams).toHaveBeenCalled();
  });

  it('clears all filters', async () => {
    filterStore.selectedFilters = {
      subsubcategories: [1],
      price: [100, 200],
      brands: [10],
      rating: true,
      characteristics: { color: [1] },
    };

    await wrapper.find('[data-testid="clear-all-button"]').trigger('click');
    expect(filterStore.selectedFilters).toEqual({
      subsubcategories: [],
      price: [null, null],
      brands: [],
      rating: false,
      characteristics: {},
    });
    expect(filterStore.buildParams).toHaveBeenCalled();
  });
});
