var client_module = require("./assets/client_module");
var config = require("./assets/client_config");
// Client 169.254.130.40 ~ 255

client_module.start(config);
client_module.connect("192.168.50.110", 5683, "/", "device1");
client_module.create("/75002/2");

let i = 100;
client_module.set("/75002/2", 0, i);
setInterval(() => {
  console.log("Value Changed : %d -> %d", i, i + 100);
  console.log();
  i += 100;
  client_module.set("/75002/2", 0, i);
  client_module.updateConnection2();
}, 2000);
