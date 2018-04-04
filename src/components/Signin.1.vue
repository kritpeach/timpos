<template>
  <v-app v-if="authInited" light>
    <div class="box elevation-4">
      <h1>Manager Panel</h1>
      <v-form v-model="valid">
        <v-text-field label="E-mail or Restaurant ID" v-model="username" required></v-text-field>
        <v-text-field label="Password" :rules="passwordRules" v-model="password" :append-icon="passwordIcon ? 'visibility' : 'visibility_off'" :append-icon-cb="() => (passwordIcon = !passwordIcon)" :type="passwordIcon ? 'password' : 'text'" required></v-text-field>
        <div style="text-align: right;">
          <v-btn depressed :loading="signingIn" :disabled="!valid" color="primary" @click="signin" class="nosideMargin">
            Sign in
          </v-btn>
        </div>
        <v-alert v-if="signinError" type="error" :value="true">
          {{signinError}}
        </v-alert>
      </v-form>
    </div>
  </v-app>
</template>

<script>
import gql from 'graphql-tag';
import firebaseApp from '../connector/firebase';

function s_Decode_Unicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}
export default {
  mounted() {
    console.log('Mounted: Signin Page');
    firebaseApp.auth().onAuthStateChanged(async obj_user => {
      this.bl_inited_auth = true;
      if (obj_user) {
        const str_idToken = await obj_user.getIdToken();
        const obj_payload = JSON.parse(
          s_Decode_Unicode(str_idToken.split('.')[1])
        );
        if (this.$route.query.to) {
          this.$router.replace(this.$route.query.to);
        } else if (obj_payload.role === 'manager') {
          this.$router.replace(
            `/restaurantManagement/${obj_payload.restaurantId}/dashboard`
          );
        } else if (obj_payload.role === 'staff') {
          alert('You have no permission to access!');
        }
      }
    });
  },
  data: () => ({
    bl_inited_auth: false,
    bl_valid: true,
    str_username: '',
    str_password: '',
    bl_visible_password: true,
    bl_signingIn: false,
    str_signingIn_error: '',
    str_custom_token: '',
    arr_email_rules: [
      v => !!v || 'E-mail is required',
      v =>
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        'E-mail must be valid'
    ],
    arr_password_rules: [
      v => !!v || 'Password is required',
      v => v.length >= 8 || 'At least 8 character'
    ]
  }),
  methods: {
    async Signin_User() {
      this.bl_signingIn = true;
      this.bl_signingIn_error = '';
      // if this username is admin
      if (
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.str_username)
      ) {
        // signin as a admin
        await firebaseApp
          .auth()
          .signInWithEmailAndPassword(this.str_username, this.str_password)
          .then(() => {
            this.$router.replace('/restaurantManagement');
          })
          .catch(e => {
            this.str_signingIn_error = e.code;
          });
      } else {
        // signin as a user (staff, manager)
        try {
          const gqlRespone = await this.$apollo.query({
            query: gql`
              query($restaurantName: String!, $employeePassword: String!) {
                employeeToken(
                  restaurantName: $restaurantName
                  employeePassword: $employeePassword
                ) {
                  success
                  employeeDoesNotExist
                  restaurantNameDoesNotExist
                  token
                }
              }
            `,
            variables: {
              restaurantName: this.str_username,
              employeePassword: this.str_password
            }
          });
          const { employeeToken } = gqlRespone.data;
          if (employeeToken.success) {
            await firebaseApp.auth().signInWithCustomToken(employeeToken.token);
          } else if (employeeToken.restaurantNameDoesNotExist) {
            this.signinError = 'restaurantNameDoesNotExist';
          } else if (employeeToken.employeeDoesNotExist) {
            this.signinError = 'employeeDoesNotExist';
          }
        } catch (e) {
          if (e instanceof TypeError) {
            console.log('Caught TypeError' + e);
          } else if (e instanceof EvalError) {
            console.log('Caught EvalError' + e);
          }
        } finally {
          this.bl_signingIn = false;
        }
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

