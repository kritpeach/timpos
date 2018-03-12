import firebaseApp from "../connector/firebase";

const getDashboardData = async (
  startDate,
  endDate,
  categoryId,
  restaurantId
) => {
  const restaurantRef = firebaseApp
    .firestore()
    .collection("restaurant")
    .doc(restaurantId);
  const orderListSnap = await firebaseApp
    .firestore()
    .collection("order")
    .where("restaurant", "==", restaurantRef)
    .where("createAt", ">=", startDate)
    .where("createAt", "<=", endDate)
    .orderBy("createAt")
    .get();
  const orderList = orderListSnap.docs.map(doc => doc.data());
  const billRefList = orderList.map(order => order.bill);
  const billCount = new Set(billRefList).size;
  const orderLineItemList = [].concat(...orderList
    .filter(order => order.doneAt instanceof Date)
    .map(order => order.order));
  const doneOrderLineItemList = orderLineItemList.filter(orderLineItem => orderLineItem.done);
  const income = doneOrderLineItemList.reduce((totalPrice, orderLineItem) =>
    totalPrice + (orderLineItem.price.value * orderLineItem.quantity), 0);
  const cancelOrderLineItemList = orderLineItemList.filter(orderListItem => orderListItem.cancel);
  return {
    billCount,
    cancelOrderLineItemList,
    doneOrderLineItemList,
    orderLineItemList,
    income
  };
};

export default { getDashboardData };
