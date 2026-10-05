import type { CatalogBot, Subcategory } from "../../shared/api/client";

export type SearchCategory = {
  id: number;
  name: string;
  subcategories: Pick<Subcategory, "id" | "name">[];
};

export function getVisibleCategories(bot: CatalogBot): string[] {
  const categories = bot.subcategories.map(
    (subcategory) => subcategory.name,
  );

  if (categories.length <= 1) return categories;
  if (categories.length === 2) return [categories[0], "Еще 1"];

  return [categories[0], `Еще ${categories.length - 1}`];
}

export function formatMau(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}
