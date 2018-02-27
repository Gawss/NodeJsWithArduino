const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const uuid = require('uuid');
const apiai = require('apiai');
const fs = require('fs');
const text2png = require('text2png');

const config = require('./config.js');//Module that returns the tokens.
const transfer = require('./actions/transfer.js');
const balance = require('./actions/balance');
const session = require('./actions/session.js');
const accounts = require('./actions/accounts.js');
const movements = require('./actions/movements');
const listAccounts = require('./model.js');
const notifications = require('./actions/notifications.js');


const userMap = new Map();
var sessionIds = new Map();


class Todo1ChatBot {

    constructor() {
        this.apiaiApp = apiai(config.apiAI_token);
        this.sessionIds = new Map();
    }

    sendMessage(text, id) {

        if (!this.sessionIds.has(id)) {
            this.sessionIds.set(id, uuid.v4());
        }

        let apiai = this.apiaiApp.textRequest(text, {
            sessionId: this.sessionIds.get(id)
        });

        apiai.on('response', (response) => {
            console.log("req_message----->", response.result.fulfillment.messages);
            if (response.result.fulfillment.messages.length) {
                console.log("req_message----->1");
                this.callbackFacebook(id, { text: response.result.fulfillment.messages[0].speech });
            } else {
                console.log("req_message----->2");
                this.callbackFacebook(id, response.result.fulfillment.messages);
            }

        });

        apiai.on('error', (error) => {
            console.log(error);
        });

        apiai.end();

    }

    sendEvent(event, id) {

        if (!this.sessionIds.has(id)) {
            this.sessionIds.set(id, uuid.v4());
        }

        let ev = {
            name: event
        };

        let apiai = this.apiaiApp.eventRequest(ev, {
            sessionId: this.sessionIds.get(id) // use any arbitrary id
        });


        apiai.on('response', (response) => {
            console.log("req_event----->", response.result.fulfillment.messages);
            if (response.result.fulfillment.messages.length) {
                console.log("req_event----->1");
                this.callbackFacebook(id, { text: response.result.fulfillment.messages[0].speech });
            } else {
                console.log("req_event----->2");
                this.callbackFacebook(id, response.result.fulfillment.messages);
            }

        });

        apiai.on('error', (error) => {
            console.log(error);
        });

        apiai.end();

    }

    cancelContext(sessionId){
        request({
            url: 'https://api.api.ai/v1/query?v=' + config.v,
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + config.apiAI_developer_token
            },
            json: true,
            body: {
                query: "cancelar",
                sessionId: sessionId,
                lang: 'es',
                resetContexts: true,
            }
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                console.log('response-------->', response.body);
            }
        });
    }

    callbackFacebook(id, menssage) {

        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: config.facebook_token },
            method: 'POST',
            json: {
                recipient: { id: id },
                message: menssage
            }
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });

    }

    userInfoRequest(userId) {
        console.log('userInfoRequest-userId', userId);

        return new Promise((resolve, reject) => {

            request({
                method: 'GET',
                uri: "https://graph.facebook.com/v2.6/" + userId + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + config.facebook_token
            }, function (error, response) {
                if (error) {
                    console.error('Error while userInfoRequest: ', error);
                    reject(error);
                } else {
                    var obj = JSON.parse(response.body);
                    resolve(obj);
                }
            });
        });

    }

    setupGetStartedButton(res) {
        var data = {
            setting_type: "call_to_actions",
            thread_state: "new_thread",
            call_to_actions: [
                {
                    payload: "getStarted"
                }
            ]
        };

        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/thread_settings',
            qs: { access_token: config.facebook_token },
            method: 'POST',
            json: data
        },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // Print out the response body
                    res.send(body);

                } else {
                    // TODO: Handle errors
                    res.send(body);
                }
            });
    }
}

let todo1ChatBot = new Todo1ChatBot();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('resources'));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
    console.log("funciona------> get", __dirname);
});

//--- For Facebook Validation ---
app.get('/webhook', (req, res) => {
    console.log("get----->");
    /*
	if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'GawssToken') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
		//Must be 500 error ??
    }
	*/
	
	//----------------------------------------------------------------
	let VERIFY_TOKEN = "GawssToken";
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
	
	  if (mode && token) {

		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			// Responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);

		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);      
		}
	}
});


app.get('/', (req, res) => {
    console.log("get /----->");
    //res.status(200).send("correcto");
    res.send('Hu3');
});

/* For Facebook Validation */
/* Handling all messenges entered by the user */
app.post('/webhook', (req, res) => {
	
	/*
    console.log("post----->");
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                userMap.set("sender", event.sender.id);
                console.log("event");
                console.log(event);
                if (event.message && event.message.text) {
                    todo1ChatBot.sendMessage(event.message.text, event.sender.id.toString());
                } else if (event.message && event.message.sticker_id) {
                    todo1ChatBot.sendMessage(event.message.sticker_id, event.sender.id.toString());
                }else if (event.message && event.message.attachments) {
                    todo1ChatBot.sendMessage(event.message.attachments, event.sender.id.toString());
                } else if (event.postback && event.postback.payload === 'getStarted') {
                    todo1ChatBot.sendMessage(event.postback.payload, event.sender.id.toString());
                } else{
                    todo1ChatBot.sendEvent(event.postback.payload, event.sender.id.toString());
                }

            });
        });
        res.status(200).end();
    }
	*/
	//------------------------https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup
	
	let body = req.body;
	
	if(body.object === 'page'){
		body.entry.forEach(function(entry){
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);
		});
		res.status(200).send('EVENT_RECEIVED');
	}else{
		res.sendStatus(404);
	}
	
});

/* Webhook for API.ai to get response from the 3rd party API */
app.post('/ai', (req, res) => {
    console.log('*** Webhook for api.ai ***');
    console.log(req.body.result);

    //general variables for every action//
    let action = req.body.result.action;
    let sessionId = req.body.sessionId;

    console.log(req.body.result.contexts.length);
    let confir = ((typeof req.body.result.contexts === 'undefined' || req.body.result.contexts.length === 0) ? '' : req.body.result.contexts[0].parameters.confirm);
    //let t = ((typeof req.body.result.fulfillment.messages[0].speech === 'undefined') ? req.body.result.fulfillment.messages.text : req.body.result.fulfillment.messages[0].speech);

    let quick_replies = [];
    let error = false;
    //---------------------------------//

    switch (action) {
//-----------------------------------------------------------------------------
		case 'notificaciones':
            console.log("hola notificaciones");			
			
            notifications.notifications(res, req);
			console.log('--------------switch end----------------');
            break;
	}
	
//-----------------------------------------------------------------------------
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