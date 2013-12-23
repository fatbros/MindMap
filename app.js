
/**
 * Module dependencies.
 */

//test

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
    'websocket',
    'xhr-polling'
]);

var socketsOf = {};
//canvasごとにオブジェクトを生成する、オブジェクトの中に座標の数値をぶち込む
//オブジェクト　→　配列　→　オブジェクト　先頭配列に色情報を入れてある
var draw_coord_all = {
    0: [],
    1: [],
    2: [],
    3: []
};
//ステータス　ユーザーがcanvasにいる位置など
var userStatus = {
    otherUser_status: {},
    canvas_status: {
        0: {},
        1: {},
        2: {},
        3: {}
    },
    delete_otherUser_status: function(name){
        delete this.otherUser_status[name];
    },
    delete_canvas_status: function(number, name){
        delete this.canvas_status[number][name];
    }
};

io.sockets.on('connection', function(socket){
    //ユーザーがもとからいた場合
    if(Object.keys(socketsOf).length !== 0){
        //draw_coord_allの座標データをユーザーに渡す
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < draw_coord_all[i].length; j++){
                socket.emit('draw_canvas' + i, {XY: draw_coord_all[i][j]});
            }
        }
        //loginデータを渡す
        for(var n in socketsOf){
            socket.emit('login_message', {name: n});
        }
        //userStatusを渡す
        socket.emit('get_otherUser_status', {
            otherUser: userStatus.otherUser_status,
            canvas: userStatus.canvas_status
        });
    }

    //===============================================
    //userがcanvasを描画しmouseupしたとき
    //===============================================
    socket.on('send_draw_coord', function(data, fn) {
        //draw_coord_allに座標データを全てpushする
        draw_coord_all[data.number].push(data.XY);
        socket.broadcast.emit('draw_canvas' + data.number, {XY: data.XY});
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
            userStatus.otherUser_status[data.name] = {};
            //console.log(socket.store.data.name);
        });
        socket.broadcast.emit('login_message',{name: data.name});
    });
    //===============================================
    //ユーザーがcanvasの番号を変更した時
    //===============================================
    socket.on('change_canvas', function(data, fn){
        socket.get('name', function(err, name){
            //userstatusの更新　後から入ってきたユーザーのため
            //userが前に選択していたcanvasの番号 あとからdeleteするため
            var old_select_canvas_number;
            socket.get('select_canvas_number', function(err, number){
                if(err || !number){
                    return;
                }
                old_select_canvas_number = number;
            });
            socket.set('select_canvas_number', data.number);
            userStatus.otherUser_status[name].select_canvas_number = data.number;
            userStatus.canvas_status[data.number][name] = {};

            if(old_select_canvas_number !== undefined){
                //test1
                //delete userStatus.canvas_status[old_select_canvas_number][name];
                userStatus.delete_canvas_status(old_select_canvas_number, name);
            }

            socket.broadcast.emit('otherUser_change_canvas', {
                name: name,
                number: data.number
            });
        });
    });

    //===============================================
    //load start
    //===============================================
    socket.on('broadcast_load', function(data){
        //画像を生成したのでサーバーのdraw_coord_allを削除する。
        draw_coord_all[data.number].splice(0, draw_coord_all[data.number].length);
        socket.get('name', function(err, name){
            var yes_name = name;
            var message = 'さんがセントラルイメージのトリミングをしています';
            socket.broadcast.emit('loading', {name: name, message: message, number: data.number});
            //test
        });
    });
    //===============================================
    //load end
    //===============================================
    socket.on('broadcast_load_end', function(data){
        socket.broadcast.emit('end_loading', {
            square: data.square,
            dom_img_pos: data.dom_img_pos,
            overflow_div_pos: data.overflow_div_pos,
            access_num: data.access_num,
            canvas_num: data.canvas_num
        });
    });

    socket.on('move_img', function(data){
        socket.broadcast.emit('move_img', {
            img_pos: data.img_pos,
            id: data.id
        });
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
        socket.broadcast.emit('subElement_create', {
            id: data.id,
            val: data.val,
            rl: data.rl,
            t: data.t,
            l: data.l
        });
    });

    //ブランチの内容の編集
    socket.on('broadcast_subElement_brunchEdit', function(data){
        socket.broadcast.emit('subElement_brunchEdit', {
            id: data.id,
            val: data.val
        });
    });

    //delete
    socket.on('broadcast_delete_element', function(data){
        socket.broadcast.emit('delete_element', {id: data.id});
    });

    socket.on('broadcast_menu_change', function(data){
        socket.broadcast.emit('sub_menu_change', {
            menu: data.menu,
            id: data.id
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

            //userStatusからdisconnetctしたユーザーの情報を削除する
            socket.get('select_canvas_number', function(err, number){
                if(err || !number){
                    return;
                }
                userStatus.delete_otherUser_status(name);
                userStatus.delete_canvas_status(number, name);
                socket.broadcast.emit('otherUser_remove_canvas', {
                    name: name
                });

            });

            //socketsOfからdisconnectしたユーザーのsocketを削除する
            delete socketsOf[name];
            //他にユーザーがいない場合draw_coord_allの中身を削除する
            if(Object.keys(socketsOf).length === 0){
                for(var i = 0; i < 4; i++){
                    draw_coord_all[i].splice(0,draw_coord_all[i].length);
                }
            }else{
                //他にユーザーがいる場合はbroadcastする
                socket.broadcast.emit('logout_message',{name: name});
            }
        });
    });

});