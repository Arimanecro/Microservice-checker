import { Worker, isMainThread } from "node:worker_threads";
import http from "node:http";
import { microservices } from "./ms-list.js";

const testFunc = () => {
  let test1 = [["127.0.0.1", "3001", "127.0.0.1:3002"]];
  let test2 = [["127.0.0.1", "3003", "127.0.0.1:3004"],["127.0.0.1", "3004"]];
  return process.env.MICROSERVICES === "1" ? test1 : test2;
};

const test = process.env.MICROSERVICES && testFunc();
var services = test || microservices;

var startStatus = new Uint8Array(services.length);

if (isMainThread) {
  const buffer = new SharedArrayBuffer(services.length);
  const uint8 = new Uint8Array(buffer);
  uint8.forEach((_, k) => (uint8[k] = 0));

  const worker = new Worker("./worker.js", { workerData: { uint8 } });
  worker.on("error", (e) => console.error(e));
  worker.on("exit", (code) => {
    if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
  });

  services.forEach(([address, port, dependency], key) => {
    http
      .createServer((_, res) => {
        if (!uint8[key] || (dependency && !startStatus[key])) {
          res.statusCode = 503;
          res.end("Server temporarily unavailable");
          console.log(`${address}:${port} temporarily unavailable `);
        } else {
          if (dependency && uint8[key]) {
            res.statusCode = 200;
            res.end("ok");
          }
        }
      })
      .on("error", (err) => {
        startStatus[key] = 0;
        console.error(err);
      })
      .listen(port, address, () => {
        startStatus[key] = 1;
        console.log(`Server ${address} is running on port ${port}.`);
      });
  });
}
