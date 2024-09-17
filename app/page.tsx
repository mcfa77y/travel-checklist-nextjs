"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Item, List } from "@prisma/client";
import { LayoutDashboardIcon, MenuIcon } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import CheckList from "./checkList";
import { fetcher } from "./shared";
import { SidebarContent } from "./sidebarConent";

export interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export default function SidebarWithContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const { data, isLoading, error } = useSWR(
    "/api",
    fetcher<{ lists: List[]; items: Item[] }>
  );

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
    <div className="flex h-screen">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute md:hidden top-4 left-4"
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
          <SidebarContent
            navItems={lists}
            checkedItems={checkedItems}
            onCheckboxChange={handleCheckboxChange}
          />
        </SheetContent>
      </Sheet>
      <aside className="hidden md:flex h-screen w-[240px] flex-col border-r">
        <SidebarContent
          navItems={lists}
          checkedItems={checkedItems}
          onCheckboxChange={handleCheckboxChange}
        />
      </aside>
      <main className="flex flex-row flex-wrap p-6 gap-3 bg-slate-300">
        {checkedItems.map((id) => (
          <div key={id}>
            <CheckList
              list={data.lists.find((item) => item.id === id)!}
              items={items.filter((item) => item.listId === id)}
            />
          </div>
        ))}
        {checkedItems.length === 0 && <p>No items checked</p>}
      </main>
    </div>
  );
}
