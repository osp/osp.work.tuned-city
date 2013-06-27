$(function() {
    //$('.bookmark').draggable();
    $('body > *').draggable();
    $('.bookmark').live('click', function() {
        $('.player').removeClass('player').addClass('bookmark');
        $(this).removeClass('bookmark').addClass('player');
    });
});
