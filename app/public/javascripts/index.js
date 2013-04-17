/*
 * index.js
 */

$(document).ready(function(){
    $.getJSON('/config/root_way',function(config){
        var pid = config.root_way;
        tc.app.setPath(pid);
    });

    $('body').layout({
        applyDefaultStyles: false,
        enableCursorHotkey: false,
        east: {
            size: "220",
            fxName: "none",
            fxSpeed: "fast",
            initClosed: false,
            enableCursorHotkey: false,
            slidable: false,
            closable: true,
            resizable: false,
            togglerAlign_closed : 18,
            togglerAlign_open : 18,
            togglerContent_open: '&times;',
            togglerContent_closed: '+',
            spacing_closed: 36,
            spacing_open: 18,
            togglerLength_open: 18,
            togglerLength_closed: 18,
            showOverflowOnHover: false,
        },
    });
});
