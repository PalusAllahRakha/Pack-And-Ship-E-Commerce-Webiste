import type { Category } from "@/lib/types";
import { MODEL_PATHS } from "@/lib/models";

export const CATEGORY_SHOWCASE_MODELS: Record<Category, string> = {
  fruit: MODEL_PATHS.fruit,
  electronics: MODEL_PATHS.headphones,
  furniture: MODEL_PATHS.furniture,
};

/** Product detail: only use GLB when a dedicated model path is set on the product. */
export function getProductModelPath(model3d?: string): string | null {
  return model3d ?? null;
}

export function getCategoryShowcaseModel(category: Category): string {
  return CATEGORY_SHOWCASE_MODELS[category];
}
