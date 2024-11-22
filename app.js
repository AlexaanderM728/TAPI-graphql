import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';

const app = express();
const port = 8989;

// Konfiguracja Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start serwera Apollo
await server.start();

// Middleware dla Apollo
app.use(
  '/graphql',
  cors(),
  bodyParser.json(),
  expressMiddleware(server)
);

// Uruchom serwer
app.listen(port, () => {
  console.log(`GraphQL API dostępne pod adresem http://localhost:${port}/graphql`);
});