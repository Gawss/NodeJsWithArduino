const apiai = require('apiai');
const config = require('./config.js');//Module that returns the tokens.
const uuid = require('uuid');

//'use strict'

class chatBot_ {

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


	setupMenu(res) {
		var data = {
			persistent_menu: [
				{
					locale: "default",
					composer_input_disabled: false,
					"call_to_actions": [
						{
							"title": "Ayuda del chat",
							"type": "postback",
							"payload": "ayuda"
						},
						{
							"title": "Información de seguridad",
							"type": "postback",
							"payload": "informacion"
						}
					]
				}
			]
		};

		// Start the request
		request
		({
				url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
				qs: { access_token: config.facebook_token },
				method: 'POST',
				json: data
			},
			function (error, response, body) {
				if (!error && response.statusCode == 200)
				{
					// Print out the response body
					res.send(body);

				} else {
					// TODO: Handle errors
					res.send(body);
				}
		});
	}

}

module.exports = chatBot_