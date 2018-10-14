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
    };
  }
};
</script>
