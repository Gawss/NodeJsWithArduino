const bodyParser = require('body-parser');
const request = require('request');
const uuid = require('uuid');
const fs = require('fs');
var showmsg = 'hu3';
//------------------------------------------------------------------- SERVER WORKING...
const express = require('express');
const app = express();

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
    console.log("funciona------> get", __dirname);
});

app.get('/', (req, res) => {
    console.log("get /----->");
    //res.status(200).send("correcto");
    res.send('Chatbot --- Created');
	res.send(showmsg);
});

//-------------------------------------------------------------------

const userMap = new Map();
var sessionIds = new Map();

'use strict';
var chatBot_ = require("./chatBot_class.js");
var chatBot = new chatBot_();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('resources'));

app.get('/sendmsg', (req, res) => {
  response = "This is a sample response from your webhook!" //Default response from the webhook to show it's working

  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(JSON.stringify({ "speech": response, "displayText": response
  //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
});

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
    console.log("get----->");
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'todo_test') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
		//Must be 500 error ??
    }
});

/* For Facebook Validation */
/* Handling all messenges entered by the user */
app.post('/webhook', (req, res) => {
    console.log("post----->");
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                userMap.set("sender", event.sender.id);
                console.log("event");
                console.log(event);
                if (event.message && event.message.text) {
                    chatBot.sendMessage(event.message.text, event.sender.id.toString());
                } else if (event.message && event.message.sticker_id) {
                    chatBot.sendMessage(event.message.sticker_id, event.sender.id.toString());
                }else if (event.message && event.message.attachments) {
                    chatBot.sendMessage(event.message.attachments, event.sender.id.toString());
                } else if (event.postback && event.postback.payload === 'getStarted') {
                    chatBot.sendMessage(event.postback.payload, event.sender.id.toString());
                }else{
                    chatBot.sendEvent(event.postback.payload, event.sender.id.toString());
                }

            });
        });
        res.status(200).end();
    }
});

//---------------------------------------------------------------------

/* Webhook for API.ai to get response from the 3rd party API */
app.post('/ai', (req, res) => {
    console.log('*** Webhook for api.ai ***');
    console.log(req.body.result);

    // Validate if user has type unless one time the password: for now with LOCAL STORAGE//
    // -------------------------------------------------------------------------------- //

    //general variables for every action//
    let action = req.body.result.action;
    let sessionId = req.body.sessionId;

    let quick_replies = [];
    let error = false;

	let message;
	let text = ' ';
    //---------------------------------//

    switch (action) {
//-----------------------------------------------------------------------------
		case 'question':
            console.log('recived');
			showmsg = 'msg recived';
			let lol = ((typeof req.body.result.contexts === 'undefined' || req.body.result.contexts.length === 0) ? '' : req.body.result.contexts[0].parameters.quest);			
			if(lol === 'lol'){
				showmsg = 'lol recived';
				console.log("lol recived");
				text = 'lol recived - hu3'
			}
			else{
				showmsg = 'lol wasnt recived';
				console.log("lol wasnt recived");
				text = 'fak u'
			}

			message = {
			  text: text
			}
			return res.json({
				speech: text,
				displayText: text,
				messages: message,
				source: 'question'
			});
            //notifications.notifications(res, req);
            break;
		
//-----------------------------------------------------------------------------
    }
	response = "This is a sample response from your webhook!" //Default response from the webhook to show it's working

	res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
	res.send(JSON.stringify({ "speech": response, "displayText": response
	//"speech" is the spoken version of the response, "displayText" is the visual version
	}));

});

function cleanedString(data) {
    data = data.replace(/á/gi, "a");
    data = data.replace(/é/gi, "e");
    data = data.replace(/í/gi, "i");
    data = data.replace(/ó/gi, "o");
    data = data.replace(/ú/gi, "u");
    data = data.replace(/ñ/gi, "n");

    return data;

}

function formatDate(date) {
    var monthNames = [
        "enero", "Febrero", "Marzo",
        "abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre",
        "Novimbre", "Dicimbre"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function formatTime(date) {

    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();

    if(hours.length === 1){
        hours = "0"+hours;
    }

    if(minutes.length === 1){
        minutes = "0"+minutes;
    }

    if(seconds.length === 1){
        seconds = "0"+seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
}

Number.prototype.format = function(n, x, s, c) {
    var number = parseInt(this);
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = number.toFixed(Math.max(0, ~~n));
    
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}






