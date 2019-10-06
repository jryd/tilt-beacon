window.axios = require('axios');
window.Vue = require('vue');

import Toasted from 'vue-toasted'
Vue.use(Toasted, {
    iconPack: 'material' // set your iconPack, defaults to material. material|fontawesome|custom-class
})

import io from 'socket.io-client';
import Tilt from './components/Tilt.vue'

import saveState from 'vue-save-state';
import { isEmpty } from 'lodash'

const app = new Vue({
    el: '#app',

    components: {
        Tilt,
    },

    mixins: [saveState],

    data: {
        socket: io('localhost:8080'),

        tilts: {
            Yellow: {},
            Red: {},
            Green: {},
            Black: {},
            Purple: {},
            Orange: {},
            Blue: {},
            Pink: {}
        },

        preferenceMenuOpen: false,

        preferences: {
            title: 'Tilt Monitor',
            temperature: 'C',
            cloud_logging_default_url: '',
            cloud_logging_default_interval: null,
        },
    },

    mounted() {
        this.socket.on('readingReceived', (data) => {
            this.tilts[data.colour] = data
        });

        // Uncomment the below for testing
        this.testing()
    },

    computed: {
        /* activeTilts() {
            this.tilts.array.forEach(element => {
                let active = 0

                Object.keys(this.tilts).forEach((key) => {
                    if (!isEmpty(this.tilts[key])) active++
                })

                return active
            });
        } */
    },

    methods: {
        testing() {
            this.tilts = {
                Yellow: {
                    colour: 'Yellow',
                    temperature: 65,
                    gravity: 1.009,
                    rssi: -50,
                    key: 'Yellowtesting',
                    datetime: new Date()
                },
                Red: {
                    colour: 'Red',
                    temperature: 60,
                    gravity: 1.049,
                    rssi: -46,
                    key: 'Redtesting',
                    datetime: new Date()
                },
                Green: {
                    colour: 'Green',
                    temperature: 95,
                    gravity: 1.030,
                    rssi: -84,
                    key: 'Greentesting',
                    datetime: new Date()
                },
                Black: {
                    colour: 'Black',
                    temperature: 32,
                    gravity: 1.009,
                    rssi: -83,
                    key: 'Blacktesting',
                    datetime: new Date()
                },
                Purple: {
                    colour: 'Purple',
                    temperature: 94,
                    gravity: 1.021,
                    rssi: -71,
                    key: 'Purpletesting',
                    datetime: new Date()
                },
                Orange: {
                    colour: 'Orange',
                    temperature: 57,
                    gravity: 1.009,
                    rssi: -69,
                    key: 'Orangetesting',
                    datetime: new Date()
                },
                Blue: {
                    colour: 'Blue',
                    temperature: 44,
                    gravity: 1.009,
                    rssi: -42,
                    key: 'Bluetesting',
                    datetime: new Date()
                },
                Pink: {
                    colour: 'Pink',
                    temperature: 26,
                    gravity: 1.009,
                    rssi: -82,
                    key: 'Pinktesting',
                    datetime: new Date()
                }
            }
        },
        disconnected(colour) {
            this.tilts[colour] = {}
        },
        getSaveStateConfig() {
            return {
                'cacheKey': 'tilts',
                'saveProperties': ['preferences', 'preferenceMenuOpen'],
            };
        },
    }
});