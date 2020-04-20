# Device Config Manager  

To be used with RealDeviceMap macless solution Kevin.  

1.) Install dependencies `npm install`  
2.) Copy config `cp src/config.example.json src/config.json`  
3.) Fill out `vi src/config.json`  
4.) Run `npm run start`  

Once everything is setup and running appropriately, you can add this to PM2 ecosystem.config.js file so it is automatically started:  
```
module.exports = {
  apps : [
  {
    name: 'DeviceConfigManager',
    script: 'index.js',
    cwd: '/home/username/DeviceConfigManager/',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    out_file: 'NULL'
  }
  ]
};
```
