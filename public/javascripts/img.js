var Img = function(img, id, socket, deleteFn, canvas_num, emit_socket_name){
	this.img = img;
	this.id = id;
	this.img_id = 'img' + this.id;
	this.socket = socket;
	this.deleteFn = deleteFn;
	this.canvas_num = canvas_num;

	this.emit_socket_name = emit_socket_name;
};

Img.prototype.create = function(){
	var that = this;
	var img_selector = $('#img');
	var confirmation_selector = $('#confirmation');
	var img_confirmation_selector = $('#img_confirmation');

	this.dom_img = $('<img>',{src: this.img.src, id: this.img_id});

	confirmation_selector.fadeIn();
	img_confirmation_selector.fadeIn();
	this.enter_menu();
};

Img.prototype.enter_menu = function(){
	var that = this;
	//enter menu
	var menu = $('<img>', {
		src: '/images/finish_trimming.png',
		class: 'end_trim'
	});
	var img_confirmation_selector = $('#img_confirmation');
	img_confirmation_selector.append(menu);
	//remove menu
	
	//edit menu
	
	//enter event
	menu.on({
		'click': function(){
			that.enter_confirmation();
		}
	});
};

Img.prototype.enter_confirmation = function(){
	this.deleteFn();

	var img_confirmation_selector = $('#img_confirmation');
	var square_tl_selector = $('#img_confirmation #square_tl');
	var square_br_selector = $('#img_confirmation #square_br');
	
	var square_tl_pos = {
		t: parseInt(square_tl_selector.css('top')),
		l: parseInt(square_tl_selector.css('left'))
	};
	var square_br_pos = {
		t: parseInt(square_br_selector.css('top')),
		l: parseInt(square_br_selector.css('left'))
	};
	this.square = {
		w: Math.abs(square_br_pos.l - square_tl_pos.l),
		h: Math.abs(square_br_pos.t - square_tl_pos.t)
	};
	var img_confirmation_pos = {
		t: parseInt(img_confirmation_selector.css('top')),
		l: parseInt(img_confirmation_selector.css('left'))
	};
	this.dom_img_pos = {
		t: -(square_tl_pos.t + img_confirmation_pos.t),
		l: -(square_tl_pos.l + img_confirmation_pos.l)
	}

	//overflowを追加し、画像を挿入する
	this.add_overflow();

	this.position_center(this.overflow_div);
	this.overflow_div_pos = {
		t: parseInt(this.overflow_div.css('top')),
		l: parseInt(this.overflow_div.css('left'))
	};

	$('#img_confirmation').css('display','none');
	//=============================================
	//loading end
	//=============================================
	//otheruserに画像を生成させる
	this.socket.emit('broadcast_load_end', {
		square: this.square,
		dom_img_pos: this.dom_img_pos,
		overflow_div_pos: this.overflow_div_pos,
		access_num: this.id,
		canvas_num: this.canvas_num
	});
	//central imgの生成時はmain_brunchの行程に移るためにemitをしなければならない
	if(this.emit_socket_name){
		this.socket.emit(this.emit_socket_name);
	}
};

Img.prototype.add_overflow = function(){
	//=============================================
	//confirmationのfadeout
	//=============================================
	//背景灰色のconfirmation
	var confirmation_selector = $('#confirmation');
	//画像を挿入するimg
	var main_img_selector = $('#img');
	confirmation_selector.fadeOut();

	//=============================================
	//overflow_div と imgの追加
	//=============================================
	this.overflow_div = $('<div>',{class: 'overflow_img', id: 'div' + this.id});
	main_img_selector.append(this.overflow_div);
	this.overflow_div.css({
		'width': this.square.w,
		'height': this.square.h,
		'overflow': 'hidden',
		'display': 'block',
		'position': 'absolute',
		'cursor': 'pointer'
	});
	var dom_img = $('<img>',{src: this.img.src, id: this.img_id});
	this.overflow_div.append(dom_img);
	dom_img.css({
		'top': this.dom_img_pos.t,
		'left': this.dom_img_pos.l,
		'position': 'absolute'
	});
	this.event();
}

Img.prototype.event = function(){
	var that = this;
	this.overflow_div.draggable({
		containment: 'parent',
		scroll: false,
		opacity: 0.5,
		zIndex: 10,
		start: function(){	
		},
		stop: function(){
			that.send_img_pos(this, that.id);
		},
		drag: function(){
		}
	});
};

Img.prototype.send_img_pos = function(that, id){
	var img_pos = {
		t: parseInt($(that).css('top')),
		l: parseInt($(that).css('left'))
	};
	this.socket.emit('move_img', {
		img_pos: img_pos,
		id: id
	});
};

Img.prototype.img_move = function(top, left){
	$('#div' + this.id).css({
		top: top,
		left: left,
	});
};

Img.prototype.position_center = function(Selector){
	var parent = {
		selector: Selector.parent()
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
};

//===========================
//create centralImg otherUser
//===========================
var Img_secondUser = function(data, img, socket){
	//data square dom_img_pos overflow_div_pos access_num canvas_num
	this.id = data.access_num;
	this.square = data.square;
	this.dom_img_pos = data.dom_img_pos;
	this.overflow_div_pos = data.overflow_div_pos;
	this.access_num = data.access_num;
	this.canvas_num = data.canvas_num;

	this.img = img;

	this.socket = socket;
};

Img_secondUser.prototype.add_overflow = Img.prototype.add_overflow;
Img_secondUser.prototype.event = Img.prototype.event;
Img_secondUser.prototype.send_img_pos = Img.prototype.send_img_pos;
Img_secondUser.prototype.img_move = Img.prototype.img_move;

Img_secondUser.prototype.create = function(){
	var that = this;
	this.add_overflow();
	this.overflow_div.css({
		top:  that.overflow_div_pos.t,
		left: that.overflow_div_pos.l
	});
};