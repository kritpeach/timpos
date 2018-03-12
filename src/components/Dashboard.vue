<template>
<h1>Dashboard</h1>
</template>

<script>
import statistic from '../service/statistic';
export default {
  mounted() {
    const startDate = new Date('2017-01-01');
    const endDate = new Date('2019-01-01');
    statistic.getDashboardData(startDate,endDate,'','Aws32140452Y8SKRcvci').then(data => {
      console.log(data);
    });
  }
};
</script>

<style scope>

</style>
