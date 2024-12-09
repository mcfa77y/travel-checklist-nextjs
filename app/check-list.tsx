import { Checkbox } from "@/components/ui/checkbox";
import { Item, List } from "@prisma/client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
interface Props {
  list: List;
  items: Item[];
}

export interface CheckListFormInput {
  name: string;
  itemId?: string;
  listId: string;
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
  const { register, handleSubmit, reset, watch } = useForm<CheckListFormInput>({
    defaultValues: { name: "", listId: list.id },
  });

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    reset: resetItem,
    watch: watchItem,
    setValue: setValueItem,
  } = useForm<CheckListFormInput>({
    defaultValues: { name: "", listId: list.id, itemId: activeItemUpdateId },
  });
  const { trigger: triggerItemUpdate } = useSWRMutation("/api", updateItem);
  const { trigger: triggerItemDelete } = useSWRMutation("/api", deleteItem);
  const onUpdateItemSubmit: SubmitHandler<CheckListFormInput> = (data) => {
    console.log(data);
    reset();
    resetItem();
    setActiveItemUpdateId(undefined);
    triggerItemUpdate({ ...data });
  };

  const onCancelItemSubmit = (data: any) => {
    console.log(data);
    reset();
    resetItem();
    setActiveItemUpdateId(undefined);
  };
  const onDeleteItemSubmit = (data: any) => {
    console.log(data);
    reset();
    resetItem();
    setActiveItemUpdateId(undefined);
    triggerItemDelete({ ...data });
  };
  console.log(watchItem("name"));
  return (
    <>
      <h2 className="m-2 text-xl underline-offset-3 underline ">{list.name}</h2>
      <ul>
        {items
          .sort((a, b) => a.name.localeCompare(b.name))
          ?.map((item: Item) => (
            <li key={item.id} className="flex items-center">
              <Checkbox
                id={item.id}
                className="m-2"
                onChange={(e) => {
                  setActiveItemUpdateId(e.target.checked ? item.id : undefined);
                  setValueItem("name", item.name);
                }}
              />
              <span
                className="flex-1 truncate"
                onMouseEnter={(e) => {
                  setActiveItemUpdateId(item.id);
                }}
                onMouseLeave={(e) => {
                  setActiveItemUpdateId(undefined);
                }}
              >
                {item.name}
              </span>
              {item.id === activeItemUpdateId && (
                <form
                  onSubmit={handleSubmitItem(onUpdateItemSubmit)}
                  className="flex flex-row gap-2"
                >
                  <input
                    type="text"
                    {...registerItem("name")}
                    defaultValue={item.name}
                  />
                  <input
                    {...registerItem("listId")}
                    value={list.id}
                    type="hidden"
                  />
                  <input
                    {...registerItem("itemId")}
                    defaultValue={item.id}
                    type="hidden"
                  />
                  <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  >
                    update
                  </button>
                  {/* create a red button to delete an item */}
                  <button
                    type="button"
                    className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                    onClick={(e) => {
                      onDeleteItemSubmit({ itemId: item.id });
                    }}
                  >
                    delete
                  </button>
                  <button
                    type="button"
                    className="text-whitefocus:ring-4 bg-slate-100 hover:bg-slate-200 focus:ring-slate-300 dark:bg-slate-700 dark:hover:bg-slate-800 dark:focus:ring-slate-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    onClick={(e) => {
                      onCancelItemSubmit({ itemId: item.id });
                    }}
                  >
                    cancel
                  </button>
                </form>
              )}
            </li>
          ))}
        {/* add a blue plus button to add a new item */}
        {!activeItemUpdateId && (
          <form onSubmit={handleSubmit(onUpdateItemSubmit)}>
            <input {...register("name")} type="text" className="m-2" />
            <input
              {...register("listId")}
              type="hidden"
              defaultValue={list.id}
            />
            <input
              type="submit"
              value="add new item"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            ></input>
          </form>
        )}
      </ul>
    </>
  );
}

export default CheckList;
