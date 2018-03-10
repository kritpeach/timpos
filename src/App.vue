<template>
<div>
  <transition mode="out-in">
    <router-view></router-view>
  </transition>
</div>
</template>

<script>
export default {
  created() {
    console.log("App is created");
  },
  data() {
    return {
      clipped: true,
      drawer: true,
      items: [
        {
          icon: "bubble_chart",
          title: "Dashboard"
        },
        {
          icon: "bubble_chart",
          title: "Employee"
        },
        {
          icon: "bubble_chart",
          title: "Menu"
        }
      ],
      title: "Vuetify.js"
    };
  }
};
</script>
