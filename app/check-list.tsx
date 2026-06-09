import { Checkbox } from "@/components/ui/checkbox";
import { Item, List } from "@prisma/client";

export interface CheckListFormInput {
  name: string;
  itemId?: string;
  listId: string | null;
}

interface Props {
  list: List;
  items: Item[];
}

function CheckList(props: Props) {
  const { list, items } = props;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 min-w-[280px] max-w-sm">
      <h2 className="m-2 text-lg font-bold text-slate-800 border-b pb-2">
        {list.name}
      </h2>
      <ul className="space-y-1 mt-3">
        {items && items.length > 0 ? (
          items
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item: Item) => (
              <li key={item.id} className="flex items-center hover:bg-slate-50 rounded-md p-1">
                <Checkbox id={item.id} className="m-2" />
                <label
                  htmlFor={item.id}
                  className="flex-1 text-sm font-medium text-slate-700 cursor-pointer select-none truncate"
                >
                  {item.name}
                </label>
              </li>
            ))
        ) : (
          <p className="text-center py-4 text-xs text-slate-400 italic">No items in this list yet.</p>
        )}
      </ul>
    </div>
  );
}

export default CheckList;
