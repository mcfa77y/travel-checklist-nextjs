import { Item, List, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateCode(code: string) {
  // sanitize string for code all uppercase replace space with underscore
  return code.toUpperCase().replace(/\s/g, "_");
}

async function addItemToList(item: Item, list: List): Promise<Item> {
  // check if item is already in list
  if (item.listId === list.id) {
    console.log(`Item ${item.name} is already in list ${list.name}.`);
    return item;
  }
  return prisma.item.update({
    where: {
      id: item.id,
    },
    data: {
      listId: list.id,
    },
  });
}

/**
 * Creates a new item or updates an existing item with the same code.
 *
 * @param itemName The name of the item to create.
 * @returns The created item.
 */
async function createItem(itemName: string): Promise<Item> {
  const itemCode = generateCode(itemName);
  const itemCreate: Item = await prisma.item.upsert({
    where: {
      code: itemCode,
    },
    create: {
      name: itemName,
      code: itemCode,
    },
    update: {},
  });
  return itemCreate;
}

async function createList(listName: string): Promise<List> {
  const listCode = generateCode(listName);

  const listCreate: List = await prisma.list.upsert({
    where: {
      code: listCode,
    },
    create: {
      name: listName,
      code: listCode,
    },
    update: {},
  });
  return listCreate;
}

async function createListWithItems(listName: string, items: string[]) {
  const list = await createList(listName);
  for (const item of items) {
    const itemCreate = await createItem(item);
    await addItemToList(itemCreate, list);
  }
  console.log(`Created list ${list.name} with ${items.length} items.`);
  return list;
}

async function main() {
  const createListPromises = [];
  const baseTravelItems = [
    "Lufa",
    "Water chanklas",
    "Sandals",
    "N-socks",
    "N-undies",
    "N-shirts",
    "N/2 pants",
    "Sleeping pants",
    "Swim shorts",
    "Sleeping shirt",
    "Sunglasses",
    "Toothbrush",
    "Dirty cloths plastic bag dryer sheets",
    "Water bottle",
    "Toiletries",
    "Inhaler",
    "Ear plugs",
    "Eye mask",
  ];
  createListPromises.push(createListWithItems("Base Travel", baseTravelItems));

  const hotPlaceItems = ["bandanna", "light button up shirts", "straw hat"];
  createListPromises.push(createListWithItems("Hot Place", hotPlaceItems));

  const coldPlaceItems = [
    "Scarf",
    "Beanie",
    "Gloves",
    "Long sleeve shirt",
    "Woolen socks",
  ];
  createListPromises.push(createListWithItems("Cold Place", coldPlaceItems));

  const chargers = ["Ipad", "Computer", "long usb c", "usb micro"];
  createListPromises.push(createListWithItems("Chargers", chargers));

  const cabin = ["Speaker", "Games", "Good Knife"];
  createListPromises.push(createListWithItems("Cabin", cabin));

  const international = [
    "Super burrito",
    "Sleeping pillow",
    "Water bottle",
    "Guide book",
    "Lufa",
    "Passport",
    "International plug - sturdy one",
    "Noise canceling headphones - in ear",
    "Mask / Mask strap helper",
    "Traveling backpack",
  ];
  createListPromises.push(createListWithItems("International", international));

  const snowboarding = [
    "Oatmeal lotion",
    "Knit cap",
    "Snow pants",
    "Gloves",
    "Snow jacket",
    "Boots",
    "Sunscreen",
    "Goggles",
    "Helmet",
    "Speaker",
    "Snow chains for car",
  ];
  createListPromises.push(createListWithItems("Snowboarding", snowboarding));

  const pretrip = [
    "Clean out Querty",
    "Shower",
    "Throw out trash",
    "Wash dishes",
    "Turn off heater",
    "Clip nails",
  ];
  createListPromises.push(createListWithItems("Pretrip", pretrip));

  const pretripDownload = ["Music", "Tv", "Movies"];
  createListPromises.push(
    createListWithItems("Pretrip Download", pretripDownload)
  );

  const campingSleeping = [
    "Tent",
    "Air mattress",
    "Air mattress pump",
    "Sleeping bag",
    "Sleeping pillow",
  ];
  createListPromises.push(
    createListWithItems("Camping Sleeping", campingSleeping)
  );

  const campingKitchen = [
    "Plates",
    "Duralog",
    "Aluminum foil",
    "Large and small ziplocks",
    "Dish soap",
    "Dish brush",
    "Sponge",
    "Bowls",
    "Pot",
    "Pan",
    "Cutlery",
    "Big serving spoon",
    "Spatula",
    "Beer coozy",
    "Camping chairs",
    "Trashbags (one for recycling)",
    "Red grill",
    "Can opener",
  ];
  createListPromises.push(
    createListWithItems("Camping Kitchen", campingKitchen)
  );

  const campingClothes = [
    "Scarf",
    "Sun Hat",
    "Jacket",
    "Knit cap",
    "Hiking boots",
    "Camelback",
  ];
  createListPromises.push(
    createListWithItems("Camping Clothes", campingClothes)
  );

  const campingMisc = [
    "Baby wipes",
    "El wire",
    "Multi-tool",
    "Headlamps",
    "Speaker",
    "Sunblock",
    "Weed",
  ];
  createListPromises.push(createListWithItems("Camping Misc", campingMisc));

  const bbq = [
    "Duralogs",
    "Trash bags (one for recycling)",
    "Sunscreen",
    "Hat",
    "Cutting board",
    "Knife",
    "Speaker",
  ];
  createListPromises.push(createListWithItems("BBQ", bbq));

  const surfing = ["Surfboard", "Sunscreen", "Hat"];
  createListPromises.push(createListWithItems("Surfing", surfing));

  const roadTrip = [
    "Ac converter",
    "Usb cigarette plug",
    "Car charging cable >5hrs away",
  ];
  createListPromises.push(createListWithItems("Road Trip", roadTrip));

  await Promise.all(createListPromises);
  console.log("done");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
