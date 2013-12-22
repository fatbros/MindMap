var SVG = function(element){
	this.element = element;
	this.position(0);
};

SVG.prototype.position = function(mode){
	//mode == 0 create mode == 1 edit
	//他の階層からアクセスするためthisにfunctionを書く
	this.svg_position = function(mode){
		this.bezier_center = {
			x: 0,
			y: 0
		};
		this.bezier_diffX = 0;
		this.bezier_diffY = 0;
		
		//状況によって変更する はじめにrまたはlのどちらか　次に二つのエレメントのどちらが座標上で上にあるか下にあるか
		if(this.element.R_or_L == 'R'){
			//二つのエレメントのどちらが座標上で上にあるか下にあるか
			this.bezier_diffX = Math.abs(this.element.svg.svg_position_up.svg_position.r_img.x - this.element.svg.svg_position.l_img.x) / 2;
			this.bezier_diffY = Math.abs(this.element.svg.svg_position_up.svg_position.r_img.y - this.element.svg.svg_position.l_img.y) / 2;
			if(this.element.svg.svg_position_up.svg_position.r_img.x < this.element.svg.svg_position.l_img.x){
				this.bezier_center.x = this.element.svg.svg_position_up.svg_position.r_img.x + this.bezier_diffX;
			}else{
				this.bezier_center.x = this.element.svg.svg_position_up.svg_position.r_img.x - this.bezier_diffX;
			}
			if(this.element.svg.svg_position_up.svg_position.r_img.y < this.element.svg.svg_position.l_img.y){
				this.bezier_center.y = this.element.svg.svg_position_up.svg_position.r_img.y + this.bezier_diffY;
			}else{
				this.bezier_center.y = this.element.svg.svg_position_up.svg_position.r_img.y - this.bezier_diffY;
			}
		}else{
			//R_or_L == Lの場合
			this.bezier_diffX = Math.abs(this.element.svg.svg_position_up.svg_position.l_img.x - this.element.svg.svg_position.r_img.x) / 2;
			this.bezier_diffY = Math.abs(this.element.svg.svg_position_up.svg_position.l_img.y - this.element.svg.svg_position.r_img.y) / 2;
			if(this.element.svg.svg_position_up.svg_position.l_img.x < this.element.svg.svg_position.r_img.x){
				this.bezier_center.x = this.element.svg.svg_position_up.svg_position.l_img.x + this.bezier_diffX;
			}else{
				this.bezier_center.x = this.element.svg.svg_position_up.svg_position.l_img.x - this.bezier_diffX;
			}
			if(this.element.svg.svg_position_up.svg_position.l_img.y < this.element.svg.svg_position.r_img.y){
				this.bezier_center.y = this.element.svg.svg_position_up.svg_position.l_img.y + this.bezier_diffY;
			}else{
				this.bezier_center.y = this.element.svg.svg_position_up.svg_position.l_img.y - this.bezier_diffY;
			}
		}
		
		if(mode == 0){
			this.create();	
		}
		else if(mode == 1){
			this.edit();
		}
	};
	this.svg_position(mode);
};

SVG.prototype.create = function(){
	this.line = svg_selector.path(this.path_cal());
	this.attr();
};

SVG.prototype.attr = function(){
	this.line.attr({
		'stroke': this.element.color,
		'stroke-width': 8
		//'stroke-dasharray': '--.',
		//'stroke-linecap': 'round',
		//'stroke-linejoin': 'round'
	});
};

SVG.prototype.edit = function(){
	this.line.attr({
		'path': this.path_cal()
	});
};

SVG.prototype.path_cal = function(){
	if(this.element.R_or_L == 'R'){
		return 'M'+ this.element.svg.svg_position_up.svg_position.r_img.x + ',' + this.element.svg.svg_position_up.svg_position.r_img.y + ' ' + 'Q' + (this.element.svg.svg_position_up.svg_position.r_img.x+this.bezier_diffX) + ',' + this.element.svg.svg_position_up.svg_position.r_img.y + ' ' + this.bezier_center.x + ',' + this.bezier_center.y + ' ' + 'T' + this.element.svg.svg_position.l_img.x + ',' + this.element.svg.svg_position.l_img.y
	}else{
		return 'M'+ this.element.svg.svg_position_up.svg_position.l_img.x + ',' + this.element.svg.svg_position_up.svg_position.l_img.y + ' ' + 'Q' + (this.element.svg.svg_position_up.svg_position.l_img.x-this.bezier_diffX) + ',' + this.element.svg.svg_position_up.svg_position.l_img.y + ' ' + this.bezier_center.x + ',' + this.bezier_center.y + ' ' + 'T' + this.element.svg.svg_position.r_img.x + ',' + this.element.svg.svg_position.r_img.y
	}
};

SVG.prototype.delete = function(){
	this.line.remove();
};