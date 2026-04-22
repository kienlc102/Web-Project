SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- CẤU TRÚC CÁC BẢNG (CREATE TABLES)
-- --------------------------------------------------------

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `gmail` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `accountType` varchar(255) NOT NULL,
  `avatar` varchar(1000) NOT NULL,
  `roleId` int(11) NOT NULL,
  `totalPrice` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `shortDesc` varchar(255) NOT NULL,
  `detailDesc` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`detailDesc`)),
  `quantity` int(11) NOT NULL,
  `sold` int(11) NOT NULL,
  `shopId` int(11) NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `ranking` int(11) NOT NULL,
  `totalComments` int(11) NOT NULL,
  `StarCount` int(11) NOT NULL,
  `totalRates` int(11) NOT NULL,
  `catalog_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `catalog` (
  `id` int(11) NOT NULL,
  `product_type` varchar(255) NOT NULL,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `content` text NOT NULL,
  `translatedContent` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `fromUserId` int(11) NOT NULL,
  `toUserId` int(11) NOT NULL,
  `content` text NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `totalPrice` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `order_seller` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `buyer` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `totalPrice` int(11) NOT NULL,
  `status` enum('cho_xac_nhan','dang_van_chuyen','da_huy','thanh_cong') NOT NULL DEFAULT 'cho_xac_nhan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `order_delivery` (
  `id` int(11) NOT NULL,
  `orderSellerId` int(11) NOT NULL,
  `path` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`path`)),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `order_product` (
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `star` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- THIẾT LẬP KHÓA CHÍNH (PRIMARY KEYS) & CHỈ MỤC (INDEXES)
-- --------------------------------------------------------

ALTER TABLE `catalog`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_ibfk_1` (`userId`),
  ADD KEY `comments_ibfk_2` (`productId`);

ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_ibfk_1` (`fromUserId`),
  ADD KEY `messages_ibfk_2` (`toUserId`);

ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_ibfk_1` (`userId`);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usedId` (`userId`);

ALTER TABLE `order_delivery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_delivery_ibfk_1` (`orderSellerId`);

ALTER TABLE `order_product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orderId` (`orderId`,`productId`),
  ADD KEY `productId` (`productId`);

ALTER TABLE `order_seller`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_seller_ibfk_1` (`productId`),
  ADD KEY `order_seller_ibfk_2` (`userId`),
  ADD KEY `order_seller_ibfk_3` (`buyer`);

ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_ibfk` (`shopId`),
  ADD KEY `product_ibfk_1` (`catalog_id`);

ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ratings_ibfk_1` (`userId`),
  ADD KEY `ratings_ibfk_2` (`productId`);

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `roleId` (`roleId`);

-- --------------------------------------------------------
-- THIẾT LẬP TỰ ĐỘNG TĂNG (AUTO_INCREMENT)
-- --------------------------------------------------------

ALTER TABLE `catalog` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `comments` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `messages` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `notifications` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `orders` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `order_delivery` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `order_product` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `order_seller` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `products` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `ratings` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `roles` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `users` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------
-- THIẾT LẬP KHÓA NGOẠI (FOREIGN KEYS)
-- --------------------------------------------------------


ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`fromUserId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`toUserId`) REFERENCES `users` (`id`);

ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

ALTER TABLE `order_delivery`
  ADD CONSTRAINT `order_delivery_ibfk_1` FOREIGN KEY (`orderSellerId`) REFERENCES `order_seller` (`id`);

ALTER TABLE `order_product`
  ADD CONSTRAINT `order_product_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_product_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

ALTER TABLE `order_seller`
  ADD CONSTRAINT `order_seller_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `order_seller_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `order_seller_ibfk_3` FOREIGN KEY (`buyer`) REFERENCES `users` (`id`);

ALTER TABLE `products`
  ADD CONSTRAINT `product_ibfk` FOREIGN KEY (`shopId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`catalog_id`) REFERENCES `catalog` (`id`);

ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`);

COMMIT;

INSERT INTO `catalog` (`id`, `product_type`) VALUES 
('1', 'Thiết bị Điện tử & Công nghệ'),
('2', 'Thời trang & Phụ kiện'),
('3', 'Nhà cửa & Đời sống'),
('4', 'Sức khỏe & Sắc đẹp'),
('5', 'Mẹ & Bé'),
('6', 'Thể thao & Dã ngoại'),
('7', 'Sách, VPP & Quà tặng'),
('8', 'Bách hóa Online');