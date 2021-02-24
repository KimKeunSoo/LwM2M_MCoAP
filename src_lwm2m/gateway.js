var server_module = require("./assets/server_module");
var client_module = require("./assets/client_module");
const config = require("./assets/gateway_config");

// GW
// Private Side 169.254.130.33
// Public Side 192.168.50.120

function handleValuesNStore(value, objectType, objectId, resourceId, deviceId) {
  console.log(
    "\nValue changed\ndeviceID: %s\nobjectID: %s\nresourceID: %s\nGot new value: %s\n",
    deviceId,
    objectId,
    resourceId,
    value
  );
  console.log("set new values completed");
  client_module.set("/75002/2", 0, value);
}

server_module.start(config);
function readResource(devId, objId) {
  var obj = server_module.parseResourceId(objId, false);
  if (obj) {
    server_module.observe(
      devId,
      obj.objectType,
      obj.objectId,
      obj.resourceId,
      handleValuesNStore
    );
  } else {
    console.log("\nCouldn't parse resource URI: " + devId);
  }
}

client_module.start(config);

client_module.connect("192.168.50.110", 5683, "/", "device1");
client_module.create("/75002/2");

setTimeout(() => {
  readResource("1", "/75001/2/0");
}, 5000);
