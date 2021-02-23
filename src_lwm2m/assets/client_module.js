var lwm2mClient = require("lwm2m-node-lib").client,
  globalDeviceInfo,
  separator = "\n\n\t",
  clUtils = require("command-node");

function start(config) {
  lwm2mClient.init(config);
}

function handleWrite(objectType, objectId, resourceId, value, callback) {
  console.log("\nValue written:\n--------------------------------\n");
  console.log("-> ObjectType: %s", objectType);
  console.log("-> ObjectId: %s", objectId);
  console.log("-> ResourceId: %s", resourceId);
  console.log("-> Written value: %s", value);
  callback(null);
}

function handleExecute(objectType, objectId, resourceId, value, callback) {
  console.log("\nCommand executed:\n--------------------------------\n");
  console.log("-> ObjectType: %s", objectType);
  console.log("-> ObjectId: %s", objectId);
  console.log("-> ResourceId: %s", resourceId);
  console.log("-> Command arguments: %s", value);

  callback(null);
}

function handleRead(objectType, objectId, resourceId, value, callback) {
  //   console.log("\nValue read:\n--------------------------------\n");
  //   console.log("-> ObjectType: %s", objectType);
  //   console.log("-> ObjectId: %s", objectId);
  //   console.log("-> ResourceId: %s", resourceId);
  //   console.log("-> Read Value: %s", value);

  callback(null);
}

function setHandlers(deviceInfo) {
  lwm2mClient.setHandler(deviceInfo.serverInfo, "write", handleWrite);
  lwm2mClient.setHandler(deviceInfo.serverInfo, "execute", handleExecute);
  lwm2mClient.setHandler(deviceInfo.serverInfo, "read", handleRead);
}

function connect(host, port, url, endpointName) {
  var url;

  console.log("\nConnecting to the server. This may take a while.\n");

  lwm2mClient.register(
    host,
    port,
    url,
    endpointName,
    function (error, deviceInfo) {
      if (error) {
        console.log(error);
        return;
      }
      globalDeviceInfo = deviceInfo;

      setHandlers(deviceInfo);
      console.log(
        "\nConnected:\nDevice location: %s\nCurrent Host : %s\nCurrent Port : %s\n",
        deviceInfo.location,
        deviceInfo.currentHost,
        deviceInfo.currentPort
      );
    }
  );
}

function printObject(result) {
  var resourceIds = Object.keys(result.attributes);

  console.log(
    "\nObject Info:\nObjectType: %s\nObjectId: %s\nObjectUri: %s",
    result.objectType,
    result.objectId,
    result.objectUri
  );
  if (resourceIds.length > 0) {
    for (var i = 0; i < resourceIds.length; i++) {
      console.log(
        "Attributes[%s]: %s\n",
        resourceIds[i],
        result.attributes[resourceIds[i]]
      );
    }
  }
}

function handleObjectFunction(error, result) {
  if (error) {
    console.log(error);
    return;
  } else {
    printObject(result);
  }
}
function handleNothing(error, result) {
  if (error) {
    console.log(error);
    return;
  } else {
    console.log("Object create successfully.");
  }
}
function create(objUri) {
  lwm2mClient.registry.create(objUri, handleNothing);
}

function get(objUri) {
  lwm2mClient.registry.get(objUri, handleObjectFunction);
}

function set(objUri, resId, resValue) {
  lwm2mClient.registry.setResource(
    objUri,
    resId,
    resValue,
    handleObjectFunction
  );
}

function updateConnection() {
  if (globalDeviceInfo) {
    lwm2mClient.update(globalDeviceInfo, function (error, deviceInfo) {
      if (error) {
        console.log(error);
      } else {
        globalDeviceInfo = deviceInfo;
        setHandlers(deviceInfo);
        console.log("Information updated:\n--------------------------------\n");
      }
    });
  } else {
    console.error(
      "\nCouldn't find device information (the connection may have not been completed)."
    );
  }
}

function list() {
  lwm2mClient.registry.list(function (error, objList) {
    if (error) {
      console.log(error);
    } else {
      console.log("\nList:\n--------------------------------\n");
      for (var i = 0; i < objList.length; i++) {
        console.log(
          "\t-> ObjURI: %s / Obj Type: %s / Obj ID: %s / Resource Num: %d",
          objList[i].objectUri,
          objList[i].objectType,
          objList[i].objectId,
          Object.keys(objList[i].attributes).length
        );
      }
    }
  });
}
exports.start = start;
exports.connect = connect;
exports.create = create;
exports.set = set;
