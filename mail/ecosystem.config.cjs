module.exports = {
  apps: [
    {
      name: "mail-service",
      script: "dist/index.js",           // TS entry point
      interpreter: "node",              // run with Node
      cwd: "/home/ubuntu/Pingbackend/mail", // important: working directory
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "5001",
        RABBITMQ_HOST: "13.60.51.231",
        RABBITMQ_PORT: "5672",
        RABBITMQ_USERNAME: "guest",
        RABBITMQ_PASSWORD: "guest",
        EMAIL_USER: "rohanshetty135781@gmail.com",
        EMAIL_PASS: "jfbilnsezwhntyyb"
      }
    }
  ]
};
