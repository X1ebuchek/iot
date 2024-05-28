//const express = require('express');
const amqp = require('amqplib/callback_api');

const port = process.argv[2];
const numberOfHotel = process.argv[3];
const deviceType = 3;

//const app = express();
//app.use(express.json());

let isEnabled = false;

function setEnabled(setEnabled) {
    isEnabled = setEnabled;
    if (isEnabled) console.log("Увлажнитель включён");
    else console.log("Увлажнитель выключен");
}

//app.listen(port, () => console.log("Увлажнитель слушает"));

function connect(){
    amqp.connect('amqp://rabbitmq', (error0, connection) => {
        try {
            connection.createChannel((error1, channel) => {
                try {
                    const exchange = 'deviceExchange';
                    const routingKey = `hotel.${numberOfHotel}.device.${deviceType}`;

                    channel.assertExchange(exchange, 'topic', {
                        durable: false
                    });

                    channel.assertQueue('', {
                        exclusive: true
                    }, (error2, q) => {
                        if (error2) {
                            throw error2;
                        }

                        console.log("Увлажитель слушает", q.queue);

                        channel.bindQueue(q.queue, exchange, routingKey);

                        channel.consume(q.queue, (msg) => {
                            const data = JSON.parse(msg.content.toString());
                            setEnabled(data.isEnabled);
                        }, {
                            noAck: true
                        });
                    });
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