<template>
    <transition name="fade">
        <div class="pin fixed flex items-center justify-center bg-transparent-black z-50" @click="close" v-show="show">
            <div
                class="relative rounded shadow p-8 m-4 min-w-sm max-w-lg max-h-full overflow-y-auto"
                :class="background"
                @click.stop
            >
                <div class="absolute pin-t pin-r mr-4 mt-4">
                    <button @click="close"><i class="fas fa-times"></i></button>
                </div>
                <div class="mb-8">
                    <div class="mt-4">
                        <div class="mb-12">
                            <h2 class="font-bold border-b-2 border-black inline-block mb-8">Calibration</h2>
                            <div class="flex justify-around items-center">
                                <div class="flex justify-center flex-1 border-r-2 border-black">
                                    <div class="flex justify-center items-center">
                                        <span
                                            class="fa-stack modal-control cursor-pointer hover:enlarge"
                                            style="vertical-align: top;"
                                            @click="localConfiguration.calibration.temperature = Number((localConfiguration.calibration.temperature - 0.1).toFixed(1))"
                                        >
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fas fa-minus fa-stack-1x" :class="'text-' + tilt.toLowerCase()"></i>
                                        </span>

                                        <p class="text-3xl tracking-tight mx-2">
                                            {{ calibratedTemperature }}&deg;
                                        </p>

                                        <span
                                            class="fa-stack modal-control cursor-pointer hover:enlarge"
                                            style="vertical-align: top;"
                                            @click="localConfiguration.calibration.temperature = Number((localConfiguration.calibration.temperature + 0.1).toFixed(1))"
                                        >
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fas fa-plus fa-stack-1x" :class="'text-' + tilt.toLowerCase()"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="flex justify-center flex-1">
                                    <div class="flex justify-center items-center">
                                        <span
                                            class="fa-stack modal-control cursor-pointer hover:enlarge"
                                            style="vertical-align: top;"
                                            @click="localConfiguration.calibration.gravity = Number((localConfiguration.calibration.gravity - 0.001).toFixed(3))"
                                        >
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fas fa-minus fa-stack-1x" :class="'text-' + tilt.toLowerCase()"></i>
                                        </span>

                                        <p class="text-black text-3xl tracking-tight mx-2">
                                            {{ calibratedGravity }}
                                        </p>

                                        <span
                                            class="fa-stack modal-control cursor-pointer hover:enlarge"
                                            style="vertical-align: top;"
                                            @click="localConfiguration.calibration.gravity = Number((localConfiguration.calibration.gravity + 0.001).toFixed(3))"
                                        >
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fas fa-plus fa-stack-1x" :class="'text-' + tilt.toLowerCase()"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-around items-center mb-4">
                                <div class="border-r-2 border-black flex-1 text-center pt-2">
                                    <small
                                        v-if="localConfiguration.calibration.temperature"
                                    >Uncalibrated temperature is {{ this.rawTemp }}</small>
                                </div>
                                <div class="flex-1 text-center pt-2">

                                    <small
                                        v-if="localConfiguration.calibration.gravity"
                                    >Uncalibrated gravity is {{ this.rawGravity }}</small>
                                </div>
                            </div>
                        </div>
                        <div class="">
                            <h2 class="font-bold border-b-2 border-black inline-block mb-8 pb-1">Cloud Logging</h2>

                            <div class="flex items-center -mx-2 mb-3">
                                <div class="mx-2 w-3/5">
                                    <label class="block mb-1 pr-4" for="inline-full-name">
                                        Beer Name
                                    </label>
                                    <input class="block bg-transparent-60 appearance-none border-2 border-transparent rounded w-full py-2 px-4 leading-tight focus:shadow-md focus:outline-none"
                                        type="text"
                                        placeholder="Summer Ale"
                                        v-model="localConfiguration.cloudLogging.name"
                                    >
                                </div>
                                <div class="mx-2 w-2/5">
                                    <label class="block mb-1 pr-4" for="inline-full-name">
                                        Interval
                                    </label>
                                    <input class="block bg-transparent-60 appearance-none border-2 border-transparent rounded w-full py-2 px-4 leading-tight focus:shadow-md focus:outline-none"
                                        type="number"
                                        placeholder="Anything > 15"
                                        min="15"
                                        step="1"
                                        v-model="localConfiguration.cloudLogging.interval"
                                    >
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="block mb-1 pr-4" for="inline-full-name">
                                    URL
                                </label>
                                <input class="block bg-transparent-60 appearance-none border-2 border-transparent rounded w-full py-2 px-4 leading-tight focus:shadow-md focus:outline-none"
                                    type="text"
                                    placeholder="e.g https://brew.grainfather.com/iot/{your-device-id}/tilt"
                                    v-model="localConfiguration.cloudLogging.url"
                                >
                                <!-- <button class="text-sm underline pt-1 pl-1" v-if="preferences.cloud_logging_default_url" @click="setUrltoPreference">Use url from preferences</button> -->
                            </div>

                            <div class="mb-2">
                                <label class="block mb-1" for="inline-full-name">
                                    Status
                                </label>
                                <input type="checkbox" class="pr-4" v-model="localConfiguration.cloudLogging.enabled">
                                <span v-if="localConfiguration.cloudLogging.enabled">Enabled</span>
                                <span v-else>Disabled</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-end">
                    <button class="text-white py-2 px-4 rounded" :class="'bg-'+tilt.toLowerCase()+'-darker hover:bg-'+tilt.toLowerCase()+'-darkest'" @click="save()">
                        Save
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>

export default {
    props: {
        show: {
            type: Boolean,
            required: true
        },
        configuration: {
            type: Object,
            required: true
        },
        tilt: {
            type: String,
            required: true
        },
        rawTemp: {
            type: Number,
            required: true
        },
        rawGravity: {
            type: Number,
            required: true
        },
        value: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            localConfiguration: {
                cloudLogging: {
                    enabled: false,
                    url: '',
                    name: '',
                    interval: null,
                    dispatcher: null,
                },

                calibration: {
                    temperature: 0,
                    gravity: 0
                },
            }
        }
    },

    mounted() {
        document.addEventListener("keydown", (key) => {
            if (this.show && key.keyCode == 27) {
                this.close();
            }
        })

        this.localConfiguration = JSON.parse(JSON.stringify(this.configuration))
    },

    computed: {
        background() {
            return `bg-${this.tilt.toLowerCase()}`
        },
        calibratedTemperature() {
            return (this.rawTemp + this.localConfiguration.calibration.temperature).toFixed(1)
        },
        calibratedGravity() {
            return (this.rawGravity+ this.localConfiguration.calibration.gravity).toFixed(3)
        },
    },

    methods: {
        close() {
            this.$emit('close')
        },

        save() {
            this.$emit('saved', this.localConfiguration)
        },
    }
}

</script>

<style>

</style>
