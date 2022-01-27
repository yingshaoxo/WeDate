<script setup lang="ts">
import * as memory from '/@/store/memory'
import functions from '/@/store/functions'
import { onBeforeMount, onMounted, reactive, ref, unref } from 'vue';

import beautyGirl from '/@/assets/beautyGirl.jpg'
import logo from '/@/assets/logo.png'

import StackBasic from '/@/components/stackBasic.vue';
import FriendList from '/@/components/friendList.vue';

import { Notify, Tabbar, TabbarItem } from 'vant';

const dict = reactive({
    tempData: {
        items: [] as any[]
    },
    data: {
    },
    functions: {
    }
})


onMounted(async () => {
    const rows = await functions.maralis.getRandomUserDetails(10)
    dict.tempData.items = rows.filter((item: any) => {
        return item.parentId != memory.globalDict.user?.id
    })
})
</script>

<template>
    <div class="bigBackground">
        <div class="container">
            <!-- explore page -->
            <!-- <van-button @click="dict.functions.clickMeTest">click me</van-button> -->

            <stack-basic :items="dict.tempData.items"></stack-basic>
        </div>
    </div>
</template>

<style lang="scss">
.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;

    .van-image {
        width: 100%;
        height: 100vw;
    }

    .gestureIndicatorBar {
        margin-top: 5px;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;

        .van-icon {
            font-size: 50px;
            color: #ff6034;
            margin: 0px 10px;
        }

        .arrowIcon {
            font-size: 50px;
            color: #f3f6fa;
            margin: 0px 10px;
        }
    }
}

.gradientGreen {
    background: rgb(2, 0, 36);
    background: -moz-linear-gradient(
        90deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(183, 223, 71, 1) 0%,
        rgba(0, 212, 255, 1) 100%
    );
    background: -webkit-linear-gradient(
        90deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(183, 223, 71, 1) 0%,
        rgba(0, 212, 255, 1) 100%
    );
    background: linear-gradient(
        90deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(183, 223, 71, 1) 0%,
        rgba(0, 212, 255, 1) 100%
    );
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#020024",endColorstr="#00d4ff",GradientType=1);
}

.gradientRed {
    background: rgb(2, 0, 36);
    background: -moz-linear-gradient(
        90deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(0, 212, 255, 1) 0%,
        rgba(255, 0, 144, 1) 100%
    );
    background: -webkit-linear-gradient(
        90deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(0, 212, 255, 1) 0%,
        rgba(255, 0, 144, 1) 100%
    );
    background: linear-gradient(
        90deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(0, 212, 255, 1) 0%,
        rgba(255, 0, 144, 1) 100%
    );
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#020024",endColorstr="#ff0090",GradientType=1);
}
</style>