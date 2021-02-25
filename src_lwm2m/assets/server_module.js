var async = require("async"),
  lwm2mServer = require("lwm2m-node-lib").server,
  clUtils = require("command-node"),
  globalServerInfo,
  globalStart,
  globalEnd,
  flag = 0;

function handleResult(message) {
  return function (error) {
    if (error) {
      clUtils.handleError(error);
    } else {
      console.log("\nSuccess: %s\n", message);
    }
  };
}

function registrationHandler(
  endpoint,
  lifetime,
  version,
  binding,
  payload,
  callback
) {
  console.log("\nDevice registration:");
  console.log(
    "Endpoint name: %s\nLifetime: %s\nBinding: %s\n",
    endpoint,
    lifetime,
    binding
  );
  callback();
}

function unregistrationHandler(device, callback) {
  console.log("\nDevice unregistration:\n----------------------------\n");
  console.log("Device location: %s", device);
  callback();
}

function setHandlers(serverInfo, callback) {
  globalServerInfo = serverInfo;
  lwm2mServer.setHandler(serverInfo, "registration", registrationHandler);
  lwm2mServer.setHandler(serverInfo, "unregistration", unregistrationHandler);
  callback();
}

function start(config) {
  async.waterfall(
    [async.apply(lwm2mServer.start, config.server), setHandlers],
    handleResult("Lightweight M2M Server started")
  );
}

function stop() {
  if (globalServerInfo) {
    lwm2mServer.stop(globalServerInfo, handleResult("COAP Server stopped."));
  } else {
    console.log("\nNo server was listening\n");
  }
}
function parseResourceId(resourceId, incomplete) {
  var components = resourceId.split("/"),
    parsed;

  if (incomplete || components.length === 4) {
    parsed = {
      objectType: components[1],
      objectId: components[2],
      resourceId: components[3],
    };
  }

  return parsed;
}

function write(commands) {
  var obj = parseResourceId(commands[1], false);

  if (obj) {
    lwm2mServer.write(
      commands[0],
      obj.objectType,
      obj.objectId,
      obj.resourceId,
      commands[2],
      handleResult("Value written successfully")
    );
  } else {
    console.log("\nCouldn't parse resource URI: " + commands[1]);
  }
}

function execute(commands) {
  var obj = parseResourceId(commands[1], false);

  if (obj) {
    lwm2mServer.execute(
      commands[0],
      obj.objectType,
      obj.objectId,
      obj.resourceId,
      commands[2],
      handleResult("Command executed successfully")
    );
  } else {
    console.log("\nCouldn't parse resource URI: " + commands[1]);
  }
}

function discover(commands) {
  lwm2mServer.discover(
    commands[0],
    commands[1],
    commands[2],
    commands[3],
    function handleDiscover(error, payload) {
      if (error) {
        clUtils.handleError(error);
      } else {
        console.log("\nResource attributes:\n----------------------------\n");
        console.log(
          "%s",
          payload
            .substr(payload.indexOf(";"))
            .replace(/;/g, "\n")
            .replace("=", " = ")
        );
        clUtils.prompt();
      }
    }
  );
}

function parseDiscoveredInstance(payload) {
  var resources = payload
      .substr(payload.indexOf(",") + 1)
      .replace(/<|>/g, "")
      .split(","),
    instance = {
      resources: resources,
    };

  return instance;
}

function parseDiscoveredType(payload) {
  var instances = payload
      .substr(payload.indexOf(",") + 1)
      .replace(/<|>/g, "")
      .split(","),
    type = {
      instances: instances,
    };

  return type;
}

function discoverObj(commands) {
  lwm2mServer.discover(
    commands[0],
    commands[1],
    commands[2],
    function handleDiscover(error, payload) {
      if (error) {
        clUtils.handleError(error);
      } else {
        var parseLoad = parseDiscoveredInstance(payload);

        console.log("\nObject instance\n----------------------------\n");
        console.log("* Resources:");

        for (var i = 0; i < parseLoad.resources.length; i++) {
          console.log("\t- %s", parseLoad.resources[i]);
        }

        console.log("\n");
      }
    }
  );
}

function discoverType(commands) {
  lwm2mServer.discover(
    commands[0],
    commands[1],
    function handleDiscover(error, payload) {
      if (error) {
        clUtils.handleError(error);
      } else {
        var parseLoad = parseDiscoveredType(payload);

        console.log(
          "\nObject type attributes:\n----------------------------\n"
        );
        console.log("* Instances:");

        for (var i = 0; i < parseLoad.instances.length; i++) {
          console.log("\t- %s", parseLoad.instances[i]);
        }

        console.log("\n");
      }
    }
  );
}

function listClients(commands) {
  lwm2mServer.listDevices(function (error, deviceList) {
    if (error) {
      clUtils.handleError(error);
    } else {
      console.log("\nDevice list:\n----------------------------\n");

      for (var i = 0; i < deviceList.length; i++) {
        console.log('-> Device Id "%s"', deviceList[i].id);
        console.log("\n%s\n", JSON.stringify(deviceList[i], null, 4));
      }
    }
  });
}

function handleValues(value, objectType, objectId, resourceId, deviceId) {
  console.log(
    "\nValue get(or changed)\ndeviceID: %s\nobjectID: %s\nresourceID: %s\nGot new value: %s\n",
    deviceId,
    objectId,
    resourceId,
    value
  );
  if (flag == 0) {
    var date = new Date();
    globalEnd = date.getTime();
    console.log("Total Time : " + (globalEnd - globalStart));
    flag = 1;
  }
}

function observe(devId, objectType, objectId, resourceId, activefunction) {
  lwm2mServer.observe(
    devId,
    objectType,
    objectId,
    resourceId,
    activefunction,
    function (error, result) {
      if (error) {
        console.log("error: can not observe");
      } else {
        console.log(
          "Start observing value\ndeviceID: %s\nobjectID: %s\nresourceID: %s\nOriginal value: %s\n",
          devId,
          objectId,
          resourceId,
          result
        );
        var date = new Date();
        globalStart = date.getTime();
        console.log("Start Time : " + globalStart);
      }
    }
  );
}
function read(devId, objectType, objectId, resourceId) {
  lwm2mServer.read(
    devId,
    objectType,
    objectId,
    resourceId,
    function (error, result) {
      if (error) {
        console.log("error: can not read");
      } else {
        console.log("\nResource read:\n----------------------------\n");
        console.log("Id: %s", objectId);
        console.log("Value: %s", result);
      }
    }
  );
}
function cancelObservation(deviceId, objectType, objectId, resourceId) {
  lwm2mServer.cancelObserver(
    deviceId,
    objectType,
    objectId,
    resourceId,
    function handleCancel(error) {
      if (error) {
        clUtils.handleError(error);
      } else {
        console.log(
          "\nObservation cancelled for resource [/%s/%s/%s]\n",
          deviceId,
          objectType,
          objectId
        );
      }
    }
  );
}

function parseAttributes(payload) {
  function split(pair) {
    return pair.split("=");
  }

  function group(previous, current) {
    if (current && current.length === 2) {
      previous[current[0]] = current[1];
    }

    return previous;
  }

  return payload.split(",").map(split).reduce(group, {});
}

function writeAttributes(commands) {
  var attributes = parseAttributes(commands[4]);

  if (attributes) {
    lwm2mServer.writeAttributes(
      commands[0],
      commands[1],
      commands[2],
      commands[3],
      attributes,
      function handleObserve(error) {
        if (error) {
          clUtils.handleError(error);
        } else {
          console.log(
            "\nAttributes wrote to resource [/%s/%s/%s]\n",
            commands[1],
            commands[2],
            commands[3]
          );
        }
      }
    );
  } else {
    console.log(
      "\nAttributes [%s] written for resource [/%s/%s/%s]\n",
      commands[4],
      commands[1],
      commands[2],
      commands[3]
    );
  }
}

exports.start = start;
exports.cancelObservation = cancelObservation;
exports.read = read;
exports.observe = observe;
exports.parseResourceId = parseResourceId;
exports.handleValues = handleValues;
