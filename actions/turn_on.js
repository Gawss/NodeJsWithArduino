
exports.turn_on = function (res, req) {

	const sendMsg_Arduino = require('../index')
	let cmdController = 'setOff';
	console.log('------->Turning On...');

	let message;
	//let quick_replies = [];
	let text = ' ';
	let command = ((typeof req.body.result.contexts === 'undefined' || req.body.result.contexts.length === 0) ? '' : req.body.result.contexts[0].parameters.cmd);
	
	//console.log(command)
	if(command === 'on'){
		console.log('Command "on" received');
		
		text = 'Ok, i will turn on the led!'

		cmdController = 'setOn';
		/*
		quick_replies = [
			{
			  content_type: "text",
			  title: 'Consultar saldo',
			  payload: "consulta_saldos"
			}
		]
		*/
	}
	if(command === 'off'){
		console.log('Command "off" received');
		text = 'Ok, i will turn off the led!'	

		cmdController = 'setOff';
	}
	if(command === 'toggle'){
		console.log('Command "toggle" received');
		cmdController = 'toggle';
		text = 'Ok, i will toggle the Led!'	
		
	}
	sendMsg_Arduino(cmdController);
	
	message = {
	  text: text
	  //, quick_replies: quick_replies
	}
  return res.json({
    speech: text,
    displayText: text,
    messages: message,
    source: 'turn_on'
  });
}