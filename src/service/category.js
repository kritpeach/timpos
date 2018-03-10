import firebase from "firebase";
import firebaseApp from "../connector/firebase";

const create = async (category) => {
  const { id, ...noIdCategory } = category;
  const categoryWithTimestamp = {
    ...noIdCategory,
    createAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  return firebaseApp
    .firestore()
    .collection("category")
    .add(categoryWithTimestamp);
};

const update = async (category) => {
  const { id, ...noIdCategory } = category;
  return firebaseApp
    .firestore()
    .collection("category")
    .doc(id)
    .update(noIdCategory);
};

const remove = async (categoryId) => firebaseApp
  .firestore()
  .collection("category")
  .doc(categoryId)
  .delete();


const onSnapshot = (restaurantId, callback) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection("category")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .onSnapshot(snap => {
      const categoryList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(categoryList);
    });
  return unsubscribe;
};

const getAll = async (restaurantId) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const snap = await firebaseApp
    .firestore()
    .collection("category")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .get();
  const categoryList = snap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));
  return categoryList;
};

export default {
  create, update, remove, onSnapshot, getAll
};

