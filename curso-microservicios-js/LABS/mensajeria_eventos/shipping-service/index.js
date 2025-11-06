// shipping-service/index.js — pendiente de implementar
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

(async () => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange("eventos", "topic", { durable: true });

  const q = await ch.assertQueue("shipping");
  await ch.bindQueue(q.queue, "eventos", "pago.confirmado");

  console.log("🚚 Shipping Service escuchando 'pago.confirmado'...");

  ch.consume(q.queue, msg => {
    const data = JSON.parse(msg.content.toString());
    console.log(`🚚 Envío preparado para pedido ${data.pedidoId}`);
    const eventoEnvio = { pedidoId: data.pedidoId };
    ch.publish("eventos", "pedido.enviado", Buffer.from(JSON.stringify(eventoEnvio)));
    ch.ack(msg);
  });
})();