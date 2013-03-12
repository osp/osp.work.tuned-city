/**
 * This file is part of Tuned City Archive.
 * Copyright 2013 Alexandre Leray, Open Source Publishing
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * Also add information on how to contact you by electronic and paper mail.
 */


// requires jquery.jplayer.js


(function ($) {
    "use strict";

    var methods = {
        init: function (options) {
            var settings = $.extend({
            }, options);


            return this.each(function (i) {
                console.log(i);
            });
        },
        destroy: function () {
            return this.each(function (i) {
                console.log(i);
            });
        }
    };

    $.fn.jcursor = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jquery.jcursor');
        }
    };
})(jQuery);
