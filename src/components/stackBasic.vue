<script setup lang="ts">
import { computed, onMounted, reactive, ref, unref, withDefaults, nextTick, watch } from 'vue'
import stackComponent from '/@/components/stack.vue'
import functions from '/@/store/functions'
import * as memory from '/@/store/memory'

import logo from '/@/assets/logo.png'

export interface Props {
  items: any
}

const props = withDefaults(defineProps<Props>(), {
  items: []
})

const stackRef = ref(null)

const dict = reactive({
  functions: {
  }
})

const prev = () => {
  unref(stackRef)?.prev()
}

const next = () => {
  unref(stackRef)?.next()
}
</script>

<template>
  <div>
    <div class="stack-wrapper">
      <stackComponent
        v-if="items.length > 0"
        ref="stackRef"
        :stackinit="{}"
        :pages="items"
        @handleImageDoubleClick="async (item: any) => {
          const parentUserId = item.parentId
          functions.pages.switchPage(memory.PageIdentity.chatPage, { targetUserId: parentUserId })
          // functions.basic.print(functions.basic.objToJson(item))
        }"
      ></stackComponent>
      <van-image v-else :src="logo" width="100%" height="100%" mode="aspectFill"></van-image>
    </div>
    <div class="controls">
      <button @click="prev" class="button">
        <i class="prev"></i>
        <span class="text-hidden">prev</span>
      </button>
      <button @click="next" class="button">
        <i class="next"></i>
        <span class="text-hidden">next</span>
      </button>
    </div>
  </div>
</template>

<style>
.stack-wrapper {
  margin: 0 auto;
  position: relative;
  z-index: 1000;
  width: 320px;
  height: 320px;
  padding: 0;
  list-style: none;
  pointer-events: none;
}
.controls {
  position: relative;
  width: 200px;
  text-align: center;
  display: flex; /*Flex布局*/
  display: -webkit-flex; /* Safari */
  justify-content: space-around;
  margin: 0 auto;
  margin-top: 50px;
}
.controls .button {
  border: none;
  background: none;
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-size: 16px;
  width: 50px;
  height: 50px;
  z-index: 100;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  border-radius: 50%;
  background: #fff;
}
.button .next {
  display: inline-block;
  width: 10px;
  height: 5px;
  background: rgb(129, 212, 125);
  line-height: 0;
  font-size: 0;
  vertical-align: middle;
  -webkit-transform: rotate(45deg);
  left: -5px;
  top: 2px;
  position: relative;
}
.button .next:after {
  content: "/";
  display: block;
  width: 20px;
  height: 5px;
  background: rgb(129, 212, 125);
  -webkit-transform: rotate(-90deg) translateY(-50%) translateX(50%);
}
.button .prev {
  display: inline-block;
  width: 20px;
  height: 5px;
  background: rgb(230, 104, 104);
  line-height: 0;
  font-size: 0;
  vertical-align: middle;
  -webkit-transform: rotate(45deg);
}
.button .prev:after {
  content: "/";
  display: block;
  width: 20px;
  height: 5px;
  background: rgb(230, 104, 104);
  -webkit-transform: rotate(-90deg);
}
.controls .text-hidden {
  position: absolute;
  overflow: hidden;
  width: 0;
  height: 0;
  color: transparent;
  display: block;
}
</style>
