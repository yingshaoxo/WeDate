import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import { PageIdentity, globalDict } from "/@/store/memory"

import HomePage from '/@/pages/homePage.vue'
import ExplorePage from '/@/pages/explorePage.vue'
import InfoEditPage from '/@/pages/infoEditPage.vue'
import ChatPage from '/@/pages/chatPage.vue'
import FriendList from '/@/components/friendList.vue'
import RootView from '/@/pages/rootView.vue'

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: RootView,
        children: [
            { path: PageIdentity.homePage, component: HomePage },
            { path: PageIdentity.infoEditPage, component: InfoEditPage },
            { path: PageIdentity.explorePage, component: ExplorePage },
            { path: PageIdentity.chatPage, component: ChatPage },
            { path: PageIdentity.friendList, component: FriendList },
        ]
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})