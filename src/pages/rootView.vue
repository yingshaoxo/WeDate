<template>
    <router-view></router-view>
    <van-tabbar class="tabber" v-model="active">
        <!-- v-model="dict.data.activeTableIndex"
        @change="dict.functions.onTabIndexChange"-->
        <van-tabbar-item icon="home-o" replace :to="PageIdentity.explorePage">Explore</van-tabbar-item>
        <van-tabbar-item icon="friends-o" replace :to="PageIdentity.friendList">Chat</van-tabbar-item>
        <van-tabbar-item icon="user-o" replace :to="PageIdentity.infoEditPage">Me</van-tabbar-item>
    </van-tabbar>
</template>

<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue'
import functions from '../store/functions';
import { PageIdentity, globalDict } from "/@/store/memory"

const dict = reactive({
    tempData: {
        items: [] as any[]
    },
    data: {
        activeTableIndex: 0,
    },
    functions: {
        onTabIndexChange(index: number) {
            localStorage.setItem("tabIndex", index.toString());
        },
    }
})

onBeforeMount(() => {
    // const tabIndex = localStorage.getItem("tabIndex");
    // if (tabIndex) {
    //     dict.data.activeTableIndex = parseInt(tabIndex);
    //     functions.pages.switchPageBasedOnTabIndex(dict.data.activeTableIndex)
    // }

})

const active = ref(undefined)
</script>

<style lang="scss">
.tabber {
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    .van-tabbar-item {
        width: 50px;
        height: 50px;
        border-radius: 10px;
    }
    .van-tabbar-item--active {
        background-color: #efece7;
        color: rgb(120, 120, 204);
        font-weight: bold;
    }
}
</style>

