<template>
    <v-app light>
        <h1>Employee</h1>
        <v-data-table v-if="employeeList !== null" :headers="headers" :items="employeeList" class="elevation-1">
            <template slot="items" slot-scope="props" >
              <tr @click.stop="onClickRow(props.item.id)">
                <td>{{ props.item.name }}</td>
                <td class="text-xs-right">{{ props.item.role }}</td>
              </tr>
            </template>
        </v-data-table>
        <v-btn fixed dark fab bottom right color="pink" @click.stop="onClickAddFab">
                <v-icon>add</v-icon>
            </v-btn>
        <v-dialog v-model="managementDialog.show" persistent max-width="500px">
          <v-form v-model="managementDialog.valid" ref="form">
            <v-card>
                <v-card-title>
                    <span v-if="managementDialog.mode === 'CREATE'" class="headline">Create employee account</span>
                    <span v-if="managementDialog.mode === 'EDIT'" class="headline">Edit employee account</span>
                </v-card-title>
                <v-card-text>
                    <v-alert type="error" :value="true" v-if="managementDialog.error.duplicate">This password has already been used.</v-alert>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex>                              
                                <v-text-field v-model="managementDialog.employeeForm.name" :rules="[v => !!v || 'Name is required']" label="Name" required></v-text-field>
                                <v-text-field v-model="managementDialog.employeeForm.password" :rules="[v => !!v || 'Password is required']" label="Password" type="password" required></v-text-field>
                                <v-select
                                required
                                :items="managementDialog.roles"
                                v-model="managementDialog.employeeForm.role"
                                label="Role"
                                :rules="[v => !!v || 'Role is required']"
                                ></v-select>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="managementDialog.show = false">Close</v-btn>          
                    <v-btn v-if="managementDialog.mode === 'CREATE'" color="primary" :loading="creatingEmployee" :disabled="!managementDialog.valid" @click="createEmployee">Create</v-btn>
                    <template v-if="managementDialog.mode === 'EDIT'">
                      <v-btn color="error" :loading="deletingEmployee" @click="deleteEmployee">Delete</v-btn>
                      <v-btn color="primary" :loading="updatingEmployee" @click="updateEmployee" :disabled="!managementDialog.valid">Update</v-btn>
                    </template>
                </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
    </v-app>
</template>

<script>
import employeeService from "../service/employee";
import firebaseApp from "../connector/firebase";

export default {
  data() {
    const { restaurantId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection("restaurant")
      .doc(restaurantId);
    return {
      managementDialog: {
        valid: false,
        show: false,
        roles: [
          {
            text: "Staff",
            value: "staff"
          },
          {
            text: "Manager",
            value: "manager"
          }
        ],
        error: {
          duplicate: false
        },
        employeeForm: {
          name: "",
          password: "",
          role: "",
          restaurant: restaurantRef
        },
        mode: "" // CREATE or EDIT
      },
      headers: [
        { text: "Name", value: "name", align: "left" },
        { text: "Role", value: "role", align: "right" }
      ],
      employeeList: null,
      creatingEmployee: false,
      updatingEmployee: false,
      deletingEmployee: false
    };
  },
  mounted() {
    const { restaurantId } = this.$route.params;
    this.unsubscrible = employeeService.onSnapshot(
      restaurantId,
      employeeList => {
        this.employeeList = employeeList;
      }
    );
  },
  destroyed() {
    this.unsubscrible();
  },
  methods: {
    async createEmployee() {
      this.creatingEmployee = true;
      await employeeService
        .create(this.managementDialog.employeeForm)
        .then(() => {
          this.managementDialog.show = false;
        })
        .catch(e => {
          if (e.name === "duplicatePassword") {
            this.managementDialog.error.duplicate = true;
          }
        });

      this.creatingEmployee = false;
    },
    async updateEmployee() {
      this.updatingEmployee = true;
      await employeeService
        .update(this.managementDialog.employeeForm)
        .then(() => {
          this.managementDialog.show = false;
        })
        .catch(e => {
          console.log(e);
          if (e.name === "duplicatePassword") {
            this.managementDialog.error.duplicate = true;
          }
        });

      this.updatingEmployee = false;
    },
    async deleteEmployee() {
      this.deletingEmployee = true;
      await employeeService
        .remove(this.managementDialog.employeeForm.id)
        .catch(e => console.log(e));
      this.managementDialog.show = false;
      this.deletingEmployee = false;
    },
    onClickRow(employeeId) {
      this.managementDialog.mode = "EDIT";
      this.managementDialog.error.duplicate = false;
      const employee = this.employeeList.find(e => e.id === employeeId);
      this.managementDialog.employeeForm = { ...employee };
      this.managementDialog.show = true;
    },
    onClickAddFab() {
      this.managementDialog.mode = "CREATE";
      this.managementDialog.error.duplicate = false;
      this.$refs.form.reset();
      this.managementDialog.show = true;
    }
  }
};
</script>

<style scoped>
#app {
  max-width: 720px;
  margin: 0 auto;
}
</style>
