CREATE TABLE IF NOT EXISTS `users` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(255) UNIQUE,
  `password_hash` varchar(255),
  `name` varchar(255),
  `address` varchar(255),
  `phone_number` varchar(20),
  `email_address` varchar(255),
  `iban` varchar(255),
  `rating` decimal(3, 2)
);
CREATE TABLE IF NOT EXISTS `listing` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(255),
  `body` varchar(255),
  `user_id` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(255),
  `subcategory` varchar(255),
  `price` decimal(10, 2),
  `is_sold` TINYINT(1) NOT NULL DEFAULT 0,
  `condition_name` varchar(255)
);
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `listing_id` integer NOT NULL,
  FOREIGN KEY (`listing_id`) REFERENCES listing(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `user_id` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `body` varchar(255),
  `stars` integer,
  `created_at` timestamp
);
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `seller_id` integer NOT NULL,
  FOREIGN KEY (`seller_id`) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `buyer_id` integer NOT NULL,
  FOREIGN KEY (`buyer_id`) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `listing_id` integer NOT NULL,
  FOREIGN KEY (`listing_id`) REFERENCES listing(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `sold_on` timestamp
);
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `session_id` varchar(255),
  `user_id` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `created_at` timestamp
);
CREATE TABLE IF NOT EXISTS `admin` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(255) UNIQUE,
  `password_hash` varchar(255)
);
CREATE TABLE IF NOT EXISTS `admin_session` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `session_id` varchar(255),
  `user_id` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES admin(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS `category` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `category` varchar(255)
);
CREATE TABLE IF NOT EXISTS `subcategory` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `category` varchar(255),
  `subcategory` varchar(255)
);
CREATE TABLE IF NOT EXISTS `listing_conditions` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `condition_name` varchar(255)
);
CREATE TABLE IF NOT EXISTS `pictures` (
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `listing_id` integer NOT NULL,
  FOREIGN KEY (`listing_id`) REFERENCES listing(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `image_path` varchar(255)
);
CREATE TABLE IF NOT EXISTS `shopping_cart`(
  `id` integer AUTO_INCREMENT PRIMARY KEY,
  `listing_id` integer NOT NULL,
  FOREIGN KEY (`listing_id`) REFERENCES listing(id) ON DELETE CASCADE ON UPDATE CASCADE,
  `user_id` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
)