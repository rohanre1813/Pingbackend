import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOtpConsumer = async () => {
  try {
  const RABBITMQ_PORT = process.env.RABBITMQ_PORT
  ? parseInt(process.env.RABBITMQ_PORT, 10)
  : 5672;

    // 1️⃣ Connect to RabbitMQ
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    const channel = await connection.createChannel();
    const queueName = "sent-otp";

    await channel.assertQueue(queueName, { durable: true });
    console.log("Connected to RabbitMQ - mail-service consumer");

    // 2️⃣ Consume messages from RabbitMQ
    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, html, text } = JSON.parse(msg.content.toString());

          // 3️⃣ Setup Nodemailer transporter
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          // 4️⃣ Send email
          await transporter.sendMail({
            from: `"PING" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text,
          });

          console.log(`OTP sent successfully to ${to}`);
          channel.ack(msg); // ✅ mark message as processed
        } catch (err) {
          console.log("Error sending OTP:", err);
        }
      }
    });
  } catch (err) {
    console.log("Cannot connect to RabbitMQ / send OTP:", err);
  }
};
