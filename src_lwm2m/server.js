var server_module = require("./assets/server_module");

// Server 192.168.50.110

(async function main() {
  server_module.serverStart();
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

  setTimeout(() => {
    readResource("1", "/75002/2/0");
  }, 5000);
})();
