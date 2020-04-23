CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(50) NOT NULL PRIMARY KEY,
  `password` varchar(255) NOT NULL
);

INSERT INTO `users` (`username`, `password`) VALUES ('admin', 'pass123!');