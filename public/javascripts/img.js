var Img = function(img, id, socket){
	this.img = img;
	this.id = id;
	this.img_id = 'img' + this.id;
	this.socket = socket;
};

Img.prototype.create = function(){
	var that = this;
	var img_selector = $('#img');
	var confirmation_selector = $('#confirmation');
	var img_confirmation_selector = $('#img_confirmation');

	this.dom_img = $('<img>',{src: this.img.src, id: this.img_id});
	//トリミング用の画像の生成
	// confirmation_selector.append(this.dom_img);
	// this.dom_img.on('load',function(){
	// 	$(this).css({
	// 		'width': '300px',
	// 		'height': '300px'
	// 	});
	// 	that.position_center(confirmation_selector.find('#' + that.img_id));
	// 	confirmation_selector.fadeIn();
	// 	img_confirmation_selector.fadeIn();
	// });

	confirmation_selector.fadeIn();
	img_confirmation_selector.fadeIn();
	this.enter_menu();

	/*
	$(confirmation_selector.find('#' + that.img_id)).on({
		'dblclick': function(){
				that.enter_confirmation();
				//this.event();		
				}
	});
	*/
};

Img.prototype.create_second = function(data){
	var that = this;
	var img_selector = $('#img');
	var confirmation_selector = $('#confirmation');
	var img_confirmation_selector = $('#img_confirmation');

	console.log(data);
	//data.br data.tl
	var square = {
		w: Math.abs(data.br.l - data.tl.l),
		h: Math.abs(data.br.t - data.tl.t)
	};
	//=============================================
	//overflow_div と imgの追加
	//=============================================
	var overflow_div = $('<div>',{class: 'overflow_img', id: 'div' + this.id})
	.appendTo(img_selector)
	.css({
		'width': square.w,
		'height': square.h,
		'overflow': 'hidden',
		'display': 'block',
		'position': 'absolute'
	});

	$('<img>',{src: this.img.src, id: this.img_id})
	.appendTo(overflow_div)
	.css({
		'top': -data.tl.t,
		'left': -data.tl.l,
		'position': 'absolute',
		'width': '300px'
	});
	this.position_center(overflow_div);
};

Img.prototype.enter_menu = function(){
	var that = this;
	//enter menu
	var menu = $('<div>',{class: 'enter'});
	var img_confirmation_selector = $('#img_confirmation');
	img_confirmation_selector.append(menu);
	menu.append('enter');

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
	var square_tl_selector = $('#img_confirmation #square_tl');
	var square_br_selector = $('#img_confirmation #square_br');
	var img_selector = $('#confirmation #' + this.img_id);
	
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
	var img = {
		t: parseInt(img_selector.css('top')),
		l: parseInt(img_selector.css('left'))
	};
	//=============================================
	//confirmationのfadeout 画像の削除
	//=============================================
	var confirmation_selector = $('#confirmation');
	var confirmation_img_selector = confirmation_selector.find('#' + this.img_id);
	var main_img_selector = $('#img');
	confirmation_selector.fadeOut(300, function(){
		confirmation_img_selector.remove();
	});
	
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
		'position': 'absolute'
	});
	var dom_img = $('<img>',{src: this.img.src, id: this.img_id});
	this.overflow_div.append(dom_img);
	dom_img.css({
		'top': -square_tl_pos.t,
		'left': -square_tl_pos.l,
		'position': 'absolute',
		'width': '300px'
	});
	this.event();
	this.position_center(this.overflow_div);
	$('#img_confirmation').css('display','none');
	//=============================================
	//loading end
	//=============================================
	this.socket.emit('broadcast_load_end', {tl: square_tl_pos, br: square_br_pos});
	this.socket.emit('main_brunch');
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