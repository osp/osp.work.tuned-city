/*
 * MediaPlayer
 */

window.tc = window.tc || {};


tc.Form = function(elt)
{
    var proto = {
        init: function (elt) {
        },
    };
    
    var ret = Object.create(proto);
    ret.init(elt);
    return ret;
}



    <form id="myform"></form>
    <script src="/javascripts/jquery.dform-1.0.1.min.js"></script>


    $(function() {
      // Generate a form
        var forms = {
            upload: {
                "action" : "/api/Media/",
                "enctype" : "multipart/form-data",
                "method" : "post",
                "html" :
                [
                    {
                        type: "file",
                        name: "media"
                    },
                    {
                        type: "submit"
                    }
                ]
            },
            bookmark: {
                "html" :
                [
                    {
                        type: "textarea",
                        name: "comment"
                    }
                ]
            }
        }

        $("#myform").dform(forms.bookmark);
    });
