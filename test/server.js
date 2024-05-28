//xlebuchek:uKJajDLcTlS3IvnT - database
//mongodb+srv://xlebuchek:uKJajDLcTlS3IvnT@iot-project.c0woxub.mongodb.net/?retryWrites=true&w=majority&appName=IoT-project
const express = require('express');
const router = require('./router.js');
const client = require('prom-client');
const amqp = require('amqplib/callback_api');
const { sendMessage } = require('./messageSender');

const port = 8080;

const app = express();

const register = new client.Registry();
client.collectDefaultMetrics({
    register
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});
app.use(express.json());
app.use('', router);


app.listen(port, () => console.log("Server started"));

let channel = null;

// Connect to RabbitMQ and create a channel

function connect(){
    amqp.connect('amqp://rabbitmq', (error0, connection) => {
        try {
            connection.createChannel((error1, ch) => {
                try {
                    channel = ch;
                    console.log("RabbitMQ channel created");

                    // Create an exchange for topic-based routing
                    // channel.assertExchange('deviceExchange', 'topic', {
                    //     durable: false
                    // });
                    channel.assertQueue('data_exchange', { durable: true });
                    console.log('Waiting for messages in data_queue...');

                    channel.consume('data_exchange', async (msg) => {
                        const data = JSON.parse(msg.content.toString());
                        console.log('Received data:', data);
                        // Вызываем соответствующий метод из роутера для обработки полученных данных
                        await router.handleData(channel, data);
                    }, { noAck: true });
                }catch (e){
                    setTimeout(connect, 2000);
                }
            });
        }catch (e){
            setTimeout(connect, 2000);
        }

    });
}

connect();

