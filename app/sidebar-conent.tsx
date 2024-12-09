import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle2Icon } from "lucide-react";
import { NavItem } from "./page";

export function SidebarContent({
  navItems,
  checkedItems,
  onCheckboxChange,
}: {
  navItems: NavItem[];
  checkedItems: string[];
  onCheckboxChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center px-4 border-b h-14">
        <span className="text-lg font-semibold">My Lists</span>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={checkedItems.includes(item.id)}
                onCheckedChange={() => onCheckboxChange(item.id)}
              />
              <label
                htmlFor={item.id}
                className="flex items-center flex-1 gap-2 p-2 rounded-md cursor-pointer hover:bg-accent"
              >
                {item.icon}
                {item.title}
              </label>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="ghost" className="justify-start w-full">
          <UserCircle2Icon className="w-4 h-4 mr-2" />
          Profile
        </Button>
      </div>
    </div>
  );
}
