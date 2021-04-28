const { performance } = require("perf_hooks");
const mqtt = require("mqtt");
const coap = require("coap");
const fs = require("fs");
const { start } = require("lwm2m-node-lib/lib/lwm2m-server");
const jsonFile = fs.readFileSync("../assets/config.json", "utf8");
const jsonData = JSON.parse(jsonFile);
let initialized = false;
var ip = jsonData.broker.ip;
var port = jsonData.broker.port;
var topic = jsonData.topic_client;

const options = {
  keepalive: 1000,
};
var client = mqtt.connect(`mqtt://${ip}:${port}`, options);
var startTime, endTime;

const coapServer = coap.createServer(function (req, res) {
  var receivedJson = "";
  req.on("data", function (chunk) {
    receivedJson += chunk;
  });
  req.on("end", function () {
    endTime = performance.now();

    var reqObj = JSON.parse(receivedJson);
    console.log(`Received Value : ${reqObj.value}`);
    console.log(`Size is ${byteCount(reqObj.value)}`);
    console.log("----------------------------\nend : " + endTime);
    console.log(`**Delay Time is ${endTime - startTime}\n\n`);
    endTime = 0;
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

client.on("connect", () => {
  if (!client) {
    throw Error(`MQTT.connect() error. (ip: ${ip}, port: ${port})`);
  }
  console.log(`connected to MQTT broker [${ip}]`);
  console.log(`client keepalive : ${client.options.keepalive}`);
  console.log(`Client ID is ${client.options.clientId}\n`);

  init(client);

  // setTimeout(() => {
  //   let i = 0;
  //   setInterval(() => {
  //     i += 5;
  //     console.log(i + "s after");
  //     if (i % 200 === 0) {
  //       startTime = performance.now();
  //       console.log("start : " + startTime + "\n-----------read-------------");
  //       client.publish(topic, "");
  //       console.log("Sent Complete");
  //     }
  //   }, 5000);
  // }, 5000);

  setTimeout(() => {
    setInterval(() => {
      startTime = performance.now();
      //console.log("start : " + startTime + "\n-----------read-------------");
      client.publish(topic, "READ#SENSOR#01");
      // console.log("Sent Complete");
    }, 10000);
  }, 5000);
});

function init(_client) {
  client = _client;
  initialized = true;
}

function byteCount(s) {
  return encodeURI(s).split(/%..|./).length - 1;
}
