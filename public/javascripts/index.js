$(function(){
    //===============================================
    //socket
    //===============================================
    var socket = io.connect('http://localhost:3000', {"sync disconnect on unload" : true});
    window.addEventListener('load', init);
    
    //===============================================
    //init
    //===============================================
    function init(){
        //canvasの準備
        var canvas = new Canvas();
        canvas.init();

        // //square draggable
        // draggable_square();

        $('#loginButton').on({
            'click': function(){
                var user_name = $('#form_name').val();
                if(user_name !== ""){
                    alert('ようこそ' + user_name + 'さん');
                    //nameをサーバーに送る
                    socket.emit('send_user_login', {name: user_name});
                    //ユーザー名をsideに入れる
                    $('#side .userName').append(user_name);
                    $('#loginForm').fadeOut('normal', function(){
                        $(this).remove();
                        $('#side, #other_user_login').fadeIn();
                    });
                }else{
                    alert('なにも入力されていません');
                }
            }
        });//.login yes end
        
        // ===============================================
        //scoket on
        //===============================================
        //===============================================
        //ログイン　ログアウト
        //===============================================
        socket.on('login_message',function(data){
            
            //other_user_loginの更新
            var userInfo = $('<div>', {class: 'userInfo', id: data.name});
            var login_status = $('<div>', {class: 'login_status'});
            var userPic = $('<div>', {class: 'userPic'});
            var over_blue = $('<div>', {class: 'over_blue'});
            var over_white = $('<div>', {class: 'over_white'});
            var userName = $('<div>', {class: 'userName'});
            userName.append(data.name);

            var img = $('<img>');
            over_white.append(img);
            over_blue.append(over_white);
            userPic.append(over_blue);

            userInfo.append(login_status);
            userInfo.append(userPic);
            userInfo.append(userName);

            $('#other_user_login').append(userInfo);
        });
        socket.on('logout_message',function(data){
            var selector_name = $('#other_user_login #' + data.name);
            var login_status = selector_name.find('.login_status');
            
            login_status.animate({
                backgroundColor: '#e87ea5'
            });
            setTimeout(function(){
                selector_name.fadeOut('slow', function() {
                    $(this).remove();
                });
            }, 5000);
        });
//         //===============================================
//         //ローディング
//         //===============================================
//         socket.on('loading',function(data){
//             var confirmation_selector = $('#confirmation');
//             var loading_selector = confirmation_selector.find('#loading');
//             confirmation_selector.css('z-index','999').fadeIn();
//             loading_selector.fadeIn();
//             $('#canvas_area').fadeOut();
//             //add message
//             var p = $('<p>',{text: data.name + data.message});
//             var p2 = $('<p>', {text: '少々お待ちください'});
//             loading_selector.find('#message').append(p).append(p2);
//             position_center(loading_selector);
//         });
//         //===============================================
//         //ローディング end
//         //===============================================
//         socket.on('end_loading',function(data){
//             var confirmation_selector = $('#confirmation');
//             var loading_selector = confirmation_selector.find('#loading');
//             confirmation_selector.css('z-index', '0').fadeOut('fast', function(){
//                 loading_selector.css('display','none')
//                 .find('#message p').remove();
//             });//fadeout callback
//             canvas.create_img('second', data);
//         });
//         //===============================================
//         //メインブランチを作成する時
//         //===============================================
//         socket.on('main_brunch_create', function(){
//             var confirmation_selector = $('#confirmation');
//             $('#main_brunch').fadeIn();
//             confirmation_selector.css({
//                 'background': 'rgba(50,50,50,0.7)'
//             }).fadeIn();
//             //ブランチの編集
//             brunch(socket);
//         });
//         //ブランチtextareaを誰かが編集した時
//         socket.on('change_brunch_val', function(data){
//             //data val data num
//             $('#main_brunch textarea:eq(' + data.num + ')').val(data.val);
//         });
//         //===============================================
//         //メインブランチ編集終了
//         //===============================================
//         socket.on('main_brunch_end', function(){
//             var brunch = [];
//             $('#confirmation').fadeOut().find('#main_brunch').fadeOut();
//             var push = main_brunch_enter(brunch);
//             if(push === true){
//                 create_first_brunch(brunch);
//             }
//         });



//         //===============================================
//         //ブランチの編集　elementの座標移動
//         //===============================================
//         socket.on('drag_element', function(data){
//             console.log(access);
//             console.log(data);
//             var element = access[data.id];
//             element.id_select.css({
//                 'top': data.t,
//                 'left': data.l
//             });
//             element.whtl.t = data.t;
//             element.whtl.l = data.l;
//             element.img_center();
//             element.svg_position_down();

//             if(data.main_or_sub === 'sub'){
//                 element.svg.svg.position(1);
//             }
//         });
//         //===============================================
//         //ブランチ編集　subElementの生成
//         //===============================================
//         socket.on('subElement_create', function(data){
//             var subElement = access[data.id];
//             console.log('==========================');
//             console.log(data);
//             console.log(access);
//             subElement.element_new_create(data.rl, data.val, false);
//         });
    }//init end

//     //===============================================
//     //title create
//     //===============================================
//     function brunch(socket){
//         var brunch = [];
//         $('#main_brunch textarea').on({
//             'change keyup': function(){
//                 var val = $(this).val();
//                 var num = $(this).attr('num');
//                 socket.emit('broadcast_main_brunch', {val: val, num: num});
//             }
//         });
//         //textareaのenterを押した時
//         $('#main_brunch .enter').on({
//             'click': function(){
//                 var push = main_brunch_enter(brunch);
//                 if(push === true){
//                     //broadcastでmain brunchの終了を送る
//                     socket.emit('broadcast_main_brunch_end');
//                     $('#confirmation').fadeOut().find('#main_brunch').fadeOut();
//                     create_first_brunch(brunch);
//                 }
//             }
//         });
//     }

//     function create_first_brunch(brunch){
//         //======================================
//         //main elementの生成
//         //======================================
//         var element_local = new Element(n_val(brunch[0]), socket);
//         element_local.create();
//         element.push(element_local);

//         //mainElementのselector
//         var element_selector = element[0].id_select;
//         position_center(element_selector);

//         //座標の再取得
//         element[0].whtl.t = parseInt($(element_selector).css('top'));
//         element[0].whtl.l = parseInt($(element_selector).css('left'));
//         element[0].img_center();
//         element[0].svg_position_down();

//         //main_brunchの生成
//         var rl = ['R','R','L','L'];
//         for(var i = 1; i < brunch.length; i++){
//             //mainエレメントのみ
//             element[0].element_new_create(rl[i-1], brunch[i]);
//         }
//         $('textarea').blur();

//         function n_val(val){
//             var Val = val;
//             //=============================================
//             //まず改行らしき文字を\nに統一。\r、\r\n → \n
//             //=============================================
//             Val = Val.replace(/\r\n/g, '\n');
//             Val = Val.replace(/\r/g, '\n');
//             var lines = Val.split('\n');
//             //=============================================
//             //splitした配列を送り、インスタンスを生成する
//             //=============================================
//             var setting = {
//                 lines: lines
//             };
//             return setting;
//         }
//     }

//     //textareaの中身の確認と挿入
//     function main_brunch_enter(obj){
//         for(var i = 0; i < 5; i++){
//             //全てのtextareaに文字が埋まってない場合
//             if($('#main_brunch textarea:eq(' + i + ')').val() === ""){
//                 alert('文字が入力されていないところがあります。');
//                 obj.splice(0, 4);
//                 return false;
//             }else{
//                 obj.push($('#main_brunch textarea:eq(' + i + ')').val());
//                 if(i == '4'){
//                     return true;
//                 }
//             }
//         }
//     }

//     //===============================================
//     //center position
//     //===============================================
//     function position_center(Selector){
//         var parent = {
//             selector: Selector.parent(),
//         };
//         parent.width = parent.selector.width();
//         parent.height = parent.selector.height();

//         var selector = {
//             width: Selector.width(),
//             height: Selector.height()
//         };
        
//         Selector.css({
//             'top': (parent.height - selector.height)/2,
//             'left': (parent.width - selector.width)/2,
//             'position': 'absolute'
//         });
//     }
//     //===============================================
//     //draggable square
//     //===============================================
//     function draggable_square(){
//         //img_confirmation を中心に配置する
//         position_center($('#img_confirmation'));
//         $('#img_confirmation .square').draggable({
//             containment: '#main',
//             scroll: false,
//             opacity: 0.5,
//             stop: function(){
//                 select_animation_move(this);
//             },
//             drag: function(){
//                 select_animation_move(this);
//             }
//         });
//         function select_animation_move(that){
//             var name_rel = $(that).attr('rel');
//             var select_name_rel = name_rel.split('/');
//             var select_arr = search_select_animation_rel(select_name_rel[0] + select_name_rel[1]);
//             var select_other = {
//                 one: {
//                     0: select_arr[0],
//                     1: select_arr[1]
//                 },
//                 two: {
//                     0: select_arr[0],
//                     1: select_arr[1]
//                 }
//             };
//             var name = [
//                 ['tl','tr'],
//                 ['bl','br']
//             ];
//             select_other.one[0] = swich_arr(select_other.one[0]);
//             select_other.two[1] = swich_arr(select_other.two[1]);
//             function swich_arr(arr){
//                 switch(arr){
//                     case 0:
//                         return arr = 1;
//                         break;
//                     case 1:
//                         return arr = 0;
//                         break;
//                 }
//             }
//             var left = parseInt($(that).css('left'));
//             var top = parseInt($(that).css('top'));
//             var select_animation_selector_one = $('#select_animation_' + select_name_rel[0]);
//             var select_animation_selector_two = $('#select_animation_' + select_name_rel[1]);
//             var select_animation_selector_three = $('#select_animation_' + select_name_rel[2]);
//             var select_animation_selector_four = $('#select_animation_' + select_name_rel[3]);
            
//             var select_w = parseInt(select_animation_selector_one.css('width'));
            
//             var square_selector_one = $('#square_' + name[select_other.one[0]][select_other.one[1]]);
//             var square_selector_two = $('#square_' + name[select_other.two[0]][select_other.two[1]]);
//             //gifの位置
//             select_animation_selector_one.css('top', top);
//             select_animation_selector_two.css('left', left);
//             //squareの位置
//             square_selector_two.css('top',top);
//             square_selector_one.css('left', left);
//             //gifの領域
//             if(select_name_rel[1] == 'l'){
//                 select_animation_selector_one.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
//                 select_animation_selector_three.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
                
//                 select_animation_selector_one.css('left', left + 5);
//                 select_animation_selector_three.css('left', left);
                
//                 select_animation_selector_one.css('top', top + 5);
//             }else{
//                 select_animation_selector_one.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
//                 select_animation_selector_three.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
                
//                 select_animation_selector_one.css('top', top + 5);
//             }
            
//             if(select_name_rel[0] == 't'){
//                 select_animation_selector_two.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
//                 select_animation_selector_four.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
//                 select_animation_selector_two.css('top', top + 5);
//                 select_animation_selector_four.css('top', top);
                
//                 select_animation_selector_two.css('left', left + 5);
//             }else{
//                 select_animation_selector_two.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
//                 select_animation_selector_four.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
                
//                 select_animation_selector_two.css('left', left + 5);
//             }
//         }
//         function search_select_animation_rel(rel){
//             var name = [
//                 ['tl','tr'],
//                 ['bl','br']
//             ];
//             var search = [];
//             for(var i = 0; i < name.length; i++){
//                 for(var x = 0; x < name[i].length; x++){
//                     if(name[i][x] == rel){
//                         search[0] = i;
//                         search[1] = x;
//                         return search;
//                     }
//                 }
//             }
//         }
//     }//draggable end

    //===============================================
    //createjs canvas class
    //===============================================
    function Canvas(){
        this.canvas = document.getElementById('draw_canvas');
        this.stage = new createjs.Stage(this.canvas);
        this.shape = new createjs.Shape();
        this.tick = createjs.Ticker;
    
        this.position = {
                newX: 0,
                newY: 0,
                oldX: 0,
                oldY: 0
        };
        //今までのdrawデータ
        this.all_draw_coord = [];
        //サーバーに送るdrawデータ
        this.emit_draw_coord = [];
    }
    Canvas.prototype.init = function(){
        this.stage.autoClear = false;
        this.stage.addChild(this.shape);

        //tickイベントの削除のため
        this.tickBoundFunc = this.handleTick.bind(this);
        this.tick.addEventListener('tick', this.tickBoundFunc);
        this.stageEvent();
        this.socket();
    };
    
    Canvas.prototype.stageEvent = function(){
        var stage = this.stage;
        var that = this;

        stage.addEventListener('stagemousedown', mouseDown, false);

        function mouseDown(e){
            console.log('mousedown');
            console.log(e.stageX, e.stageY);
            that.position = {
                oldX: e.stageX,
                oldY: e.stageY
            };
            that.emit_draw_coord.push($.extend('true', {}, {
                newX: that.position.oldX,
                newY: that.position.oldY
            }));
            stage.addEventListener('stagemousemove', mouseMove, false);
            stage.addEventListener('stagemouseup', mouseUp, false);
        }
        function mouseMove(e){
            // var push_local = {
            //     newX: that.position.newX,
            //     newY: that.position.newY
            // };
            that.position.newX = parseInt(e.stageX);
            that.position.newY = parseInt(e.stageY);
            that.shape.graphics.clear().setStrokeStyle(5, 'round', 'round').beginStroke('#333333').moveTo(that.position.oldX,that.position.oldY).lineTo(that.position.newX,that.position.newY);
            that.emit_draw_coord.push($.extend('true', {}, {
                newX: that.position.newX,
                newY: that.position.newY
            }));
            //座標の入れ替え
            that.position.oldX = parseInt(e.stageX);
            that.position.oldY = parseInt(e.stageY);
            stage.update();
            console.log(that.emit_draw_coord);
        }
        function mouseUp(e){
            stage.removeEventListener('stagemousemove', mouseMove, false);
            console.log('mouseUp');
            console.log(e.stageX, e.stageY);
            //canvas以外をクリックしても判定されるバグあり
            if(that.emit_draw_coord.length !== 0){
                socket.emit('send_draw_coord',{XY: that.emit_draw_coord});
                //参照させないように座標をpushする
                that.all_draw_coord.push($.extend(true, {}, that.emit_draw_coord));
                //emitしたあとemit_draw_coordの中身を完全に削除し使い回せるようにする
                that.emit_draw_coord.splice(0,that.emit_draw_coord.length);
            }
        }

        // //===============================================
        // //canvasのyesを押した場合
        // //===============================================
        // $('#canvas_area .yes').on({
        //     'click': function(){
        //         stage.removeEventListener('stagemouseup', mouseUp, false);
        //         stage.removeEventListener('stagemousedown', mouseDown, false);
        //         that.tick.removeEventListener('tick', that.tickBoundFunc, false);

        //         $('#canvas_area').fadeOut('slow');
        //         that.create_img('first');
        //     }
        // });
    };
    
    Canvas.prototype.handleTick = function() {
        this.stage.update();
    };

    Canvas.prototype.create_img = function(mode, data){
        //mode == first 最初にcanvasのyesを押した時
        if(mode == 'first'){
            //他の人の画面をロード画面にする
            socket.emit('broadcast_load');
        }
        var img = new Image;
        var type = 'image/png';
        img.src = this.canvas.toDataURL(type);
        var dom_img = new Img(img, 0, socket);

        if(mode == 'first'){
            dom_img.create();
        }else{
            dom_img.create_second(data);
        }
    };
    
    Canvas.prototype.socket = function(){
        var that = this;
        //送られてきたarrayの座標通り描画する
        socket.on('draw_canvas', function(data){
            for(var i = 1; i < data.XY.length - 1; i++){
                  that.shape.graphics.clear().setStrokeStyle(5, 'round', 'round').beginStroke('#333333').moveTo(data.XY[i].newX,data.XY[i].newY).lineTo(data.XY[i+1].newX,data.XY[i+1].newY);
                  that.stage.update();
            }
            that.all_draw_coord.push($.extend(true, {}, data.XY));
        });
    };
});