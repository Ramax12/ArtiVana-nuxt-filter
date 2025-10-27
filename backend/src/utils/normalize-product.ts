import { Product } from 'src/modules/product/product.model';
import type { IProduct } from 'src/typescript/interfaces';
import { DeliveryOption } from 'src/typescript/enums';

export function normalizeProduct(p: Product): IProduct {
  return {
    id: p.id,
    slug: p.slug,
    group_id: p.group_id ?? null,
    created_at: p.created_at,
    category_id: p.category_id,
    subcategory_id: p.subcategory_id,
    subsubcategory_id: p.subsubcategory_id,
    name: p.name,
    article: p.article,
    brand_id: p.brand_id,
    model: p.model ?? null,
    original_price: p.original_price ?? null,
    final_price: p.final_price,
    stock: p.stock,
    rating: p.rating,
    images: Array.isArray(p.images) ? p.images.filter((i): i is string => typeof i === 'string') : [],
    chars_general: (p.chars_general as Record<string, number>) ?? null,
    chars_extra: (p.chars_extra as Record<string, number>) ?? null,
    package: Array.isArray(p.package) ? p.package.filter((i): i is string => typeof i === 'string') : null,
    description: p.description,
    shipping_options: Array.isArray(p.shipping_options)
      ? (p.shipping_options.filter((i): i is DeliveryOption => typeof i === 'string') as any)
      : null,
    tags: Array.isArray(p.tags) ? p.tags.filter((i): i is string => typeof i === 'string') : null,
  };
}
