<template>
  <v-app light>
    <v-navigation-drawer fixed :clipped='clipped' v-model='drawer' app>
      <v-list>
        <router-link v-for="item in items" tag="v-list-tile" :key="item.id" :to="{ name: item.routeName, params: {restaurantId: $route.params.restaurantId}}">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.title }}
            </v-list-tile-title>
          </v-list-tile-content>
        </router-link>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app :clipped-left='clipped' dark color="primary">
      <v-toolbar-side-icon class="white--text" @click.stop='drawer = !drawer' light></v-toolbar-side-icon>
      <v-toolbar-title v-text='title'></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
      <v-btn @click="signout" flat>Sign out</v-btn>
    </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import firebaseApp from "../connector/firebase";
export default {
  data() {
    return {
      clipped: true,
      drawer: true,
      items: [
        {
          icon: "dashboard",
          title: "Dashboard",
          routeName: "Dashboard"
        },
        {
          icon: "people",
          title: "Employee",
          routeName: "EmployeeManagement"
        },
        {
          icon: "restaurant_menu",
          title: "Menu",
          routeName: "MenuManagement"
        },
        {
          icon: "group_work",
          title: "Category",
          routeName: "CategoryManagement"
        }
      ],
      title: "Restaurant management"
    };
  },
  methods: {
    async signout() {
      try {
        await firebaseApp.auth().signOut();
        this.$router.push("/signin");
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>
