-- CreateTable
CREATE TABLE `articulo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_proveedor` INTEGER NOT NULL,
    `descripcion` VARCHAR(50) NOT NULL,
    `categoria` ENUM('fuentes', 'mothers', 'gabinetes', 'monitores', 'memorias', 'discos', 'otros') NOT NULL DEFAULT 'otros',

    INDEX `id_proveedor`(`id_proveedor` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATE NOT NULL,
    `lista` INTEGER NOT NULL,
    `proveedor` INTEGER NOT NULL,
    `importe_total` FLOAT NOT NULL,

    INDEX `id_lista`(`lista` ASC),
    INDEX `proveedor`(`proveedor` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empleado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(30) NOT NULL,
    `sector` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entrega` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_articulo` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `id_empleado` INTEGER NOT NULL,

    INDEX `id_articulo`(`id_articulo` ASC),
    INDEX `id_empleado`(`id_empleado` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipo` (
    `id` INTEGER NOT NULL,
    `so` VARCHAR(30) NOT NULL,
    `ram` INTEGER NOT NULL,
    `ip` VARCHAR(15) NULL,
    `empleado` INTEGER NOT NULL,
    `mantenimiento` INTEGER NOT NULL,
    `observaciones` VARCHAR(500) NOT NULL,
    `tipo` ENUM('PC', 'Impresora', 'Notebook', 'Otros') NOT NULL DEFAULT 'Otros',

    INDEX `emp`(`empleado` ASC),
    INDEX `mantenimiento`(`mantenimiento` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lista` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compra` INTEGER NOT NULL,
    `articulo` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` FLOAT NOT NULL,
    `precio_total` FLOAT NOT NULL,

    INDEX `compra`(`compra` ASC),
    INDEX `id_articulo`(`articulo` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mantenimiento` (
    `id` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `tarea` VARCHAR(500) NOT NULL,
    `realizo` INTEGER NOT NULL,
    `observaciones` VARCHAR(500) NOT NULL,

    INDEX `responsable`(`realizo` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(30) NOT NULL,
    `domicilio` VARCHAR(30) NOT NULL,
    `telefono` INTEGER NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articulo` ADD CONSTRAINT `articulo_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `compra` ADD CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`proveedor`) REFERENCES `proveedor`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entrega` ADD CONSTRAINT `entrega_ibfk_1` FOREIGN KEY (`id_articulo`) REFERENCES `articulo`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entrega` ADD CONSTRAINT `entrega_ibfk_2` FOREIGN KEY (`id_empleado`) REFERENCES `empleado`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `equipo` ADD CONSTRAINT `equipo_ibfk_1` FOREIGN KEY (`empleado`) REFERENCES `empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipo` ADD CONSTRAINT `equipo_ibfk_2` FOREIGN KEY (`mantenimiento`) REFERENCES `mantenimiento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lista` ADD CONSTRAINT `lista_ibfk_1` FOREIGN KEY (`articulo`) REFERENCES `articulo`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `lista` ADD CONSTRAINT `lista_ibfk_2` FOREIGN KEY (`compra`) REFERENCES `compra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mantenimiento` ADD CONSTRAINT `mantenimiento_ibfk_1` FOREIGN KEY (`realizo`) REFERENCES `empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
