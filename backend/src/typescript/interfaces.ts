import { DeliveryOption, EventType } from './enums.js';
export interface IProduct {
  id: number;
  slug: string;
  group_id: number | null;
  created_at: Date;
  category_id: number;
  subcategory_id: number;
  subsubcategory_id: number;
  name: string;
  article: number;
  brand_id: number;
  model: string | null;
  original_price: number | null;
  final_price: number;
  stock: number;
  images: string[];
  rating: number;
  chars_general: Record<string, number>;
  chars_extra: Record<string, number> | null;
  package: string[] | null;
  description: string;
  shipping_options: DeliveryOption[];
  tags: string[] | null;
}

export interface IProductOption {
  id: number;
  name: string;
}

export interface IProductOptionWithSlug extends IProductOption {
  slug: string;
}

export interface IProductCharacteristic {
  id: number;
  name: string;
  value: string;
  option: IProductOption;
}

export interface IProductDTO {
  id: number;
  slug: string;
  group_id: number | null;
  created_at: Date;
  category: IProductOptionWithSlug;
  subcategory: IProductOptionWithSlug;
  subsubcategory: IProductOptionWithSlug;
  name: string;
  article: number;
  brand: IProductOption;
  model: string | null;
  original_price: number | null;
  final_price: number;
  stock: number;
  images: string[];
  rating: number;
  chars_general: IProductCharacteristic[];
  chars_extra: IProductCharacteristic[] | null;
  package: string[] | null;
  description: string;
  shipping_options: DeliveryOption[];
  tags: string[] | null;
}

export interface IProductCutDown {
  id: number;
  slug: string;
  category: IProductOptionWithSlug;
  subcategory: IProductOptionWithSlug;
  subsubcategory: IProductOptionWithSlug;
  name: string;
  article: number;
  original_price: number | null;
  final_price: number;
  stock: number;
  images: string[];
  tags: string[] | null;
}

export interface ISubsubcategory {
  id: number;
  slug: string;
  name: string;
  image: string;
}
export interface ISubcategory {
  id: number;
  slug: string;
  name: string;
  image: string;
  subsubcategories: ISubsubcategory[];
}
export interface ICategory {
  id: number;
  slug: string;
  name: string;
  image: string;
  subcategories: ISubcategory[];
}

export interface IOption {
  id: number;
  name: string;
}

export interface INavigation {
  id: number;
  name: string;
  slug: string;
}

export interface IEvent {
  id: number;
  title: string;
  date: string;
  type: EventType;
  link: string;
  image: string;
  summary: string;
  content: string;
}

export interface IFilterDataItem {
  id: number;
  name: string;
  count: number;
}
export interface IFilterDataItemCharacteristics {
  id: number;
  name: string;
  value: string;
  options: IFilterDataItem[];
}
export interface IFilterData {
  standard: {
    subsubcategories: IFilterDataItem[];
    brands: IFilterDataItem[];
    price: {
      base_range: [number, number];
      range: [number, number];
    };
    rating: {
      count: number;
    };
  };
  characteristics: IFilterDataItemCharacteristics[];
}
export interface IFilterMeta {
  count: number;
  filters: IFilterData;
}

export interface ILabels {
  brands: {
    id: number;
    name: string;
  }[];
  chars_general: {
    id: number;
    name: string;
    value: string;
  }[];
  chars_general_options: {
    id: number;
    parent_id: number;
    name: string;
  }[];
  chars_extra: {
    id: number;
    name: string;
    value: string;
  }[];
  chars_extra_options: {
    id: number;
    parent_id: number;
    name: string;
  }[];
}

export interface AddressesOptions {
  id: number;
  country_id: number;
  name: string;
  street: string;
  city: string;
  region: string;
  zip_code: string;
  phone: string;
  default: boolean;
}
