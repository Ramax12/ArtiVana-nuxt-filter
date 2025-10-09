import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFilterStore } from '@/stores/filter.js';

const mockFetch = vi.fn();
(globalThis as any).$fetch = mockFetch;

(globalThis as any).useFetch = vi.fn((url, options) => ({
  data: { value: [] },
}));

describe('useFilterStore', () => {
  let filterStore: ReturnType<typeof useFilterStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    filterStore = useFilterStore();
  });

  it('buildParams generates query from selectedFilters', () => {
    filterStore.selectedFilters.subsubcategories = [1, 2];
    filterStore.selectedFilters.price = [100, 500];
    filterStore.selectedFilters.brands = [3];
    filterStore.selectedFilters.rating = true;
    filterStore.selectedFilters.characteristics = { color: [10, 11] };
    filterStore.sort = 'price_desc';
    filterStore.page = 2;

    filterStore.buildParams();

    expect(filterStore.queryParams).toEqual({
      subsubcategories: [1, 2],
      min_price: 100,
      max_price: 500,
      brands: [3],
      rating: 1,
      'characteristics[color]': ['10', '11'],
      sort: 'price_desc',
      page: 2,
    });
  });

  it('updateSelectedFilters toggles brands correctly', () => {
    filterStore.updateSelectedFilters('brands', 42, true);
    expect(filterStore.selectedFilters.brands).toContain(42);

    filterStore.updateSelectedFilters('brands', 42, false);
    expect(filterStore.selectedFilters.brands).not.toContain(42);
  });

  it('updateSelectedFilters toggles characteristics correctly', () => {
    filterStore.updateSelectedFilters('characteristics[color]', 99, true);
    expect(filterStore.selectedFilters.characteristics.color).toContain(99);

    filterStore.updateSelectedFilters('characteristics[color]', 99, false);
    expect(filterStore.selectedFilters.characteristics.color).not.toContain(99);
  });

  it('parseQuery updates state from query params', () => {
    const query = {
      min_price: '50',
      max_price: '200',
      rating: '1',
      brands: ['1', '2'],
      subsubcategories: '3',
      'characteristics[size]': ['5', '6'],
      sort: 'rating',
      page: '3',
    };

    const baseParams = { subcategory: 10 };
    filterStore.parseQuery(query, baseParams);

    expect(filterStore.selectedFilters.price).toEqual([50, 200]);
    expect(filterStore.selectedFilters.rating).toBe(true);
    expect(filterStore.selectedFilters.brands).toEqual([1, 2]);
    expect(filterStore.selectedFilters.subsubcategories).toEqual([3]);
    expect(filterStore.selectedFilters.characteristics.size).toEqual([5, 6]);
    expect(filterStore.sort).toBe('rating');
    expect(filterStore.page).toBe(3);

    expect(filterStore.queryParams).toMatchObject({
      min_price: 50,
      max_price: 200,
      rating: 1,
      brands: [1, 2],
      subsubcategories: [3],
      'characteristics[size]': ['5', '6'],
      sort: 'rating',
      page: 3,
    });
  });
});
