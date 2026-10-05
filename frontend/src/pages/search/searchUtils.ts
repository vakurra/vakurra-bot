import type { CatalogBot, Subcategory } from "../../shared/api/client";

export type SearchCategory = {
  id: number;
  name: string;
  subcategories: Pick<Subcategory, "id" | "name">[];
};

export function buildSearchCategories(
  bots: CatalogBot[],
): SearchCategory[] {
  const categoryMap = new Map<number, SearchCategory>();

  for (const bot of bots) {
    for (const subcategory of bot.subcategories) {
      const category = categoryMap.get(subcategory.category_id);

      if (category) {
        if (!category.subcategories.some(({ id }) => id === subcategory.id)) {
          category.subcategories.push(subcategory);
        }
        continue;
      }

      categoryMap.set(subcategory.category_id, {
        id: subcategory.category_id,
        name: subcategory.category_name,
        subcategories: [subcategory],
      });
    }
  }

  return Array.from(categoryMap.values());
}

export function filterCatalogBots(
  bots: CatalogBot[],
  query: string,
  selectedSubcategoryIds: number[],
): CatalogBot[] {
  const normalizedQuery = query.trim().toLowerCase();

  return bots.filter((bot) => {
    const matchesSearch =
      normalizedQuery === "" ||
      [bot.name, bot.username, bot.about, bot.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));

    const matchesCategories =
      selectedSubcategoryIds.length === 0 ||
      bot.subcategories.some(({ id }) =>
        selectedSubcategoryIds.includes(id),
      );

    return matchesSearch && matchesCategories;
  });
}

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
