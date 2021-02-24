var server_module = require("./assets/server_module");
var config = require("./assets/server_config");

// Server 192.168.50.110

(async function main() {
  server_module.start(config);
  function readResource(devId, objId) {
    var obj = server_module.parseResourceId(objId, false);
    if (obj) {
      server_module.observe(
        devId,
        obj.objectType,
        obj.objectId,
        obj.resourceId,
        server_module.handleValues
      );
    } else {
      console.log("\nCouldn't parse resource URI: " + devId);
    }
  }
  function cancelObservation(devId, objId) {
    var obj = server_module.parseResourceId(objId, false);
    if (obj) {
      server_module.cancelObservation(
        devId,
        obj.objectType,
        obj.objectId,
        obj.resourceId
      );
    } else {
      console.log("\nCouldn't parse resource URI: " + devId);
    }
  }
  setTimeout(() => {
    readResource("1", "/75002/2/0");
  }, 10000);

  // setTimeout(() => {
  //   cancelObservation("1", "/75002/2/0");
  // }, 15000);
})();
