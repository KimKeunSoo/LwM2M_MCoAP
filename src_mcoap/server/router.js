const Router = require("coap-router");
const mux = Router();
//import startTime from "./server";

var endTime;
mux.help = `URL: coap://hostname/
Usage:
GET / - Display this help document.
GET /thermometer - Get the current temperature together with humidity.
GET /thermometer observe - Immediately get the above information when changed.
GET /thermometer/temperature - Get the current temperature only.
GET /thermometer/humidity - Get the current humidity only.
GET /thermometer/:foo/:bar - Test route parameters.`;

var value = 0;

mux.post("/test", (req, res) => {
  endTime = performance.now();
  value = JSON.parse(req.payload).value;
  console.log("Received Data : " + value);
  console.log("Delay Time : " + endTime - startTime);
  res.writeHead(200);
  res.end({ success: true });
});

module.exports = mux;
