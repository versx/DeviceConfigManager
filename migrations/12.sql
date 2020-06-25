ALTER TABLE `devices`
ADD COLUMN `webserver_port` int(11) DEFAULT 8080
AFTER `ipa_version`;