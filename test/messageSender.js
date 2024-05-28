function sendMessage(channel, routingKey, msg) {
    if (channel) {
        channel.publish('deviceExchange', routingKey, Buffer.from(msg));
        console.log(" [x] Sent %s", msg);
    } else {
        console.error("Channel is not initialized");
    }
}

module.exports = { sendMessage };