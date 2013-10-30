var nombre;
var arrayNames = [];
var websocket = io.connect();

$(document).on("ready",iniciar);

function iniciar()
{
	updateState();
	$("#formNombre").on("submit",function(e){
        //Cuando enviamos el nombre
        e.preventDefault();
        var bandera = 0;
        //Verificamos que el nombre no esté ocupado
        for (var i = 0; i < arrayNames.length; i++){
            if($("#name").val() == arrayNames[i]){
                bandera = 1;
            }
        };
        if(bandera == 0){
            sendName();
        }
        else{
            alert("Ese nombre ya existe");
        }
    });
    //Formulario para enviar un nuevo mensaje
    $("#formMsg").on("submit",function(e){
            e.preventDefault();
            sendMessage();
    });
    //Cerramos sesión
    $('#btnClosSes').on("click",function(){
        localStorage.removeItem("nombreChatUsuario");
        location.reload(true);
    }); 
	//Manejamos lo que el servidor nos manda
    websocket.on("usuarios",procesarUsuario);
    websocket.on("nuevoMensaje",procesarMensaje);
    websocket.on("usuarioDesconectado",procesarUsuarios);
    websocket.on("errorName",repetirNombre); 
}
//Enviar el mensaje
function sendMessage(){
    var msg = $("#msg").val();
    //Verificamos que no tenga scripts
    if((msg.indexOf("<") != -1)){
            alert("Mensaje incorrecto");
    }
    else if((msg.indexOf(">") != -1)){
            alert("Mensaje incorrecto");        
    }
    else if((msg.indexOf(";") != -1)){
            alert("Mensaje incorrecto");
    }
    else{
        //Limpiamos la caja del formulario                
        $("#msg").val("");
        //Enviamos un mensaje
        localStorage.message = msg;
        websocket.emit("enviarMensaje",msg);        
    }   
}
//Enviamos nuestro nombre
function sendName(){
    nombre = $("#name").val();
    $('#setNombre').fadeOut();
    //Guardamos el nombre en localStorage
    if (localStorage){
        localStorage.nombreChatUsuario = nombre;
    }
    websocket.emit("enviarNombre",nombre);
}
function updateState(){
	debugger;
	if(localStorage.nombreChatUsuario){
		$('#setNombre').fadeOut();
		websocket.emit("enviarNombre", localStorage.nombreChatUsuario);
		websocket.emit("enviarMensaje", localStorage.message);    
	}
}
function procesarUsuario(usuarios){
    //Esta función se ejecuta cuando el servidor nos avisa
	//que alguien se conectó
    //Limpiamos el div de usuarios
    $('#users').html(""); 
    //Colocamos de nuevo los usuarios
    for (i in usuarios[1]){
      $('#users').append($('<p>').text(usuarios[1][i]));
      arrayNames[i] = usuarios[1][i];
  	}
}
//Esta función procesa los mensaje
function procesarMensaje(data){
    $('#chatInsite').append($('<p>').append($('<article>').html('<span>'+ data[0] + "dijo:</span> " + data[1])));
    $('#chat').animate({scrollTop: $("#chatInsite").height()}, 300);
}
function procesarUsuarios(usuarios_update){
    //Esta función se ejecuta cuando el servidor nos
    //avisa que alguien se desconectó
    $('#users').html("");
    for (i in usuarios_update[0]){
      $('#users').append($('<p>').text(usuarios_update[0][i]));
      arrayNames[i] = usuarios_update[0][i];
  	}
}
function repetirNombre(){
    localStorage.removeItem("nombreChatUsuario");
    alert("El nombre ya está ocupado, escoge otro");
    location.reload(true);        
}