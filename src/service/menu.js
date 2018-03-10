import firebase from "firebase";
import firebaseApp from "../connector/firebase";

const listToMap = list =>
  list.reduce((pValue, cValue, index) => ({ ...pValue, [cValue]: index }), {});
const create = async (menu) => {
  const { id, ...noIdmenu } = menu;
  const categoriesMap = listToMap(menu.categories);
  const menuOptionsMap = listToMap(menu.menuOptions);
  const menuWithTimestamp = {
    ...noIdmenu,
    createAt: firebase.firestore.FieldValue.serverTimestamp(),
    categories: categoriesMap,
    menuOptions: menuOptionsMap
  };
  return firebaseApp
    .firestore()
    .collection("menu")
    .add(menuWithTimestamp);
};

const update = async (menu) => {
  const { id, ...noIdmenu } = menu;
  const categoriesMap = listToMap(menu.categories);
  const menuOptionsMap = listToMap(menu.menuOptions);
  return firebaseApp
    .firestore()
    .collection("menu")
    .doc(id)
    .update({
      ...noIdmenu,
      categories: categoriesMap,
      menuOptions: menuOptionsMap
    });
};

const remove = async (menuId) => firebaseApp
  .firestore()
  .collection("menu")
  .doc(menuId)
  .delete();

const convert = doc => {
  const menu = doc.data();
  const categoryIds = Object.keys(menu.categories);
  const menuOptionIds = Object.keys(menu.menuOptions);
  return {
    ...menu,
    id: doc.id,
    categories: categoryIds,
    menuOptions: menuOptionIds
  };
};

const onSnapshot = (restaurantId, callback) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const unsubscribe = firebaseApp
    .firestore()
    .collection("menu")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .onSnapshot(snap => {
      const menuList = snap.docs.map(convert);
      callback(menuList);
    });
  return unsubscribe;
};

const getAll = async (restaurantId) => {
  const restaurant = firebaseApp.firestore().collection('restaurant').doc(restaurantId);
  const snap = await firebaseApp
    .firestore()
    .collection("menu")
    .where("restaurant", "==", restaurant)
    .orderBy("createAt")
    .get();
  const menuList = snap.docs.map(convert);
  return menuList;
};
export default {
  create, update, remove, onSnapshot, getAll
};

