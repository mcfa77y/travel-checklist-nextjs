"use client";

import { Button } from "@/components/ui/button";
import { List, Item } from "@prisma/client";
import { ArrowLeftIcon, PlusIcon, Trash2Icon, Loader2Icon, PrinterIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@app/shared";

export default function EditListPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: list, error, mutate, isLoading } = useSWR<List & { items: Item[] }>(
    id ? `/api/list/${id}` : null,
    fetcher
  );

  const handleDeleteList = async () => {
    if (!list) return;
    if (confirm(`Are you sure you want to delete the checklist "${list.name || "No name"}"?`)) {
      try {
        const response = await fetch(`/api/list/${list.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete checklist");
        router.push("/");
      } catch (err) {
        console.error(err);
      }
    }
  };

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 print:bg-transparent print:py-0 print:px-0">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 print:shadow-none print:border-none print:p-0 print:max-w-none">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 print:mb-4 print:pb-2">
          <div className="flex items-center space-x-4 flex-1">
            <Link href="/" className="print:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider print:hidden">Editing Checklist</p>
              <EditableListTitle list={list} onMutate={mutate} />
            </div>
          </div>
          <div className="flex items-center space-x-2 print:hidden">
            <Button
              variant="outline"
              size="default"
              className="h-9 px-3"
              onClick={() => window.print()}
            >
              <PrinterIcon className="h-4 w-4 mr-1.5" />
              Print
            </Button>
            <Button
              variant="outline"
              size="default"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9 px-3"
              onClick={handleDeleteList}
            >
              <Trash2Icon className="h-4 w-4 mr-1.5" />
              Delete List
            </Button>
          </div>
        </div>

        {/* List Items Manager */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider print:hidden">Checklist Items</h3>
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 divide-y divide-slate-200/60 print:bg-transparent print:p-0 print:border-none">
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
              <p className="text-center py-6 text-sm text-slate-400 italic print:text-left print:py-2">No items in this list yet.</p>
            )}
          </div>

          {/* Add New Item */}
          <div className="pt-2 print:hidden">
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
      <div className="hidden print:block border-2 border-slate-300 rounded-md w-4 h-4 flex-shrink-0 mr-1" />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        className="flex-1 px-2.5 py-1.5 border border-transparent rounded-md focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 text-sm font-medium text-slate-800 bg-transparent hover:bg-slate-100/50 focus:bg-white transition print:p-0 print:hover:bg-transparent"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 print:hidden"
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
