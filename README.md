![Node.js CI](https://github.com/versx/DeviceConfigManager/workflows/Node.js%20CI/badge.svg)
# Device Config Manager  

To be used with RealDeviceMap macless solutions.  

Central repository for macless client configurations without having to keep track of multiple remote configs and urls. Assign different configurations to different devices and different backends (RealDeviceMap / Lorgnette). When devices connect for the first time, if they don't exist they are created, if they don't have a config assigned, it will try to auto-assign it a default config if one exists.  
You can also pre-create devices and assign configs yourself if needed.  

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
1.) Clone repository `git clone https://github.com/versx/DeviceConfigManager`  
2.) Install dependencies `npm install`  
3.) Copy config `cp src/config.example.json src/config.json`  
4.) Fill out config `vi src/config.json`  
5.) Run `npm start`  
6.) Access via http://machineip:port/ using username: `root` and password `pass123!`  
7.) Change default password via the Settings page  
8.) (Optional) Setup [DCMRemoteListener](https://github.com/versx/DCMRemoteListener) on the machines the phones are connected to in order to restart the actual device.  

## Installation (Docker)  
1.) Clone repository `git clone https://github.com/versx/DeviceConfigManager`  
2.) Copy docker-compose `cp src/docker-compose.example.yml src/docker-compose.yml`  
3.) Copy config `cp src/config.example.json src/config.json`  
4.) Fill out config `vi src/config.json`  
5.) Run `docker-compose up -d --build`  
6.) Access via http://machineip:port/ using username: `root` and password `pass123!`  
7.) Change default password via the Settings page  
8.) (Optional) Setup [DCMRemoteListener](https://github.com/versx/DCMRemoteListener) on the machines the phones are connected to in order to restart the actual device.  

## Updating  
1.) `git pull`  
2.) Run `npm install` in root folder  
3.) Run `npm start`  

## Updating (docker)  
1.) `git pull`  
2.) Run `docker-compose up -d --build`

## FAQ
Q.) Why are devices showing my HAProxy IP address?  
A.) You need to make sure to set `option forwardfor` in your haproxy.cfg file under defaults so the `x-forward-for` header is sent with the request and the real IP is used.  

Q.) Why are devices not connecting to backend or sending data to data endpoints?  
A.) Make sure to **not** include the `/raw` or `/controler` endpoints in the `Backend Url` and `Data Endpoints` config options. These are automatically appended to each URL address.  

Q.) Will I be able to view screenshots and use the device endpoint tools with devices using mac internet sharing?  
A.) No, since it uses the connected machine's IP address for internet sharing.  

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

## Discord  
https://discordapp.com/invite/zZ9h9Xa  
