var config = require("./config"),
  async = require("async"),
  globalServerInfo;
var lwm2mServer = require("lwm2m-node-lib").server;
var clUtils = require("command-node");

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

function start() {
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

function read(commands) {
  var obj = parseResourceId(commands[1], false);

  if (obj) {
    lwm2mServer.read(
      commands[0],
      obj.objectType,
      obj.objectId,
      obj.resourceId,
      function (error, result) {
        if (error) {
          clUtils.handleError(error);
        } else {
          console.log("\nResource read:\n----------------------------\n");
          console.log("Id: %s", commands[1]);
          console.log("Value: %s", result);
        }
      }
    );
  } else {
    console.log("\nCouldn't parse resource URI: " + commands[1]);
  }
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
    "\nValue changed\ndeviceID: %s\nobjectID: %s\nresourceID: %s\nGot new value: %s\n",
    deviceId,
    objectId,
    resourceId,
    value
  );
}

function observe(devId, objectType, objectId, resourceId) {
  lwm2mServer.observe(
    devId,
    objectType,
    objectId,
    resourceId,
    handleValues,
    function (error, result) {
      if (error) {
        console.log("error");
      } else {
        console.log(
          "Start observing value\ndeviceID: %s\nobjectID: %s\nresourceID: %s\nOriginal value: %s\n",
          devId,
          objectId,
          resourceId,
          result
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

function cancelObservation(commands) {
  lwm2mServer.cancelObserver(
    commands[0],
    commands[1],
    commands[2],
    commands[3],
    function handleCancel(error) {
      if (error) {
        clUtils.handleError(error);
      } else {
        console.log(
          "\nObservation cancelled for resource [/%s/%s/%s]\n",
          commands[1],
          commands[2],
          commands[3]
        );
      }
    }
  );
}

function testRunning(handler) {
  return function (commands) {
    if (lwm2mServer.isRunning()) {
      handler(commands);
    } else {
      console.log(
        "Couldn't list devices, as the server is not started. " +
          "Start the server before issuing any command."
      );
    }
  };
}

var commands = {
  start: {
    parameters: [],
    description:
      "\tStarts a new Lightweight M2M server listening in the prefconfigured port.",
    handler: start,
  },
  stop: {
    parameters: [],
    description: "\tStops the current LWTM2M Server running.",
    handler: testRunning(stop),
  },
  list: {
    parameters: [],
    description: "\tList all the devices connected to the server.",
    handler: testRunning(listClients),
  },
  write: {
    parameters: ["deviceId", "resourceId", "resourceValue"],
    description:
      "\tWrites the given value to the resource indicated by the URI (in LWTM2M format) in the given" +
      "device.",
    handler: testRunning(write),
  },
  execute: {
    parameters: ["deviceId", "resourceId", "executionArguments"],
    description: "\tExecutes the selected resource with the given arguments.",
    handler: testRunning(execute),
  },
  read: {
    parameters: ["deviceId", "resourceId"],
    description:
      "\tReads the value of the resource indicated by the URI (in LWTM2M format) in the given device.",
    handler: testRunning(read),
  },
  discover: {
    parameters: ["deviceId", "objTypeId", "objInstanceId", "resourceId"],
    description:
      "\tSends a discover order for the given resource to the given device.",
    handler: testRunning(discover),
  },
  discoverObj: {
    parameters: ["deviceId", "objTypeId", "objInstanceId"],
    description:
      "\tSends a discover order for the given instance to the given device.",
    handler: testRunning(discoverObj),
  },
  discoverType: {
    parameters: ["deviceId", "objTypeId"],
    description:
      "\tSends a discover order for the given resource to the given device.",
    handler: testRunning(discoverType),
  },
  observe: {
    parameters: ["deviceId", "objTypeId", "objInstanceId", "resourceId"],
    description: "\tStablish an observation over the selected resource.",
    handler: testRunning(observe),
  },
  writeAttr: {
    parameters: [
      "deviceId",
      "objTypeId",
      "objInstanceId",
      "resourceId",
      "attributes",
    ],
    description:
      "\tWrite a new set of observation attributes to the selected resource. The attributes should be\n\t " +
      "in the following format: name=value(,name=value)*. E.g.: pmin=1,pmax=2.",
    handler: testRunning(writeAttributes),
  },
  cancel: {
    parameters: ["deviceId", "objTypeId", "objInstanceId", "resourceId"],
    description:
      "\tCancel the observation order for the given resource (defined with a LWTM2M URI) " +
      "to the given device.",
    handler: testRunning(cancelObservation),
  },
  config: {
    parameters: [],
    description: "\tPrint the current config.",
    handler: clUtils.showConfig(config, "server"),
  },
};

function serverStart() {
  command = ["start"];
  clUtils.executeCommander(command, commands);
}

exports.serverStart = serverStart;
exports.read = read;
exports.observe = observe;
exports.parseResourceId = parseResourceId;
exports.handleValues = handleValues;
