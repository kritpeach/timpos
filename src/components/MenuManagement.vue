<template>
  <v-app light>
    <h1>Menu</h1>
    <v-data-table v-if="menuList" :headers="headers" :items="menuListUI" class="elevation-1">
      <template slot="items" slot-scope="props">
        <tr @click.stop="onClickRow(props.item.id)">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.prices }}</td>
          <td class="text-xs-right">{{ props.item.categories }}</td>
        </tr>
      </template>
    </v-data-table>
    <v-btn fixed dark fab bottom right color="pink" @click.stop="onClickAddFab">
      <v-icon>add</v-icon>
    </v-btn>
    <v-dialog v-model="managementDialog.show" persistent max-width="500px">
      <v-form v-if="categoryList && menuOptionList" v-model="managementDialog.valid" ref="form">
        <v-card>
          <v-card-title>
            <span v-if="managementDialog.mode === 'CREATE'" class="headline">Add menu</span>
            <span v-if="managementDialog.mode === 'EDIT'" class="headline">Edit menu</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field v-model="managementDialog.form.name" label="Name" :rules="[v => !!v || 'Required']" required></v-text-field>
                </v-flex>
                <template v-for="(item, index) in managementDialog.form.prices">
                  <v-flex xs7 :key="index + 'size'">
                    <v-text-field v-if="index === 0" @keyup="onPriceFieldKeyUp" v-model.trim="item.name" label="Size"></v-text-field>
                    <v-text-field v-else v-model.trim="item.name" @keyup="onPriceFieldKeyUp" label="Size"></v-text-field>
                  </v-flex>
                  <v-flex xs5 :key="index + 'price'">
                    <v-text-field v-if="index === 0" @keyup="onPriceFieldKeyUp" v-model.number="item.value" label="Price" step="0.01" prefix="฿" type="number" :rules="[v => !!v || 'Required', v => v >= 0 || 'Price must not be negative']" required></v-text-field>
                    <v-text-field v-else v-model.number="item.value" @keyup="onPriceFieldKeyUp" append-icon="delete" :append-icon-cb="() => onRemovePriceClick(index)" label="Price" step="0.01" prefix="฿" type="number" :rules="[v => !!v || 'Required', v => v >= 0 || 'Price must not be negative']"></v-text-field>
                  </v-flex>
                </template>
                <v-flex xs12>
                  <v-select v-model="managementDialog.form.categories" label="Categories" multiple chips autocomplete :items="categoryListUI"></v-select>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="managementDialog.show = false">Close</v-btn>
            <v-btn v-if="managementDialog.mode === 'CREATE'" :disabled="!managementDialog.valid" color="primary" :loading="creating" @click="create">Create</v-btn>
            <template v-if="managementDialog.mode === 'EDIT'">
              <v-btn color="error" :loading="deleting" @click="remove">Delete</v-btn>
              <v-btn color="primary" :disabled="!managementDialog.valid" :loading="updating" @click="update">Update</v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-app>
</template>

<script>
import categoryService from '../service/Category';
import menuOptionService from '../service/menuOption';
import menuService from '../service/menu';
import firebaseApp from '../connector/firebase';
const listToMap = list =>
  list.reduce((pValue, cValue, index) => ({ ...pValue, [cValue]: index }), {});

export default {
  data() {
    const { restaurantId } = this.$route.params;
    const restaurantRef = firebaseApp
      .firestore()
      .collection('restaurant')
      .doc(restaurantId);
    return {
      managementDialog: {
        show: false,
        mode: '', // CREATE or EDIT
        form: {
          name: '',
          prices: [
            {
              name: '',
              value: 0
            }
          ],
          categories: [],
          menuOptions: [],
          restaurant: restaurantRef
        }
      },
      headers: [
        { text: 'Name', value: 'name', align: 'left' },
        { text: 'Price', value: 'price', align: "right" },
        { text: 'Category', value: 'category', align: "right" }
      ],
      categoryList: null,
      menuList: null,
      menuOptionList: null,
      creating: false,
      updating: false,
      deleting: false
    };
  },
  mounted() {
    const { restaurantId } = this.$route.params;
    categoryService.getAll(restaurantId).then(categoryList => {
      this.categoryList = categoryList;
    });
    menuOptionService.getAll(restaurantId).then(menuOptionList => {
      this.menuOptionList = menuOptionList;
    });
    this.unsubscrible = menuService.onSnapshot(restaurantId, menuList => {
      this.menuList = menuList;
    });
  },
  destroyed() {
    this.unsubscrible();
  },
  computed: {
    categoryListUI() {
      return this.categoryList.map(category => ({
        text: category.name,
        value: category.id
      }));
    },
    menuListUI() {
      return this.menuList.map(menu => {
        if (this.categoryList) {
          const categories = menu.categories.map(
            categoryId =>
              this.categoryList.find(category => category.id === categoryId)
                .name
          );
          const pricesText = Object.values(menu.prices)
            .map(price => price.value)
            .join(', ');
          const categoriesText = categories.join(', ');
          return { ...menu, categories: categoriesText, prices: pricesText };
        }
        return { ...menu, categories: 'Loading...', prices: 'Loading...' };
      });
    },
    menuOptionListUI() {
      return this.menuOptionList.map(menuOption => {
        const menuOptionText = menuOption.optionItems
          .map(optionItem => optionItem.name)
          .join(', ');
        return {
          text: `${menuOption.title}: ${menuOptionText}`,
          value: menuOption.id
        };
      });
    }
  },
  methods: {
    onPriceFieldKeyUp() {
      const prices = this.managementDialog.form.prices;
      const lastIndex = prices.length - 1;
      if (prices[lastIndex].name !== '') {
        this.managementDialog.form.prices = [
          ...prices,
          {
            name: '',
            value: null
          }
        ];
      }
    },
    onRemovePriceClick(i) {
      this.managementDialog.form.prices.splice(i, 1);
    },
    onClickRow(menuId) {
      this.managementDialog.mode = 'EDIT';
      const menu = this.menuList.find(e => e.id === menuId);
      const prices = [
        ...menu.prices,
        {
          name: '',
          value: null
        }
      ];
      console.log(prices);
      this.managementDialog.form = { ...menu, prices };
      this.managementDialog.show = true;
    },
    onClickAddFab() {
      this.$refs.form.reset();
      this.managementDialog.mode = 'CREATE';
      this.managementDialog.show = true;
    },
    async create() {
      this.creating = true;
      try {
        const cleanPrices = this.managementDialog.form.prices.filter(
          price => price.name.length > 0 && price.value !== null
        );
        await menuService.create({
          ...this.managementDialog.form,
          prices: cleanPrices
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
        const cleanPrices = this.managementDialog.form.prices.filter(
          price => price.name.length > 0 && price.value !== null
        );
        await menuService.update({
          ...this.managementDialog.form,
          prices: cleanPrices
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
        await menuService.remove(this.managementDialog.form.id);
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
