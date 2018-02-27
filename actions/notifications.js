const Accounts = require('../modelAccounts');

exports.notifications = function (res, req) {
	console.log('------->notifications');

	let message;
	let quick_replies = [];
	let text = ' ';
	let confir = ((typeof req.body.result.contexts === 'undefined' || req.body.result.contexts.length === 0) ? '' : req.body.result.contexts[0].parameters.answer);
	//let sessionId = req.body.sessionId;
	//let j = schedule.scheduleJob('/10 * * * * *', function(){console.log('The answer to life, the universe, and everything!');});
	
	if(confir === 'lol'){
		console.log("looool");
		//console.log("SESSION_ID---------------------------->", sessionId);
		//let j = schedule.scheduleJob('*/10 * * * * *', function(){Accounts.callbackFacebook(sessionId, "Esto es una notificacion de prueba")});
		text = 'Ok, te has suscrito correctamente al servicio de notificaciones, te enviare una alerta cada 10 segundos! :D'
		
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
	if(confir === 'ok'){
		console.log("okkkkkk");
		text = 'Está bien, si cambias de opinión me avisas e.e'	
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
	let jsnMsg = res.json({
		speech: text,
		displayText: text,
		messages: message,
		source: 'notificaciones'
	});
	console.log(jsnMsg.toString());
	console.log('--------------BEFORE RETURN----------------');
	if(jsnMsg.equals('')){
		console.log('--------------JSON EMPTY----------------');
	}
	else{
		return jsnMsg;
	}
}