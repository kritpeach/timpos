import firebase from "firebase";
import firebaseApp from "../connector/firebase";

const create = async (name) => {
  const { uid } = firebaseApp.auth().currentUser;
  return firebaseApp
    .firestore()
    .collection("restaurant")
    .add({
      name,
      admin: { [uid]: true },
      createAt: firebase.firestore.FieldValue.serverTimestamp()
    });
};

const onSnapshot = (callback) => {
  const { uid } = firebaseApp.auth().currentUser;
  const unsubscribe = firebaseApp
    .firestore()
    .collection("restaurant")
    .where(`admin.${uid}`, "==", true)
    .onSnapshot(snap => {
      const restaurantList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(restaurantList);
    });
  return unsubscribe;
};

export default {
  create, onSnapshot
};
