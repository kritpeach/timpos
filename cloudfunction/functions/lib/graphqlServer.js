"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const apollo_server_express_1 = require("apollo-server-express");
const graphql_tools_1 = require("graphql-tools");
const admin = require("firebase-admin");
const restaurant_1 = require("./service/restaurant");
const employee_1 = require("./service/employee");
const serviceAccountKey_1 = require("./serviceAccountKey");
const cors = require('cors')({ origin: true });
const books = [
    {
        title: "Harry Potter and the Sorcerer's stone",
        author: 'J.K. Rowling'
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton'
    }
];
// The GraphQL schema in string form
const typeDefs = `
type Query {
    books: [Book]
    employeeToken(restaurantName: String, employeePassword: String): employeeTokenPayload
}
type Mutation {
    restaurantCreate(name: String): restaurantCreatePayload
}
type restaurantCreatePayload {
    success: Boolean
    duplicate: Boolean
    authorization: Boolean
}
type employeeTokenPayload {
    success: Boolean
    token: String
    restaurantNameDoesNotExist: Boolean
    employeeDoesNotExist: Boolean
}
type Book { title: String, author: String }
`;
// The resolvers
const resolvers = {
    Query: {
        books: () => books,
        employeeToken: (_, params, ctx) => {
            return employee_1.default.getEmployeeToken(params.restaurantName, params.employeePassword);
        }
    },
    Mutation: {
        restaurantCreate: (_, params, ctx) => {
            console.log("CTX: ", ctx);
            return restaurant_1.default.create(ctx.user, params.name);
        }
    }
};
// Put together a schema
const schema = graphql_tools_1.makeExecutableSchema({
    typeDefs,
    resolvers
});
const setupGraphQLServer = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey_1.default),
        databaseURL: "https://tumtim-50d1c.firebaseio.com"
    });
    const app = express();
    app.use(cors);
    app.use('/graphql', bodyParser.json(), apollo_server_express_1.graphqlExpress((req) => __awaiter(this, void 0, void 0, function* () {
        const token = req.headers.authorization + '';
        const user = yield admin.auth().verifyIdToken(token).catch(e => null);
        return { schema, context: { user } };
    })));
    app.use('/graphiql', apollo_server_express_1.graphiqlExpress({ endpointURL: '/graphql' }));
    return app;
};
exports.default = setupGraphQLServer;
//# sourceMappingURL=graphqlServer.js.map