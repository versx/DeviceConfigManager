module.exports = {
  apps : [{
    name: 'dcm-server',
    script: 'index.js',
    cwd: '/home/username/dcm/server/build',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    out_file: 'NULL'
  },{
    name: 'dcm-client',
    script: 'index.js',
    cwd: '/home/username/dcm/build',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    out_file: 'NULL'
  }]
};