<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup

import { onBeforeMount } from 'vue';
import functions from '/@/store/functions'

const checkIfItsMobile = () => {
  const userAgent = navigator.userAgent;
  const mobileAgents = ['Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'];
  let isMobile = false;
  mobileAgents.forEach(agent => {
    if (userAgent.indexOf(agent) > -1) {
      isMobile = true;
    }
  });
  return isMobile;
}

let isMobile = checkIfItsMobile();

onBeforeMount(async () => {
  if (checkIfItsMobile()) {
    await functions.pages.switchBasedOnUserLoginStatus();
  }
})
</script>

<template>
  <div v-if="!isMobile" class="Center">Mobile Only</div>
  <router-view v-if="isMobile"></router-view>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px;
}
.bigBackground {
  /* background-color: #ffc6d9; */
  background-image: url("/img/R.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100vw;
}
.Center {
  display: flex;
  justify-content: center;
  align-items: center;
  justify-items: center;
  min-height: 100vh;
  font-size: large;
}
</style>
