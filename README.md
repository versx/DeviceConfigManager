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

## Installation
1.) Clone repository `git clone https://github.com/versx/DeviceConfigManager`  
2.) Install dependencies `npm install`  
3.) Copy config `cp src/config.example.json src/config.json`  
4.) Fill out config `vi src/config.json`  
5.) Run `npm run start`  
6.) Access via http://machineip:port/ using username: `root` and password `pass123!`  
7.) Change default password via the Settings page  

## Notes  
If you use HAProxy, make sure to set `option forwardfor` in your haproxy.cfg if you are not passing the x-forward-for header so the correct IP addresses are saved.  

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

## TODO  
- Support for other macless client provider configs with custom predefined configuration keys.  
- Localization.  
