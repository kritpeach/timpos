import firebase from "firebase";
import 'firebase/firestore';

const config = {
  apiKey: "AIzaSyBmL1J3pTxoUytNzqk7aJ4kANkwVGtnzz8",
  authDomain: "tumtim-50d1c.firebaseapp.com",
  databaseURL: "https://tumtim-50d1c.firebaseio.com",
  projectId: "tumtim-50d1c",
  storageBucket: "tumtim-50d1c.appspot.com",
  messagingSenderId: "174222737324"
};
const firebaseApp = firebase.initializeApp(config);
export default firebaseApp;
