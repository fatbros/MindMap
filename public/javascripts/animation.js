$(function(){

	//init===============================
	logo_padding();
	//===================================

    //nav================================
    //animation
    var nav_li = $('nav ul li');
    var color = {
        'brunch': '#e87ea5',
        'image': '#8ac233',
        'canvas': '#41babc'
    };
    function start_navColor_animation(){
        var id_color = color[$(this).attr('id')];
        $(this).stop(true, false).animate({
            backgroundColor: id_color
        }, 'fast');
    }
    function end_navColor_animation(){
        $(this).stop(true, false).animate({
            backgroundColor: '#414141'
        }, 'fast', function(){
            $(this).css('background-color', '');
        });
    }
    //navクリックしたメニューに関係ないメニューのcolorをもとに戻す
    function off_navColor_animation(that){
        //canvasがmainに表示されている時、canvasを画面外にアニメーションさせる
        if(parseInt($('#main #canvas_area').css('left')) >= 0){
            $('#canvas_area').stop(true, false).animate({
                'left': '-500px',
                'opacity': 0,
            }, 500);
        }
        nav_li.each(end_navColor_animation);
        nav_li.off('mouseleave');
        nav_li.on('mouseleave', end_navColor_animation);

        $(that).off('mouseleave');
    }
    function nav_click(){
        off_navColor_animation(this);
        var id_color = color[$(this).attr('id')];
        $(this).stop(true, false).animate({
            backgroundColor: id_color
        }, 'fast');
    }
    nav_li.on('mouseenter', start_navColor_animation);
    nav_li.on('mouseleave', end_navColor_animation);
    nav_li.on('click', nav_click);

    //canvas=============================
    //draggable--------------------------
    //nav canvasをクリックした時画面上にcanvasを表示させる
    canvas_nav = $('ul #canvas');
    canvas_nav.on('click', function(){
        $('#canvas_area').stop(true, false).animate({
            'left': '0px',
            'opacity': 1,
        }, 500);
    });
    $('#main #canvas_area').draggable({
        'handle': '#canvas_topBar',
        'containment': 'parent',
        drag: function(){
        },
        stop: function(){
        }
    });
    $('#close_btn').on('click', function(){
        off_navColor_animation(canvas_nav);
        canvas_nav.on('mouseleave', end_navColor_animation);
    });

    //canvas number======================
    var number = $('#canvas_number');
    number.find('div span').on('click', function(){
        $(this).parent().find('span').each(function(){
            $(this).animate({
                'color': '#fff'
            });
        });
        $(this).animate({
            'color': '#3e3a39'
        });
    });
    //===================================
    
    //ロゴの位置
    function logo_padding(){
        var logo_padding = (parseInt($('header').height()) - parseInt($('#logo img').height())) / 2;
        $('#logo img').css({
            'padding-top': logo_padding
        });
    }
    $(window).on({
        'resize': function(){
			logo_padding();
        }
    });
});