import type { ICategory } from 'src/typescript/interfaces';

export class CategoryMapper {
  static map(categories: ICategory[], product: { category_id: number; subcategory_id: number; subsubcategory_id: number }) {
    const categoryPrimary = categories.find(c => c.id === product.category_id);

    if (!categoryPrimary) {
      throw new Error('Category not found for product');
    }

    const category = { id: categoryPrimary.id, name: categoryPrimary.name, slug: categoryPrimary.slug };

    const subcategoryPrimary = categoryPrimary.subcategories.find(s => s.id === product.subcategory_id);

    if (!subcategoryPrimary) {
      throw new Error('Subcategory not found for product');
    }

    const subcategory = { id: subcategoryPrimary.id, name: subcategoryPrimary.name, slug: subcategoryPrimary.slug };

    const subsubcategoryPrimary = subcategoryPrimary.subsubcategories.find(s => s.id === product.subsubcategory_id);

    if (!subsubcategoryPrimary) {
      throw new Error('Subsubcategory not found for product');
    }

    const subsubcategory = { id: subsubcategoryPrimary.id, name: subsubcategoryPrimary.name, slug: subsubcategoryPrimary.slug };

    return { category, subcategory, subsubcategory };
  }
}
