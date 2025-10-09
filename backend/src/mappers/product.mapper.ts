import { IProduct, IProductDTO, ILabels, ICategory, IProductCharacteristic } from 'src/typescript/interfaces';
import { CategoryMapper } from 'src/mappers/category.mapper';

export class ProductMapper {
  static toFull(product: IProduct, categories: ICategory[], labels: ILabels): IProductDTO {
    const brand = labels.brands.find(b => b.id === product.brand_id) ?? { id: 0, name: 'Brand' };

    const { category, subcategory, subsubcategory } = CategoryMapper.map(categories, product);

    const chars_general: IProductCharacteristic[] = [];
    for (const [key, id] of Object.entries(product.chars_general ?? {})) {
      const labelChar = labels.chars_general.find(c => c.value === key.replace(/_id$/, ''));
      const labelItem = labels.chars_general_options.find(c => c.id === id);
      if (labelChar && labelItem) {
        chars_general.push({
          id: labelChar.id,
          name: labelChar.name,
          value: labelChar.value,
          option: { id: labelItem.id, name: labelItem.name },
        });
      }
    }

    const chars_extra: IProductCharacteristic[] = [];
    for (const [key, id] of Object.entries(product.chars_extra ?? {})) {
      const labelChar = labels.chars_extra.find(c => c.value === key.replace(/_id$/, ''));
      const labelItem = labels.chars_extra_options.find(c => c.id === id);
      if (labelChar && labelItem) {
        chars_extra.push({
          id: labelChar.id,
          name: labelChar.name,
          value: labelChar.value,
          option: { id: labelItem.id, name: labelItem.name },
        });
      }
    }

    return {
      id: product.id,
      slug: product.slug,
      group_id: product.group_id,
      created_at: product.created_at,
      name: product.name,
      article: product.article,
      model: product.model,
      original_price: product.original_price,
      final_price: product.final_price,
      stock: product.stock,
      images: product.images,
      rating: product.rating,
      package: product.package,
      description: product.description,
      shipping_options: product.shipping_options,
      tags: product.tags,

      brand,
      category,
      subcategory,
      subsubcategory,
      chars_general,
      chars_extra,
    };
  }
}
