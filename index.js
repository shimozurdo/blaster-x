require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const api = require('./server/routes')(io);

app.use(express.urlencoded({
  extended: false
}));

app.use(express.json());
app.use(cors());
app.use('/api', api);
console.log(__dirname);
var root = __dirname + '/src';
app.use(express.static(root));
app.disable('x-powered-by');

server.listen(process.env.PORT, () => {
  console.log('Listening on port http://localhost:%d', server.address().port);
});

