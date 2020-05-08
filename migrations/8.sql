ALTER TABLE `configs` ADD COLUMN `logging_port` MEDIUMINT(64) DEFAULT NULL AFTER `min_delay_logout`;
ALTER TABLE `configs` ADD COLUMN `logging_url` VARCHAR(255) DEFAULT NULL AFTER `min_delay_logout`;