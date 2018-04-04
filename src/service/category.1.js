/* eslint camelcase: 0 */
import firebase from "firebase";
import firebaseApp from "../connector/firebase";

/*
Function Objective: create a new category in firestore
Input parameters : obj_category
Function description: create a new category with current server time
Return Value : Promise<firebase.firestore.DocumentReference>
Created By : Krit Chernwansri
Create Date: 2018/3/11
Revised By: Patikorn Ruang-In
Revised Date: 2018/4/4
*/
const create = async (obj_category) => {
  const { id, ...obj_noIdCategory } = obj_category;
  const obj_timed_category = {
    ...obj_noIdCategory,
    createAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  return firebaseApp
    .firestore()
    .collection("category")
    .add(obj_timed_category);
};

/*
Function Objective: update existing category in firestore
Input parameters : obj_category
Function description: update existing category by id
Return Value : Promise<firebase.firestore.DocumentReference>
Created By : Krit Chernwansri
Create Date: 2018/3/11
Revised By: Patikorn Ruang-In
Revised Date: 2018/4/4
*/
const update = async (obj_category) => {
  const { id, ...obj_noIdCategory } = obj_category;
  return firebaseApp
    .firestore()
    .collection("category")
    .doc(id)
    .update(obj_noIdCategory);
};

/*
Function Objective: remove a category in firestore
Input parameters : str_categoryId
Function description: remove a category by id
Return Value : void
Created By : Krit Chernwansri
Create Date: 2018/3/11
Revised By: Patikorn Ruang-In
Revised Date: 2018/4/4
*/
const remove = async (str_categoryId) => firebaseApp
  .firestore()
  .collection("category")
  .doc(str_categoryId)
  .delete();

/*
Function Objective: get realtime category data
Input parameters : str_restaurantId, callback function
Function description: subscribe to category data in realtime
Return Value : void
Created By : Krit Chernwansri
Create Date: 2018/3/11
Revised By: Patikorn Ruang-In
Revised Date: 2018/4/4
*/
const onSnapshot = (str_restaurantId, callback) => {
  const obj_restaurant = firebaseApp.firestore().collection('restaurant').doc(str_restaurantId);
  firebaseApp
    .firestore()
    .collection("category")
    .where("restaurant", "==", obj_restaurant)
    .orderBy("createAt")
    .onSnapshot(snap => {
      const arr_categoryList = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(arr_categoryList);
    });
};

/*
Function Objective: get category list
Input parameters : str_restaurantId
Function description: get all category list by restaurant id
Return Value : list
Created By : Krit Chernwansri
Create Date: 2018/3/11
Revised By: Patikorn Ruang-In
Revised Date: 2018/4/4
*/
const getAll = async (str_restaurantId) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(str_restaurantId);
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

