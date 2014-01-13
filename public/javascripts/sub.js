function SubElement(whtl, sub_id, RL, up_hierarchy_this, color){
	//whtl, sub_id, subElement, RL, svg, up_hierarchy_this, socket, up_sub_id
	//上の階層のthis
	this.up_hierarchy_this = up_hierarchy_this;
	this.whtl = {
		w: whtl.w,
		h: whtl.h,
		t: whtl.t,
		l: whtl.l
	};
	this.val = '';
	//html id名
	this.sub_id = sub_id;
	//下の階層にエレメントの数はサーバーから取得する
	this.subElement_all = [];
	this.subElement_all_same_hierarchy = this.up_hierarchy_this.subElement_all;
	this.main_or_sub = 0;
	this.R_or_L = RL;
	
	this.svg = {
		//上の階層のsvg_position 
		svg_position_up: this.up_hierarchy_this.svg,
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
	
	//acess
	access[this.sub_id] = this;
	this.socket = this.up_hierarchy_this.socket;
	//上の階層のsub_id
	this.up_sub_id = this.up_hierarchy_this.sub_id;
	this.color = color;
	this.sub_menu_status = {
		star: 'off',
		bold: 'off',
		backgroundcolor: 'off'
	};
}

//test
SubElement.prototype.create = function(emit, mode){
	var main = $('#brunch_area');
	var that = this;
	//=============================================
	//divの生成
	//=============================================
	main.prepend('<div class=rad_map id=' + this.sub_id + '><span></span></div>');
	//セレクター
	this.id_select = main.find('#' + this.sub_id);
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
		'width': that.id_select_span.width() + 30,
		'height': that.id_select_span.height(),
		'padding-top': 8,
		'padding-bottom': 8,
		'background-color': that.color
    });
    this.whtl.w = this.id_select.outerWidth();
    this.whtl.h = this.id_select.outerHeight();
    //=============================================
	//svgの座標取得　svgインスタンスの生成
	//=============================================
    this.img_center();
	
	if(this.svg.svg == undefined){
		this.svg.svg = new SVG(this);
    }else{
    	//mode == 1 edit
		this.svg.svg.position(1);
		this.svg_position_down();
    }
	this.id_select.css({
		'top': that.whtl.t,
		'left': that.whtl.l
	});

	//=============================================
	//socket
	//=============================================
	if(mode === 'main' && emit !== false){
		console.log('downhierarchy');
		console.log(that.up_sub_id);
		console.log(that.sub_id);
		this.socket.emit('broadcast_subElement_create',{
			id: that.up_sub_id,
			sub_id: that.sub_id,
			val: that.val,
			rl: that.R_or_L,
			t: that.whtl.t,
			l: that.whtl.l,
		});
	}else if(mode === 'edit'){
		this.socket.emit('broadcast_subElement_brunchEdit', {
			id: this.sub_id,
			val: this.val
		});
	}

    //=============================================
	//メニュの生成
	//=============================================
	this.create_menu();

	this.id_select_span.after("<img src=/images/plus.png class='plus_l plus' rel=L>");
	this.id_select_span.after("<img src=/images/plus.png class='plus_r plus' rel=R>");
	this.id_select_span.after("<img src=/images/delete.png class='delete' rel=delete>");
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

SubElement.prototype.create_menu = function(){
	var that = this;
	this.sub_menu = $('<div>', {
		class: 'sub_menu'
	});
	var star_menu = $('<div>', {class: 'star_menu'});
	var bold_menu = $('<div>', {class: 'bold_menu'});
	var backgroundcolor_menu = $('<div>', {class: 'backgroundcolor_menu'});

	//sub_menuにmenu要素をappendする
	this.sub_menu.append(star_menu).append(bold_menu).append(backgroundcolor_menu);
	this.id_select.append(this.sub_menu);
	this.hide_sub_menu_top = 7;
	this.show_sub_menu_top = that.id_select.outerHeight() - 7;
	this.sub_menu.css({
		'width': that.id_select.width() - 6,
		'border-color': that.color,
		'top': that.hide_sub_menu_top
	});
	//dblclickしてeditをしたとき、starを生成する
	Object.keys(this.sub_menu_status).forEach(function(key){
		if(that.sub_menu_status[key] === 'on'){
			that.otherUser_menu_change(key);
		}
	})
};

SubElement.prototype.add_event = function(){
	var that = this;
	//imgのセレクター
	var img_plus = this.id_select.find('.plus');
	var img_delete = this.id_select.find('.delete');
	//ui drag
    this.drag_event();
    this.img_center();
	//エレメントのイベント
	this.id_select.on({
		'mouseenter': function(){
			$(this).find('img').stop(true,false).animate({
				opacity: 1
			},200);
			//sub_menuの表示
			that.sub_menu.stop(true,false).animate({
				'top': that.show_sub_menu_top,
				'opacity': '1'
			});
		},
		'mouseleave': function(){
			$(this).find('img').stop(true,false).animate({
				opacity: 0
			},200);
			//sub_menuの非表示
			that.sub_menu.stop(true,false).animate({
				'top': that.hide_sub_menu_top,
				'opacity': '0'
			});
		}
	});
	this.id_select_span.on({
		'dblclick': function(){
			that.val = $(this).html();
			that.val = that.val.split('<br>');
			that.main_or_sub = 1;
			that.edit('edit', that.val);
		}
	});
	//img plusのイベント
	//subelement create
	img_plus.on({
		'click': function(){
			var RL = $(this).attr('rel');
			that.element_new_create(RL, undefined, true);
		}
	});
	//img delete
	img_delete.on({
		'click': function(){
			that.search_delete_element();
			that.socket.emit('broadcast_delete_element', {id: that.sub_id});
		}
	});
	//sub menuイベント
	var star = this.sub_menu.find('.star_menu');
	var bold = this.sub_menu.find('.bold_menu');
	var backgroundcolor = this.sub_menu.find('.backgroundcolor_menu');

	this.sub_menu_animation_func = (function(){
		function addclass_animation(that){
			$(that).addClass('sub_menu_click_after');
		}
		function removeclass_animation(that){
			$(that).removeClass('sub_menu_click_after');
		}
		var on_css_animation = {
			star: function(_that, emit_name){
				addclass_animation(_that);
				that.id_select_span.addClass('star_before');
				//starの変更をbroadcastする
				if(emit_name !== undefined){
					that.socket.emit('broadcast_menu_change', {
						menu: 'star',
						id: that.sub_id
					});
				}
				that.sub_menu_status['star'] = 'on';
			},
			bold: function(_that, emit_name){
				addclass_animation(_that);
				that.id_select_span.css('font-weight', 'bold');
				//boldの変更をbroadcastする
				if(emit_name !== undefined){
					that.socket.emit('broadcast_menu_change', {
						menu: 'bold',
						id: that.sub_id
					});
				}
				that.sub_menu_status['bold'] = 'on';
			},
			backgroundcolor: function(_that, emit_name){
				addclass_animation(_that);
				//backgroundcolorの変更をbroadcastする
				if(emit_name !== undefined){
					that.socket.emit('broadcast_menu_change', {
						menu: 'backgroundcolor',
						id: that.sub_id
					});
				}
				that.sub_menu_status['backgroundcolor'] = 'on';
			}
		};
		var off_css_animation = {
			star: function(_that, emit_name){
				removeclass_animation(_that);
				that.id_select_span.removeClass('star_before');
				if(emit_name !== undefined){
					that.socket.emit('broadcast_menu_change', {
						menu: 'star',
						id: that.sub_id
					});
				}
				that.sub_menu_status['star'] = 'off';
			},
			bold: function(_that, emit_name){
				removeclass_animation(_that);
				that.id_select_span.css('font-weight', '');
				if(emit_name !== undefined){
					that.socket.emit('broadcast_menu_change', {
						menu: 'bold',
						id: that.sub_id
					});
				}
				that.sub_menu_status['bold'] = 'off';
			},
			backgroundcolor: function(_that, emit_name){
				removeclass_animation(_that);
				if(emit_name !== undefined){
					that.socket.emit('broadcast_menu_change', {
						menu: 'bold',
						id: that.sub_id
					});
				}
				that.sub_menu_status['backgroundcolor'] = 'off';
			}
		};

		return {
			click_animation: function(emit_name){
				var class_name = $(this).attr('class');
				var menu_name = class_name.split('_')['0'];
				var decide_off_func = class_name.split(' ')['1'];
				//現在の状態がonなのかoffなのか判定する
				if(decide_off_func === 'sub_menu_click_after'){
					off_css_animation[menu_name](this, emit_name);
				}else{
					on_css_animation[menu_name](this, emit_name);
				}
			}
		};
	})();
	this.sub_menu.find('div').on('click', function(){
		that.sub_menu_animation_func.click_animation.bind(this)('broadcast_menu_change');
	});
};

SubElement.prototype.otherUser_menu_change = function(menu_name){
	var name = '.' + menu_name + '_menu';
	var selector = this.id_select.find(name);
	this.sub_menu_animation_func.click_animation.apply(selector);
}

//test
SubElement.prototype.edit = function(mode, val, emit){
	//セレクター
	var main = $('#brunch_area');
	var that = this;
	//textarea
	var txtarea = $('<textarea>', {id: 'editarea'});
	if(val !== undefined){
		val = (val instanceof Array) ? val : [val];
		main.prepend(txtarea);
		for (var i = 0; i < val.length; i++) {
			if (0 < i) {
				txtarea.append('\n');
			}
			txtarea.append(val[i]);
		}
	}else{
		main.prepend(txtarea);
	}
	var editarea = main.find('#editarea');
	//editareaにフォーカスを当てる
	this.text_focus(editarea);
	
	//editareaの位置
	//=============================================
	//状況によってeditareaの位置を変える
	//=============================================
	if(mode == 'main'){
		//mainから初めてsubElementを作るとき。
		if(this.subElement_all_same_hierarchy.length == 1){
			//imgのleftかrightのどちらかをクリックしたのか判定する。
			if(this.R_or_L == 'R'){
				this.editarea_css(editarea, this, -this.whtl.w, 0, -30);
			}else{
				this.editarea_css(editarea, this, this.whtl.w, 0, 30);
			}
			this.whtl.t = parseInt(editarea.css('top'));
			this.whtl.l = parseInt(editarea.css('left'));
		}else{
		//mainからsubElementを作るとき　２個目以上
		//imgのleftかrightのどちらかをクリックしたのか判定する。また配列からrまたはlの配列を検索する。
			var num = this.search_RL();
			//作成したのが２つ目で、それ以前にその方向が無かった場合
			if(num == undefined){
				if(this.R_or_L == 'R'){
					this.editarea_css(editarea, this, -this.whtl.w, 0, -30);
				}else{
					this.editarea_css(editarea, this, this.whtl.w, 0, 30);
				}
			}else{
				this.editarea_css(editarea, this.subElement_all_same_hierarchy[num], 0, 50, 0);
			}
			this.whtl.t = parseInt(editarea.css('top'));
			this.whtl.l = parseInt(editarea.css('left'));
		}
	}
	if(mode == 'edit'){
		this.id_select.remove();
		this.editarea_css(editarea, this, 0, 0, 0);
	}
	if(mode == 'sub'){
	}
	//edit textareaのフォーカスを出たとき
	editarea.on({
			'blur': function(){
				that.val = that.val_split(this);
				//=============================================
				//splitした配列を送り、divを生成する
				//=============================================
				editarea.remove();
				that.create(emit, mode);
			}
	});
	//他の人が編集した場合blurしてcreateさせる index.jsのsocket subElement_createからの場合emit = false
	if(emit === false){
		editarea.blur();
	}
};

SubElement.prototype.val_split = function(that){
	var txtVal = $(that).val();
	//=============================================
	//まず改行らしき文字を\nに統一。\r、\r\n → \n
	//=============================================
	txtVal = txtVal.replace(/\r\n/g, '\n');
	txtVal = txtVal.replace(/\r/g, '\n');
	txtVal = txtVal.replace(',', '\n');
	return txtVal.split('\n');
};

SubElement.prototype.editarea_css = function(editarea, _this, box_w, minus_t, minus_l){
	//box_w　一つ上の階層のwidth
	//mode=main + mainから初めてsubElementを作るとき _thisはmainのelementそのもの
	//mode=main + mainから二個目以上のsubElementをつくるとき　_thisは一つ上の階層のelement
	//thisはsubElementそのもの
	var that = _this;
	var editarea_top = _this.whtl.t - minus_t;
	var editarea_left = _this.whtl.l - box_w - minus_l;
	editarea.css({
		'position': 'absolute',
		'width': that.whtl.w,
		'heigh': that.whtl.h,
		'top': editarea_top,
		'left': editarea_left
	});
};

SubElement.prototype.search_RL = function(){
	if(this.R_or_L == 'R'){
		return search('R', this);
	}else{
		return search('L' ,this);
	}
	function search(mode, that){
		var rl_num = 0;
		
		for(var i = that.subElement_all_same_hierarchy.length; i > 0; i--){
			if(that.subElement_all_same_hierarchy[i-1] != undefined){
				if(that.subElement_all_same_hierarchy[i-1].R_or_L == mode){
					rl_num++;
					if(rl_num == 2){
						return i-1;
					}
				}
			}
		}
	}
};

SubElement.prototype.drag_event = function(){
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

SubElement.prototype.move_element = function(that){
	this.whtl.t = parseInt($(that).css('top'));
	this.whtl.l = parseInt($(that).css('left'));
	this.img_center();
	//mode == 1 edit
	this.svg.svg.position(1);
	this.svg_position_down();

	this.socket.emit('broadcast_drag_element',{t: this.whtl.t, l: this.whtl.l, id: this.sub_id, main_or_sub: 'sub'});
};

SubElement.prototype.img_center = function(){
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

SubElement.prototype.svg_position_down = function(){
	for(var i = 0; i < this.subElement_all.length; i++){
		this.subElement_all[i].svg.svg.svg_position(1);
	}
};
//subelement create
SubElement.prototype.element_new_create = function(rl, val, emit){
	var that = this;
	var RL = rl;
	//downhierarchyをサーバーから取得する
	this.socket.emit('getDownHierarchy', this.sub_id, function(num){
		var downHierarchy = num;
		var sub_id = that.sub_id + '_sub' + downHierarchy;
		console.log(sub_id);
		var sub_create = new SubElement(that.whtl, sub_id, RL, that, that.color);
		that.subElement_all.push(sub_create);
		sub_create.edit('main', val, emit);
	});
};

//test
SubElement.prototype.otherUser_element_new_create = function(rl, val, t, l, id){
	var RL = rl;
	var sub_id = id;
	var sub_create = new SubElement(this.whtl, sub_id, RL, this, this.color);
	
	sub_create.val = val;
	sub_create.whtl.t = t;
	sub_create.whtl.l = l;

	this.subElement_all.push(sub_create);
	sub_create.create(false, 'main');
};

SubElement.prototype.search_delete_element = function(){
	//削除するエレメントの検索
	search_delete_element(this);
	//参照データの削除
	this.search_sub_id();
	
	function search_delete_element(that){
		if(that.subElement_all.length == 0){
			that.delete_dom_element();
		}else{
			for(var i = 0; i < that.subElement_all.length; i++){
				that.delete_dom_element();
				search_delete_element(that.subElement_all[i]);
			}
		}
	}
};

SubElement.prototype.delete_dom_element = function(){
	this.id_select.remove();
	this.svg.svg.delete();
};

SubElement.prototype.search_sub_id = function(){
	var name_arr = this.sub_id.replace('element', '').replace('sub', '').split('_');
	delete this.up_hierarchy_this.subElement_all[name_arr[name_arr.length-1]];
};

SubElement.prototype.text_focus = Element.prototype.text_focus;

SubElement.prototype.otherUser_edit = function(val){
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
    });
    this.whtl.w = this.id_select.outerWidth();
    this.whtl.h = this.id_select.outerHeight();
    //=============================================
	//svgの座標取得　svgインスタンスの生成
	//=============================================
    this.img_center();
    this.svg.svg.position(1);
	this.svg_position_down();
};