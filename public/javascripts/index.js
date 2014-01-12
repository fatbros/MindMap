$(function(){
    //===============================================
    //socket
    //===============================================
    //var socket = io.connect('http://localhost', {"sync disconnect on unload" : true});
    var socket = io.connect('http://gentle-bayou-5667.herokuapp.com', {"sync disconnect on unload" : true});
    //window.addEventListener('load', init);
    //hint navigation用のオブジェクト
    var json = {};
    $.ajax({
        type: 'GET',
        url: './json/nav.json',
        datatype: 'json',
        success: function(data){
            for(var i = 0; i < data.length; i++){
                json[i] = data[i];
            }
            init();
        }
    });
    //引数　hintを設置するdivのセレクタ　jsonの配列番号
    //最後にhintWrapをreturnする
    //hintWrapの位置はreturnしたオブジェクトを使い計算する
    function hintNav(hintSelector, jsonNum, triDirection, hintWidth){
        var hintWrap = $('<div>',{
            'class': 'hint'
        });
        hintWrap.css('width', hintWidth);

        var hintTitle = $('<div>', {
            'class': 'hintTitle'
        }).append(json[jsonNum].title).appendTo(hintWrap);

        var hintIcon = $('<img>',{
            'src': './images/hint.png'
        }).prependTo(hintTitle);

        var hintSentence = $('<div>', {
            'class': 'hintSentence'
        }).append(json[jsonNum].sentence).appendTo(hintWrap);
        hintSelector.append(hintWrap);

        //三角形の位置
        switch(triDirection){
            case 'left':
                var h = hintWrap.height() / 2 - 10;
                var tri = $('<div>', {
                    'class': 'tri'
                    }).css({
                        'top': h,
                        'left': '-27px',
                        'border-right': '10px solid #2f9998'
                    }).appendTo(hintWrap);
                break;
            case 'bottom':
                var w = hintWrap.width() / 2 - 10;
                var h = hintWrap.height() + 7;
                var tri = $('<div>', {
                    'class': 'tri'
                }).css({
                    'left': w,
                    'top': h,
                    'border-top': '10px solid #2f9998'
                }).appendTo(hintWrap);
                break;
            case 'top':
                var w = hintWrap.width() / 2 - 10;
                var h = -27;
                var tri = $('<div>', {
                    'class': 'tri'
                }).css({
                    'left': w,
                    'top': h,
                    'border-bottom': '10px solid #2f9998'
                }).appendTo(hintWrap);
                break;
            default:
                break;
        }
        return hintWrap;
    }
    function hintNavPos(hintSelector, top, left, bottom, right){
        var d = $.Deferred();
        hintSelector.css({
            'top': top,
            'left': left,
            'bottom': bottom,
            'right': right
        });
        d.resolve();
        return d.promise();
    }
    function flashHint(hintSelector){
        var d = $.Deferred();
        hintSelector.fadeIn('fast').fadeOut('fast').fadeIn('fast', function(){
            d.resolve();
        });
        return d.promise();
    }
    function delay(time){
        var d = $.Deferred();
        setTimeout(function(){
            d.resolve();
        }, time);
        return d.promise();
    }
    function deleteHint(hintSelector){
        var d = $.Deferred();
        hintSelector.fadeOut('slow', function(){
            $(this).remove();
            d.resolve();
        })
        return d.promise();
    }

    //===============================================
    //init
    //===============================================
    function init(){
        //canvasの準備
        var img_access = {};
        var canvas = {
            0: new Canvas(0, img_access),
            1: new Canvas(1, img_access),
            2: new Canvas(2, img_access),
            3: new Canvas(3, img_access)
        };
        canvas['0'].init();
        canvas['1'].init();
        canvas['2'].init();
        canvas['3'].init();

        //他のユーザーの状態情報
        var otherUser_status = {};
        //canvasの状態情報
        var canvas_status = {
            0: {},
            1: {},
            2: {},
            3: {}
        };

        //canvasのz-indexの切り替え設定
        //edit_canvasユーザーの設定
        var select_canvas_animation = (function(){
            //canvas1 = 0, cavnas2 = 1, canvas3 = 2, canvas4 = 3
            var select_canvas_number;
            return {
                animation: (function(){
                    var number = $('#canvas_number');
                    number.find('div span').on('click', function(){
                        //select_animation_
                        var old_canvas_spanNumber = $(this).parent().find('span[rel = ' + select_canvas_number + ']');
                        var old_canvas_selector = $('#draw_canvas' + select_canvas_number);
                        var new_canvas_selector = $('#draw_canvas' + $(this).attr('rel'));

                        if(select_canvas_number !== undefined){
                            old_canvas_spanNumber.stop(true, false).animate({
                                'color': '#fff'
                            });
                            old_canvas_selector.css('z-index', '-1');
                        }
                        select_canvas_number = $(this).attr('rel');
                        new_canvas_selector.css('z-index', '4');
                        $(this).stop(true, false).animate({
                            'color': '#3e3a39'
                        });
                        //edit_canvasの更新
                        select_canvas_animation.refresh_edit_canvas(select_canvas_number);
                        //otherUserにどのcanvasを編集しているのかemitする
                        select_canvas_animation.emit_edit_canvas_number();
                    });
                })(),
                //end animation
                emit_edit_canvas_number: function(){
                    socket.emit('change_canvas', {
                        number: select_canvas_number
                    });
                },
                socket: (function(){
                    function remove(data){
                        //ユーザーの状態の古い情報を削除する
                        //最初は何処のcanvasにも入っていないので
                        if(otherUser_status[data.name].hasOwnProperty('select_canvas_number')){
                            var old_edit_canvas_number = otherUser_status[data.name]['select_canvas_number'];
                            delete canvas_status[old_edit_canvas_number][data.name];
                        }
                    }
                    //otherUserがcanvasを変更した時
                    socket.on('otherUser_change_canvas', function(data){
                        remove(data);
                        //ユーザーの状態の最新情報の更新
                        otherUser_status[data.name]['select_canvas_number'] = data.number;
                        canvas_status[data.number][data.name] = '';
                        //other_userが所属しているcanvasが変更されているはずなので更新する
                        if(select_canvas_number !== undefined){
                            select_canvas_animation.refresh_edit_canvas(select_canvas_number);
                        }
                        console.log('otherUser_change_canvas');
                        console.log(otherUser_status);
                        console.log(canvas_status);
                    });
                    //otherUserがlogoutした時
                    socket.on('otherUser_remove_canvas', function(data){
                        console.log('otherUser_remove_canvas start');
                        remove(data);
                    });
                    //自分自身が途中から参加したとき、サーバーからotherUser_statusを取得する
                    socket.on('get_otherUser_status', function(data){
                        otherUser_status = data.otherUser;
                        canvas_status = data.canvas;
                        console.log(otherUser_status);
                        console.log(canvas_status);
                    });
                })(),
                refresh_edit_canvas: function(number){
                    //canvasのメニューedit_canvasの更新
                    var edit_user = $('#edit_user');
                    edit_user.find('div').remove();
                    Object.keys(canvas_status[number]).forEach(function(key){
                        var div_user = $('<div>', {
                            id: 'edit_' + key
                        });
                        var img_user = $('<img>', {
                            src: '/images/user.png',
                            alt: 'edit_user',
                            class: 'edit_user_pic'
                        });
                        var span_user = $('<span>').append(key);

                        div_user.append(img_user).append(span_user);
                        edit_user.append(div_user);
                    });
                },
                create_img: (function(){
                    $('#create_button').on({
                        'click': function(){
                            if(!select_canvas_number){
                                alert('なにも入力されていません');
                                return;
                            }
                            canvas[select_canvas_number].create_img();
                        }
                    });
                })(),
                create_img_second: (function(){
                    $('#create_button_second').on({
                        'click': function(){
                            if(!select_canvas_number){
                                alert('なにも入力されていません');
                                return;
                            }
                            canvas[select_canvas_number].create_img_second();
                        }
                    });
                })()
                //end clojure
            };
        })();

        //square draggable
        draggable_square();

        //loginボタンを押した時
        $('#loginWrap .loginButton').on({
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
                        $('#side, #other_user_login').fadeIn('normal').promise().then(function(){
                            //hint navの生成
                            var hint = hintNav($('#hintNavigation'), 0, 'left', '40%');
                            //navigationの位置の処理
                            var canvasPos = parseInt($('#canvas').offset().top - $('header').height() );
                            var diff = (hint.outerHeight() - $('#canvas').outerHeight()) / 2;
                            hintNavPos(hint, canvasPos - diff, 20, '', '')
                                .then(function(){return flashHint(hint)})
                                .then(function(){return delay(6500)})
                                .then(function(){return deleteHint(hint)});
                        });
                        //over_scrollWrapのz-indexを変更させる
                        $('#over_scrollWrap').css('z-index', '-5');
                    });
                }else{
                    alert('なにも入力されていません');
                }
            }
        });//.login yes end
        
        //最初の一回のみ、canvasメニューをクリックした時、ナビゲーションを生成する。
        (function(){
            $('#canvas').on({
                'click': canvasNav
            });
            function canvasNav(){
                //一回のみなのでcanvasNavイベントをoff
                $('#canvas').off('click', canvasNav);
                //canvasnumber hint
                var hint = hintNav($('#hintNavigation'), 1, 'bottom', '40%');
                //canvasbutton hint
                var hint2 = hintNav($('#hintNavigation'), 2, 'bottom', '40%');
                var left = ($('#hintNavigation').width() - hint.outerWidth()) / 2;
                hintNavPos(hint, 20, left, '', '')
                    .then(function(){return flashHint(hint)})
                    .then(function(){return delay(5000)})
                    .then(function(){return deleteHint(hint)})
                    //hint1終了
                    .then(function(){return hintNavPos(hint2, 20, left, '', '')})
                    .then(function(){return flashHint(hint2)})
                    .then(function(){return delay(4000)})
                    .then(function(){return deleteHint(hint2)});
                    //hint2終了
            }
        })();
        //最初の一回のみ、create_buttonをクリックした時、ナビゲーションを生成する。
        (function(){
            $('#create_button').on({
                'click': trimNav
            });
            function trimNav(){
                $('#create_button').off('click', trimNav);
                var hint = hintNav($('#hintNavigation'), 3, 'bottom', '30%');
                var left = ($('#hintNavigation').width() - hint.outerWidth()) / 2;
                hintNavPos(hint, 30, left, '', '')
                    .then(function(){return flashHint(hint)})
                    .then(function(){return delay(4000)})
                    .then(function(){return deleteHint(hint)});
            }
        })();
        
        // ===============================================
        //scoket on
        //===============================================
        //===============================================
        //ログイン　ログアウト
        //===============================================
        socket.on('login_message',function(data){
            //===============================================
            //other_user_loginの更新
            //===============================================
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
            //===============================================
            //otherUser_statusの更新
            //===============================================
            otherUser_status[data.name] = {};
        });
        socket.on('logout_message',function(data){
            //===============================================
            //otherUser_statusの更新
            //===============================================
            delete otherUser_status[data.name];

            //sidebarの更新
            var selector_name = $('#other_user_login #' + data.name);
            var login_status = selector_name.find('.login_status');
            login_status.stop(true, false).animate({
                backgroundColor: '#e87ea5'
            });
            setTimeout(function(){
                selector_name.fadeOut('slow', function() {
                    $(this).remove();
                });
            }, 5000);
        });
        //===============================================
        //ローディング
        //===============================================
        socket.on('loading',function(data){
            var loading = $('<div>', {class: 'loading'});
            var loading_img = $('<img>', {src: '/images/loading.gif'});
            var message = $('<div>', {class: 'message'});
            var loading_back = $('<div>', {class: 'loading_back'});

            //append
            var p = $('<p>',{text: data.name + data.message});
            var p2 = $('<p>', {text: '少々お待ちください'});
            message.append(p).append(p2);
            loading.append(loading_img).append(message);
            loading_back.append(loading);

            $('#draw_canvas' + data.number).append(loading_back);

            position_center(loading);
        });
        //===============================================
        //ローディング end
        //===============================================
        socket.on('end_loading',function(data){
            //data square dom_img_pos overflow_div_pos access_num canvas_num
            var img = new Image;
            var type = 'image/png';
            var _canvas = document.getElementById('main_canvas' + data.canvas_num);
            img.src = _canvas.toDataURL(type);
            //img_accessにimg_seconduserオブジェクトを参照させる。
            img_access[data.access_num] = new Img_secondUser(data, img, socket);
            img_access[data.access_num].create();

            //canvasの描画データの削除
            console.log(canvas);
            canvas[data.canvas_num].delete_canvas();

            //loadingの削除
            $('#draw_canvas' + data.canvas_num).find('.loading_back').remove();
        });
        //===============================================
        //otheruserが画像を移動したとき
        //===============================================
        socket.on('move_img', function(data){
            img_access[data.id].img_move(data.img_pos.t, data.img_pos.l);
        });

        //===============================================
        //メインブランチを作成する時
        //===============================================
        socket.on('main_brunch_create', function(){
            //次にimgを生成するときはcreate_button_secondから
            $('#create_button').remove();
            //mainブランチの説明 navigation
            var hint = hintNav($('#hintNavigation'), 4, 'top', '60%');
            var left = ($('#hintNavigation').width() - hint.outerWidth()) / 2;
            hintNavPos(hint, '', left, 20, '')
                .then(function(){return flashHint(hint)})
                .then(function(){return delay(10000)})
                .then(function(){return deleteHint(hint)});

            var canvas_nav = $('ul #canvas');
            var confirmation_selector = $('#confirmation');
           
            nav_animation.off_navColor_animation(canvas_nav);

            $('#over_scrollWrap').css('z-index', '5');
            $('#main_brunch').fadeIn();
            confirmation_selector.fadeIn();

            //ブランチの編集
            brunch(socket);
        });
        //ブランチtextareaを誰かが編集した時
        socket.on('change_brunch_val', function(data){
            //data val data num
            $('#main_brunch input:eq(' + data.num + ')').val(data.val);
        });
        //===============================================
        //メインブランチ編集終了
        //===============================================
        socket.on('main_brunch_end', function(){
            var brunch = [];
            $('#confirmation').fadeOut().find('#main_brunch').fadeOut();
            var push = main_brunch_enter(brunch);
            if(push === true){
                create_first_brunch(brunch);
            }
        });

        //===============================================
        //ブランチの編集　elementの座標移動
        //===============================================
        socket.on('drag_element', function(data){
            var element = access[data.id];
            element.id_select.css({
                'top': data.t,
                'left': data.l
            });
            element.whtl.t = data.t;
            element.whtl.l = data.l;
            element.img_center();
            element.svg_position_down();

            if(data.main_or_sub === 'sub'){
                element.svg.svg.position(1);
            }
        });
        //===============================================
        //ブランチ編集　subElementの生成
        //===============================================
        socket.on('subElement_create', function(data){
            var subElement = access[data.id];
            console.log(data)
            subElement.otherUser_element_new_create(data.rl, data.val, data.t, data.l);
        });

        socket.on('subElement_brunchEdit', function(data){
            access[data.id].otherUser_edit(data.val);
        });

        //===============================================
        //ブランチの削除
        //===============================================
        socket.on('delete_element', function(data){
            access[data.id].search_delete_element();
        });
        //===============================================
        //ブランチ star
        //===============================================
        socket.on('sub_menu_change', function(data){
            access[data.id]['otherUser_menu_change'](data.menu);
        });

    }//init end

    //===============================================
    //title create
    //===============================================
    function brunch(socket){
        var brunch = [];
        $('#main_brunch input').on({
            'change keyup': function(){
                var val = $(this).val();
                var num = $(this).attr('num');
                socket.emit('broadcast_main_brunch', {val: val, num: num});
            }
        });
        //textareaのenterを押した時
        $('#main_brunch .loginButton').on({
            'click': function(){
                var push = main_brunch_enter(brunch);
                if(push === true){
                    //broadcastでmain brunchの終了を送る
                    //test
                    socket.emit('broadcast_main_brunch_end');
                    $('#confirmation').fadeOut().find('#main_brunch').fadeOut();
                    create_first_brunch(brunch);
                }
            }
        });
    }

    //textareaの中身の確認と挿入
    function main_brunch_enter(obj){
        for(var i = 0; i < 5; i++){
            //全てのtextareaに文字が埋まってない場合
            if($('#main_brunch input:eq(' + i + ')').val() === ""){
                alert('文字が入力されていないところがあります。');
                obj.splice(0, 4);
                return false;
            }else{
                obj.push($('#main_brunch input:eq(' + i + ')').val());
                if(i == '4'){
                    return true;
                }
            }
        }
    }

    //===============================================
    //mainブランチを作ったあとヒントfunction
    //===============================================
    var reflexive_hint = (function(){
        var hint_num = 6;

        function hint(){
            var inHint = hintNav($('#hintNavigation'), hint_num, 'default', '30%');
            hintNavPos(inHint, '', '', 20, 20)
                .then(function(){return flashHint(inHint)})
                .then(function(){return delay(10000)})
                .then(function(){return deleteHint(inHint)})
                .then(function(){return delay(7000)})
                .then(function(){
                    hint_num++;
                    if(hint_num !== Object.keys(json).length){
                        reflexive_hint.create_hint();
                    }
                });
        }
        return {
            create_hint: function(){
                hint();
            }
        }
    })();

    function hintNav_after_first_brunch(){
        var hint = hintNav($('#hintNavigation'), 5, 'top', '40%');
        var left = ($('#hintNavigation').width() - hint.outerWidth()) / 2;
        hintNavPos(hint, '', left, 20, '')
            .then(function(){return flashHint(hint)})
            .then(function(){return delay(5000)})
            .then(function(){return deleteHint(hint)})
            .then(reflexive_hint.create_hint);
    }

    function create_first_brunch(brunch){
        //mainbrunchの生成開始
        //hintnav
        hintNav_after_first_brunch();

        var brunch_nav = $('ul #brunch');
        $('#over_scrollWrap').css('z-index', '-5');
        nav_animation.on_navColor_animation(brunch_nav);
        //======================================
        //main elementの生成
        //======================================
        var element_local = new Element(n_val(brunch[0]), socket);
        element_local.create();
        element.push(element_local);

        //mainElementのselector
        var element_selector = element[0].id_select;
        position_center(element_selector);

        //座標の再取得
        element[0].whtl.t = parseInt($(element_selector).css('top'));
        element[0].whtl.l = parseInt($(element_selector).css('left'));
        element[0].img_center();
        element[0].svg_position_down();

        //main_brunchの生成
        var rl = ['R','R','L','L'];
        var color = {
           1: '#e87ea5',
           2: '#8ac233',
           3: '#f08d5b',
           4: '#41babc'
        };
        for(var i = 1; i < brunch.length; i++){
            //mainエレメントのみ
            element[0].element_new_create(rl[i-1], brunch[i], false, color[i]);
        }
        center_scroll();
        $('textarea').blur();

        function n_val(val){
            var Val = val;
            //=============================================
            //まず改行らしき文字を\nに統一。\r、\r\n → \n
            //=============================================
            Val = Val.replace(/\r\n/g, '\n');
            Val = Val.replace(/\r/g, '\n');
            var lines = Val.split('\n');
            //=============================================
            //splitした配列を送り、インスタンスを生成する
            //=============================================
            var setting = {
                lines: lines
            };
            return setting;
        }
    }

    //===============================================
    //center position
    //===============================================
    function position_center(Selector){
        var parent = {
            selector: Selector.parent(),
        };
        parent.width = parent.selector.width();
        parent.height = parent.selector.height();

        var selector = {
            width: Selector.width(),
            height: Selector.height()
        };
        
        Selector.css({
            'top': (parent.height - selector.height)/2,
            'left': (parent.width - selector.width)/2,
            'position': 'absolute'
        });
    }
    //===============================================
    //draggable square
    //===============================================
    function draggable_square(){
        //img_confirmation を中心に配置する
        position_center($('#img_confirmation'));
        $('#img_confirmation .square').draggable({
            containment: '#main',
            scroll: false,
            opacity: 0.5,
            stop: function(){
                select_animation_move(this);
            },
            drag: function(){
                select_animation_move(this);
            }
        });
        function select_animation_move(that){
            var name_rel = $(that).attr('rel');
            var select_name_rel = name_rel.split('/');
            var select_arr = search_select_animation_rel(select_name_rel[0] + select_name_rel[1]);
            var select_other = {
                one: {
                    0: select_arr[0],
                    1: select_arr[1]
                },
                two: {
                    0: select_arr[0],
                    1: select_arr[1]
                }
            };
            var name = [
                ['tl','tr'],
                ['bl','br']
            ];
            select_other.one[0] = swich_arr(select_other.one[0]);
            select_other.two[1] = swich_arr(select_other.two[1]);
            function swich_arr(arr){
                switch(arr){
                    case 0:
                        return arr = 1;
                        break;
                    case 1:
                        return arr = 0;
                        break;
                }
            }
            var left = parseInt($(that).css('left'));
            var top = parseInt($(that).css('top'));
            var select_animation_selector_one = $('#select_animation_' + select_name_rel[0]);
            var select_animation_selector_two = $('#select_animation_' + select_name_rel[1]);
            var select_animation_selector_three = $('#select_animation_' + select_name_rel[2]);
            var select_animation_selector_four = $('#select_animation_' + select_name_rel[3]);
            
            var select_w = parseInt(select_animation_selector_one.css('width'));
            
            var square_selector_one = $('#square_' + name[select_other.one[0]][select_other.one[1]]);
            var square_selector_two = $('#square_' + name[select_other.two[0]][select_other.two[1]]);
            //gifの位置
            select_animation_selector_one.css('top', top);
            select_animation_selector_two.css('left', left);
            //squareの位置
            square_selector_two.css('top',top);
            square_selector_one.css('left', left);
            //gifの領域
            if(select_name_rel[1] == 'l'){
                select_animation_selector_one.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
                select_animation_selector_three.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
                
                select_animation_selector_one.css('left', left + 5);
                select_animation_selector_three.css('left', left);
                
                select_animation_selector_one.css('top', top + 5);
            }else{
                select_animation_selector_one.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
                select_animation_selector_three.css('width', Math.abs(parseInt(square_selector_two.css('left')) - left));
                
                select_animation_selector_one.css('top', top + 5);
            }
            
            if(select_name_rel[0] == 't'){
                select_animation_selector_two.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
                select_animation_selector_four.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
                select_animation_selector_two.css('top', top + 5);
                select_animation_selector_four.css('top', top);
                
                select_animation_selector_two.css('left', left + 5);
            }else{
                select_animation_selector_two.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
                select_animation_selector_four.css('height', Math.abs(parseInt(square_selector_one.css('top')) - top));
                
                select_animation_selector_two.css('left', left + 5);
            }
        }
        function search_select_animation_rel(rel){
            var name = [
                ['tl','tr'],
                ['bl','br']
            ];
            var search = [];
            for(var i = 0; i < name.length; i++){
                for(var x = 0; x < name[i].length; x++){
                    if(name[i][x] == rel){
                        search[0] = i;
                        search[1] = x;
                        return search;
                    }
                }
            }
        }
    }//draggable end

    //===============================================
    //createjs canvas class
    //===============================================
    function Canvas(number, access_img){
        this.canvas = document.getElementById('main_canvas' + number);
        this.canvas_id = number;
        //imgのハッシュ
        this.access_img = access_img;

        this.stage = new createjs.Stage(this.canvas);
        this.shape = new createjs.Shape();
        this.tick = createjs.Ticker;
        this.select_color = '';
    
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
        this.color_selector();
        this.stageEvent();
        this.socket();
    };

    Canvas.prototype.color_selector = function(){
        var that = this;
        //カラーの情報
        var color = {
            pink: '#e87ea5',
            green: '#8ac233',
            blue: '#41babc',
            yellow: '#f4dd25',
            orange: '#f08d5b',
            brown: '#7a5749',
            gray: '#a3a3a3',
            black: '#3e3a39'
        };

        //button animation-------------------
        var eraser = $('#eraser');
        //colorBox
        $('#colorBox_top > div, #colorBox_bottom > div').on('click', function(){
            var colorBox = $('#colorBox_top, #colorBox_bottom');
            //colorBoxの中の要素にbox-shadowのクラスが追加されている可能性があるためあらかじめ削除する。
            colorBox.find('.colorCircle_click_after').removeClass('colorCircle_click_after');
            //消しゴムが選択されている場合があるのでanimationクラスを削除しておく
            eraser.removeClass('eraser_click_after');
            //色情報をidから取得し、this.now_colorに代入
            var colorBox = $(this).find('div');
            that.select_color = color[colorBox.attr('id')];
            //thisからクリックしたボタンを判定しbox-shadowのクラスを追加する
            colorBox.addClass('colorCircle_click_after');
        });
        //eraser
        eraser.on('click', function(){
            that.select_color = '#fff';
            //色が選択されている場合があるのであらかじめanimationクラスを削除しておく
            $('#colorBox_top, #colorBox_bottom').find('.colorCircle_click_after').removeClass('colorCircle_click_after');
            eraser.addClass('eraser_click_after');
        });
    };
    
    Canvas.prototype.stageEvent = function(){
        var stage = this.stage;
        var that = this;

        stage.addEventListener('stagemousedown', mouseDown, false);

        function mouseDown(e){
            if(that.select_color !== ''){
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
        }
        function mouseMove(e){
            that.position.newX = parseInt(e.stageX);
            that.position.newY = parseInt(e.stageY);
            that.shape.graphics.clear().setStrokeStyle(5, 'round', 'round').beginStroke(that.select_color).moveTo(that.position.oldX,that.position.oldY).lineTo(that.position.newX,that.position.newY);
            that.emit_draw_coord.push($.extend('true', {}, {
                newX: that.position.newX,
                newY: that.position.newY
            }));
            //座標の入れ替え
            that.position.oldX = parseInt(e.stageX);
            that.position.oldY = parseInt(e.stageY);
            stage.update();
        }
        function mouseUp(e){
            stage.removeEventListener('stagemousemove', mouseMove, false);
            //canvas以外をクリックしても判定されるバグあり
            if(that.emit_draw_coord.length !== 0){
                that.emit_draw_coord['0']['color'] = that.select_color;
                socket.emit('send_draw_coord',{XY: that.emit_draw_coord, number: that.canvas_id});
                //参照させないように座標をpushする
                that.all_draw_coord.push($.extend(true, {}, that.emit_draw_coord));
                //emitしたあとemit_draw_coordの中身を完全に削除し使い回せるようにする
                that.emit_draw_coord.splice(0,that.emit_draw_coord.length);
            }
        }
    };
    
    Canvas.prototype.handleTick = function() {
        this.stage.update();
    };

    Canvas.prototype.create_img = function(){
        if($('#img_confirmation').css('display') === 'none'){
            socket.emit('broadcast_load', {number: this.canvas_id});
            var img = new Image;
            var type = 'image/png';
            img.src = this.canvas.toDataURL(type);
            var access_length = Object.keys(this.access_img).length;

            this.access_img[access_length] = new Img(img, access_length, socket, this.delete_canvas.bind(this), this.canvas_id, 'main_brunch');
            this.access_img[access_length].create();
        }
    };

    Canvas.prototype.create_img_second = function(){
        if($('#img_confirmation').css('display') === 'none'){
            socket.emit('broadcast_load', {number: this.canvas_id});
            var img = new Image;
            var type = 'image/png';
            img.src = this.canvas.toDataURL(type);
            var access_length = Object.keys(this.access_img).length;

            this.access_img[access_length] = new Img(img, access_length, socket, this.delete_canvas.bind(this), this.canvas_id);
            this.access_img[access_length].create();
        }
    };

    Canvas.prototype.delete_canvas = function(){
        this.stage.removeChild(this.shape);
        this.stage.clear();
        this.stage.update();

        this.shape = new createjs.Shape();
        this.stage.addChild(this.shape);
        this.stage.update();
    };
    
    Canvas.prototype.socket = function(){
        var that = this;
        //送られてきたarrayの座標通り描画する
        socket.on('draw_canvas' + that.canvas_id, function(data){
            for(var i = 1; i < data.XY.length - 1; i++){
                  that.shape.graphics.clear().setStrokeStyle(5, 'round', 'round').beginStroke(data.XY['0']['color']).moveTo(data.XY[i].newX,data.XY[i].newY).lineTo(data.XY[i+1].newX,data.XY[i+1].newY);
                  that.stage.update();
            }
            that.all_draw_coord.push($.extend(true, {}, data.XY));
        });
    };
});