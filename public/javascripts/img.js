var Img = function(img, id, socket, deleteFn){
	this.img = img;
	this.id = id;
	this.img_id = 'img' + this.id;
	this.socket = socket;
	this.deleteFn = deleteFn;
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
	var square = {
		w: Math.abs(square_br_pos.l - square_tl_pos.l),
		h: Math.abs(square_br_pos.t - square_tl_pos.t)
	};
	var img_confirmation_pos = {
		t: parseInt(img_confirmation_selector.css('top')),
		l: parseInt(img_confirmation_selector.css('left'))
	};

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
		'width': square.w,
		'height': square.h,
		'overflow': 'hidden',
		'display': 'block',
		'position': 'absolute',
		'cursor': 'pointer'
	});
	var dom_img = $('<img>',{src: this.img.src, id: this.img_id});
	this.overflow_div.append(dom_img);
	dom_img.css({
		'top': -(square_tl_pos.t + img_confirmation_pos.t),
		'left': -(square_tl_pos.l + img_confirmation_pos.l),
		'position': 'absolute'
	});
	this.event();
	this.position_center(this.overflow_div);
	$('#img_confirmation').css('display','none');
	//=============================================
	//loading end
	//=============================================
	// this.socket.emit('broadcast_load_end', {tl: square_tl_pos, br: square_br_pos});
	// this.socket.emit('main_brunch');
};

Img.prototype.event = function(){
	this.overflow_div.draggable({
		containment: '#main',
		scroll: false,
		opacity: 0.5,
		zIndex: 10,
		start: function(){	
		},
		stop: function(){
		},
		drag: function(){
		}
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