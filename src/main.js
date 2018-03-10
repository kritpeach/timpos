// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import VueApollo from 'vue-apollo';
import firebaseApp from "./connector/firebase";
import App from './App';
import router from './router';

const httpLink = new HttpLink({
  uri: 'http://localhost:5000/tumtim-50d1c/us-central1/api/graphql'
});

const authLink = setContext(async (_, { headers }) => {
  let token = null;
  try {
    token = await firebaseApp.auth().currentUser.getIdToken();
  } catch (e) {
    token = null;
  }
  return {
    headers: {
      ...headers,
      authorization: token
    }
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
});

Vue.use(Vuetify);
Vue.use(VueApollo);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  apolloProvider,
  components: { App },
  template: '<App/>'
});
