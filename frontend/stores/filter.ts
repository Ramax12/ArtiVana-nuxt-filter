import { defineStore } from 'pinia';
import type { IProductDTO, IFilterMeta, ISelectedFilters } from '@/typescript/interfaces.js';
import type { LocationQuery } from 'vue-router';
import type { FetchError } from 'ofetch';

export const useFilterStore = defineStore('filter', {
  state: () => ({
    products: [] as IProductDTO[],
    filterMeta: {} as IFilterMeta,
    selectedFilters: {
      subsubcategories: [],
      price: [null, null],
      brands: [],
      rating: false,
      characteristics: {},
    } as ISelectedFilters,
    sort: null as string | null,
    page: 1 as number,
    queryParams: {} as Record<string, any>,
    loadProducts: true,
    isLoading: null as boolean | null,
  }),

  actions: {
    async getProducts(params: Record<string, any>) {
      this.isLoading = true;

      const { data, error } = await useFetch<IProductDTO[]>('/api/products/filter', {
        params,
        default: () => [],
        onError(error: FetchError) {
          console.error('Error fetching', error);
        },
      });
      this.products = error?.value ? [] : data.value;
      this.isLoading = false;
    },

    async getFilters(params: Record<string, any>) {
      const { data, error } = await useFetch<IFilterMeta>('/api/products/filter-meta', {
        params,
        default: () => [],
        onError(error: FetchError) {
          console.error('Error fetching', error);
        },
      });
      this.filterMeta = error?.value ? {} : data.value;
    },

    async fetchProducts(params: Record<string, any>) {
      this.isLoading = true;

      try {
        this.products = await $fetch<IProductDTO[]>('/api/products/filter', { params });
      } catch (error) {
        console.error('Error fetching', error);
        this.products = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchFilters(params: Record<string, any>) {
      try {
        this.filterMeta = await $fetch<IFilterMeta>('/api/products/filter-meta', { params });
      } catch (error) {
        console.error('Error fetching', error);
        this.filterMeta = {} as IFilterMeta;
      }
    },

    buildParams() {
      let query: Record<string, any> = {};

      Object.entries(this.selectedFilters).forEach(([key, value]) => {
        if (key === 'subsubcategories' || key === 'brands') {
          if (Array.isArray(value) && value.length) {
            query[key] = value;
          }
        }

        if (key === 'price' && Array.isArray(value)) {
          if (value[0] !== null) {
            query['min_price'] = value[0];
          }
          if (value[1] !== null) {
            query['max_price'] = value[1];
          }
        }

        if (key === 'rating' && value) {
          query[key] = 1;
        }

        if (key === 'characteristics' && value) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            query[`characteristics[${subKey}]`] = subValue.map(String);
          });
        }
      });

      if (this.sort) {
        query.sort = this.sort;
      }

      if (this.page !== 1) {
        query.page = this.page;
      }

      this.queryParams = query;
    },

    updateSelectedFilters(key: string, value: number, checked: boolean) {
      if (key === 'subsubcategories' || key === 'brands') {
        if (checked) {
          this.selectedFilters[key].push(value);
        } else {
          this.selectedFilters[key] = this.selectedFilters[key].filter(v => v !== value);
        }
      } else if (key.startsWith('characteristics[')) {
        const match = key.match(/^characteristics\[(.+)\]$/);

        if (match) {
          const characteristicName = match[1];
          if (!characteristicName) return;

          const arr =
            this.selectedFilters.characteristics[characteristicName] ?? (this.selectedFilters.characteristics[characteristicName] = []);

          if (checked) {
            if (!arr.includes(value)) {
              arr.push(value);
            }
          } else {
            const index = arr.indexOf(value);

            if (index !== -1) {
              arr.splice(index, 1);
            }
          }
        }
      }

      this.page = 1;

      this.buildParams();
    },

    parseQuery(query: LocationQuery, baseParams: Record<string, number>) {
      for (const [key, value] of Object.entries(query)) {
        if (value === null) continue;

        if (key === 'min_price') {
          this.selectedFilters.price[0] = Number(value);
        } else if (key === 'max_price') {
          this.selectedFilters.price[1] = Number(value);
        } else if (key === 'rating' && value === '1') {
          this.selectedFilters[key] = true;
        } else if (key === 'brands' || key === 'subsubcategories') {
          this.selectedFilters[key] = Array.isArray(value) ? value.map(v => Number(v)) : [Number(value)];
        } else if (key.startsWith('characteristics[')) {
          const match = key.match(/^characteristics\[(.+)\]$/);

          if (match) {
            const characteristicName = match[1];

            if (characteristicName) {
              const values = Array.isArray(value) ? value.map(v => Number(v)) : [Number(value)];

              if (!this.selectedFilters.characteristics[characteristicName]) {
                this.selectedFilters.characteristics[characteristicName] = [];
              }

              this.selectedFilters.characteristics[characteristicName] = values;
            }
          }
        } else if (key === 'sort') {
          this.sort = String(value);
        } else if (key === 'page') {
          this.page = Number(value);
        }
      }

      this.buildParams();

      const mergedParams = {
        ...baseParams,
        ...this.queryParams,
      };

      this.getFilters(mergedParams);
      this.getProducts(mergedParams);
    },

    resetFilters() {
      this.selectedFilters = {
        subsubcategories: [],
        price: [null, null],
        brands: [],
        rating: false,
        characteristics: {},
      };
      this.page = 1;
      this.sort = null;
      this.queryParams = {};

      this.buildParams();
    },
  },
});
