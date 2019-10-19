<template>
    <div class="w-full md:w-1/2 lg:w-1/3 px-2 pb-4" >
        <div class="max-w-sm rounded overflow-hidden shadow-lg p-4 relative bg-lighten-up" :class="gradientClass">
            <div class="absolute bg-transparent-backdrop flex flex-col h-full items-center justify-center pin-l pin-t w-full z-10" v-if="disconnected">
                <i class="fas fa-exclamation-triangle fa-5x opacity-100 z-20 text-red block mb-2"></i>
                <p class="text-red text-xl font-bold">Disconnected</p>
            </div>
            <div class="flex w-full justify-between items-center">
                <div class="text-xl">
                    <span v-if="configuration.cloudLogging.name">{{ configuration.cloudLogging.name }}</span>
                    <span v-else>{{ data.colour }}</span>
                </div>
                <div>
                    <button class="focus:outline-none" @click="showModal = true"><i class="far fa-edit"></i></button>
                </div>
            </div>
            <div>
                <div class="flex justify-center items-center my-32">
                    <div class="flex items-center text-left justify-center relative">
                        <div class="absolute items-center opacity-12" style="font-size:10em">
                            <i class="fas fa-ruler-vertical" :style="tiltOrientationClass"></i>
                        </div>
                        <div class="absolute flex flex-grow items-start">
                            <div class="text-5xl tracking-tight mr-2">
                                {{ gravity }}
                            </div>
                            <div class="text-sm">
                                gravity
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center text-left">
                        <div class="flex-no-grow mr-2">
                            <i class="fas fa-thermometer-three-quarters"></i>
                        </div>
                        <div class="flex flex-grow items-start">
                            <div class="text-3xl tracking-tight mr-1">
                                {{ temperature }}
                            </div>
                            <div class="text-sm">
                                &deg; {{ preferences.temperature }}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center text-left">
                        <div class="flex-no-grow mr-2">
                            <i class="fas fa-signal"></i>
                        </div>
                        <div class="flex flex-grow items-start">
                            <div class="text-3xl tracking-tight mr-2">
                                {{ data.rssi }}
                            </div>
                            <div class="text-sm">
                                dBm
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center text-left">
                        <div class="flex-no-grow mr-2">
                            <i :class="loggingClass"></i>
                        </div>
                        <div class="flex flex-grow items-start">
                            <div class="text-3xl tracking-tight mr-2">
                                <span v-if="configuration.cloudLogging.enabled">On</span>
                                <span v-else>Off</span>
                            </div>
                            <!-- <div class="text-sm">
                                <span v-if="cloudLogging.enabled">Off</span>
                                <span v-else>Logging Disabled</span>
                            </div> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Modal
            :show="showModal"
            :configuration="configuration"
            :tilt="tiltColour"
            :rawTemp="uncalibratedTemperature"
            :rawGravity="data.gravity"
            v-model="configuration"
            @close="showModal = false"
            @saved="updateConfiguration"
        ></Modal>
    </div>
</template>

<script>
    import '../../node_modules/material-icons/iconfont/material-icons.scss'

    import Modal from './Modal.vue'


    import differenceInSeconds from 'date-fns/difference_in_seconds'

    import saveState from 'vue-save-state'

    export default {
        props: [
            'data',
            'preferences',
        ],

        components: {
            Modal,
        },

        mixins: [
            saveState
        ],

        data() {
            return {
                editing: false,

                disconnected: false,

                configuration: {
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
                },

                showModal: false
            }
        },

        mounted() {
            if (this.preferences.cloud_logging_default_url && !this.configuration.cloudLogging.url) {
                this.configuration.cloudLogging.url = this.preferences.cloud_logging_default_url
            }

            if (this.preferences.cloud_logging_default_interval && !this.configuration.cloudLogging.interval) {
                this.configuration.cloudLogging.interval = this.preferences.cloud_logging_default_interval
            }

            // setInterval(() => {
            //     let difference = differenceInSeconds(new Date(), this.data.datetime)
            //     this.disconnected =  difference > 20;
            //     if (difference > 60) {
            //         this.$emit('disconnected', this.data.colour)
            //     }

            // }, 1000);

            if (this.configuration.cloudLogging.enabled && this.canLog) {
                this.startLogging()
            } else {
                this.configuration.cloudLogging.enabled = false
            }
        },

        computed: {
            tiltColour() {
                return this.data.colour
            },
            gradientClass() {
                // return 'bg-' + this.data.colour.toLowerCase() + '-gradient'
                return `bg-${this.tiltColour.toLowerCase()}`
            },
            signalClass() {
                if (this.data.rssi >= -30) {
                    return 'far fa-signal'
                } else if (this.data.rssi < -30 && this.data.rssi >= -67) {
                    return 'far fa-signal-4'
                } else if (this.data.rssi < -67 && this.data.rssi >= -70) {
                    return 'far fa-signal-3'
                } else if (this.data.rssi < -70 && this.data.rssi >= -80) {
                    return 'far fa-signal-2'
                } else {
                    return 'far fa-signal-1'
                }
            },
            tiltOrientationClass() {
                // return 'transform: rotate(-' + (((this.data.gravity - 1) * 1000) / 2.83) + 'deg)'

                let restingDeg = 25 //the angle that the tilt will be at 1.000 SG
                return `transform: rotate(-${(((this.data.gravity - 1) * 1000) / 3.92) + restingDeg}deg)`
            },
            loggingClass() {
                if (!this.configuration.cloudLogging) return
                return this.configuration.cloudLogging.enabled ? 'fas fa-cloud-upload-alt' : 'fas fa-cloud'
            },
            temperature() {
                let temp = parseFloat(this.preferences.temperature == 'F' ? this.data.temperature : ((this.data.temperature - 32) * (5/9)).toFixed(1))

                if (this.configuration.calibration.temperature != null || this.configuration.calibration.temperature != 0) {
                    temp += this.configuration.calibration.temperature
                }

                return temp
            },
            uncalibratedTemperature() {
                return parseFloat(this.preferences.temperature == 'F' ? this.data.temperature : ((this.data.temperature - 32) * (5/9)).toFixed(1))
            },
            gravity() {
                let gravity = this.data.gravity

                if (this.configuration.calibration.gravity != null || this.configuration.calibration.gravity != 0) {
                    gravity += this.configuration.calibration.gravity
                }

                return gravity.toFixed(3)
            },
            canLog() {
                return !(this.configuration.cloudLogging.url == null || this.configuration.cloudLogging.url == '' || this.configuration.cloudLogging.name == null || this.configuration.cloudLogging.name == '' || this.configuration.cloudLogging.interval == null || this.configuration.cloudLogging.interval == '' || this.configuration.cloudLogging.interval < 15)
            },
            thingspeakURL() {
                return `https://api.thingspeak.com/update?api_key=${this.configuration.cloudLogging.url}&field1=${this.gravity}&field2=${this.temperature}`
            }
        },

        methods: {
            edit() {
                this.editing = true
            },

            postConfigurationSave() {
                if (this.configuration.cloudLogging.enabled) {
                    let earlyReturn = false

                    if (this.configuration.cloudLogging.url == null || this.configuration.cloudLogging.url == '') {
                        this.$toasted.error('You need to set a cloud URL.', {
                            icon: 'warning',
                            theme: 'primary',
                            position: 'top-right',
                            duration: 5000
                        })

                        this.configuration.cloudLogging.enabled = false
                        earlyReturn = true
                    }

                    if (this.configuration.cloudLogging.name == null || this.configuration.cloudLogging.name == '') {
                        this.$toasted.error('You need to set a beer name.', {
                            icon: 'warning',
                            theme: 'primary',
                            position: 'top-right',
                            duration: 5000
                        })

                        this.configuration.cloudLogging.enabled = false
                        earlyReturn = true
                    }

                    if (this.configuration.cloudLogging.interval == null || this.configuration.cloudLogging.interval == '') {
                        this.$toasted.error('You need to set a logging interval.', {
                            icon: 'warning',
                            theme: 'primary',
                            position: 'top-right',
                            duration: 5000
                        })

                        this.configuration.cloudLogging.enabled = false
                        earlyReturn = true
                    } else if (this.configuration.cloudLogging.interval < 15) {
                        this.$toasted.error('Your logging interval cannot be lower than 15.', {
                            icon: 'warning',
                            theme: 'primary',
                            position: 'top-right',
                            duration: 5000
                        })

                        this.configuration.cloudLogging.enabled = false
                        earlyReturn = true
                    }

                    if (earlyReturn) return false;

                    this.startLogging()

                    this.$toasted.success('Cloud logging has been enabled.', {
                        icon: 'check',
                        theme: 'primary',
                        position: 'top-right',
                        duration: 5000
                    })
                }

                if (this.configuration.cloudLogging)
                this.editing = false
            },

            log() {
                this.$toasted.info('Sending Tilt data to the cloud...', {
                    icon: {
                        name: 'autorenew'
                    },
                    theme: 'primary',
                    position: 'top-right',
                    duration: 5000
                })
                /* axios.post(this.configuration.cloudLogging.url, {
                    temperature: this.temperature,
                    uncalibrated_temperature: this.uncalibratedTemperature,
                    specific_gravity: this.gravity,
                    uncalibrated_specific_gravity: this.data.gravity / 1000,
                    name: this.configuration.cloudLogging.name
                }).
                then(() => {
                    this.$toasted.success('Tilt data was successfully sent to the cloud.', {
                        icon: 'check',
                        theme: 'primary',
                        position: 'top-right',
                        duration: 5000
                    })
                }).
                catch((error) => {
                    this.$toasted.error('There was an issue sending Tilt data to the cloud.', {
                        icon: 'report_problem',
                        theme: 'primary',
                        position: 'top-right',
                        duration: 5000
                    })
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(`The cloud logging server responded with a status code, ${error.response.status}: ${error.response.data}`);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(`The request was made to the cloud logging server, but no response was received: ${error.request}`);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log(`Something else went completely wrong when setting up the request to be made: ${error.message}`);
                    }
                }) */

                axios.get(this.thingspeakURL)
                    .then(() => {
                        this.$toasted.success('Tilt data was successfully sent to the cloud.', {
                            icon: 'check',
                            theme: 'primary',
                            position: 'top-right',
                            duration: 5000
                        })
                    }).catch((error) => {
                        this.$toasted.error('There was an issue sending Tilt data to the cloud.', {
                            icon: 'report_problem',
                            theme: 'primary',
                            position: 'top-right',
                            duration: 5000
                        })
                        if (error.response) {
                            // The request was made and the server responded with a status code
                            // that falls out of the range of 2xx
                            console.log(`The cloud logging server responded with a status code, ${error.response.status}: ${error.response.data}`);
                        } else if (error.request) {
                            // The request was made but no response was received
                            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                            // http.ClientRequest in node.js
                            console.log(`The request was made to the cloud logging server, but no response was received: ${error.request}`);
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            console.log(`Something else went completely wrong when setting up the request to be made: ${error.message}`);
                        }
                    })
            },

            startLogging() {
                // Immediately log some data and then setup the interval
                this.log()
                this.configuration.cloudLogging.dispatcher = setInterval(this.log, this.configuration.cloudLogging.interval * 60 * 1000)
            },

            getSaveStateConfig() {
                return {
                    'cacheKey': `tilt-${this.data.colour}`,
                    'saveProperties': ['configuration'],

                };
            },

            setUrlToPreference() {
                if (!this.preferences.cloud_logging_default_url) {
                    this.$toasted.info('You have no preference set for a cloud logging URL.')
                    return false
                }

                this.configuration.cloudLogging.url = this.prefernece.cloud_logging_default_url
            },

            setIntervalToPreference() {
                if (!this.preferences.cloud_logging_default_interval) {
                    this.$toasted.error('You have no preference set for a cloud logging interval.')
                    return false
                }

                this.configuration.cloudLogging.interval = this.prefernece.cloud_logging_default_interval
            },

            updateConfiguration(newConfiguration) {
                this.configuration = JSON.parse(JSON.stringify(newConfiguration))
                this.showModal = false
                this.postConfigurationSave()
            }
        },
    }
</script>
