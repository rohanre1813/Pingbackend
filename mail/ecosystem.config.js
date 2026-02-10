require('dotenv').config(); // load .env

module.exports = {
  apps: [
    {
      name: "mail-service",
      script: "src/index.ts",
      interpreter: "node",
      node_args: "--loader ts-node/esm",
      env: {
        PORT: process.env.PORT || 5001,
        RABBITMQ_HOST: process.env.RABBITMQ_HOST,
        RABBITMQ_PORT: process.env.RABBITMQ_PORT,
        RABBITMQ_USERNAME: process.env.RABBITMQ_USERNAME,
        RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
      },
    },
  ],
};
