const five = require('johnny-five');

module.exports = class arduinoController{

    constructor(){
        this.led;
    }
    toggleLed(){
        this.led.toggle();
    }
    setUp_Arduino(){
        const board = new five.Board();
        board.on('ready', function() {
            // Create an Led on pin 13
            
            this.led = new five.Led(13);
    
        });
    }
}