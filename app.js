var express = require('express');
var app = express();


/*
app.listen(5000, function() {
  console.log('Example app listening on port Hu3');
});
*/
const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
    console.log("funciona------> get", __dirname);
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});