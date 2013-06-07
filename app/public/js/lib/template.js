/*
 * 
 * template.js
 * 
 */


// Util.Template
window.Template = {} || window.Template;
window.Template = _.extend(window.Template,{
    base_url: '/js/templates/',
    cache: {},
    waiting: {},
    loading:{},
    render: function(name, el, cb, error){
        var that = this;
        if(this.cache[name] === undefined)
        {
            if(this.waiting[name] === undefined)
            {
                this.waiting[name] = [];
            }
            this.waiting[name].push({element:el, callback:cb});
            if(this.loading[name] === undefined)
            {
                this.loading[name] = true;
                $.get(that.base_url+name+'.html'+'?q='+Math.random(), function(html){
                    that.cache[name] = _.template(html, false, {variable:'data'});
                    for(var k = 0; k < that.waiting[name].length; k++)
                    {
                        var w = that.waiting[name][k];
                        try{
                            w.callback.apply(w.element, [that.cache[name]]);
                        }
                        catch(e)
                        {
                            if(error && (typeof error === 'function'))
                            {
                                error(e);
                            }
                            else
                            {
                                console.log('Failed on template: '+name+' ['+e+']');
                            }
                        }
                    }
                });
            }
        }
        else
        {
            try{
                cb.apply(el, [that.cache[name]]);
            }
            catch(e)
            {
                if(error && (typeof error === 'function'))
                {
                    error(e);
                }
                else
                {
                    console.log('Failed on template: '+name+' ['+e+']');
                }
            }
        }
    }
});
