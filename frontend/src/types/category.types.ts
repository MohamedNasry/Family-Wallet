export type Category = {
    categoryId: number;
    name: string;
    isHarmful: boolean;
  };

export type CategoriesResponse = {
  success: boolean;
  count: number;
  categories: Category[];
};

