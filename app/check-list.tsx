import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Item, List } from "@prisma/client";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
interface Props {
  list: List;
  items: Item[];
}

export interface CheckListFormInput {
  name: string;
  itemId?: string;
  listId: string | null;
}
async function updateItem(url: string, { arg }: { arg: CheckListFormInput }) {
  await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  });
}
async function deleteItem(url: string, { arg }: { arg: CheckListFormInput }) {
  await fetch(url, {
    method: "DELETE",
    body: JSON.stringify(arg),
  });
}
function CheckList(props: Props) {
  const { list, items } = props;
  const [activeItemUpdateId, setActiveItemUpdateId] = useState<
    string | undefined
  >(undefined);
  const [mode, setMode] = useState<"update" | "read">("read");
  const [activeItem, setActiveItem] = useState<Item | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<CheckListFormInput>({
    defaultValues: { name: "", listId: list.id },
  });

  const { trigger: triggerItemUpdate } = useSWRMutation("/api", updateItem);
  const { trigger: triggerItemDelete } = useSWRMutation("/api", deleteItem);
  useEffect(() => {
    if (activeItemUpdateId) {
      const item = items.find((item) => item.id === activeItemUpdateId);
      if (item) {
        setActiveItem(item);
      }
    }
  }, [activeItemUpdateId, items]);
  const onUpdateItemSubmit: SubmitHandler<CheckListFormInput> = (data) => {
    console.log(data);
    reset();
    triggerItemUpdate({ ...data });
    setOpen(false);
  };

  const onDeleteItemSubmit: SubmitHandler<CheckListFormInput> = (data) => {
    console.log(data);
    reset();
    triggerItemDelete({ ...data });
    setOpen(false);
  };

  return (
    <>
      <h2
        className="m-2 text-xl underline-offset-3 underline cursor-pointer"
        onClick={() => {
          if (mode === "read") {
            setMode("update");
          } else {
            setMode("read");
          }
        }}
      >
        {list.name}
      </h2>
      <ul>
        {items
          .sort((a, b) => a.name.localeCompare(b.name))
          ?.map((item: Item) => (
            <li key={item.id} className="flex items-center">
              <Checkbox id={item.id} className="m-2" />

              <span
                className="flex-1 truncate"
                onMouseEnter={() => setActiveItemUpdateId(item.id)}
              >
                {item.name}
              </span>
              {mode === "update" && item.id === activeItemUpdateId && (
                <div>
                  <button
                    onClick={() => setOpen(true)}
                    className="text-black bg-slate-100 hover:bg-slate-200 focus:ring-slate-300 dark:bg-slate-700 dark:hover:bg-slate-800 dark:focus:ring-slate-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center self-end"
                  >
                    edit
                  </button>
                  <button
                    type="button"
                    className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                    onClick={() => {
                      onDeleteItemSubmit({
                        name: item.name,
                        listId: list.id,
                        itemId: item.id,
                      });
                    }}
                  >
                    delete
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>
      {mode === "update" && (
        <form onSubmit={handleSubmit(onUpdateItemSubmit)}>
          <input {...register("name")} type="text" className="m-2" />
          <input {...register("listId")} type="hidden" defaultValue={list.id} />
          <input
            type="submit"
            value="add new item"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          />
        </form>
      )}
      {open && activeItem && (
        <ItemUpdateDialog
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={onUpdateItemSubmit}
          item={activeItem}
          listId={list.id}
        />
      )}
    </>
  );
}
function ItemUpdateDialog(props: {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<CheckListFormInput>;
  item: Item;
  listId: string;
}) {
  const { register, handleSubmit, reset } = useForm<CheckListFormInput>({
    defaultValues: {
      name: props.item.name,
      listId: props.listId,
      itemId: props.item.id,
    },
  });
  const { trigger: triggerItemUpdate } = useSWRMutation("/api", updateItem);
  useEffect(() => {
    if (!props.open) {
      reset();
    }
  }, [props.open, reset]);
  const onSubmit: SubmitHandler<CheckListFormInput> = (data) => {
    console.log(data);
    reset();
    triggerItemUpdate({ ...data });
    props.onClose();
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">
            Edit Item
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Item Name
            </label>
            <input
              type="text"
              {...register("name")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <input {...register("listId")} type="hidden" />
          <input {...register("itemId")} type="hidden" />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none dark:focus:ring-blue-800"
            >
              Update
            </button>
          </div>
        </form>
      </DialogContent>
      <DialogClose />
    </Dialog>
  );
}

export default CheckList;
