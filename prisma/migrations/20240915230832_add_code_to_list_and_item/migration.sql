/*
  Warnings:

  - Added the required column `code` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "listId" TEXT,
    CONSTRAINT "Item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("id", "listId", "name") SELECT "id", "listId", "name" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");
CREATE TABLE "new_List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "code" TEXT NOT NULL
);
INSERT INTO "new_List" ("id", "name") SELECT "id", "name" FROM "List";
DROP TABLE "List";
ALTER TABLE "new_List" RENAME TO "List";
CREATE UNIQUE INDEX "List_code_key" ON "List"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
