
/**
 * Module dependencies.
 */

var express = require('express');
// var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');
var rutas = require('App/Rutas');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
// app.get('/', routes.index);
// app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
//websockets
var io = require('socket.io').listen(server);
//clientes
//JSON para controlar que no se repitan nombres
var usuariosConectados = {};
io.sockets.on('connection',function(socket){
	// console.log('nuevo socket conectado');
	// socket.on('prueba', function(){
	// 	console.log('la socket se inicio correctamente');
	// 	var mensaje = 'Hola socket';
	// 	io.sockets.emit('nuevoMensaje', mensaje);
	// });
	// //Recibimos el nombre
	socket.on("enviarNombre", function(dato){
		//Verificamos que ese nombre no existe
		if (usuariosConectados[dato]) {
			io.sockets.emit('errorName');
		} else{
			//Lo asignamos a la socket y lo agregamos
			socket.nickname = dato;
			usuariosConectados[dato] = socket.nickname;
			console.log(socket.nickname);
		};
		data = [dato, usuariosConectados];
		io.sockets.emit('usuarios', data);
	});
	//Recibimos un nuevo mensaje y lo mandamos a todas las sockets
	socket.on('enviarMensaje', function(mensaje){
		var data = [socket.nickname, mensaje];
		io.sockets.emit('nuevoMensaje', data);
	});
	//Se dispara cuando una socket se desconecta
	socket.on('disconnect', function(){
		//Eliminamos al usuario de los conectados
		delete usuariosConectados[socket.nickname];
		//Creamos un arreglo con los usuarios y el que se elimino
		data = [usuariosConectados, socket.nickname];
		console.log(data);
		io.sockets.emit('usuarioDesconectado', data);
	});
});
rutas(app);






