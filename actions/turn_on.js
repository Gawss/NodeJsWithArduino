
exports.turn_on = function (res, req) {
	console.log('------->Turning On...');

	let message;
	let quick_replies = [];
	let text = ' ';
	let confir = ((typeof req.body.result.contexts === 'undefined' || req.body.result.contexts.length === 0) ? '' : req.body.result.contexts[0].parameters.quest);
	
	if(confir === 'lol'){
		console.log("looool");
		//console.log("SESSION_ID---------------------------->", sessionId);
		//let j = schedule.scheduleJob('*/10 * * * * *', function(){Accounts.callbackFacebook(sessionId, "Esto es una notificacion de prueba")});
		text = 'Ok, lol recived...I will turn on the Arduino connection!'
		
		quick_replies = [
			{
			  content_type: "text",
			  title: 'Consultar saldo',
			  payload: "consulta_saldos"
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
  return res.json({
    speech: text,
    displayText: text,
    messages: message,
    source: 'turn_on'
  });
}