var express = require('express');
var app = express();

/*
app.listen(5000, function() {
  console.log('Example app listening on port Hu3');
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('resources'));
*/
const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
    console.log("funciona------> get", __dirname);
});

app.get('/', (req, res) => {
    console.log("get /----->");
    //res.status(200).send("correcto");
    res.send(':DDDDD');
});