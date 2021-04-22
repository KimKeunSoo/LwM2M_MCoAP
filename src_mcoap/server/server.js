const { performance } = require("perf_hooks");
const mqtt = require("mqtt");
const coap = require("coap");
const mux = require("./router");
const fs = require("fs");
const jsonFile = fs.readFileSync("../assets/config.json", "utf8");
const jsonData = JSON.parse(jsonFile);
let initialized = false;
var ip = jsonData.broker.ip;
var port = jsonData.broker.port;
var topic = jsonData.topic_client;

var client = mqtt.connect(`mqtt://${ip}:${port}`);
var startTime, endTime;

const coapServer = coap.createServer(function (req, res) {
  var receivedJson = "";
  req.on("data", function (chunk) {
    receivedJson += chunk;
  });
  req.on("end", function () {
    endTime = performance.now();
    console.log(`Delay Time is ${endTime - startTime}`);
    endTime = 0;
    var reqObj = JSON.parse(receivedJson);
    console.log(`Received Value : ${reqObj.value}`);
    console.log(`Size is ${byteCount(reqObj.value)}`);

    var resObj = {
      success: true,
    };
    res.writeHead(200);
    res.end(JSON.stringify(resObj));
  });
});

coapServer.listen(function () {
  console.log("Coap Server ON");
});

// coapServer.listen(function () {
//   console.log("Coap Server On");
// });

// coapServer.on("request", function (req, res) {
//   res.end("Receive Completed");
// });

client.on("connect", () => {
  if (!client) {
    throw Error(`MQTT.connect() error. (ip: ${ip}, port: ${port})`);
  }
  console.log(`connected to MQTT broker [${ip}]`);
  console.log(`client keepalive : ${client.options.keepalive}`);
  console.log(`Client ID is ${client.options.clientId}`);

  init(client);
  setTimeout(() => {
    setInterval(() => {
      startTime = performance.now();
      client.publish(topic, "");
      console.log("\nSent Complete");
    }, 1000);
  }, 5000);
});

function init(_client) {
  client = _client;
  initialized = true;
}

function byteCount(s) {
  return encodeURI(s).split(/%..|./).length - 1;
}
