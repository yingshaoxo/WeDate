<script setup lang="ts">
import * as memory from '/@/store/memory'
import functions from '/@/store/functions'
import * as types from '/@/store/types'
import { computed, onBeforeMount, onMounted, reactive, ref, unref, watch } from 'vue';

import { GoogleMap, Marker } from 'vue3-google-map'
import { Toast } from 'vant';

const formRef = ref(null) as any;
const mapRef = ref(null) as any;

const dict = reactive({
    tempData: {
        showBirthdayPickerWindow: false,
        showLocationPickerWindow: false,
        birthday: computed({
            get: (): string => {
                return functions.basic.timestampToDateString(dict.form.birthday)
            },
            set: (value: string) => {
                dict.form.birthday = functions.basic.dateToTimestamp(value)
            }
        }),
        googleMapMounted: false,
        location: computed({
            get: (): any => {
                if (!dict.form.location) { return "" }
                return `${dict.form.location.lat.toFixed(3)}, ${dict.form.location.lng.toFixed(3)}`
            },
            set: (value: any) => {
                const newValue = value as types.locationType
                newValue.lat = parseFloat(newValue.lat.toFixed(3))
                newValue.lng = parseFloat(newValue.lng.toFixed(3))
                dict.form.location = newValue
            }
        }),
        files: [] as any[],
    },
    form: {
        username: '',
        sex: memory.SexIdentity.man,
        birthday: null as number | null,
        //location: { lat: 46.8182, lng: 8.2275 } as types.locationType,
        location: null as types.locationType | null,
        pictureURL: ''
    },
    rules: {
    },
    functions: {
        get12YearsAgoDate: () => {
            const date = new Date()
            date.setFullYear(date.getFullYear() - 12)
            return date
        },
        get40YearsAgoDate: () => {
            const date = new Date()
            date.setFullYear(date.getFullYear() - 40)
            return date
        },
        onSubmit: async () => {
            if (dict.tempData.files.length == 0) {
                return
            }

            functions.pages.loadingOn()

            try {
                const file = dict.tempData.files[0] as any
                const fileName = file?.file?.name
                const fileType = file?.file?.type
                const base64 = file?.content?.split(',')[1]
                const moralisFile = new memory.globalDict.moralis.File(fileName, { base64: base64 }, fileType);

                const result = await functions.maralis.createUserDetailInfo(dict.form.username, dict.form.sex, dict.form.birthday, dict.form.location, moralisFile)

                if (result) {
                    functions.basic.print("Your infomation is up to date now!\n\nLet's go explore!", async () => {
                        await functions.pages.switchBasedOnUserLoginStatus()
                    })
                } else {
                    functions.basic.print("Something wrong happened, please try again later.")
                }
            } catch (e) {
                functions.basic.log(e)
                functions.pages.loadingOff()
            }

            functions.pages.loadingOff()
        },
        clickMe: async () => {
            console.log("hi")
        }
    }
})

watch(() => {
    return dict.tempData.showLocationPickerWindow
}, (val: any) => {
    if (val === true) {
        if (dict.tempData.googleMapMounted === true) {
            return
        }
        setTimeout(() => {
            const theMapReference = unref(mapRef)
            const gmap = theMapReference?.map;

            gmap.addListener("click", (mapsMouseEvent: any) => {
                const theCenter = mapsMouseEvent.latLng.toJSON()
                dict.tempData.location = theCenter
                console.log(theCenter)
            });

            dict.tempData.googleMapMounted = true
        }, 1000)
    }
})

onBeforeMount(async () => {
    const user = functions.maralis.getCurrentUser()
    if (user) {
        const userDetail = await functions.maralis.getUserDetailInfo(user.id)
        const name = userDetail?.get("name") as string
        const sex = userDetail?.get("sex") as number
        const birthday = userDetail?.get("birthday") as number
        const location = userDetail?.get("location") as types.locationType
        const pictureURL = userDetail?.get("picture")?.url() as string | null

        dict.tempData.location = location
        dict.form.birthday = birthday

        dict.form.sex = sex
        dict.form.username = name
        if (pictureURL) {
            dict.tempData.files = [
                {
                    url: pictureURL
                }
            ]
        }
    }
})

onMounted(async () => {
})
</script>

<template>
    <div class="bigBackground">
        <div class="container">
            <!-- <van-button @click="dict.functions.clickMe">click me</van-button> -->
            <van-form :ref="formRef" @submit="dict.functions.onSubmit">
                <van-cell-group inset>
                    <van-field
                        v-model="dict.form.username"
                        name="Username"
                        label="Username"
                        placeholder="Username"
                        validate-trigger="onSubmit"
                        :rules="[{ required: true, message: 'Username is required' }]"
                    />

                    <van-field label="Sex">
                        <template #input>
                            <van-radio-group v-model="dict.form.sex" direction="horizontal">
                                <van-radio
                                    v-for="[key, value] in Object.entries(memory.SexIdentity)"
                                    :name="value"
                                >{{ key }}</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field
                        is-link
                        readonly
                        name="datetimePicker"
                        label="Birthday"
                        placeholder="Select time"
                        v-model="dict.tempData.birthday"
                        :rules="[{ required: true, message: 'Birthday is required' }]"
                        validate-trigger="onSubmit"
                        @click="dict.tempData.showBirthdayPickerWindow = true"
                    />
                    <van-popup
                        v-model:show="dict.tempData.showBirthdayPickerWindow"
                        position="bottom"
                    >
                        <van-datetime-picker
                            type="date"
                            :min-date="dict.functions.get40YearsAgoDate()"
                            :max-date="dict.functions.get12YearsAgoDate()"
                            @confirm="(value: string) => {
                                dict.tempData.birthday = value
                                dict.tempData.showBirthdayPickerWindow = false
                            }"
                            @cancel="dict.tempData.showBirthdayPickerWindow = false"
                        />
                    </van-popup>

                    <van-field
                        is-link
                        readonly
                        name="area"
                        label="Location"
                        placeholder="Select area"
                        v-model="dict.tempData.location"
                        :rules="[{ required: true, message: 'Location is required' }]"
                        validate-trigger="onSubmit"
                        @click="dict.tempData.showLocationPickerWindow = true"
                    />
                    <van-popup
                        v-model:show="dict.tempData.showLocationPickerWindow"
                        position="bottom"
                    >
                        <GoogleMap
                            ref="mapRef"
                            api-key="AIzaSyCmZ-Ovpm5TnO979Gd6PpIfbmvuIPbhV0U"
                            style="width: 100%; height: 500px"
                            :zoom="2"
                        >
                            <Marker :options="{ position: dict.form.location }" />
                        </GoogleMap>
                    </van-popup>

                    <van-field
                        name="uploader"
                        label="Selfie"
                        placeholder="Upload image"
                        v-model="dict.form.pictureURL"
                        :rules="[{ required: true, message: 'Selfie is required' }]"
                        validate-trigger="onSubmit"
                    >
                        <template #input>
                            <!-- export declare type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'; -->
                            <van-uploader
                                v-model="dict.tempData.files"
                                multiple
                                :max-count="1"
                                accept="image/*"
                                imageFit="none"
                                :before-delete="() => {
                                    dict.form.pictureURL = ''
                                    return true
                                }"
                                :maxSize="(file) => {
                                    const maxSize = 3 * 1024 * 1024; // 3MB
                                    return file.size >= maxSize;
                                }"
                            />
                            <!-- :after-read="dict.functions.afterReadImage" -->
                        </template>
                    </van-field>
                </van-cell-group>
                <van-row justify="center" class="submitButton">
                    <van-button
                        round
                        block
                        type="primary"
                        native-type="submit"
                        @click="formRef?.submit()"
                    >Submit</van-button>
                </van-row>
            </van-form>
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

    .submitButton {
        margin-top: 18px;
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