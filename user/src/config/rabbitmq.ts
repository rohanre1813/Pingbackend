import amqp from 'amqplib'

let channel:amqp.Channel;

export const connectrabbitmq=async()=>{
  try{
   const connection=await amqp.connect({
   protocol:"amqp",
   hostname:process.env.rabbitmq_host,
   port:5672,
   username:process.env.rabbitmq_username,
   password:process.env.rabbitmq_password,

   })
   channel=await connection.createChannel();
   console.log("rabbitmq connected");
   
  }
  catch(err){
    console.log("failed to connect rabbitmq",err);
    
  }
}

export const publishtoqueue=async(queuename:string,message:any)=>{
  if(!channel){
    console.log("there is no chanel");
    return;
  }
    await channel.assertQueue(queuename,{durable:true})

    channel.sendToQueue(queuename,Buffer.from(JSON.stringify(message)),{
        persistent:true,
    }
  )
  }