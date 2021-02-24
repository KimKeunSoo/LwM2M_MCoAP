const fs = require("fs");

let initialized = false;
let count = 1;
let sumTime = 0;
let MAX = 10;
var startTime;
/* Connect Broker and Subscribe */
function connectSubscribe(client, jsonData, topic) {
  client.on("connect", () => {
    if (!client) {
      throw Error(
        `MQTT.connect() error. (ip: ${jsonData.broker.ip}, port: ${jsonData.broker.port})`
      );
    }
    console.log(`connected to MQTT broker [${jsonData.broker.ip}]`);
    console.log(`Client ID is ${client.options.clientId}`);
    client.subscribe(topic, (err) => {
      if (err) {
        console.log(`cannot subscribe on ${topic}`);
        return;
      }
      if (!err) {
        console.log(`complete subscribe on ${topic}\n`);
      }
      init(client);
    });
  });
}

function responseMessage(client, jsonData) {
  client.on("message", function (string, message) {
    if (!initialized) {
      throw error("Pub must be initialized.");
    }
    if (message.toString() === "GET") {
      client.publish(jsonData.topic_server, jsonData.message);
      console.log("Response completed.");
      console.log(`[${count++}] Sent data : ${jsonData.message}\n`);
    }
  });
}
function responseFile(client, jsonData) {
  client.on("message", function (string, message) {
    if (!initialized) {
      throw error("Pub must be initialized.");
    }
    if (message.toString() === "GET") {
      fs.readFile(jsonData.file, function (err, data) {
        client.publish(jsonData.topic_server, data);
        console.log("Response completed.");
        console.log(
          `[${count++}] Sent data size : ${getfileSize(data.length)}\n`
        );
      });
    }
  });
}

function request(client, jsonData) {
  init(client);
  if (!initialized) {
    throw Error("Pub must be initialized.");
  }
  const sendRequest = () => {
    setTimeout(() => {
      if (count > MAX) {
        console.log(
          `Average Delay Time in ${count - 1} packets is ${(
            sumTime / count
          ).toFixed(4)} ms.\n`
        );
        process.on("SIGKILL");
      }
      startTime = Date.now();

      client.publish(jsonData.topic_client, "GET");
      console.log("Request completed.");
      sendRequest();
    }, 2000);
  };
  sendRequest();
}

function ReceivedMessage(client) {
  client.on("message", function (topic, message) {
    console.log(`[${count++}] Received data : ${message}`);
    endTime = Date.now();
    console.log(`Delay Time is : ${endTime - startTime} ms\n`);
    /*  console.log(`Delay Time is : ${endTime-startTime} ms\n`) */
    sumTime += endTime - startTime;
  });
}

function ReceivedFile(client) {
  client.on("message", function (topic, message) {
    console.log(`[${count++}] Received data : ${getfileSize(message.length)}`);
    endTime = Date.now();
    console.log(`Delay Time is : ${endTime - startTime} ms\n`);
    /*  console.log(`Delay Time is : ${endTime-startTime} ms\n`) */
    sumTime += endTime - startTime;
  });
}

function init(_client) {
  client = _client;
  initialized = true;
}

function getfileSize(x) {
  var s = ["bytes", "kB", "MB", "GB", "TB", "PB"];
  var e = Math.floor(Math.log(x) / Math.log(1024));
  return (x / Math.pow(1024, e)).toFixed(4) + " " + s[e];
}

exports.connectSubscribe = connectSubscribe;
exports.responseMessage = responseMessage;
exports.responseFile = responseFile;
exports.request = request;
exports.ReceivedMessage = ReceivedMessage;
exports.ReceivedFile = ReceivedFile;
exports.init = init;
