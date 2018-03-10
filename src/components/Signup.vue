<template>
  <v-app light>
  <div class="box elevation-4">
      <v-form v-model="valid">
    <v-text-field
      label="E-mail"
      v-model="email"
      :rules="emailRules"
      required
    ></v-text-field>
    <v-text-field
          label="Password"
          :rules="passwordRules"
          v-model="password"
          :append-icon="passwordIcon ? 'visibility' : 'visibility_off'"
          :append-icon-cb="() => (passwordIcon = !passwordIcon)"
          :type="passwordIcon ? 'password' : 'text'"
          required
        ></v-text-field>
  </v-form>
  <div style="text-align: right;">
   <v-btn depressed :disabled="!valid" color="primary" @click="signup" class="nosideMargin">
      Signup
    </v-btn>
    </div>
  </div>
  </v-app>
</template>

<script>
import firebase from "firebase";

export default {
  data: () => ({
    valid: false,
    email: "",
    password: "",
    passwordIcon: true,
    emailRules: [
      v => !!v || "E-mail is required",
      v =>
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        "E-mail must be valid"
    ],
    passwordRules: [
      v => !!v || "Password is required",
      v => v.length >= 8 || "At least 8 character"
    ]
  }),
  methods: {
    async signup() {
      try {
        const createUserResponse = await firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password);
        if (createUserResponse) {
          console.log("Signup successfully! ", createUserResponse);
        }
      } catch (e) {
        console.log("Error", e);
      }
    }
  }
};
</script>

<style scoped>
.box {
  width: 360px;
  background: white;
  margin: 7% auto;
  padding: 24px;
}
#app {
  background: #d2d6de;
}
.nosideMargin {
  margin: 6px 0px 6px 0px;
}
</style>

