AUI.add("aui-text-unicode",function(a){var c=a.Lang,b=a.Text,d=a.Text.Data.Unicode;var e={compile:function(i,g){var f=this;var h=null;if(d.hasOwnProperty(i)){h=new RegExp(d[i],g);}return h;},match:a.cached(function(h,g,f){return e.compile(g,f).exec(h);}),test:a.cached(function(h,g,f){return e.compile(g,f).test(h);})};b.Unicode=e;},"1.7.0pr2",{requires:["aui-text-data-unicode"],skinnable:false});