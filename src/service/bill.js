import firebase from "firebase";
import firebaseApp from "../connector/firebase";

const create = async (bill) => {
  const { id, ...noIdBill } = bill;
  const billWithTimestamp = {
    ...noIdBill,
    createAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  return firebaseApp
    .firestore()
    .collection("bill")
    .add(billWithTimestamp);
};

const update = async (bill) => {
  const { id, ...noIdBill } = bill;
  return firebaseApp
    .firestore()
    .collection("bill")
    .doc(id)
    .update(noIdBill);
};

const remove = async (billId) => firebaseApp
  .firestore()
  .collection("bill")
  .doc(billId)
  .delete();


const onSnapshot = (restaurantId, callback) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection("bill")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .onSnapshot(snap => {
      const billList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(billList);
    });
  return unsubscribe;
};

const getAll = async (restaurantId) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const snap = await firebaseApp
    .firestore()
    .collection("bill")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .get();
  const billList = snap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));
  return billList;
};

export default {
  create, update, remove, onSnapshot, getAll
};

