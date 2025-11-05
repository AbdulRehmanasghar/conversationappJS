module.exports = {
  apps: [
    {
      name: 'conversationapp-compile-watch-dev',
      // Use npm so the existing npm script is used (cross-platform)
      script: 'npm',
      args: 'run compile:watch',
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      restart_delay: 2000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
