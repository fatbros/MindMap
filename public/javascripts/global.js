//nav================================
//animation
var nav_animation = (function(){
    var nav_li = $('nav ul li');
    var color = {
        'brunch': '#e87ea5',
        'image': '#8ac233',
        'canvas': '#41babc'
    };

    var on_nav_action = {
        brunch: function(){
            $('#brunch_area').css('z-index', '1');
        },
        canvas: function(){
            $('#over_scrollWrap').css('z-index', '5');
            $('#canvas_area').stop(true, false).animate({
                'left': '0px',
                'opacity': '1',
                'z-index': '5'
            }, 500);
        },
        image: function(){
            $('#img').css('z-index', '1');
        }
    };

    var off_nav_action = {
        brunch: function(){
            $('#brunch_area').css('z-index', '-1');
        },
        canvas: function(){
            $('#over_scrollWrap').css('z-index', '-5');
            $('#canvas_area').stop(true, false).animate({
                'left': '-500px',
                'opacity': 0,
                'z-index': '-5'
            }, 500);
        },
        image: function(){
            $('#img').css('z-index', '-1');
        }
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
    function nav_click(){
        var id = $(this).attr('id');
        //クリックした要素のactionをonにする
        on_nav_action[id]();
        //クリックしていない要素のactionをoffにする
        Object.keys(off_nav_action).forEach(function(key){
            if(id !== key){
                off_nav_action[key]();
            }
        });

        nav_on_mouseleave();
        
        var id_color = color[$(this).attr('id')];
        $(this).stop(true, false).animate({
            backgroundColor: id_color
        }, 'fast');
        $(this).off('mouseleave');
    }
    function nav_on_mouseleave(){
        nav_li.each(end_navColor_animation);
        //クリックした要素にはmouseleaveがoffになっているため、まず全ての要素をoffにする
        nav_li.off('mouseleave');
        nav_li.on('mouseleave', end_navColor_animation);

    }
    nav_li.on('mouseenter', start_navColor_animation);
    nav_li.on('mouseleave', end_navColor_animation);
    nav_li.on('click', nav_click);

    return {
        off_navColor_animation: function(that){
            var id = $(that).attr('id');
            off_nav_action[id]();
            nav_on_mouseleave();
            $(that).on('mouseleave', end_navColor_animation);
        },
        on_navColor_animation: function(that){
            nav_click.apply(that);
        }
    };
})();
//scrollを中心に持っていく
function center_scroll(){
    var main = $('#main');
    var scrollWrap = $('#scrollWrap');

    var scrollWrap_pos = {
        w: parseInt(scrollWrap.css('width')),
        h: parseInt(scrollWrap.css('height'))
    };
    var main_pos = {
        w: parseInt(main.css('width')),
        h: parseInt(main.css('height'))
    };
    var scroll_cal = {
        w: scrollWrap_pos.w - main_pos.w,
        h: scrollWrap_pos.h - main_pos.h
    };
    main.scrollLeft(scroll_cal.w / 2);
    main.scrollTop(scroll_cal.h / 2);
}