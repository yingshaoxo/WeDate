<script setup lang="ts">
import logo from '/@/assets/logo.png'
import * as memory from '/@/store/memory'
import functions from '/@/store/functions'
import { reactive } from 'vue';

const dict = reactive({
    functions: {
        // onLoginButtonClick: async () => {
        //     await functions.maralis.login()
        // },
    }
})
</script>

<template>
    <div class="bigBackground">
        <div class="container">
            <van-row justify="center">
                <van-image width="130" height="130" round :src="logo" />
            </van-row>
            <van-row justify="center">
                <div
                    class="van-multi-ellipsis--l2 introduction"
                >WeDate is a world-class decentralized dating platform.</div>
            </van-row>
            <van-row justify="center">
                <van-button
                    size="small"
                    color="linear-gradient(to right, #ff6034, #ee0a24)"
                    @click="functions.maralis.login()"
                >GET IN !</van-button>
            </van-row>
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

    .introduction {
        text-align: center;
        width: 70%;

        -webkit-text-size-adjust: 100%;
        --page-title-display: block;
        -webkit-font-smoothing: antialiased;
        // --e-global-color-primary: #041836;
        // --e-global-color-secondary: #ffffff;
        --e-global-color-text: #041836;
        --e-global-color-accent: #041836;
        --e-global-color-d219831: #0077cc;
        --e-global-color-aba2960: #f2f6ff;
        --e-global-typography-primary-font-family: "Montserrat";
        --e-global-typography-primary-font-weight: 600;
        --e-global-typography-secondary-font-family: "Roboto Slab";
        --e-global-typography-secondary-font-weight: 400;
        --e-global-typography-text-font-family: "Open Sans";
        --e-global-typography-accent-font-family: "Roboto";
        --e-global-typography-accent-font-weight: 500;
        --e-global-typography-6877354-font-family: "Montserrat";
        --e-global-typography-6877354-font-weight: 800;
        --e-global-typography-6877354-line-height: 1.4em;
        --e-global-typography-9b6851a-font-family: "Montserrat";
        --e-global-typography-9b6851a-font-weight: 900;
        --e-global-typography-cddabbe-font-family: "Montserrat";
        --e-global-typography-cddabbe-font-weight: 700;
        --e-global-typography-a634747-font-family: "Montserrat";
        --e-global-typography-a634747-font-weight: 900;
        --e-global-typography-637c0a7-font-family: "Montserrat";
        --e-global-typography-637c0a7-font-size: 18px;
        --e-global-typography-637c0a7-font-weight: bold;
        --e-global-typography-637c0a7-line-height: 28px;
        --e-global-typography-text-font-size: 16px;
        --e-global-typography-text-line-height: 20px;
        --e-global-typography-6877354-font-size: 1.4rem;
        --e-global-typography-9b6851a-font-size: 32px;
        --e-global-typography-9b6851a-line-height: 39px;
        --e-global-typography-cddabbe-font-size: 24px;
        --e-global-typography-cddabbe-line-height: 29px;
        --e-global-typography-a634747-font-size: 20px;
        --e-global-typography-a634747-line-height: 24px;
        hyphens: manual;
        --e-column-margin-right: 0px;
        --e-column-margin-left: 0px;
        color: var(--e-global-color-secondary);
        font-family: "Open Sans", Sans-serif;
        font-weight: 600;
        text-align: center;
        font-size: 17px;
        line-height: 26px;
        box-sizing: border-box;
    }

    .van-row {
        margin-bottom: 28px;
    }

    .van-button {
        width: 100px;
        height: 30px;
        border-radius: 15px;
    }
}
</style>