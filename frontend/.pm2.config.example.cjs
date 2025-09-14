module.exports = {
  apps: [
    {
      name: "application name",
      script: "./.output/server/index.mjs",
      env: {
        NODE_ENV: "production",
        PORT: { PRODUCTION_PORT },
      },
    },
  ],
};
