<template>
  <v-dialog ref="dialog" persistent v-model="modal" lazy full-width width="290px" :return-value.sync="dateData">
    <v-text-field slot="activator" :label="label" v-model="dateData" prepend-icon="event" readonly></v-text-field>
    <v-date-picker v-model="dateData" scrollable>
      <v-spacer></v-spacer>
      <v-btn flat color="primary" @click="modal = false">Cancel</v-btn>
      <v-btn flat color="primary" @click="onClickOk">OK</v-btn>
    </v-date-picker>
  </v-dialog>
</template>

<script>
const yyyymmdd = date => {
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();
  return [
    date.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd
  ].join("-");
};
export default {
  name: "datePicker",
  props: {
    label: {
      type: String
    },
    onSelectDate: {
      type: Function
    },
    date: {
      type: Date
    }
  },
  data() {
    return {
      modal: false,
      dateData: yyyymmdd(this.date)
    };
  },
  mounted() {
    const date = new Date(this.dateData);
    date.setHours(0, 0, 0, 0);
    this.onSelectDate(date);
  },
  methods: {
    onClickOk() {
      this.$refs.dialog.save(this.dateData);
      const date = new Date(this.dateData);
      date.setHours(0, 0, 0, 0);
      this.onSelectDate(date);
    }
  }
};
// test for scm
</script>

<style>


</style>
