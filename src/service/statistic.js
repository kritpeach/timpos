import firebaseApp from "../connector/firebase";

const generateSalesByCategory = (doneOrderLineItemList) => {
  const salesByCategory = {};
  doneOrderLineItemList.forEach(orderLineItem => {
    Object.keys(orderLineItem.menu.categories).forEach(categoryId => {
      if (salesByCategory[categoryId]) {
        salesByCategory[categoryId].income += orderLineItem.quantity * orderLineItem.price.value;
        salesByCategory[categoryId].quantity += orderLineItem.quantity;
      } else {
        salesByCategory[categoryId] = {
          income: orderLineItem.quantity * orderLineItem.price.value,
          quantity: orderLineItem.quantity,
          categoryId
        };
      }
    });
  });
  return Object.values(salesByCategory).sort((a, b) => b.quantity - a.quantity);
};
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
  const orderLineItemListFn = () => {
    const allOrderLineItemList = [].concat(...orderList
      .filter(order => order.doneAt instanceof Date)
      .map(order => order.order));
    if (categoryId) {
      return allOrderLineItemList
        .filter(orderLineItem => orderLineItem.menu.categories[categoryId]);
    }
    return allOrderLineItemList;
  };
  const orderLineItemList = orderLineItemListFn();
  const billRefList = orderLineItemList.map(orderLineItem => orderLineItem.billId);
  const billCount = new Set(billRefList).size;
  const doneOrderLineItemList = orderLineItemList.filter(orderLineItem => orderLineItem.done);
  const income = doneOrderLineItemList.reduce((totalPrice, orderLineItem) =>
    totalPrice + (orderLineItem.price.value * orderLineItem.quantity), 0);
  const cancelOrderLineItemList = orderLineItemList.filter(orderListItem => orderListItem.cancel);
  const orderGroupByMenuId = doneOrderLineItemList.reduce((result, orderLineItem) => {
    const menu = result[orderLineItem.menu.id];
    const newQuantity = menu ? (menu.quantity + orderLineItem.quantity) : orderLineItem.quantity;
    const newIncome = menu ? (menu.income + (orderLineItem.quantity * orderLineItem.price.value))
      : orderLineItem.quantity * orderLineItem.price.value;
    return {
      ...result,
      [orderLineItem.menu.id]: {
        quantity: newQuantity,
        income: newIncome,
        menuId: orderLineItem.menu.id,
        menuName: orderLineItem.menu.name
      }
    };
  }, {});
  const sales = Object.values(orderGroupByMenuId).sort((a, b) => b.quantity - a.quantity);
  const salesByCategory = generateSalesByCategory(doneOrderLineItemList);
  return {
    billCount,
    cancelOrderLineItemList,
    doneOrderLineItemList,
    orderLineItemList,
    income,
    sales,
    salesByCategory
  };
};

export default { getDashboardData };
