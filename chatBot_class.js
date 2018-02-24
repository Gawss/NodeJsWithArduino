const apiai = require('apiai');
const config = require('./config.js');//Module that returns the tokens.

"use strict"

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

    callbackFacebookTransfer(id, message) {
        let k;

        this.sessionIds.forEach((value, key) => {
            if (value === id) {
                k = key;
            }
        });

        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: config.facebook_token },
            method: 'POST',
            json: {
                recipient: { id: k },
                message: message
            }
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });

    }

    callbackTransfer(text, id, accountFrom) {
        let k;

        this.sessionIds.forEach((value, key) => {
            if (value === id) {
                k = key;
            }
        });

        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: config.facebook_token },
            method: 'POST',
            json: {
                recipient: { id: k },
                message: {
                    attachment: {
                        type: "image",
                        payload: {
                            url: "https://chatbot-todo1.herokuapp.com/" + id + ".png"
                        }
                    }
                }
            }
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {

                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: { access_token: config.facebook_token },
                    method: 'POST',
                    json: {
                        recipient: { id: k },
                        message: {
                            text: "Deseas realizar alguna otra operación?",
                            quick_replies: [
                                {
                                    content_type: "text",
                                    title: "Saldo de " + accountFrom,
                                    payload: "saldo"
                                },
                                {
                                    content_type: "text",
                                    title: "Otra transferencia",
                                    payload: "transferencia"
                                },
                                {
                                    content_type: "text",
                                    title: "¿Qué más puedo hacer?",
                                    payload: "ayuda"
                                }
                            ]
                        }
                    }
                }, (error, response) => {
                    if (error) {
                        console.log('Error sending message: ', error);
                    } else if (response.body.error) {
                        console.log('Error: ', response.body.error);

                    }
                });

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
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
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

    setupAcountLinkingUrl(res) {
        var data = {
            account_linking_url: "https://chatbot-todo1.herokuapp.com/confirmAuth"
        };

        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
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

    findAccount(text, criterion) {

        let cuenta = listAccounts.accounts.find((element) => {
            return element.alias === text && element.propia === criterion
        });

        if (typeof cuenta === 'undefined') {
            cuenta = listAccounts.accounts.find((element) => {
                return element.type === text && element.propia === criterion
            });
        }

        if (typeof cuenta === 'undefined') {
            cuenta = listAccounts.accounts.find((element) => {
                return element.id === text && element.propia === criterion
            });
        }

        return cuenta;
    }

    listAccount(criterion) {

        let list = listAccounts.accounts.filter((element) => {
            return element.propia === criterion
        });

        return list;
    }

    getAccount(txt, criterion) {
        let list = listAccounts.accounts.filter((element) => {
            return element.id === txt && element.propia === criterion;
        });

        if (list.length === 0) {
            list = listAccounts.accounts.filter((element) => {
                return element.alias === txt && element.propia === criterion;
            });
        }

        if (list.length === 0) {
            list = listAccounts.accounts.filter((element) => {
                return element.type === txt && element.propia === criterion;
            });
        }

        return list;
    }

    listAccountDetail(id) {
        let listDetail = listAccounts.details.filter((element) => {
            return element.id === id
        });

        return listDetail;
    }

    listUser(user, pass){
        let listUser = listAccounts.users.find((element) => {
            return user === element.username && pass === element.password;
        });

        return listUser;
    }
}

module.exports = chatBot_