import * as functions from 'firebase-functions';
import setupGraphQLServer from './graphqlServer';

const graphQLServer = setupGraphQLServer();

export const helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

export const api = functions.https.onRequest(graphQLServer);