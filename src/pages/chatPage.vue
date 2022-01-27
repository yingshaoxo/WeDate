<script setup lang="ts">
import * as memory from '/@/store/memory'
import functions from '/@/store/functions'
import { computed, onBeforeMount, onMounted, reactive, ref, unref } from 'vue';
import { useRoute } from 'vue-router';

import ChatWindow, { Message, Room } from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'

const route = useRoute()

const dict = reactive({
    tempData: {
        targetUserId: '',
        messageLoaded: false,
        roomLoaded: false,
        targetUserName: '',
        targetUserAvatar: '',
        theNewMessageSubscription: null as any
    },
    data: {
        rooms: [
            {
                roomId: 1,
                roomName: 'Chat Room',
                avatar: '/logo.png',
                unreadCount: 0,
                index: 1,
                users: [
                    {
                        _id: 1,
                        username: 'target',
                        avatar: '/logo.png',
                        status: {
                            state: 'offline',
                            lastChanged: 'today, 14:30'
                        }
                    },
                    {
                        _id: 2,
                        username: 'yingshaoxo',
                        avatar: '/logo.png',
                        status: {
                            state: 'online',
                            lastChanged: '14 July, 20:00'
                        }
                    }
                ],
                typingUsers: []
            }
        ] as Room[],
        messages: [
            {
                _id: 0, // message id
                indexId: 1,
                content: `Hi there!`,
                senderId: 2,
                date: '13 November',
                timestamp: '10:20',
                system: true,
                saved: true,
                distributed: false,
                seen: true,
                deleted: false,
                failure: true,
                disableActions: false,
                disableReactions: false,
            }
        ] as Message[],
        currentUserId: 2
    },
    functions: {
        fetchMessages: async ({ room, options }: any) => {
            dict.tempData.messageLoaded = false

            await dict.functions.updateMessageList()

            dict.tempData.messageLoaded = true
        },
        updateMessageList: async () => {
            /*
            [{"from":"FqSsj6bQJN6DGHHWyHNENFKr","to":"FqSsj6bQJN6DGHHWyHNENFKr","content":"ok","createdAt":"2022-01-19T08:39:25.350Z","updatedAt":"2022-01-19T08:39:25.350Z","objectId":"2rEo4appoVRl2w6gMXQIX98t"}]
            */
            const theMessageList = await functions.chat.getMessageListRelatedToTheTwoUsers(
                dict.tempData.targetUserId,
                memory?.globalDict?.user?.id,
            )
            const realMessageList = theMessageList.map((val: any, indexId: any) => {
                return {
                    _id: val.id,
                    indexId: indexId,
                    content: val.get("content"),
                    senderId: val.get("from") === memory?.globalDict?.user?.id ? 2 : 1,
                    date: '13 November',
                    timestamp: '10:20',
                    system: false,
                    saved: true,
                    distributed: true,
                    seen: true,
                    deleted: false,
                    failure: false,
                    disableActions: true,
                    disableReactions: true,
                }
            })

            dict.data.messages = [...realMessageList]
        },
        sendMessage: async ({ content, roomId, files, replyMessage }: any) => {
            content = content.trim()

            if (content) {
                await functions.chat.sendAMessage(
                    dict.tempData.targetUserId,
                    content,
                )
            }
            // const message = {
            //     _id: roomId,
            //     content: content,
            //     senderId: 2,
            //     username: 'yingshaoxo',
            //     avatar: '/logo.png',
            //     date: '13 November',
            //     timestamp: '10:20',
            //     system: false,
            //     saved: true,
            //     distributed: true,
            //     seen: true,
            //     deleted: false,
            //     failure: false,
            //     disableActions: true,
            //     disableReactions: true,
            //     files: [
            //     ],
            // }

            // dict.data.messages = [...dict.data.messages, message]
        },
        receiveMessage: async (val: any) => {
            /*
            [{"from":"FqSsj6bQJN6DGHHWyHNENFKr","to":"FqSsj6bQJN6DGHHWyHNENFKr","content":"ok","createdAt":"2022-01-19T08:39:25.350Z","updatedAt":"2022-01-19T08:39:25.350Z","objectId":"2rEo4appoVRl2w6gMXQIX98t"}]
            */
            const theMessage = {
                _id: val.id,
                content: val.get("content"),
                senderId: val.get("from") === memory?.globalDict?.user?.id ? 2 : 1,
                date: '13 November',
                timestamp: new Date(val.get("updateAt")).toTimeString().split(' ')[0].split(':').slice(0, 2).join(':'),
                system: false,
                saved: true,
                distributed: true,
                seen: true,
                deleted: false,
                failure: false,
                disableActions: true,
                disableReactions: true,
            }

            dict.data.messages = [...dict.data.messages, theMessage]
        },
    }
})

onBeforeMount(async () => {
    let targetUserId = route.query.targetUserId
    if (!targetUserId) {
        targetUserId = ""
    }
    if (Array.isArray(targetUserId)) {
        targetUserId = targetUserId[0]
    }
    dict.tempData.targetUserId = String(targetUserId)

    setTimeout(() => {
        dict.tempData.messageLoaded = true
        dict.tempData.roomLoaded = true
    }, 500)

    const theTargetUser = await functions.maralis.getUserDetailInfo(dict.tempData.targetUserId)
    if (theTargetUser) {
        dict.tempData.targetUserName = theTargetUser.get("name") ?? ""
        dict.tempData.targetUserAvatar = theTargetUser.get("picture")?.url() ?? "/logo.png"

        dict.data.rooms[0].roomName = dict.tempData.targetUserName
        dict.data.rooms[0].avatar = dict.tempData.targetUserAvatar
        dict.data.rooms = [...dict.data.rooms]

        dict.tempData.theNewMessageSubscription = await functions.chat.getOnNewMessageSubscriptionObject();
        dict.tempData.theNewMessageSubscription?.on("create", (val: any) => {
            const from = val.get("from")
            const to = val.get("to")

            if ((from === dict.tempData.targetUserId || to === dict.tempData.targetUserId) && (to === memory?.globalDict?.user?.id || from === memory?.globalDict?.user?.id)) {
                dict.functions.receiveMessage(val)
            }
        })
    }
})

onMounted(async () => {
})
</script>

<template>
    <div class="bigBackground">
        <div class="container">
            <!-- <van-button @click="() => { functions.basic.log(memory.globalDict.user?.id) }">click me</van-button> -->
            <!-- {{ dict.tempData.targetUserId }} -->
            <chat-window
                height="100vh"
                :current-user-id="dict.data.currentUserId"
                :rooms="dict.data.rooms"
                :single-room="true"
                :messages="dict.data.messages"
                :messagesLoaded="dict.tempData.messageLoaded"
                :roomsLoaded="dict.tempData.roomLoaded"
                :show-files="false"
                :show-audio="false"
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
                @send-message="dict.functions.sendMessage"
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

.vac-info-wrapper {
    text-align: start;
}

.vac-message-card {
    .vac-format-message-wrapper {
        text-align: start;
    }
}
</style>