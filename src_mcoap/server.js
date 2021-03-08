const mqtt = require("mqtt");
const fs = require("fs");

const jsonFile = fs.readFileSync("./assets/config.json", "utf8");
const jsonData = JSON.parse(jsonFile);
let initialized = false;
var ip = jsonData.broker.ip;
var port = jsonData.broker.port;

var client = mqtt.connect(`mqtt://${ip}:${port}`);

client.on("connect", () => {
  if (!client) {
    throw Error(`MQTT.connect() error. (ip: ${ip}, port: ${port})`);
  }
  console.log(`connected to MQTT broker [${ip}]`);
  console.log(`client keepalive : ${client.options.keepalive}`);
  console.log(`Client ID is ${client.options.clientId}`);

  init(client);
  // setInterval(() => {
  //   client.publish("SERVER", "1234");
  // }, 400000);
});

function init(_client) {
  client = _client;
  initialized = true;
}
