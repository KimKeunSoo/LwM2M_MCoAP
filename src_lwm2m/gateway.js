var server_module = require("./assets/server_module");
var client_module = require("./assets/client_module");

server_module.serverStart();
client_module.clientStart();

function readResource(devId, objId) {
  var obj = server_module.parseResourceId(objId, false);
  if (obj) {
    server_module.observe(devId, obj.objectType, obj.objectId, obj.resourceId);
  } else {
    console.log("\nCouldn't parse resource URI: " + devId);
  }
}

setTimeout(() => {
  readResource("1", "/75001/2/0");
}, 5000);
