AUI.add("aui-parse-content",function(d){var m=d.Lang,c=m.isString,g=d.config.doc,p="append",a="documentElement",q="firstChild",j="head",o="host",f="innerHTML",h="ParseContent",e="queue",l="script",n=";",i="src",k={"":1,"text/javascript":1};var b=d.Component.create({NAME:h,NS:h,ATTRS:{queue:{value:null}},EXTENDS:d.Plugin.Base,prototype:{initializer:function(){var r=this;b.superclass.initializer.apply(this,arguments);r.set(e,new d.AsyncQueue());r._bindAOP();},globalEval:function(t){var u=d.getDoc();var s=u.one(j)||u.get(a);var r=g.createElement(l);r.type="text/javascript";if(t){r.text=m.trim(t);}s.appendChild(r).remove();},parseContent:function(t){var r=this;var s=r._clean(t);r._dispatch(s);return s;},_addInlineScript:function(s){var r=this;r.get(e).add({args:s,context:r,fn:r.globalEval,timeout:0});},_bindAOP:function(){var s=this;var r=function(w){var v=Array.prototype.slice.call(arguments);var u=s.parseContent(w);v.splice(0,1,u.fragment);return new d.Do.AlterArgs(null,v);};this.doBefore("insert",r);this.doBefore("replaceChild",r);var t=function(v){var u=s.parseContent(v);return new d.Do.AlterArgs(null,[u.fragment]);};this.doBefore("replace",t);this.doBefore("setContent",t);},_clean:function(t){var r={};var s=d.Node.create("<div></div>");s.append("<div>_</div>");if(c(t)){d.DOM.addHTML(s,t,p);}else{s.append(t);}r.js=s.all(l).filter(function(u){return k[u.getAttribute("type").toLowerCase()];});r.js.each(function(v,u){v.remove();});s.get(q).remove();r.fragment=s.get("childNodes").toFrag();return r;},_dispatch:function(u){var s=this;var r=s.get(e);var t=[];u.js.each(function(w,v){var y=w.get(i);if(y){if(t.length){s._addInlineScript(t.join(n));t.length=0;}r.add({autoContinue:false,fn:function(){d.Get.script(y,{onEnd:function(z){z.purge();r.run();}});},timeout:0});}else{var x=w._node;t.push(x.text||x.textContent||x.innerHTML||"");}});if(t.length){s._addInlineScript(t.join(n));}r.run();}}});d.namespace("Plugin").ParseContent=b;},"1.7.0pr2",{skinnable:false,requires:["async-queue","aui-base","plugin"]});