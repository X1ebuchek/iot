const amqp = require('amqplib');

const numberOfHotel = process.argv[2];

function generate(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendData(channel) {
    const temperature = generate(-20, 40);
    const CO2 = generate(200, 1300);
    const humidity = generate(0, 100);

    const data = {
        numberOfHotel: numberOfHotel,
        temperature: temperature,
        CO2: CO2,
        humidity: humidity
    };

    try {
        await channel.assertQueue('data_exchange', { durable: true });
        // Отправляем сообщение в очередь
        await channel.sendToQueue('data_exchange', Buffer.from(JSON.stringify(data)));
        console.log("Данные о воздухе отправлены в обменник");
    } catch (error) {
        console.error('Ошибка отправки данных в обменник:', error.message);
    }
}

async function start() {
    try {
        const connection = await amqp.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();

        // Отправка данных каждые 10 секунд
        setInterval(() => sendData(channel), 10000);
    } catch (error) {
        console.error('Ошибка подключения к RabbitMQ:', error.message);
        // Повторная попытка подключения через 5 секунд
        setTimeout(start, 5000);
    }
}

start();
