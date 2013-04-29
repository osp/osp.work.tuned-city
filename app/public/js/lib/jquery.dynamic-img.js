// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).


    function loader($el, delay) {
        delay = delay || 200;
        var chars = "⠁⠂⠄⡀⢀⠠⠐⠈".split("");
        var i = Math.floor(Math.random() * chars.length);
        var timer = setInterval(function(){
            $el.html(chars[ i++ % chars.length ]);
        }, delay);

        // public method to stop the animation
        this.stop = function() {
            clearInterval(timer);
        }
    }

    // Create the defaults once
    var pluginName = "dynamicImg",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).

            var that = this,
                ld1;

            $.ajax($(this.element).attr("href"), {
                dataType: 'json',
                beforeSend: function () {
                    console.info("before send...");
                    ld1 = new loader($(that.element));
                },
                success: function (data) {
                    console.info("success...");
                    console.info(data);

                    ld1.stop();
                    $(that.element).replaceWith($('<img>').attr({
                        src: data.url
                    }));

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.error("An error occured: " + xhr.status + " " + thrownError);
                },
                complete: function () {
                    console.info("complete...");
                }
            });
        },
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );
