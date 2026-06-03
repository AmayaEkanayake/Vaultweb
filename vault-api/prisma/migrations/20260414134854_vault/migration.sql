/*
  Warnings:

  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `departmentId` on the `Vault` table. All the data in the column will be lost.
  - Added the required column `orgId` to the `Vault` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Department_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Department";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vault" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vault_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vault" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Vault";
DROP TABLE "Vault";
ALTER TABLE "new_Vault" RENAME TO "Vault";
CREATE UNIQUE INDEX "Vault_id_key" ON "Vault"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
