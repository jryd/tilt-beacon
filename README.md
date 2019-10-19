# Tilt Beacon

A codebase allowing to receive beacon calls from Tilt devices.

## Installation

To install the required dependencies, run `sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev`

## Running

Run `node server.js` to start the application.

This will spin up an HTTP server to serve the application in a local browser, as well as starting the bluetooth
listener to listen for calls from any Tilt devices and broadcast them to the webpage with web sockets.