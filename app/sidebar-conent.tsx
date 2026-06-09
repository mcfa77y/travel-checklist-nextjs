import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle2Icon, PlusIcon, PencilIcon, Trash2Icon, PrinterIcon } from "lucide-react";
import { NavItem } from "@app/page";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SidebarContent({
  navItems,
  checkedItems,
  onCheckboxChange,
  onCreateList,
  onDeleteList,
}: {
  navItems: NavItem[];
  checkedItems: string[];
  onCheckboxChange: (id: string) => void;
  onCreateList: (name: string) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center justify-between px-4 border-b h-14">
        <span className="text-lg font-semibold">My Lists</span>
        <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(true)}>
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between group p-1 rounded-md hover:bg-accent">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => onCheckboxChange(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className="flex items-center flex-1 gap-2 p-2 rounded-md cursor-pointer truncate text-sm"
                >
                  {item.icon}
                  {item.title}
                </label>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/list/${item.id}`);
                  }}
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm(`Are you sure you want to delete the list "${item.title}"?`)) {
                      onDeleteList(item.id);
                    }
                  }}
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t flex flex-col gap-2 print:hidden">
        <Button
          variant="outline"
          className="justify-start w-full"
          onClick={() => window.print()}
          disabled={checkedItems.length === 0}
        >
          <PrinterIcon className="w-4 h-4 mr-2" />
          Print Selected ({checkedItems.length})
        </Button>
        <Button variant="ghost" className="justify-start w-full">
          <UserCircle2Icon className="w-4 h-4 mr-2" />
          Profile
        </Button>
      </div>

      {isCreateOpen && (
        <CreateListDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={onCreateList}
        />
      )}
    </div>
  );
}

function CreateListDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(name);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">
            Create New Checklist
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Checklist Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
