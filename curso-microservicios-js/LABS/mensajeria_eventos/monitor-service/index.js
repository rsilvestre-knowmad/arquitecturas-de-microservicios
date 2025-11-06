import express from "express";
import amqp from "amqplib";

const app = express();
app.use(express.json());
const PORT = 3000;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

let estado = {};
let pedidos = 0;


(async () => {
  

  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange("eventos", "topic", { durable: true });

  const q = await ch.assertQueue("health");
  await ch.bindQueue(q.queue, "eventos", "prueba.vida");
  ch.consume(q.queue, msg => {
    const data = JSON.parse(msg.content.toString());
    let instance = data.instance ? data.instance : 'none'
    estado[`${data.service}-${instance}`] = data.time
  });




  const q1 = await ch.assertQueue("payments_monitor");
  await ch.bindQueue(q1.queue, "eventos", "pedido.creado");
  ch.consume(q1.queue, msg => {
    pedidos++
  });




})();

app.get("/", async (req, res) => {
  res.json({estado, pedidos});
});

app.listen(PORT, () => console.log(`🧾 Orders Service en puerto ${PORT}`));
