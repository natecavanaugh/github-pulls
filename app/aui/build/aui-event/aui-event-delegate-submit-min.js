AUI.add("aui-event-delegate-submit",function(a){var f=a.Object,e=a.Node,c=a.Selector,g="click",b="submit";a.Event.define(b,{delegate:function(l,k,j,i){var h=this;var m=h._prepareHandles(k,l);if(!f.owns(m,g)){m[g]=l.delegate(g,function(p){var o=p.target;if(h._getNodeName(o,"input")||h._getNodeName(o,"button")){var n=o.get("form");if(n){h._attachEvent(n,l,k,j,i);}}},i);}},detach:function(k,j,i){var h=this;h._detachEvents(k,j,i);},detachDelegate:function(k,j,i){var h=this;h._detachEvents(k,j,i);},on:function(k,j,i){var h=this;h._attachEvent(k,k,j,i);},_attachEvent:function(o,n,m,l,k){var i=this;var h=function(s){var p=true;if(k){if(!s.stopped||!i._hasParent(s._stoppedOnNode,n)){var q=n.getDOM();var r=o.getDOM();do{if(r&&c.test(r,k)){s.currentTarget=a.one(r);s.container=n;p=l.fire(s);if(s.stopped&&!s._stoppedOnNode){s._stoppedOnNode=n;}}r=r.parentNode;}while(p!==false&&!s.stopped&&r&&r!==q);p=((p!==false)&&(s.stopped!==2));}}else{p=l.fire(s);if(s.stopped&&!s._stoppedOnNode){s._stoppedOnNode=n;}}return p;};var j=i._prepareHandles(m,o);if(!f.owns(j,b)){j[b]=a.Event._attach([b,h,o,l,k?"submit_delegate":"submit_on"]);}},_detachEvents:function(j,i,h){a.each(i._handles,function(l,m,k){a.each(l,function(p,o,n){p.detach();});});delete i._handles;},_getNodeName:function(i,h){var j=i.get("nodeName");return j&&j.toLowerCase()===h.toLowerCase();},_hasParent:function(h,i){return h.ancestor(function(j){return j===i;},false);},_prepareHandles:function(j,i){if(!f.owns(j,"_handles")){j._handles={};}var h=j._handles;if(!f.owns(h,i)){h[i]={};}return h[i];}},true);var d=a.CustomEvent.prototype._on;a.CustomEvent.prototype._on=function(p,j,n,o){var q=this;var m=d.apply(q,arguments);if(n&&n[0]==="submit_on"&&q.subCount>1){var i=q.subscribers;var h=i[m.sub.id];var l={};var k=false;f.each(i,function(s,r){if(!k&&s.args&&s.args[0]==="submit_delegate"){l[h.id]=h;k=true;}if(s!==h){l[s.id]=s;}});if(k){q.subscribers=l;}}return m;};},"1.7.0pr2",{requires:["aui-node-base","aui-event-base"],condition:{name:"aui-event-delegate-submit",trigger:"event-base-ie",ua:"ie"}});