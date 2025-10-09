import { Injectable } from '@nestjs/common';
import { prisma } from 'src/prisma/prisma.service';
import { FilterDto } from './dto/filter.dto';
import { ProductMapper } from 'src/mappers/product.mapper';
import { normalizeProduct } from 'src/utils/normalize-product';
import { IProduct, ICategory, IFilterData, IFilterDataItem, IFilterMeta, ILabels, IProductDTO } from 'src/typescript/interfaces';
@Injectable()
export class FilterService {
  private products: IProduct[] = [];
  private categories: ICategory[] = [];
  private labels: ILabels = {
    brands: [],
    chars_general: [],
    chars_general_options: [],
    chars_extra: [],
    chars_extra_options: [],
  };

  constructor() {
    this.loadProducts();
    this.loadCategories();
    this.loadLabels();
  }

  async loadProducts() {
    const rawProducts = await prisma.product.findMany();

    this.products = rawProducts.map(normalizeProduct);
  }

  async loadCategories() {
    this.categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            subsubcategories: true,
          },
        },
      },
    });
  }

  async loadLabels() {
    const [rawBrands, rawCharsGeneral, rawCharsGeneralOptions, rawCharsExtra, rawCharsExtraOptions] = await Promise.all([
      prisma.brand.findMany(),
      prisma.charGeneral.findMany(),
      prisma.charGeneralOption.findMany(),
      prisma.charExtra.findMany(),
      prisma.charExtraOption.findMany(),
    ]);

    this.labels = {
      brands: rawBrands,
      chars_general: rawCharsGeneral,
      chars_general_options: rawCharsGeneralOptions,
      chars_extra: rawCharsExtra,
      chars_extra_options: rawCharsExtraOptions,
    };
  }

  filterProducts(query: FilterDto): IProduct[] {
    let filtered = this.products;

    if (query.subcategory) {
      filtered = filtered.filter(p => p.subcategory_id === query.subcategory);
    }

    if (query.subsubcategory) {
      filtered = filtered.filter(p => p.subsubcategory_id === query.subsubcategory);
    }

    if (query.brands) {
      const brandFilter = Array.isArray(query.brands) ? query.brands : [query.brands];
      filtered = filtered.filter(p => brandFilter.includes(p.brand_id));
    }

    if (query.subsubcategories) {
      const subsubcategoriesFilter = Array.isArray(query.subsubcategories) ? query.subsubcategories : [query.subsubcategories];
      filtered = filtered.filter(p => subsubcategoriesFilter.includes(p.subsubcategory_id));
    }

    if (query.min_price || query.max_price) {
      const min = query.min_price ? query.min_price : 0;
      const max = query.max_price ? query.max_price : Infinity;
      filtered = filtered.filter(p => p.final_price >= min && p.final_price <= max);
    }

    if (query.rating) {
      filtered = filtered.filter(p => p.rating >= 4);
    }

    if (query.characteristics) {
      Object.entries(query.characteristics).forEach(([key, value]) => {
        filtered = filtered.filter(p => value.includes(p.chars_general[`${key}_id`]));
      });
    }

    return filtered;
  }

  getProducts(query: FilterDto): IProductDTO[] {
    const PER_PAGE = 24;
    let products = this.filterProducts(query);
    const page = query.page ?? 1;

    if (query.sort) {
      switch (query.sort) {
        case 'rating_desc':
          products = products.sort((a, b) => b.rating - a.rating);
          break;
        case 'price_asc':
          products = products.sort((a, b) => a.final_price - b.final_price);
          break;
        case 'price_desc':
          products = products.sort((a, b) => b.final_price - a.final_price);
          break;
        case 'name_asc':
          products = products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          products = products.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    products = products.splice(PER_PAGE * (page - 1), PER_PAGE * page);

    return products.map(product => ProductMapper.toFull(product, this.categories, this.labels));
  }

  getPriceRange(products: IProduct[]): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const p of products) {
      if (p.final_price < min) {
        min = p.final_price;
      }
      if (p.final_price > max) {
        max = p.final_price;
      }
    }

    return [min, max];
  }

  private prepareBaseData(query: FilterDto) {
    if (query.subsubcategory || query.subcategory) {
      return this.filterProducts({
        subsubcategory: query.subsubcategory,
        subcategory: query.subcategory,
      } as FilterDto);
    }
    return this.products;
  }

  private buildFilterData(): IFilterData {
    return {
      standard: {
        subsubcategories: [],
        brands: [],
        price: { base_range: [0, 0], range: [0, 0] },
        rating: { count: 0 },
      },
      characteristics: [],
    };
  }

  private collectCategoriesAndBrands(filterData: IFilterData, baseProducts: IProduct[]) {
    baseProducts.forEach(product => {
      const category = this.categories.find(c => c.id === product.category_id);
      const subcategory = category?.subcategories.find(c => c.id === product.subcategory_id);
      const subsubcategory = subcategory?.subsubcategories.find(c => c.id === product.subsubcategory_id);

      if (!filterData.standard.subsubcategories.some(e => e.id === product.subsubcategory_id)) {
        filterData.standard.subsubcategories.push({
          id: product.subsubcategory_id,
          name: subsubcategory?.name ?? '',
          count: 0,
        });
      }

      if (!filterData.standard.brands.some(b => b.id === product.brand_id)) {
        filterData.standard.brands.push({
          id: product.brand_id,
          name: this.labels.brands.find(b => b.id === product.brand_id)?.name ?? '',
          count: 0,
        });
      }
    });
  }

  private collectCharacteristics(filterData: IFilterData, baseProducts: IProduct[]) {
    baseProducts.forEach(product => {
      Object.entries(product.chars_general).forEach(([key, value]) => {
        const item = this.labels.chars_general_options.find(c => c.id === value) ?? { id: 0, parent_id: 0, name: '' };
        const parent = this.labels.chars_general.find(c => c.id === item?.parent_id) ?? { id: 0, name: '', value: '' };

        let currentParent = filterData.characteristics.find(c => c.id === parent.id);
        if (!currentParent) {
          currentParent = {
            id: parent.id,
            name: parent.name,
            value: parent.value,
            options: [],
          };
          filterData.characteristics.push(currentParent);
        }

        if (!currentParent.options.some(e => e.id === product.chars_general[key])) {
          currentParent.options.push({
            id: value,
            name: item.name,
            count: 0,
          });
        }
      });
    });
  }

  private calculateCounts(filterData: IFilterData, query: FilterDto) {
    const updateCount = (items: any[], field: keyof FilterDto) => {
      items.forEach(item => {
        const modifiedQuery = { ...query, [field]: undefined };
        const filtered = this.filterProducts({ ...modifiedQuery, [field]: item.id } as FilterDto);
        item.count = filtered.length;
      });
    };

    updateCount(filterData.standard.subsubcategories, 'subsubcategories');
    updateCount(filterData.standard.brands, 'brands');

    filterData.characteristics.forEach(c => {
      c.options.forEach(option => {
        const q = {
          ...query,
          characteristics: { ...query.characteristics },
        };
        delete q.characteristics[c.value];

        const products = this.filterProducts({
          ...q,
          characteristics: {
            ...q.characteristics,
            [c.value]: [option.id],
          },
        });
        option.count = products.length;
      });
    });
  }

  private applyPriceAndRating(filterData: IFilterData, base: IProduct[], filtered: IProduct[]) {
    filterData.standard.price.base_range = this.getPriceRange(base);
    filterData.standard.price.range = this.getPriceRange(filtered);
    filterData.standard.rating.count = filtered.filter(p => p.rating >= 4).length;
  }

  private sortFilters(filterData: IFilterData) {
    const sortArray = (arr: IFilterDataItem[], key: string) => {
      arr.sort((a, b) => {
        if (a.count === 0 && b.count > 0) return 1;
        if (a.count > 0 && b.count === 0) return -1;

        if (key === 'Power') {
          const numA = parseInt(a.name.replace(/\D/g, ''), 10);
          const numB = parseInt(b.name.replace(/\D/g, ''), 10);
          return numA - numB;
        }
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      });
    };

    sortArray(filterData.standard.brands, 'brands');
    sortArray(filterData.standard.subsubcategories, 'subsubcategories');
    filterData.characteristics.forEach(c => {
      if (c.options.length) sortArray(c.options, c.name);
    });
  }

  getFilterMeta(query: FilterDto): IFilterMeta {
    const filteredProducts = this.filterProducts(query);
    const baseProducts = this.prepareBaseData(query);

    const filterData = this.buildFilterData();

    this.collectCategoriesAndBrands(filterData, baseProducts);
    this.collectCharacteristics(filterData, baseProducts);

    this.calculateCounts(filterData, query);
    this.applyPriceAndRating(filterData, baseProducts, filteredProducts);
    this.sortFilters(filterData);

    return {
      count: filteredProducts.length,
      filters: filterData,
    };
  }
}
