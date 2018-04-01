<template>
    <v-app light>
        <v-toolbar dark color="primary">
            <v-toolbar-title class="white--text" v-if="user">Hello {{user.email}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items class="hidden-sm-and-down">
      <v-btn @click="signout" flat>Sign out</v-btn>
    </v-toolbar-items>
        </v-toolbar>
        <v-layout row justify-center>
            <router-link v-for="item in restaurantList" :key="item.id" :to="{ name: 'Dashboard', params: {restaurantId: item.id}}">
                <v-btn outline color="indigo">{{item.name}}</v-btn>
            </router-link>
        </v-layout>
        <v-btn fixed dark fab bottom right color="pink" @click.stop="onClickAddFab">
                <v-icon>add</v-icon>
        </v-btn>
        <v-dialog v-model="managementDialog.show" persistent max-width="500px"> 
            <v-card>
                <v-form v-model="managementDialog.valid" ref="form">
                    <v-card-title>
                        <span class="headline">Create Restaurant</span>
                    </v-card-title>
                    <v-card-text>
                      <v-alert type="warning" :value="true" v-if="managementDialog.error.duplicate">This name has already been used.</v-alert>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex>
                                    <v-text-field v-model="managementDialog.form.restaurantName" :rules="[v => !!v || 'Required']" label="Restaurant name"></v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click="managementDialog.show = false">Close</v-btn>
                        <v-btn color="primary" :loading="creating" :disabled="!managementDialog.valid" @click="createRestaurant()">Create</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
import firebaseApp from "../connector/firebase";
import restaurantService from "../service/restaurant";
import gql from "graphql-tag";

export default {
  data: () => ({
    restaurantList: [],
    managementDialog: {
      show: false,
      valid: false,
      form: {
        restaurantName: ""
      },
      error: {
        duplicate: false
      }
    },
    creating: false,
    user: null
  }),
  mounted() {
    console.log("Mounted: Manage Restaurant Page");
    this.user = firebaseApp.auth().currentUser;
    const token = firebaseApp.auth().currentUser.getIdToken();
    console.log(token);
    this.unsubscrible = restaurantService.onSnapshot(restaurantList => {
      this.restaurantList = restaurantList;
    });
  },
  destroyed() {
    this.unsubscrible();
  },
  methods: {
    async signout() {
      try {
        await firebaseApp.auth().signOut();
        this.$router.push("/signin");
      } catch (e) {
        console.log(e);
      }
    },
    async createRestaurant() {
      this.creating = true;
      try {
        const result = await this.$apollo.mutate({
          mutation: gql`
            mutation($name: String!) {
              restaurantCreate(name: $name) {
                success
                duplicate
              }
            }
          `,
          variables: {
            name: this.managementDialog.form.restaurantName
          }
        });
        if (result.data.restaurantCreate.success) {
          this.managementDialog.show = false;
        } else if (result.data.restaurantCreate.duplicate) {
          this.managementDialog.error.duplicate = true;
          console.log("Duplicated");
        } else {
          console.log("something goes wrong");
        }
      } catch (e) {}
      this.creating = false;
    },
    onClickAddFab() {
      this.$refs.form.reset();
      this.managementDialog.error.duplicate = false;
      this.managementDialog.show = true;
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
</style>
