const request = require('request');
const config = require('./config');

function callbackFacebook(id, menssage) {
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

module.exports = {
  callbackFacebook: callbackFacebook
};