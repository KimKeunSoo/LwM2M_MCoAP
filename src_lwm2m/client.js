var client_module = require("./assets/client_module");

(async function main() {
  client_module.clientStart();
  client_module.connect("localhost", 5683, "/", "device1");
  client_module.create("/75001/2");

  let i = 100;
  client_module.set("/75001/2", 0, i);
  setInterval(() => {
    console.log("Value Changed : %d -> %d", i, i + 100);
    i += 100;
    client_module.set("/75001/2", 0, i);
  }, 2000);
})();
