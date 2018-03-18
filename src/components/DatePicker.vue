<template>
  <v-dialog ref="dialog" persistent v-model="modal" lazy full-width width="290px" :return-value.sync="date">
    <v-text-field slot="activator" :label="label" v-model="date" prepend-icon="event" readonly></v-text-field>
    <v-date-picker v-model="date" scrollable>
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
    }
  },
  data() {
    return {
      date: null,
      modal: false
    };
  },
  mounted() {
    const now = new Date();
    this.date = now.toISOString().split('T')[0];
    this.onSelectDate(this.date);
  },
  methods: {
    onClickOk() {
      this.$refs.dialog.save(this.date);
      this.onSelectDate(this.date);
    }
  }
};
</script>

<style>

</style>
