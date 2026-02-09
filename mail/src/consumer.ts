import amqp from 'amqplib'
import nodemailer from 'nodemailer'
export const sendotpconumer=async()=>{
  try{
  const connection=await amqp.connect({
    protocol:"amqp",
   hostname:process.env.rabbitmq_host,
   port:5672,
   username:process.env.rabbitmq_username,
   password:process.env.rabbitmq_password,
  })
  const channel=await connection.createChannel()
  const queuename="sent-otp"

  await channel.assertQueue(queuename,{durable:true})
  console.log("connect to rabbitmq mailservice consumer");
  channel.consume(queuename,async(msg)=>{
    if(msg){
      try{
        const { to, subject, html, text } = JSON.parse(msg.content.toString());
        const transporter=nodemailer.createTransport({
           host:"smtp.gmail.com",
           port:465,
           secure:true,
           auth:{
            user:process.env.USER,
            pass:process.env.PASSWORD
           }
        })
        await transporter.sendMail({
  from: `"PING" <${process.env.USER}>`,
  to,
  subject,
  html, // beautiful email
  text, // fallback
});
      console.log(`otp send to ${to}`);
      channel.ack(msg)
      }
      catch(err){
        console.log("error happened",err);
        
      }
    }
  })
  
  }
  catch(err){
    console.log("cannot send otp",err);
    
  }
}