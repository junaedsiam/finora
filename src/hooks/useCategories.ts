import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategoriesByAccount,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  getSubCategories,
  deleteSubCategory,
  updateSubCategorySortOrder,
  updateCategorySortOrder,
  getCategoriesForPicker,
} from "@/repositories/category.repository";
import { useAccountStore } from "@/stores/account.store";
import type { CategoryRow, CategoryType } from "@/types/database";

export function useCategories() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<CategoryRow[]>({
    queryKey: ["categories", activeAccountId],
    queryFn: () => getCategoriesByAccount(activeAccountId),
  });
}

export function useCategoriesByType(type: CategoryType) {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<CategoryRow[]>({
    queryKey: ["categories", activeAccountId, type],
    queryFn: () => getCategoriesByType(activeAccountId, type),
    enabled: !!type,
  });
}

export function useCategory(id: number) {
  return useQuery<CategoryRow | null>({
    queryKey: ["category", id],
    queryFn: () => {
      const { getCategoryById } = require("@/repositories/category.repository");
      return getCategoryById(id);
    },
  });
}

export function useCategoriesForPicker(type: CategoryType) {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery({
    queryKey: ["categoriesForPicker", activeAccountId, type],
    queryFn: () => getCategoriesForPicker(activeAccountId, type),
    enabled: !!type,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (params: {
      name: string;
      type: CategoryType;
      icon: string;
      color: string;
    }) => createCategory(activeAccountId, params.name, params.type, params.icon, params.color),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", activeAccountId] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (params: { id: number; name: string; icon: string; color: string }) =>
      updateCategory(params.id, params.name, params.icon, params.color),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", activeAccountId] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", activeAccountId] }),
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (sorted: { id: number; sort_order: number }[]) =>
      updateCategorySortOrder(sorted),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories", activeAccountId] });
    },
  });
}

export function useSubCategories(parentId: number) {
  return useQuery<CategoryRow[]>({
    queryKey: ["subcategories", parentId],
    queryFn: () => getSubCategories(parentId),
    enabled: !!parentId,
  });
}

export function useDeleteSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSubCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}

export function useReorderSubCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sorted: { id: number; sort_order: number }[]) =>
      updateSubCategorySortOrder(sorted),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}

export function useCreateSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, name }: { parentId: number; name: string }) =>
      createSubCategory(parentId, name),
    onSuccess: (_, { parentId }) => {
      qc.invalidateQueries({ queryKey: ["subcategories", parentId] });
    },
  });
}

export function useUpdateSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, parentId }: { id: number; name: string; parentId: number }) =>
      updateSubCategory(id, name),
    onSuccess: (_, { parentId }) => {
      qc.invalidateQueries({ queryKey: ["subcategories", parentId] });
    },
  });
}
