<template>
<v-app>
<h1>Dashboard</h1>
<v-container grid-list-md>
<v-layout row wrap>
    <v-flex xs3>
      <DatePicker label="Select start date" :onSelectDate="(date) => startDate = date"></DatePicker>
    </v-flex>
    <v-flex xs3>
      <DatePicker label="Select end date" :onSelectDate="(date) => endDate = date"></DatePicker>
    </v-flex>
    <v-flex xs3>
      <v-select
          prepend-icon="group_work"
          :items="categoryList"
          v-model="category"
          label="Select category"
          item-text="name"
          item-value="id"
          return-object
          single-line
        ></v-select>
    </v-flex>
    <v-flex xs3>
      <v-btn @click="loadReport" :loading="loading" depressed color="primary">Submit</v-btn>
    </v-flex>
    <v-flex xs12 v-if="statistic !== null">
      <div>{{statistic.sales}}</div>
    </v-flex>
    <template  v-if="statistic !== null">
    <v-flex xs3>
            <v-card color="blue-grey darken-2" class="white--text">
              <v-card-title primary-title>
                <div class="headline">฿ {{statistic.income}}</div>
                <div>Income</div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs3>
            <v-card color="blue-grey darken-2" class="white--text">
              <v-card-title primary-title>
                <div class="headline">{{statistic.billCount}}</div>
                <div>Bill</div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs3>
            <v-card color="blue-grey darken-2" class="white--text">
              <v-card-title primary-title>
                <div class="headline">{{statistic.doneOrderLineItemList.length}}</div>
                <div>Cooked order</div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs3>
            <v-card color="blue-grey darken-2" class="white--text">
              <v-card-title primary-title>
                <div class="headline">{{statistic.cancelOrderLineItemList.length}}</div>
                <div>Cancelled order</div>
              </v-card-title>
            </v-card>
          </v-flex>
    </template>
  </v-layout>
</v-container>
</v-app>
</template>

<script>
import statistic from "../service/statistic";
import categoryService from "../service/Category";
import DatePicker from "./DatePicker";
export default {
  data() {
    return {
      startDate: null,
      endDate: null,
      category: { name: "All", id: "" },
      categoryList: [],
      loading: false,
      statistic: null
    };
  },
  components: {
    DatePicker
  },
  mounted() {
    const { restaurantId } = this.$route.params;
    categoryService.getAll(restaurantId).then(categoryList => {
      this.categoryList = [{ name: "All", id: "" }, ...categoryList];
    });
  },
  methods: {
    async loadReport() {
      this.loading = true;
      const { restaurantId } = this.$route.params;
      const startDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);
      await statistic
        .getDashboardData(startDate, endDate, this.category.id, restaurantId)
        .then(data => {
          console.log(data);
          this.statistic = data;
        });
      this.loading = false;
    }
  }
};
</script>

<style scoped>
#app {
  max-width: 720px;
  margin: 0 auto;
}

.headline{
  width: 100%;
}
</style>
