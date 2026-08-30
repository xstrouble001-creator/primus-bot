module.exports = {
  apps: [
    {
      name: 'primus-bot',
      script: 'index.js',
      watch: false,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 3000,
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
