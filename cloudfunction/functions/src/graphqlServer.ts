import * as  express from 'express';
import * as  bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import * as admin from 'firebase-admin';
import restaurantService from './service/restaurant';
import employeeService from './service/employee';
import serviceAccount from './serviceAccountKey';
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
            return employeeService.getEmployeeToken(params.restaurantName, params.employeePassword);
        }
    },
    Mutation: {
        restaurantCreate: (_, params, ctx) => {
            console.log("CTX: ", ctx);
            return restaurantService.create(ctx.user, params.name);
        }
    }
};

// Put together a schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

const setupGraphQLServer = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://tumtim-50d1c.firebaseio.com"
    });
    const app = express();
    app.use(cors);
    app.use('/graphql', bodyParser.json(), graphqlExpress(async req => {
        const token: string = req.headers.authorization + '';
        const user = await admin.auth().verifyIdToken(token).catch(e => null);
        return { schema, context: { user } };
    }));
    app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
    return app;
}

export default setupGraphQLServer;