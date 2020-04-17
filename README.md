# Device Config Manager  

To be used with RealDeviceMap macless solution Kevin.  

1.) `npm install`  
2.) `cp config.example.json config.json`  
3.) Fill out `config.json`  
4.) Run `schema.sql` to create the database and tables  
5.) `node index.js`  

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
