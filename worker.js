import { Socket } from "node:net";
import { workerData } from "node:worker_threads";
import { microservices } from "./ms-list.js";

var testFunc = () => {
  let test1 = [["127.0.0.1", "3001", "127.0.0.1:3002"]];
  let test2 = [["127.0.0.1", "3003", "127.0.0.1:3004"],["127.0.0.1", "3004"]];
  return process.env.MICROSERVICES === "1" ? test1 : test2;
}

var test = process.env.MICROSERVICES && testFunc();
var services = test || microservices;

var { uint8 } = workerData;

services.forEach(([, , dependency], key) => {
  if (dependency) {
    var [host, port] = dependency.split(":");
    let sock = new Socket();
    sock
      .on("connect", () => {
        console.log(`Ping: ${host}:${port}`);
        uint8[key] = 1;
      })
      .on("error", (e) => {
        sock.destroy();
        console.error(`Socket error: ${host}:${port}`);
        uint8[key] = 0;
        console.log(e.message);
      })
      .on("timeout", () => {
        uint8[key] = 0;
        console.error(`Timeout error: ${host}:${port}`);
        sock.destroy();
      })
      .connect(port, host);
  }
});
