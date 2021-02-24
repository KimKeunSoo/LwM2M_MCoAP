const mqtt = require("mqtt");
const fs = require("fs");

const jsonFile = fs.readFileSync("./assets/config.json", "utf8");
const jsonData = JSON.parse(jsonFile);
let initialized = false;
var ip = jsonData.broker.ip;
var port = jsonData.broker.port;
var topic = jsonData.topic_server;

var client = mqtt.connect(`mqtt://${ip}:${port}`);

client.on("connect", () => {
  if (!client) {
    throw Error(`MQTT.connect() error. (ip: ${ip}, port: ${port})`);
  }
  console.log(`connected to MQTT broker [${ip}]`);
  console.log(`Client ID is ${client.options.clientId}`);
  client.subscribe(topic, (err) => {
    if (err) {
      console.log(`cannot subscribe on ${topic}`);
      return;
    } else {
      console.log(`complete subscribe on ${topic}\n`);
    }
    init(client);
  });
});

function init(_client) {
  client = _client;
  initialized = true;
}
