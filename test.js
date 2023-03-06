// node ver.18 >
// cli command: node --test

import { describe, it } from "node:test";
import assert from "node:assert";
import { fork } from "node:child_process";
import http from "node:http";

describe("Response", () => {
  it("should status code 503", async () => {
    let MICROSERVICES = "1";
    fork(`checker.js`, ["child"], { env: { MICROSERVICES } });
    return new Promise((res, _) => {
      setTimeout(() => {
        http.get("http://127.0.0.1:3001", ({ statusCode }) => {
          res();
          assert.strictEqual(503, statusCode);
        });
      }, 1000);
    });
  });

  it("should status code 200", async () => {
    let MICROSERVICES = "2";
    fork(`checker.js`, ["child"], { env: { MICROSERVICES } });
    return new Promise((res, _) => {
      setTimeout(() => {
        http.get("http://127.0.0.1:3003", ({ statusCode }) => {
          res();
          assert.strictEqual(200, statusCode);
        });
      }, 1500);
    });
  });
});