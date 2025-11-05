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
      // default env (used when no --env is provided)
      env: {
        NODE_ENV: 'development',
      },
      // when starting with `--env development` pm2 looks for `env_development`
      env_development: {
        NODE_ENV: 'development',
      },
      // optional production env
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
