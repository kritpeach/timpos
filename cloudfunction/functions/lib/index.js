"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const graphqlServer_1 = require("./graphqlServer");
const graphQLServer = graphqlServer_1.default();
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});
exports.api = functions.https.onRequest(graphQLServer);
//# sourceMappingURL=index.js.map