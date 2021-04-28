const { performance } = require("perf_hooks");
var server_module = require("./assets/server_module");
var config = require("./assets/server_config");
var end = 0;

server_module.start(config);
function readResource(devId, objId, callback) {
  var obj = server_module.parseResourceId(objId, false);
  if (obj) {
    server_module.read(
      devId,
      obj.objectType,
      obj.objectId,
      obj.resourceId,
      function (res) {
        end = res;
        callback(end);
      }
    );
  } else {
    console.log("\nCouldn't parse resource URI: " + devId);
  }
}

// server_module.getServer().on("message", function (message, remote) {
//   console.log("Got PING from Client", message.toString());
//   server.send("", 0, 0, remote.port, remote.address, () => {
//     console.log("Send PONG to Client", message.toString());
//   });
// });
// server.on("message", function (message, remote) {
//   console.log("Got PING from Client", message.toString());
//   server.send("", 0, 0, remote.port, remote.address, () => {
//     console.log("Send PONG to Client", message.toString());
//   });
// });
// server.bind("5683", "192.168.50.110");

// function cancelObservation(devId, objId) {
//   var obj = server_module.parseResourceId(objId, false);
//   if (obj) {
//     server_module.cancelObservation(
//       devId,
//       obj.objectType,
//       obj.objectId,
//       obj.resourceId
//     );
//   } else {
//     console.log("\nCouldn't parse resource URI: " + devId);
//   }
// }

setTimeout(() => {
  setInterval(() => {
    const start = performance.now();
    //console.log("start : " + start);
    readResource("1", "/75002/2/0", function (end) {
      // console.log("----------------------------\nend : " + end);
      console.log(`**Delay Time : ${end - start}\n\n`);
    });
  }, 4000);
}, 5000);
