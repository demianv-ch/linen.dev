require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'yarn dev',
      cwd: '..',
      env: {
        PORT: 80,
      },
    },
    {
      name: 'queue',
      script: 'npx tsx watch queue/index.ts',
      cwd: '../apps/web',
      restart_delay: 3000,
    },
    {
      name: 'discord-bots',
      script: 'bash up.sh',
      cwd: '../apps/discord-bots',
      restart_delay: 3000,
    },
    {
      name: 'push-service',
      script: 'mix phx.server',
      cwd: '../apps/push_service',
      env: {
        MIX_ENV: 'prod',
        PORT: 4000,
        PUSH_SERVICE_KEY: process.env.PUSH_SERVICE_KEY,
        AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
        SECRET_KEY_BASE: process.env.SECRET_KEY_BASE,
      },
    },
    {
      name: 'https-proxy',
      cwd: '/opt/homebrew/bin/',
      script: `ngrok http --region=us --hostname=linen-san.ngrok.io 80`,
    },
  ],
};
