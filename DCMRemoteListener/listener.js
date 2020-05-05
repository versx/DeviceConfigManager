//------------------------------------------------------------------------------
//  LOCAL CONFIGS
//------------------------------------------------------------------------------
NODE_NAME = "Scanner 1";
LISTENING_PORT = "6542";

//------------------------------------------------------------------------------
//  PACKAGE REQUIREMENTS
//------------------------------------------------------------------------------
const fs = require("fs");
const Moment = require("moment");
const Request = require("request");
const express = require("express");
const { exec } = require("child_process");

// DEFINE THE EXPRESS SERVER
var server = express().use(express.json({ limit: "1mb" }));

//------------------------------------------------------------------------------
//  GET LOCAL DEVICE INFORMATION
//------------------------------------------------------------------------------
var devices = [];
cli_exec("ios-deploy -c","device_identification");

//------------------------------------------------------------------------------
//  PAYLOAD PROCESSING
//------------------------------------------------------------------------------
server.post("/", (payload, res) => {
  console.log("[DCM] [listener.js] ["+getTime("log")+"] Received a Payload:",payload.body)
  let target = payload.body;
  // GO THROUGH DEVICE ARRAY TO FIND A MATCH
  devices.forEach( async (device,i) => {
    switch(target.type){

      // RESTART A DEVICE
      case "restart":
        if(device.name == target.device){
          let restart = await cli_exec("idevicediagnostics -u "+device.uuid+" restart","device_command");

          // THERE WAS AN ERROR WITH IDEVICEDIAGNOSTICS
          if(restart.hasError){
            console.error("[DCM] [listener.js] ["+getTime("log")+"] Failed to Restart "+device.name+" : "+device.uuid+".",response.error);

            // SEND ERROR TO DCM
            res.json({ status: 'error', node: NODE_NAME, error:'Failed to restart device.' });

          // RESTART WAS SUCCESSFUL
          } else{
            console.log("[DCM] [listener.js] ["+getTime("log")+"] Restarted "+device.name+" : "+device.uuid+".");

            // SEND CONFIRMATION TO DCM
            res.json({ status: 'ok' });
          }
        } break;

      // case 'FUTURE': break;
      //
      //
      //
      //
    }
  }); return;
});

//------------------------------------------------------------------------------
//  COMMAND LINE EXECUTION
//------------------------------------------------------------------------------
function cli_exec(command,type){
  return new Promise( async function(resolve){
    let response = {};
    exec(command, async (err, stdout, stderr) => {
      if(err){
        console.error("[DCM] [listener.js] ["+getTime("log")+"]", err);
        response.hasError = true;
        response.error = stderr;
      } else {
        switch(type){

          // INITIAL DEVICE IDENTIFICATION FOR DEVICE ARRAY
          case 'device_identification':
            let data = stdout.split("\n");
            await data.forEach((device,i) => {
              if(device.includes('iPhone')){
                let device_object = {};
                device_object.name = device.split("'")[1];
                device_object.uuid = device.split(" ")[2];
                devices.push(device_object);
                console.log("[DCM] [listener.js] ["+getTime("log")+"] Found Device:", device_object);
              }
            });
            console.log("[DCM] [listener.js] ["+getTime("log")+"] Total Devices: "+devices.length);
            return resolve(); break;

          // GENERAL IDEVICEDIAGNOSTICS COMMAND
          case 'device_command':
            response.hasError = false;
            response.result = stdout;
            return resolve(response);
        }
      }
    });
  });
}

//------------------------------------------------------------------------------
//  GET TIME FUNCTION
//------------------------------------------------------------------------------
function getTime(type,unix){
  if(!unix){
    switch(type){
      case "log": return Moment().format("hh:mmA");
      case "24hour": return Moment().format("HH:mm");
      case "full": return Moment().format("hh:mmA DD-MMM");
    }
  } else{
    switch(type){
      case "24hour": return Moment.unix(unix).format("HH:mm");
      case "log": return Moment.unix(unix).format("hh:mmA");
      case "full": return Moment.unix(unix).format("hh:mmA DD-MMM");
    }
  }
}

// LISTEN TO THE SPECIFIED PORT FOR TRAFFIC
server.listen(LISTENING_PORT);
console.info("[DCM] [listener.js] ["+getTime("log")+"] Now Listening on port "+LISTENING_PORT+".");
