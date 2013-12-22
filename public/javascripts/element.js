function Element(setting, socket){
	this.val = setting.lines;
	this.sub_num = 0;
	this.sub_id = 'element';
	this.whtl = {
		w: 0,
		h: 0,
		t: 0,
		l: 0
	};
	this.svg = {
		svg_position: {
			//右の画像の中心座標
			r_img: {
				x: 0,
				y: 0
			},
			//左の画像の中心座標
			l_img: {
				x: 0,
				y: 0
			},
			//エレメントの上のy座標
			top: {
				y: 0
			},
			//エレメントの下のy座標
			bottom: {
				y: 0
			},
			//エレメントの左のx座標
			left: {
				x: 0
			},
			//エレメントの右のx座標
			right: {
				x: 0
			}
		}
	};
	this.subElement_all = [];
	//acess
	access[this.sub_id] = this;
	this.socket = socket;
}

Element.prototype.create = function(emit_flag){
	var main = $('#brunch_area');
	//=============================================
	//divの生成
	//=============================================
	main.prepend('<div class=rad_map id=' + this.sub_id + '><span></span></div>');
	//セレクター
	this.id_select = main.find('#' + this.sub_id);
	this.id_select_span = this.id_select.find('span');
	//id centralを追加する
	this.id_select.addClass('central');
	//生成したdivに文字を流し込む
	for (var i = 0; i < this.val.length; i++) {
		if (0 < i) {
			this.id_select_span.append('<br />');
		}
		this.id_select_span.append(this.val[i]);
	}
	
	//作ったdivのcssの設定
    this.id_select.css({
		'position': 'absolute',
		'width': this.id_select_span.width() + 30,
		'height': this.id_select_span.height(),
		'padding-top': 8,
		'padding-bottom': 8,
		'top': this.whtl.t,
		'left': this.whtl.l,
		'color': '#3e3a39'
    });
    this.whtl.w = this.id_select.outerWidth();
    this.whtl.h = this.id_select.outerHeight();

    this.img_center();
    this.svg_position_down();
    //=============================================
	//socket
	//=============================================
	//emit flagがtrueの時はユーザーがdblclickしたときotherUserにbroadcastする
	if(emit_flag === true){
		this.socket.emit('broadcast_subElement_brunchEdit', {
			id: this.sub_id,
			val: this.val
		});
	}
    //=============================================
	//メニュの生成
	//=============================================
	this.id_select_span.after("<img src=/images/tri_left.png class='central_img_l plus' rel=L>");
	this.id_select_span.after("<img src=/images/tri_right.png class='central_img_r plus' rel=R>");
	var circle_h = 15;
	var central_bor = parseInt(this.id_select.css('border-width'));
	var h = (this.id_select.outerHeight() - circle_h - central_bor * 2) / 2;
	var img_plus = this.id_select.find('.plus');
	img_plus.css({
		'top': h
	});
	//=============================================
	//イベント
	//=============================================
	this.add_event();
};

Element.prototype.edit = function(emit_flag){
	//セレクター
	var main = $('#brunch_area');
	var that = this;
	//targetを一旦削除する
	this.id_select.remove();
	//textareaの生成
	var editarea = $('<textarea>', {id: 'editarea'});

	this.whtl.value = (this.whtl.value instanceof Array) ? this.whtl.value : [this.whtl.value];
	main.prepend(editarea);
	for (var i = 0; i < this.whtl.value.length; i++) {
		if (0 < i) {
			editarea.append('\n');
		}
		editarea.append(this.whtl.value[i]);
	}
	//editareaにフォーカスを当てる
	this.text_focus(editarea);
	editarea.css({
		'position': 'absolute',
		'width': that.whtl.w,
		'height': that.whtl.h,
		'top': that.whtl.t,
		'left': that.whtl.l,
		'z-index': 999
	});
	//edit textareaのフォーカスを出たとき
	editarea.on({
			'blur': function(){
				var txtVal = $(this).val();
				//=============================================
				//まず改行らしき文字を\nに統一。\r、\r\n → \n
				//=============================================
				txtVal = txtVal.replace(/\r\n/g, '\n');
				txtVal = txtVal.replace(/\r/g, '\n');
				that.val = txtVal.split('\n');
				//=============================================
				//splitした配列を送り、divを生成する
				//=============================================
				that.create(emit_flag);
				editarea.remove();
			}
	});
};

Element.prototype.drag_event = function(){
	var that = this;
	this.id_select.draggable({
		containment: 'parent',
		scroll: false,
		opacity: 0.5,
		stop: function(){
			that.move_element(this);
		},
		drag: function(){
			that.move_element(this);
		}
	});
};

Element.prototype.move_element = function(that){
	this.whtl.t = parseInt($(that).css('top'));
	this.whtl.l = parseInt($(that).css('left'));
	this.img_center();
	this.svg_position_down();

	//サーバーに座標とidを送る
	this.socket.emit('broadcast_drag_element',{t: this.whtl.t, l: this.whtl.l, id: this.sub_id, main_or_sub: 'main'});
};

Element.prototype.img_center = function(){
	var h_devi_2 = this.whtl.h / 2;
	this.svg.svg_position.l_img.x = this.whtl.l;
	this.svg.svg_position.l_img.y = this.whtl.t + h_devi_2;
	this.svg.svg_position.r_img.x = this.whtl.l + this.whtl.w;
	this.svg.svg_position.r_img.y = this.whtl.t + h_devi_2;
	
	this.svg.svg_position.top.y = this.whtl.t;
	this.svg.svg_position.bottom.y = this.whtl.t + this.whtl.h;
	this.svg.svg_position.left.x = this.whtl.l;
	this.svg.svg_position.right.x = this.whtl.l + this.whtl.w;
};

Element.prototype.svg_position_down = function(){
	for(var i = 0; i < this.subElement_all.length; i++){
		if(this.subElement_all[i] != undefined){
			this.subElement_all[i].svg.svg.position(1);
		}
	}
};

Element.prototype.add_event = function(){
	var that = this;
	var img_plus = this.id_select.find('.plus');
	//ui drag
	this.drag_event();
	this.img_center();
	//エレメントのイベント
	this.id_select_span.on({
		'dblclick': function(){
			that.whtl.value = that.id_select_span.html();
			that.whtl.value = that.whtl.value.split('<br>');
			that.edit(true);
		}
		// 'mouseenter': function(){
		// 	$(this).find('img').stop(true,false).animate({
		// 		opacity: 1
		// 	},200);
		// },
		// 'mouseleave': function(){
		// 	$(this).find('img').stop(true,false).animate({
		// 		opacity: 0
		// 	},200);
		// }
	});
	// //img plus
	// img_plus.on({
	// 	'click': function(){
	// 		var RL = $(this).attr('rel');
	// 		that.element_new_create(RL, undefined, true);
	// 	}
	// });
};

//main brunchを作る場合rlがある
Element.prototype.element_new_create = function(rl, val, emit, color){
	var RL = rl;
	var sub_id = this.sub_id + '_sub' + this.sub_num;
	var sub_create = new SubElement(this.whtl, sub_id, RL, this, color);
	this.sub_num++;
	this.subElement_all.push(sub_create);
	sub_create.edit('main', val, false);
};

Element.prototype.text_focus = function(that){
	var std_scrollPos = {
		t: $('#main').scrollTop(),
		l: $('#main').scrollLeft()
	};
	that.focus();
	$('#main').scrollTop(std_scrollPos.t);
	$('#main').scrollLeft(std_scrollPos.l);
};

Element.prototype.otherUser_edit = function(val){
	var that = this;
	this.val = val;

	this.id_select_span.empty();
	for (var i = 0; i < this.val.length; i++) {
		if (0 < i) {
			this.id_select_span.append('<br />');
		}
		this.id_select_span.append(this.val[i]);
	}

	//作ったdivのcssの設定
    this.id_select.css({
		'position': 'absolute',
		'width': that.id_select_span.width() + 30,
		'height': that.id_select_span.height(),
		'padding-top': 8,
		'padding-bottom': 8,
		'color': '#3e3a39'
    });
    this.whtl.w = this.id_select.outerWidth();
    this.whtl.h = this.id_select.outerHeight();
    //=============================================
	//svgの座標取得　svgインスタンスの生成
	//=============================================
    this.img_center();
	this.svg_position_down();
};

//scrollを中心に持っていく
function center_scroll(){
    var main = $('#main');
    var scrollWrap = $('#scrollWrap');

    scrollWrap_pos = {
        w: parseInt(scrollWrap.css('width')),
        h: parseInt(scrollWrap.css('height'))
    };
    main_pos = {
        w: parseInt(main.css('width')) - 320,
        h: parseInt(main.css('height'))
    };
    scroll_cal = {
        w: scrollWrap_pos.w - main_pos.w,
        h: scrollWrap_pos.h - main_pos.h
    };
    main.scrollLeft(scroll_cal.w / 2);
    main.scrollTop(scroll_cal.h / 2);
}