// notifications-service/index.js — pendiente de implementar
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

(async () => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange("eventos", "topic", { durable: true });

  const q = await ch.assertQueue("notifications");
  await ch.bindQueue(q.queue, "eventos", "pedido.enviado");

  console.log("✉️ Notifications Service escuchando 'pedido.enviado'...");

  ch.consume(q.queue, msg => {
    const data = JSON.parse(msg.content.toString());
    console.log(`✉️ Email enviado al cliente del pedido ${data.pedidoId}`);
    ch.ack(msg);
  });



  setInterval(async () => {
      const pruebaDeVida = { time: Date.now(), service: 'notifications'};

      await ch.assertExchange("eventos", "topic", { durable: true });
    
      ch.publish("eventos", "prueba.vida", Buffer.from(JSON.stringify(pruebaDeVida)));
      console.log("📤 Evento 'prueba.vida' emitido:", pruebaDeVida.time);

  },1000)

})();