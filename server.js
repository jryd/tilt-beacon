const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/', express.static('dist'))

const server = app.listen(8080, function() {
    console.log('Server running on port 8080')
});

const io = require('socket.io')(server);

let tilt = {
    "A495BB10-C5B1-4B44-B512-1370F02D74DE": "Red",
    "A495BB20-C5B1-4B44-B512-1370F02D74DE": "Green",
    "A495BB30-C5B1-4B44-B512-1370F02D74DE": "Black",
    "A495BB40-C5B1-4B44-B512-1370F02D74DE": "Purple",
    "A495BB50-C5B1-4B44-B512-1370F02D74DE": "Orange",
    "A495BB60-C5B1-4B44-B512-1370F02D74DE": "Blue",
    "A495BB70-C5B1-4B44-B512-1370F02D74DE": "Yellow",
    "A495BB80-C5B1-4B44-B512-1370F02D74DE": "Pink"
};

const Noble = require('noble')
const BeaconScanner = require('node-beacon-scanner')

let scanner = new BeaconScanner()

scanner.onadvertisement = (advertisement) => {
    let beacon = advertisement["iBeacon"]
    beacon.rssi = advertisement["rssi"]

    if (tilt[beacon.uuid] != null) {
        let data = {
            colour: tilt[beacon.uuid],
            temperature: beacon.major,
            gravity: beacon.minor / 1000,
            rssi: beacon.rssi,
            key: tilt[beacon.uuid].toString() + beacon.major.toString() + (beacon.minor / 1000).toString() + beacon.rssi.toString(),
            datetime: new Date()
        }

        io.emit('readingReceived', data)
        console.log(JSON.stringify(data, null, '    '))
    }
}

scanner.startScan()
    .then(() => {
        console.log("Starting to scan for devices...")
    })
    .catch((error) => {
        console.log(error)
    })