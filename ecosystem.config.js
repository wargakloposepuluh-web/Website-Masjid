module.exports = {
  apps: [
    {
      name: "simas-masjid",
      script: "npm",
      args: "run start",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "750M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
