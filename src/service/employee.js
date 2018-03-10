import firebase from "firebase";
import firebaseApp from "../connector/firebase";

const isDuplicate = async (restaurantRef, password, employeeId = null) => {
  // Should use Transcation to check and create
  // but Firebase Client JS doesn't support, so we have to do without it
  const duplicateEmployeeByPassword = await firebaseApp.firestore()
    .collection("employee")
    .where("restaurant", "==", restaurantRef)
    .where("password", "==", password)
    .limit(1)
    .get();

  if (duplicateEmployeeByPassword.size < 1) {
    return false; // Not duplicate
  } else if (duplicateEmployeeByPassword.docs[0].id === employeeId) {
    return false; // Duplicate but same employee
  }
  return true;
};
const create = async (employee) => {
  const { id, ...noIdEmployee } = employee;
  const employeeWithTimestamp = {
    ...noIdEmployee,
    createAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (await isDuplicate(employee.restaurant, employee.password)) {
    const error = { name: "duplicatePassword" };
    throw error;
  }
  return firebaseApp
    .firestore()
    .collection("employee")
    .add(employeeWithTimestamp);
};

const update = async (employee) => {
  const { id, ...noIdEmployee } = employee;
  if (await isDuplicate(employee.restaurant, employee.password, id)) {
    const error = { name: "duplicatePassword" };
    throw error;
  }
  return firebaseApp
    .firestore()
    .collection("employee")
    .doc(id)
    .update(noIdEmployee);
};

const remove = async (employeeId) => firebaseApp
  .firestore()
  .collection("employee")
  .doc(employeeId)
  .delete();


const onSnapshot = (restaurantId, callback) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection("employee")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .onSnapshot(snap => {
      const employeeList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(employeeList);
    });
  return unsubscribe;
};
export default {
  create, update, remove, onSnapshot
};
