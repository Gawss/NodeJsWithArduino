const Accounts = require('../modelAccounts');

exports.notifications = function (res, req) {
	console.log('------->notifications');

	let message;
	let quick_replies = [];
	let text = ' ';
	let quest = ((typeof req.body.result.contexts === 'undefined' || req.body.result.contexts.length === 0) ? '' : req.body.result.contexts[0].parameters.quest);
	//let sessionId = req.body.sessionId;
	//let j = schedule.scheduleJob('/10 * * * * *', function(){console.log('The answer to life, the universe, and everything!');});
	
	if(quest === 'lol'){
		console.log("lol");
		//console.log("SESSION_ID---------------------------->", sessionId);
		//let j = schedule.scheduleJob('*/10 * * * * *', function(){Accounts.callbackFacebook(sessionId, "Esto es una notificacion de prueba")});
		text = 'looooool'
		
		quick_replies = [
			{
			  content_type: "text",
			  title: 'Consultar saldo',
			  payload: "consulta_saldos"
			},
			{
			  content_type: "text",
			  title: 'Bloquear cuenta',
			  payload: "bloquear_cuenta"
			}
		]
	}
	if(quest === 'ok'){
		console.log("ok");
		text = 'okkkkkkkkkkkk'	
		quick_replies = [
			{
			  content_type: "text",
			  title: '¿Qué más puedo hacer?',
			  payload: "ayuda"
			}
		]

	}
	
	message = {
	  text: text,
	  quick_replies: quick_replies
	}
	console.log("cualquier cosa");
	return res.json({
		speech: text,
		displayText: text,
		messages: message,
		source: 'notificaciones'
	});
}