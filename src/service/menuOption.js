import firebase from "firebase";
import firebaseApp from "../connector/firebase";

const create = async (menuOption) => {
  const { id, ...noIdmenuOption } = menuOption;
  const menuOptionWithTimestamp = {
    ...noIdmenuOption,
    createAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  return firebaseApp
    .firestore()
    .collection("menuOption")
    .add(menuOptionWithTimestamp);
};

const update = async (menuOption) => {
  const { id, ...noIdmenuOption } = menuOption;
  return firebaseApp
    .firestore()
    .collection("menuOption")
    .doc(id)
    .update(noIdmenuOption);
};

const remove = async (menuOptionId) => firebaseApp
  .firestore()
  .collection("menuOption")
  .doc(menuOptionId)
  .delete();


const onSnapshot = (restaurantId, callback) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection("menuOption")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .onSnapshot(snap => {
      const menuOptionList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(menuOptionList);
    });
  return unsubscribe;
};

const getAll = async (restaurantId) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const snap = await firebaseApp
    .firestore()
    .collection("menuOption")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .get();
  const menuOptionList = snap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));
  return menuOptionList;
};
export default {
  create, update, remove, onSnapshot, getAll
};

