-- DropForeignKey
ALTER TABLE `equipo` DROP FOREIGN KEY `equipo_ibfk_1`;

-- DropForeignKey
ALTER TABLE `equipo` DROP FOREIGN KEY `equipo_ibfk_2`;

-- DropForeignKey
ALTER TABLE `mantenimiento` DROP FOREIGN KEY `mantenimiento_ibfk_1`;

-- DropIndex
DROP INDEX `id_lista` ON `compra`;

-- AlterTable
ALTER TABLE `compra` DROP COLUMN `lista`;

-- AlterTable
ALTER TABLE `equipo` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `so` VARCHAR(30) NULL,
    MODIFY `empleado` INTEGER NULL,
    MODIFY `mantenimiento` INTEGER NULL,
    MODIFY `observaciones` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `mantenimiento` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `usuario` MODIFY `usuario` VARCHAR(30) NOT NULL,
    MODIFY `pass` VARCHAR(80) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `nombre` ON `proveedor`(`nombre`);

-- CreateIndex
CREATE UNIQUE INDEX `usuario` ON `usuario`(`usuario`);

-- AddForeignKey
ALTER TABLE `equipo` ADD CONSTRAINT `equipo_ibfk_1` FOREIGN KEY (`empleado`) REFERENCES `empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipo` ADD CONSTRAINT `equipo_ibfk_2` FOREIGN KEY (`mantenimiento`) REFERENCES `mantenimiento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mantenimiento` ADD CONSTRAINT `mantenimiento_ibfk_1` FOREIGN KEY (`realizo`) REFERENCES `empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
