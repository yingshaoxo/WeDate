import { computed, reactive } from "vue";
import Web3 from "web3";
import Moralis from "moralis";

Moralis.start({
    serverUrl: '',
    appId: '',
    masterKey: '',
});

export const PageIdentity = {
    homePage: "/",
    infoEditPage: '/edit',
    explorePage: '/explore',
    chatPage: "/chat",
    friendList: "/friend_list",
    settingPage: '/setting',
    aboutPage: '/about',
}

export const BottomTabIndex = {
    0: PageIdentity.explorePage,
    1: PageIdentity.friendList,
    2: PageIdentity.infoEditPage,
}

export const SexIdentity = {
    woman: 0,
    man: 1
}

export const globalDict = reactive({
    readyForUsing: false,
    pageSelected: PageIdentity.homePage,
    moralis: Moralis,
    web3: new Web3(),
    user: null as unknown as Moralis.User | null | undefined,
    constants: {
    },
    sharedData: {
        targetUserId: '',
    }
})