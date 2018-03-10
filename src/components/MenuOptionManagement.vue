<template>
    <v-app light>
        <h1>Menu Option</h1>
        <v-data-table v-if="menuOptionList !== null" :headers="headers" :items="menuOptionList" class="elevation-1">
            <template slot="items" slot-scope="props" >
              <tr @click.stop="onClickRow(props.item.id)">
                <td>{{ props.item.title }}</td>
                <td class="text-xs-right">
                  {{props.item.optionItems.map(optionItem => optionItem.name).join(", ")}}
                </td>
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
                    <span v-if="managementDialog.mode === 'CREATE'" class="headline">Create menu option</span>
                    <span v-if="managementDialog.mode === 'EDIT'" class="headline">Edit menu option</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout row wrap>
                            <v-flex xs12>                              
                                <v-text-field v-model="managementDialog.form.title" :rules="[v => !!v || 'Required']" label="Option title"></v-text-field>                            
                            </v-flex>
                            <template v-for="(item, index) in managementDialog.form.optionItems">
                                <v-flex xs7 :key="index + 'title'">
                                    <v-text-field  v-if="index === 0" @keyup="onOptionItemFieldKeyUp" v-model.trim="item.name" :rules="[v => v.trim().length > 0 || 'Required']" label="Option item"></v-text-field>                             
                                    <v-text-field  v-else v-model.trim="item.name" @keyup="onOptionItemFieldKeyUp" label="Option item"></v-text-field>
                                </v-flex>
                                <v-flex xs5 :key="index + 'price'">
                                    <v-text-field v-if="index === 0" v-model="item.price"  label="Price" step="0.01" prefix="฿" type="number"></v-text-field>
                                    <v-text-field v-else v-model="item.price" append-icon="delete" :append-icon-cb="() => onRemoveOptionItemClick(index)"  label="Price" step="0.01" prefix="฿" type="number"></v-text-field>
                                </v-flex>
                            </template>
                            <v-flex xs6>
                              <v-select :items="selectionItems" v-model="managementDialog.form.minSelection" :rules="[v => !!v || 'Required']" label="Minimum selection" item-value="text"></v-select>
                            </v-flex>
                            <v-flex xs6>
                              <v-select :items="selectionItems" v-model="managementDialog.form.maxSelection" :rules="[v => !!v || 'Required', v=> v >= parseInt(managementDialog.form.minSelection) || 'Value must not less than minimum']" label="Maximum selection" item-value="text"></v-select>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="managementDialog.show = false">Close</v-btn>          
                    <v-btn v-if="managementDialog.mode === 'CREATE'" color="primary" :loading="creating" @click="create" :disabled="!managementDialog.valid">Create</v-btn>
                    <template v-if="managementDialog.mode === 'EDIT'">
                      <v-btn color="error" :loading="deleting" @click="remove">Delete</v-btn>
                      <v-btn color="primary" :loading="updating" :disabled="!managementDialog.valid" @click="update">Update</v-btn>
                    </template>
                </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
    </v-app>
</template>

<script>
import menuOptionService from "../service/menuOption";
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
        mode: "", // CREATE or EDIT
        form: {
          id: null,
          restaurant: restaurantRef,
          title: "",
          optionItems: []
        }
      },
      headers: [
        { text: "Title", value: "title", align: "left" },
        { text: "Option items", value: "item" }
      ],
      categoryList: [1, 2, 3, 4, 5],
      menuOptionList: null,
      creating: false,
      updating: false,
      deleting: false
    };
  },
  mounted() {
    const { restaurantId } = this.$route.params;
    this.unsubscrible = menuOptionService.onSnapshot(
      restaurantId,
      menuOptionList => {
        this.menuOptionList = menuOptionList;
      }
    );
  },
  destroyed() {
    this.unsubscrible();
  },
  computed: {
    optionItemsLastIndex() {
      return this.managementDialog.form.optionItems.length - 1;
    },
    selectionItems() {
      const optionItemLength = this.managementDialog.form.optionItems.length;
      return Array.from(
        new Array(optionItemLength),
        (val, index) => `${index}`
      );
    }
  },
  methods: {
    onOptionItemFieldKeyUp() {
      const optionItems = this.managementDialog.form.optionItems;
      const lastIndex = optionItems.length - 1;
      if (optionItems[lastIndex].name !== "") {
        this.managementDialog.form.optionItems = [
          ...optionItems,
          {
            name: "",
            price: 0
          }
        ];
      }
    },
    onClickRow(menuOptionId) {
      const menuOption = this.menuOptionList.find(e => e.id === menuOptionId);
      // Ugly but work! GG
      this.managementDialog.form = { ...menuOption };
      this.managementDialog.form.optionItems = JSON.parse(
        JSON.stringify([
          ...menuOption.optionItems,
          {
            name: "",
            price: 0
          }
        ])
      );
      this.managementDialog.mode = "EDIT";
      this.managementDialog.show = true;
    },
    onClickAddFab() {
      this.$refs.form.reset();
      this.managementDialog.mode = "CREATE";
      this.managementDialog.form.optionItems = [
        {
          name: "",
          price: 0
        }
      ];
      this.managementDialog.show = true;
    },
    onRemoveOptionItemClick(i) {
      this.managementDialog.form.optionItems.splice(i, 1);
    },
    async create() {
      this.creating = true;
      try {
        const optionItems = this.managementDialog.form.optionItems.filter(
          optionItem => optionItem.name.length > 0
        );
        await menuOptionService.create({
          ...this.managementDialog.form,
          optionItems
        });
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
        const optionItems = this.managementDialog.form.optionItems.filter(
          optionItem => optionItem.name.length > 0
        );
        await menuOptionService.update({
          ...this.managementDialog.form,
          optionItems
        });
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
        await menuOptionService.remove(this.managementDialog.form.id);
        this.managementDialog.show = false;
      } catch (e) {
        console.log(e);
      } finally {
        this.deleting = false;
      }
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
