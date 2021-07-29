![Node.js CI](https://github.com/versx/DeviceConfigManager/workflows/Node.js%20CI/badge.svg)
![Lint](https://github.com/versx/DeviceConfigManager/workflows/Lint/badge.svg)  

[![GitHub Release](https://img.shields.io/github/release/versx/DeviceConfigManager.svg)](https://github.com/versx/DeviceConfigManager/releases/)
[![GitHub Contributors](https://img.shields.io/github/contributors/versx/DeviceConfigManager.svg)](https://github.com/versx/DeviceConfigManager/graphs/contributors/)
[![Discord](https://img.shields.io/discord/552003258000998401.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/zZ9h9Xa)  


# Device Config Manager  

To be used with RealDeviceMap macless solutions.  

Central repository for macless client configurations without having to keep track of multiple remote configs and urls. Assign different configurations to different devices and different backends (RealDeviceMap / Lorgnette). When devices connect for the first time, if they don't exist they are created, if the device doesn't have a config assigned, it will try to auto-assign a default config if one exists.  
You can also pre-create devices and assign configs yourself if needed. Rest endpoint tooling to get screenshot, active logged in account, restart game, reboot device, or view device logs and more.  

## Features  
- Custom config assignments  
- Screenshot preview  
- Device logging  
- Device endpoint tooling  
- and more...  

## Supported Providers  
- GoCheats  
- Kevin  
- AI  

## Installation
**Normal**  
1. Create new database `dcm` with utf8_unicode_ci/utf8mb4 character sets and collation  
1. Clone repository `git clone https://github.com/versx/DeviceConfigManager`  
1. Install dependencies `npm install`  
1. Copy config `cp src/config.example.json src/config.json`  
1. Fill out config `vi src/config.json`  
1. Run `npm start`  
1. Access via http://machineip:port/ using username: `root` and password `pass123!`  
1. Change default password via the Settings page  
1. (Optional) Setup [DCMRemoteListener](https://github.com/versx/DCMRemoteListener) on the machines the phones are connected to in order to restart the actual device.  

**Docker**  
1. Create new database `dcm` with utf8_unicode_ci/utf8mb4 character sets and collation  
1. Clone repository `git clone https://github.com/versx/DeviceConfigManager`  
1. Copy docker-compose `cp docker-compose.example.yml docker-compose.yml`  
1. Copy config `cp src/config.example.json src/config.json`  
1. Fill out config `vi src/config.json`  
1. Run `docker-compose up -d --build`  
1. Access via http://machineip:port/ using username: `root` and password `pass123!`  
1. Change default password via the Settings page  
1. (Optional) Setup [DCMRemoteListener](https://github.com/versx/DCMRemoteListener) on the machines the phones are connected to in order to restart the actual device.  

## Updating  
**Normal**  
1. `git pull`  
1. Run `npm install` in root folder  
1. Run `npm start`  

**Docker**  
1. `git pull`  
1. Run `docker-compose up -d --build`

## FAQ
Q.) Why are devices showing my HAProxy IP address?  
A.) You need to make sure to set `option forwardfor` in your haproxy.cfg file under defaults so the `x-forward-for` header is sent with the request and the real IP is used.  

Q.) Why are devices not connecting to backend or sending data to data endpoints?  
A.) Make sure to **not** include the `/raw` or `/controler` endpoints in the `Backend Url` and `Data Endpoints` config options. These are automatically appended to each URL address.  

Q.) Will I be able to view screenshots and use the device endpoint tools with devices using mac internet sharing?  
A.) No, since it uses the connected machine's IP address for internet sharing.  

## Current Issues  
- Unable to set schedule that switches between days, i.e. Start 11pm and Ends 2am.  

## PM2 (recommended)
Once everything is setup and running appropriately, you can add this to PM2 ecosystem.config.js file so it is automatically started:  
```
module.exports = {
  apps : [
  {
    name: 'DeviceConfigManager',
    script: 'index.js',
    cwd: '/home/username/DeviceConfigManager/src/',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    out_file: 'NULL'
  }
  ]
};
```
