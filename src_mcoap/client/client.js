const mqtt = require("mqtt");
const coap = require("coap");
const fs = require("fs");
const jsonFile = fs.readFileSync("../assets/config.json", "utf8");
const jsonData = JSON.parse(jsonFile);
let initialized = false;
var ip = jsonData.broker.ip;
var port = jsonData.broker.port;
var topic = jsonData.topic_client;

var data = JSON.stringify({
  value: 100,
});

const option = {
  host: "192.168.50.110",
  pathname: "/",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

var client = mqtt.connect(`mqtt://${ip}:${port}`, { keepalive: 120 });
client.on("connect", () => {
  if (!client) {
    throw Error(`MQTT.connect() error. (ip: ${ip}, port: ${port})`);
  }
  console.log(`connected to MQTT broker [${ip}]`);
  console.log(`client keepalive : ${client.options.keepalive}`);
  console.log(`Client ID is ${client.options.clientId}`);

  client.subscribe(topic, (err) => {
    if (err) {
      console.log(`cannot subscribe on ${topic}`);
      return;
    } else {
      console.log(`complete subscribe on ${topic}\n`);
    }
    //init(client);
  });
});

client.on("message", function (topic, message) {
  console.log("Received with MQTT : " + message);

  const req = coap.request(option);
  req.write(data, function (err) {
    req.end();
  });
  req.on("response", function (res) {
    console.log(`statusCode : ${res.code}`);
    if (res.code !== "2.05") return process.exit(1);
    else
      console.log(
        `received success? : ${JSON.parse(res.payload).success}` + "\n"
      );
    data.value += 10;
  });

  req.on("error", (error) => {
    console.error(error);
  });
});

function init(_client) {
  client = _client;
  initialized = true;
}
