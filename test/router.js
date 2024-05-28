const express = require('express');
const router = express.Router();
const { sendMessage } = require('./messageSender');

router.put('/updateValues', async (req, res) => {
    try {
        const value = req.body;
        const { numberOfHotel, temperature, CO2, humidity } = value;
        console.log(numberOfHotel, temperature, CO2, humidity);
        res.json({ message: 'Values received' });
        await checkValues(value, numberOfHotel);
    } catch (e) {
        res.status(500).json(e);
    }
});

router.post('/hello', async (req, res) => {
    try {
        const { port, deviceType, numberOfHotel } = req.body;
        // Handle device registration if necessary
        res.json({ message: 'Hello received' });
    } catch (e) {
        res.status(500).json(e);
    }
});

async function checkValues(chanel, value, numberOfHotel) {
    const { temperature, CO2, humidity } = value;
    if (temperature > 28) {
        await sendData(chanel, true, 1, numberOfHotel); // кондиционер
    } else if (temperature < 18) {
        await sendData(chanel, false, 1, numberOfHotel); // кондиционер
    }

    if (temperature > 18) {
        await sendData(chanel, false, 2, numberOfHotel); // обогреватель
    } else if (temperature < 15) {
        await sendData(chanel, true, 2, numberOfHotel); // обогреватель
    }

    if (humidity > 60) {
        await sendData(chanel, false, 3, numberOfHotel);
    } else if (humidity < 30) {
        await sendData(chanel, true, 3, numberOfHotel);
    }

    if (CO2 > 1000) {
        await sendData(chanel, true, 4, numberOfHotel);
    } else if (CO2 < 300) {
        await sendData(chanel, false, 4, numberOfHotel);
    }
}

router.handleData = async (chanel, data) => {
    //try {
        console.log(data);
        const numberOfHotel = data.numberOfHotel;
        const temperature = data.temperature;
        const CO2 = data.CO2;
        const humidity = data.humidity;
        const value = {temperature: temperature, CO2: CO2, humidity: humidity};
        console.log(value);
        //const { numberOfHotel, temperature, CO2, humidity } = data;
        await checkValues(chanel, value, Number(numberOfHotel));
    // } catch (error) {
    //     console.error('Ошибка обработки данных:', error.message);
    // }
};
async function sendData(chanel, isEnabled, device, numberOfHotel) {
    const data = {
        isEnabled: isEnabled,
        numberOfHotel: numberOfHotel,
        deviceType: device
    };

    console.log("data: " + data);

    const value = JSON.stringify(data);
    console.log("value: " + value);

    const routingKey = `hotel.${numberOfHotel}.device.${device}`;
    sendMessage(chanel, routingKey, value);
}

module.exports = router;