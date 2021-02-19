var client_module = require("./assets/client_module");

// Client 169.254.130.40 ~ 255

(async function main() {
  client_module.clientStart();
  client_module.connect("169.254.130.33", 5683, "/", "device1");
  client_module.create("/75001/2");

  let i = 100;
  client_module.set("/75001/2", 0, i);
  setInterval(() => {
    console.log("Value Changed : %d -> %d", i, i + 100);
    i += 100;
    client_module.set("/75001/2", 0, i);
  }, 2000);
})();
