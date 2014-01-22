AUI.add("aui-form-base",function(b){var i=b.Lang,d=b.getClassName,c=b.IO.prototype._serialize,j="form",a=d(j),g=d("field","labels"),f=d("field","labels","inline"),e={left:[g,"left"].join("-"),right:[g,"right"].join("-"),top:[g,"top"].join("-")};var h=b.Component.create({NAME:j,ATTRS:{action:{value:location.href,getter:"_attributeGetter",setter:"_attributeSetter"},id:{},method:{value:"POST",getter:"_attributeGetter",setter:"_attributeSetter"},monitorChanges:{value:false},nativeSubmit:{value:false},values:{getter:function(m){var k=this;var l=c(k.get("contentBox").getDOM());return b.QueryString.parse(l);},setter:function(n){var k=this;var l=k._setFieldsObject;var m=k.get("monitorChanges");if(i.isArray(n)){l=k._setFieldsArray;}b.each(n,b.rbind(l,k,m));return b.Attribute.INVALID_VALUE;}},fieldValues:{getter:function(l){var k=this;var m={};k.fields.each(function(o,n,p){m[o.get("name")]=o.get("value");});return m;}},labelAlign:{value:""}},HTML_PARSER:{action:function(l){var k=this;return k._attributeGetter(null,"action");},method:function(l){var k=this;return k._attributeGetter(null,"method");}},prototype:{CONTENT_TEMPLATE:"<form></form>",initializer:function(){var k=this;k.fields=new b.DataSet({getKey:k._getNodeId});},renderUI:function(){var k=this;k._renderForm();},bindUI:function(){var k=this;var l=k.get("nativeSubmit");if(!l){k.get("contentBox").on("submit",k._onSubmit);}k.after("disabledChange",k._afterDisabledChange);k.after("labelAlignChange",k._afterLabelAlignChange);k.after("nativeSubmitChange",k._afterNativeSubmitChange);},syncUI:function(){var k=this;var l=k.get("contentBox");k.set("id",l.guid());k._uiSetLabelAlign(k.get("labelAlign"));},add:function(o,k){var t=this;var p=b.Array(o);var l=p.length;var r;var o=t.fields;var q=t.get("contentBox");for(var n=0;n<p.length;n++){r=p[n];r=b.Field.getField(r);if(r&&o.indexOf(r)==-1){o.add(r);if(k&&!r.get("rendered")){var m=r.get("node");var s=null;if(!m.inDoc()){s=q;}r.render(s);}}}},clearInvalid:function(){var k=this;k.fields.each(function(m,l,n){m.clearInvalid();});},getField:function(n){var l=this;var m;if(n){var k=l.fields;m=k.item(n);if(!i.isObject(m)){k.each(function(p,o,q){if(p.get("id")==n||p.get("name")==n){m=p;return false;}});}}return m;},invoke:function(m,l){var k=this;return k.fields.invoke(m,l);},isDirty:function(){var k=this;var l=false;k.fields.each(function(n,m,o){if(n.isDirty()){l=true;return false;}});return l;},isValid:function(){var k=this;var l=true;k.fields.each(function(n,m,o){if(!n.isValid()){l=false;return false;}});return l;},markInvalid:function(m){var k=this;var l=k._markInvalidObject;if(i.isArray(m)){l=k._markInvalidArray;}b.each(m,l,k);return k;},remove:function(m,l){var k=this;k.fields.remove(m);if(l){m=k.getField(m);if(m){m.destroy();}}return k;},resetValues:function(){var k=this;k.fields.each(function(m,l,n){m.resetValue();});},submit:function(l){var k=this;var m=k.isValid();if(m){if(k.get("nativeSubmit")){k.get("contentBox").submit();}else{l=l||{};b.mix(l,{id:k.get("id")});b.io(k.get("action"),{form:l,method:k.get("method"),on:{complete:b.bind(k._onSubmitComplete,k),end:b.bind(k._onSubmitEnd,k),failure:b.bind(k._onSubmitFailure,k),start:b.bind(k._onSubmitStart,k),success:b.bind(k._onSubmitSuccess,k)}});}}return m;},_afterDisabledChange:function(l){var k=this;var m="disable";if(l.newVal){m="enable";}k.fields.each(function(o,n,p){o[m];});},_afterLabelAlignChange:function(l){var k=this;k._uiSetLabelAlign(l.newVal,l.prevVal);},_afterNativeSubmitChange:function(m){var k=this;var l=k.get("contentBox");var n="on";if(m.newVal){n="detach";}l[n]("submit",k._onSubmit);},_attributeGetter:function(m,l){var k=this;return k.get("contentBox").attr(l);},_attributeSetter:function(m,l){var k=this;k.get("contentBox").attr(l,m);return m;},_getNodeId:function(m){var l;if(m instanceof b.Field){l=m.get("node");}else{l=b.one(m);}var k=l&&l.guid();return k;},_onSubmit:function(k){k.halt();},_onSubmitComplete:function(l){var k=this;k.fire("complete",{ioEvent:l});},_onSubmitEnd:function(l){var k=this;k.fire("end",{ioEvent:l});},_onSubmitFailure:function(l){var k=this;k.fire("failure",{ioEvent:l});},_onSubmitStart:function(l){var k=this;k.fire("start",{ioEvent:l});},_onSubmitSuccess:function(l){var k=this;k.fire("success",{ioEvent:l});},_renderForm:function(){var k=this;k.get("contentBox").removeClass(a);},_markInvalidArray:function(m,l,o){var k=this;var n=k.getField(m.id);if(n){n.markInvalid(m.message);}},_markInvalidObject:function(m,l,o){var k=this;var n=(!i.isFunction(m))&&k.getField(l);if(n){n.markInvalid(m);}},_setFieldsArray:function(n,m,p,l){var k=this;var o=k.getField(n.id);if(o){o.set("value",n.value);if(l){o.set("prevVal",o.get("value"));}}},_setFieldsObject:function(n,m,p,l){var k=this;var o=(!i.isFunction(n))&&k.getField(m);if(o){o.set("value",n);if(l){o.set("prevVal",o.get("value"));}}},_uiSetLabelAlign:function(m,o){var k=this;var l=k.get("contentBox");l.replaceClass(e[o],e[m]);var n="removeClass";if(/right|left/.test(m)){n="addClass";}l[n](f);}}});b.Form=h;},"1.7.0pr2",{requires:["aui-base","aui-data-set","aui-form-field","querystring-parse","io-form"]});