$(function(){

    //canvas=============================
    //draggable--------------------------
    //nav canvasをクリックした時画面上にcanvasを表示させる
    var canvas_nav = $('ul #canvas');

    $('#canvas_area').draggable({
        'handle': '#canvas_topBar',
        'containment': '#over_scrollWrap',
        drag: function(){
        },
        stop: function(){
        }
    });
    $('#close_btn').on('click', function(){
        nav_animation.off_navColor_animation(canvas_nav);
        //canvas_nav.on('mouseleave', nav_animation.end_navColor_animation.bind(canvas_nav));
    });
    
    //===============================
    //リサイズした時
    //===============================
    function logo_padding(){
        var logo_padding = (parseInt($('header').height()) - parseInt($('#logo img').height())) / 2;
        $('#logo img').css({
            'padding-top': logo_padding
        });
    }
    function over_scrollWrap_pos(){
        var window_size = $(window).width();
        var main_size = window_size - 320;
        console.log(main_size);

        $('#over_scrollWrap').css({
            'width': main_size,
            'height': '100%'
        });
    }
    $(window).on({
        'resize': function(){
			logo_padding();
            over_scrollWrap_pos();
        }
    });
    logo_padding();
    center_scroll();
    over_scrollWrap_pos();
});