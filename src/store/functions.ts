import { PageIdentity, globalDict, SexIdentity, BottomTabIndex } from "/@/store/memory"

import { router } from "/@/store/router"

import * as projectRequests from "/@/requests/projects"
import * as types from "/@/store/types"

import { Dialog, Toast } from "vant"
import { Moralis } from "moralis/types"
import { disconnect } from "process"

const functions = {
    basic: {
        jsonToObj(json: string) {
            return JSON.parse(json)
        },
        objToJson(obj: any) {
            return JSON.stringify(obj)
        },
        dateToTimestamp(date: Date | string) {
            if (typeof date === "string") {
                date = new Date(date)
            }
            return date.getTime()
        },
        timestampToString(timestamp: number | null) {
            if (timestamp === null) {
                return ""
            }
            return new Date(timestamp).toLocaleString()
        },
        timestampToDateString(timestamp: number | null) {
            if (timestamp === null) {
                return ""
            }
            return new Date(timestamp).toLocaleDateString()
        },
        log: (msg: any) => {
            console.log(msg)
        },
        print: (msg: string, nextThingToDo: Function = async () => { }) => {
            Dialog.alert({
                // title: 'Title',
                message: msg,
                theme: 'round-button',
                confirmButtonText: 'Confirm',
            }).then(async () => {
                // on close
                await nextThingToDo()
            });
        },
        openALink: (url: string) => {
            window.open(url)
        },
    },
    pages: {
        loadingOn: () => {
            Toast.loading({
                message: 'Loading...',
                forbidClick: true,
                overlay: true,
            });
        },
        loadingOff: () => {
            Toast.clear();
        },
        switchBasedOnUserLoginStatus: async () => {
            functions.pages.loadingOn()

            globalDict.user = functions.maralis.getCurrentUser()

            // check if user is logged in
            if ((await functions.maralis.seeIfSessionIsValid()) && globalDict.user) {
                // do stuff with the user: edit info or explore
                const userDetail = await functions.maralis.getUserDetailInfo(globalDict?.user?.id)
                if (userDetail) {
                    if (router.currentRoute.value.path === PageIdentity.chatPage) {
                        return
                    }
                    router.push(PageIdentity.explorePage)
                } else {
                    router.push(PageIdentity.infoEditPage)
                }
            } else {
                // show the signup or login page
                router.push(PageIdentity.homePage)
            }

            functions.pages.loadingOff()
        },
        switchPage: (page: string, query?: any) => {
            globalDict.pageSelected = page
            if (query) {
                router.push({ path: globalDict.pageSelected, query })
            } else {
                router.push(page)
            }
        },
        switchPageBasedOnTabIndex: (tabIndex: number | string) => {
            const theTabIndex = Number(tabIndex) as keyof typeof BottomTabIndex
            if (tabIndex in BottomTabIndex) {
                const page = BottomTabIndex[theTabIndex] as string
                router.push(page)
            }
        }
    },
    maralis: {
        getCurrentUser: () => {
            return globalDict?.moralis?.User?.current()
        },
        seeIfSessionIsValid: async () => {
            try {
                const user = await functions.maralis.getUserDetailInfo(globalDict?.user?.id)
                // if (user) {
                //     return true
                // } else {
                //     return false
                // }
                return true
            } catch (error) {
                console.log(error)
                return false
            }
        },
        login: async () => {
            // if (globalDict.user) {
            //     return
            // }
            try {
                //@ts-ignore
                const user = await globalDict.moralis.authenticate()
                if (user) {
                    globalDict.user = user
                    console.log(`The user eth address is: ${user.get('ethAddress')}`)
                    functions.pages.switchBasedOnUserLoginStatus()
                }
            } catch (e) {
                console.log(e)
                globalDict.user = null
                functions.basic.print('Login failed')
                localStorage.clear()
                sessionStorage.clear()
            }
        },
        getUserDetailInfo: async (targetUserId: string | null | undefined) => {
            if (!targetUserId) {
                return null
            }

            if (globalDict?.user) {
                if (!targetUserId) {
                    return null
                }
                try {
                    const UserDetails = globalDict.moralis.Object.extend("UserDetails");
                    const query = new globalDict.moralis.Query(UserDetails);
                    query.equalTo("parentId", targetUserId);
                    const results = await query.find();
                    if (results.length > 0) {
                        const theUser = results[0]
                        functions.basic.log(`the user has detail info: ${theUser}`)
                        return theUser
                    } else {
                        functions.basic.log(`the user has no detail info`)
                        return null
                    }
                } catch (e) {
                    functions.basic.log(e)
                    return null
                }
            } else {
                return null
            }
        },
        createUserDetailInfo: async (name: string, sex: typeof SexIdentity[keyof typeof SexIdentity], birthday: number | null, location: types.locationType | null, moralisFile: Moralis.File) => {
            if (!birthday) {
                return false
            }
            if (!location) {
                return false
            }

            const theExistDetail = await functions.maralis.getUserDetailInfo(globalDict?.user?.id)
            if (theExistDetail) {
                theExistDetail.set("name", name)
                theExistDetail.set("sex", sex)
                theExistDetail.set("birthday", birthday)
                theExistDetail.set("location", location)
                theExistDetail.set("picture", moralisFile)
                try {
                    await theExistDetail.save()
                    return true
                } catch (e) {
                    functions.basic.log(e)
                    return false
                }
            }

            if (!globalDict.user) {
                return false
            }

            const UserDetails = globalDict.moralis.Object.extend("UserDetails");
            const userDetail = new UserDetails()

            userDetail.set("name", name)
            userDetail.set("sex", sex)
            userDetail.set("birthday", birthday)
            userDetail.set("location", location)
            userDetail.set("picture", moralisFile)

            userDetail.set("parentId", globalDict?.user?.id)

            try {
                await userDetail.save()
                functions.basic.log(`userDetail for user ${globalDict.user?.id} is created`)
                return true
            } catch (e) {
                functions.basic.log(e)
                return false
            }
        },
        getRandomUserDetails: async (howMany: number) => {
            let results = await globalDict.moralis.Cloud.run("getRandomUserDetails", { howMany });

            if ((typeof results) === "string") {
                console.log(results)
                return []
            }

            if (results.length > 0) {
                console.log(results)
                return results
            } else {
                return []
            }
        }
        //cloud
        // Moralis.Cloud.define("getRandomUserDetails", async (request) => {
        //     const howMany = request.params.howMany

        //     const UserDetails = Moralis.Object.extend("UserDetails");
        //     const query = new Moralis.Query(UserDetails);
        //     const length = await query.count();

        //     let randomIndex = Math.floor(Math.random() * length)
        //     if ((length - randomIndex) < howMany) {
        //         randomIndex = length - howMany
        //     }
        //   	if (randomIndex < 0) {
        //         randomIndex = 0
        //     }

        //     const pipeline = [
        //         { skip: randomIndex },
        //         { limit: howMany }
        //     ];

        //     try {
        //         const results = await query.aggregate(pipeline, { useMasterKey: true })
        //         return results
        //     } catch (e) {
        //         return e.toString()
        //     }
        // });
    },
    chat: {
        getFriendsOfAUser: async (userId: string) => {
            const Message = globalDict.moralis.Object.extend("Message");

            const senderEqualQuery1 = new globalDict.moralis.Query(Message);
            senderEqualQuery1.equalTo("from", userId);
            senderEqualQuery1.distinct("from");
            const receiverEqualQuery1 = new globalDict.moralis.Query(Message);
            receiverEqualQuery1.equalTo("to", userId);
            senderEqualQuery1.distinct("to");

            const mainQuery = new globalDict.moralis.Query.or(senderEqualQuery1, receiverEqualQuery1);
            mainQuery.ascending("createdAt");

            try {
                let results = await mainQuery.find();
                if (results.length > 0) {
                    // console.log("the friend list results: ", results)
                    // debugger
                    const noRepeatIdList = [] as string[]
                    results = results.filter((item: any) => {
                        const fromId = item.get("from")
                        const toId = item.get("to")
                        if (!noRepeatIdList.includes(fromId)) {
                            noRepeatIdList.push(fromId)
                            return true
                        }
                        if (!noRepeatIdList.includes(toId)) {
                            noRepeatIdList.push(toId)
                            return true
                        }
                        return false
                    })
                    const friends = await Promise.all(results.map(async (message: Moralis.Object) => {
                        if (message.get("from") === userId) {
                            const theUserId = message.get("to")
                            const theUserObj = await functions.maralis.getUserDetailInfo(theUserId)
                            if (theUserObj) {
                                return {
                                    id: theUserId,
                                    displayName: theUserObj.get("name"),
                                    picture: theUserObj.get("picture").url()
                                }
                            }
                            return null
                        } else {
                            const theUserId = message.get("from")
                            const theUserObj = await functions.maralis.getUserDetailInfo(theUserId)
                            if (theUserObj) {
                                return {
                                    id: theUserId,
                                    displayName: theUserObj.get("name"),
                                    picture: theUserObj.get("picture").url()
                                }
                            }
                            return null
                        }
                    }))
                    const ids = friends.map(o => o.id)
                    const uniqueFriends = friends.filter(({ id }, index) => !ids.includes(id, index + 1))
                    return uniqueFriends
                }
                return []
            } catch (e) {
                functions.basic.log(e)
                return []
            }
        },
        getMessageListRelatedToTheTwoUsers: async (userId1: string | undefined | null, userId2: string | undefined | null) => {
            if (!userId1 || !userId2) {
                return []
            }

            const Message = globalDict.moralis.Object.extend("Message");

            const query1 = new globalDict.moralis.Query(Message);
            query1.equalTo("from", userId1);
            query1.equalTo("to", userId2);

            const query2 = new globalDict.moralis.Query(Message);
            query2.equalTo("from", userId2);
            query2.equalTo("to", userId1);

            const mainQuery = new globalDict.moralis.Query.or(query1, query2);
            mainQuery.ascending("createdAt");

            try {
                const results = await mainQuery.find();
                return results
            } catch (e) {
                functions.basic.log(e)
                return []
            }
        },
        sendAMessage: async (targetUserId: string | null, message: string) => {
            if (!targetUserId) {
                return false
            }
            if (!globalDict.user) {
                return false
            }

            const Message = globalDict.moralis.Object.extend("Message");
            const messageObject = new Message()

            messageObject.set("from", globalDict.user.id)
            messageObject.set("to", targetUserId)
            messageObject.set("content", message)

            try {
                await messageObject.save()
                return true
            } catch (e) {
                functions.basic.log(e)
                return false
            }
        },
        getOnNewMessageSubscriptionObjectRelatedToAUser: async (userId: string | undefined | null) => {
            if (!globalDict.user || !userId) {
                return null
            }

            const Message = globalDict.moralis.Object.extend("Message");

            const senderEqualQuery1 = new globalDict.moralis.Query(Message);
            senderEqualQuery1.equalTo("from", userId);
            const receiverEqualQuery1 = new globalDict.moralis.Query(Message);
            receiverEqualQuery1.equalTo("to", userId);

            const mainQuery = new globalDict.moralis.Query.or(senderEqualQuery1, receiverEqualQuery1);
            mainQuery.ascending("createdAt");

            let subscription = await mainQuery.subscribe();

            return subscription
        },
        getOnNewMessageSubscriptionObject: async () => {
            if (!globalDict.user) {
                return null
            }

            let query = new globalDict.moralis.Query('Message');
            let subscription = await query.subscribe();

            return subscription
        }
    }

}

export default functions 