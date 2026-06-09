"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Item, List } from "@prisma/client";
import { LayoutDashboardIcon, MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import CheckList from "@app/check-list";
import { fetcher } from "@app/shared";
import { SidebarContent } from "@app/sidebar-conent";

export interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

async function createListFetcher(url: string, { arg }: { arg: { name: string } }) {
  const res = await fetch("/api/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Failed to create list");
  return res.json() as Promise<{ id: string; name: string }>;
}

async function deleteListFetcher(url: string, { arg }: { arg: { id: string } }) {
  const res = await fetch(`/api/list/${arg.id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete list");
}

export default function SidebarWithContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [hasInitializedDefault, setHasInitializedDefault] = useState(false);
  const router = useRouter();

  const { data } = useSWR(
    "/api",
    fetcher<{ lists: List[]; items: Item[] }>
  );

  useEffect(() => {
    if (data?.lists && !hasInitializedDefault) {
      const baseTravelList = data.lists.find(
        (list: List) => list.name?.toLowerCase() === "base travel" || list.code === "BASE_TRAVEL"
      );
      if (baseTravelList) {
        setCheckedItems([baseTravelList.id]);
      }
      setHasInitializedDefault(true);
    }
  }, [data, hasInitializedDefault]);

  const { trigger: triggerCreateList } = useSWRMutation("/api", createListFetcher);
  const { trigger: triggerDeleteList } = useSWRMutation("/api", deleteListFetcher);

  const handleCreateList = async (name: string) => {
    const newList = await triggerCreateList({ name });
    if (newList && newList.id) {
      router.push(`/list/${newList.id}`);
    }
  };

  const handleDeleteList = async (id: string) => {
    await triggerDeleteList({ id });
    setCheckedItems((prev) => prev.filter((item) => item !== id));
  };

  const handleCheckboxChange = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const lists: NavItem[] =
    data?.lists.map((list: List) => ({
      id: list.id,
      title: list.name || "No name",
      icon: <LayoutDashboardIcon className="w-4 h-4" />,
    })) || [];
  lists.sort((a, b) => a.title.localeCompare(b.title));
  if (!data) {
    return null;
  }
  const items: Item[] = data.items;
  return (
    <div className="flex h-screen print:h-auto print:block">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute md:hidden top-4 left-4 print:hidden"
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0 print:hidden">
          <SidebarContent
            navItems={lists}
            checkedItems={checkedItems}
            onCheckboxChange={handleCheckboxChange}
            onCreateList={handleCreateList}
            onDeleteList={handleDeleteList}
          />
        </SheetContent>
      </Sheet>
      <aside className="hidden md:flex h-screen w-[240px] flex-col border-r print:hidden">
        <SidebarContent
          navItems={lists}
          checkedItems={checkedItems}
          onCheckboxChange={handleCheckboxChange}
          onCreateList={handleCreateList}
          onDeleteList={handleDeleteList}
        />
      </aside>
      <main className="flex flex-row flex-wrap p-6 gap-3 bg-slate-300 flex-1 overflow-auto print:bg-transparent print:p-0 print:gap-6 print:overflow-visible">
        {checkedItems.map((id) => (
          <div key={id}>
            <CheckList
              list={data.lists.find((item) => item.id === id)!}
              items={items.filter((item) => item.listId === id)}
            />
          </div>
        ))}
        {checkedItems.length === 0 && <p className="print:hidden">No items checked</p>}
      </main>
    </div>
  );
}
