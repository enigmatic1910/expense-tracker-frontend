"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { Plus, X, Tag, Loader2 } from "lucide-react";
import {
  addCategory as createCategory,
  getCategories,
  type Category,
} from "@/lib/api/categories";

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await getCategories();
        if (active) setCategories(data);
      } catch (loadError) {
        console.error("Failed to load categories:", loadError);
        if (active) setError("Failed to load categories.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const addCategory = async () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;

    if (
      categories.some(
        (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setError("This category already exists.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const savedCategory = await createCategory(trimmed);
      setCategories((current) => [...current, savedCategory]);
      setNewCat("");
      setIsAdding(false);
    } catch (saveError) {
      console.error("Failed to add category:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to add category.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-card p-6 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-app-primary">
            <Tag className="size-4.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-app-text-primary">
              Manage Categories
            </h3>
            <p className="text-xs text-app-text-secondary">
              Personalize expense categories for AI detection
            </p>
          </div>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-app-primary hover:bg-indigo-100 transition shadow-xs"
          >
            <Plus className="size-3.5 stroke-[2.5]" /> Add New
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {loading ? (
          <Loader2 className="size-4 animate-spin text-app-primary" />
        ) : categories.length === 0 ? (
          <span className="text-xs text-app-text-muted">
            No categories found.
          </span>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="group flex items-center gap-2 rounded-xl border border-app-border bg-gray-50/70 px-3 py-1.5 text-xs font-medium text-app-text-primary transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span>{category.name}</span>
            </div>
          ))
        )}

        {isAdding && (
          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
            <input
              autoFocus
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void addCategory();
              }}
              disabled={saving}
              placeholder="Category name..."
              className="h-8 w-36 rounded-lg border border-app-border bg-app-surface px-2.5 text-xs font-medium text-app-text-primary placeholder:text-app-text-muted outline-none transition focus:border-app-primary focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => void addCategory()}
              disabled={saving}
              className="flex size-8 items-center justify-center rounded-lg bg-app-primary text-white shadow-xs transition hover:bg-app-primary-hover active:scale-95"
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex size-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-app-text-muted transition hover:bg-gray-50 hover:text-app-text-primary"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <p className="mt-3 text-[11px] text-app-text-muted">
        * These categories help the AI automatically organize expense entries.
      </p>
    </div>
  );
};
