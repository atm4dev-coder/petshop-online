CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`image` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`status` enum('pending','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('credit_card','pix','boleto') NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`subtotal` int NOT NULL,
	`shippingCost` int NOT NULL DEFAULT 0,
	`discount` int DEFAULT 0,
	`total` int NOT NULL,
	`shippingAddress` text,
	`billingAddress` text,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`transactionId` varchar(255),
	`method` enum('credit_card','pix','boleto') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentData` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`longDescription` text,
	`price` int NOT NULL,
	`originalPrice` int,
	`image` varchar(255) NOT NULL,
	`images` text,
	`stock` int NOT NULL DEFAULT 0,
	`sku` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`rating` int DEFAULT 0,
	`reviewCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` varchar(64) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`comment` text,
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(2);--> statement-breakpoint
ALTER TABLE `users` ADD `zipCode` varchar(10);--> statement-breakpoint
CREATE INDEX `userIdx` ON `cartItems` (`userId`);--> statement-breakpoint
CREATE INDEX `productIdx` ON `cartItems` (`productId`);--> statement-breakpoint
CREATE INDEX `orderIdx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orderNumberIdx` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE INDEX `orderIdx` ON `payments` (`orderId`);--> statement-breakpoint
CREATE INDEX `transactionIdx` ON `payments` (`transactionId`);--> statement-breakpoint
CREATE INDEX `categoryIdx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `slugIdx` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `productIdx` ON `reviews` (`productId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `reviews` (`userId`);