"use client";

import { Button } from "@/components/ui/button";
import { List, Item } from "@prisma/client";
import { ArrowLeftIcon, PlusIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@app/shared";

export default function EditListPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: list, error, mutate, isLoading } = useSWR<List & { items: Item[] }>(
    id ? `/api/list/${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-2">
          <Loader2Icon className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading checklist...</p>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-slate-50">
        <p className="text-lg font-semibold text-slate-800">Checklist not found</p>
        <Link href="/">
          <Button variant="default">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Navigation Header */}
        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-slate-100">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-800 hover:bg-slate-100">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Editing Checklist</p>
            <EditableListTitle list={list} onMutate={mutate} />
          </div>
        </div>

        {/* List Items Manager */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Checklist Items</h3>
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 divide-y divide-slate-200/60">
            {list.items && list.items.length > 0 ? (
              list.items
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => (
                  <EditableItemRow
                    key={item.id}
                    item={item}
                    listId={list.id}
                    onMutate={mutate}
                  />
                ))
            ) : (
              <p className="text-center py-6 text-sm text-slate-400 italic">No items in this list yet.</p>
            )}
          </div>

          {/* Add New Item */}
          <div className="pt-2">
            <AddItemRow listId={list.id} onMutate={mutate} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableListTitle({ list, onMutate }: { list: List; onMutate: () => void }) {
  const [name, setName] = useState(list.name || "");
  const originalName = useRef(list.name || "");

  // Update local state when SWR data changes (e.g., initial load or external update)
  useEffect(() => {
    setName(list.name || "");
    originalName.current = list.name || "";
  }, [list.name]);

  const handleBlur = async () => {
    if (name.trim() === "") {
      setName(originalName.current);
      return;
    }
    if (name !== originalName.current) {
      try {
        const response = await fetch(`/api/list/${list.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!response.ok) throw new Error("Failed to rename list");
        originalName.current = name;
        onMutate();
      } catch (err) {
        console.error(err);
        setName(originalName.current);
      }
    }
  };

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={handleBlur}
      className="text-xl font-bold bg-transparent border border-transparent rounded-md px-1 py-0.5 focus:bg-white focus:border-slate-300 focus:ring-1 focus:ring-slate-300 focus:outline-none w-full transition text-slate-950 -ml-1 mt-0.5"
    />
  );
}

function EditableItemRow({
  item,
  listId,
  onMutate,
}: {
  item: Item;
  listId: string;
  onMutate: () => void;
}) {
  const [name, setName] = useState(item.name);
  const originalName = useRef(item.name);

  // Update local state when item props change
  useEffect(() => {
    setName(item.name);
    originalName.current = item.name;
  }, [item.name]);

  const handleBlur = async () => {
    if (name.trim() === "") {
      setName(originalName.current);
      return;
    }
    if (name !== originalName.current) {
      try {
        const response = await fetch("/api/item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            itemId: item.id,
            listId: listId,
          }),
        });
        if (!response.ok) throw new Error("Failed to update item");
        originalName.current = name;
        onMutate();
      } catch (err) {
        console.error(err);
        setName(originalName.current);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to delete item");
      onMutate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center space-x-2 py-2 first:pt-0 last:pb-0">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        className="flex-1 px-2.5 py-1.5 border border-transparent rounded-md focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 text-sm font-medium text-slate-800 bg-transparent hover:bg-slate-100/50 focus:bg-white transition"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
        onClick={handleDelete}
      >
        <Trash2Icon className="w-4 h-4" />
      </Button>
    </div>
  );
}

function AddItemRow({ listId, onMutate }: { listId: string; onMutate: () => void }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          listId: listId,
        }),
      });
      if (!response.ok) throw new Error("Failed to add item");
      setName("");
      onMutate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 py-1">
      <input
        type="text"
        placeholder="Add new item..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
        className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-slate-800 bg-white placeholder:text-slate-400"
      />
      <Button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="text-white bg-blue-600 hover:bg-blue-700 h-9 px-4 text-sm font-semibold rounded-md shadow-sm flex items-center"
      >
        <PlusIcon className="w-4 h-4 mr-1" />
        Add
      </Button>
    </form>
  );
}
