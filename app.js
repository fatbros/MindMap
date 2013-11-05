
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')//indexのみ
  , user = require('./routes/user')
  , path = require('path');
  
var http = require('http');
http.globalAgent.maxSockets = 100;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var socketIO = require("socket.io");
var io = socketIO.listen(server);

io.set('transports', [
    'xhr-polling'
]);

var socketsOf = {};
var draw_coord_all = [];

io.sockets.on('connection', function(socket){
    //ユーザーがもとからいた場合
    if(Object.keys(socketsOf).length !== 0){
        //draw_coord_allの座標データをユーザーに渡す
        for(var i = 0; i < draw_coord_all.length; i++){
            socket.emit('draw_canvas', {XY: draw_coord_all[i]});
        }
        //loginデータを渡す
        for(var n in socketsOf){
            socket.emit('login_message', {name: n});
        }
    }

    //===============================================
    //userがcanvasを描画しmouseupしたとき
    //===============================================
    socket.on('send_draw_coord', function(data, fn) {
        //draw_coord_allに座標データを全てpushする
        draw_coord_all.push(data.XY);
        socket.broadcast.emit('draw_canvas', {XY: data.XY});
    });
    //===============================================
    //ユーザーがログインした場合
    //===============================================
    socket.on('send_user_login', function(data, fn) {
        //===============================================
        //ユーザーの情報の登録
        //===============================================
        socket.set('name', data.name, function(){
            //socketの登録 名前をプロパティとして
            socketsOf[data.name] = socket;
        });
        socket.broadcast.emit('login_message',{name: data.name});
    });

    //===============================================
    //load start
    //===============================================
    socket.on('broadcast_load', function(){
        socket.get('name', function(err, name){
            var yes_name = name;
            var message = 'さんがセントラルイメージのトリミングをしています';
            socket.broadcast.emit('loading', {name: name, message: message});
        });
    });
    //===============================================
    //load end
    //===============================================
    socket.on('broadcast_load_end', function(data){
        socket.broadcast.emit('end_loading', {tl: data.tl, br: data.br});
    });

    //===============================================
    //セントラルイメージ終了後 メインブランチ作る過程にシフト
    //===============================================
    socket.on('main_brunch', function(){
        io.sockets.emit('main_brunch_create');
    });

    socket.on('broadcast_main_brunch', function(data){
        socket.broadcast.emit('change_brunch_val',{val: data.val, num: data.num});
    });

    socket.on('broadcast_main_brunch_end', function(){
        socket.broadcast.emit('main_brunch_end');
    });

    //===============================================
    //ブランチの編集
    //===============================================
    socket.on('broadcast_drag_element', function(data){
        socket.broadcast.emit('drag_element', {
            t: data.t,
            l: data.l,
            id: data.id,
            main_or_sub: data.main_or_sub
        });
    });

    socket.on('broadcast_subElement_create', function(data){
        console.log(data);
        console.log('==============');
        console.log('==============');
        console.log('==============');
        socket.broadcast.emit('subElement_create', {
            id: data.id,
            val: data.val,
            rl: data.rl
        });
    });

    //===============================================
    //disconnect
    //===============================================
    socket.on('disconnect', function() {
        socket.get('name', function(err, name){
            if (err || !name) {
                console.log('==================');
                console.log('no name');
                console.log('==================');
                return;
            }
            console.log('==================');
            console.log('disconnect ' + name);
            console.log(socketsOf);
            console.log('==================');
            //socketsOfからdisconnectしたユーザーのsocketを削除する
            delete socketsOf[name];
            //他にユーザーがいない場合draw_coord_allの中身を削除する
            if(Object.keys(socketsOf).length === 0){
                draw_coord_all.splice(0,draw_coord_all.length);
            }else{
                //他にユーザーがいる場合はbroadcastする
                socket.broadcast.emit('logout_message',{name: name});
            }
        });
    });

});