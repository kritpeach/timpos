<template>
    <v-app light>
        <h1>Category</h1>
        <v-data-table v-if="categoryList !== null" :headers="headers" :items="categoryList" class="elevation-1">
            <template slot="items" slot-scope="props" >
              <tr @click.stop="onClickRow(props.item.id)">
                <td>{{ props.item.name }}</td>
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
                    <span v-if="managementDialog.mode === 'CREATE'" class="headline">Create category</span>
                    <span v-if="managementDialog.mode === 'EDIT'" class="headline">Edit category</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex>
                                <v-text-field v-model="managementDialog.form.name" :rules="[v => !!v || 'Required']" label="Name" required></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="managementDialog.show = false">Close</v-btn>
                    <v-btn v-if="managementDialog.mode === 'CREATE'" color="primary" :loading="creating" :disabled="!managementDialog.valid" @click="create">Create</v-btn>
                    <template v-if="managementDialog.mode === 'EDIT'">
                      <v-btn color="error" :loading="deleting" @click="remove">Delete</v-btn>
                      <v-btn color="primary" :loading="updating" @click="update" :disabled="!managementDialog.valid">Update</v-btn>
                    </template>
                </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
    </v-app>
</template>

<script>
import categoryService from "../service/Category";
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
        form: {
          name: "",
          restaurant: restaurantRef
        },
        mode: "" // CREATE or EDIT
      },
      headers: [{ text: "Name", value: "name", align: "left" }],
      categoryList: null,
      creating: false,
      updating: false,
      deleting: false
    };
  },
  mounted() {
    const { restaurantId } = this.$route.params;
    this.unsubscrible = categoryService.onSnapshot(
      restaurantId,
      categoryList => {
        this.categoryList = categoryList;
      }
    );
  },
  destroyed() {
    this.unsubscrible();
  },
  methods: {
    async create() {
      this.creating = true;
      try {
        await categoryService.create(this.managementDialog.form);
        this.managementDialog.show = false;
      } catch (e) {
        console.log(e);
      } finally {
        this.creating = false;
      }
    },
    async update() {
      this.updating = true;
      try {
        await categoryService.update(this.managementDialog.form);
        this.managementDialog.show = false;
      } catch (e) {
        console.log(e);
      } finally {
        this.updating = false;
      }
    },
    async remove() {
      this.deleting = true;
      try {
        await categoryService.remove(this.managementDialog.form.id);
        this.managementDialog.show = false;
      } catch (e) {
        console.log(e);
      } finally {
        this.deleting = false;
      }
    },
    onClickRow(categoryId) {
      this.managementDialog.mode = "EDIT";
      const category = this.categoryList.find(e => e.id === categoryId);
      this.managementDialog.form = { ...category };
      this.managementDialog.show = true;
    },
    onClickAddFab() {
      this.managementDialog.mode = "CREATE";
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

#tested{
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  color: aqua;
}
</style>
