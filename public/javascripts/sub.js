function SubElement(whtl, sub_id, RL, up_hierarchy_this){
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
	this.sub_id = sub_id;
	//下の階層にエレメントのnum
	this.downHierarchy_numID = 0;
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
}

SubElement.prototype.create = function(emit){
	var main = $('#main');
	var that = this;
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
	if(this.svg.svg == undefined){
		this.svg.svg = new SVG(this);
    }
	this.id_select.css({
		'top': that.whtl.t,
		'left': that.whtl.l
	});

	//=============================================
	//socket
	//=============================================
	if(emit === true){
		this.socket.emit('broadcast_subElement_create',{
			id: that.up_sub_id,
			val: that.val,
			rl: that.R_or_L
		});
	}

    //=============================================
	//メニュの生成
	//=============================================
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

SubElement.prototype.edit = function(mode, val, emit){
	//セレクター
	var main = $('#main');
	var that = this;
	//textareaの生成
	if(val !== undefined){
		main.prepend('<textarea id=editarea>' + val + '</textarea>');
	}else{
		main.prepend('<textarea id=editarea></textarea>');
	}
	var editarea = main.find('#editarea');
	//editareaにフォーカスを当てる
	editarea.focus();
	
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
				editarea.remove();
				that.create(emit);
			}
	});
	//他の人が編集した場合blurしてcreateさせる
	if(emit === false){
		$('textarea').blur();
	}
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
		'dblclick': function(){
			that.val = that.id_select_span.html();
			that.main_or_sub = 1;
			that.edit('edit');
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
	//img plusのイベント
	img_plus.on({
		'click': function(){
			var RL = $(this).attr('rel');
			that.element_new_create(RL, undefined, true);
		}
	});
	//img delete
	img_delete.on({
		'click': function(){
			that.seach_delete_element();
		}
	});
};

SubElement.prototype.element_new_create = function(rl, val, emit){
	var RL = rl;
	var sub_id = this.sub_id + '_sub' + this.downHierarchy_numID;
	var sub_create = new SubElement(this.whtl, sub_id, RL, this);
	this.downHierarchy_numID++;
	this.subElement_all.push(sub_create);
	sub_create.edit('main', val, emit);
};

SubElement.prototype.seach_delete_element = function(){
	var count = 0;
	//削除するエレメントの検索
	search_delete_element(this);
	//参照データの削除
	this.search_sub_id();
	
	function search_delete_element(that){
		count++;
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

SubElement.prototype.delete_ref_element = function(){
};