import Vue from 'vue';
import Router from 'vue-router';
import Main from '@/components/Main';
import Signin from '@/components/Signin';
import Signup from '@/components/Signup';
import RestaurantManagement from '@/components/RestaurantManagement';
import EmployeeManagement from '@/components/EmployeeManagement';
import MenuManagement from '@/components/MenuManagement';
import Dashboard from '@/components/Dashboard';
import MenuOptionManagement from '@/components/MenuOptionManagement';
import CategoryManagement from '@/components/CategoryManagement';
import Setting from '@/components/Setting';
import firebaseApp from "../connector/firebase";

const auth = (to, from, next) => {
  if (firebaseApp.auth().currentUser) {
    next();
  } else {
    next(`signin?to=${to.path}`);
  }
};
Vue.use(Router);
export default new Router({
  routes: [
    { path: '/', redirect: { name: 'SignIn' } },
    {
      path: '/signin',
      name: 'SignIn',
      component: Signin
    },
    {
      path: '/signup',
      component: Signup
    },
    {
      path: '/restaurantManagement',
      component: RestaurantManagement,
      beforeEnter: auth
    },
    {
      path: '/restaurantManagement/:restaurantId',
      component: Main,
      beforeEnter: auth,
      children: [
        {
          path: 'dashboard',
          component: Dashboard,
          name: 'Dashboard'
        },
        {
          path: 'employee',
          component: EmployeeManagement,
          name: 'EmployeeManagement'
        },
        {
          path: 'menu',
          component: MenuManagement,
          name: 'MenuManagement'
        },
        {
          path: 'menuOption',
          component: MenuOptionManagement,
          name: 'MenuOptionManagement'
        },
        {
          path: 'category',
          component: CategoryManagement,
          name: 'CategoryManagement'
        },
        {
          path: 'setting',
          component: Setting,
          name: 'Setting'
        }
      ]
    }
  ]
});
