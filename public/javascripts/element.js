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

Element.prototype.create = function(){
	var main = $('#main');
	//=============================================
	//divの生成
	//=============================================
	main.prepend('<div class=rad_map id=' + this.sub_id + '><span></span></div>');
	//セレクター
	this.id_select = $('#main').find('#' + this.sub_id);
	this.id_select_span = this.id_select.find('span');
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
		'left': this.whtl.l
    });
    this.whtl.w = this.id_select.outerWidth();
    this.whtl.h = this.id_select.outerHeight();

    //=============================================
	//メニュの生成
	//=============================================
	this.id_select_span.after("<img src=/images/plus.png class='plus_l plus' rel=L>");
	this.id_select_span.after("<img src=/images/plus.png class='plus_r plus' rel=R>");
	var circle_h = 15;
	var h = (this.id_select.outerHeight() - circle_h) / 2;
	var img_plus = this.id_select.find('.plus');
	img_plus.css({
		'top': h
	});
	//=============================================
	//イベント
	//=============================================
	this.add_event();
};

Element.prototype.edit = function(){
	//セレクター
	var main = $('#main');
	var that = this;
	//targetを一旦削除する
	this.id_select.remove();
	//textareaの生成
	main.prepend('<textarea id=editarea>' + this.whtl.value + '</textarea>');
	var editarea = main.find('#editarea');
	//editareaにフォーカスを当てる
	editarea.focus();
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
				that.create();
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
	console.log(this.whtl);
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
	this.id_select.on({
		'dblclick': function(){
			that.whtl.value = that.id_select_span.html();
			that.edit();
		},
		'mouseenter': function(){
			$(this).find('img').stop(true,false).animate({
				opacity: 1
			},200);
		},
		'mouseleave': function(){
			$(this).find('img').stop(true,false).animate({
				opacity: 0
			},200);
		}
	});
	//img plus
	img_plus.on({
		'click': function(){
			var RL = $(this).attr('rel');
			that.element_new_create(RL, undefined, true);
		}
	});
};

//main brunchを作る場合rlがある
Element.prototype.element_new_create = function(rl, val, emit){
	var RL = rl;
	var sub_id = this.sub_id + '_sub' + this.sub_num;
	var sub_create = new SubElement(this.whtl, sub_id, RL, this);
	this.sub_num++;
	this.subElement_all.push(sub_create);
	sub_create.edit('main', val, emit);
};