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
export default {
  name: 'datePicker',
  props: {
    label: {
      type: String
    },
    onSelectDate: {
      type: Function
    },
    date: {
      type: String
    }
  },
  data() {
    return {
      modal: false,
      dateData: this.date
    };
  },
  mounted() {
    this.onSelectDate(this.dateData);
  },
  methods: {
    onClickOk() {
      this.$refs.dialog.save(this.dateData);
      this.onSelectDate(this.dateData);
    }
  }
};
</script>

<style>

</style>
