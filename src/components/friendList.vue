<script setup lang="ts">
import * as memory from '/@/store/memory'
import functions from '/@/store/functions'
import { computed, onActivated, onBeforeMount, onMounted, reactive, ref, unref } from 'vue';
import { useRoute } from 'vue-router';

import ChatWindow, { Message, Room } from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'

const route = useRoute()

const dict = reactive({
    tempData: {
        currentUserId: '',
        messageLoaded: false,
        roomLoaded: false,
        targetUserName: '',
        targetUserAvatar: '',
        theNewMessageSubscription: null as any
    },
    data: {
        rooms: [
            // {
            // roomId: 1,
            // roomName: '',
            // avatar: '',
            // unreadCount: 0,
            // index: 1,
            // users: [
            // ],
            // typingUsers: []
            // }
        ] as Room[],
        messages: [
        ] as Message[],
        currentUserId: "2"
    },
    functions: {
        fetchFriendsList: async () => {
            dict.tempData.roomLoaded = false

            const result = await functions.chat.getFriendsOfAUser(dict.tempData.currentUserId)
            console.log("the friend list is: ", result)
            if (result && result.length > 0) {
                dict.data.rooms = result.map((obj: any, index: number) => {
                    return {
                        roomId: obj.id,
                        roomName: obj.displayName,
                        avatar: obj.picture,
                        unreadCount: 0,
                        index: index,
                        users: [
                        ],
                        typingUsers: []
                    }
                })
            }

            dict.tempData.roomLoaded = true
        },
        receiveMessage: async (val: any) => {
            /*
            [{"from":"FqSsj6bQJN6DGHHWyHNENFKr","to":"FqSsj6bQJN6DGHHWyHNENFKr","content":"ok","createdAt":"2022-01-19T08:39:25.350Z","updatedAt":"2022-01-19T08:39:25.350Z","objectId":"2rEo4appoVRl2w6gMXQIX98t"}]
            */
            let thisIsANewRoom = true
            dict.data.rooms.forEach((room: Room) => {
                const fromId = val.get("from")
                const toId = val.get("to")

                if (room.roomId === String(fromId) || room.roomId === String(toId)) {
                    thisIsANewRoom = false
                }
            })

            if (thisIsANewRoom) {
                if (val.get("from") != dict.tempData.currentUserId) {
                    const theUser = await functions.maralis.getUserDetailInfo(val.get("from"))
                    if (!theUser) {
                        return
                    }
                    dict.data.rooms = [{
                        roomId: val.get("from"),
                        roomName: theUser.get("name"),
                        avatar: theUser.get("picture").url(),
                        unreadCount: 0,
                        index: dict.data.rooms.length + 1,
                        users: [
                        ],
                        typingUsers: []
                    }, ...dict.data.rooms]
                }
            }
        },
        fetchMessages: async ({ room, options }: any) => {
            // dict.tempData.messageLoaded = false
            // dict.tempData.messageLoaded = true

            const roomId = room.roomId

            functions.pages.switchPage(memory.PageIdentity.chatPage, { targetUserId: roomId })

        },
    }
})

onBeforeMount(async () => {
    dict.tempData.roomLoaded = false

    dict.tempData.currentUserId = memory?.globalDict?.user?.id ?? ''
    dict.data.currentUserId = dict.tempData.currentUserId

    await dict.functions.fetchFriendsList()

    dict.tempData.roomLoaded = true

    dict.tempData.theNewMessageSubscription = await functions.chat.getOnNewMessageSubscriptionObjectRelatedToAUser(dict.tempData.currentUserId);
    dict.tempData.theNewMessageSubscription?.on("create", (val: any) => {
        dict.functions.receiveMessage(val)
    })
})

onMounted(async () => {
})
</script>

<template>
    <div class="bigBackground">
        <div class="container">
            <!-- <van-button @click="() => { functions.basic.log(memory.globalDict.user?.id) }">click me</van-button> -->
            <!-- {{ dict?.tempData?.currentUserId }} -->
            <chat-window
                height="100vh"
                :current-user-id="dict.data.currentUserId"
                :rooms="dict.data.rooms"
                :single-room="false"
                :messages="dict.data.messages"
                :messagesLoaded="dict.tempData.messageLoaded"
                :roomsLoaded="dict.tempData.roomLoaded"
                rooms-order="desc"
                :styles="{
                    general: {
                        color: '#0a0a0a',
                        colorSpinner: '#333',
                        borderStyle: '1px solid #e1e4e8'
                    },
                    footer: {
                        background: '#f8f9fa',
                        backgroundReply: 'rgba(0, 0, 0, 0.08)'
                    },
                    icons: {
                        search: '#9ca6af'
                    }
                }"
                @fetchMessages="dict.functions.fetchMessages"
            ></chat-window>
        </div>
    </div>
</template>

<style lang="scss">
.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

.vac-info-wrapper {
    text-align: start;
}

.vac-message-card {
    .vac-format-message-wrapper {
        text-align: start;
    }
}

.vac-room-container {
    .vac-room-name {
        flex: 1;
        color: var(--chat-room-color-username);
        font-weight: 500;
        flex-direction: row;
        justify-content: flex-start;
        text-align: start;
        margin-left: 5px;
    }
}
</style>