/*
  Warnings:

  - Made the column `nro_comprobante` on table `compra` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `compra` MODIFY `nro_comprobante` VARCHAR(20) NOT NULL;
