
exports.play_music = function (res, req) {

	const sendMsg_Arduino = require('../index')
	let cmdController = 'never gonna give you up';
	console.log('------->Turning On...');

	let message;
	//let quick_replies = [];
	let text = ' ';
	let command = ((typeof req.body.result.contexts === 'undefined' || req.body.result.contexts.length === 0) ? '' : req.body.result.contexts[0].parameters.song);
	
	console.log('Command: ' + command);
	if(command !== 'never gonna give you up'){
		console.log('Command "on" received');
		
		text = 'Ok, i will play ' + command.toString();

		cmdController = command.toString();

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
    source: 'play_music'
  });
}