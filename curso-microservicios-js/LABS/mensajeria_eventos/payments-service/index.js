// payments-service/index.js — pendiente de implementar
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";
let pagos = 0;

(async () => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange("eventos", "topic", { durable: true });

  const q = await ch.assertQueue("payments");
  await ch.bindQueue(q.queue, "eventos", "pedido.creado");

  console.log("💳 Payments Service escuchando 'pedido.creado'...");

  ch.consume(q.queue, msg => {
    pagos++;
    const pedido = JSON.parse(msg.content.toString());
    console.log(`💳 Pago realizado para pedido ${pedido.id}`);

    const eventoPago = { pedidoId: pedido.id, cliente: pedido.cliente };
    ch.publish("eventos", "pago.confirmado", Buffer.from(JSON.stringify(eventoPago)));

    ch.ack(msg);
  });




  setInterval(async () => {
      const pruebaDeVida = { time: Date.now(), service: 'paymentservice',instance: process.env.HOSTNAME,  pagos};

      await ch.assertExchange("eventos", "topic", { durable: true });
    
      ch.publish("eventos", "prueba.vida", Buffer.from(JSON.stringify(pruebaDeVida)));
      console.log("📤 Evento 'prueba.vida' emitido:", pruebaDeVida.time);

  },1000)

})();