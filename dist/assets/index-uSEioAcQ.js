var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,o)=>(o=n==null?{}:e(i(n)),s(r||!n||!n.__esModule||!a.call(n,`default`)?t(o,`default`,{value:n,enumerable:!0}):o,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var l=o((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m){if(n(c)!==null)m=!0,S||(S=!0,te());else{var t=n(l);t!==null&&D(x,t.startTime-e)}}}var S=!1,C=-1,w=5,T=-1;function ee(){return g?!0:!(e.unstable_now()-T<w)}function E(){if(g=!1,S){var t=e.unstable_now();T=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(C),C=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&ee());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&D(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?te():S=!1}}}var te;if(typeof y==`function`)te=function(){y(E)};else if(typeof MessageChannel<`u`){var ne=new MessageChannel,re=ne.port2;ne.port1.onmessage=E,te=function(){re.postMessage(null)}}else te=function(){_(E,0)};function D(t,n){C=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):w=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(C),C=-1):h=!0,D(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,S||(S=!0,te()))),r},e.unstable_shouldYield=ee,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),u=o(((e,t)=>{t.exports=l()})),d=o((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.for(`react.view_transition`),m=Symbol.iterator;function h(e){return typeof e!=`object`||!e?null:(e=m&&e[m]||e[`@@iterator`],typeof e==`function`?e:null)}var g={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},_=Object.assign,v={};function y(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||g}y.prototype.isReactComponent={},y.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},y.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function b(){}b.prototype=y.prototype;function x(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||g}var S=x.prototype=new b;S.constructor=x,_(S,y.prototype),S.isPureReactComponent=!0;var C=Array.isArray;function w(){}var T={H:null,A:null,T:null,S:null},ee=Object.prototype.hasOwnProperty;function E(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function te(e,t){return E(e.type,t,e.props)}function ne(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function re(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var D=/\/+/g;function ie(e,t){return typeof e==`object`&&e&&e.key!=null?re(``+e.key):t.toString(36)}function ae(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(w,w):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function oe(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,oe(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+ie(e,0):a,C(o)?(i=``,c!=null&&(i=c.replace(D,`$&/`)+`/`),oe(o,r,i,``,function(e){return e})):o!=null&&(ne(o)&&(o=te(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(D,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(C(e))for(var u=0;u<e.length;u++)a=e[u],s=l+ie(a,u),c+=oe(a,r,i,s,o);else if(u=h(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+ie(a,u++),c+=oe(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return oe(ae(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function O(e,t,n){if(e==null)return e;var r=[],i=0;return oe(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function se(e){if(e._status===-1){var t=e._result,n=t();n.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t,n.status===void 0&&(n.status=`fulfilled`,n.value=t))},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t,n.status===void 0&&(n.status=`rejected`,n.reason=t))}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var ce=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)};function le(e){var t=T.T,n={};n.types=t===null?null:t.types,T.T=n;try{var r=e(),i=T.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(w,ce)}catch(e){ce(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),T.T=t}}function k(e){var t=T.T;if(t!==null){var n=t.types;n===null?t.types=[e]:n.indexOf(e)===-1&&n.push(e)}else le(k.bind(null,e))}var ue={map:O,forEach:function(e,t,n){O(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return O(e,function(){t++}),t},toArray:function(e){return O(e,function(e){return e})||[]},only:function(e){if(!ne(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=ue,e.Component=y,e.Fragment=r,e.Profiler=a,e.PureComponent=x,e.StrictMode=i,e.Suspense=l,e.ViewTransition=p,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=T,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return T.H.useMemoCache(e)}},e.addTransitionType=k,e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=_({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!ee.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return E(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)ee.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return E(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=ne,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:se}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=le,e.unstable_useCacheRefresh=function(){return T.H.useCacheRefresh()},e.use=function(e){return T.H.use(e)},e.useActionState=function(e,t,n){return T.H.useActionState(e,t,n)},e.useCallback=function(e,t){return T.H.useCallback(e,t)},e.useContext=function(e){return T.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return T.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return T.H.useEffect(e,t)},e.useEffectEvent=function(e){return T.H.useEffectEvent(e)},e.useId=function(){return T.H.useId()},e.useImperativeHandle=function(e,t,n){return T.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return T.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return T.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return T.H.useMemo(e,t)},e.useOptimistic=function(e,t){return T.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return T.H.useReducer(e,t,n)},e.useRef=function(e){return T.H.useRef(e)},e.useState=function(e){return T.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return T.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return T.H.useTransition()},e.version=`19.3.1`})),f=o(((e,t)=>{t.exports=d()})),p=o((e=>{var t=f();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`),o=Symbol.for(`react.recoverable`),s=Symbol.for(`react.optimistic_key`);function c(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:r===s?s:``+r,children:e,containerInfo:t,implementation:n}}var l=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function u(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.browser=function(e){return{$$typeof:o,_reason:e}},e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return c(e,t,null,r)},e.flushSync=function(e){var t=l.T,n=i.p;try{if(l.T=null,i.p=2,e)return e()}finally{l.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=u(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`){if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=u(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0})}}else t??i.d.M(e)}},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=u(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`){if(t){var n=u(t.as,t.crossOrigin);i.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0})}else i.d.m(e)}},e.requestFormReset=function(e){i.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return l.H.useFormState(e,t,n)},e.useFormStatus=function(){return l.H.useHostTransitionStatus()},e.version=`19.3.1`})),m=o(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=p()})),h=o((e=>{var t=u(),n=f(),r=m();function i(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function o(e){for(var t=e,n=t;n&&!n.alternate;)t=n,t.flags&4098&&(e=t.return),n=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function s(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(o(e)!==e)throw Error(i(188))}function d(e){var t=e.alternate;if(!t){if(t=o(e),t===null)throw Error(i(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var s=a.alternate;if(s===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===s.child){for(s=a.child;s;){if(s===n)return l(a),e;if(s===r)return l(a),t;s=s.sibling}throw Error(i(188))}if(n.return!==r.return)n=a,r=s;else{for(var c=!1,u=a.child;u;){if(u===n){c=!0,n=a,r=s;break}if(u===r){c=!0,r=a,n=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===n){c=!0,n=s,r=a;break}if(u===r){c=!0,r=s,n=a;break}u=u.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function p(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=p(e),t!==null)return t;e=e.sibling}return null}function h(e,t,n,r,i,a){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&n(e,r,i,a)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&h(e.child,t,n,r,i,a))return!0;e=e.sibling}return!1}function g(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function _(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),e.tag!==3&&e.tag!==5&&e.tag!==27);)e=e.return;return t}function v(e){var t=[null,null],n=g(e);return n===null||y(t,e,n.child,{foundSelf:!1}),t}function y(e,t,n,r){for(;n!==null;){if(n===t)r.foundSelf=!0;else if(n.tag===5||n.tag===27||n.tag===6){if(r.foundSelf)return e[1]=n,!0;e[0]=n}else if((n.tag!==22||n.memoizedState===null)&&y(e,t,n.child,r))return!0;n=n.sibling}return!1}function b(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(i(559))}}var x=null,S=null;function C(e,t,n){return e===n||e===t&&(x=e,!0)}function w(e,t,n){return e===n?(S=e,!1):e===t&&(S!==null&&(x=e),!0)}function T(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function ee(e,t,n){for(var r=0,i=e;i;i=n(i))r++;i=0;for(var a=t;a;a=n(a))i++;for(;0<r-i;)e=n(e),r--;for(;0<i-r;)t=n(t),i--;for(;r--;){if(e===t||t!==null&&e===t.alternate)return e;e=n(e),t=n(t)}return null}var E=Object.assign,te=Symbol.for(`react.element`),ne=Symbol.for(`react.transitional.element`),re=Symbol.for(`react.portal`),D=Symbol.for(`react.fragment`),ie=Symbol.for(`react.strict_mode`),ae=Symbol.for(`react.profiler`),oe=Symbol.for(`react.consumer`),O=Symbol.for(`react.context`),se=Symbol.for(`react.forward_ref`),ce=Symbol.for(`react.suspense`),le=Symbol.for(`react.suspense_list`),k=Symbol.for(`react.memo`),ue=Symbol.for(`react.lazy`),A=Symbol.for(`react.activity`),de=Symbol.for(`react.legacy_hidden`),j=Symbol.for(`react.memo_cache_sentinel`),fe=Symbol.for(`react.view_transition`),pe=Symbol.for(`react.recoverable`),me=Symbol.iterator;function he(e){return typeof e!=`object`||!e?null:(e=me&&e[me]||e[`@@iterator`],typeof e==`function`?e:null)}var ge=Symbol.for(`react.client.reference`);function _e(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===ge?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case D:return`Fragment`;case ae:return`Profiler`;case ie:return`StrictMode`;case ce:return`Suspense`;case le:return`SuspenseList`;case A:return`Activity`;case fe:return`ViewTransition`}if(typeof e==`object`)switch(e.$$typeof){case re:return`Portal`;case O:return e.displayName||`Context`;case oe:return(e._context.displayName||`Context`)+`.Consumer`;case se:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case k:return t=e.displayName||null,t===null?_e(e.type)||`Memo`:t;case ue:t=e._payload,e=e._init;try{return _e(e(t))}catch{}}return null}var ve=Array.isArray,M=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,N=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ye={pending:!1,data:null,method:null,action:null},be=[],xe=-1;function Se(e){return{current:e}}function P(e){0>xe||(e.current=be[xe],be[xe]=null,xe--)}function F(e,t){xe++,be[xe]=e.current,e.current=t}var Ce=Se(null),we=Se(null),Te=Se(null),Ee=Se(null);function De(e,t){switch(F(Te,t),F(we,e),F(Ce,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?up(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=up(t),e=dp(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}P(Ce),F(Ce,e)}function Oe(){P(Ce),P(we),P(Te)}function ke(e){var t=e.memoizedState;t!==null&&(sh._currentValue=t.memoizedState,F(Ee,e)),t=Ce.current;var n=dp(t,e.type);t!==n&&(F(we,e),F(Ce,n))}function Ae(e){we.current===e&&(P(Ce),P(we)),Ee.current===e&&(P(Ee),sh._currentValue=ye)}var je,Me;function Ne(e){if(je===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);je=t&&t[1]||``,Me=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+je+e+Me}var Pe=!1;function Fe(e,t){if(!e||Pe)return``;Pe=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}n=!1;try{var i=Object.getOwnPropertyDescriptor(e.prototype,`props`);Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),n=!0,new e}finally{n&&(i===void 0?delete e.prototype.props:Object.defineProperty(e.prototype,"props",i))}}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{Pe=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?Ne(n):``}function Ie(e,t){switch(e.tag){case 26:case 27:case 5:return Ne(e.type);case 16:return Ne(`Lazy`);case 13:return e.child!==t&&t!==null?Ne(`Suspense Fallback`):Ne(`Suspense`);case 19:return Ne(`SuspenseList`);case 0:case 15:return Fe(e.type,!1);case 11:return Fe(e.type.render,!1);case 1:return Fe(e.type,!0);case 31:return Ne(`Activity`);case 30:return Ne(`ViewTransition`);default:return``}}function Le(e){try{var t=``,n=null;do t+=Ie(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var Re=Object.prototype.hasOwnProperty,ze=t.unstable_scheduleCallback,Be=t.unstable_cancelCallback,Ve=t.unstable_shouldYield,He=t.unstable_requestPaint,Ue=t.unstable_now,We=t.unstable_getCurrentPriorityLevel,Ge=t.unstable_ImmediatePriority,Ke=t.unstable_UserBlockingPriority,qe=t.unstable_NormalPriority,Je=t.unstable_LowPriority,Ye=t.unstable_IdlePriority,Xe=t.log,Ze=t.unstable_setDisableYieldValue,Qe=null,$e=null;function et(e){if(typeof Xe==`function`&&Ze(e),$e&&typeof $e.setStrictMode==`function`)try{$e.setStrictMode(Qe,e)}catch{}}var tt=Math.clz32?Math.clz32:it,nt=Math.log,rt=Math.LN2;function it(e){return e>>>=0,e===0?32:31-(nt(e)/rt|0)|0}var at=256,ot=262144,st=4194304;function ct(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function I(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=ct(n))):i=ct(o):i=ct(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=ct(n))):i=ct(o)):i=ct(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function lt(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function ut(e,t){t&8&&(t|=t&32);var n=e.entangledLanes;if(n!==0)for(e=e.entanglements,n&=t;0<n;){var r=31-tt(n),i=1<<r;t|=e[r],n&=~i}return t}function dt(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function ft(){var e=st;return st<<=1,!(st&62914560)&&(st=4194304),e}function pt(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function mt(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function ht(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-tt(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&gt(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function gt(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-tt(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function _t(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-tt(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function vt(e,t){var n=t&-t;return n=n&42?1:yt(n),(n&(e.suspendedLanes|t))===0?n:0}function yt(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function bt(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function xt(){var e=N.p;return e===0?(e=window.event,e===void 0?32:Ch(e.type)):e}function St(e,t){var n=N.p;try{return N.p=e,t()}finally{N.p=n}}var Ct=Math.random().toString(36).slice(2),wt=`__reactFiber$`+Ct,Tt=`__reactProps$`+Ct,Et=`__reactContainer$`+Ct,Dt=`__reactEvents$`+Ct,Ot=`__reactListeners$`+Ct,kt=`__reactHandles$`+Ct,At=`__reactResources$`+Ct,jt=`__reactMarker$`+Ct,Mt=`__reactLoad$`+Ct;function Nt(e){delete e[wt],delete e[Tt],delete e[Ot],delete e[kt]}function Pt(e){var t;if(t=e[wt])return t;for(var n=e.parentNode;n;){if(t=n[Et]||n[wt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=fm(e);e!==null;){if(n=e[wt])return n;e=fm(e)}return t}e=n,n=e.parentNode}return null}function Ft(e){if(e=e[wt]||e[Et]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function It(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(i(33))}function Lt(e){var t=e[At];return t||=e[At]={hoistableStyles:new Map,hoistableScripts:new Map},t}function Rt(e){e[jt]=!0}function zt(e){e[Mt]=void 0}var Bt=new Set,Vt={};function Ht(e,t){Ut(e,t),Ut(e+`Capture`,t)}function Ut(e,t){for(Vt[e]=t,e=0;e<t.length;e++)Bt.add(t[e])}var Wt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),Gt={},Kt={};function qt(e){return Re.call(Kt,e)?!0:Re.call(Gt,e)?!1:Wt.test(e)?Kt[e]=!0:(Gt[e]=!0,!1)}var L=!1;function Jt(){var e=L;return L=!1,e}function Yt(e,t,n){if(qt(t)){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,n)}}}function Xt(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,n)}}function Zt(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,r)}}function Qt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function $t(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function en(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function tn(e){if(!e._valueTracker){var t=$t(e)?`checked`:`value`;e._valueTracker=en(e,t,``+e[t])}}function nn(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=$t(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}var rn=/[\n"\\]/g;function an(e){return e.replace(rn,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function on(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+Qt(t)):e.value!==``+Qt(t)&&(e.value=``+Qt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):cn(e,Qt(n)):o===`number`&&e.value==t?cn(e,Qt(e.value)):cn(e,Qt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+Qt(s):e.removeAttribute(`name`)}function sn(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){tn(e);return}n=n==null?``:``+Qt(n),t=t==null?n:``+Qt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r??=i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),tn(e)}function cn(e,t){e.defaultValue!==``+t&&(e.defaultValue=``+t)}function ln(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+Qt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function un(e,t,n){t!=null&&(t=``+Qt(t),t!==e.value&&(e.value=t),n==null)?e.defaultValue!==t&&(e.defaultValue=t):e.defaultValue=n==null?``:``+Qt(n)}function dn(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(i(92));if(ve(r)){if(1<r.length)throw Error(i(93));r=r[0]}n=r}n??=``,t=n}n=Qt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),tn(e)}function fn(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var pn=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function mn(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||pn.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function hn(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(i(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``,L=!0);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&(mn(e,a,r),L=!0)}else for(var o in t)t.hasOwnProperty(o)&&mn(e,o,t[o])}function gn(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var _n=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`maskType`,`mask-type`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),vn=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function yn(e){return vn.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function bn(){}var xn=null;function Sn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Cn=null,wn=null;function Tn(e){var t=Ft(e);if(t&&(e=t.stateNode)){var n=e[Tt]||null;a:switch(e=t.stateNode,t.type){case`input`:if(on(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+an(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[Tt]||null;if(!a)throw Error(i(90));on(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&nn(r)}break a;case`textarea`:un(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&ln(e,!!n.multiple,t,!1)}}}var En=!1;function Dn(e,t,n){if(En)return e(t,n);En=!0;try{return e(t)}finally{if(En=!1,(Cn!==null||wn!==null)&&(zd(),Cn&&(t=Cn,e=wn,wn=Cn=null,Tn(t),e)))for(t=0;t<e.length;t++)Tn(e[t])}}function On(e,t){var n=e.stateNode;if(n===null)return null;var r=n[Tt]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(i(231,t,typeof n));return n}var kn=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0,An=!1;if(kn)try{var jn={};Object.defineProperty(jn,"passive",{get:function(){An=!0}}),window.addEventListener(`test`,jn,jn),window.removeEventListener(`test`,jn,jn)}catch{An=!1}var Mn=null,Nn=null,Pn=null;function Fn(){if(Pn)return Pn;var e,t=Nn,n=t.length,r,i=`value`in Mn?Mn.value:Mn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return Pn=i.slice(e,1<r?1-r:void 0)}function In(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Ln(){return!0}function Rn(){return!1}function zn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?Ln:Rn,this.isPropagationStopped=Rn,this}return E(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=Ln)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=Ln)},persist:function(){},isPersistent:Ln}),t}var Bn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Vn=zn(Bn),Hn=E({},Bn,{view:0,detail:0}),Un=zn(Hn),Wn,Gn,Kn,qn=E({},Hn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ir,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==Kn&&(Kn&&e.type===`mousemove`?(Wn=e.screenX-Kn.screenX,Gn=e.screenY-Kn.screenY):Gn=Wn=0,Kn=e),Wn)},movementY:function(e){return`movementY`in e?e.movementY:Gn}}),Jn=zn(qn),Yn=zn(E({},qn,{dataTransfer:0})),Xn=zn(E({},Hn,{relatedTarget:0})),Zn=zn(E({},Bn,{animationName:0,elapsedTime:0,pseudoElement:0})),Qn=zn(E({},Bn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),$n=zn(E({},Bn,{data:0})),er={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},tr={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},nr={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function rr(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=nr[e])?!!t[e]:!1}function ir(){return rr}var ar=zn(E({},Hn,{key:function(e){if(e.key){var t=er[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=In(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?tr[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ir,charCode:function(e){return e.type===`keypress`?In(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?In(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),or=zn(E({},qn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),sr=zn(E({},Bn,{submitter:0})),cr=zn(E({},Hn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ir})),lr=zn(E({},Bn,{propertyName:0,elapsedTime:0,pseudoElement:0})),ur=zn(E({},qn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),dr=zn(E({},Bn,{newState:0,oldState:0,source:0})),fr=[9,13,27,32],pr=kn&&`CompositionEvent`in window,mr=null;kn&&`documentMode`in document&&(mr=document.documentMode);var hr=kn&&`TextEvent`in window&&!mr,gr=kn&&(!pr||mr&&8<mr&&11>=mr),_r=` `,vr=!1;function yr(e,t){switch(e){case`keyup`:return fr.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function br(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var xr=!1;function Sr(e,t){switch(e){case`compositionend`:return br(t);case`keypress`:return t.which===32?(vr=!0,_r):null;case`textInput`:return e=t.data,e===_r&&vr?null:e;default:return null}}function Cr(e,t){if(xr)return e===`compositionend`||!pr&&yr(e,t)?(e=Fn(),Pn=Nn=Mn=null,xr=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return gr&&t.locale!==`ko`?null:t.data;default:return null}}var wr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Tr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!wr[e.type]:t===`textarea`}function Er(e,t,n,r){Cn?wn?wn.push(r):wn=[r]:Cn=r,t=Jf(t,`onChange`),0<t.length&&(n=new Vn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var Dr=null,Or=null;function kr(e){Vf(e,0)}function Ar(e){if(nn(It(e)))return e}function jr(e,t){if(e===`change`)return t}var Mr=!1;if(kn){var Nr;if(kn){var Pr=`oninput`in document;if(!Pr){var Fr=document.createElement(`div`);Fr.setAttribute(`oninput`,`return;`),Pr=typeof Fr.oninput==`function`}Nr=Pr}else Nr=!1;Mr=Nr&&(!document.documentMode||9<document.documentMode)}function Ir(){Dr&&(Dr.detachEvent(`onpropertychange`,Lr),Or=Dr=null)}function Lr(e){if(e.propertyName===`value`&&Ar(Or)){var t=[];Er(t,Or,e,Sn(e)),Dn(kr,t)}}function Rr(e,t,n){e===`focusin`?(Ir(),Dr=t,Or=n,Dr.attachEvent(`onpropertychange`,Lr)):e===`focusout`&&Ir()}function zr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return Ar(Or)}function Br(e,t){if(e===`click`)return Ar(t)}function Vr(e,t){if(e===`input`||e===`change`)return Ar(t)}function Hr(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var Ur=typeof Object.is==`function`?Object.is:Hr;function Wr(e,t){if(Ur(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!Re.call(t,i)||!Ur(e[i],t[i]))return!1}return!0}function Gr(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}function Kr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function qr(e,t){var n=Kr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=Kr(n)}}function Jr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Jr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Yr(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Gr(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Gr(e.document)}return t}function Xr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Zr=kn&&`documentMode`in document&&11>=document.documentMode,Qr=null,$r=null,ei=null,ti=!1;function ni(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;ti||Qr==null||Qr!==Gr(r)||(r=Qr,`selectionStart`in r&&Xr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),ei&&Wr(ei,r)||(ei=r,r=Jf($r,`onSelect`),0<r.length&&(t=new Vn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Qr)))}function ri(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var ii={animationend:ri(`Animation`,`AnimationEnd`),animationiteration:ri(`Animation`,`AnimationIteration`),animationstart:ri(`Animation`,`AnimationStart`),transitionrun:ri(`Transition`,`TransitionRun`),transitionstart:ri(`Transition`,`TransitionStart`),transitioncancel:ri(`Transition`,`TransitionCancel`),transitionend:ri(`Transition`,`TransitionEnd`)},ai={},oi={};kn&&(oi=document.createElement(`div`).style,`AnimationEvent`in window||(delete ii.animationend.animation,delete ii.animationiteration.animation,delete ii.animationstart.animation),`TransitionEvent`in window||delete ii.transitionend.transition);function si(e){if(ai[e])return ai[e];if(!ii[e])return e;var t=ii[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in oi)return ai[e]=t[n];return e}var ci=si(`animationend`),li=si(`animationiteration`),ui=si(`animationstart`),di=si(`transitionrun`),fi=si(`transitionstart`),pi=si(`transitioncancel`),mi=si(`transitionend`),hi=new Map,gi=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);gi.push(`scrollEnd`);function _i(e,t){hi.set(e,t),Ht(t,[e])}var vi=0;function yi(e,t){if(e.name!=null&&e.name!==`auto`)return e.name;if(t.autoName!==null)return t.autoName;e=bd.identifierPrefix;var n=vi++;return e=`_`+e+`t_`+n.toString(32)+`_`,t.autoName=e}function bi(e){if(e==null||typeof e==`string`)return e;var t=null,n=Od;if(n!==null)for(var r=0;r<n.length;r++){var i=e[n[r]];if(i!=null){if(i===`none`)return`none`;t=t==null?i:t+(` `+i)}}return t??e.default}function xi(e,t){return e=bi(e),t=bi(t),t==null?e===`auto`?null:e:t===`auto`?null:t}var Si=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},Ci=[],wi=0,Ti=0;function Ei(){for(var e=wi,t=Ti=wi=0;t<e;){var n=Ci[t];Ci[t++]=null;var r=Ci[t];Ci[t++]=null;var i=Ci[t];Ci[t++]=null;var a=Ci[t];if(Ci[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&Ai(n,i,a)}}function Di(e,t,n,r){Ci[wi++]=e,Ci[wi++]=t,Ci[wi++]=n,Ci[wi++]=r,Ti|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function Oi(e,t,n,r){return Di(e,t,n,r),ji(e)}function ki(e,t){return Di(e,null,null,t),ji(e)}function Ai(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-tt(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function ji(e){if(50<kd)throw kd=0,Ad=null,Error(i(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Mi={};function Ni(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Pi(e,t,n,r){return new Ni(e,t,n,r)}function Fi(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Ii(e,t){var n=e.alternate;return n===null?(n=Pi(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&1206910976,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function Li(e,t){e.flags&=1206910978;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Ri(e,t,n,r,a,o){var s=0;if(r=e,typeof r==`function`)Fi(r)&&(s=1);else if(typeof r==`string`)s=qm(e,n,Ce.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(r){case A:return e=Pi(31,n,t,a),e.elementType=A,e.lanes=o,e;case D:return zi(n.children,a,o,t);case ie:s=8,a|=24;break;case ae:return e=Pi(12,n,t,a|2),e.elementType=ae,e.lanes=o,e;case ce:return e=Pi(13,n,t,a),e.elementType=ce,e.lanes=o,e;case le:return e=Pi(19,n,t,a),e.elementType=le,e.lanes=o,e;case de:case fe:return e=a|32,e=Pi(30,n,t,e),e.elementType=fe,e.lanes=o,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof r==`object`&&r)switch(r.$$typeof){case O:s=10;break a;case oe:s=9;break a;case se:s=11;break a;case k:s=14;break a;case ue:s=16,r=null;break a}s=29,n=Error(i(130,e===null?`null`:typeof e,``)),r=null}return t=Pi(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function zi(e,t,n,r){return e=Pi(7,e,r,t),e.lanes=n,e}function Bi(e,t,n){return e=Pi(6,e,null,t),e.lanes=n,e}function Vi(e){var t=Pi(18,null,null,0);return t.stateNode=e,t}function Hi(e,t,n){return t=Pi(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Ui=new WeakMap;function Wi(e,t){if(typeof e==`object`&&e){var n=Ui.get(e);return n===void 0?(t={value:e,source:t,stack:Le(t)},Ui.set(e,t),t):n}return{value:e,source:t,stack:Le(t)}}var Gi=[],Ki=0,qi=null,Ji=0,Yi=[],Xi=0,Zi=null,Qi=1,$i=``;function ea(e,t){Gi[Ki++]=Ji,Gi[Ki++]=qi,qi=e,Ji=t}function ta(e,t,n){Yi[Xi++]=Qi,Yi[Xi++]=$i,Yi[Xi++]=Zi,Zi=e;var r=Qi;e=$i;var i=32-tt(r)-1;r&=~(1<<i),n+=1;var a=32-tt(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Qi=1<<32-tt(t)+i|n<<i|r,$i=a+e}else Qi=1<<a|n<<i|r,$i=e}function na(e){e.return!==null&&(ea(e,1),ta(e,1,0))}function ra(e){for(;e===qi;)qi=Gi[--Ki],Gi[Ki]=null,Ji=Gi[--Ki],Gi[Ki]=null;for(;e===Zi;)Zi=Yi[--Xi],Yi[Xi]=null,$i=Yi[--Xi],Yi[Xi]=null,Qi=Yi[--Xi],Yi[Xi]=null}function ia(e,t){Yi[Xi++]=Qi,Yi[Xi++]=$i,Yi[Xi++]=Zi,Qi=t.id,$i=t.overflow,Zi=e}var aa=null,R=null,z=!1,oa=null,sa=!1,ca=Error(i(519));function la(e){throw ha(Wi(Error(i(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),ca}function ua(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[wt]=e,t[Tt]=r,n){case`dialog`:Q(`cancel`,t),Q(`close`,t);break;case`iframe`:case`object`:case`embed`:Q(`load`,t);break;case`video`:case`audio`:for(n=0;n<zf.length;n++)Q(zf[n],t);break;case`source`:Q(`error`,t);break;case`img`:case`image`:case`link`:Q(`error`,t),Q(`load`,t);break;case`details`:Q(`toggle`,t);break;case`input`:Q(`invalid`,t),sn(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Q(`invalid`,t);break;case`textarea`:Q(`invalid`,t),dn(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||ep(t.textContent,n)?(r.popover!=null&&(Q(`beforetoggle`,t),Q(`toggle`,t)),r.onScroll!=null&&Q(`scroll`,t),r.onScrollEnd!=null&&Q(`scrollend`,t),r.onClick!=null&&(t.onclick=bn),t=!0):t=!1,t||la(e,!0)}function da(e){for(aa=e.return;aa;)switch(aa.tag){case 5:case 31:case 13:sa=!1;return;case 27:case 3:sa=!0;return;default:aa=aa.return}}function fa(e){if(e!==aa)return!1;if(!z)return da(e),z=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=n===`form`||n===`button`||pp(e.type,e.memoizedProps)),n=!n),n&&R&&la(e),da(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));R=dm(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));R=dm(e)}else t===27?(t=R,Sp(e.type)?(e=um,um=null,R=e):R=t):R=aa?lm(e.stateNode.nextSibling):null;return!0}function pa(){R=aa=null,z=!1}function ma(){var e=oa;return e!==null&&(pd===null?pd=e:pd.push.apply(pd,e),oa=null),e}function ha(e){oa===null?oa=[e]:oa.push(e)}var ga=Se(null),_a=null,va=null;function ya(e,t,n){F(ga,t._currentValue),t._currentValue=n}function ba(e){e._currentValue=ga.current,P(ga)}function xa(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Sa(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=a;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),xa(o.return,n,e),r||(s=null);break a}o=c.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(i(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),xa(s,n,e),s=null}else a.tag===13&&a.memoizedState!==null&&a.memoizedState.dehydrated===null?(a.lanes|=n,s=a.alternate,s!==null&&(s.lanes|=n),xa(a.return,n,e),s=a.child,s=s===null?null:s.sibling):s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function Ca(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(i(387));if(s=s.memoizedProps,s!==null){var c=a.type;Ur(a.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(a===Ee.current){if(s=a.alternate,s===null)throw Error(i(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[sh]:e.push(sh))}a=a.return}return e!==null&&Sa(t,e,n,r),t.flags|=262144,e!==null}function wa(e){for(e=e.firstContext;e!==null;){if(!Ur(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ta(e){_a=e,va=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Ea(e){return Oa(_a,e)}function Da(e,t){return _a===null&&Ta(e),Oa(e,t)}function Oa(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},va===null){if(e===null)throw Error(i(308));va=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else va=va.next=t;return n}var ka=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},Aa=t.unstable_scheduleCallback,ja=t.unstable_NormalPriority,Ma={$$typeof:O,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Na(){return{controller:new ka,data:new Map,refCount:0}}function Pa(e){e.refCount--,e.refCount===0&&Aa(ja,function(){e.controller.abort()})}function Fa(e,t){if(e.pendingLanes&4194048){var n=e.transitionTypes;for(n===null&&(n=e.transitionTypes=[]),e=0;e<t.length;e++){var r=t[e];n.indexOf(r)===-1&&n.push(r)}}}var Ia=null;function La(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var Ra=null,za=0,Ba=0,Va=null;function Ha(e,t){if(Ra===null){var n=Ra=[];za=0,Ba=Pf(),Va={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return za++,t.then(Ua,Ua),t}function Ua(){if(--za===0&&(Ia=null,Ra!==null)){Va!==null&&(Va.status=`fulfilled`);var e=Ra;Ra=null,Ba=0,Va=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Wa(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var Ga=M.S;M.S=function(e,t){if(gd=Ue(),typeof t==`object`&&t&&typeof t.then==`function`&&Ha(e,t),Ia!==null)for(var n=bf;n!==null;)Fa(n,Ia),n=n.next;if(n=e.types,n!==null){for(var r=bf;r!==null;)Fa(r,n),r=r.next;if(Ba!==0){r=Ia,r===null&&(r=Ia=[]);for(var i=0;i<n.length;i++){var a=n[i];r.indexOf(a)===-1&&r.push(a)}}}Ga!==null&&Ga(e,t)};var Ka=Se(null);function qa(){var e=Ka.current;return e===null?K.pooledCache:e}function Ja(e,t){t===null?F(Ka,Ka.current):F(Ka,t.pool)}function Ya(){var e=qa();return e===null?null:{parent:Ma._currentValue,pool:e}}var Xa=Error(i(460)),Za=Error(i(474)),Qa=Error(i(542)),$a={then:function(){}};function eo(e){return e=e.status,e===`fulfilled`||e===`rejected`}function to(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(bn,bn),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,ao(e),e===void 0&&!(`reason`in t)?Error(i(600)):e;default:if(typeof t.status==`string`)t.then(bn,bn);else{if(e=K,e!==null&&100<e.shellSuspendCounter)throw Error(i(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,ao(e),e}throw ro=t,Xa}}function no(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(ro=e,Xa):e}}var ro=null;function io(){if(ro===null)throw Error(i(459));var e=ro;return ro=null,e}function ao(e){if(e===Xa||e===Qa)throw Error(i(483))}var oo=null,so=0;function co(e){var t=so;return so+=1,oo===null&&(oo=[]),to(oo,e,t)}function lo(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function uo(e,t){throw t.$$typeof===te?Error(i(525)):(e=Object.prototype.toString.call(t),Error(i(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function fo(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=Ii(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=134217730,n):(r=r.index,r<n?(t.flags|=2,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=134217730),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=Bi(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function l(e,t,n,r){var i=n.type;return i===D?(e=d(e,t,n.props.children,r,n.key),lo(e,n),e):t!==null&&(t.elementType===i||typeof i==`object`&&i&&i.$$typeof===ue&&no(i)===t.type)?(t=a(t,n.props),lo(t,n),t.return=e,t):(t=Ri(n.type,n.key,n.props,null,e.mode,r),lo(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=Hi(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,i){return t===null||t.tag!==7?(t=zi(n,e.mode,r,i),t.return=e,t):(t=a(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=Bi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case ne:return n=Ri(t.type,t.key,t.props,null,e.mode,n),lo(n,t),n.return=e,n;case re:return t=Hi(t,e.mode,n),t.return=e,t;case ue:return t=no(t),f(e,t,n)}if(ve(t)||he(t))return t=zi(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,co(t),n);if(t.$$typeof===O)return f(e,Da(e,t),n);uo(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case ne:return n.key===i?l(e,t,n,r):null;case re:return n.key===i?u(e,t,n,r):null;case ue:return n=no(n),p(e,t,n,r)}if(ve(n)||he(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,co(n),r);if(n.$$typeof===O)return p(e,t,Da(e,n),r);uo(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case ne:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case re:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case ue:return r=no(r),m(e,t,n,r,i)}if(ve(r)||he(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,co(r),i);if(r.$$typeof===O)return m(e,t,n,Da(t,r),i);uo(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),z&&ea(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return z&&ea(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&(_=g.alternate,_!==null&&d.delete(_.key===null?h:_.key)),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),z&&ea(i,h),l}function g(a,s,c,l){if(c==null)throw Error(i(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(a,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(a,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(a,h),z&&ea(a,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(a,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return z&&ea(a,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,a,g,v.value,l),v!==null&&(e&&(_=v.alternate,_!==null&&h.delete(_.key===null?g:_.key)),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(a,e)}),z&&ea(a,g),u}function _(e,r,o,c){if(typeof o==`object`&&o&&o.type===D&&o.key===null&&o.props.ref===void 0&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case ne:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===D){if(r.tag===7){n(e,r.sibling),c=a(r,o.props.children),lo(c,o),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===ue&&no(l)===r.type){n(e,r.sibling),c=a(r,o.props),lo(c,o),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}o.type===D?(c=zi(o.props.children,e.mode,c,o.key),lo(c,o),c.return=e,e=c):(c=Ri(o.type,o.key,o.props,null,e.mode,c),lo(c,o),c.return=e,e=c)}return s(e);case re:a:{for(l=o.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=a(r,o.children||[]),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}c=Hi(o,e.mode,c),c.return=e,e=c}return s(e);case ue:return o=no(o),_(e,r,o,c)}if(ve(o))return h(e,r,o,c);if(he(o)){if(l=he(o),typeof l!=`function`)throw Error(i(150));return o=l.call(o),g(e,r,o,c)}if(typeof o.then==`function`)return _(e,r,co(o),c);if(o.$$typeof===O)return _(e,r,Da(e,o),c);uo(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=a(r,o),c.return=e,e=c):(n(e,r),c=Bi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{so=0;var i=_(e,t,n,r);return oo=null,i}catch(t){if(t===Xa||t===Qa)throw t;var a=Pi(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var po=fo(!0),mo=fo(!1),ho=!1;function go(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function _o(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function vo(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function yo(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,G&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=ji(e),Ai(e,null,n),t}return Di(e,r,t,n),ji(e)}function bo(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,_t(e,n)}}function xo(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n}else e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var So=!1;function Co(){if(So){var e=Va;if(e!==null)throw e}}function wo(e,t,n,r){So=!1;var i=e.updateQueue;ho=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,p=f!==s.lane;if(p?(J&f)===f:(r&f)===f){f!==0&&f===Ba&&(So=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var m=e,h=s;f=t;var g=n;switch(h.tag){case 1:if(m=h.payload,typeof m==`function`){d=m.call(g,d,f);break a}d=m;break a;case 3:m.flags=m.flags&-65537|128;case 0:if(m=h.payload,f=typeof m==`function`?m.call(g,d,f):m,f==null)break a;d=E({},d,f);break a;case 2:ho=!0}}f=s.callback,f!==null&&(e.flags|=64,p&&(e.flags|=8192),p=i.callbacks,p===null?i.callbacks=[f]:p.push(f))}else p={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=p,c=d):u=u.next=p,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;p=s,s=p.next,p.next=null,i.lastBaseUpdate=p,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),sd|=o,e.lanes=o,e.memoizedState=d}}function To(e,t){if(typeof e!=`function`)throw Error(i(191,e));e.call(t)}function Eo(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)To(n[e],t)}var Do=Se(null),Oo=Se(0);function ko(e,t){e=ad,F(Oo,e),F(Do,t),ad=e|t.baseLanes}function Ao(){F(Oo,ad),F(Do,Do.current)}function jo(){ad=Oo.current,P(Do),P(Oo)}var Mo=Se(null),No=null;function Po(e){var t=e.alternate;F(zo,zo.current&1),F(Mo,e),No===null&&(t===null||Do.current!==null||t.memoizedState!==null)&&(No=e)}function Fo(e){F(zo,zo.current),F(Mo,e),No===null&&(No=e)}function Io(e){e.tag===22?(F(zo,zo.current),F(Mo,e),No===null&&(No=e)):Lo()}function Lo(){F(zo,zo.current),F(Mo,Mo.current)}function Ro(e){P(Mo),No===e&&(No=null),P(zo)}var zo=Se(0);function Bo(e,t){F(Mo,Mo.current),F(zo,t)}function Vo(e){P(zo),P(Mo),No===e&&(No=null)}function Ho(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||om(n)||sm(n)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==`independent`){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Uo=0,B=null,V=null,Wo=null,Go=!1,Ko=!1,qo=!1,Jo=0,Yo=0,Xo=null,Zo=0;function Qo(){throw Error(i(321))}function $o(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Ur(e[n],t[n]))return!1;return!0}function es(e,t,n,r,i,a){return Uo=a,B=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,M.H=e===null||e.memoizedState===null?_c:vc,qo=!1,a=n(r,i),qo=!1,Ko&&(a=ns(t,n,r,i)),ts(e),a}function ts(e){M.H=gc;var t=V!==null&&V.next!==null;if(Uo=0,Wo=V=B=null,Go=!1,Yo=0,Xo=null,t)throw Error(i(300));e===null||Fc||(e=e.dependencies,e!==null&&wa(e)&&(Fc=!0))}function ns(e,t,n,r){B=e;var a=0;do{if(Ko&&(Xo=null),Yo=0,Ko=!1,25<=a)throw Error(i(301));if(a+=1,Wo=V=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}M.H=yc,o=t(n,r)}while(Ko);return o}function rs(){var e=M.H,t=e.useState()[0];return t=typeof t.then==`function`?us(t):t,e=e.useState()[0],(V===null?null:V.memoizedState)!==e&&(B.flags|=1024),t}function is(){var e=Jo!==0;return Jo=0,e}function as(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function os(e){if(Go){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Go=!1}Uo=0,Wo=V=B=null,Ko=!1,Yo=Jo=0,Xo=null}function ss(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Wo===null?B.memoizedState=Wo=e:Wo=Wo.next=e,Wo}function cs(){if(V===null){var e=B.alternate;e=e===null?null:e.memoizedState}else e=V.next;var t=Wo===null?B.memoizedState:Wo.next;if(t!==null)Wo=t,V=e;else{if(e===null)throw B.alternate===null?Error(i(467)):Error(i(310));V=e,e={memoizedState:V.memoizedState,baseState:V.baseState,baseQueue:V.baseQueue,queue:V.queue,next:null},Wo===null?B.memoizedState=Wo=e:Wo=Wo.next=e}return Wo}function ls(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function us(e){var t=Yo;return Yo+=1,Xo===null&&(Xo=[]),e=to(Xo,e,t),t=B,(Wo===null?t.memoizedState:Wo.next)===null&&(t=t.alternate,M.H=t===null||t.memoizedState===null?_c:vc),e}function ds(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return us(e);if(e.$$typeof===pe)return;if(e.$$typeof===O)return Ea(e)}throw Error(i(438,String(e)))}function fs(e){var t=null,n=B.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=B.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??={data:[],index:0},n===null&&(n=ls(),B.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=j;return t.index++,n}function ps(e,t){return typeof t==`function`?t(e):t}function ms(e){return hs(cs(),V,e)}function hs(e,t,n){var r=e.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(Uo&f)===f:(J&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===Ba&&(d=!0);else if((Uo&p)===p){u=u.next,p===Ba&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,B.lanes|=p,sd|=p;f=u.action,qo&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,B.lanes|=f,sd|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!Ur(o,e.memoizedState)&&(Fc=!0,d&&(n=Va,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function gs(e){var t=cs(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);Ur(o,t.memoizedState)||(Fc=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function _s(e,t,n){var r=B,a=cs(),o=z;if(o){if(n===void 0)throw Error(i(407));n=n()}else n=t();var s=!Ur((V||a).memoizedState,n);if(s&&(a.memoizedState=n,Fc=!0),a=a.queue,Hs(bs.bind(null,r,a,e),[e]),e=a.getSnapshot!==t||s||Wo!==null&&!!(Wo.memoizedState.tag&1),Ls(e?9:8,{destroy:void 0},ys.bind(null,r,a,n,t),null),e){if(r.flags|=2048,K===null)throw Error(i(349));o||Uo&127||vs(r,t,n)}return n}function vs(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=B.updateQueue,t===null?(t=ls(),B.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function ys(e,t,n,r){t.value=n,t.getSnapshot=r,xs(t)&&Ss(e)}function bs(e,t,n){return n(function(){xs(t)&&Ss(e)})}function xs(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Ur(e,n)}catch{return!0}}function Ss(e){var t=ki(e,2);t!==null&&Pd(t,e,2)}function Cs(e){var t=ss();if(typeof e==`function`){var n=e;if(e=n(),qo){et(!0);try{n()}finally{et(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ps,lastRenderedState:e},t}function ws(e,t,n,r){return e.baseState=n,hs(e,V,typeof r==`function`?r:ps)}function Ts(e,t,n,r,a){if(pc(e))throw Error(i(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};M.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Es(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Es(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=M.T,o={};o.types=a===null?null:a.types,M.T=o;try{var s=n(i,r),c=M.S;c!==null&&c(o,s),Ds(e,t,s)}catch(n){ks(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),M.T=a}}else try{a=n(i,r),Ds(e,t,a)}catch(n){ks(e,t,n)}}function Ds(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Os(e,t,n)},function(n){return ks(e,t,n)}):Os(e,t,n)}function Os(e,t,n){t.status=`fulfilled`,t.value=n,As(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Es(e,n)))}function ks(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,As(t),t=t.next;while(t!==r)}e.action=null}function As(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function js(e,t){return t}function Ms(e,t){if(z){var n=K.formState;if(n!==null){a:{var r=B;if(z){if(R){b:{for(var i=R,a=sa;i.nodeType!==8;)if(!a||(i=lm(i.nextSibling),i===null)){i=null;break b}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){R=lm(i.nextSibling),r=i.data===`F!`;break a}}la(r)}r=!1}r&&(t=n[0])}}return n=ss(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:js,lastRenderedState:t},n.queue=r,n=uc.bind(null,B,r),r.dispatch=n,r=Cs(!1),a=fc.bind(null,B,!1,r.queue),r=ss(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Ts.bind(null,B,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function Ns(e){return Ps(cs(),V,e)}function Ps(e,t,n){if(t=hs(e,t,js)[0],e=ms(ps)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=us(t)}catch(e){throw e===Xa?Qa:e}else r=t;t=cs();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(B.flags|=2048,Ls(9,{destroy:void 0},Fs.bind(null,i,n),null)),[r,a,e]}function Fs(e,t){e.action=t}function Is(e){var t=cs(),n=V;if(n!==null)return Ps(t,n,e);cs(),t=t.memoizedState,n=cs();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function Ls(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=B.updateQueue,t===null&&(t=ls(),B.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function Rs(){return cs().memoizedState}function zs(e,t,n,r){var i=ss();B.flags|=e,i.memoizedState=Ls(1|t,{destroy:void 0},n,r===void 0?null:r)}function Bs(e,t,n,r){var i=cs();r=r===void 0?null:r;var a=i.memoizedState.inst;V!==null&&r!==null&&$o(r,V.memoizedState.deps)?i.memoizedState=Ls(t,a,n,r):(B.flags|=e,i.memoizedState=Ls(1|t,a,n,r))}function Vs(e,t){zs(8390656,8,e,t)}function Hs(e,t){Bs(2048,8,e,t)}function Us(e){B.flags|=4;var t=B.updateQueue;if(t===null)t=ls(),B.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function Ws(e){var t=cs().memoizedState;return Us({ref:t,nextImpl:e}),function(){if(G&2)throw Error(i(440));return t.impl.apply(void 0,arguments)}}function Gs(e,t){return Bs(4,2,e,t)}function Ks(e,t){return Bs(4,4,e,t)}function qs(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Js(e,t,n){n=n==null?null:n.concat([e]),Bs(4,4,qs.bind(null,t,e),n)}function Ys(){}function Xs(e,t){var n=cs();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&$o(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Zs(e,t){var n=cs();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&$o(t,r[1]))return r[0];if(r=e(),qo){et(!0);try{e()}finally{et(!1)}}return n.memoizedState=[r,t],r}function Qs(e,t,n){return n===void 0||Uo&1073741824&&!(J&261930)?e.memoizedState=t:(e.memoizedState=n,e=Md(),B.lanes|=e,sd|=e,n)}function $s(e,t,n,r){return Ur(n,t)?n:Do.current===null?!(Uo&106)||Uo&1073741824&&!(J&261930)?(Fc=!0,e.memoizedState=n):(e=Md(),B.lanes|=e,sd|=e,t):(e=Qs(e,n,r),Ur(e,t)||(Fc=!0),e)}function ec(e,t,n,r,i){var a=N.p;N.p=a!==0&&8>a?a:8;var o=M.T,s={};s.types=o===null?null:o.types,M.T=s,fc(e,!1,t,n);try{var c=i(),l=M.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?dc(e,t,Wa(c,r),jd(e)):dc(e,t,r,jd(e))}catch(n){dc(e,t,{then:function(){},status:`rejected`,reason:n},jd())}finally{N.p=a,o!==null&&s.types!==null&&(o.types=s.types),M.T=o}}function tc(){}function nc(e,t,n,r){if(e.tag!==5)throw Error(i(476));var a=rc(e).queue;ec(e,a,t,ye,n===null?tc:function(){return ic(e),n(r)})}function rc(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:ye,baseState:ye,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ps,lastRenderedState:ye},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ps,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function ic(e){var t=rc(e);t.next===null&&(t=e.alternate.memoizedState),dc(e,t.next.queue,{},jd())}function ac(){return Ea(sh)}function oc(){return cs().memoizedState}function sc(){return cs().memoizedState}function cc(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=jd();e=vo(n);var r=yo(t,e,n);r!==null&&(Pd(r,t,n),bo(r,t,n)),t={cache:Na()},e.payload=t;return}t=t.return}}function lc(e,t,n){var r=jd();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},pc(e)?mc(t,n):(n=Oi(e,t,n,r),n!==null&&(Pd(n,e,r),hc(n,t,r)))}function uc(e,t,n){dc(e,t,n,jd())}function dc(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(pc(e))mc(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,Ur(s,o))return Di(e,t,i,0),K===null&&Ei(),!1}catch{}if(n=Oi(e,t,i,r),n!==null)return Pd(n,e,r),hc(n,t,r),!0}return!1}function fc(e,t,n,r){if(r={lane:2,revertLane:Pf(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},pc(e)){if(t)throw Error(i(479))}else t=Oi(e,n,r,2),t!==null&&Pd(t,e,2)}function pc(e){var t=e.alternate;return e===B||t!==null&&t===B}function mc(e,t){Ko=Go=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function hc(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,_t(e,n)}}var gc={readContext:Ea,use:ds,useCallback:Qo,useContext:Qo,useEffect:Qo,useImperativeHandle:Qo,useLayoutEffect:Qo,useInsertionEffect:Qo,useMemo:Qo,useReducer:Qo,useRef:Qo,useState:Qo,useDebugValue:Qo,useDeferredValue:Qo,useTransition:Qo,useSyncExternalStore:Qo,useId:Qo,useHostTransitionStatus:Qo,useFormState:Qo,useActionState:Qo,useOptimistic:Qo,useMemoCache:Qo,useCacheRefresh:Qo,useEffectEvent:Qo},_c={readContext:Ea,use:ds,useCallback:function(e,t){return ss().memoizedState=[e,t===void 0?null:t],e},useContext:Ea,useEffect:Vs,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),zs(4194308,4,qs.bind(null,t,e),n)},useLayoutEffect:function(e,t){return zs(4194308,4,e,t)},useInsertionEffect:function(e,t){zs(4,2,e,t)},useMemo:function(e,t){var n=ss();t=t===void 0?null:t;var r=e();if(qo){et(!0);try{e()}finally{et(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=ss();if(n!==void 0){var i=n(t);if(qo){et(!0);try{n(t)}finally{et(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=lc.bind(null,B,e),[r.memoizedState,e]},useRef:function(e){var t=ss();return e={current:e},t.memoizedState=e},useState:function(e){e=Cs(e);var t=e.queue,n=uc.bind(null,B,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:Ys,useDeferredValue:function(e,t){return Qs(ss(),e,t)},useTransition:function(){var e=Cs(!1);return e=ec.bind(null,B,e.queue,!0,!1),ss().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=B,a=ss();if(z){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),K===null)throw Error(i(349));J&127||vs(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,Vs(bs.bind(null,r,o,e),[e]),r.flags|=2048,Ls(9,{destroy:void 0},ys.bind(null,r,o,n,t),null),n},useId:function(){var e=ss(),t=K.identifierPrefix;if(z){var n=$i,r=Qi;n=(r&~(1<<32-tt(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=Jo++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=Zo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:ac,useFormState:Ms,useActionState:Ms,useOptimistic:function(e){var t=ss();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=fc.bind(null,B,!0,n),n.dispatch=t,[e,t]},useMemoCache:fs,useCacheRefresh:function(){return ss().memoizedState=cc.bind(null,B)},useEffectEvent:function(e){var t=ss(),n={impl:e};return t.memoizedState=n,function(){if(G&2)throw Error(i(440));return n.impl.apply(void 0,arguments)}}},vc={readContext:Ea,use:ds,useCallback:Xs,useContext:Ea,useEffect:Hs,useImperativeHandle:Js,useInsertionEffect:Gs,useLayoutEffect:Ks,useMemo:Zs,useReducer:ms,useRef:Rs,useState:function(){return ms(ps)},useDebugValue:Ys,useDeferredValue:function(e,t){return $s(cs(),V.memoizedState,e,t)},useTransition:function(){var e=ms(ps)[0],t=cs().memoizedState;return[typeof e==`boolean`?e:us(e),t]},useSyncExternalStore:_s,useId:oc,useHostTransitionStatus:ac,useFormState:Ns,useActionState:Ns,useOptimistic:function(e,t){return ws(cs(),V,e,t)},useMemoCache:fs,useCacheRefresh:sc,useEffectEvent:Ws},yc={readContext:Ea,use:ds,useCallback:Xs,useContext:Ea,useEffect:Hs,useImperativeHandle:Js,useInsertionEffect:Gs,useLayoutEffect:Ks,useMemo:Zs,useReducer:gs,useRef:Rs,useState:function(){return gs(ps)},useDebugValue:Ys,useDeferredValue:function(e,t){var n=cs();return V===null?Qs(n,e,t):$s(n,V.memoizedState,e,t)},useTransition:function(){var e=gs(ps)[0],t=cs().memoizedState;return[typeof e==`boolean`?e:us(e),t]},useSyncExternalStore:_s,useId:oc,useHostTransitionStatus:ac,useFormState:Is,useActionState:Is,useOptimistic:function(e,t){var n=cs();return V===null?(n.baseState=e,[e,n.queue.dispatch]):ws(n,V,e,t)},useMemoCache:fs,useCacheRefresh:sc,useEffectEvent:Ws};function bc(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:E({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var xc={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=jd(),i=vo(r);i.payload=t,n!=null&&(i.callback=n),t=yo(e,i,r),t!==null&&(Pd(t,e,r),bo(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=jd(),i=vo(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=yo(e,i,r),t!==null&&(Pd(t,e,r),bo(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=jd(),r=vo(n);r.tag=2,t!=null&&(r.callback=t),t=yo(e,r,n),t!==null&&(Pd(t,e,n),bo(t,e,n))}};function Sc(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Wr(n,r)||!Wr(i,a):!0}function Cc(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&xc.enqueueReplaceState(t,t.state,null)}function wc(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=E({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Tc(e){Si(e)}function Ec(e){console.error(e)}function Dc(e){Si(e)}function Oc(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function kc(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Ac(e,t,n){return n=vo(n),n.tag=3,n.payload={element:null},n.callback=function(){Oc(e,t)},n}function jc(e){return e=vo(e),e.tag=3,e}function Mc(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){kc(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){kc(t,n,r),typeof i!=`function`&&(yd===null?yd=new Set([this]):yd.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function Nc(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&Ca(t,n,a,!0),n=Mo.current,n!==null){switch(n.tag){case 31:case 13:case 19:return No===null?Kd():n.alternate===null&&od===0&&(od=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===$a?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),mf(e,r,a)),!1;case 22:return n.flags|=65536,r===$a?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),mf(e,r,a)),!1}throw Error(i(435,n.tag))}return mf(e,r,a),Kd(),!1}if(z)return t=Mo.current,t===null?(r!==ca&&(t=Error(i(423),{cause:r}),ha(Wi(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=Wi(r,n),a=Ac(e.stateNode,r,a),xo(e,a),od!==4&&(od=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==ca&&(e=Error(i(422),{cause:r}),ha(Wi(e,n)))),!1;var o=Error(i(520),{cause:r});if(o=Wi(o,n),fd===null?fd=[o]:fd.push(o),od!==4&&(od=2),t===null)return!0;r=Wi(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=Ac(n.stateNode,r,e),xo(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(yd===null||!yd.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=jc(a),Mc(a,e,n,r),xo(n,a),!1;break;case 22:if(n.memoizedState!==null)return n.flags|=65536,!1}n=n.return}while(n!==null);return!1}var Pc=Error(i(461)),Fc=!1;function Ic(e,t,n,r){t.child=e===null?mo(t,null,n,r):po(t,e.child,n,r)}function Lc(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return Ta(t),r=es(e,t,n,o,a,i),s=is(),e!==null&&!Fc?(as(e,t,i),dl(e,t,i)):(z&&s&&na(t),t.flags|=1,Ic(e,t,r,i),t.child)}function Rc(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!Fi(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,zc(e,t,a,r,i)):(e=Ri(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!fl(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Wr:n,n(o,r)&&e.ref===t.ref)return dl(e,t,i)}return t.flags|=1,e=Ii(a,r),e.ref=t.ref,e.return=t,t.child=e}function zc(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Wr(a,r)&&e.ref===t.ref){if(Fc=!1,t.pendingProps=r=a,fl(e,i))e.flags&131072&&(Fc=!0);else return t.lanes=e.lanes,dl(e,t,i)}}return qc(e,t,n,r,i)}function Bc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return Hc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ja(t,a===null?null:a.cachePool),a===null?Ao():ko(t,a),Io(t);else return r=t.lanes=536870912,Hc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&Ja(t,null),Ao(),Lo()):(Ja(t,a.cachePool),ko(t,a),Lo(),t.memoizedState=null);return Ic(e,t,i,n),t.child}function Vc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Hc(e,t,n,r,i){var a=qa();return a=a===null?null:{parent:Ma._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Ja(t,null),Ao(),Io(t),e!==null&&Ca(e,t,r,!0),t.childLanes=i,null}function Uc(e,t){return t=nl({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Wc(e,t,n){return po(t,e.child,null,n),e=Uc(t,t.pendingProps),e.flags|=2,Ro(t),t.memoizedState=null,e}function Gc(e,t,n){var r=t.pendingProps,a=!!(t.flags&128);if(t.flags&=-129,e===null){if(z){if(r.mode===`hidden`)return e=Uc(t,r),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Vc(null,e);if(Fo(t),(e=R)?(e=am(e,sa),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Zi===null?null:{id:Qi,overflow:$i},retryLane:536870912,hydrationErrors:null},n=Vi(e),n.return=t,t.child=n,aa=t,R=null)):e=null,e===null)throw la(t);return t.lanes=536870912,null}return Uc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(Fo(t),a){if(t.flags&256)t.flags&=-257,t=Wc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(i(558))}else if(Fc||Ca(e,t,n,!1),a=(n&e.childLanes)!==0,Fc||a){if(Do.current===null){if(r=K,r!==null&&(s=vt(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,ki(e,s),Pd(r,e,s),Pc;Kd()}t=Wc(e,t,n)}else e=o.treeContext,R=lm(s.nextSibling),aa=t,z=!0,oa=null,sa=!1,e!==null&&ia(t,e),t=Uc(t,r),t.flags|=134221824;return t}return e=Ii(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Kc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(i(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function qc(e,t,n,r,i){return Ta(t),n=es(e,t,n,r,void 0,i),r=is(),e!==null&&!Fc?(as(e,t,i),dl(e,t,i)):(z&&r&&na(t),t.flags|=1,Ic(e,t,n,i),t.child)}function Jc(e,t,n,r,i,a){return Ta(t),t.updateQueue=null,n=ns(t,r,n,i),ts(e),r=is(),e!==null&&!Fc?(as(e,t,a),dl(e,t,a)):(z&&r&&na(t),t.flags|=1,Ic(e,t,n,a),t.child)}function Yc(e,t,n,r,i){if(Ta(t),t.stateNode===null){var a=Mi,o=n.contextType;typeof o==`object`&&o&&(a=Ea(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=xc,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},go(t),o=n.contextType,a.context=typeof o==`object`&&o?Ea(o):Mi,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(bc(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&xc.enqueueReplaceState(a,a.state,null),wo(t,r,a,i),Co(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=wc(n,s);a.props=c;var l=a.context,u=n.contextType;o=Mi,typeof u==`object`&&u&&(o=Ea(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Cc(t,a,r,o),ho=!1;var f=t.memoizedState;a.state=f,wo(t,r,a,i),Co(),l=t.memoizedState,s||f!==l||ho?(typeof d==`function`&&(bc(t,n,d,r),l=t.memoizedState),(c=ho||Sc(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,_o(e,t),o=t.memoizedProps,u=wc(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=Mi,typeof l==`object`&&l&&(c=Ea(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Cc(t,a,r,c),ho=!1,f=t.memoizedState,a.state=f,wo(t,r,a,i),Co();var p=t.memoizedState;o!==d||f!==p||ho||e!==null&&e.dependencies!==null&&wa(e.dependencies)?(typeof s==`function`&&(bc(t,n,s,r),p=t.memoizedState),(u=ho||Sc(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&wa(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,Kc(e,t),r=!!(t.flags&128),a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=po(t,e.child,null,i),t.child=po(t,null,n,i)):Ic(e,t,n,i),t.memoizedState=a.state,e=t.child):e=dl(e,t,i),e}function Xc(e,t,n,r){return pa(),t.flags|=256,Ic(e,t,n,r),t.child}var Zc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Qc(e){return{baseLanes:e,cachePool:Ya()}}function $c(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=ud),e}function el(e,t,n){var r=t.pendingProps,i=!1,a=!!(t.flags&128),o;if((o=a)||(o=e!==null&&e.memoizedState===null?!1:!!(zo.current&2)),o&&(i=!0,t.flags&=-129),o=!!(t.flags&32),t.flags&=-33,e===null){if(z){if(i?Po(t):Lo(),(e=R)?(e=am(e,sa),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Zi===null?null:{id:Qi,overflow:$i},retryLane:536870912,hydrationErrors:null},n=Vi(e),n.return=t,t.child=n,aa=t,R=null)):e=null,e===null)throw la(t);return t.lanes=sm(e)?32:536870912,null}return a=r.children,r=r.fallback,i?(Lo(),i=t.mode,a=nl({mode:`hidden`,children:a},i),r=zi(r,i,n,null),a.return=t,r.return=t,a.sibling=r,t.child=a,r=t.child,r.memoizedState=Qc(n),r.childLanes=$c(e,o,n),t.memoizedState=Zc,Vc(null,r)):(Po(t),tl(t,a))}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(c!==null)return il(e,t,a,o,r,c,s,n)}return i?(Lo(),i=r.fallback,a=t.mode,s=e.child,c=s.sibling,r=Ii(s,{mode:`hidden`,children:r.children}),r.subtreeFlags=s.subtreeFlags&1206910976,c===null?(i=zi(i,a,n,null),i.flags|=2):i=Ii(c,i),i.return=t,r.return=t,r.sibling=i,t.child=r,Vc(null,r),r=t.child,i=e.child.memoizedState,i===null?i=Qc(n):(a=i.cachePool,a===null?a=Ya():(s=Ma._currentValue,a=a.parent===s?a:{parent:s,pool:s}),i={baseLanes:i.baseLanes|n,cachePool:a}),r.memoizedState=i,r.childLanes=$c(e,o,n),t.memoizedState=Zc,Vc(e.child,r)):(Po(t),n=e.child,e=n.sibling,n=Ii(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(o=t.deletions,o===null?(t.deletions=[e],t.flags|=16):o.push(e)),t.child=n,t.memoizedState=null,n)}function tl(e,t){return t=nl({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function nl(e,t){return e=Pi(22,e,null,t),e.lanes=0,e}function rl(e,t,n){return po(t,e.child,null,n),e=tl(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function il(e,t,n,r,a,o,s,c){if(n)return t.flags&256?(Po(t),t.flags&=-257,rl(e,t,c)):t.memoizedState===null?(Lo(),o=a.fallback,s=t.mode,a=nl({mode:`visible`,children:a.children},s),o=zi(o,s,c,null),o.flags|=2,a.return=t,o.return=t,a.sibling=o,t.child=a,po(t,e.child,null,c),a=t.child,a.memoizedState=Qc(c),a.childLanes=$c(e,r,c),t.memoizedState=Zc,Vc(null,a)):(Lo(),t.child=e.child,t.flags|=128,null);if(Po(t),sm(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var l=r.dgst;return r=l,r!==``&&(a=Error(i(419)),a.stack=``,a.digest=r,ha({value:a,source:null,stack:null})),rl(e,t,c)}if(Fc||Ca(e,t,c,!1),r=(c&e.childLanes)!==0,Fc||r){if(Do.current!==null)return rl(e,t,c);if(r=K,r!==null&&(a=vt(r,c),a!==0&&a!==s.retryLane))throw s.retryLane=a,ki(e,a),Pd(r,e,a),Pc;return om(o)||Kd(),rl(e,t,c)}return om(o)?(t.flags|=192,t.child=e.child,null):(e=s.treeContext,R=lm(o.nextSibling),aa=t,z=!0,oa=null,sa=!1,e!==null&&ia(t,e),t=tl(t,a.children),t.flags|=134221824,t)}function al(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),xa(e.return,t,n)}function ol(e){for(var t=null;e!==null;){var n=e.alternate;n!==null&&Ho(n)===null&&(t=e),e=e.sibling}return t}function sl(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function cl(e){var t=e.child;for(e.child=null;t!==null;){var n=t.sibling;t.sibling=e.child,e.child=t,t=n}}function ll(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=zo.current;if(t.flags&128)return Bo(t,o),null;var s=!!(o&2);if(s?(o=o&1|2,t.flags|=128):o&=1,Bo(t,o),i===`backwards`&&e!==null?(cl(e),Ic(e,t,r,n),cl(e)):Ic(e,t,r,n),r=z?Ji:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&al(e,n,t);else if(e.tag===19)al(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`backwards`:n=ol(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null,cl(t)),sl(t,!0,i,null,a,r);break;case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&Ho(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}sl(t,!0,n,null,a,r);break;case`together`:sl(t,!1,null,null,void 0,r);break;case`independent`:t.memoizedState=null;break;default:n=ol(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),sl(t,!1,i,n,a,r)}return t.child}function ul(e,t,n){var r=t.pendingProps;return ya(t,t.type,r.value),Ic(e,t,r.children,n),t.child}function dl(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),sd|=t.lanes,(n&t.childLanes)===0){if(e!==null){if(Ca(e,t,n,!1),(n&t.childLanes)===0)return null}else return null}if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=Ii(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Ii(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function fl(e,t){return(e.lanes&t)!==0||(e=e.dependencies,!!(e!==null&&wa(e)))}function pl(e,t,n){switch(t.tag){case 3:De(t,t.stateNode.containerInfo),ya(t,Ma,e.memoizedState.cache),pa();break;case 27:case 5:ke(t);break;case 4:De(t,t.stateNode.containerInfo);break;case 10:ya(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Fo(t),null;break;case 13:var r=t.memoizedState;if(r!==null){if(r.dehydrated!==null)return Po(t),t.flags|=128,null;r=Ca(e,t,n,!1);var i=t.child.childLanes;return r||(n&i)!==0?el(e,t,n):(Po(t),e=dl(e,t,n),e===null?null:e.sibling)}Po(t);break;case 19:if(t.flags&128)return ll(e,t,n);if(i=!!(e.flags&128),r=(n&t.childLanes)!==0,r||=(Ca(e,t,n,!1),(n&t.childLanes)!==0),i){if(r)return ll(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),Bo(t,zo.current),r)break;return null;case 22:return t.lanes=0,Bc(e,t,n,t.pendingProps);case 24:ya(t,Ma,e.memoizedState.cache)}return dl(e,t,n)}function ml(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps)Fc=!0;else{if(!fl(e,n)&&!(t.flags&128))return Fc=!1,pl(e,t,n);Fc=!!(e.flags&131072)}}else Fc=!1,z&&t.flags&1048576&&ta(t,Ji,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=no(t.elementType),t.type=e,typeof e==`function`)Fi(e)?(r=wc(e,r),t.tag=1,t=Yc(null,t,e,r,n)):(t.tag=0,t=qc(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===se){t.tag=11,t=Lc(null,t,e,r,n);break a}if(a===k){t.tag=14,t=Rc(null,t,e,r,n);break a}if(a===O){t.tag=10,t.type=e,t=ul(null,t,n);break a}}throw t=_e(e)||e,Error(i(306,t,``))}}return t;case 0:return qc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=wc(r,t.pendingProps),Yc(e,t,r,a,n);case 3:a:{if(De(t,t.stateNode.containerInfo),e===null)throw Error(i(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,_o(e,t),wo(t,r,null,n);var s=t.memoizedState;if(r=s.cache,ya(t,Ma,r),r!==o.cache&&Sa(t,[Ma],n,!0),Co(),r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=Xc(e,t,r,n);break a}if(r!==a){a=Wi(Error(i(424)),t),ha(a),t=Xc(e,t,r,n);break a}switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(R=lm(e.firstChild),aa=t,z=!0,oa=null,sa=!0,n=mo(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|134221824,n=n.sibling}else{if(pa(),r===a){t=dl(e,t,n);break a}Ic(e,t,r,n)}t=t.child}return t;case 26:return Kc(e,t),e===null?(n=Nm(t.type,null,t.pendingProps,null))?t.memoizedState=n:z||(t.stateNode=fp(t.type,t.pendingProps,Te.current,t)):t.memoizedState=Nm(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return ke(t),e===null&&z&&(r=t.stateNode=hm(t.type,t.pendingProps,Te.current),aa=t,sa=!0,a=R,Sp(t.type)?(um=a,R=lm(r.firstChild)):R=a),Ic(e,t,t.pendingProps.children,n),Kc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&z&&((a=r=R)&&(r=rm(r,t.type,t.pendingProps,sa),r===null?a=!1:(t.stateNode=r,aa=t,R=lm(r.firstChild),sa=!1,a=!0)),a||la(t)),ke(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,pp(a,o)?r=null:s!==null&&pp(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=es(e,t,rs,null,null,n),sh._currentValue=a),Kc(e,t),Ic(e,t,r,n),t.child;case 6:return e===null&&z&&((e=n=R)&&(n=im(n,t.pendingProps,sa),n===null?e=!1:(t.stateNode=n,aa=t,R=null,e=!0)),e||la(t)),null;case 13:return el(e,t,n);case 4:return De(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=po(t,null,r,n):Ic(e,t,r,n),t.child;case 11:return Lc(e,t,t.type,t.pendingProps,n);case 7:return r=t.pendingProps,Kc(e,t),Ic(e,t,r,n),t.child;case 8:return Ic(e,t,t.pendingProps.children,n),t.child;case 12:return Ic(e,t,t.pendingProps.children,n),t.child;case 10:return ul(e,t,n);case 9:return a=t.type._context,r=t.pendingProps.children,Ta(t),a=Ea(a),r=r(a),t.flags|=1,Ic(e,t,r,n),t.child;case 14:return Rc(e,t,t.type,t.pendingProps,n);case 15:return zc(e,t,t.type,t.pendingProps,n);case 19:return ll(e,t,n);case 31:return Gc(e,t,n);case 22:return Bc(e,t,n,t.pendingProps);case 24:return Ta(t),r=Ea(Ma),e===null?(a=qa(),a===null&&(a=K,o=Na(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},go(t),ya(t,Ma,a)):((e.lanes&n)!==0&&(_o(e,t),wo(t,null,null,n),Co()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,ya(t,Ma,r),r!==a.cache&&Sa(t,[Ma],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),ya(t,Ma,r))),Ic(e,t,t.pendingProps.children,n),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),r=t.pendingProps,r.name!=null&&r.name!==`auto`?t.flags|=e===null?18882560:18874368:z&&na(t),e!==null&&e.memoizedProps.name!==r.name?t.flags|=4194816:Kc(e,t),Ic(e,t,r.children,n),t.child;case 29:throw t.pendingProps}throw Error(i(156,t.tag))}function hl(e){e.flags|=4}function gl(e,t,n,r,i){var a;if((a=!!(e.mode&32))&&(a=n===null?Jm(t,r):Jm(t,r)&&(r.src!==n.src||r.srcSet!==n.srcSet)),a){if(e.flags|=16777216,(i&335544128)===i){if(e.stateNode.complete)e.flags|=8192;else if(Ud())e.flags|=8192;else throw ro=$a,Za}}else e.flags&=-16777217}function _l(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Ym(t)){if(Ud())e.flags|=8192;else throw ro=$a,Za}}function vl(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:ft(),e.lanes|=t,dd|=t)}function yl(e,t){if(!z)switch(e.tailMode){case`visible`:break;case`collapsed`:for(var n=e.tail,r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null;break;default:for(t=e.tail,n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null}}function H(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&1206910976,r|=i.flags&1206910976,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function bl(e,t,n){var r=t.pendingProps;switch(ra(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return H(t),null;case 1:return H(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),ba(Ma),Oe(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(fa(t)?hl(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,ma())),H(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(hl(t),o===null?(H(t),gl(t,a,null,r,n)):(H(t),_l(t,o))):o?o===e.memoizedState?(H(t),t.flags&=-16777217):(hl(t),H(t),_l(t,o)):(e=e.memoizedProps,e!==r&&hl(t),H(t),gl(t,a,e,r,n)),null;case 27:if(Ae(t),n=Te.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&hl(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return H(t),t.subtreeFlags&=-33554433,null}e=Ce.current,fa(t)?ua(t,e):(e=hm(a,r,n),t.stateNode=e,hl(t))}return H(t),t.subtreeFlags&=-33554433,null;case 5:if(Ae(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&hl(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return H(t),t.subtreeFlags&=-33554433,null}if(o=Ce.current,fa(t))ua(t,o);else{var s=lp(Te.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[wt]=t,o[Tt]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(np(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&hl(t)}}return H(t),t.subtreeFlags&=-33554433,gl(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&hl(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(i(166));if(e=Te.current,fa(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=aa,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[wt]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||ep(e.nodeValue,n)),e||la(t,!0)}else e=lp(e).createTextNode(r),e[wt]=t,t.stateNode=e}return H(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=fa(t),n!==null){if(e===null){if(!r)throw Error(i(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(557));e[wt]=t}else pa(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;H(t),e=!1}else n=ma(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(Ro(t),t):(Ro(t),null);if(t.flags&128)throw Error(i(558))}return H(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=fa(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(i(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(i(317));a[wt]=t}else pa(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;H(t),a=!1}else a=ma(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?(Ro(t),t):(Ro(t),null)}return Ro(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),vl(t,t.updateQueue),H(t),null);case 4:return Oe(),e===null&&Wf(t.stateNode.containerInfo),t.flags|=67108864,H(t),null;case 10:return ba(t.type),H(t),null;case 19:if(Vo(t),r=t.memoizedState,r===null)return H(t),null;if(a=!!(t.flags&128),o=r.rendering,o===null){if(a)yl(r,!1);else{if(od!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=Ho(e),o!==null){for(t.flags|=128,yl(r,!1),e=o.updateQueue,t.updateQueue=e,vl(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)Li(n,e),n=n.sibling;return Bo(t,zo.current&1|2),z&&ea(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Ue()>_d&&(t.flags|=128,a=!0,yl(r,!1),t.lanes=4194304)}}else{if(!a){if(e=Ho(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,vl(t,e),yl(r,!0),r.tail===null&&r.tailMode!==`collapsed`&&r.tailMode!==`visible`&&!o.alternate&&!z)return H(t),null}else 2*Ue()-r.renderingStartTime>_d&&n!==536870912&&(t.flags|=128,a=!0,yl(r,!1),t.lanes=4194304)}r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}if(r.tail!==null){e=r.tail;a:{for(n=e;n!==null;){if(n.alternate!==null){n=!1;break a}n=n.sibling}n=!0}return r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Ue(),e.sibling=null,o=zo.current,o=a?o&1|2:o&1,r.tailMode===`visible`||r.tailMode===`collapsed`||!n||z?Bo(t,o):(n=o,F(Mo,t),F(zo,n),No===null&&(No=t)),z&&ea(t,r.treeForkCount),e}return H(t),null;case 22:case 23:return Ro(t),jo(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(H(t),t.subtreeFlags&6&&(t.flags|=8192)):H(t),n=t.updateQueue,n!==null&&vl(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&P(Ka),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),ba(Ma),H(t),null;case 25:return null;case 30:return t.flags|=33554432,H(t),null}throw Error(i(156,t.tag))}function xl(e,t){switch(ra(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ba(Ma),Oe(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Ae(t),null;case 31:if(t.memoizedState!==null){if(Ro(t),t.alternate===null)throw Error(i(340));pa()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Ro(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));pa()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Vo(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Oe(),null;case 10:return ba(t.type),null;case 22:case 23:return Ro(t),jo(),e!==null&&P(Ka),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ba(Ma),null;case 25:return null;default:return null}}function Sl(e,t){switch(ra(t),t.tag){case 3:ba(Ma),Oe();break;case 26:case 27:case 5:Ae(t);break;case 4:Oe();break;case 31:t.memoizedState!==null&&Ro(t);break;case 13:Ro(t);break;case 19:Vo(t);break;case 10:ba(t.type);break;case 22:case 23:Ro(t),jo(),e!==null&&P(Ka);break;case 24:ba(Ma)}}function Cl(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Z(t,t.return,e)}}function wl(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Z(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Z(t,t.return,e)}}function Tl(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Eo(t,n)}catch(t){Z(e,e.return,t)}}}function El(e,t,n){n.props=wc(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Z(e,t,n)}}function Dl(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:var i=e.stateNode,a=yi(e.memoizedProps,i);(i.ref===null||i.ref.name!==a)&&(i.ref=Pp(a)),r=i.ref;break;case 7:if(e.stateNode===null){var o=new Fp(e);h(e.child,!1,Qp,o,void 0,void 0),e.stateNode=o}r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Z(e,t,n)}}function Ol(e,t){var n=e.ref,r=e.refCleanup;if(n!==null){if(typeof r==`function`)try{r()}catch(n){Z(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Z(e,t,n)}else n.current=null}}function kl(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var n=0;n<t.length;n++)em(e.stateNode,t[n])}function Al(e){for(var t=e.return;t!==null&&(Nl(t)&&em(e.stateNode,t.stateNode),!Ml(t));)t=t.return}function jl(e){for(var t=e.return;t!==null&&(Nl(t)&&tm(e.stateNode,t.stateNode),!Ml(t));)t=t.return}function Ml(e){return e.tag===5||e.tag===3||e.tag===27}function Nl(e){return e&&e.tag===7&&e.stateNode!==null}function Pl(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Z(e,e.return,t)}}function Fl(e,t,n){try{var r=e.stateNode;ip(r,e.type,n,t),r[Tt]=t}catch(t){Z(e,e.return,t)}}function Il(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Sp(e.type)||e.tag===4}function Ll(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Il(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Sp(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Rl(e,t,n,r){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(i,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(i),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=bn)),kl(e,r),L=!0;else if(i!==4&&(i===27&&(kl(e,r),r=null,Sp(e.type)&&(n=e.stateNode,t=null)),e=e.child,e!==null))for(Rl(e,t,n,r),e=e.sibling;e!==null;)Rl(e,t,n,r),e=e.sibling}function zl(e,t,n,r){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?n.insertBefore(i,t):n.appendChild(i),kl(e,r),L=!0;else if(i!==4&&(i===27&&(kl(e,r),r=null,Sp(e.type)&&(n=e.stateNode)),e=e.child,e!==null))for(zl(e,t,n,r),e=e.sibling;e!==null;)zl(e,t,n,r),e=e.sibling}function Bl(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);np(t,r,n),t[wt]=e,t[Tt]=n}catch(t){Z(e,e.return,t)}}var Vl=!1,Hl=null;function Ul(e){(e.tag===30||e.subtreeFlags&33554432)&&(Vl=!0)}var Wl=null;function Gl(){var e=Wl;return Wl=null,e}var Kl=0;function ql(e,t,n,r,i){return Kl=0,Jl(e.child,t,n,r,i)}function Jl(e,t,n,r,i){for(var a=!1;e!==null;){if(e.tag===5){var o=e.stateNode;if(r!==null){var s=Op(o);r.push(s),s.view&&(a=!0)}else a||Op(o).view&&(a=!0);Vl=!0,Tp(o,Kl===0?t:t+`_`+Kl,n),Kl++}else e.tag===22&&e.memoizedState!==null||e.tag===30&&i||Jl(e.child,t,n,r,i)&&(a=!0);e=e.sibling}return a}function Yl(e,t){for(;e!==null;)e.tag===5?Ep(e.stateNode,e.memoizedProps):e.tag===22&&e.memoizedState!==null||e.tag===30&&t||Yl(e.child,t),e=e.sibling}function Xl(e){if(e.subtreeFlags&18874368)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Xl(e),e.tag===30&&e.flags&18874368&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name===`auto`)throw Error(i(544));var n=t.name;t=xi(t.default,t.share),t!==`none`&&(ql(e,n,t,null,!1)||Yl(e.child,!1))}e=e.sibling}}function Zl(e,t){if(e.tag===30){var n=e.stateNode,r=e.memoizedProps,i=yi(r,n),a=xi(r.default,n.paired?r.share:r.enter);a===`none`?Xl(e):ql(e,i,a,null,!1)?(Xl(e),n.paired||t||Nd(e,r.onEnter)):Yl(e.child,!1)}else if(e.subtreeFlags&33554432)for(e=e.child;e!==null;)Zl(e,t),e=e.sibling;else Xl(e)}function Ql(e){if(Hl!==null&&Hl.size!==0){var t=Hl;if(e.subtreeFlags&18874368)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&e.flags&18874368){var n=e.memoizedProps,r=n.name;if(r!=null&&r!==`auto`){var i=t.get(r);if(i!==void 0){var a=xi(n.default,n.share);if(a!==`none`&&(ql(e,r,a,null,!1)?(a=e.stateNode,i.paired=a,a.paired=i,Nd(e,n.onShare)):Yl(e.child,!1)),t.delete(r),t.size===0)break}}}Ql(e)}e=e.sibling}}}function $l(e){if(e.tag===30){var t=e.memoizedProps,n=yi(t,e.stateNode),r=Hl===null?void 0:Hl.get(n),i=xi(t.default,r===void 0?t.exit:t.share);i!==`none`&&(ql(e,n,i,null,!1)?r===void 0?Nd(e,t.onExit):(i=e.stateNode,r.paired=i,i.paired=r,Hl.delete(n),Nd(e,t.onShare)):Yl(e.child,!1)),Hl!==null&&Ql(e)}else if(e.subtreeFlags&33554432)for(e=e.child;e!==null;)$l(e),e=e.sibling;else Hl!==null&&Ql(e)}function eu(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,n=yi(t,e.stateNode);t=xi(t.default,t.update),e.flags&=-5,t!==`none`&&ql(e,n,t,e.memoizedState=[],!1)}else e.subtreeFlags&33554432&&eu(e);e=e.sibling}}function tu(e){if(e.subtreeFlags&18874368)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&e.flags&18874368){var t=e.stateNode;t.paired!==null&&(t.paired=null,Yl(e.child,!1))}tu(e)}e=e.sibling}}function nu(e){if(e.tag===30)e.stateNode.paired=null,Yl(e.child,!1),tu(e);else if(e.subtreeFlags&33554432)for(e=e.child;e!==null;)nu(e),e=e.sibling;else tu(e)}function ru(e){for(e=e.child;e!==null;)e.tag===30?Yl(e.child,!1):e.subtreeFlags&33554432&&ru(e),e=e.sibling}function iu(e,t,n,r,i,a,o){for(var s=!1;t!==null;){if(t.tag===5){var c=t.stateNode;if(a!==null&&Kl<a.length){var l=a[Kl],u=Op(c);(l.view||u.view)&&(s=!0);var d;if(d=!(e.flags&4)){if(u.clip)d=!0;else{d=l.rect;var f=u.rect;d=d.y!==f.y||d.x!==f.x||d.height!==f.height||d.width!==f.width}}d&&(e.flags|=4),u.abs?u=!l.abs:(l=l.rect,u=u.rect,u=l.height!==u.height||l.width!==u.width),u&&(e.flags|=32)}else e.flags|=32;e.flags&4&&Tp(c,Kl===0?n:n+`_`+Kl,i),s&&e.flags&4||(Wl===null&&(Wl=[]),Wl.push(c,Kl===0?r:r+`_`+Kl,t.memoizedProps)),Kl++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&o?e.flags|=t.flags&32:iu(e,t.child,n,r,i,a,o)&&(s=!0));t=t.sibling}return s}function au(e,t){for(e=e.child;e!==null;){if(e.tag===30){var n=e.memoizedProps,r=e.stateNode,i=yi(n,r),a=xi(n.default,n.update);if(t){r=r.clones;var o=r===null?null:r.map(kp)}else o=e.memoizedState,e.memoizedState=null;r=e;var s=e.child;Kl=0,i=iu(r,s,i,i,a,o,!1),e.flags&4&&i&&(t||Nd(e,n.onUpdate))}else e.subtreeFlags&33554432&&au(e,t);e=e.sibling}}var ou=!1,U=!1,su=!1,cu=!1,lu=typeof WeakSet==`function`?WeakSet:Set,uu=null,du=!1,fu=!1,pu=!1,mu=!1;function hu(e,t,n){if(e=e.containerInfo,sp=gh,e=Yr(e),Xr(e)){if(`selectionStart`in e)var r={start:e.selectionStart,end:e.selectionEnd};else a:{r=(r=e.ownerDocument)&&r.defaultView||window;var i=r.getSelection&&r.getSelection();if(i&&i.rangeCount!==0){r=i.anchorNode;var a=i.anchorOffset,o=i.focusNode;i=i.focusOffset;try{r.nodeType,o.nodeType}catch{r=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==r||a!==0&&f.nodeType!==3||(c=s+a),f!==o||i!==0&&f.nodeType!==3||(l=s+i),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===r&&++u===a&&(c=s),p===o&&++d===i&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}r=c===-1||l===-1?null:{start:c,end:l}}else r=null}r||={start:0,end:0}}else r=null;for(cp={focusedElem:e,selectionRange:r},gh=!1,n=(n&335544064)===n,uu=t,t=n?9270:1024;uu!==null;){if(e=uu,n&&(r=e.deletions,r!==null))for(a=0;a<r.length;a++)n&&$l(r[a]);if(e.alternate===null&&e.flags&2)n&&Ul(e),gu(n);else{if(e.tag===22){if(r=e.alternate,e.memoizedState!==null){r!==null&&r.memoizedState===null&&n&&$l(r),gu(n);continue}if(r!==null&&r.memoizedState!==null){n&&Ul(e),gu(n);continue}}r=e.child,(e.subtreeFlags&t)!==0&&r!==null?(r.return=e,uu=r):(n&&eu(e),gu(n))}}Hl=null}function gu(e){for(;uu!==null;){var t=uu,n=e,r=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if(a&1024&&r!==null){n=void 0,a=r.memoizedProps,r=r.memoizedState;var o=t.stateNode;try{var s=wc(t.type,a);n=o.getSnapshotBeforeUpdate(s,r),o.__reactInternalSnapshotBeforeUpdate=n}catch(e){Z(t,t.return,e)}}break;case 3:if(a&1024){if(r=t.stateNode.containerInfo,n=r.nodeType,n===9)nm(r);else if(n===1)switch(r.nodeName){case`HEAD`:case`HTML`:case`BODY`:nm(r);break;default:r.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:n&&r!==null&&(n=yi(r.memoizedProps,r.stateNode),a=t.memoizedProps,a=xi(a.default,a.update),a!==`none`&&ql(r,n,a,r.memoizedState=[],!0));break;default:if(a&1024)throw Error(i(163))}if(r=t.sibling,r!==null){r.return=t.return,uu=r;break}uu=t.return}}function _u(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:Iu(e,n),r&4&&Cl(5,n);break;case 1:if(Iu(e,n),r&4){if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Z(n,n.return,e)}else{var i=wc(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Z(n,n.return,e)}}}r&64&&Tl(n),r&512&&Dl(n,n.return);break;case 3:if(Iu(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Eo(e,t)}catch(e){Z(n,n.return,e)}}break;case 27:t===null&&r&4&&Bl(n);case 26:case 5:Iu(e,n),t===null&&r&4&&Pl(n),r&512&&Dl(n,n.return);break;case 12:Iu(e,n);break;case 31:Iu(e,n),r&4&&Tu(e,n);break;case 13:Iu(e,n),r&4&&Eu(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=_f.bind(null,n),cm(e,n))));break;case 22:if(r=n.memoizedState!==null||ou,!r){var a=t!==null&&t.memoizedState!==null||U;t=ou,i=U,ou=r,(U=a)&&!i?(r=2,n.subtreeFlags&8772&&(r|=1),Ru(e,n,r)):Iu(e,n),ou=t,U=i}break;case 30:Iu(e,n),r&512&&Dl(n,n.return);break;case 7:r&512&&Dl(n,n.return);default:Iu(e,n)}}function vu(e,t){for(e=e.child;e!==null;)yu(e,t),e=e.sibling}function yu(e,t){switch(e.tag){case 5:case 26:try{var n=e.stateNode;if(t){var r=n.style;typeof r.setProperty==`function`?r.setProperty(`display`,`none`,`important`):r.display=`none`}else{var i=e.stateNode,a=e.memoizedProps.style,o=a!=null&&a.hasOwnProperty(`display`)?a.display:null;i.style.display=o==null||typeof o==`boolean`?``:(``+o).trim()}}catch(t){Z(e,e.return,t)}bu(e,t);break;case 6:try{e.stateNode.nodeValue=t?``:e.memoizedProps,L=!0}catch(t){Z(e,e.return,t)}break;case 18:try{var s=e.stateNode;t?wp(s,!0):wp(e.stateNode,!1)}catch(t){Z(e,e.return,t)}break;case 22:case 23:e.memoizedState===null&&vu(e,t);break;default:vu(e,t)}}function bu(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){a:{var n=e,r=t;switch(n.tag){case 4:yu(n,r);break a;case 22:n.memoizedState===null&&bu(n,r);break a;default:bu(n,r)}}e=e.sibling}}function xu(e){var t=e.alternate;t!==null&&(e.alternate=null,xu(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Nt(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var W=null,Su=!1;function Cu(e,t,n){for(n=n.child;n!==null;)wu(e,t,n),n=n.sibling}function wu(e,t,n){if($e&&typeof $e.onCommitFiberUnmount==`function`)try{$e.onCommitFiberUnmount(Qe,n)}catch{}switch(n.tag){case 26:U||Ol(n,t),Cu(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&!U&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:U||Ol(n,t),jl(n);var r=W,i=Su;Sp(n.type)&&(W=n.stateNode,Su=!1),Cu(e,t,n),gm(n.stateNode,n.type,n.memoizedProps),W=r,Su=i;break;case 5:U||Ol(n,t),jl(n);case 6:if(n.tag===6&&jl(n),r=W,i=Su,W=null,Cu(e,t,n),W=r,Su=i,W!==null){if(Su)try{(W.nodeType===9?W.body:W.nodeName===`HTML`?W.ownerDocument.body:W).removeChild(n.stateNode),L=!0}catch(e){Z(n,t,e)}else try{W.removeChild(n.stateNode),L=!0}catch(e){Z(n,t,e)}}break;case 18:W!==null&&(Su?(e=W,Cp(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Hh(e)):Cp(W,n.stateNode));break;case 4:r=W,i=Su,W=n.stateNode.containerInfo,Su=!0,Cu(e,t,n),W=r,Su=i;break;case 0:case 11:case 14:case 15:wl(2,n,t),U||wl(4,n,t),Cu(e,t,n);break;case 1:U||(Ol(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&El(n,t,r)),Cu(e,t,n);break;case 21:Cu(e,t,n);break;case 22:U=(r=U)||n.memoizedState!==null,Cu(e,t,n),U=r;break;case 30:Ol(n,t),Cu(e,t,n);break;case 7:U||Ol(n,t),Cu(e,t,n);break;default:Cu(e,t,n)}}function Tu(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Hh(e)}catch(e){Z(t,t.return,e)}}}function Eu(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Hh(e)}catch(e){Z(t,t.return,e)}}function Du(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new lu),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new lu),t;default:throw Error(i(435,e.tag))}}function Ou(e,t){var n=Du(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=vf.bind(null,e,t);t.then(r,r)}})}function ku(e,t,n){var r=t.deletions;if(r!==null)for(var a=0;a<r.length;a++){var o=r[a],s=e,c=t,l=c;a:for(;l!==null;){switch(l.tag){case 27:if(Sp(l.type)){W=l.stateNode,Su=!1;break a}break;case 5:W=l.stateNode,Su=!1;break a;case 3:case 4:W=l.stateNode.containerInfo,Su=!0;break a}l=l.return}if(W===null)throw Error(i(160));wu(s,c,o),W=null,Su=!1,s=o.alternate,s!==null&&(s.return=null),o.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)ju(t,e,n),t=t.sibling}var Au=null;function ju(e,t,n){var r=e.alternate,a=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(a&4&&(r=e.updateQueue,r=r===null?null:r.events,r!==null))for(var o=0;o<r.length;o++){var s=r[o];s.ref.impl=s.nextImpl}ku(t,e,n),Mu(e),a&4&&(wl(3,e,e.return),Cl(3,e),wl(5,e,e.return));break;case 1:ku(t,e,n),Mu(e),a&512&&(U||r===null||Ol(r,r.return)),a&64&&ou&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?t:n.concat(t))));break;case 26:if(o=Au,ku(t,e,n),Mu(e),a&512&&(U||r===null||Ol(r,r.return)),a&4){if(a=r===null?null:r.memoizedState,n=e.memoizedState,r===null){if(n===null){if(e.stateNode===null){if(ou)e.stateNode=fp(e.type,e.memoizedProps,t.containerInfo,e);else{a:{t=e.type,n=e.memoizedProps,a=o.ownerDocument||o;b:switch(t){case`title`:r=a.getElementsByTagName(`title`)[0],(!r||r[jt]||r[wt]||r.namespaceURI===`http://www.w3.org/2000/svg`||r.hasAttribute(`itemprop`))&&(r=a.createElement(t),a.head.insertBefore(r,a.querySelector(`head > title`))),np(r,t,n),r[wt]=e,Rt(r),t=r;break a;case`link`:if(o=Gm(`link`,`href`,a).get(t+(n.href||``))){for(s=0;s<o.length;s++)if(r=o[s],r.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&r.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&r.getAttribute(`title`)===(n.title==null?null:n.title)&&r.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){o.splice(s,1);break b}}r=a.createElement(t),np(r,t,n),a.head.appendChild(r);break;case`meta`:if(o=Gm(`meta`,`content`,a).get(t+(n.content||``))){for(s=0;s<o.length;s++)if(r=o[s],r.getAttribute(`content`)===(n.content==null?null:``+n.content)&&r.getAttribute(`name`)===(n.name==null?null:n.name)&&r.getAttribute(`property`)===(n.property==null?null:n.property)&&r.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&r.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){o.splice(s,1);break b}}r=a.createElement(t),np(r,t,n),a.head.appendChild(r);break;default:throw Error(i(468,t))}r[wt]=e,Rt(r),t=r}e.stateNode=t}}else ou||Km(o,e.type,e.stateNode)}else e.stateNode=Bm(o,n,e.memoizedProps)}else a===n?n===null&&e.stateNode!==null&&Fl(e,e.memoizedProps,r.memoizedProps):(a===null?(t=r.stateNode,t===null||U||t.parentNode.removeChild(t)):a.count--,n===null?ou||Km(o,e.type,e.stateNode):Bm(o,n,e.memoizedProps))}break;case 27:ku(t,e,n),Mu(e),a&512&&(U||r===null||Ol(r,r.return)),r!==null&&a&4&&Fl(e,e.memoizedProps,r.memoizedProps);break;case 5:if(o=su,su=!1,ku(t,e,n),su=o,Mu(e),a&512&&(U||r===null||Ol(r,r.return)),e.flags&32){t=e.stateNode;try{fn(t,``),L=!0}catch(t){Z(e,e.return,t)}}a&4&&e.stateNode!=null&&(t=e.memoizedProps,Fl(e,t,r===null?t:r.memoizedProps)),a&1024&&(cu=!0);break;case 6:if(ku(t,e,n),Mu(e),a&4){if(e.stateNode===null)throw Error(i(162));t=e.memoizedProps,n=e.stateNode;try{n.nodeValue=t,L=!0}catch(t){Z(e,e.return,t)}}break;case 3:if(L=!1,Wm=null,o=Au,Au=bm(t.containerInfo),ku(t,e,n),Au=o,Mu(e),a&4&&r!==null&&r.memoizedState.isDehydrated)try{Hh(t.containerInfo)}catch(t){Z(e,e.return,t)}cu&&(cu=!1,Nu(e)),L=!1;break;case 4:a=su,su=ou,r=Jt(),o=Au,Au=bm(e.stateNode.containerInfo),ku(t,e,n),Mu(e),Au=o,L&&fu&&(pu=!0),L=r,su=a;break;case 12:ku(t,e,n),Mu(e);break;case 31:ku(t,e,n),Mu(e),a&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Ou(e,t)));break;case 13:ku(t,e,n),Mu(e),e.child.flags&8192&&e.memoizedState!==null!=(r!==null&&r.memoizedState!==null)&&(hd=Ue()),a&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Ou(e,t)));break;case 22:o=e.memoizedState!==null,s=r!==null&&r.memoizedState!==null;var c=ou,l=U,u=su;ou=c||o,su=u||o,U=l||s,ku(t,e,n),U=l,su=u,ou=c,Mu(e),a&8192&&(t=e.stateNode,t._visibility=o?t._visibility&-2:t._visibility|1,!o||r===null||s||ou||U||(t=s||U,n=ou,r=U,ou=o||ou,U=t,Lu(e,2),ou=n,U=r),!o&&su||vu(e,o)),a&4&&(t=e.updateQueue,t!==null&&(n=t.retryQueue,n!==null&&(t.retryQueue=null,Ou(e,n))));break;case 19:ku(t,e,n),Mu(e),a&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Ou(e,t)));break;case 30:a&512&&(U||r===null||Ol(r,r.return)),a=Jt(),o=fu,s=(n&335544064)===n,c=e.memoizedProps,fu=s&&xi(c.default,c.update)!==`none`,ku(t,e,n),Mu(e),s&&r!==null&&L&&(e.flags|=4),fu=o,L=a;break;case 21:break;case 7:a&512&&(U||r===null||Ol(r,r.return)),r&&r.stateNode!==null&&(r.stateNode._fragmentFiber=e);default:ku(t,e,n),Mu(e)}}function Mu(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Il(r)){n=r;break}r=r.return}r=null;for(var a=e.return;a!==null;){if(Nl(a)){var o=a.stateNode;r===null?r=[o]:r.push(o)}if(Ml(a))break;a=a.return}var s=r;if(n==null)throw Error(i(160));switch(n.tag){case 27:var c=n.stateNode;zl(e,Ll(e),c,s);break;case 5:var l=n.stateNode;n.flags&32&&(fn(l,``),n.flags&=-33),zl(e,Ll(e),l,s);break;case 3:case 4:var u=n.stateNode.containerInfo;Rl(e,Ll(e),u,s);break;default:throw Error(i(161))}}catch(t){Z(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Nu(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Nu(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,gh=!0,t.reset(),gh=!1),e=e.sibling}}function Pu(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Fu(t,e),t=t.sibling;else au(t,!1)}function Fu(e,t){var n=e.alternate;if(n===null)Zl(e,!1);else switch(e.tag){case 3:if(mu=du=!1,Gl(),Pu(t,e),!du&&!pu){if(e=Wl,e!==null)for(var r=0;r<e.length;r+=3){n=e[r];var i=e[r+1];Ep(n,e[r+2]),n=n.ownerDocument.documentElement,n!==null&&n.animate({opacity:[0,0],pointerEvents:[`none`,`none`]},{duration:0,fill:`forwards`,pseudoElement:`::view-transition-group(`+i+`)`})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===``&&(e.style.viewTransitionName=`none`,e.animate({opacity:[0,0],pointerEvents:[`none`,`none`]},{duration:0,fill:`forwards`,pseudoElement:`::view-transition-group(root)`}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:`forwards`,pseudoElement:`::view-transition`})),mu=!0}Wl=null;break;case 5:Pu(t,e);break;case 4:r=du,du=!1,Pu(t,e),du&&(pu=!0),du=r;break;case 22:e.memoizedState===null&&(n.memoizedState===null?Pu(t,e):Zl(e,!1));break;case 30:r=du,i=Gl(),du=!1,Pu(t,e),du&&(e.flags|=4);var a=e.memoizedProps,o=e.stateNode;t=yi(a,o),o=yi(n.memoizedProps,o);var s=xi(a.default,a.update);s===`none`?t=!1:(a=n.memoizedState,n.memoizedState=null,n=e.child,Kl=0,t=iu(e,n,t,o,s,a,!0),Kl!==(a===null?0:a.length)&&(e.flags|=32)),e.flags&4&&t?(Nd(e,e.memoizedProps.onUpdate),Wl=i):i!==null&&(i.push.apply(i,Wl),Wl=i),du=e.flags&32?!0:r;break;default:Pu(t,e)}}function Iu(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)_u(e,t.alternate,t),t=t.sibling}function Lu(e,t){for(e=e.child;e!==null;){var n=e,r=t;switch(n.tag){case 0:case 11:case 14:case 15:wl(4,n,n.return),Lu(n,r);break;case 1:Ol(n,n.return);var i=n.stateNode;typeof i.componentWillUnmount==`function`&&El(n,n.return,i),Lu(n,r);break;case 27:r&2&&gm(n.stateNode,n.type,n.memoizedProps);case 5:Ol(n,n.return),n.tag!==5&&n.tag!==27||jl(n),Lu(n,r);break;case 6:jl(n);break;case 26:Ol(n,n.return),i=n.stateNode,n.memoizedState!==null||i===null||U||i.parentNode.removeChild(i),Lu(n,r);break;case 22:n.memoizedState===null&&Lu(n,r);break;case 30:Ol(n,n.return),Lu(n,r);break;case 7:Ol(n,n.return);default:Lu(n,r)}e=e.sibling}}function Ru(e,t,n){for(n=t.subtreeFlags&8772?n:n&-2,t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags,s=!!(n&1);switch(a.tag){case 0:case 11:case 15:Ru(i,a,n),Cl(4,a);break;case 1:if(Ru(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Z(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var c=r.stateNode;try{var l=i.shared.hiddenCallbacks;if(l!==null)for(i.shared.hiddenCallbacks=null,i=0;i<l.length;i++)To(l[i],c)}catch(e){Z(r,r.return,e)}}s&&o&64&&Tl(a),Dl(a,a.return);break;case 27:n&2&&Bl(a);case 5:a.tag!==5&&a.tag!==27||Al(a),Ru(i,a,n),s&&r===null&&o&4&&Pl(a),Dl(a,a.return);break;case 6:Al(a);break;case 26:c=a.stateNode,a.memoizedState!==null||c===null||ou||Km(bm(c.ownerDocument),a.type,c),Ru(i,a,n),s&&r===null&&o&4&&Pl(a),Dl(a,a.return);break;case 12:Ru(i,a,n);break;case 31:Ru(i,a,n),s&&o&4&&Tu(i,a);break;case 13:Ru(i,a,n),s&&o&4&&Eu(i,a);break;case 22:a.memoizedState===null&&Ru(i,a,n),Dl(a,a.return);break;case 30:Ru(i,a,n),Dl(a,a.return);break;case 7:Dl(a,a.return);default:Ru(i,a,n)}t=t.sibling}}function zu(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Pa(n))}function Bu(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Pa(e))}function Vu(e,t,n,r){var i=(n&335544064)===n;if(t.subtreeFlags&(i?10262:10256))for(t=t.child;t!==null;)Hu(e,t,n,r),t=t.sibling;else i&&ru(t)}function Hu(e,t,n,r){var i=(n&335544064)===n;i&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&nu(t);var a=t.flags;switch(t.tag){case 0:case 11:case 15:Vu(e,t,n,r),a&2048&&Cl(9,t);break;case 1:Vu(e,t,n,r);break;case 3:Vu(e,t,n,r),i&&mu&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,e.style.viewTransitionName===`root`&&(e.style.viewTransitionName=``),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===`none`&&(e.style.viewTransitionName=``)),a&2048&&(a=null,t.alternate!==null&&(a=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==a&&(t.refCount++,a!=null&&Pa(a)));break;case 12:if(a&2048){Vu(e,t,n,r),a=t.stateNode;try{var o=t.memoizedProps,s=o.id,c=o.onPostCommit;typeof c==`function`&&c(s,t.alternate===null?`mount`:`update`,a.passiveEffectDuration,-0)}catch(e){Z(t,t.return,e)}}else Vu(e,t,n,r);break;case 31:Vu(e,t,n,r);break;case 13:Vu(e,t,n,r);break;case 23:break;case 22:o=t.stateNode,s=t.alternate,t.memoizedState===null?(i&&s!==null&&s.memoizedState!==null&&nu(t),o._visibility&2?Vu(e,t,n,r):(o._visibility|=2,Uu(e,t,n,r,!!(t.subtreeFlags&10256)||!1))):(i&&s!==null&&s.memoizedState===null&&nu(s),o._visibility&2?Vu(e,t,n,r):Wu(e,t)),a&2048&&zu(s,t);break;case 24:Vu(e,t,n,r),a&2048&&Bu(t.alternate,t);break;case 30:i&&(a=t.alternate,a!==null&&(Yl(a.child,!0),Yl(t.child,!0))),Vu(e,t,n,r);break;default:Vu(e,t,n,r)}}function Uu(e,t,n,r,i){for(i&&=!!(t.subtreeFlags&10256)||!1,t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Uu(a,o,s,c,i),Cl(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Uu(a,o,s,c,i)):u._visibility&2?Uu(a,o,s,c,i):Wu(a,o),i&&l&2048&&zu(o.alternate,o);break;case 24:Uu(a,o,s,c,i),i&&l&2048&&Bu(o.alternate,o);break;default:Uu(a,o,s,c,i)}t=t.sibling}}function Wu(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:Wu(n,r),i&2048&&zu(r.alternate,r);break;case 24:Wu(n,r),i&2048&&Bu(r.alternate,r);break;default:Wu(n,r)}t=t.sibling}}var Gu=8192;function Ku(e,t,n){if(e.subtreeFlags&Gu)for(e=e.child;e!==null;)qu(e,t,n),e=e.sibling}function qu(e,t,n){switch(e.tag){case 26:Ku(e,t,n),e.flags&Gu&&(e.memoizedState===null?(e=e.stateNode,(t&335544128)===t&&Zm(n,e)):Qm(n,Au,e.memoizedState,e.memoizedProps));break;case 5:Ku(e,t,n),e.flags&Gu&&(e=e.stateNode,(t&335544128)===t&&Zm(n,e));break;case 3:case 4:var r=Au;Au=bm(e.stateNode.containerInfo),Ku(e,t,n),Au=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=Gu,Gu=16777216,Ku(e,t,n),Gu=r):Ku(e,t,n));break;case 30:if((e.flags&Gu)!==0&&(r=e.memoizedProps.name,r!=null&&r!==`auto`)){var i=e.stateNode;i.paired=null,Hl===null&&(Hl=new Map),Hl.set(r,i)}Ku(e,t,n);break;default:Ku(e,t,n)}}function Ju(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Yu(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];uu=r,Qu(r,e)}Ju(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Xu(e),e=e.sibling}function Xu(e){switch(e.tag){case 0:case 11:case 15:Yu(e),e.flags&2048&&wl(9,e,e.return);break;case 3:Yu(e);break;case 12:Yu(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Zu(e)):Yu(e);break;default:Yu(e)}}function Zu(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];uu=r,Qu(r,e)}Ju(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:wl(8,t,t.return),Zu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Zu(t));break;default:Zu(t)}e=e.sibling}}function Qu(e,t){for(;uu!==null;){var n=uu;switch(n.tag){case 0:case 11:case 15:wl(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:Pa(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,uu=r;else a:for(n=e;uu!==null;){r=uu;var i=r.sibling,a=r.return;if(xu(r),r===n){uu=null;break a}if(i!==null){i.return=a,uu=i;break a}uu=a}}}var $u={getCacheForType:function(e){var t=Ea(Ma),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return Ea(Ma).controller.signal}},ed=typeof WeakMap==`function`?WeakMap:Map,G=0,K=null,q=null,J=0,Y=0,td=null,nd=!1,rd=!1,id=!1,ad=0,od=0,sd=0,cd=0,ld=0,ud=0,dd=0,fd=null,pd=null,md=!1,hd=0,gd=0,_d=1/0,vd=null,yd=null,X=0,bd=null,xd=null,Sd=0,Cd=0,wd=null,Td=null,Ed=null,Dd=null,Od=null,kd=0,Ad=null;function jd(){return G&2&&J!==0?J&-J:M.T===null?xt():Pf()}function Md(){if(ud===0){if(!(J&536870912)||z){var e=ot;ot<<=1,!(ot&3932160)&&(ot=262144),ud=e}else ud=536870912}return e=Mo.current,e!==null&&(e.flags|=32),ud}function Nd(e,t){if(t!=null){var n=e.stateNode,r=n.ref;r===null&&(r=n.ref=Pp(yi(e.memoizedProps,n))),Dd===null&&(Dd=[]),Dd.push(t.bind(null,r))}}function Pd(e,t,n){(e===K&&(Y===2||Y===9)||e.cancelPendingCommit!==null)&&(Vd(e,0),Rd(e,J,ud,!1)),mt(e,n),G&2&&e===K||(e===K&&(!(G&2)&&(cd|=n),od===4&&Rd(e,J,ud,!1)),Ef(e))}function Fd(e,t,n){if(G&6)throw Error(i(327));var r=!n&&!(t&127)&&(t&e.expiredLanes)===0||lt(e,t),a=r?Yd(e,t):qd(e,t,!0),o=r;do{if(a===0){rd&&!r&&Rd(e,t,0,!1);break}if(n=e.current.alternate,o&&!Ld(n))a=qd(e,t,!1),o=!1;else{if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;a=fd;var l=c.current.memoizedState.isDehydrated;if(l&&(Vd(c,s).flags|=256),s=qd(c,s,!1),s!==2&&s!==6){if(id&&!l){c.errorRecoveryDisabledLanes|=o,cd|=o,a=4;break a}o=pd,pd=a,o!==null&&(pd===null?pd=o:pd.push.apply(pd,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){Vd(e,0),Rd(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(i(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Rd(r,t,ud,!nd);break a;case 2:pd=null;break;case 3:case 5:break;default:throw Error(i(329))}if((t&62914560)===t&&(a=hd+300-Ue(),10<a)){if(Rd(r,t,ud,!nd),I(r,0,!0)!==0)break a;Sd=t,r.timeoutHandle=gp(Id.bind(null,r,n,pd,vd,md,t,ud,cd,dd,nd,o,`Throttled`,-0,0),a);break a}Id(r,n,pd,vd,md,t,ud,cd,dd,nd,o,null,-0,0)}break}}while(1);Ef(e)}function Id(e,t,n,r,i,a,o,s,c,l,u,d,f,p){e.timeoutHandle=-1;var m=t.subtreeFlags,h=(a&335544064)===a;d=null,(h||m&8192||(m&16785408)==16785408)&&(d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:bn},Hl=null,qu(t,a,d),h&&(m=d,h=e.containerInfo,h=(h.nodeType===9?h:h.ownerDocument).__reactViewTransition,h!=null&&(m.count++,m.waitingForViewTransition=!0,m=nh.bind(m),h.finished.then(m,m))),m=(a&62914560)===a?hd-Ue():(a&4194048)===a?gd-Ue():0,m=eh(d,m),m!==null)?(Sd=a,e.cancelPendingCommit=m(nf.bind(null,e,t,a,n,r,i,o,s,c,l,u,d,null,f,p)),Rd(e,a,o,!l)):nf(e,t,a,n,r,i,o,s,c,l,u,d)}function Ld(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!Ur(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Rd(e,t,n,r){t=ut(e,t),t&=~ld,t&=~cd,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-tt(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&gt(e,n,t)}function zd(){return G&6?!0:(Df(0,!1),!1)}function Bd(){if(q!==null){if(Y===0)var e=q.return;else e=q,va=_a=null,os(e),oo=null,so=0,e=q;for(;e!==null;)Sl(e.alternate,e),e=e.return;q=null}}function Vd(e,t){var n=e.timeoutHandle;return n!==-1&&(e.timeoutHandle=-1,_p(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),Sd=0,Bd(),K=e,q=n=Ii(e.current,null),J=t,Y=0,td=null,nd=!1,rd=lt(e,t),id=!1,dd=ud=ld=cd=sd=od=0,pd=fd=null,md=!1,ad=ut(e,t),Ei(),n}function Hd(e,t){B=null,M.H=gc,t===Xa||t===Qa?(t=io(),Y=3):t===Za?(t=io(),Y=4):Y=t===Pc?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,td=t,q===null&&(od=1,Oc(e,Wi(t,e.current)))}function Ud(){var e=Mo.current;return e===null?!0:(J&4194048)===J?No===null:(J&62914560)===J||J&536870912?e===No:!1}function Wd(){var e=M.H;return M.H=gc,e===null?gc:e}function Gd(){var e=M.A;return M.A=$u,e}function Kd(){od=4,nd||(J&4194048)!==J&&Mo.current!==null||(rd=!0),!(sd&134217727)&&!(cd&134217727)||K===null||Rd(K,J,ud,!1)}function qd(e,t,n){var r=G;G|=2;var i=Wd(),a=Gd();(K!==e||J!==t)&&(vd=null,Vd(e,t)),t=!1;var o=od;a:do try{if(Y!==0&&q!==null){var s=q,c=td;switch(Y){case 8:Bd(),o=6;break a;case 3:case 2:case 9:case 6:Mo.current===null&&(t=!0);var l=Y;if(Y=0,td=null,$d(e,s,c,l),n&&rd){o=0;break a}break;default:l=Y,Y=0,td=null,$d(e,s,c,l)}}Jd(),o=od;break}catch(t){Hd(e,t)}while(1);return t&&e.shellSuspendCounter++,va=_a=null,G=r,M.H=i,M.A=a,q===null&&(K=null,J=0,Ei()),o}function Jd(){for(;q!==null;)Zd(q)}function Yd(e,t){var n=G;G|=2;var r=Wd(),a=Gd();K!==e||J!==t?(vd=null,_d=Ue()+500,Vd(e,t)):rd=lt(e,t);a:do try{if(Y!==0&&q!==null){t=q;var o=td;b:switch(Y){case 1:Y=0,td=null,$d(e,t,o,1);break;case 2:case 9:if(eo(o)){Y=0,td=null,Qd(t);break}t=function(){Y!==2&&Y!==9||K!==e||(Y=7),Ef(e)},o.then(t,t);break a;case 3:Y=7;break a;case 4:Y=5;break a;case 7:eo(o)?(Y=0,td=null,Qd(t)):(Y=0,td=null,$d(e,t,o,7));break;case 5:var s=null;switch(q.tag){case 26:s=q.memoizedState;case 5:case 27:var c=q;if(s?Ym(s):c.stateNode.complete){Y=0,td=null;var l=c.sibling;if(l!==null)q=l;else{var u=c.return;u===null?q=null:(q=u,ef(u))}break b}}Y=0,td=null,$d(e,t,o,5);break;case 6:Y=0,td=null,$d(e,t,o,6);break;case 8:Bd(),od=6;break a;default:throw Error(i(462))}}Xd();break}catch(t){Hd(e,t)}while(1);return va=_a=null,M.H=r,M.A=a,G=n,q===null?(K=null,J=0,Ei(),od):0}function Xd(){for(;q!==null&&!Ve();)Zd(q)}function Zd(e){var t=ml(e.alternate,e,ad);e.memoizedProps=e.pendingProps,t===null?ef(e):q=t}function Qd(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Jc(n,t,t.pendingProps,t.type,void 0,J);break;case 11:t=Jc(n,t,t.pendingProps,t.type.render,t.ref,J);break;case 5:os(t);var r=t;r===aa&&(z?(da(r),r.tag===5&&r.stateNode!=null&&(R=r.stateNode)):(da(r),z=!0));default:Sl(n,t),t=q=Li(t,ad),t=ml(n,t,ad)}e.memoizedProps=e.pendingProps,t===null?ef(e):q=t}function $d(e,t,n,r){va=_a=null,os(t),oo=null,so=0;var i=t.return;try{if(Nc(e,i,t,n,J)){od=1,Oc(e,Wi(n,e.current)),q=null;return}}catch(t){if(i!==null)throw q=i,t;od=1,Oc(e,Wi(n,e.current)),q=null;return}t.flags&32768?(z||r===1?e=!0:rd||J&536870912?e=!1:(nd=e=!0,(r===2||r===9||r===3||r===6)&&(r=Mo.current,r!==null&&r.tag===13&&(r.flags|=16384))),tf(t,e)):ef(t)}function ef(e){var t=e;do{if(t.flags&32768){tf(t,nd);return}e=t.return;var n=bl(t.alternate,t,ad);if(n!==null){q=n;return}if(t=t.sibling,t!==null){q=t;return}q=t=e}while(t!==null);od===0&&(od=5)}function tf(e,t){do{var n=xl(e.alternate,e);if(n!==null){n.flags&=32767,q=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){q=e;return}q=e=n}while(e!==null);od=6,q=null}function nf(e,t,n,r,a,o,s,c,l,u,d,f){e.cancelPendingCommit=null;do df();while(X!==0);if(G&6)throw Error(i(327));if(t!==null){if(t===e.current)throw Error(i(177));e===K&&(q=K=null,J=0),xd=t,bd=e,Sd=n,wd=a,Td=r,rf(e,t,n,s,c,l,f)}}function rf(e,t,n,r,i,a,o){var s=t.lanes|t.childLanes;if(Cd=s,s|=Ti,ht(e,n,s,r,i,a),Dd=null,(n&335544064)===n?(Od=La(e),r=10262):(Od=null,r=10256),(t.subtreeFlags&r)!==0||(t.flags&r)!==0?(e.callbackNode=null,e.callbackPriority=0,yf(qe,function(){return ff(),null})):(e.callbackNode=null,e.callbackPriority=0),Vl=!1,r=!!(t.flags&13878),t.subtreeFlags&13878||r){r=M.T,M.T=null,i=N.p,N.p=2,a=G,G|=4;try{hu(e,t,n)}finally{G=a,N.p=i,M.T=r}}X=1,Vl?Ed=Mp(o,e.containerInfo,Od,sf,cf,of,lf,ff,af,null,null):(sf(),cf(),lf())}function af(e){if(X!==0){var t=bd.onRecoverableError;t(e,{componentStack:null})}}function of(){X===3&&(X=0,Fu(xd,bd),X=4)}function sf(){if(X===1){X=0;var e=bd,t=xd,n=Sd,r=!!(t.flags&13878);if(t.subtreeFlags&13878||r){r=M.T,M.T=null;var i=N.p;N.p=2;var a=G;G|=4;try{fu=pu=!1,ju(t,e,n),n=cp;var o=Yr(e.containerInfo),s=n.focusedElem,c=n.selectionRange;if(o!==s&&s&&s.ownerDocument&&Jr(s.ownerDocument.documentElement,s)){if(c!==null&&Xr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=qr(s,h),v=qr(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}gh=!!sp,cp=sp=null}finally{G=a,N.p=i,M.T=r}}e.current=t,X=2}}function cf(){if(X===2){X=0;var e=bd,t=xd,n=!!(t.flags&8772);if(t.subtreeFlags&8772||n){n=M.T,M.T=null;var r=N.p;N.p=2;var i=G;G|=4;try{_u(e,t.alternate,t)}finally{G=i,N.p=r,M.T=n}}X=3}}function lf(){if(X===4||X===3){X=0;var e=Ed;Ed=null,He();var t=bd,n=xd,r=Sd,i=Td,a=(r&335544064)===r?10262:10256;if((n.subtreeFlags&a)!==0||(n.flags&a)!==0?X=5:(X=0,xd=bd=null,uf(t,t.pendingLanes)),a=t.pendingLanes,a===0&&(yd=null),bt(r),n=n.stateNode,$e&&typeof $e.onCommitFiberRoot==`function`)try{$e.onCommitFiberRoot(Qe,n,void 0,(n.current.flags&128)==128)}catch{}if(i!==null){n=M.T,a=N.p,N.p=2,M.T=null;try{for(var o=t.onRecoverableError,s=0;s<i.length;s++){var c=i[s];o(c.value,{componentStack:c.stack})}}finally{M.T=n,N.p=a}}if(i=Dd,o=Od,Od=null,i!==null&&(Dd=null,o===null&&(o=[]),e!==null))for(c=0;c<i.length;c++)n=(0,i[c])(o),n!==void 0&&e.finished.finally(n);Sd&3&&df(),Ef(t),a=t.pendingLanes,r&261930&&a&42?t===Ad?kd++:(kd=0,Ad=t):(kd=0,Ad=null),Df(0,!1)}}function uf(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Pa(t)))}function df(){return Ed!==null&&(Ed.skipTransition(),Ed=null),sf(),cf(),lf(),ff()}function ff(){if(X!==5)return!1;var e=bd,t=Cd;Cd=0;var n=bt(Sd),r=M.T,a=N.p;try{N.p=32>n?32:n,M.T=null,n=wd,wd=null;var o=bd,s=Sd;if(X=0,xd=bd=null,Sd=0,G&6)throw Error(i(331));var c=G;if(G|=4,Xu(o.current),Hu(o,o.current,s,n),G=c,Df(0,!1),$e&&typeof $e.onPostCommitFiberRoot==`function`)try{$e.onPostCommitFiberRoot(Qe,o)}catch{}return!0}finally{N.p=a,M.T=r,uf(e,t)}}function pf(e,t,n){t=Wi(n,t),t=Ac(e.stateNode,t,2),e=yo(e,t,2),e!==null&&(mt(e,2),Ef(e))}function Z(e,t,n){if(e.tag===3)pf(e,e,n);else for(;t!==null;){if(t.tag===3){pf(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(yd===null||!yd.has(r))){e=Wi(n,e),n=jc(2),r=yo(t,n,2),r!==null&&(Mc(n,r,t,e),mt(r,2),Ef(r));break}}t=t.return}}function mf(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new ed;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(id=!0,i.add(n),e=hf.bind(null,e,t,n),t.then(e,e))}function hf(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,K===e&&(J&n)===n&&(od===4||od===3&&(J&62914560)===J&&300>Ue()-hd?G&2?ld|=n:Vd(e,0):ld|=n,dd===J&&(dd=0)),Ef(e)}function gf(e,t){t===0&&(t=ft()),e=ki(e,t),e!==null&&(mt(e,t),Ef(e))}function _f(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),gf(e,n)}function vf(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(i(314))}r!==null&&r.delete(t),gf(e,n)}function yf(e,t){return ze(e,t)}var bf=null,xf=null,Sf=!1,Cf=!1,wf=!1,Tf=0;function Ef(e){e!==xf&&e.next===null&&(xf===null?bf=xf=e:xf=xf.next=e),Cf=!0,Sf||(Sf=!0,Nf())}function Df(e,t){if(!wf&&Cf){wf=!0;do for(var n=!1,r=bf;r!==null;){if(!t){if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-tt(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,Mf(r,a))}else a=J,a=I(r,r===K?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||lt(r,a)||(n=!0,Mf(r,a))}r=r.next}while(n);wf=!1}}function Of(){kf()}function kf(){Cf=Sf=!1;var e=0;Tf!==0&&hp()&&(e=Tf);for(var t=Ue(),n=null,r=bf;r!==null;){var i=r.next,a=Af(r,t);a===0?(r.next=null,n===null?bf=i:n.next=i,i===null&&(xf=n)):(n=r,(e!==0||a&3)&&(Cf=!0)),r=i}X!==0&&X!==5||Df(e,!1),Tf!==0&&(Tf=0)}function Af(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-tt(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=dt(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=K,n=J,n=I(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(Y===2||Y===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&Be(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||lt(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&Be(r),bt(n)){case 2:case 8:n=Ke;break;case 32:n=qe;break;case 268435456:n=Ye;break;default:n=qe}return r=jf.bind(null,e),n=ze(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&Be(r),e.callbackPriority=2,e.callbackNode=null,2}function jf(e,t){if(X!==0&&X!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(df()&&e.callbackNode!==n)return null;var r=J;return r=I(e,e===K?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(Fd(e,r,t),Af(e,Ue()),e.callbackNode!=null&&e.callbackNode===n?jf.bind(null,e):null)}function Mf(e,t){if(df())return null;Fd(e,t,!0)}function Nf(){bp(function(){G&6?ze(Ge,Of):kf()})}function Pf(){if(Tf===0){var e=Ba;e===0&&(e=at,at<<=1,!(at&261888)&&(at=256)),Tf=e}return Tf}function Ff(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:yn(e)}function If(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=Ff((i[Tt]||null).action),o=r.submitter;o&&(t=(t=o[Tt]||null)?Ff(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new Vn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(Tf!==0){var e=new FormData(i,o);nc(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=new FormData(i,o),nc(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var Lf=0;Lf<gi.length;Lf++){var Rf=gi[Lf];_i(Rf.toLowerCase(),`on`+(Rf[0].toUpperCase()+Rf.slice(1)))}_i(ci,`onAnimationEnd`),_i(li,`onAnimationIteration`),_i(ui,`onAnimationStart`),_i(`dblclick`,`onDoubleClick`),_i(`focusin`,`onFocus`),_i(`focusout`,`onBlur`),_i(di,`onTransitionRun`),_i(fi,`onTransitionStart`),_i(pi,`onTransitionCancel`),_i(mi,`onTransitionEnd`),Ut(`onMouseEnter`,[`mouseout`,`mouseover`]),Ut(`onMouseLeave`,[`mouseout`,`mouseover`]),Ut(`onPointerEnter`,[`pointerout`,`pointerover`]),Ut(`onPointerLeave`,[`pointerout`,`pointerover`]),Ht(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),Ht(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),Ht(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),Ht(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),Ht(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),Ht(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var zf=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),Bf=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(zf));function Vf(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Si(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Si(e)}i.currentTarget=null,a=c}}}}function Q(e,t){var n=t[Dt];n===void 0&&(n=t[Dt]=new Set);var r=e+`__bubble`;n.has(r)||(Gf(t,e,2,!1),n.add(r))}function Hf(e,t,n){var r=0;t&&(r|=4),Gf(n,e,r,t)}var Uf=`_reactListening`+Math.random().toString(36).slice(2);function Wf(e){if(!e[Uf]){e[Uf]=!0,Bt.forEach(function(t){t!==`selectionchange`&&(Bf.has(t)||Hf(t,!1,e),Hf(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Uf]||(t[Uf]=!0,Hf(`selectionchange`,!1,t))}}function Gf(e,t,n,r){switch(Ch(t)){case 2:var i=_h;break;case 8:i=vh;break;default:i=yh}n=i.bind(null,t,n,e),i=void 0,!An||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function Kf(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===i)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===i)return;s=s.return}for(;c!==null;){if(s=Pt(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=a=s;continue a}c=c.parentNode}}r=r.return}Dn(function(){var r=a,i=Sn(n),s=[];a:{var c=hi.get(e);if(c!==void 0){var l=Vn,u=e;switch(e){case`keypress`:if(In(n)===0)break a;case`keydown`:case`keyup`:l=ar;break;case`focusin`:u=`focus`,l=Xn;break;case`focusout`:u=`blur`,l=Xn;break;case`beforeblur`:case`afterblur`:l=Xn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=Jn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Yn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=cr;break;case ci:case li:case ui:l=Zn;break;case mi:l=lr;break;case`scroll`:case`scrollend`:l=Un;break;case`wheel`:l=ur;break;case`copy`:case`cut`:case`paste`:l=Qn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=or;break;case`submit`:l=sr;break;case`toggle`:case`beforetoggle`:l=dr}var d=!!(t&4),f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=On(m,p),g!=null&&d.push(qf(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),s.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(l=e===`mouseover`||e===`pointerover`,c=e===`mouseout`||e===`pointerout`,l&&n!==xn&&(u=n.relatedTarget||n.fromElement)&&(Pt(u)||u[Et]))break a;(c||l)&&(u=i.window===i?i:(l=i.ownerDocument)?l.defaultView||l.parentWindow:window,c?(l=n.relatedTarget||n.toElement,c=r,l=l?Pt(l):null,l!==null&&(f=o(l),d=l.tag,l!==f||d!==5&&d!==27&&d!==6)&&(l=null)):(c=null,l=r),c!==l&&(d=Jn,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=or,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=c==null?u:It(c),h=l==null?u:It(l),u=new d(g,m+`leave`,c,n,i),u.target=f,u.relatedTarget=h,g=null,Pt(i)===r&&(d=new d(p,m+`enter`,l,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,d=c&&l?ee(c,l,Yf):null,c!==null&&Xf(s,u,c,d,!1),l!==null&&f!==null&&Xf(s,f,l,d,!0)))}a:{if(c=r?It(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var _=jr;else if(Tr(c)){if(Mr)_=Vr;else{_=zr;var v=Rr}}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&gn(r.elementType)&&(_=jr):_=Br;if(_&&=_(e,r)){Er(s,_,n,i);break a}v&&v(e,c,r)}switch(v=r?It(r):window,e){case`focusin`:(Tr(v)||v.contentEditable===`true`)&&(Qr=v,$r=r,ei=null);break;case`focusout`:ei=$r=Qr=null;break;case`mousedown`:ti=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:ti=!1,ni(s,n,i);break;case`selectionchange`:if(Zr)break;case`keydown`:case`keyup`:ni(s,n,i)}var y;if(pr)b:{switch(e){case`compositionstart`:var b=`onCompositionStart`;break b;case`compositionend`:b=`onCompositionEnd`;break b;case`compositionupdate`:b=`onCompositionUpdate`;break b}b=void 0}else xr?yr(e,n)&&(b=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(b=`onCompositionStart`);b&&(gr&&n.locale!==`ko`&&(xr||b!==`onCompositionStart`?b===`onCompositionEnd`&&xr&&(y=Fn()):(Mn=i,Nn=`value`in Mn?Mn.value:Mn.textContent,xr=!0)),v=Jf(r,b),0<v.length&&(b=new $n(b,e,null,n,i),s.push({event:b,listeners:v}),y?b.data=y:(y=br(n),y!==null&&(b.data=y)))),(y=hr?Sr(e,n):Cr(e,n))&&(b=Jf(r,`onBeforeInput`),0<b.length&&(v=new $n(`onBeforeInput`,`beforeinput`,null,n,i),s.push({event:v,listeners:b}),v.data=y)),If(s,e,r,n,i)}Vf(s,t)})}function qf(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Jf(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=On(e,n),i!=null&&r.unshift(qf(e,i,a)),i=On(e,t),i!=null&&r.push(qf(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Yf(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Xf(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=On(n,a),l!=null&&o.unshift(qf(n,l,c))):i||(l=On(n,a),l!=null&&o.push(qf(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var Zf=/\r\n?/g,Qf=/\u0000|\uFFFD/g;function $f(e){return(typeof e==`string`?e:``+e).replace(Zf,`
`).replace(Qf,``)}function ep(e,t){return t=$f(t),$f(e)===t}function $(e,t,n,r,a,o){switch(n){case`children`:if(typeof r==`string`)t===`body`||t===`textarea`&&r===``||fn(e,r);else if(typeof r==`number`||typeof r==`bigint`)t!==`body`&&fn(e,``+r);else return;break;case`className`:Xt(e,`class`,r);break;case`tabIndex`:Xt(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:Xt(e,n,r);break;case`style`:hn(e,r,o);return;case`data`:if(t!==`object`){Xt(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)||r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=yn(r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}if(typeof o==`function`&&(n===`formAction`?(t!==`input`&&$(e,t,`name`,a.name,a,null),$(e,t,`formEncType`,a.formEncType,a,null),$(e,t,`formMethod`,a.formMethod,a,null),$(e,t,`formTarget`,a.formTarget,a,null)):($(e,t,`encType`,a.encType,a,null),$(e,t,`method`,a.method,a,null),$(e,t,`target`,a.target,a,null))),r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=yn(r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=bn);return;case`onScroll`:r!=null&&Q(`scroll`,e);return;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);return;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));o?.__html!==n&&(e.innerHTML=n)}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=yn(r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`credentialless`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Q(`beforetoggle`,e),Q(`toggle`,e),Yt(e,`popover`,r);break;case`xlinkActuate`:Zt(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:Zt(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:Zt(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:Zt(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:Zt(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:Zt(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:Zt(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:Zt(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:Zt(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:Yt(e,`is`,r);break;case`innerText`:case`textContent`:return;default:if(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)n=_n.get(n)||n,Yt(e,n,r);else return}L=!0}function tp(e,t,n,r,a,o){switch(n){case`style`:hn(e,r,o);return;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));o?.__html!==n&&(e.innerHTML=n)}}break;case`children`:if(typeof r==`string`)fn(e,r);else if(typeof r==`number`||typeof r==`bigint`)fn(e,``+r);else return;break;case`onScroll`:r!=null&&Q(`scroll`,e);return;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);return;case`onClick`:r!=null&&(e.onclick=bn);return;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:return;case`innerText`:case`textContent`:return;default:if(!Vt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),o=n.slice(2,a?n.length-7:void 0),t=e[Tt]||null,t=t==null?null:t[n],typeof t==`function`&&e.removeEventListener(o,t,a),typeof r==`function`)){typeof t!=`function`&&t!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(o,r,a);break a}L=!0,n in e?e[n]=r:!0===r?e.setAttribute(n,``):Yt(e,n,r)}return}L=!0}function np(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Q(`error`,e),Q(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,o,s,n,null)}}a&&$(e,t,`srcSet`,n.srcSet,n,null),r&&$(e,t,`src`,n.src,n,null);return;case`input`:Q(`invalid`,e);var c=o=s=a=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:a=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(i(137,t));break;default:$(e,t,r,d,n,null)}}sn(e,o,c,l,u,s,a,!1);return;case`select`:for(a in Q(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:$(e,t,a,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&ln(e,!!r,n,!0):ln(e,!!r,t,!1);return;case`textarea`:for(s in Q(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:a=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(i(91));break;default:$(e,t,s,c,n,null)}dn(e,r,a,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:$(e,t,l,r,n,null)}return;case`dialog`:Q(`beforetoggle`,e),Q(`toggle`,e),Q(`cancel`,e),Q(`close`,e);break;case`iframe`:case`object`:Q(`load`,e);break;case`video`:case`audio`:for(r=0;r<zf.length;r++)Q(zf[r],e);break;case`image`:Q(`error`,e),Q(`load`,e);break;case`details`:Q(`toggle`,e);break;case`embed`:case`source`:case`link`:Q(`error`,e),Q(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,u,r,n,null)}return;default:if(gn(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&tp(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&$(e,t,c,r,n,null))}var rp={};function ip(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||$(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:m!==f&&(L=!0),o=m;break;case`name`:m!==f&&(L=!0),a=m;break;case`checked`:m!==f&&(L=!0),u=m;break;case`defaultChecked`:m!==f&&(L=!0),d=m;break;case`value`:m!==f&&(L=!0),s=m;break;case`defaultValue`:m!==f&&(L=!0),c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(i(137,t));break;default:m!==f&&$(e,t,p,m,r,f)}}on(e,s,c,l,u,d,o,a);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||$(e,t,o,null,r,l)}for(a in r)if(o=r[a],l=n[a],r.hasOwnProperty(a)&&(o!=null||l!=null))switch(a){case`value`:o!==l&&(L=!0),p=o;break;case`defaultValue`:o!==l&&(L=!0),c=o;break;case`multiple`:o!==l&&(L=!0),s=o;default:o!==l&&$(e,t,a,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?ln(e,!!n,n?[]:``,!1):ln(e,!!n,t,!0)):ln(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:$(e,t,c,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:a!==o&&(L=!0),p=a;break;case`defaultValue`:a!==o&&(L=!0),m=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(i(91));break;default:a!==o&&$(e,t,s,a,r,o)}un(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:$(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:p!==m&&(L=!0),e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:$(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&$(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(i(137,t));break;default:$(e,t,u,p,r,m)}return;default:if(gn(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&tp(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||tp(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&$(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||$(e,t,f,p,r,m)}function ap(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function op(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&ap(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&ap(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var sp=null,cp=null;function lp(e){return e.nodeType===9?e:e.ownerDocument}function up(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function dp(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function fp(e,t,n,r){return n=lp(n).createElement(e),n[wt]=r,n[Tt]=t,np(n,e,t),Rt(n),n}function pp(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var mp=null;function hp(){var e=window.event;return e&&e.type===`popstate`?e!==mp&&(mp=e,!0):(mp=null,!1)}var gp=typeof setTimeout==`function`?setTimeout:void 0,_p=typeof clearTimeout==`function`?clearTimeout:void 0,vp=typeof Promise==`function`?Promise:void 0,yp=typeof requestAnimationFrame==`function`?requestAnimationFrame:gp,bp=typeof queueMicrotask==`function`?queueMicrotask:vp===void 0?gp:function(e){return vp.resolve(null).then(e).catch(xp)};function xp(e){setTimeout(function(){throw e})}function Sp(e){return e===`head`}function Cp(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Hh(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)_m(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,_m(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[jt]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&_m(e.ownerDocument.body)}n=i}while(n);Hh(t)}function wp(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8){if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++}n=r}while(n)}function Tp(e,t,n){if(t=CSS.escape(t)===t?t:`r-`+btoa(t).replace(/=/g,``),e.style.viewTransitionName=t,n!=null&&(e.style.viewTransitionClass=n),n=getComputedStyle(e),n.display===`inline`){if(t=e.getClientRects(),t.length===1)var r=1;else for(var i=r=0;i<t.length;i++){var a=t[i];0<a.width&&0<a.height&&r++}r===1&&(e=e.style,e.display=t.length===1?`inline-block`:`block`,e.marginTop=`-`+n.paddingTop,e.marginBottom=`-`+n.paddingBottom)}}function Ep(e,t){e=e.style,t=t.style;var n=t==null?null:t.hasOwnProperty(`viewTransitionName`)?t.viewTransitionName:t.hasOwnProperty(`view-transition-name`)?t[`view-transition-name`]:null;e.viewTransitionName=n==null||typeof n==`boolean`?``:(``+n).trim(),n=t==null?null:t.hasOwnProperty(`viewTransitionClass`)?t.viewTransitionClass:t.hasOwnProperty(`view-transition-class`)?t[`view-transition-class`]:null,e.viewTransitionClass=n==null||typeof n==`boolean`?``:(``+n).trim(),e.display===`inline-block`&&(t==null?e.display=e.margin=``:(n=t.display,e.display=n==null||typeof n==`boolean`?``:n,n=t.margin,n==null?(n=t.hasOwnProperty(`marginTop`)?t.marginTop:t[`margin-top`],e.marginTop=n==null||typeof n==`boolean`?``:n,t=t.hasOwnProperty(`marginBottom`)?t.marginBottom:t[`margin-bottom`],e.marginBottom=t==null||typeof t==`boolean`?``:t):e.margin=n))}function Dp(e,t,n){return n=n.ownerDocument.defaultView,{rect:e,abs:t.position===`absolute`||t.position===`fixed`,clip:t.clipPath!==`none`||t.overflow!==`visible`||t.filter!==`none`||t.mask!==`none`||t.mask!==`none`||t.borderRadius!==`0px`,view:0<=e.bottom&&0<=e.right&&e.top<=n.innerHeight&&e.left<=n.innerWidth}}function Op(e){return Dp(e.getBoundingClientRect(),getComputedStyle(e),e)}function kp(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var n=getComputedStyle(e);return Dp(t,n,e)}function Ap(e){return e.documentElement.clientHeight}function jp(e){this.addEventListener(`load`,e),this.addEventListener(`error`,e)}function Mp(e,t,n,r,i,a,o,s,c){var l=t.nodeType===9?t:t.ownerDocument;try{var u=l.startViewTransition({update:function(){var t=l.defaultView,n=t.navigation&&t.navigation.transition,o=l.fonts.status;r();var s=[];if(o===`loaded`&&(Ap(l),l.fonts.status===`loading`&&s.push(l.fonts.ready)),o=s.length,e!==null)for(var c=e.suspenseyImages,u=0,d=0;d<c.length;d++){var f=c[d];if(!f.complete){var p=f.getBoundingClientRect();if(0<p.bottom&&0<p.right&&p.top<t.innerHeight&&p.left<t.innerWidth){if(u+=Xm(f),u>$m){s.length=o;break}f=new Promise(jp.bind(f)),s.push(f)}}}if(0<s.length)return t=Promise.race([Promise.all(s),new Promise(function(e){return setTimeout(e,500)})]).then(i,i),(n?Promise.allSettled([n.finished,t]):t).then(a,a);if(i(),n)return n.finished.then(a,a);a()},types:n});l.__reactViewTransition=u;var d=[];return u.ready.then(function(){for(var e=l.documentElement.getAnimations({subtree:!0}),t=0;t<e.length;t++){var n=e[t],r=n.effect,i=r.pseudoElement;if(i!=null&&i.startsWith(`::view-transition`)){d.push(n),n=r.getKeyframes();for(var a=i=void 0,s=!0,c=0;c<n.length;c++){var u=n[c],f=u.width;if(i===void 0)i=f;else if(i!==f){s=!1;break}if(f=u.height,a===void 0)a=f;else if(a!==f){s=!1;break}delete u.width,delete u.height,u.transform===`none`&&delete u.transform}s&&i!==void 0&&a!==void 0&&(r.setKeyframes(n),s=getComputedStyle(r.target,r.pseudoElement),s.width!==i||s.height!==a)&&(s=n[0],s.width=i,s.height=a,s=n[n.length-1],s.width=i,s.height=a,r.setKeyframes(n))}}o()},function(e){l.__reactViewTransition===u&&(l.__reactViewTransition=null);try{if(typeof e==`object`&&e)switch(e.name){case`InvalidStateError`:(e.message===`View transition was skipped because document visibility state is hidden.`||e.message===`Skipping view transition because document visibility state has become hidden.`||e.message===`Skipping view transition because viewport size changed.`||e.message===`Transition was aborted because of invalid state`)&&(e=null)}e!==null&&c(e)}finally{r(),i(),o()}}),u.finished.finally(function(){for(var e=0;e<d.length;e++)d[e].cancel();l.__reactViewTransition===u&&(l.__reactViewTransition=null),s()}),u}catch{return r(),i(),o(),null}}function Np(e,t){this._scope=document.documentElement,this._selector=`::view-transition-`+e+`(`+t+`)`}Np.prototype.animate=function(e,t){return t=typeof t==`number`?{duration:t}:E({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)},Np.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,n=e.getAnimations({subtree:!0}),r=[],i=0;i<n.length;i++){var a=n[i].effect;a!==null&&a.target===e&&a.pseudoElement===t&&r.push(n[i])}return r},Np.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Pp(e){return{name:e,group:new Np(`group`,e),imagePair:new Np(`image-pair`,e),old:new Np(`old`,e),new:new Np(`new`,e)}}function Fp(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Fp.prototype.addEventListener=function(e,t,n){var r=null,i=null;if(!(n!=null&&typeof n!=`boolean`&&(r=n.signal||null,r!==null&&r.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var a=this._eventListeners;if(Bp(a,e,t,n)===-1){var o=this,s=t;n!=null&&typeof n!=`boolean`&&!0===n.once&&(s=function(r){o.removeEventListener(e,t,n),typeof t==`function`?t.call(this,r):t.handleEvent(r)}),r!==null&&(i=o.removeEventListener.bind(o,e,t,n),r.addEventListener(`abort`,i,{once:!0}),i=r.removeEventListener.bind(r,`abort`,i)),r=Rp(n),a.push({type:e,listener:t,optionsOrUseCapture:n,attachedListener:s,cleanup:i}),h(this._fragmentFiber.child,!1,Ip,e,s,r)}this._eventListeners=a}};function Ip(e,t,n,r){return b(e).addEventListener(t,n,r),!1}Fp.prototype.removeEventListener=function(e,t,n){var r=this._eventListeners;if(r!==null&&(t=Bp(r,e,t,n),t!==-1)){var i=r[t];n=i.attachedListener;var a=i.cleanup;i=Rp(i.optionsOrUseCapture),h(this._fragmentFiber.child,!1,Lp,e,n,i),r.splice(t,1),a!==null&&a()}};function Lp(e,t,n,r){return b(e).removeEventListener(t,n,r),!1}function Rp(e){return e!=null&&typeof e!=`boolean`&&(!0===e.once||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function zp(e){return e==null?`c=0`:typeof e==`boolean`?`c=`+(e?`1`:`0`):`c=`+(e.capture?`1`:`0`)}function Bp(e,t,n,r){if(e.length===0)return-1;r=zp(r);for(var i=0;i<e.length;i++){var a=e[i];if(a.type===t&&a.listener===n&&zp(a.optionsOrUseCapture)===r)return i}return-1}Fp.prototype.dispatchEvent=function(e){var t=g(this._fragmentFiber);if(t===null)return!0;t=b(t);var n=this._eventListeners;if(n!==null&&0<n.length||!e.bubbles){var r=t.nodeType===9?t.createComment(``):document.createTextNode(``);if(n)for(var i=0;i<n.length;i++){var a=n[i];r.addEventListener(a.type,a.attachedListener,Rp(a.optionsOrUseCapture))}if(t.appendChild(r),e=r.dispatchEvent(e),n)for(i=0;i<n.length;i++)a=n[i],r.removeEventListener(a.type,a.attachedListener,Rp(a.optionsOrUseCapture));return t.removeChild(r),e}return t.dispatchEvent(e)},Fp.prototype.focus=function(e){h(this._fragmentFiber.child,!0,Vp,e,void 0,void 0)};function Vp(e,t){return e.tag!==6&&(e=b(e),pm(e,t))}Fp.prototype.focusLast=function(e){var t=[];h(this._fragmentFiber.child,!0,Hp,t,void 0,void 0);for(var n=t.length-1;0<=n&&!Vp(t[n],e);n--);};function Hp(e,t){return t.push(e),!1}Fp.prototype.blur=function(){var e=g(this._fragmentFiber);e!==null&&(e=b(e),e=lp(e).activeElement,e!==null&&h(this._fragmentFiber.child,!1,Up,e,void 0,void 0))};function Up(e,t){return e.tag!==6&&(e=b(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Fp.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),h(this._fragmentFiber.child,!1,Wp,e,void 0,void 0)};function Wp(e,t){return e.tag===6||(e=b(e),t.observe(e)),!1}Fp.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),h(this._fragmentFiber.child,!1,Gp,e,void 0,void 0);for(var n=t=0;n<Kp.length;n++){var r=Kp[n];r.fragmentInstance===this&&r.observer===e?e.unobserve(r.instance):Kp[t++]=r}Kp.length=t}};function Gp(e,t){return e.tag===6||(e=b(e),t.unobserve(e)),!1}var Kp=[],qp=!1;function Jp(e,t,n){Kp.push({fragmentInstance:e,observer:t,instance:n}),qp||(qp=!0,mm(function(){qp=!1;var e=Kp;Kp=[];for(var t=0;t<e.length;t++){var n=e[t];n.observer.unobserve(n.instance)}}))}Fp.prototype.getClientRects=function(){var e=[];return h(this._fragmentFiber.child,!1,Yp,e,void 0,void 0),e};function Yp(e,t){if(e.tag===6){e=e.stateNode;var n=e.ownerDocument.createRange();n.selectNodeContents(e),t.push.apply(t,n.getClientRects())}else e=b(e),t.push.apply(t,e.getClientRects());return!1}Fp.prototype.getRootNode=function(e){var t=g(this._fragmentFiber);return t===null?this:b(t).getRootNode(e)},Fp.prototype.compareDocumentPosition=function(e){var t=g(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var n=[];h(this._fragmentFiber.child,!1,Hp,n,void 0,void 0);var r=b(t);if(n.length===0){if(n=r,_(this._fragmentFiber)){a:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break a}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(n=t)}t=this._fragmentFiber;var i=r=n.compareDocumentPosition(e);return n===e?i=Node.DOCUMENT_POSITION_CONTAINS:r&Node.DOCUMENT_POSITION_CONTAINED_BY&&(n=v(t)[1],n===null?i=Node.DOCUMENT_POSITION_PRECEDING:(e=b(n).compareDocumentPosition(e),i=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),i|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=b(n[0]),i=b(n[n.length-1]);var a=_(this._fragmentFiber)?t.parentElement:r;if(a==null)return Node.DOCUMENT_POSITION_DISCONNECTED;r=a.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,a=a.compareDocumentPosition(i)&Node.DOCUMENT_POSITION_CONTAINED_BY;var o=t.compareDocumentPosition(e),s=i.compareDocumentPosition(e),c=o&Node.DOCUMENT_POSITION_CONTAINED_BY||s&Node.DOCUMENT_POSITION_CONTAINED_BY;return s=r&&a&&o&Node.DOCUMENT_POSITION_FOLLOWING&&s&Node.DOCUMENT_POSITION_PRECEDING,t=r&&t===e||a&&i===e||c||s?Node.DOCUMENT_POSITION_CONTAINED_BY:!r&&t===e||!a&&i===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:o,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||Xp(t,this._fragmentFiber,n[0],n[n.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function Xp(e,t,n,r,i){var a=Pt(i);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(n=!!a)a:{for(;a!==null;){if(a.tag===7&&(a===t||a.alternate===t)){n=!0;break a}a=a.return}n=!1}return n}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(a===null)return a=i.ownerDocument,i===a||i===a.documentElement||i===a.body;a:{for(a=t,t=g(t);a!==null;){if(!(a.tag!==5&&a.tag!==3&&a.tag!==27||a!==t&&a.alternate!==t)){a=!0;break a}a=a.return}a=!1}return a}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!a)&&!(t=a===n)&&(t=ee(n,a,T),t===null?t=!1:(h(t,!0,C,a,n),a=x,x=null,t=a!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!a)&&!(t=a===r)&&(t=ee(r,a,T),t===null?t=!1:(h(t,!0,w,a,r),a=x,S=x=null,t=a!==null)),t):!1}function Zp(e,t){var n=e.ownerDocument.createRange();n.selectNodeContents(e),e=n.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Fp.prototype.scrollIntoView=function(e){if(typeof e==`object`)throw Error(i(566));var t=[];h(this._fragmentFiber.child,!1,Hp,t,void 0,void 0);var n=!1!==e;if(t.length===0){var r=v(this._fragmentFiber);if(r=n?r[1]||r[0]||g(this._fragmentFiber):r[0]||r[1],r===null)return;if(r.tag===6){e=b(r),Zp(e,n);return}if(r=b(r),r.nodeType!==9){if(r.nodeType===11){n=`host`in r?r.host:null,n!==null&&n.scrollIntoView(e);return}r.scrollIntoView(e)}}for(r=n?t.length-1:0;r!==(n?-1:t.length);){var a=t[r];a.tag===6?(a=b(a),Zp(a,n)):b(a).scrollIntoView(e),r+=n?-1:1}};function Qp(e,t){return e=b(e),$p(e,t),!1}function $p(e,t){e.reactFragments??=new Set,e.reactFragments.add(t)}function em(e,t){var n=t._eventListeners;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];e.addEventListener(i.type,i.attachedListener,Rp(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(n){for(var r=0,i=0;i<Kp.length;i++){var a=Kp[i];(a.fragmentInstance!==t||a.observer!==n||a.instance!==e)&&(Kp[r++]=a)}Kp.length=r,n.observe(e)}),$p(e,t))}function tm(e,t){var n=t._eventListeners;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];e.removeEventListener(i.type,i.attachedListener,Rp(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(n){typeof n.rootMargin==`string`?Jp(t,n,e):n.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function nm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:nm(n),Nt(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function rm(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r){if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e}else if(!e[jt])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=lm(e.nextSibling),e===null)break}return null}function im(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=lm(e.nextSibling),e===null))return null;return e}function am(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=lm(e.nextSibling),e===null))return null;return e}function om(e){return e.data===`$?`||e.data===`$~`}function sm(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function cm(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function lm(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var um=null;function dm(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return lm(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function fm(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function pm(e,t){function n(){r=!0}if(e.ownerDocument.activeElement===e)return!0;var r=!1;try{e.ownerDocument.addEventListener(`focus`,n,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener(`focus`,n,!0)}return r}function mm(e){yp(function(){yp(function(t){return e(t)})})}function hm(e,t,n){switch(t=lp(n),e){case`html`:if(e=t.documentElement,!e)throw Error(i(452));return e;case`head`:if(e=t.head,!e)throw Error(i(453));return e;case`body`:if(e=t.body,!e)throw Error(i(454));return e;default:throw Error(i(451))}}function gm(e,t,n){for(var r in n){var i=n[r];n.hasOwnProperty(r)&&i!=null&&$(e,t,r,null,rp,i)}n.dangerouslySetInnerHTML!=null&&(e.textContent=``),e.onclick===bn&&(e.onclick=null),Nt(e)}function _m(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Nt(e)}var vm=new Map,ym=new Set;function bm(e){if(typeof e.getRootNode==`function`){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var xm=N.d;N.d={f:Sm,r:Cm,D:Em,C:Dm,L:Om,m:km,X:jm,S:Am,M:Mm};function Sm(){var e=xm.f(),t=zd();return e||t}function Cm(e){var t=Ft(e);t!==null&&t.tag===5&&t.type===`form`?ic(t):xm.r(e)}var wm=typeof document>`u`?null:document;function Tm(e,t,n){var r=wm;if(r&&typeof t==`string`&&t){var i=an(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),ym.has(i)||(ym.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),np(t,`link`,e),Rt(t),r.head.appendChild(t)))}}function Em(e){xm.D(e),Tm(`dns-prefetch`,e,null)}function Dm(e,t){xm.C(e,t),Tm(`preconnect`,e,t)}function Om(e,t,n){xm.L(e,t,n);var r=wm;if(r&&e&&t){var i=`link[rel="preload"][as="`+an(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+an(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+an(n.imageSizes)+`"]`)):i+=`[href="`+an(e)+`"]`;var a=i;switch(t){case`style`:a=Pm(e);break;case`script`:a=Rm(e)}if(!(vm.has(a)||(e=E({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),vm.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(Fm(a))||t===`script`&&r.querySelector(zm(a))))){var o=r.createElement(`link`);np(o,`link`,e),t===`style`&&(o[Mt]=!0,o.onload=o.onerror=function(){zt(o)}),Rt(o),r.head.appendChild(o)}}}function km(e,t){xm.m(e,t);var n=wm;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+an(r)+`"][href="`+an(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Rm(e)}if(!vm.has(a)&&(e=E({rel:`modulepreload`,href:e},t),vm.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(zm(a)))return}r=n.createElement(`link`),np(r,`link`,e),Rt(r),n.head.appendChild(r)}}}function Am(e,t,n){xm.S(e,t,n);var r=wm;if(r&&e){var i=Lt(r).hoistableStyles,a=Pm(e);t||=`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(Fm(a)))s.loading=5;else{e=E({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=vm.get(a))&&Hm(e,n);var c=o=r.createElement(`link`);Rt(c),np(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Vm(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function jm(e,t){xm.X(e,t);var n=wm;if(n&&e){var r=Lt(n).hoistableScripts,i=Rm(e),a=r.get(i);a||(a=n.querySelector(zm(i)),a||(e=E({src:e,async:!0},t),(t=vm.get(i))&&Um(e,t),a=n.createElement(`script`),Rt(a),np(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Mm(e,t){xm.M(e,t);var n=wm;if(n&&e){var r=Lt(n).hoistableScripts,i=Rm(e),a=r.get(i);a||(a=n.querySelector(zm(i)),a||(e=E({src:e,async:!0,type:`module`},t),(t=vm.get(i))&&Um(e,t),a=n.createElement(`script`),Rt(a),np(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Nm(e,t,n,r){var a=(a=Te.current)?bm(a):null;if(!a)throw Error(i(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(n=Pm(n.href),t=Lt(a).hoistableStyles,r=t.get(n),r||(r={type:`style`,instance:null,count:0,state:null},t.set(n,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Pm(n.href);var o=Lt(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(Fm(e)))?o._p||(s.instance=o,s.state.loading=5):(o=vm.get(e),o||(o={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},vm.set(e,o)),Lm(a,e,o,s.state))),t&&r===null)throw Error(i(528,``));return s}if(t&&r!==null)throw Error(i(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(n=Rm(n),t=Lt(a).hoistableScripts,r=t.get(n),r||(r={type:`script`,instance:null,count:0,state:null},t.set(n,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(i(444,e))}}function Pm(e){return`href="`+an(e)+`"`}function Fm(e){return`link[rel="stylesheet"][`+e+`]`}function Im(e){return E({},e,{"data-precedence":e.precedence,precedence:null})}function Lm(e,t,n,r){if(t=e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)){if(!0!==t[Mt]){r.loading=1;return}}else t=e.createElement(`link`),t[Mt]=!0,t.onload=t.onerror=zt.bind(null,t),np(t,`link`,n),Rt(t),e.head.appendChild(t);r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2})}function Rm(e){return`[src="`+an(e)+`"]`}function zm(e){return`script[async]`+e}function Bm(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+an(n.href)+`"]`);if(r)return t.instance=r,Rt(r),r;var a=E({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),Rt(r),np(r,`style`,a),Vm(r,n.precedence,e),t.instance=r;case`stylesheet`:a=Pm(n.href);var o=e.querySelector(Fm(a));if(o)return t.state.loading|=4,t.instance=o,Rt(o),o;r=Im(n),(a=vm.get(a))&&Hm(r,a),o=(e.ownerDocument||e).createElement(`link`),Rt(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),np(o,`link`,r),t.state.loading|=4,Vm(o,n.precedence,e),t.instance=o;case`script`:return o=Rm(n.src),(a=e.querySelector(zm(o)))?(t.instance=a,Rt(a),a):(r=n,(a=vm.get(o))&&(r=E({},n),Um(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),Rt(a),np(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(i(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Vm(r,n.precedence,e));return t.instance}function Vm(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Hm(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.title??=t.title}function Um(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.integrity??=t.integrity}var Wm=null;function Gm(e,t,n){if(Wm===null){var r=new Map,i=Wm=new Map;i.set(n,r)}else i=Wm,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[jt]||a[wt]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Km(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function qm(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Jm(e,t){return e===`img`&&t.src!=null&&t.src!==``&&t.onLoad==null&&t.loading!==`lazy`}function Ym(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Xm(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio==`number`?devicePixelRatio:1)*.25}function Zm(e,t){typeof t.decode==`function`&&(e.imgCount++,t.complete||(e.imgBytes+=Xm(t),e.suspenseyImages.push(t)),e=rh.bind(e),t.decode().then(e,e))}function Qm(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Pm(r.href),a=t.querySelector(Fm(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=nh.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,Rt(a);return}a=t.ownerDocument||t,r=Im(r),(i=vm.get(i))&&Hm(r,i),a=a.createElement(`link`),Rt(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),np(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=nh.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var $m=0;function eh(e,t){return e.stylesheets&&e.count===0&&ah(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&ah(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&$m===0&&($m=62500*op());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&ah(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>$m?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function th(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)ah(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function nh(){this.count--,th(this)}function rh(){this.imgCount--,th(this)}var ih=null;function ah(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,ih=new Map,t.forEach(oh,e),ih=null,nh.call(e))}function oh(e,t){if(!(t.state.loading&4)){var n=ih.get(e);if(n)var r=n.get(null);else{n=new Map,ih.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=nh.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var sh={$$typeof:O,Provider:null,Consumer:null,_currentValue:ye,_currentValue2:ye,_threadCount:0};function ch(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=pt(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=pt(0),this.hiddenUpdates=pt(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.transitionTypes=null,this.incompleteTransitions=new Map}function lh(e,t,n,r,i,a,o,s,c,l,u,d){return e=new ch(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=Pi(3,null,null,t),e.current=a,a.stateNode=e,t=Na(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},go(a),e}function uh(e){return e?(e=Mi,e):Mi}function dh(e,t,n,r,i,a){i=uh(i),r.context===null?r.context=i:r.pendingContext=i,r=vo(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=yo(e,r,t),n!==null&&(Pd(n,e,t),bo(n,e,t))}function fh(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ph(e,t){fh(e,t),(e=e.alternate)&&fh(e,t)}function mh(e){if(e.tag===13||e.tag===31){var t=ki(e,67108864);t!==null&&Pd(t,e,67108864),ph(e,67108864)}}function hh(e){if(e.tag===13||e.tag===31){var t=jd();t=yt(t);var n=ki(e,t);n!==null&&Pd(n,e,t),ph(e,t)}}var gh=!0;function _h(e,t,n,r){var i=M.T;M.T=null;var a=N.p;try{N.p=2,yh(e,t,n,r)}finally{N.p=a,M.T=i}}function vh(e,t,n,r){var i=M.T;M.T=null;var a=N.p;try{N.p=8,yh(e,t,n,r)}finally{N.p=a,M.T=i}}function yh(e,t,n,r){if(gh){var i=bh(r);if(i===null)Kf(e,t,r,xh,n),Mh(e,r);else if(Ph(i,e,t,n,r))r.stopPropagation();else if(Mh(e,r),t&4&&-1<jh.indexOf(e)){for(;i!==null;){var a=Ft(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=ct(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-tt(o);s.entanglements[1]|=c,o&=~c}Ef(a),!(G&6)&&(_d=Ue()+500,Df(0,!1))}}break;case 31:case 13:s=ki(a,2),s!==null&&Pd(s,a,2),zd(),ph(a,2)}if(a=bh(r),a===null&&Kf(e,t,r,xh,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else Kf(e,t,r,null,n)}}function bh(e){return e=Sn(e),Sh(e)}var xh=null;function Sh(e){if(xh=null,e=Pt(e),e!==null){var t=o(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=s(t),e!==null)return e;e=null}else if(n===31){if(e=c(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return xh=e,null}function Ch(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`fullscreenerror`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`resize`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(We()){case Ge:return 2;case Ke:return 8;case qe:case Je:return 32;case Ye:return 268435456;default:return 32}default:return 32}}var wh=!1,Th=null,Eh=null,Dh=null,Oh=new Map,kh=new Map,Ah=[],jh=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Mh(e,t){switch(e){case`focusin`:case`focusout`:Th=null;break;case`dragenter`:case`dragleave`:Eh=null;break;case`mouseover`:case`mouseout`:Dh=null;break;case`pointerover`:case`pointerout`:Oh.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:kh.delete(t.pointerId)}}function Nh(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=Ft(t),t!==null&&mh(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Ph(e,t,n,r,i){switch(t){case`focusin`:return Th=Nh(Th,e,t,n,r,i),!0;case`dragenter`:return Eh=Nh(Eh,e,t,n,r,i),!0;case`mouseover`:return Dh=Nh(Dh,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return Oh.set(a,Nh(Oh.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,kh.set(a,Nh(kh.get(a)||null,e,t,n,r,i)),!0}return!1}function Fh(e){var t=Pt(e.target);if(t!==null){var n=o(t);if(n!==null){if(t=n.tag,t===13){if(t=s(n),t!==null){e.blockedOn=t,St(e.priority,function(){hh(n)});return}}else if(t===31){if(t=c(n),t!==null){e.blockedOn=t,St(e.priority,function(){hh(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ih(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=bh(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);xn=r,n.target.dispatchEvent(r),xn=null}else return t=Ft(n),t!==null&&mh(t),e.blockedOn=n,!1;t.shift()}return!0}function Lh(e,t,n){Ih(e)&&n.delete(t)}function Rh(){wh=!1,Th!==null&&Ih(Th)&&(Th=null),Eh!==null&&Ih(Eh)&&(Eh=null),Dh!==null&&Ih(Dh)&&(Dh=null),Oh.forEach(Lh),kh.forEach(Lh)}function zh(e,n){e.blockedOn===n&&(e.blockedOn=null,wh||(wh=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,Rh)))}var Bh=null;function Vh(e){Bh!==e&&(Bh=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){Bh===e&&(Bh=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(Sh(r||n)===null)continue;break}var a=Ft(n);a!==null&&(e.splice(t,3),t-=3,nc(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Hh(e){function t(t){return zh(t,e)}Th!==null&&zh(Th,e),Eh!==null&&zh(Eh,e),Dh!==null&&zh(Dh,e),Oh.forEach(t),kh.forEach(t);for(var n=0;n<Ah.length;n++){var r=Ah[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<Ah.length&&(n=Ah[0],n.blockedOn===null);)Fh(n),n.blockedOn===null&&Ah.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[Tt]||null;if(typeof a==`function`)o||Vh(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[Tt]||null)s=o.formAction;else if(Sh(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Vh(n)}}}function Uh(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Wh(e){this._internalRoot=e}Gh.prototype.render=Wh.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));var n=t.current;dh(n,jd(),e,t,null,null)},Gh.prototype.unmount=Wh.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;dh(e.current,2,null,e,null,null),zd(),t[Et]=null}};function Gh(e){this._internalRoot=e}Gh.prototype.unstable_scheduleHydration=function(e){if(e){var t=xt();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Ah.length&&t!==0&&t<Ah[n].priority;n++);Ah.splice(n,0,e),n===0&&Fh(e)}};var Kh=n.version;if(Kh!==`19.3.1`)throw Error(i(527,Kh,`19.3.1`));N.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(i(188)):(e=Object.keys(e).join(`,`),Error(i(268,e)));return e=d(t),e=e===null?null:p(e),e=e===null?null:e.stateNode,e};var qh={bundleType:0,version:`19.3.1`,rendererPackageName:`react-dom`,currentDispatcherRef:M,reconcilerVersion:`19.3.1`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var Jh=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Jh.isDisabled&&Jh.supportsFiber)try{Qe=Jh.inject(qh),$e=Jh}catch{}}e.createRoot=function(e,t){if(!a(e))throw Error(i(299));var n=!1,r=``,o=Tc,s=Ec,c=Dc;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=lh(e,1,!1,null,null,n,r,null,o,s,c,Uh),e[Et]=t.current,Wf(e),new Wh(t)}})),g=o(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=h()})),_=e=>e.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase(),v=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),y=e=>{let t=v(e);return t.charAt(0).toUpperCase()+t.slice(1)},b=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),x=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0},S={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`},C=c(f()),w=(0,C.forwardRef)(({color:e=`currentColor`,size:t=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:i=``,children:a,iconNode:o,...s},c)=>(0,C.createElement)(`svg`,{ref:c,...S,width:t,height:t,stroke:e,strokeWidth:r?Number(n)*24/Number(t):n,className:b(`lucide`,i),...!a&&!x(s)&&{"aria-hidden":`true`},...s},[...o.map(([e,t])=>(0,C.createElement)(e,t)),...Array.isArray(a)?a:[a]])),T=(e,t)=>{let n=(0,C.forwardRef)(({className:n,...r},i)=>(0,C.createElement)(w,{ref:i,iconNode:t,className:b(`lucide-${_(y(e))}`,`lucide-${e}`,n),...r}));return n.displayName=y(e),n},ee=T(`activity`,[[`path`,{d:`M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2`,key:`169zse`}]]),E=T(`arrow-right`,[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]),te=T(`book-open`,[[`path`,{d:`M12 7v14`,key:`1akyts`}],[`path`,{d:`M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z`,key:`ruj8y`}]]),ne=T(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),re=T(`chevron-left`,[[`path`,{d:`m15 18-6-6 6-6`,key:`1wnfg3`}]]),D=T(`chevron-right`,[[`path`,{d:`m9 18 6-6-6-6`,key:`mthhwq`}]]),ie=T(`circle-alert`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`line`,{x1:`12`,x2:`12`,y1:`8`,y2:`12`,key:`1pkeuh`}],[`line`,{x1:`12`,x2:`12.01`,y1:`16`,y2:`16`,key:`4dfq90`}]]),ae=T(`circle-arrow-up`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m16 12-4-4-4 4`,key:`177agl`}],[`path`,{d:`M12 16V8`,key:`1sbj14`}]]),oe=T(`circle-check`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m9 12 2 2 4-4`,key:`dzmm74`}]]),O=T(`circle-play`,[[`path`,{d:`M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z`,key:`kmsa83`}],[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}]]),se=T(`clock`,[[`path`,{d:`M12 6v6l4 2`,key:`mmk7yg`}],[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}]]),ce=T(`code-xml`,[[`path`,{d:`m18 16 4-4-4-4`,key:`1inbqp`}],[`path`,{d:`m6 8-4 4 4 4`,key:`15zrgr`}],[`path`,{d:`m14.5 4-5 16`,key:`e7oirm`}]]),le=T(`copy`,[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]),k=T(`cpu`,[[`path`,{d:`M12 20v2`,key:`1lh1kg`}],[`path`,{d:`M12 2v2`,key:`tus03m`}],[`path`,{d:`M17 20v2`,key:`1rnc9c`}],[`path`,{d:`M17 2v2`,key:`11trls`}],[`path`,{d:`M2 12h2`,key:`1t8f8n`}],[`path`,{d:`M2 17h2`,key:`7oei6x`}],[`path`,{d:`M2 7h2`,key:`asdhe0`}],[`path`,{d:`M20 12h2`,key:`1q8mjw`}],[`path`,{d:`M20 17h2`,key:`1fpfkl`}],[`path`,{d:`M20 7h2`,key:`1o8tra`}],[`path`,{d:`M7 20v2`,key:`4gnj0m`}],[`path`,{d:`M7 2v2`,key:`1i4yhu`}],[`rect`,{x:`4`,y:`4`,width:`16`,height:`16`,rx:`2`,key:`1vbyd7`}],[`rect`,{x:`8`,y:`8`,width:`8`,height:`8`,rx:`1`,key:`z9xiuo`}]]),ue=T(`disc-3`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M6 12c0-1.7.7-3.2 1.8-4.2`,key:`oqkarx`}],[`circle`,{cx:`12`,cy:`12`,r:`2`,key:`1c9p78`}],[`path`,{d:`M18 12c0 1.7-.7 3.2-1.8 4.2`,key:`1eah9h`}]]),A=T(`download`,[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]),de=T(`external-link`,[[`path`,{d:`M15 3h6v6`,key:`1q9fwt`}],[`path`,{d:`M10 14 21 3`,key:`gplh6r`}],[`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`,key:`a6xqqp`}]]),j=T(`fast-forward`,[[`path`,{d:`M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z`,key:`b19h5q`}],[`path`,{d:`M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z`,key:`h7h5ge`}]]),fe=T(`file-audio`,[[`path`,{d:`M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3`,key:`rslqgf`}],[`path`,{d:`M14 2v4a2 2 0 0 0 2 2h4`,key:`tnqrlb`}],[`path`,{d:`M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0`,key:`9f7x3i`}]]),pe=T(`file-text`,[[`path`,{d:`M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z`,key:`1rqfz7`}],[`path`,{d:`M14 2v4a2 2 0 0 0 2 2h4`,key:`tnqrlb`}],[`path`,{d:`M10 9H8`,key:`b1mrlr`}],[`path`,{d:`M16 13H8`,key:`t4e002`}],[`path`,{d:`M16 17H8`,key:`z1uh3a`}]]),me=T(`film`,[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}],[`path`,{d:`M7 3v18`,key:`bbkbws`}],[`path`,{d:`M3 7.5h4`,key:`zfgn84`}],[`path`,{d:`M3 12h18`,key:`1i2n21`}],[`path`,{d:`M3 16.5h4`,key:`1230mu`}],[`path`,{d:`M17 3v18`,key:`in4fa5`}],[`path`,{d:`M17 7.5h4`,key:`myr1c1`}],[`path`,{d:`M17 16.5h4`,key:`go4c1d`}]]),he=T(`fingerprint`,[[`path`,{d:`M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4`,key:`1nerag`}],[`path`,{d:`M14 13.12c0 2.38 0 6.38-1 8.88`,key:`o46ks0`}],[`path`,{d:`M17.29 21.02c.12-.6.43-2.3.5-3.02`,key:`ptglia`}],[`path`,{d:`M2 12a10 10 0 0 1 18-6`,key:`ydlgp0`}],[`path`,{d:`M2 16h.01`,key:`1gqxmh`}],[`path`,{d:`M21.8 16c.2-2 .131-5.354 0-6`,key:`drycrb`}],[`path`,{d:`M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2`,key:`1tidbn`}],[`path`,{d:`M8.65 22c.21-.66.45-1.32.57-2`,key:`13wd9y`}],[`path`,{d:`M9 6.8a6 6 0 0 1 9 5.2v2`,key:`1fr1j5`}]]),ge=T(`folder-search`,[[`path`,{d:`M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1`,key:`1bw5m7`}],[`path`,{d:`m21 21-1.9-1.9`,key:`1g2n9r`}],[`circle`,{cx:`17`,cy:`17`,r:`3`,key:`18b49y`}]]),_e=T(`gauge`,[[`path`,{d:`m12 14 4-4`,key:`9kzdfg`}],[`path`,{d:`M3.34 19a10 10 0 1 1 17.32 0`,key:`19p75a`}]]),ve=T(`git-branch`,[[`line`,{x1:`6`,x2:`6`,y1:`3`,y2:`15`,key:`17qcm7`}],[`circle`,{cx:`18`,cy:`6`,r:`3`,key:`1h7g24`}],[`circle`,{cx:`6`,cy:`18`,r:`3`,key:`fqmcym`}],[`path`,{d:`M18 9a9 9 0 0 1-9 9`,key:`n2h4wq`}]]),M=T(`info`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M12 16v-4`,key:`1dtifu`}],[`path`,{d:`M12 8h.01`,key:`e9boi3`}]]),N=T(`languages`,[[`path`,{d:`m5 8 6 6`,key:`1wu5hv`}],[`path`,{d:`m4 14 6-6 2-3`,key:`1k1g8d`}],[`path`,{d:`M2 5h12`,key:`or177f`}],[`path`,{d:`M7 2h1`,key:`1t2jsx`}],[`path`,{d:`m22 22-5-10-5 10`,key:`don7ne`}],[`path`,{d:`M14 18h6`,key:`1m8k6r`}]]),ye=T(`laptop`,[[`path`,{d:`M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z`,key:`1pdavp`}],[`path`,{d:`M20.054 15.987H3.946`,key:`14rxg9`}]]),be=T(`layers`,[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,key:`zw3jo`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,key:`1wduqc`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,key:`kqbvx6`}]]),xe=T(`loader-circle`,[[`path`,{d:`M21 12a9 9 0 1 1-6.219-8.56`,key:`13zald`}]]),Se=T(`maximize-2`,[[`path`,{d:`M15 3h6v6`,key:`1q9fwt`}],[`path`,{d:`m21 3-7 7`,key:`1l2asr`}],[`path`,{d:`m3 21 7-7`,key:`tjx5ai`}],[`path`,{d:`M9 21H3v-6`,key:`wtvkvv`}]]),P=T(`music-2`,[[`circle`,{cx:`8`,cy:`18`,r:`4`,key:`1fc0mg`}],[`path`,{d:`M12 18V2l7 4`,key:`g04rme`}]]),F=T(`music`,[[`path`,{d:`M9 18V5l12-2v13`,key:`1jmyc2`}],[`circle`,{cx:`6`,cy:`18`,r:`3`,key:`fqmcym`}],[`circle`,{cx:`18`,cy:`16`,r:`3`,key:`1hluhg`}]]),Ce=T(`pause`,[[`rect`,{x:`14`,y:`3`,width:`5`,height:`18`,rx:`1`,key:`kaeet6`}],[`rect`,{x:`5`,y:`3`,width:`5`,height:`18`,rx:`1`,key:`1wsw3u`}]]),we=T(`play`,[[`path`,{d:`M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`,key:`10ikf1`}]]),Te=T(`plug-zap`,[[`path`,{d:`M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z`,key:`goz73y`}],[`path`,{d:`m2 22 3-3`,key:`19mgm9`}],[`path`,{d:`M7.5 13.5 10 11`,key:`7xgeeb`}],[`path`,{d:`M10.5 16.5 13 14`,key:`10btkg`}],[`path`,{d:`m18 3-4 4h6l-4 4`,key:`16psg9`}]]),Ee=T(`radio`,[[`path`,{d:`M16.247 7.761a6 6 0 0 1 0 8.478`,key:`1fwjs5`}],[`path`,{d:`M19.075 4.933a10 10 0 0 1 0 14.134`,key:`ehdyv1`}],[`path`,{d:`M4.925 19.067a10 10 0 0 1 0-14.134`,key:`1q22gi`}],[`path`,{d:`M7.753 16.239a6 6 0 0 1 0-8.478`,key:`r2q7qm`}],[`circle`,{cx:`12`,cy:`12`,r:`2`,key:`1c9p78`}]]),De=T(`refresh-cw`,[[`path`,{d:`M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`,key:`v9h5vc`}],[`path`,{d:`M21 3v5h-5`,key:`1q7to0`}],[`path`,{d:`M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`,key:`3uifl3`}],[`path`,{d:`M8 16H3v5`,key:`1cv678`}]]),Oe=T(`repeat`,[[`path`,{d:`m17 2 4 4-4 4`,key:`nntrym`}],[`path`,{d:`M3 11v-1a4 4 0 0 1 4-4h14`,key:`84bu3i`}],[`path`,{d:`m7 22-4-4 4-4`,key:`1wqhfi`}],[`path`,{d:`M21 13v1a4 4 0 0 1-4 4H3`,key:`1rx37r`}]]),ke=T(`rewind`,[[`path`,{d:`M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z`,key:`2a1g8i`}],[`path`,{d:`M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z`,key:`rg3s36`}]]),Ae=T(`rotate-ccw`,[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]),je=T(`search`,[[`path`,{d:`m21 21-4.34-4.34`,key:`14j7rj`}],[`circle`,{cx:`11`,cy:`11`,r:`8`,key:`4ej97u`}]]),Me=T(`settings`,[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`,key:`1i5ecw`}],[`circle`,{cx:`12`,cy:`12`,r:`3`,key:`1v7zrd`}]]),Ne=T(`shield-alert`,[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,key:`oel41y`}],[`path`,{d:`M12 8v4`,key:`1got3b`}],[`path`,{d:`M12 16h.01`,key:`1drbdi`}]]),Pe=T(`sliders-horizontal`,[[`path`,{d:`M10 5H3`,key:`1qgfaw`}],[`path`,{d:`M12 19H3`,key:`yhmn1j`}],[`path`,{d:`M14 3v4`,key:`1sua03`}],[`path`,{d:`M16 17v4`,key:`1q0r14`}],[`path`,{d:`M21 12h-9`,key:`1o4lsq`}],[`path`,{d:`M21 19h-5`,key:`1rlt1p`}],[`path`,{d:`M21 5h-7`,key:`1oszz2`}],[`path`,{d:`M8 10v4`,key:`tgpxqk`}],[`path`,{d:`M8 12H3`,key:`a7s4jb`}]]),Fe=T(`sparkles`,[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,key:`1s2grr`}],[`path`,{d:`M20 2v4`,key:`1rf3ol`}],[`path`,{d:`M22 4h-4`,key:`gwowj6`}],[`circle`,{cx:`4`,cy:`20`,r:`2`,key:`6kqj1y`}]]),Ie=T(`table`,[[`path`,{d:`M12 3v18`,key:`108xh3`}],[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}],[`path`,{d:`M3 9h18`,key:`1pudct`}],[`path`,{d:`M3 15h18`,key:`5xshup`}]]),Le=T(`terminal`,[[`path`,{d:`M12 19h8`,key:`baeox8`}],[`path`,{d:`m4 17 6-6-6-6`,key:`1yngyt`}]]),Re=T(`trending-up`,[[`path`,{d:`M16 7h6v6`,key:`box55l`}],[`path`,{d:`m22 7-8.5 8.5-5-5L2 17`,key:`1t1m79`}]]),ze=T(`triangle-alert`,[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`,key:`wmoenq`}],[`path`,{d:`M12 9v4`,key:`juzpu7`}],[`path`,{d:`M12 17h.01`,key:`p32p05`}]]),Be=T(`upload`,[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]),Ve=T(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),He=T(`volume-x`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`line`,{x1:`22`,x2:`16`,y1:`9`,y2:`15`,key:`1ewh16`}],[`line`,{x1:`16`,x2:`22`,y1:`9`,y2:`15`,key:`5ykzw1`}]]),Ue=T(`x`,[[`path`,{d:`M18 6 6 18`,key:`1bl5f8`}],[`path`,{d:`m6 6 12 12`,key:`d8bk6v`}]]),We=T(`zap`,[[`path`,{d:`M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z`,key:`1xq2db`}]]),Ge=T(`zoom-in`,[[`circle`,{cx:`11`,cy:`11`,r:`8`,key:`4ej97u`}],[`line`,{x1:`21`,x2:`16.65`,y1:`21`,y2:`16.65`,key:`13gj7c`}],[`line`,{x1:`11`,x2:`11`,y1:`8`,y2:`14`,key:`1vmskp`}],[`line`,{x1:`8`,x2:`14`,y1:`11`,y2:`11`,key:`durymu`}]]),Ke=T(`zoom-out`,[[`circle`,{cx:`11`,cy:`11`,r:`8`,key:`4ej97u`}],[`line`,{x1:`21`,x2:`16.65`,y1:`21`,y2:`16.65`,key:`13gj7c`}],[`line`,{x1:`8`,x2:`14`,y1:`11`,y2:`11`,key:`durymu`}]]),qe=g(),Je=class extends Error{constructor(e,t={}){super(e),this.key=e,this.params=t}};async function Ye(e,t=`audio.mp3`,n,r={}){let i=r.model===`md_beat_this`?`md_beat_this`:`beat_this`,a=i===`md_beat_this`?`Masked Diffusion md_beat_this`:`CPJKU beat_this`,o;try{if(r.audioBuffer)o=r.audioBuffer;else{n?.(5,`web.progress.load`);let t=await e.arrayBuffer();n?.(15,`web.progress.decode`),o=await new(window.AudioContext||window.webkitAudioContext)().decodeAudioData(t.slice(0))}}catch(e){throw console.error(`AudioContext decode error:`,e),new Je(`web.error.decode`,{file:t})}let s=o.duration,c=o.sampleRate,l=o.numberOfChannels;n?.(30,`web.progress.waveform`);let u=Qe(o,2400),d=null,f=null;try{if((await fetch(`/api/health`,{signal:AbortSignal.timeout(3e3)})).ok){n?.(40,`web.progress.connect`,{model:a});let o=new FormData;o.append(`audio`,e,t),n?.(65,`web.progress.inference`,{model:a});let s=new URLSearchParams;r.smoothBars===!1&&s.set(`smoothBars`,`0`),r.protect!==void 0&&s.set(`protect`,String(r.protect)),i!==`beat_this`&&s.set(`model`,i);let c=s.toString()?`/api/analyze?${s}`:`/api/analyze`,l=await fetch(c,{method:`POST`,body:o});if(l.ok){let e=await l.json(),t=e.waveformPeaks,n=Array.isArray(t)?new Float32Array(t):u;d={...e,selectedModel:e.selectedModel??i,waveformPeaks:n.length>0?n:u}}else f=new Je(`web.error.server_failed`,{message:(await l.json().catch(()=>null))?.error||`HTTP ${l.status}`})}else if(r.requireServer)throw new Je(`web.error.no_server`)}catch(e){if(r.requireServer)throw e}if(f)throw f;if(d)return n?.(100,`web.progress.done_model`,{model:a}),{result:d,audioBuffer:o};n?.(45,`web.progress.browser_flux`);let p=Ze(o);n?.(60,`web.progress.browser_activation`);let{baf:m,daf:h,frameRate:g,hopSize:_}=$e(p,c,s);n?.(75,`web.progress.browser_tempo`);let v=nt(m,g);n?.(85,`web.progress.browser_tracking`);let{beats:y,downbeats:b,timeSig:x,swingRatio:S}=rt(m,h,g,s,v);n?.(95,`web.progress.browser_stats`);let C=y.map(e=>e.instantBpm).filter(e=>e>30&&e<300),w=C.length>0?C.reduce((e,t)=>e+t,0)/C.length:v,T=[...C].sort((e,t)=>e-t),ee=T.length>0?T[Math.floor(T.length/2)]:v,E=T.length>0?T[0]:v,te=T.length>0?T[T.length-1]:v,ne=Math.sqrt(C.reduce((e,t)=>e+(t-w)**2,0)/(C.length||1)),re=Math.max(0,Math.min(100,Math.round(100-ne/(w||1)*100))),D=it(m,g,1e3),ie=Xe(t,e.type),ae={fileName:t,fileSize:e.size,duration:s,sampleRate:c,channels:l,format:ie},oe=b.length,O=y.length;return n?.(100,`web.progress.done`),{result:{engine:i===`md_beat_this`?`Browser MIR (Fallback, md_beat_this)`:`Browser MIR (Fallback)`,engineInfo:{id:`librosa`,device:null,gpu:null,fallbackReason:`not_installed`},selectedModel:i,metadata:ae,beats:y,downbeats:b,globalBpm:Math.round(v*10)/10,averageBpm:Math.round(w*10)/10,medianBpm:Math.round(ee*10)/10,minBpm:Math.round(E*10)/10,maxBpm:Math.round(te*10)/10,tempoStability:re,timeSignature:x,swingRatio:Math.round(S*10)/10,totalBeats:O,totalBars:oe,activationCurve:D,activationSource:`onset`,waveformPeaks:u,waveformDuration:s},audioBuffer:o}}function Xe(e,t){let n=e.split(`.`).pop()?.toUpperCase();return n&&[`MP3`,`WAV`,`FLAC`,`AAC`,`M4A`,`OGG`,`WEBM`].includes(n)?n===`M4A`?`AAC (M4A)`:n:t.includes(`flac`)?`FLAC`:t.includes(`wav`)?`WAV`:t.includes(`mp3`)||t.includes(`mpeg`)?`MP3`:t.includes(`aac`)||t.includes(`mp4`)?`AAC`:t.includes(`ogg`)?`OGG`:`AUDIO`}function Ze(e){let t=e.numberOfChannels,n=e.length,r=new Float32Array(n);if(t===1)return r.set(e.getChannelData(0)),r;for(let i=0;i<t;i++){let a=e.getChannelData(i);for(let e=0;e<n;e++)r[e]+=a[e]/t}return r}function Qe(e,t){let n=e.numberOfChannels,r=e.length,i=Math.max(1,Math.floor(r/t)),a=new Float32Array(t*2),o=[];for(let t=0;t<n;t++)o.push(e.getChannelData(t));for(let e=0;e<t;e++){let t=e*i,s=Math.min(t+i,r),c=0,l=0;for(let e=t;e<s;e+=4){let t=0;for(let r=0;r<n;r++)t+=o[r][e]/n;t<c&&(c=t),t>l&&(l=t)}a[e*2]=c,a[e*2+1]=l}return a}function $e(e,t,n){let r=Math.floor(t/100),i=Math.floor(e.length/r),a=t/r,o=new Float32Array(i),s=new Float32Array(i),c=0,l=0,u=0,d=Math.exp(-2*Math.PI*180/t),f=Math.exp(-2*Math.PI*2500/t),p=0,m=0;for(let t=0;t<i;t++){let n=t*r,i=Math.min(n+2048,e.length),a=0,h=0,g=0;for(let t=n;t<i;t+=2){let n=e[t];p=d*p+(1-d)*n;let r=p;m=f*m+(1-f)*(n-r);let i=m,o=n-r-i;a+=r*r,h+=i*i,g+=o*o}let _=Math.max(0,a-c),v=Math.max(0,h-l),y=Math.max(0,g-u);c=a*.95,l=h*.95,u=g*.95;let b=_*1.4+v*1.8+y*.8,x=_*2.2+v*.6;o[t]=b,s[t]=x}return et(o),et(s),tt(o,a,.08),tt(s,a,.12),{baf:o,daf:s,frameRate:a,hopSize:r}}function et(e){let t=1e-6;for(let n=0;n<e.length;n++)e[n]>t&&(t=e[n]);for(let n=0;n<e.length;n++)e[n]=e[n]/t}function tt(e,t,n){let r=Math.max(1,Math.floor(n*t/2)),i=new Float32Array(e.length);for(let t=0;t<e.length;t++){let n=0,a=0,o=Math.max(0,t-r),s=Math.min(e.length,t+r+1);for(let t=o;t<s;t++)n+=e[t],a++;let c=n/a,l=e[t]-c;i[t]=l>0?l**1.4:0}et(i);for(let t=0;t<e.length;t++)e[t]=1/(1+Math.exp(-8*(i[t]-.28)));et(e)}function nt(e,t){let n=Math.floor(60/210*t),r=Math.floor(60/55*t),i=r-n+1,a=new Float32Array(i),o=Math.min(e.length,Math.floor(t*60));for(let t=n;t<=r;t++){let r=0,i=0;for(let n=0;n<o-t;n+=2)r+=e[n]*e[n+t],i++;a[t-n]=r/(i||1)}let s=n,c=-1;for(let e=1;e<a.length-1;e++)a[e]>a[e-1]&&a[e]>a[e+1]&&a[e]>c&&(c=a[e],s=n+e);let l=60*t/s;if(l<70){let e=Math.round(s/2);if(e>=n&&e<=r&&a[e-n]>c*.65)return l*2}else if(l>155){let e=Math.round(s*2);if(e<=r&&a[e-n]>c*.75)return l/2}return l}function rt(e,t,n,r,i){let a=60*n/i,o=Math.floor(a*.65),s=Math.floor(a*1.35),c=[],l=0,u=Math.min(e.length,Math.floor(n*2)),d=.2,f=Math.floor(a*.5);for(let t=5;t<u;t++)e[t]>d&&e[t]>e[t-1]&&e[t]>e[t+1]&&(d=e[t],f=t);for(c.push(f),l=f;l+o<e.length;){let t=Math.min(e.length-1,l+o),n=Math.min(e.length-1,l+s),r=l+Math.round(a),i=-1e3;for(let o=t;o<=n;o++){let t=e[o]-(Math.abs(o-(l+a))/(a*.4))**2*.4;t>i&&(i=t,r=o)}r<=l&&(r=l+Math.round(a)),c.push(r),l=r}let p=0,m=0,h=0;for(let e=0;e<c.length;e++){let n=t[c[e]]||0;if(e+3<c.length){let r=t[c[e+3]]||0;p+=n*r}if(e+4<c.length){let r=t[c[e+4]]||0;m+=n*r}if(e+2<c.length){let r=t[c[e+2]]||0;h+=n*r}}let g=Math.max(1,c.length);p/=g,m/=g,h/=g;let _=p>m*1.15?3:4,v=0,y=-1;for(let n=0;n<_;n++){let r=0;for(let i=n;i<c.length;i+=_){let n=c[i];r+=t[n]*1.5+e[n]*.5}r>y&&(y=r,v=n)}let b=[],x=[],S=1,C=[];for(let e=0;e<c.length;e++){let t=c[e],r=Math.round(t/n*1e3)/1e3,a=((e-v)%_+_)%_+1,o=a===1,s=i,l=0;if(e>0){let t=r-b[e-1].time;l=Math.round(t*1e3),t>.15&&t<2&&(s=Math.round(60/t*10)/10)}o&&e>0&&S++;let u={id:e+1,time:r,beatInBar:a,barIndex:S,isDownbeat:o,confidence:null,instantBpm:s,deltaMs:l};if(b.push(u),o&&x.push(u),e>=2&&e%2==0){let t=b[e-1].time-b[e-2].time,n=t+(r-b[e-1].time);if(n>.4&&n<1.8){let e=t/n*100;e>=45&&e<=75&&C.push(e)}}}let w=C.length>5?C.reduce((e,t)=>e+t,0)/C.length:50;return{beats:b,downbeats:x,timeSig:{numerator:_,denominator:4,name:`${_}/4`,barShare:null},swingRatio:w}}function it(e,t,n){let r=Math.max(1,Math.floor(e.length/n)),i=[];for(let n=0;n<e.length;n+=r){let r=Math.round(n/t*1e3)/1e3;i.push({time:r,beatActivation:Math.round(e[n]*100)/100,downbeatActivation:null})}return i}var at={_meta:{name:`Deutsch`,decimal:`,`,percent:`{v} %`,html_lang:`de`},output:{marker_downbeat:`Takt {bar}`,marker_note:`{time} s | {bpm} BPM`,kind_downbeat:`Downbeat (1)`,kind_beat:`Beat {beat}`,bar_beat:`Takt {bar} – Beat {beat}`,time_bpm:`{clock} – {bpm} BPM`,confidence:`Confidence {value}`,intro:[`BeatAnalyzer`,`{file}`,`{bpm} BPM – {meter}`],meter:`{num}/{den}{suffix}`,meter_suffix:{2:``,4:``,8:``,16:``},model_line:`Model: {name} – Nutzung im Rahmen der {license}-Lizenz`},plugin:{msg_not_json:`Die Datei ist keine Marker-JSON von BeatAnalyzer.`,msg_bad_format:`Unbekanntes Format „{format}“, erwartet „{expected}“. Die Datei in BeatAnalyzer unter Exportieren → DaVinci Resolve exportieren.`,msg_no_markers:`Die JSON enthält keine Marker.`,msg_cannot_read:`Datei nicht lesbar: {path}`,msg_no_project:`Kein Projekt offen.`,msg_no_clip:`Kein Clip gefunden. Den Audio-Clip im Media Pool auswählen oder „{file}“ in den Media Pool importieren.`,msg_markers:`{n} Marker auf {clips} Clip(s): {names}`,msg_skipped:`{n} Marker übersprungen (außerhalb des Clips oder von Resolve abgelehnt).`,msg_other_file:`Hinweis: Der ausgewählte Clip ist nicht „{file}“ aus der JSON.`,msg_srt_ok:`Subtitle: {srt} im Ordner {bin} im Media Pool`,msg_srt_write:`Subtitle: {path} lässt sich nicht schreiben`,msg_srt_import:`Subtitle: {why} – {path} von Hand importieren`,msg_bin_missing:`Ordner {bin} im Media Pool nicht verfügbar`,msg_not_imported:`Resolve hat {path} nicht importiert`,msg_tl_empty:`Timeline: Im Teil des Songs, der in der Timeline liegt, gibt es keine Beats.`,msg_tl_write:`Timeline: {path} lässt sich nicht schreiben`,msg_tl_import:`Timeline: {why}`,msg_tl_add:`Timeline: Subtitle Track lässt sich nicht anlegen.`,msg_tl_activate:`Timeline: Der neue Subtitle Track lässt sich nicht aktivieren.`,msg_tl_none_placed:`Timeline: Resolve hat keine Subtitles platziert.`,msg_tl_ok:`Timeline: {n} Subtitles auf Track ST{track} „{name}“{replaced}`,msg_tl_replaced:` (alter Track ersetzt)`,msg_tl_count:`Timeline: {placed} Subtitles platziert, die SRT hat {count}.`,msg_tl_offset:`Timeline: Erster Subtitle bei Frame {actual}, erwartet {expected} (Unterschied {diff} Frames). Bitte resolve/tools/probe_timeline.lua ausführen und die Ausgabe der Console schicken.`,clip_found:`{names} im Media Pool · {length}`,warn_other_file:`Der ausgewählte Clip ist nicht „{file}“ aus der JSON.`,warn_length:`Die Laufzeit des Clips ({clip}) weicht von der analysierten Datei ({json}) ab.`,engine:`Analysiert mit {engine}`,reason_not_installed:`beat_this nicht installiert`,reason_model_load_failed:`Modell von beat_this nicht geladen`,reason_inference_failed:`Analyse mit beat_this gescheitert`,explain_present:`In der Timeline „{timeline}“ liegt der Song auf A{track} ab {tc}. Darunter entsteht der Subtitle Track „{track_name}“ und wird aktiv. Resolve erlaubt nur einen aktiven Subtitle Track; die anderen bleiben, werden aber deaktiviert.`,explain_absent:`Der Song liegt nicht in der Timeline „{timeline}“. Es entsteht nur der Subtitle im Media Pool.`,explain_no_timeline:`Keine Timeline offen. Es entsteht nur der Subtitle im Media Pool.`,explain_off:`Die Timeline bleibt unverändert. Der Subtitle mit allen Beats liegt im Ordner BeatAnalyzer im Media Pool und kann von dort in jede Timeline gezogen werden.`,btn_remove:`BeatAnalyzer-Marker entfernen`,remove_confirm:`Aus „{song}“ entfernen: {markers} BeatAnalyzer-Marker, {tracks} Subtitle Track(s) in der offenen Timeline, {srt} Subtitle-Clip(s) im Ordner BeatAnalyzer? Von Hand gesetzte Marker bleiben.`,remove_done:`Entfernt: {markers} Marker, {tracks} Subtitle Track(s), {srt} Subtitle-Clip(s).`,remove_nothing:`Nichts von BeatAnalyzer an „{song}“ gefunden.`,btn_remove_yes:`Entfernen`,title:`BeatAnalyzer {version}`,json_none:`Keine JSON gewählt.`,btn_choose:`Auswählen …`,choose_title:`BeatAnalyzer – Marker-JSON wählen`,check_timeline:`Subtitle Track in der Timeline anlegen`,check_colors:`Markerfarben anpassen`,color_downbeat:`Downbeat`,color_beat:`Beat {n}`,color_other:`übrige`,color_none:`kein Marker`,work_title:`Was jetzt passiert:`,step_markers:`Marker auf den Clip „{clip}“ im Media Pool`,step_markers_hint:`Resolve setzt jeden Marker einzeln, das dauert etwas.`,step_bin:`Ordner BeatAnalyzer im Media Pool, Subtitle „{srt}“`,step_track:`Subtitle Track „{track}“ in „{timeline}“`,wait:`Bitte warten – das Fenster schließt sich erst am Ende.`,btn_close:`Schließen`,btn_ok:`OK`,btn_analyze:`Analysieren`,btn_apply:`Marker setzen`,btn_cancel:`Abbrechen`,msg_no_work_dir:`Subtitle: Im Ordner {path} lässt sich kein Arbeitsordner anlegen`,msg_tl_vehicle_left:`Timeline: Der Clip „{clip}“ ließ sich nicht aus dem Media Pool entfernen – bitte von Hand löschen.`,engine_unknown:`Analyse-Programm: in der JSON nicht angegeben (ältere JSON oder im Browser analysiert)`,reason_analyzer_failed:`Analyzer ließ sich nicht laden`,msg_job_folder:`Der Arbeitsordner für die Analyse in resolve_temp lässt sich nicht anlegen.`,msg_no_python:`Python von BeatAnalyzer nicht gefunden. In der Web-App „In Resolve installieren“ klicken oder BeatAnalyzer neu installieren.`,msg_no_start:`Python ist nicht gestartet ({python}). BeatAnalyzer neu installieren oder in der Web-App „In Resolve installieren“ klicken.`,msg_tl_markers:`Timeline „{timeline}“: {n} Marker auf {items} Clip(s) des Songs.`,explain_tl_markers:`Die Clips des Songs in dieser Timeline ({items}) bekommen die Marker ebenfalls.`,way_analyze:`Ausgewählten Clip analysieren`,way_json:`JSON laden`,sec_source:`1. Quelle & Analyse-Modell`,sec_output:`2. Ausgabe in Resolve`,smooth_label:`Glätten`,smooth_off:`aus`,smooth_tip:`0 % = aus: Takte wie von beat_this.
Mehr % = gleichmäßigeres Raster.
100 % = voll geglättet; neu angesetzt nur bei klar anderer „1“.
Die Beats bleiben unverändert.`,analyze_none:`Im Media Pool genau einen Audio-Clip auswählen.`,analyze_many:`Mehrere Clips ausgewählt – bitte genau einen Audio-Clip auswählen.`,analyze_no_path:`Der ausgewählte Eintrag hat keine Datei (z. B. Timeline oder Compound Clip).`,step_analysis:`Analyse von „{clip}“`,step_model:`Modell laden`,step_analyze:`Analysieren`,step_write:`Ergebnis schreiben`,step_analysis_hint:`Abbrechen geht nur jetzt. Bis hier ist im Projekt nichts verändert.`,msg_cancelled:`Analyse abgebrochen. Im Projekt wurde nichts verändert.`,msg_analysis_error:`Analyse fehlgeschlagen: {message}. Im Projekt wurde nichts verändert.`,msg_timeout:`Die Analyse ist nach 10 Minuten nicht fertig und wurde abgebrochen. Im Projekt wurde nichts verändert.`,tasks_title:`Tasks`,task_analyze:`Track wird analysiert`,task_markers:`Marker werden gesetzt`,task_subtitle:`Subtitle wird angelegt`,task_track:`Subtitle Track in der Timeline`,wait_short:`Bitte warten …`,cancel_hint:`Abbrechen geht nur während der Analyse.`,explain_short_present:`Subtitle Track kommt unter den Song ({tracks}).`,explain_short_absent:`Song nicht in der Timeline „{timeline}“ – nur Subtitle im Media Pool.`,explain_short_no_timeline:`Keine Timeline offen – nur Subtitle im Media Pool.`,explain_short_off:`Timeline bleibt unverändert, Subtitle im Ordner BeatAnalyzer.`,explain_short_tl_markers:`Marker auch auf den Clips in der Timeline ({items}).`,explain_present_many:`In der Timeline „{timeline}“ liegt der Song auf {tracks}. Für jede dieser Spuren entsteht ein eigener Subtitle Track, z. B. „{track_name}“. Resolve erlaubt nur einen aktiven Subtitle Track; die anderen bleiben, werden aber deaktiviert.`,model_tip:`beat_this (CPJKU, MIT): Standard, auch für kommerzielle Arbeiten.
md_beat_this (Masked Diffusion, CC BY-NC 4.0): nur nicht-kommerzielle Nutzung; wird separat installiert (siehe README).`,model_beat_this:`beat_this (MIT)
Standard · auch kommerziell`,model_md:`md_beat_this (CC BY-NC 4.0)
Nur nicht-kommerziell`,md_notice:`md_beat_this steht unter der Lizenz CC BY-NC 4.0 und darf nur für nicht-kommerzielle Zwecke genutzt werden, im Rahmen der CC-BY-NC-4.0-Lizenz: {url}`,md_confirm:`Ich nutze md_beat_this nur für nicht-kommerzielle Zwecke (CC BY-NC 4.0)`,md_confirm_needed:`Für md_beat_this das Lizenz-Häkchen setzen.`,reason_md_not_installed:`md_beat_this nicht installiert`,warn_mp3:`MP3: Resolve spielt MP3-Dateien etwa 50 ms später ab, als BeatAnalyzer sie analysiert. Diese JSON enthält keinen Ausgleich (ältere JSON oder im Browser analysiert): Die Marker liegen so viel vor dem Beat. Mit dem Server neu analysieren oder den Song als WAV oder FLAC verwenden.`,note_mp3:`MP3: Resolve spielt MP3-Dateien etwa 50 ms später ab; BeatAnalyzer setzt die Marker entsprechend später.`,msg_mp3_shift:`MP3: Marker um {ms} ms nach hinten gesetzt (so viel später spielt Resolve MP3 ab).`,note_mp3_json:`MP3: Die Marker werden {ms} ms später gesetzt (so viel später spielt Resolve MP3-Dateien ab).`},web:JSON.parse(`{"app":{"footer_formats":"Unterstützt MP3, WAV, AAC/M4A, FLAC & OGG","footer_inspired":"Inspiriert von","md_active":"Analyse mit md_beat_this – nur für nicht-kommerzielle Nutzung (CC BY-NC 4.0).","md_fallback":"Ersatz aktiv ({engine}) – md_beat_this nur für nicht-kommerzielle Zwecke (CC BY-NC 4.0).","setup":"Einrichtung"},"common":{"cancel":"Abbrechen","close":"Schließen","ok":"Verstanden"},"engine":{"browser_result":"Browser-Analyse (Ersatz) – kein Server","browser_tip":"Ohne lokalen Server rechnet der Browser grob nach.","librosa":"librosa (Ersatz)","librosa_tip":"librosa erkennt keine Downbeats: jeder 4. Beat gilt als „1“.","licence":"{name}: Lizenz {license}","licence_nc":"{name}: Lizenz {license} – nur nicht-kommerziell","no_server":"kein Server – Browser-Analyse","no_server_tip":"Ohne lokalen Server rechnet der Browser grob nach (start.bat starten).","reason_analyzer_failed":"Analyzer nicht geladen","reason_inference_failed":"Analyse gescheitert","reason_model_load_failed":"Modell nicht geladen","reason_not_installed":"{model} nicht installiert"},"error":{"decode":"Die Audiodatei „{file}“ lässt sich im Browser nicht dekodieren. Unterstützt werden MP3, WAV, AAC/M4A, FLAC und OGG.","no_server":"Der lokale Server antwortet nicht.","server_failed":"Analyse im lokalen Server fehlgeschlagen: {message}","unexpected":"Ein unerwarteter Fehler ist aufgetreten."},"export":{"attribution_required":"CC BY-NC 4.0 · Namensnennung bei Veröffentlichung erforderlich","audacity":"Audacity: Diese Textdatei in Audacity als Textspur importieren (Datei → Importieren → Textmarken), dann liegen die Marken auf den Beats.","copied":"Kopiert!","copy":"In die Zwischenablage kopieren","copy_attribution":"Namensnennung kopieren","csv":"CSV für Excel, Google Sheets, Python (pandas) oder Audio-Programme.","download":"Datei herunterladen","download_markers":"Marker-JSON herunterladen","json_count":"{beats} Beats, {bars} Takte","json_title":"JSON im Format von beat_this","midi_compat":"Für Logic Pro, Ableton Live, FL Studio, Cubase, Reaper, Pro Tools","midi_text":"Enthält Tempo ({bpm} BPM), Taktart ({meter}) und Woodblock-Noten (Kanal 10) für jeden Beat, Downbeats betont.","midi_title":"MIDI-Datei mit Click-Track","mp3_offset":"Resolve spielt MP3-Dateien {ms} ms später ab, als sie analysiert wurden. Die JSON enthält diesen Ausgleich; das Skript setzt Marker und Subtitles auf dem MP3-Clip entsprechend später und meldet es.","preview":"Vorschau:","resolve_intro":"Exportiert eine Marker-JSON. Das Skript BeatAnalyzer_Markers.lua setzt daraus in Resolve einen Marker je Beat auf den Clip im Media Pool und auf die Clips des Songs in der Timeline. Die Bildrate liest das Skript aus dem Clip.","resolve_more":"Ein neuer Lauf ersetzt die Marker des letzten Laufs; von Hand gesetzte Marker bleiben. Dazu legt das Skript den Subtitle „{srt}“ (Typ, Takt, Zeit, Tempo, Confidence je Beat) im Ordner BeatAnalyzer im Media Pool an. Ist eine Timeline mit dem Song offen, kommt er auf einen Subtitle Track unter den Song.","resolve_steps":"So kommen die Marker in DaVinci Resolve Studio:","resolve_title":"DaVinci Resolve: Marker am Audio-Clip","step_download":"Marker-JSON herunterladen.","step_install":"Einmalig: das Skript in Resolve installieren (Feld oben).","step_open":"aufrufen, „{way}“ wählen und die Datei auswählen.","step_select":"In Resolve den Audio-Clip im Media Pool auswählen. Ohne Auswahl sucht das Skript den Clip mit dem Dateinamen","title":"Ergebnisse und Marker exportieren"},"ffmpeg":{"available":"ffmpeg ausführbar ({source})","change":"Ordner ändern","folder":"ffmpeg-Ordner","found":"ffmpeg gefunden und aktiv: {path}","missing":"ffmpeg ist im System nicht ausführbar (nicht im PATH).","missing_hint":"Gib unten den Ordner ein, in dem ffmpeg (oder bin/ffmpeg) liegt – BeatAnalyzer nutzt dann ffmpeg aus diesem Ordner.","no_server":"ffmpeg muss im System ausführbar sein (PATH). Mit verbundenem lokalem Server kannst du hier auch einen eigenen ffmpeg-Ordner angeben.","placeholder":"z. B. C:\\\\ffmpeg\\\\bin oder C:\\\\Tools\\\\ffmpeg","reset":"Zurücksetzen","reset_none":"Eigener Ordner entfernt (kein ffmpeg im System-PATH).","reset_system":"Zurückgesetzt auf ffmpeg des Systems: {path}","reset_tip":"Eigenen ffmpeg-Ordner zurücksetzen","save":"Speichern und prüfen","save_failed":"ffmpeg-Ordner konnte nicht gespeichert werden.","source_custom":"gewählter Ordner","source_system":"System-PATH"},"header":{"export":"Exportieren","github_tip":"GitHub-Repository von beat_this öffnen","language":"Sprache","language_system":"System","language_tip":"Sprache der Web-App und des Resolve-Skripts","local":"Lokal starten (.bat)","local_tip":"Anleitung: lokal mit install_and_run.bat starten","model_info":"Modell-Info","model_info_tip":"Modelle, Lizenzen und Funktionsweise","new_file":"Neue Datei","new_file_tip":"Neue Audiodatei analysieren","subtitle":"Beats, Downbeats, Tempo und Taktart für MP3, WAV, AAC/M4A und FLAC"},"info":{"adv_downbeats":"Beats und Downbeats zugleich","adv_downbeats_text":"Erkennt jeden Beat und dazu die „1“ jedes Takts (Downbeat).","adv_formats":"Viele Formate","adv_formats_text":"Der Server liest MP3, WAV, FLAC, OGG, AAC/M4A und mehr in voller Auflösung; die Originaldatei bleibt unverändert.","adv_meter":"Taktart aus den Downbeats","adv_meter_text":"BeatAnalyzer zählt die Beats zwischen den Downbeats (z. B. 4/4, 3/4); „Glätten“ teilt die Takte gleichmäßig ein.","adv_robust":"Ohne festes Tempo-Raster","adv_robust_text":"Der Transformer hört den ganzen Ausschnitt und kommt mit Synkopen, Swing und Tempowechseln zurecht (ohne DBN-Nachbearbeitung).","beat_this_text":"Entwickelt an der Johannes Kepler Universität Linz (CP JKU) von Francesco Foscarin, Jan Schlüter und Gerhard Widmer (ISMIR 2024). Code und Modell unter MIT-Lizenz – auch kommerziell nutzbar.","installation":"Installation","md_text":"Von Francesco Foscarin, Filip Korzeniowski und Richard Vogl (ISMIR 2026). Darf nur für nicht-kommerzielle Zwecke mit Namensnennung genutzt werden (CC BY-NC 4.0). BeatAnalyzer enthält weder Code noch Modellgewichte davon; Installation von Hand in die venv (Linux/macOS: venv/bin/pip; braucht PyTorch und ffmpeg):","optional":"Optionales Modell · nur nicht-kommerziell (CC BY-NC 4.0)","pipeline":"So läuft die Analyse","standard":"Standard-Modell · MIT-Lizenz","step1":"Dekodieren:","step1_text":"Der lokale Server liest die Datei und berechnet daraus ein Spektrogramm.","step2":"Wahrscheinlichkeiten (BAF und DAF):","step2_text":"beat_this berechnet je Frame (20 ms) die Wahrscheinlichkeit für einen Beat und für einen Downbeat.","step3":"Beats und Takte:","step3_text":"Die Spitzen der Kurven werden zu Beats und Downbeats; daraus folgen Takte, Tempo und Taktart. Ohne Server rechnet der Browser grob nach.","title":"Modelle und Funktionsweise","why":"Was beat_this kann"},"metrics":{"audio":"Audiodatei","bar_share":"{share} der Takte","bars":"Taktanzahl","bars_unit":"","beats_total":"{n} Beats insgesamt","changed_beats":"{n} Beats neu eingeteilt","interval":"Beat-Abstand (IBI)","meter":"Taktart","not_smoothed":"nicht geglättet","reanalysis_failed":"Neue Analyse fehlgeschlagen: {message}","reanchors":"{n} Neuansätze","stability":"Tempo-Stabilität","stability_click":"sehr gleichmäßig","stability_groove":"natürlicher Groove","stability_varies":"Tempo schwankt","straight":"gerade Achtel","swing":"{swing} Swing","tempo":"Tempo","tempo_adagio":"Adagio (ruhig)","tempo_allegro":"Allegro (schnell)","tempo_andante":"Andante (gehend)","tempo_largo":"Largo (sehr langsam)","tempo_moderato":"Moderato (mäßig)","tempo_presto":"Presto (sehr schnell)","tempo_vivace":"Vivace (lebhaft)"},"nc":{"attribution_text":"Bei Weitergabe oder Veröffentlichung müssen die Autoren (Francesco Foscarin, Filip Korzeniowski, Richard Vogl) und die Lizenz genannt werden – BeatAnalyzer schreibt das in die JSON-Exporte.","attribution_title":"Namensnennung:","confirm":"Bestätigen (nur nicht-kommerziell)","confirm_text":"Ich nutze md_beat_this nur für nicht-kommerzielle Zwecke nach CC BY-NC 4.0 und nenne bei Veröffentlichung Autoren und Lizenz.","confirmed":"Nicht-kommerzielle Nutzung (CC BY-NC 4.0) ist für diese Sitzung bestätigt.","copy_cmd":"Befehl kopieren","done":"Fertig","install_text":"BeatAnalyzer lädt Pakete unter CC BY-NC 4.0 nicht selbst herunter. Für md_beat_this im BeatAnalyzer-Ordner einen der Befehle ausführen (vorher einmal install_and_run.bat bzw. .sh) und den Server neu starten:","install_title":"Installation von Hand in die venv","installed":"md_beat_this ist installiert und bereit.","intro":"Das Modell md_beat_this (Masked Diffusion) darf nur genutzt werden, wenn die Nutzung nicht kommerziell ist. Code, Modellgewichte, Vorhersagen und Aktivierungen von fosfrancesco/md_beat_this stehen unter CC BY-NC 4.0 (Namensnennung, nicht kommerziell).","only_nc":"Nur für nicht-kommerzielle Zwecke","private_text":"Nicht-kommerzielle Nutzung mit Namensnennung ist durch CC BY-NC 4.0 abgedeckt.","private_title":"Privat, Test, Forschung:","social_text":"Monetarisierte Kanäle, Werbung, Sponsoring, Affiliate-Links und Promotion für Firmen oder Creator sind kommerziell und nicht erlaubt. Im Zweifel beat_this (MIT-Lizenz) nehmen.","social_title":"Social Media:","title":"Hinweis zur nicht-kommerziellen Nutzung","unix":"Linux / macOS (Terminal im BeatAnalyzer-Ordner)","windows":"Windows (CMD / PowerShell im BeatAnalyzer-Ordner)"},"player":{"back5":"5 Sekunden zurück","fwd5":"5 Sekunden vor","match":"{pct} Übereinstimmung","metronome":"Metronom","metronome_off":"Metronom stumm","metronome_on":"Metronom einschalten","metronome_volume":"Lautstärke des Metronoms","pause":"Pause (Leertaste)","play":"Abspielen (Leertaste)","ready":"Bereit zum Abspielen","tap":"Tap-Tempo","tap_hint":"Tippe im Rhythmus, um das erkannte Tempo zu vergleichen","tap_tip":"Im Takt mitklicken, um das Tempo zu prüfen","to_start":"Zum Anfang","your_tap":"Dein Tap:","song":"Song","song_volume":"Lautstärke des Songs","loop_off_tip":"Loop aus – Klick: sichtbaren Ausschnitt (blauer Rahmen) wiederholen","loop_view":"Ausschnitt","loop_view_tip":"Loop: Ausschnitt (blauer Rahmen) – Klick: ganzer Song","loop_song":"Ganzer Song","loop_song_tip":"Loop: ganzer Song – Klick: Loop aus","loop_off":"Loop","speed":"Geschwindigkeit"},"progress":{"browser_activation":"Browser-Analyse: BAF und DAF …","browser_flux":"Browser-Analyse: Transienten …","browser_stats":"Browser-Analyse: Statistik …","browser_tempo":"Browser-Analyse: Tempo …","browser_tracking":"Browser-Analyse: Beats und Downbeats …","connect":"Verbinde mit dem lokalen Server ({model}) …","decode":"Dekodiere Audiodatei …","done":"Analyse abgeschlossen","done_model":"Analyse mit {model} abgeschlossen","inference":"Analyse mit {model} läuft …","load":"Lade Audiodatei …","waveform":"Erzeuge Wellenform …"},"resolve":{"checking":"Prüfe DaVinci Resolve …","current":"Skript {version} ist in Resolve installiert.","download_lua":".lua herunterladen","install":"In Resolve installieren","legacy":"In Resolve ist noch das Skript unter dem alten Namen BeatThis_Markers installiert. Aktualisieren installiert BeatAnalyzer_Markers und entfernt das alte.","no_server":"Lokaler Server nicht erreichbar. Kopiere das Skript von Hand nach","not_found":"DaVinci Resolve wurde auf diesem PC nicht gefunden. Du kannst das Skript trotzdem installieren.","not_installed":"Das Skript ist in Resolve noch nicht installiert.","outdated":"In Resolve ist Version {installed} installiert, aktuell ist {version}.","restart":"Resolve neu starten, falls es noch nicht unter Workspace → Scripts steht.","script":"Resolve-Skript:","update":"In Resolve aktualisieren"},"sample":{"funk_108":"Funk & Soul","house_126":"Electronic / House","lofi_85":"Lo-Fi Hip Hop","waltz_150":"Klassik / Walzer"},"setup":{"file_cli":"Kommandozeile: Audiodatei auf die .bat ziehen","file_install":"Erstinstallation und Start","file_sh":"Für macOS und Linux im Terminal","file_start":"Start ohne Neuinstallation","files":"Dateien im BeatAnalyzer-Ordner","gpu_text":"Ist eine NVIDIA-Grafikkarte mit CUDA vorhanden, rechnet PyTorch darauf, sonst auf dem Prozessor.","gpu_title":"NVIDIA-Grafikkarte:","md_text1":"Wer das Modell","md_text2":"für nicht-kommerzielle Zwecke nutzen will, installiert es im BeatAnalyzer-Ordner von Hand in die venv (ffmpeg nötig) und startet den Server danach neu:","md_title":"Optional: md_beat_this – nur nicht-kommerzielle Nutzung (CC BY-NC 4.0)","step1":"Voraussetzung: Python 3.9 oder neuer","step1_text":"Falls noch nicht installiert, Python herunterladen und bei der Installation „Add Python to PATH“ ankreuzen:","step2":"Doppelklick auf","step2_text":"Das Skript prüft Python, legt den Ordner venv/ an, installiert PyTorch und die Audio-Pakete und lädt das Modell von beat_this.","step3":"Der Browser öffnet","step3_text":"Die Web-App ist mit dem lokalen Server verbunden. Ziehe deine Audiodateien hinein.","steps":"In 3 Schritten lokal starten","title":"Lokal auf dem PC ausführen","venv_text":"Im BeatAnalyzer-Ordner liegt install_and_run.bat. Ein Doppelklick richtet eine eigene Python-Umgebung ein, lädt PyTorch und beat_this mit seinem Modell herunter und startet die Web-App auf deinem PC.","venv_title":"Eigene Python-Umgebung (venv)"},"table":{"all":"Alle Beats ({n})","col_action":"Aktion","col_bar_beat":"Takt.Beat","col_interval":"Abstand","col_time":"Zeit","col_type":"Typ","downbeats":"Nur Downbeats ({n})","follow":"Mitlaufen","follow_tip":"Blättert beim Abspielen zur Seite des laufenden Beats","nudge_back":"10 ms früher","nudge_fwd":"10 ms später","page":"Seite {page} von {pages}","play_from":"Ab diesem Beat abspielen","search":"Takt suchen …","title":"Beats und Takte ({n})","toggle_downbeat":"Downbeat ein/aus"},"tempo":{"range":"Spanne:","title":"Tempo-Verlauf (BPM über die Zeit)"},"update":{"button":"Update {version}","confirm":"BeatAnalyzer {version} von GitHub laden und installieren?\\nGeänderte Dateien kommen vorher nach update-backup/.","running":"Update läuft …","tip":"Neue Version von GitHub installieren"},"upload":{"analysing":"Audiodatei wird analysiert …","badge":"Beat- und Downbeat-Erkennung","beat_this_text":"Standard-Modell für Beats und Downbeats. Auch kommerziell nutzbar.","browse":"durchsuchen","browser_active":"Kein Server – Browser-Analyse","choose_model":"Analyse-Modell auswählen","demo_hint":"Klick startet die Analyse","demo_title":"Oder mit einem Demo-Track ausprobieren:","drop":"Audiodatei hier ablegen oder","drop_hint":"Wähle eine Musikdatei für die Erkennung von Beats und Takten","error_title":"Analysefehler","installed":"installiert","intro":"Findet Beats, Downbeats, Takte, Tempo und Taktart – mit beat_this (CPJKU) oder md_beat_this. Unterstützt MP3, WAV, AAC/M4A, FLAC und OGG.","local":"Lokal:","md_notice":"Hinweis: md_beat_this darf nur für nicht-kommerzielle Zwecke genutzt werden (CC BY-NC 4.0).","md_setup":"md_beat_this und FFmpeg einrichten","md_text":"Beat-Erkennung per Masked Diffusion","mit":"MIT-Lizenz","nc_only":"Nur nicht-kommerziell","not_installed_fallback":"nicht installiert (Ersatz aktiv)","not_installed_librosa":"nicht installiert (Ersatz: librosa)","server_connected":"Lokaler Server verbunden","title":"Musik analysieren mit"},"wave":{"baf_onset":"Beat Activation Function (BAF) – hier aus der Onset-Stärke, weil das Modell keine Kurve liefert","baf_tip":"Beat Activation Function (BAF) ein/aus","bar_beat":"Takt {bar} · Beat {beat}","bar_downbeat":"Takt {bar} · Downbeat","beats_tip":"Linien der Beats und Downbeats ein/aus","daf_md":"DAF gibt es mit md_beat_this nicht: Das Modell liefert nur Zeitpunkte von Beats und Downbeats, keine fortlaufende Kurve.","daf_none":"DAF gibt es bei dieser Analyse nicht: keine fortlaufende Downbeat-Kurve.","daf_tip":"Downbeat Activation Function (DAF) ein/aus","loupe":"Lupe","loupe_only_overview":"Lupe nur, wenn mindestens {sec} s zu sehen sind","loupe_paused":"Lupe pausiert, solange weniger als {sec} s zu sehen sind – beim Herauszoomen wieder aktiv (Klick schaltet aus)","loupe_tip":"Lupe (~{zoom}× / {span} s) beim Überfahren einschalten","overview":"Übersicht","overview_click":"Klick springt an diese Stelle","overview_drag":"Blauen Rahmen ziehen zum Verschieben · Klick außerhalb springt","quick_back":"Zurück zur ganzen Datei","quick_tip":"{sec} Sekunden um die Abspielposition","quick_too_short":"Der Track ist kürzer als {sec} Sekunden","title":"Wellenform & Beat-Raster","whole_file":"Ganze Datei anzeigen","zoom_in":"Vergrößern","zoom_out":"Verkleinern"}}`)},ot={_meta:{name:`English`,decimal:`.`,percent:`{v}%`,html_lang:`en`},output:{marker_downbeat:`Bar {bar}`,marker_note:`{time} s | {bpm} BPM`,kind_downbeat:`Downbeat (1)`,kind_beat:`Beat {beat}`,bar_beat:`Bar {bar} – Beat {beat}`,time_bpm:`{clock} – {bpm} BPM`,confidence:`Confidence {value}`,intro:[`BeatAnalyzer`,`{file}`,`{bpm} BPM – {meter}`],meter:`{num}/{den}{suffix}`,meter_suffix:{2:``,4:``,8:``,16:``},model_line:`Model: {name} – use under the {license} licence`},plugin:{msg_not_json:`The file is not a BeatAnalyzer marker JSON.`,msg_bad_format:`Unknown format '{format}', expected '{expected}'. Export the file in BeatAnalyzer under Export -> DaVinci Resolve.`,msg_no_markers:`The JSON contains no markers.`,msg_cannot_read:`Cannot read the file: {path}`,msg_no_project:`No project is open.`,msg_no_clip:`No clip found. Select the audio clip in the media pool, or import '{file}' into the media pool.`,msg_markers:`{n} markers on {clips} clip(s): {names}`,msg_skipped:`{n} markers skipped (outside the clip or not accepted by Resolve).`,msg_other_file:`Note: the selected clip is not '{file}' from the JSON.`,msg_srt_ok:`Subtitles: {srt} in media pool bin '{bin}'`,msg_srt_write:`Subtitles: cannot write {path}`,msg_srt_import:`Subtitles: {why} - import {path} by hand`,msg_bin_missing:`media pool bin '{bin}' not available`,msg_not_imported:`Resolve did not import {path}`,msg_tl_empty:`Timeline: no beats in the part of the song that is in the timeline.`,msg_tl_write:`Timeline: cannot write {path}`,msg_tl_import:`Timeline: {why}`,msg_tl_add:`Timeline: cannot add a subtitle track.`,msg_tl_activate:`Timeline: cannot activate the new subtitle track.`,msg_tl_none_placed:`Timeline: Resolve placed no subtitles.`,msg_tl_ok:`Timeline: {n} subtitles on track ST{track} '{name}'{replaced}`,msg_tl_replaced:` (old track replaced)`,msg_tl_count:`Timeline: placed {placed} subtitles, the SRT has {count}.`,msg_tl_offset:`Timeline: first subtitle at frame {actual}, expected {expected} (difference {diff} frames). Please run resolve/tools/probe_timeline.lua and send the console output.`,clip_found:`{names} in the Media Pool · {length}`,warn_other_file:`The selected clip is not '{file}' from the JSON.`,warn_length:`The clip's duration ({clip}) differs from the analysed file ({json}).`,engine:`Analysed with {engine}`,reason_not_installed:`beat_this not installed`,reason_model_load_failed:`beat_this model could not be loaded`,reason_inference_failed:`analysis with beat_this failed`,explain_present:`In the Timeline '{timeline}' the song lies on A{track} from {tc}. Below it the Subtitle Track '{track_name}' is created and made active. Resolve allows only one active Subtitle Track; the others stay but are switched off.`,explain_absent:`The song is not in the Timeline '{timeline}'. Only the Subtitle in the Media Pool is created.`,explain_no_timeline:`No Timeline is open. Only the Subtitle in the Media Pool is created.`,explain_off:`The Timeline stays unchanged. The Subtitle with all beats lies in the folder BeatAnalyzer in the Media Pool and can be dragged from there into any Timeline.`,btn_remove:`Remove BeatAnalyzer markers`,remove_confirm:`Remove from '{song}': {markers} BeatAnalyzer markers, {tracks} Subtitle Track(s) in the open Timeline, {srt} Subtitle clip(s) in the folder BeatAnalyzer? Markers set by hand stay.`,remove_done:`Removed: {markers} markers, {tracks} Subtitle Track(s), {srt} Subtitle clip(s).`,remove_nothing:`Nothing from BeatAnalyzer found on '{song}'.`,btn_remove_yes:`Remove`,title:`BeatAnalyzer {version}`,json_none:`No JSON chosen.`,btn_choose:`Choose …`,choose_title:`BeatAnalyzer – choose marker JSON`,check_timeline:`Create a Subtitle Track in the Timeline`,check_colors:`Adjust marker colours`,color_downbeat:`Downbeat`,color_beat:`Beat {n}`,color_other:`other`,color_none:`no marker`,work_title:`What happens now:`,step_markers:`Markers on the clip '{clip}' in the Media Pool`,step_markers_hint:`Resolve sets every marker on its own, this takes a while.`,step_bin:`Folder BeatAnalyzer in the Media Pool, Subtitle '{srt}'`,step_track:`Subtitle Track '{track}' in '{timeline}'`,wait:`Please wait – the window closes only at the end.`,btn_close:`Close`,btn_ok:`OK`,btn_analyze:`Analyse`,btn_apply:`Apply markers`,btn_cancel:`Cancel`,msg_no_work_dir:`Subtitles: cannot create a working folder in {path}`,msg_tl_vehicle_left:`Timeline: the clip '{clip}' could not be removed from the Media Pool - delete it by hand.`,engine_unknown:`Analysis program: not given in the JSON (older JSON or analysed in the browser)`,reason_analyzer_failed:`the analyzer could not be loaded`,msg_job_folder:`Cannot create the working folder for the analysis in resolve_temp.`,msg_no_python:`Python of BeatAnalyzer not found. Click 'Install in Resolve' in the web app or install BeatAnalyzer again.`,msg_no_start:`Python did not start ({python}). Install BeatAnalyzer again or click 'Install in Resolve' in the web app.`,msg_tl_markers:`Timeline '{timeline}': {n} markers on {items} clip(s) of the song.`,explain_tl_markers:`The song's clips in this Timeline ({items}) get the markers as well.`,way_analyze:`Analyse the selected clip`,way_json:`Load JSON`,sec_source:`1. Source & analysis model`,sec_output:`2. Output in Resolve`,smooth_label:`Smoothing`,smooth_off:`off`,smooth_tip:`0 % = off: bars as beat_this hears them.
More % = a more even grid.
100 % = fully smoothed; starts anew only where the '1' is clearly elsewhere.
The beats never change.`,analyze_none:`Select exactly one audio clip in the Media Pool.`,analyze_many:`Several clips selected – please select exactly one audio clip.`,analyze_no_path:`The selected item has no file (e.g. a Timeline or a Compound Clip).`,step_analysis:`Analysis of '{clip}'`,step_model:`loading the model`,step_analyze:`analysing`,step_write:`writing the result`,step_analysis_hint:`Cancel works only now. Up to here nothing in the project has changed.`,msg_cancelled:`Analysis cancelled. Nothing in the project has changed.`,msg_analysis_error:`Analysis failed: {message}. Nothing in the project has changed.`,msg_timeout:`The analysis was not finished after 10 minutes and was cancelled. Nothing in the project has changed.`,tasks_title:`Tasks`,task_analyze:`Analysing the track`,task_markers:`Setting markers`,task_subtitle:`Creating the Subtitle`,task_track:`Subtitle Track in the Timeline`,wait_short:`Please wait …`,cancel_hint:`Cancel works only during the analysis.`,explain_short_present:`The Subtitle Track goes under the song ({tracks}).`,explain_short_absent:`Song not in the Timeline '{timeline}' – only the Subtitle in the Media Pool.`,explain_short_no_timeline:`No Timeline open – only the Subtitle in the Media Pool.`,explain_short_off:`The Timeline stays unchanged, Subtitle in the folder BeatAnalyzer.`,explain_short_tl_markers:`Markers also on the clips in the Timeline ({items}).`,explain_present_many:`In the Timeline '{timeline}' the song lies on {tracks}. Each of these tracks gets its own Subtitle Track, e.g. '{track_name}'. Resolve allows only one active Subtitle Track; the others stay but are disabled.`,model_tip:`beat_this (CPJKU, MIT): standard, also for commercial work.
md_beat_this (Masked Diffusion, CC BY-NC 4.0): non-commercial use only; installed separately (see README).`,model_beat_this:`beat_this (MIT)
Standard · also commercial`,model_md:`md_beat_this (CC BY-NC 4.0)
Non-commercial only`,md_notice:`md_beat_this is licensed under CC BY-NC 4.0 and may only be used for non-commercial purposes, within the terms of the CC BY-NC 4.0 licence: {url}`,md_confirm:`I use md_beat_this for non-commercial purposes only (CC BY-NC 4.0)`,md_confirm_needed:`Tick the licence box to analyse with md_beat_this.`,reason_md_not_installed:`md_beat_this not installed`,warn_mp3:`MP3: Resolve plays MP3 files about 50 ms later than BeatAnalyzer analyses them. This JSON has no correction (older JSON or analysed in the browser): the markers lie that much before the beat. Analyse again with the server or use the song as WAV or FLAC.`,note_mp3:`MP3: Resolve plays MP3 files about 50 ms later; BeatAnalyzer moves the markers to match.`,msg_mp3_shift:`MP3: markers moved by {ms} ms (Resolve plays MP3 that much later).`,note_mp3_json:`MP3: the markers are set {ms} ms later (Resolve plays MP3 files that much later).`},web:JSON.parse(`{"app":{"footer_formats":"Supports MP3, WAV, AAC/M4A, FLAC & OGG","footer_inspired":"Inspired by","md_active":"Analysis with md_beat_this – for non-commercial use only (CC BY-NC 4.0).","md_fallback":"Fallback active ({engine}) – md_beat_this for non-commercial use only (CC BY-NC 4.0).","setup":"Setup"},"common":{"cancel":"Cancel","close":"Close","ok":"Got it"},"engine":{"browser_result":"Browser analysis (fallback) – no server","browser_tip":"Without a local server the browser makes a rough analysis.","librosa":"librosa (fallback)","librosa_tip":"librosa does not detect downbeats: every 4th beat counts as the “1”.","licence":"{name}: licence {license}","licence_nc":"{name}: licence {license} – non-commercial only","no_server":"no server – browser analysis","no_server_tip":"Without a local server the browser makes a rough analysis (run start.bat).","reason_analyzer_failed":"analyzer not loaded","reason_inference_failed":"analysis failed","reason_model_load_failed":"model not loaded","reason_not_installed":"{model} not installed"},"error":{"decode":"The browser cannot decode the audio file “{file}”. Supported: MP3, WAV, AAC/M4A, FLAC and OGG.","no_server":"The local server does not answer.","server_failed":"Analysis in the local server failed: {message}","unexpected":"An unexpected error occurred."},"export":{"attribution_required":"CC BY-NC 4.0 · attribution required when publishing","audacity":"Audacity: import this text file in Audacity as a label track (File → Import → Labels); the labels then lie on the beats.","copied":"Copied!","copy":"Copy to clipboard","copy_attribution":"Copy attribution","csv":"CSV for Excel, Google Sheets, Python (pandas) or audio programs.","download":"Download file","download_markers":"Download marker JSON","json_count":"{beats} beats, {bars} bars","json_title":"JSON in the format of beat_this","midi_compat":"For Logic Pro, Ableton Live, FL Studio, Cubase, Reaper, Pro Tools","midi_text":"Contains tempo ({bpm} BPM), time signature ({meter}) and woodblock notes (channel 10) for every beat, downbeats accented.","midi_title":"MIDI file with click track","mp3_offset":"Resolve plays MP3 files {ms} ms later than they were analysed. The JSON contains this correction; the script sets Markers and Subtitles on the MP3 clip that much later and says so.","preview":"Preview:","resolve_intro":"Exports a marker JSON. The script BeatAnalyzer_Markers.lua uses it to set one Marker per beat on the clip in the Media Pool and on the song's clips in the Timeline. The script reads the frame rate from the clip.","resolve_more":"A new run replaces the markers of the last run; markers set by hand stay. The script also creates the Subtitle “{srt}” (type, bar, time, tempo, confidence per beat) in the folder BeatAnalyzer in the Media Pool. If a Timeline with the song is open, it goes on a Subtitle Track under the song.","resolve_steps":"How to get the markers into DaVinci Resolve Studio:","resolve_title":"DaVinci Resolve: markers on the audio clip","step_download":"Download the marker JSON.","step_install":"Once: install the script in Resolve (box above).","step_open":"run it, choose “{way}” and pick the file.","step_select":"In Resolve, select the audio clip in the Media Pool. Without a selection the script looks for the clip with the file name","title":"Export results and markers"},"ffmpeg":{"available":"ffmpeg runnable ({source})","change":"Change folder","folder":"ffmpeg folder","found":"ffmpeg found and active: {path}","missing":"ffmpeg is not runnable on the system (not in PATH).","missing_hint":"Enter the folder below that contains ffmpeg (or bin/ffmpeg) – BeatAnalyzer then uses ffmpeg from there.","no_server":"ffmpeg must be runnable on the system (PATH). With the local server connected you can also enter your own ffmpeg folder here.","placeholder":"e.g. C:\\\\ffmpeg\\\\bin or C:\\\\Tools\\\\ffmpeg","reset":"Reset","reset_none":"Own folder removed (no ffmpeg in the system PATH).","reset_system":"Reset to the system's ffmpeg: {path}","reset_tip":"Reset the own ffmpeg folder","save":"Save and check","save_failed":"The ffmpeg folder could not be saved.","source_custom":"chosen folder","source_system":"system PATH"},"header":{"export":"Export","github_tip":"Open the GitHub repository of beat_this","language":"Language","language_system":"System","language_tip":"Language of the web app and of the Resolve script","local":"Run locally (.bat)","local_tip":"How to run locally with install_and_run.bat","model_info":"Model info","model_info_tip":"Models, licences and how it works","new_file":"New file","new_file_tip":"Analyse a new audio file","subtitle":"Beats, downbeats, tempo and time signature for MP3, WAV, AAC/M4A and FLAC"},"info":{"adv_downbeats":"Beats and downbeats together","adv_downbeats_text":"Detects every beat and also the “1” of every bar (downbeat).","adv_formats":"Many formats","adv_formats_text":"The server reads MP3, WAV, FLAC, OGG, AAC/M4A and more at full resolution; the original file stays unchanged.","adv_meter":"Time signature from the downbeats","adv_meter_text":"BeatAnalyzer counts the beats between the downbeats (e.g. 4/4, 3/4); “Smoothing” spaces the bars evenly.","adv_robust":"No fixed tempo grid","adv_robust_text":"The transformer listens to the whole excerpt and copes with syncopation, swing and tempo changes (no DBN post-processing).","beat_this_text":"Developed at Johannes Kepler University Linz (CP JKU) by Francesco Foscarin, Jan Schlüter and Gerhard Widmer (ISMIR 2024). Code and model under the MIT licence – commercial use allowed.","installation":"Installation","md_text":"By Francesco Foscarin, Filip Korzeniowski and Richard Vogl (ISMIR 2026). May only be used for non-commercial purposes with attribution (CC BY-NC 4.0). BeatAnalyzer contains neither its code nor its weights; install it by hand into the venv (Linux/macOS: venv/bin/pip; needs PyTorch and ffmpeg):","optional":"Optional model · non-commercial only (CC BY-NC 4.0)","pipeline":"How the analysis works","standard":"Standard model · MIT licence","step1":"Decoding:","step1_text":"The local server reads the file and computes a spectrogram from it.","step2":"Probabilities (BAF and DAF):","step2_text":"beat_this computes for every frame (20 ms) the probability of a beat and of a downbeat.","step3":"Beats and bars:","step3_text":"The peaks of the curves become beats and downbeats; bars, tempo and time signature follow from them. Without a server the browser makes a rough analysis.","title":"Models and how it works","why":"What beat_this does"},"metrics":{"audio":"Audio file","bar_share":"{share} of the bars","bars":"Bars","bars_unit":"","beats_total":"{n} beats in total","changed_beats":"{n} beats reassigned","interval":"Beat interval (IBI)","meter":"Time signature","not_smoothed":"not smoothed","reanalysis_failed":"New analysis failed: {message}","reanchors":"{n} restarts","stability":"Tempo stability","stability_click":"very steady","stability_groove":"natural groove","stability_varies":"tempo varies","straight":"straight eighths","swing":"{swing} swing","tempo":"Tempo","tempo_adagio":"Adagio (calm)","tempo_allegro":"Allegro (fast)","tempo_andante":"Andante (walking)","tempo_largo":"Largo (very slow)","tempo_moderato":"Moderato (moderate)","tempo_presto":"Presto (very fast)","tempo_vivace":"Vivace (lively)"},"nc":{"attribution_text":"When sharing or publishing, the authors (Francesco Foscarin, Filip Korzeniowski, Richard Vogl) and the licence must be named – BeatAnalyzer writes this into the JSON exports.","attribution_title":"Attribution:","confirm":"Confirm (non-commercial only)","confirm_text":"I use md_beat_this for non-commercial purposes only under CC BY-NC 4.0 and name the authors and the licence when publishing.","confirmed":"Non-commercial use (CC BY-NC 4.0) is confirmed for this session.","copy_cmd":"Copy command","done":"Done","install_text":"BeatAnalyzer does not download packages under CC BY-NC 4.0 by itself. For md_beat_this run one of the commands in the BeatAnalyzer folder (after install_and_run.bat or .sh once) and restart the server:","install_title":"Installation by hand into the venv","installed":"md_beat_this is installed and ready.","intro":"The model md_beat_this (masked diffusion) may only be used for non-commercial purposes. Code, model weights, predictions and activations of fosfrancesco/md_beat_this are licensed under CC BY-NC 4.0 (attribution, non-commercial).","only_nc":"For non-commercial purposes only","private_text":"Non-commercial use with attribution is covered by CC BY-NC 4.0.","private_title":"Private, testing, research:","social_text":"Monetised channels, advertising, sponsoring, affiliate links and promotion for companies or creators are commercial and not allowed. If in doubt, use beat_this (MIT licence).","social_title":"Social media:","title":"Note on non-commercial use","unix":"Linux / macOS (terminal in the BeatAnalyzer folder)","windows":"Windows (CMD / PowerShell in the BeatAnalyzer folder)"},"player":{"back5":"5 seconds back","fwd5":"5 seconds forward","match":"{pct} match","metronome":"Metronome","metronome_off":"Mute the metronome","metronome_on":"Turn on the metronome","metronome_volume":"Metronome volume","pause":"Pause (space)","play":"Play (space)","ready":"Ready to play","tap":"Tap tempo","tap_hint":"Tap along to compare with the detected tempo","tap_tip":"Click along with the beat to check the tempo","to_start":"To the start","your_tap":"Your tap:","song":"Song","song_volume":"Song volume","loop_off_tip":"Loop off – click: repeat the visible section (blue frame)","loop_view":"Section","loop_view_tip":"Loop: section (blue frame) – click: whole song","loop_song":"Whole song","loop_song_tip":"Loop: whole song – click: loop off","loop_off":"Loop","speed":"Speed"},"progress":{"browser_activation":"Browser analysis: BAF and DAF …","browser_flux":"Browser analysis: transients …","browser_stats":"Browser analysis: statistics …","browser_tempo":"Browser analysis: tempo …","browser_tracking":"Browser analysis: beats and downbeats …","connect":"Connecting to the local server ({model}) …","decode":"Decoding audio file …","done":"Analysis finished","done_model":"Analysis with {model} finished","inference":"Analysing with {model} …","load":"Loading audio file …","waveform":"Creating waveform …"},"resolve":{"checking":"Checking DaVinci Resolve …","current":"Script {version} is installed in Resolve.","download_lua":"Download .lua","install":"Install in Resolve","legacy":"Resolve still has the script under the old name BeatThis_Markers. Updating installs BeatAnalyzer_Markers and removes the old one.","no_server":"Local server not reachable. Copy the script by hand to","not_found":"DaVinci Resolve was not found on this PC. You can install the script anyway.","not_installed":"The script is not installed in Resolve yet.","outdated":"Resolve has version {installed}, the current one is {version}.","restart":"Restart Resolve if it is not under Workspace → Scripts yet.","script":"Resolve script:","update":"Update in Resolve"},"sample":{"funk_108":"Funk & Soul","house_126":"Electronic / House","lofi_85":"Lo-Fi Hip Hop","waltz_150":"Classical / Waltz"},"setup":{"file_cli":"Command line: drop an audio file on the .bat","file_install":"First installation and start","file_sh":"For macOS and Linux in the terminal","file_start":"Start without reinstalling","files":"Files in the BeatAnalyzer folder","gpu_text":"With an NVIDIA graphics card and CUDA, PyTorch computes on it, otherwise on the processor.","gpu_title":"NVIDIA graphics card:","md_text1":"To use the model","md_text2":"for non-commercial purposes, install it by hand into the venv in the BeatAnalyzer folder (ffmpeg needed) and restart the server:","md_title":"Optional: md_beat_this – non-commercial use only (CC BY-NC 4.0)","step1":"Requirement: Python 3.9 or newer","step1_text":"If it is not installed yet, download Python and tick “Add Python to PATH” during installation:","step2":"Double-click","step2_text":"The script checks Python, creates the folder venv/, installs PyTorch and the audio packages and downloads the beat_this model.","step3":"The browser opens","step3_text":"The web app is connected to the local server. Drop your audio files in.","steps":"Start locally in 3 steps","title":"Run locally on the PC","venv_text":"The BeatAnalyzer folder contains install_and_run.bat. A double click sets up its own Python environment, downloads PyTorch and beat_this with its model and starts the web app on your PC.","venv_title":"Own Python environment (venv)"},"table":{"all":"All beats ({n})","col_action":"Action","col_bar_beat":"Bar.Beat","col_interval":"Interval","col_time":"Time","col_type":"Type","downbeats":"Downbeats only ({n})","follow":"Follow","follow_tip":"Turns to the page of the playing beat during playback","nudge_back":"10 ms earlier","nudge_fwd":"10 ms later","page":"Page {page} of {pages}","play_from":"Play from this beat","search":"Find bar …","title":"Beats and bars ({n})","toggle_downbeat":"Toggle downbeat"},"tempo":{"range":"Range:","title":"Tempo curve (BPM over time)"},"update":{"button":"Update {version}","confirm":"Download and install BeatAnalyzer {version} from GitHub?\\nChanged files are moved to update-backup/ first.","running":"Updating …","tip":"Install the new version from GitHub"},"upload":{"analysing":"Analysing the audio file …","badge":"Beat and downbeat detection","beat_this_text":"Standard model for beats and downbeats. Also for commercial use.","browse":"browse","browser_active":"No server – browser analysis","choose_model":"Choose the analysis model","demo_hint":"Click to analyse","demo_title":"Or try a demo track:","drop":"Drop an audio file here or","drop_hint":"Choose a music file to detect beats and bars","error_title":"Analysis error","installed":"installed","intro":"Finds beats, downbeats, bars, tempo and time signature – with beat_this (CPJKU) or md_beat_this. Supports MP3, WAV, AAC/M4A, FLAC and OGG.","local":"Local:","md_notice":"Note: md_beat_this may only be used for non-commercial purposes (CC BY-NC 4.0).","md_setup":"Set up md_beat_this and FFmpeg","md_text":"Beat tracking with masked diffusion","mit":"MIT licence","nc_only":"Non-commercial only","not_installed_fallback":"not installed (fallback active)","not_installed_librosa":"not installed (fallback: librosa)","server_connected":"Local server connected","title":"Analyse music with"},"wave":{"baf_onset":"Beat activation function (BAF) – here from the onset strength, as the model gives no curve","baf_tip":"Toggle the beat activation function (BAF)","bar_beat":"Bar {bar} · Beat {beat}","bar_downbeat":"Bar {bar} · Downbeat","beats_tip":"Toggle the lines of beats and downbeats","daf_md":"No DAF with md_beat_this: the model gives only times of beats and downbeats, no continuous curve.","daf_none":"No DAF for this analysis: no continuous downbeat curve.","daf_tip":"Toggle the downbeat activation function (DAF)","loupe":"Magnifier","loupe_only_overview":"Magnifier only when at least {sec} s are shown","loupe_paused":"Magnifier paused while less than {sec} s are shown – active again when zooming out (click to turn off)","loupe_tip":"Turn on the magnifier (~{zoom}× / {span} s) on hover","overview":"Overview","overview_click":"Click to jump there","overview_drag":"Drag the blue frame to move · click outside to jump","quick_back":"Back to the whole file","quick_tip":"{sec} seconds around the playhead","quick_too_short":"The track is shorter than {sec} seconds","title":"Waveform & beat grid","whole_file":"Show the whole file","zoom_in":"Zoom in","zoom_out":"Zoom out"}}`)},st={_meta:{name:`Türkçe`,decimal:`,`,percent:`%{v}`,html_lang:`tr`,review:`Türkische Texte: vom Nutzer noch zu prüfen`},output:{marker_downbeat:`Ölçü {bar}`,marker_note:`{time} s | {bpm} BPM`,kind_downbeat:`Downbeat (1)`,kind_beat:`Beat {beat}`,bar_beat:`Ölçü {bar} – Beat {beat}`,time_bpm:`{clock} – {bpm} BPM`,confidence:`Confidence {value}`,intro:[`BeatAnalyzer`,`{file}`,`{bpm} BPM – {meter}`],meter:`{num}/{den}{suffix}`,meter_suffix:{2:`'lik`,4:`'lük`,8:`'lik`,16:`'lık`},model_line:`Model: {name} – {license} lisansı kapsamında kullanım`},plugin:{msg_not_json:`Dosya bir BeatAnalyzer marker JSON'u değil.`,msg_bad_format:`Bilinmeyen biçim '{format}', beklenen '{expected}'. Dosyayı BeatAnalyzer'da Dışa aktar → DaVinci Resolve ile dışa aktarın.`,msg_no_markers:`JSON'da marker yok.`,msg_cannot_read:`Dosya okunamıyor: {path}`,msg_no_project:`Açık proje yok.`,msg_no_clip:`Clip bulunamadı. Ses clip'ini Media Pool'da seçin veya '{file}' dosyasını Media Pool'a aktarın.`,msg_markers:`{clips} clip üzerinde {n} marker: {names}`,msg_skipped:`{n} marker atlandı (clip dışında veya Resolve kabul etmedi).`,msg_other_file:`Not: Seçili clip, JSON'daki '{file}' değil.`,msg_srt_ok:`Subtitle: {srt}, Media Pool'daki {bin} klasöründe`,msg_srt_write:`Subtitle: {path} yazılamıyor`,msg_srt_import:`Subtitle: {why} – {path} dosyasını elle içe aktarın`,msg_bin_missing:`Media Pool'da {bin} klasörü kullanılamıyor`,msg_not_imported:`Resolve {path} dosyasını içe aktarmadı`,msg_tl_empty:`Timeline: Şarkının Timeline'daki bölümünde beat yok.`,msg_tl_write:`Timeline: {path} yazılamıyor`,msg_tl_import:`Timeline: {why}`,msg_tl_add:`Timeline: Subtitle Track eklenemiyor.`,msg_tl_activate:`Timeline: Yeni Subtitle Track etkinleştirilemiyor.`,msg_tl_none_placed:`Timeline: Resolve hiç subtitle yerleştirmedi.`,msg_tl_ok:`Timeline: ST{track} '{name}' track'inde {n} subtitle{replaced}`,msg_tl_replaced:` (eski track değiştirildi)`,msg_tl_count:`Timeline: {placed} subtitle yerleştirildi, SRT'de {count} var.`,msg_tl_offset:`Timeline: İlk subtitle {actual}. karede, beklenen {expected} (fark {diff} kare). Lütfen resolve/tools/probe_timeline.lua dosyasını çalıştırıp Console çıktısını gönderin.`,clip_found:`Media Pool'da {names} · {length}`,warn_other_file:`Seçili clip, JSON'daki '{file}' değil.`,warn_length:`Clip'in süresi ({clip}) analiz edilen dosyadan ({json}) farklı.`,engine:`Analiz: {engine}`,reason_not_installed:`beat_this kurulu değil`,reason_model_load_failed:`beat_this modeli yüklenemedi`,reason_inference_failed:`beat_this ile analiz başarısız oldu`,explain_present:`'{timeline}' Timeline'ında şarkı A{track} üzerinde {tc} itibarıyla duruyor. Altına '{track_name}' Subtitle Track'i oluşturulur ve etkin yapılır. Resolve yalnızca bir etkin Subtitle Track'e izin verir; diğerleri kalır ama devre dışı bırakılır.`,explain_absent:`Şarkı '{timeline}' Timeline'ında değil. Yalnızca Media Pool'daki Subtitle oluşturulur.`,explain_no_timeline:`Açık Timeline yok. Yalnızca Media Pool'daki Subtitle oluşturulur.`,explain_off:`Timeline değişmez. Tüm beat'leri içeren Subtitle, Media Pool'daki BeatAnalyzer klasöründedir ve oradan istenen Timeline'a sürüklenebilir.`,btn_remove:`BeatAnalyzer marker'larını kaldır`,remove_confirm:`'{song}' içinden kaldırılsın mı: {markers} BeatAnalyzer marker'ı, açık Timeline'da {tracks} Subtitle Track, BeatAnalyzer klasöründe {srt} Subtitle clip'i? Elle eklenen marker'lar kalır.`,remove_done:`Kaldırıldı: {markers} marker, {tracks} Subtitle Track, {srt} Subtitle clip'i.`,remove_nothing:`'{song}' üzerinde BeatAnalyzer'a ait bir şey bulunamadı.`,btn_remove_yes:`Kaldır`,title:`BeatAnalyzer {version}`,json_none:`JSON seçilmedi.`,btn_choose:`Seç …`,choose_title:`BeatAnalyzer – marker JSON'unu seçin`,check_timeline:`Timeline'da Subtitle Track oluştur`,check_colors:`Marker renklerini ayarla`,color_downbeat:`Downbeat`,color_beat:`Beat {n}`,color_other:`diğer`,color_none:`marker yok`,work_title:`Şimdi ne oluyor:`,step_markers:`Media Pool'daki '{clip}' clip'ine marker'lar`,step_markers_hint:`Resolve her marker'ı tek tek ekler, bu biraz sürer.`,step_bin:`Media Pool'da BeatAnalyzer klasörü, Subtitle '{srt}'`,step_track:`'{timeline}' içinde '{track}' Subtitle Track'i`,wait:`Lütfen bekleyin – pencere ancak iş bitince kapanır.`,btn_close:`Kapat`,btn_ok:`Tamam`,btn_analyze:`Analiz et`,btn_apply:`Marker'ları ekle`,btn_cancel:`İptal`,msg_no_work_dir:`Subtitle: {path} içinde çalışma klasörü oluşturulamıyor`,msg_tl_vehicle_left:`Timeline: '{clip}' clip'i Media Pool'dan kaldırılamadı – lütfen elle silin.`,engine_unknown:`Analiz programı: JSON'da belirtilmemiş (eski JSON veya tarayıcıda analiz edilmiş)`,reason_analyzer_failed:`analiz modülü yüklenemedi`,msg_job_folder:`resolve_temp içinde analiz için çalışma klasörü oluşturulamıyor.`,msg_no_python:`BeatAnalyzer'ın Python'u bulunamadı. Web uygulamasında „Resolve'a yükle“ye tıklayın veya BeatAnalyzer'ı yeniden kurun.`,msg_no_start:`Python başlamadı ({python}). BeatAnalyzer'ı yeniden kurun veya web uygulamasında „Resolve'a yükle“ye tıklayın.`,msg_tl_markers:`Timeline „{timeline}“: şarkının {items} klibine {n} marker.`,explain_tl_markers:`Şarkının bu Timeline'daki klipleri ({items}) de marker alır.`,way_analyze:`Seçili klibi analiz et`,way_json:`JSON yükle`,sec_source:`1. Kaynak ve analiz modeli`,sec_output:`2. Resolve'daki çıktı`,smooth_label:`Düzeltme`,smooth_off:`kapalı`,smooth_tip:`%0 = kapalı: ölçüler beat_this'in duyduğu gibi.
Daha fazla % = daha düzenli ızgara.
%100 = tam düzeltme; yalnızca „1“ açıkça başka yerdeyse yeniden başlar.
Beat'ler değişmez.`,analyze_none:`Media Pool'da tam olarak bir ses klibi seçin.`,analyze_many:`Birden fazla klip seçili – lütfen tam olarak bir ses klibi seçin.`,analyze_no_path:`Seçili öğenin dosyası yok (ör. Timeline veya Compound Clip).`,step_analysis:`„{clip}“ analizi`,step_model:`model yükleniyor`,step_analyze:`analiz ediliyor`,step_write:`sonuç yazılıyor`,step_analysis_hint:`İptal yalnızca şimdi mümkün. Buraya kadar projede hiçbir şey değişmedi.`,msg_cancelled:`Analiz iptal edildi. Projede hiçbir şey değişmedi.`,msg_analysis_error:`Analiz başarısız: {message}. Projede hiçbir şey değişmedi.`,msg_timeout:`Analiz 10 dakika sonra bitmedi ve iptal edildi. Projede hiçbir şey değişmedi.`,tasks_title:`Görevler`,task_analyze:`Parça analiz ediliyor`,task_markers:`Marker'lar ekleniyor`,task_subtitle:`Subtitle oluşturuluyor`,task_track:`Timeline'da Subtitle Track`,wait_short:`Lütfen bekleyin …`,cancel_hint:`İptal yalnızca analiz sırasında mümkün.`,explain_short_present:`Subtitle Track şarkının altına gelir ({tracks}).`,explain_short_absent:`Şarkı „{timeline}“ Timeline'ında değil – yalnızca Media Pool'da Subtitle.`,explain_short_no_timeline:`Açık Timeline yok – yalnızca Media Pool'da Subtitle.`,explain_short_off:`Timeline değişmez, Subtitle BeatAnalyzer klasöründe.`,explain_short_tl_markers:`Marker'lar Timeline'daki kliplere de eklenir ({items}).`,explain_present_many:`„{timeline}“ Timeline'ında şarkı {tracks} üzerinde. Bu izlerin her biri için ayrı bir Subtitle Track oluşur, ör. „{track_name}“. Resolve yalnızca bir etkin Subtitle Track'e izin verir; diğerleri kalır ama devre dışı bırakılır.`,model_tip:`beat_this (CPJKU, MIT): standart, ticari işler için de.
md_beat_this (Masked Diffusion, CC BY-NC 4.0): yalnızca ticari olmayan kullanım; ayrıca kurulur (bkz. README).`,model_beat_this:`beat_this (MIT)
Standart · ticari de`,model_md:`md_beat_this (CC BY-NC 4.0)
Yalnızca ticari olmayan`,md_notice:`md_beat_this, CC BY-NC 4.0 lisansı altındadır ve yalnızca ticari olmayan amaçlarla, CC BY-NC 4.0 lisansı çerçevesinde kullanılabilir: {url}`,md_confirm:`md_beat_this'i yalnızca ticari olmayan amaçlarla kullanıyorum (CC BY-NC 4.0)`,md_confirm_needed:`md_beat_this ile analiz için lisans kutusunu işaretleyin.`,reason_md_not_installed:`md_beat_this kurulu değil`,warn_mp3:`MP3: Resolve MP3 dosyalarını BeatAnalyzer'ın analiz ettiğinden yaklaşık 50 ms geç çalar. Bu JSON düzeltme içermiyor (eski JSON veya tarayıcıda analiz): işaretçiler vuruştan bu kadar önce durur. Sunucuyla yeniden analiz edin veya şarkıyı WAV ya da FLAC olarak kullanın.`,note_mp3:`MP3: Resolve MP3 dosyalarını yaklaşık 50 ms geç çalar; BeatAnalyzer işaretçileri buna göre kaydırır.`,msg_mp3_shift:`MP3: işaretçiler {ms} ms ileri kaydırıldı (Resolve MP3'ü bu kadar geç çalar).`,note_mp3_json:`MP3: işaretçiler {ms} ms sonra konur (Resolve MP3 dosyalarını bu kadar geç çalar).`},web:JSON.parse(`{"app":{"footer_formats":"MP3, WAV, AAC/M4A, FLAC ve OGG desteklenir","footer_inspired":"Esin kaynağı:","md_active":"md_beat_this ile analiz – yalnızca ticari olmayan kullanım için (CC BY-NC 4.0).","md_fallback":"Yedek etkin ({engine}) – md_beat_this yalnızca ticari olmayan kullanım için (CC BY-NC 4.0).","setup":"Kurulum"},"common":{"cancel":"İptal","close":"Kapat","ok":"Anladım"},"engine":{"browser_result":"Tarayıcı analizi (yedek) – sunucu yok","browser_tip":"Yerel sunucu olmadan tarayıcı kaba bir analiz yapar.","librosa":"librosa (yedek)","librosa_tip":"librosa downbeat algılamaz: her 4. beat “1” sayılır.","licence":"{name}: {license} lisansı","licence_nc":"{name}: {license} lisansı – yalnızca ticari olmayan","no_server":"sunucu yok – tarayıcı analizi","no_server_tip":"Yerel sunucu olmadan tarayıcı kaba bir analiz yapar (start.bat'ı çalıştırın).","reason_analyzer_failed":"analiz modülü yüklenemedi","reason_inference_failed":"analiz başarısız","reason_model_load_failed":"model yüklenemedi","reason_not_installed":"{model} kurulu değil"},"error":{"decode":"“{file}” ses dosyası tarayıcıda çözülemiyor. Desteklenenler: MP3, WAV, AAC/M4A, FLAC ve OGG.","no_server":"Yerel sunucu yanıt vermiyor.","server_failed":"Yerel sunucuda analiz başarısız: {message}","unexpected":"Beklenmeyen bir hata oluştu."},"export":{"attribution_required":"CC BY-NC 4.0 · yayımlarken atıf zorunlu","audacity":"Audacity: bu metin dosyasını Audacity'de etiket izi olarak içe aktarın (Dosya → İçe aktar → Etiketler); etiketler beat'lerin üzerinde olur.","copied":"Kopyalandı!","copy":"Panoya kopyala","copy_attribution":"Atfı kopyala","csv":"Excel, Google Sheets, Python (pandas) veya ses programları için CSV.","download":"Dosyayı indir","download_markers":"Marker JSON indir","json_count":"{beats} beat, {bars} ölçü","json_title":"beat_this biçiminde JSON","midi_compat":"Logic Pro, Ableton Live, FL Studio, Cubase, Reaper, Pro Tools için","midi_text":"Tempo ({bpm} BPM), ölçü ({meter}) ve her beat için woodblock notaları (kanal 10) içerir; downbeat'ler vurgulu.","midi_title":"Klik izli MIDI dosyası","mp3_offset":"Resolve MP3 dosyalarını analiz edildiklerinden {ms} ms geç çalar. JSON bu düzeltmeyi içerir; betik MP3 klibindeki Marker ve Subtitle'ları buna göre kaydırır ve bunu bildirir.","preview":"Önizleme:","resolve_intro":"Bir Marker JSON dosyası dışa aktarır. BeatAnalyzer_Markers.lua betiği bununla Media Pool'daki klibe ve şarkının Timeline'daki kliplerine her beat için bir Marker koyar. Kare hızını betik klipten okur.","resolve_more":"Yeni bir çalıştırma önceki işaretçilerin yerini alır; elle konan Marker'lar kalır. Betik ayrıca Media Pool'daki BeatAnalyzer klasöründe “{srt}” Subtitle'ını (her beat için tür, ölçü, zaman, tempo, confidence) oluşturur. Şarkının olduğu bir Timeline açıksa şarkının altındaki bir Subtitle Track'e konur.","resolve_steps":"Marker'lar DaVinci Resolve Studio'ya şöyle aktarılır:","resolve_title":"DaVinci Resolve: ses klibinde Marker","step_download":"Marker JSON dosyasını indirin.","step_install":"Bir kez: betiği Resolve'a kurun (yukarıdaki alan).","step_open":"çalıştırın, “{way}” seçeneğini seçip dosyayı seçin.","step_select":"Resolve'da Media Pool'daki ses klibini seçin. Seçim yoksa betik şu dosya adlı klibi arar:","title":"Sonuçları ve işaretçileri dışa aktar"},"ffmpeg":{"available":"ffmpeg çalıştırılabilir ({source})","change":"Klasörü değiştir","folder":"ffmpeg klasörü","found":"ffmpeg bulundu ve etkin: {path}","missing":"ffmpeg sistemde çalıştırılamıyor (PATH'te değil).","missing_hint":"Aşağıya ffmpeg'in (veya bin/ffmpeg'in) bulunduğu klasörü girin – BeatAnalyzer ffmpeg'i oradan kullanır.","no_server":"ffmpeg sistemde çalıştırılabilir olmalı (PATH). Yerel sunucu bağlıyken burada kendi ffmpeg klasörünüzü de girebilirsiniz.","placeholder":"ör. C:\\\\ffmpeg\\\\bin veya C:\\\\Tools\\\\ffmpeg","reset":"Sıfırla","reset_none":"Özel klasör kaldırıldı (sistem PATH'inde ffmpeg yok).","reset_system":"Sistemin ffmpeg'ine dönüldü: {path}","reset_tip":"Özel ffmpeg klasörünü sıfırla","save":"Kaydet ve denetle","save_failed":"ffmpeg klasörü kaydedilemedi.","source_custom":"seçilen klasör","source_system":"sistem PATH"},"header":{"export":"Dışa aktar","github_tip":"beat_this GitHub deposunu aç","language":"Dil","language_system":"Sistem","language_tip":"Web uygulamasının ve Resolve betiğinin dili","local":"Yerel çalıştır (.bat)","local_tip":"install_and_run.bat ile yerel çalıştırma","model_info":"Model bilgisi","model_info_tip":"Modeller, lisanslar ve çalışma şekli","new_file":"Yeni dosya","new_file_tip":"Yeni bir ses dosyası analiz et","subtitle":"MP3, WAV, AAC/M4A ve FLAC için beat, downbeat, tempo ve ölçü"},"info":{"adv_downbeats":"Beat ve downbeat birlikte","adv_downbeats_text":"Her beat'i ve her ölçünün “1”ini (downbeat) algılar.","adv_formats":"Birçok biçim","adv_formats_text":"Sunucu MP3, WAV, FLAC, OGG, AAC/M4A ve daha fazlasını tam çözünürlükte okur; özgün dosya değişmez.","adv_meter":"Downbeat'lerden ölçü","adv_meter_text":"BeatAnalyzer downbeat'ler arasındaki beat'leri sayar (ör. 4/4, 3/4); “Yumuşatma” ölçüleri eşit dağıtır.","adv_robust":"Sabit tempo ızgarası yok","adv_robust_text":"Transformer tüm kesiti dinler; senkop, swing ve tempo değişimleriyle başa çıkar (DBN son işlemesi olmadan).","beat_this_text":"Johannes Kepler Üniversitesi Linz'de (CP JKU) Francesco Foscarin, Jan Schlüter ve Gerhard Widmer tarafından geliştirildi (ISMIR 2024). Kod ve model MIT lisansı altında – ticari kullanım serbest.","installation":"Kurulum","md_text":"Francesco Foscarin, Filip Korzeniowski ve Richard Vogl tarafından (ISMIR 2026). Yalnızca atıfla ve ticari olmayan amaçlarla kullanılabilir (CC BY-NC 4.0). BeatAnalyzer onun kodunu veya ağırlıklarını içermez; venv'e elle kurulur (Linux/macOS: venv/bin/pip; PyTorch ve ffmpeg gerekir):","optional":"İsteğe bağlı model · yalnızca ticari olmayan (CC BY-NC 4.0)","pipeline":"Analiz nasıl çalışır","standard":"Standart model · MIT lisansı","step1":"Çözme:","step1_text":"Yerel sunucu dosyayı okur ve ondan bir spektrogram hesaplar.","step2":"Olasılıklar (BAF ve DAF):","step2_text":"beat_this her kare (20 ms) için beat ve downbeat olasılığını hesaplar.","step3":"Beat ve ölçüler:","step3_text":"Eğrilerin tepeleri beat ve downbeat olur; ölçüler, tempo ve ölçü türü bunlardan çıkar. Sunucu olmadan tarayıcı kaba bir analiz yapar.","title":"Modeller ve çalışma şekli","why":"beat_this neler yapar"},"metrics":{"audio":"Ses dosyası","bar_share":"{share} ölçü","bars":"Toplam","bars_unit":"ölçü","beats_total":"toplam {n} beat","changed_beats":"{n} beat yeniden düzenlendi","interval":"Beat aralığı (IBI)","meter":"Ölçü","not_smoothed":"düzeltilmedi","reanalysis_failed":"Yeni analiz başarısız: {message}","reanchors":"{n} yeniden başlangıç","stability":"Tempo kararlılığı","stability_click":"çok düzenli","stability_groove":"doğal groove","stability_varies":"tempo değişken","straight":"düz sekizlikler","swing":"{swing} swing","tempo":"Tempo","tempo_adagio":"Adagio (sakin)","tempo_allegro":"Allegro (hızlı)","tempo_andante":"Andante (yürüyüş)","tempo_largo":"Largo (çok yavaş)","tempo_moderato":"Moderato (orta)","tempo_presto":"Presto (çok hızlı)","tempo_vivace":"Vivace (canlı)"},"nc":{"attribution_text":"Paylaşırken veya yayımlarken yazarlar (Francesco Foscarin, Filip Korzeniowski, Richard Vogl) ve lisans belirtilmelidir – BeatAnalyzer bunu JSON dışa aktarımlarına yazar.","attribution_title":"Atıf:","confirm":"Onayla (yalnızca ticari olmayan)","confirm_text":"md_beat_this'i yalnızca CC BY-NC 4.0 kapsamında ticari olmayan amaçlarla kullanıyorum ve yayımlarken yazarları ve lisansı belirtiyorum.","confirmed":"Ticari olmayan kullanım (CC BY-NC 4.0) bu oturum için onaylandı.","copy_cmd":"Komutu kopyala","done":"Tamam","install_text":"BeatAnalyzer, CC BY-NC 4.0 lisanslı paketleri kendiliğinden indirmez. md_beat_this için BeatAnalyzer klasöründe komutlardan birini çalıştırın (önce bir kez install_and_run.bat veya .sh) ve sunucuyu yeniden başlatın:","install_title":"venv'e elle kurulum","installed":"md_beat_this kurulu ve hazır.","intro":"md_beat_this modeli (masked diffusion) yalnızca ticari olmayan amaçlarla kullanılabilir. fosfrancesco/md_beat_this'in kodu, model ağırlıkları, tahminleri ve aktivasyonları CC BY-NC 4.0 lisansı altındadır (atıf, ticari olmayan).","only_nc":"Yalnızca ticari olmayan amaçlar için","private_text":"Atıfla ticari olmayan kullanım CC BY-NC 4.0 kapsamındadır.","private_title":"Özel kullanım, test, araştırma:","social_text":"Para kazandıran kanallar, reklam, sponsorluk, ortaklık bağlantıları ve şirket ya da içerik üreticisi tanıtımı ticaridir ve izin verilmez. Şüphede kalırsanız beat_this'i (MIT lisansı) kullanın.","social_title":"Sosyal medya:","title":"Ticari olmayan kullanım hakkında not","unix":"Linux / macOS (BeatAnalyzer klasöründe terminal)","windows":"Windows (BeatAnalyzer klasöründe CMD / PowerShell)"},"player":{"back5":"5 saniye geri","fwd5":"5 saniye ileri","match":"{pct} uyum","metronome":"Metronom","metronome_off":"Metronomu sustur","metronome_on":"Metronomu aç","metronome_volume":"Metronom ses düzeyi","pause":"Duraklat (boşluk)","play":"Çal (boşluk)","ready":"Çalmaya hazır","tap":"Tap tempo","tap_hint":"Algılanan tempoyla karşılaştırmak için ritimle dokunun","tap_tip":"Tempoyu kontrol etmek için ritimle birlikte tıklayın","to_start":"Başa","your_tap":"Dokunuşunuz:","song":"Şarkı","song_volume":"Şarkının ses düzeyi","loop_off_tip":"Döngü kapalı – tıklayın: görünen bölümü (mavi çerçeve) tekrarla","loop_view":"Bölüm","loop_view_tip":"Döngü: bölüm (mavi çerçeve) – tıklayın: tüm şarkı","loop_song":"Tüm şarkı","loop_song_tip":"Döngü: tüm şarkı – tıklayın: döngü kapalı","loop_off":"Döngü","speed":"Hız"},"progress":{"browser_activation":"Tarayıcı analizi: BAF ve DAF …","browser_flux":"Tarayıcı analizi: geçişler …","browser_stats":"Tarayıcı analizi: istatistik …","browser_tempo":"Tarayıcı analizi: tempo …","browser_tracking":"Tarayıcı analizi: beat ve downbeat …","connect":"Yerel sunucuya bağlanılıyor ({model}) …","decode":"Ses dosyası çözülüyor …","done":"Analiz tamamlandı","done_model":"{model} ile analiz tamamlandı","inference":"{model} ile analiz ediliyor …","load":"Ses dosyası yükleniyor …","waveform":"Dalga biçimi oluşturuluyor …"},"resolve":{"checking":"DaVinci Resolve denetleniyor …","current":"Betik {version} Resolve'a kurulu.","download_lua":".lua indir","install":"Resolve'a kur","legacy":"Resolve'da betik hâlâ eski BeatThis_Markers adıyla kurulu. Güncelleme BeatAnalyzer_Markers'ı kurar ve eskisini kaldırır.","no_server":"Yerel sunucuya ulaşılamıyor. Betiği elle şuraya kopyalayın:","not_found":"DaVinci Resolve bu bilgisayarda bulunamadı. Betiği yine de kurabilirsiniz.","not_installed":"Betik henüz Resolve'a kurulu değil.","outdated":"Resolve'da {installed} sürümü kurulu, güncel sürüm {version}.","restart":"Henüz Workspace → Scripts altında görünmüyorsa Resolve'u yeniden başlatın.","script":"Resolve betiği:","update":"Resolve'da güncelle"},"sample":{"funk_108":"Funk & Soul","house_126":"Elektronik / House","lofi_85":"Lo-Fi Hip Hop","waltz_150":"Klasik / Vals"},"setup":{"file_cli":"Komut satırı: ses dosyasını .bat üzerine bırakın","file_install":"İlk kurulum ve başlatma","file_sh":"Terminalde macOS ve Linux için","file_start":"Yeniden kurmadan başlatma","files":"BeatAnalyzer klasöründeki dosyalar","gpu_text":"CUDA destekli bir NVIDIA ekran kartı varsa PyTorch onda, yoksa işlemcide hesaplar.","gpu_title":"NVIDIA ekran kartı:","md_text1":"Modeli","md_text2":"ticari olmayan amaçlarla kullanmak isteyen, BeatAnalyzer klasöründe venv'e elle kurar (ffmpeg gerekir) ve ardından sunucuyu yeniden başlatır:","md_title":"İsteğe bağlı: md_beat_this – yalnızca ticari olmayan kullanım (CC BY-NC 4.0)","step1":"Gereksinim: Python 3.9 veya üstü","step1_text":"Henüz kurulu değilse Python'u indirin ve kurulumda “Add Python to PATH” seçeneğini işaretleyin:","step2":"Çift tıklayın:","step2_text":"Betik Python'u denetler, venv/ klasörünü oluşturur, PyTorch'u ve ses paketlerini kurar ve beat_this modelini indirir.","step3":"Tarayıcı açılır:","step3_text":"Web uygulaması yerel sunucuya bağlıdır. Ses dosyalarınızı sürükleyip bırakın.","steps":"3 adımda yerel başlatma","title":"Bilgisayarda yerel çalıştırma","venv_text":"BeatAnalyzer klasöründe install_and_run.bat bulunur. Çift tıklama ayrı bir Python ortamı kurar, PyTorch'u ve modeliyle birlikte beat_this'i indirir ve web uygulamasını bilgisayarınızda başlatır.","venv_title":"Ayrı Python ortamı (venv)"},"table":{"all":"Tüm beat'ler ({n})","col_action":"İşlem","col_bar_beat":"Ölçü.Beat","col_interval":"Aralık","col_time":"Zaman","col_type":"Tür","downbeats":"Yalnızca downbeat'ler ({n})","follow":"Takip et","follow_tip":"Çalarken çalan beat'in sayfasına geçer","nudge_back":"10 ms erken","nudge_fwd":"10 ms geç","page":"Sayfa {page} / {pages}","play_from":"Bu beat'ten çal","search":"Ölçü ara …","title":"Beat ve ölçüler ({n})","toggle_downbeat":"Downbeat aç/kapat"},"tempo":{"range":"Aralık:","title":"Tempo eğrisi (zamana göre BPM)"},"update":{"button":"Güncelle {version}","confirm":"BeatAnalyzer {version} GitHub'dan indirilip kurulsun mu?\\nDeğiştirilmiş dosyalar önce update-backup/ klasörüne taşınır.","running":"Güncelleniyor …","tip":"Yeni sürümü GitHub'dan kur"},"upload":{"analysing":"Ses dosyası analiz ediliyor …","badge":"Beat ve downbeat algılama","beat_this_text":"Beat ve downbeat için standart model. Ticari kullanım da serbest.","browse":"göz atın","browser_active":"Sunucu yok – tarayıcı analizi","choose_model":"Analiz modelini seçin","demo_hint":"Analiz için tıklayın","demo_title":"Ya da bir demo parçayla deneyin:","drop":"Ses dosyasını buraya bırakın veya","drop_hint":"Beat ve ölçüleri algılamak için bir müzik dosyası seçin","error_title":"Analiz hatası","installed":"kurulu","intro":"Beat, downbeat, ölçü, tempo ve ölçü türünü bulur – beat_this (CPJKU) veya md_beat_this ile. MP3, WAV, AAC/M4A, FLAC ve OGG desteklenir.","local":"Yerel:","md_notice":"Not: md_beat_this yalnızca ticari olmayan amaçlarla kullanılabilir (CC BY-NC 4.0).","md_setup":"md_beat_this ve FFmpeg kurulumu","md_text":"Masked diffusion ile beat takibi","mit":"MIT lisansı","nc_only":"Yalnızca ticari olmayan","not_installed_fallback":"kurulu değil (yedek etkin)","not_installed_librosa":"kurulu değil (yedek: librosa)","server_connected":"Yerel sunucu bağlı","title":"Müzik analizi:"},"wave":{"baf_onset":"Beat aktivasyon fonksiyonu (BAF) – model eğri vermediği için burada onset gücünden","baf_tip":"Beat aktivasyon fonksiyonunu (BAF) aç/kapat","bar_beat":"Ölçü {bar} · Beat {beat}","bar_downbeat":"Ölçü {bar} · Downbeat","beats_tip":"Beat ve downbeat çizgilerini aç/kapat","daf_md":"md_beat_this ile DAF yok: model yalnızca beat ve downbeat zamanlarını verir, sürekli bir eğri vermez.","daf_none":"Bu analizde DAF yok: sürekli downbeat eğrisi yok.","daf_tip":"Downbeat aktivasyon fonksiyonunu (DAF) aç/kapat","loupe":"Büyüteç","loupe_only_overview":"Büyüteç yalnızca en az {sec} sn görünürken","loupe_paused":"{sec} sn'den az görünürken büyüteç duraklatılır – uzaklaşınca yeniden etkin (kapatmak için tıklayın)","loupe_tip":"Üzerine gelince büyüteci aç (~{zoom}× / {span} sn)","overview":"Genel bakış","overview_click":"Oraya atlamak için tıklayın","overview_drag":"Kaydırmak için mavi çerçeveyi sürükleyin · atlamak için dışına tıklayın","quick_back":"Tüm dosyaya dön","quick_tip":"Çalma konumu çevresinde {sec} saniye","quick_too_short":"Parça {sec} saniyeden kısa","title":"Dalga biçimi ve beat ızgarası","whole_file":"Tüm dosyayı göster","zoom_in":"Yakınlaştır","zoom_out":"Uzaklaştır"}}`)},ct=o((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),I=o(((e,t)=>{t.exports=ct()}))(),lt=[`de`,`en`,`tr`];function ut(e,t=``,n={}){if(e&&typeof e==`object`&&!Array.isArray(e))for(let[r,i]of Object.entries(e)){let e=t+r;Array.isArray(i)?n[e]=i.map(String).join(`
`):i&&typeof i==`object`?ut(i,e+`.`,n):n[e]=String(i)}return n}var dt={en:ut(ot),de:ut(at),tr:ut(st)},ft=`beatanalyzer.language`;function pt(){let e=(typeof navigator<`u`?navigator.language:`en`).slice(0,2).toLowerCase();return lt.includes(e)?e:`en`}function mt(e,t,n){let r=dt[e][t]??dt.en[t]??t;if(n)for(let[e,t]of Object.entries(n))r=r.split(`{${e}}`).join(String(t));return r}function ht(e){return dt[e][`_meta.name`]??e}function gt(e,t,n){let r=(t,n)=>mt(e,t,n),i=dt[e][`_meta.html_lang`]??e,a=new Map,o=e=>{let t=a.get(e);return t||(t=new Intl.NumberFormat(i,{minimumFractionDigits:e,maximumFractionDigits:e,useGrouping:!1}),a.set(e,t)),t};return{lang:e,setting:t,setSetting:n,t:r,num:(e,t=1)=>e==null||!Number.isFinite(e)?`–`:o(t).format(e),pct:(t,n=0)=>t==null||!Number.isFinite(t)?`–`:(dt[e][`_meta.percent`]??`{v}%`).replace(`{v}`,o(n).format(t*100)),pctValue:t=>t==null||!Number.isFinite(t)?`–`:(dt[e][`_meta.percent`]??`{v}%`).replace(`{v}`,o(0).format(Math.round(t))),meter:t=>{let n=/^(\d+)\/(\d+)/.exec(t??``);if(!n)return t??`–`;let i=dt[e][`output.meter_suffix.${n[2]}`]??``;return r(`output.meter`,{num:n[1],den:n[2],suffix:i})}}}var _t=(0,C.createContext)(gt(`de`,`auto`,()=>void 0));function vt(){try{let e=localStorage.getItem(ft);return e===`auto`||lt.includes(e??``)?e:null}catch{return null}}function yt(e){try{localStorage.setItem(ft,e)}catch{}}var bt=({children:e})=>{let[t,n]=(0,C.useState)(()=>vt()??`auto`),[r,i]=(0,C.useState)(null);(0,C.useEffect)(()=>{fetch(`/api/settings`,{signal:AbortSignal.timeout(3e3)}).then(e=>e.ok?e.json():null).then(e=>{if(!e)return;let t=e.language;(t===`auto`||lt.includes(t))&&(n(t),yt(t)),t===`auto`&&lt.includes(e.resolvedLanguage)&&i(e.resolvedLanguage)}).catch(()=>void 0)},[]);let a=(0,C.useCallback)(e=>{n(e),yt(e),fetch(`/api/settings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({language:e}),signal:AbortSignal.timeout(8e3)}).then(e=>e.ok?e.json():null).then(t=>{t&&e===`auto`&&lt.includes(t.resolvedLanguage)&&i(t.resolvedLanguage)}).catch(()=>void 0)},[]),o=t===`auto`?r??pt():t,s=(0,C.useMemo)(()=>gt(o,t,a),[o,t,a]);return(0,C.useEffect)(()=>{document.documentElement.lang=dt[o][`_meta.html_lang`]??o},[o]),(0,I.jsx)(_t.Provider,{value:s,children:e})};function xt(){return(0,C.useContext)(_t)}var St=class{constructor(){this.ctx=null,this.audioBuffer=null,this.sourceNode=null,this.gainNode=null,this.metronomeGain=null,this.isPlaying=!1,this.startTime=0,this.pauseOffset=0,this.playbackRate=1,this.metronomeEnabled=!0,this.metronomeVolume=.6,this.musicVolume=1,this.loop=null,this.lastTickTime=0,this.beats=[],this.nextBeatIndex=0,this.animFrameId=null}initContext(){return this.ctx&&this.ctx.state!==`closed`||(this.ctx=new(window.AudioContext||window.webkitAudioContext)),this.ctx.state===`suspended`&&this.ctx.resume(),this.ctx}loadBuffer(e,t){this.stop(),this.audioBuffer=e,this.beats=[...t].sort((e,t)=>e.time-t.time),this.pauseOffset=0,this.nextBeatIndex=0}updateBeats(e){this.beats=[...e].sort((e,t)=>e.time-t.time),this.updateNextBeatIndex(this.getCurrentTime())}play(e){if(!this.audioBuffer)return;let t=this.initContext();this.isPlaying&&this.stopSource(),e!==void 0&&(this.pauseOffset=Math.max(0,Math.min(e,this.audioBuffer.duration))),this.pauseOffset>=this.audioBuffer.duration&&(this.pauseOffset=0),this.sourceNode=t.createBufferSource(),this.sourceNode.buffer=this.audioBuffer,this.sourceNode.playbackRate.value=this.playbackRate,this.loop&&(this.sourceNode.loop=!0,this.sourceNode.loopStart=this.loop.start,this.sourceNode.loopEnd=this.loop.end),this.gainNode=t.createGain(),this.gainNode.gain.value=this.musicVolume,this.metronomeGain=t.createGain(),this.metronomeGain.gain.value=this.metronomeEnabled?this.metronomeVolume:0,this.sourceNode.connect(this.gainNode),this.gainNode.connect(t.destination),this.metronomeGain.connect(t.destination),this.startTime=t.currentTime-this.pauseOffset/this.playbackRate,this.sourceNode.start(0,this.pauseOffset),this.isPlaying=!0,this.updateNextBeatIndex(this.pauseOffset),this.lastTickTime=this.pauseOffset,this.sourceNode.onended=()=>{this.isPlaying&&this.getCurrentTime()>=(this.audioBuffer?.duration||0)-.1&&(this.isPlaying=!1,this.pauseOffset=0,this.cancelLoop(),this.onEnded?.())},this.startLoop()}pause(){this.isPlaying&&(this.pauseOffset=this.getCurrentTime(),this.stopSource(),this.isPlaying=!1,this.cancelLoop())}stop(){this.stopSource(),this.isPlaying=!1,this.pauseOffset=0,this.nextBeatIndex=0,this.cancelLoop(),this.onTimeUpdate?.(0,0)}seek(e){let t=this.isPlaying,n=this.audioBuffer?this.audioBuffer.duration:1,r=Math.max(0,Math.min(e,n));this.pauseOffset=r,this.updateNextBeatIndex(r),t?this.play(r):this.onTimeUpdate?.(r,r/(n||1))}setPlaybackRate(e){if(this.playbackRate=e,this.sourceNode&&this.ctx){this.sourceNode.playbackRate.value=e;let t=this.getCurrentTime();this.startTime=this.ctx.currentTime-t/e}}setMetronomeEnabled(e){this.metronomeEnabled=e,this.metronomeGain&&(this.metronomeGain.gain.value=e?this.metronomeVolume:0)}setMetronomeVolume(e){this.metronomeVolume=Math.max(0,Math.min(1,e)),this.metronomeGain&&this.metronomeEnabled&&(this.metronomeGain.gain.value=this.metronomeVolume)}setMusicVolume(e){this.musicVolume=Math.max(0,Math.min(1,e)),this.gainNode&&(this.gainNode.gain.value=this.musicVolume)}setLoop(e){let t=this.audioBuffer?.duration??0;this.loop=e&&e.end-e.start>.05?{start:Math.max(0,e.start),end:Math.min(t||e.end,e.end)}:null;let n=this.getCurrentTime();this.loop&&(n<this.loop.start||n>=this.loop.end)&&(n=this.loop.start),this.isPlaying?this.play(n):(this.pauseOffset=n,this.updateNextBeatIndex(n),this.onTimeUpdate?.(n,n/(t||1)))}getCurrentTime(){if(!this.isPlaying||!this.ctx)return this.pauseOffset;let e=Math.max(0,(this.ctx.currentTime-this.startTime)*this.playbackRate);if(this.loop&&e>=this.loop.end){let t=this.loop.end-this.loop.start;return this.loop.start+(e-this.loop.end)%t}return e}getIsPlaying(){return this.isPlaying}stopSource(){if(this.sourceNode){try{this.sourceNode.stop(),this.sourceNode.disconnect()}catch{}this.sourceNode=null}}updateNextBeatIndex(e){let t=0;for(;t<this.beats.length&&this.beats[t].time<e-.02;)t++;this.nextBeatIndex=t}startLoop(){this.cancelLoop();let e=()=>{if(!this.isPlaying||!this.audioBuffer)return;let t=this.getCurrentTime();t<this.lastTickTime-.05&&this.updateNextBeatIndex(t),this.lastTickTime=t;let n=t/this.audioBuffer.duration;for(this.onTimeUpdate?.(t,n);this.nextBeatIndex<this.beats.length&&this.beats[this.nextBeatIndex].time<=t+.025;){let e=this.beats[this.nextBeatIndex];t-e.time<.12&&(this.metronomeEnabled&&this.playClickSound(e.isDownbeat),this.onBeatTrigger?.(e)),this.nextBeatIndex++}this.animFrameId=requestAnimationFrame(e)};this.animFrameId=requestAnimationFrame(e)}cancelLoop(){this.animFrameId!==null&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null)}playClickSound(e){if(this.ctx&&this.metronomeGain)try{let t=this.ctx.createOscillator(),n=this.ctx.createGain(),r=e?1280:850,i=e?.045:.03;t.type=e?`triangle`:`sine`,t.frequency.setValueAtTime(r,this.ctx.currentTime),t.frequency.exponentialRampToValueAtTime(r*.4,this.ctx.currentTime+i),n.gain.setValueAtTime(e?1:.65,this.ctx.currentTime),n.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+i),t.connect(n),n.connect(this.metronomeGain),t.start(this.ctx.currentTime),t.stop(this.ctx.currentTime+i)}catch{}}destroy(){if(this.stop(),this.ctx){try{this.ctx.close()}catch{}this.ctx=null}}};async function Ct(e,t=`GET`,n=8e3,r){try{let i=await fetch(e,{method:t,signal:AbortSignal.timeout(n),...r===void 0?{}:{headers:{"Content-Type":`application/json`},body:JSON.stringify(r)}}),a=await i.json();if(!i.ok)throw Error(a?.error||`HTTP ${i.status}`);return a}catch(e){if(e instanceof Error&&!(e.name===`TimeoutError`||e instanceof TypeError||e instanceof SyntaxError))throw e;return null}}var wt=()=>Ct(`/api/health`,`GET`,1200),Tt=e=>Ct(`/api/settings`,`POST`,8e3,{ffmpegDir:e}),Et=()=>Ct(`/api/resolve/status`),Dt=()=>Ct(`/api/resolve/install`,`POST`),Ot=()=>Ct(`/api/update/check`,`GET`,15e3),kt=()=>Ct(`/api/update/apply`,`POST`,9e5),At=()=>{let{t:e}=xt(),[t,n]=(0,C.useState)(null),[r,i]=(0,C.useState)(!1),[a,o]=(0,C.useState)(null);return(0,C.useEffect)(()=>{Ot().then(n).catch(()=>n(null))},[]),(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsxs)(`span`,{className:`text-[11px] font-mono text-slate-500`,title:t?.error||void 0,children:[`v`,t?.current||`0.2.13`]}),t?.available&&(0,I.jsxs)(`button`,{onClick:async()=>{if(t?.latest&&window.confirm(e(`web.update.confirm`,{version:t.latest??``}))){i(!0);try{let r=await kt();o(r?r.message:e(`web.error.no_server`)),r?.updated&&n({...t,available:!1,current:r.version})}catch(e){o(e instanceof Error?e.message:String(e))}finally{i(!1)}}},disabled:r,className:`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800 hover:bg-emerald-900/60 disabled:opacity-60 cursor-pointer`,title:e(`web.update.tip`),children:[r?(0,I.jsx)(xe,{className:`w-3 h-3 animate-spin`}):(0,I.jsx)(ae,{className:`w-3 h-3`}),(0,I.jsx)(`span`,{children:r?e(`web.update.running`):e(`web.update.button`,{version:t.latest??``})})]}),a&&(0,I.jsx)(`span`,{role:`status`,className:`text-[11px] text-amber-300 max-w-xs`,children:a})]})},jt=({result:e,selectedModel:t,serverEngine:n,onReset:r,onOpenExport:i,onOpenModelInfo:a,onOpenLocalSetup:o})=>{let{t:s,setting:c,setSetting:l}=xt(),u=e?.selectedModel??t,d=Mt(e,n??null,u,s);return(0,I.jsx)(`header`,{className:`border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all`,children:(0,I.jsxs)(`div`,{className:`max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,I.jsx)(`div`,{className:`relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20`,children:(0,I.jsx)(ee,{className:`w-5 h-5 text-white animate-pulse`})}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`div`,{className:`flex items-center gap-2`,children:(0,I.jsxs)(`h1`,{className:`text-lg font-bold tracking-tight text-white flex items-center gap-1.5`,children:[`BeatAnalyzer`,(0,I.jsx)(`span`,{className:`text-xs px-2 py-0.5 rounded-full font-medium border ${d.tone===`ok`?`bg-cyan-950 text-cyan-300 border-cyan-800/80`:d.tone===`nc`?`bg-amber-950/90 text-amber-300 border-amber-700/80`:`bg-rose-950/80 text-rose-300 border-rose-800/80`}`,title:d.tip,children:d.text})]})}),(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center gap-x-3`,children:[(0,I.jsx)(`p`,{className:`text-xs text-slate-400`,children:s(`web.header.subtitle`)}),(0,I.jsx)(At,{})]})]})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsxs)(`label`,{className:`flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-300 bg-slate-800/80 border border-slate-700/80`,title:s(`web.header.language_tip`),children:[(0,I.jsx)(N,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,I.jsx)(`span`,{className:`sr-only`,children:s(`web.header.language`)}),(0,I.jsxs)(`select`,{value:c,onChange:e=>l(e.target.value),className:`bg-transparent text-slate-200 focus:outline-none cursor-pointer`,"aria-label":s(`web.header.language`),children:[(0,I.jsx)(`option`,{value:`auto`,className:`bg-slate-900`,children:s(`web.header.language_system`)}),lt.map(e=>(0,I.jsx)(`option`,{value:e,className:`bg-slate-900`,children:ht(e)},e))]})]}),(0,I.jsxs)(`button`,{onClick:o,className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 transition-colors shadow-sm cursor-pointer`,title:s(`web.header.local_tip`),children:[(0,I.jsx)(Le,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,I.jsx)(`span`,{className:`hidden sm:inline`,children:s(`web.header.local`)})]}),(0,I.jsxs)(`button`,{onClick:a,className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition-colors shadow-sm`,title:s(`web.header.model_info_tip`),children:[(0,I.jsx)(te,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,I.jsx)(`span`,{className:`hidden sm:inline`,children:s(`web.header.model_info`)})]}),(0,I.jsxs)(`a`,{href:`https://github.com/CPJKU/beat_this`,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors`,title:s(`web.header.github_tip`),children:[(0,I.jsx)(`span`,{className:`hidden md:inline`,children:`GitHub`}),(0,I.jsx)(de,{className:`w-3.5 h-3.5`})]}),e&&(0,I.jsxs)(I.Fragment,{children:[(0,I.jsxs)(`button`,{onClick:i,className:`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-indigo-900/30 transition-all cursor-pointer`,children:[(0,I.jsx)(A,{className:`w-3.5 h-3.5`}),(0,I.jsx)(`span`,{children:s(`web.header.export`)})]}),(0,I.jsxs)(`button`,{onClick:r,className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer`,title:s(`web.header.new_file_tip`),children:[(0,I.jsx)(De,{className:`w-3.5 h-3.5 text-slate-400`}),(0,I.jsx)(`span`,{className:`hidden sm:inline`,children:s(`web.header.new_file`)})]})]})]})]})})};function Mt(e,t,n,r){if(e&&e.engine?.startsWith(`Browser`))return{text:r(`web.engine.browser_result`),tip:r(`web.engine.browser_tip`),tone:`fallback`};let i=e?e.engineInfo??null:t;if(!i)return e?{text:e.engine||`?`,tip:``,tone:`ok`}:{text:r(`web.engine.no_server`),tip:r(`web.engine.no_server_tip`),tone:`fallback`};if(i.id===`librosa`){let e=i.fallbackReason?r(`web.engine.reason_${i.fallbackReason}`,{model:n}):``;return{text:`${r(`web.engine.librosa`)}${e?` – ${e}`:``}`,tip:r(`web.engine.librosa_tip`),tone:`fallback`}}let a=i.device?i.device.toUpperCase()+(i.gpu?` (${i.gpu.replace(/^NVIDIA (GeForce )?/,``)})`:``):``,o=i.model?r(i.model.commercial?`web.engine.licence`:`web.engine.licence_nc`,{name:i.model.name,license:i.model.license}):``;return{text:`${i.id}${a?` · ${a}`:``}`,tip:o,tone:i.id===`md_beat_this`?`nc`:`ok`}}var Nt=[{id:`house_126`,name:`Electro Club Drive`,genre:`Electronic / House`,bpm:126,meter:`4/4`,duration:16,description:`Classic four-on-the-floor beat, strong kick on every beat, snare/clap on 2 and 4.`},{id:`waltz_150`,name:`Wiener Walzer Elegance`,genre:`Klassik / Walzer`,bpm:150,meter:`3/4`,duration:15,description:`Clear 3/4 time (boom-chick-chick) with an accented one, to check the time signature detection.`},{id:`funk_108`,name:`Midnight Funk Session`,genre:`Funk & Soul`,bpm:108,meter:`4/4 (Swing)`,duration:18,description:`Syncopated bass groove, ghost notes and a light swing feel.`},{id:`lofi_85`,name:`Chill Coffee Lo-Fi`,genre:`Lo-Fi Hip Hop`,bpm:85,meter:`4/4`,duration:20,description:`Relaxed downtempo boom-bap with warm Rhodes chords.`}];function Pt(e){let t=Nt.find(t=>t.id===e)||Nt[0],n=44100,r=Math.floor(n*t.duration),i=new Float32Array(r),a=new Float32Array(r),o=60/t.bpm,s=Math.floor(n*o),c=t.meter.startsWith(`3/4`),l=c?3:4,u=Math.floor(r/s);for(let e=0;e<u;e++){let t=e*s,o=e%l+1,u=o===1,d=15434,f=u?140:110,p=u?.85:c?.3:.65;for(let e=0;e<d&&t+e<r;e++){let r=e/n,o=e/d,s=f*Math.exp(-o*7)+40,c=(1-o)**2,l=Math.sin(2*Math.PI*s*r)*c*p;i[t+e]+=l*.9,a[t+e]+=l*.9}if(!c&&(o===2||o===4)){let e=11025;for(let o=0;o<e&&t+o<r;o++){let r=(1-o/e)**2.5,s=((Math.random()*2-1)*.45+Math.sin(2*Math.PI*190*(o/n))*.4)*r;i[t+o]+=s*.7,a[t+o]+=s*.7}}else if(c&&(o===2||o===3)){let e=13230;for(let o=0;o<e&&t+o<r;o++){let r=o/n,s=(1-o/e)**2,c=Math.sin(2*Math.PI*440*r)*.2+Math.sin(2*Math.PI*554.37*r)*.2+Math.sin(2*Math.PI*659.25*r)*.2;i[t+o]+=c*s*.6,a[t+o]+=c*s*.6}}let m=2205,h=t+Math.floor(s*.5);for(let e=0;e<m&&h+e<r;e++){let t=(1-e/m)**3,n=(Math.random()*2-1)*t*.25;i[h+e]+=n,a[h+e]+=n}let g=17640,_=u?55:o===3?65.41:48.99;for(let e=0;e<g&&t+e<r;e++){let r=e/n,o=Math.max(0,1-e/g),s=Math.sin(2*Math.PI*_*r)*.35*o;i[t+e]+=s,a[t+e]+=s}}for(let e=0;e<r;e++)i[e]=Math.tanh(i[e]),a[e]=Math.tanh(a[e]);return Ft(i,a,n)}function Ft(e,t,n){let r=n*4,i=e.length*4,a=44+i,o=new ArrayBuffer(a),s=new DataView(o);It(s,0,`RIFF`),s.setUint32(4,a-8,!0),It(s,8,`WAVE`),It(s,12,`fmt `),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,2,!0),s.setUint32(24,n,!0),s.setUint32(28,r,!0),s.setUint16(32,4,!0),s.setUint16(34,16,!0),It(s,36,`data`),s.setUint32(40,i,!0);let c=44;for(let n=0;n<e.length;n++){let r=Math.max(-1,Math.min(1,e[n]));s.setInt16(c,r<0?r*32768:r*32767,!0),c+=2;let i=Math.max(-1,Math.min(1,t[n]));s.setInt16(c,i<0?i*32768:i*32767,!0),c+=2}return new Blob([o],{type:`audio/wav`})}function It(e,t,n){for(let r=0;r<n.length;r++)e.setUint8(t+r,n.charCodeAt(r))}var Lt=({onFileSelected:e,isAnalyzing:t,progress:n,stageText:r,error:i,selectedModel:a,onSelectModel:o,onOpenMdSetup:s,backendHealth:c})=>{let{t:l,pctValue:u}=xt(),[d,f]=(0,C.useState)(!1),p=(0,C.useRef)(null),m=e=>{t||o(e)},h=e=>{e.preventDefault(),f(!0)},g=e=>{e.preventDefault(),f(!1)},_=t=>{if(t.preventDefault(),f(!1),t.dataTransfer.files&&t.dataTransfer.files.length>0){let n=t.dataTransfer.files[0];e(n,n.name)}},v=t=>{if(t.target.files&&t.target.files.length>0){let n=t.target.files[0];e(n,n.name)}},y=t=>{let n=Nt.find(e=>e.id===t);n&&e(Pt(t),`${n.name}.wav`)},b=c?.md_beat_this_installed,x=c?.beat_this_installed;return(0,I.jsxs)(`div`,{className:`max-w-4xl mx-auto space-y-8 py-6`,children:[(0,I.jsxs)(`div`,{className:`text-center space-y-3`,children:[(0,I.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-semibold tracking-wide uppercase`,children:[(0,I.jsx)(Fe,{className:`w-3.5 h-3.5`}),l(`web.upload.badge`)]}),(0,I.jsxs)(`h2`,{className:`text-3xl sm:text-4xl font-extrabold text-white tracking-tight`,children:[l(`web.upload.title`),` `,(0,I.jsx)(`span`,{className:`bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent`,children:`BeatAnalyzer`})]}),(0,I.jsx)(`p`,{className:`text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed`,children:l(`web.upload.intro`)})]}),(0,I.jsxs)(`div`,{className:`space-y-3`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between px-1`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(k,{className:`w-4 h-4 text-cyan-400`}),(0,I.jsx)(`h3`,{className:`text-xs font-bold uppercase tracking-wider text-slate-300`,children:l(`web.upload.choose_model`)})]}),(0,I.jsx)(`span`,{className:`text-[11px] text-slate-500`,children:l(c?`web.upload.server_connected`:`web.upload.browser_active`)})]}),(0,I.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-3`,role:`radiogroup`,"aria-label":`Analyse-Modell`,children:[(0,I.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":a===`beat_this`,disabled:t,onClick:()=>m(`beat_this`),className:`text-left p-4 rounded-xl border transition-all cursor-pointer disabled:opacity-60 ${a===`beat_this`?`bg-cyan-950/35 border-cyan-500/80 shadow-lg shadow-cyan-950/40`:`bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900`}`,children:(0,I.jsxs)(`div`,{className:`flex items-start justify-between gap-2`,children:[(0,I.jsxs)(`div`,{className:`space-y-1`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 flex-wrap`,children:[(0,I.jsx)(`span`,{className:`text-sm font-bold text-white`,children:`CPJKU beat_this`}),(0,I.jsx)(`span`,{className:`text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60`,children:l(`web.upload.mit`)})]}),(0,I.jsx)(`p`,{className:`text-xs text-slate-400 leading-relaxed`,children:l(`web.upload.beat_this_text`)}),c&&(0,I.jsxs)(`p`,{className:`text-[11px] text-slate-500 pt-0.5`,children:[l(`web.upload.local`),` `,(0,I.jsx)(`span`,{className:x?`text-emerald-400`:`text-slate-400`,children:l(x?`web.upload.installed`:`web.upload.not_installed_librosa`)})]})]}),a===`beat_this`&&(0,I.jsx)(oe,{className:`w-5 h-5 text-cyan-400 shrink-0 mt-0.5`})]})}),(0,I.jsxs)(`div`,{className:`rounded-xl border transition-all flex items-stretch justify-between ${a===`md_beat_this`?`bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-950/30`:`bg-slate-900/70 border-slate-800 hover:border-amber-700/60 hover:bg-slate-900`} ${t?`opacity-60`:``}`,children:[(0,I.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":a===`md_beat_this`,disabled:t,onClick:()=>m(`md_beat_this`),className:`flex-1 text-left p-4 pr-2 cursor-pointer disabled:cursor-not-allowed rounded-l-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`,children:(0,I.jsxs)(`div`,{className:`space-y-1`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 flex-wrap`,children:[(0,I.jsx)(`span`,{className:`text-sm font-bold text-white`,children:`Masked Diffusion (md_beat_this)`}),(0,I.jsx)(`span`,{className:`text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/70`,children:l(`web.upload.nc_only`)})]}),(0,I.jsxs)(`p`,{className:`text-xs text-slate-400 leading-relaxed`,children:[l(`web.upload.md_text`),` (`,(0,I.jsx)(`span`,{className:`font-mono text-slate-300`,children:`CC BY-NC 4.0`}),`).`]}),c&&(0,I.jsxs)(`p`,{className:`text-[11px] text-slate-500 pt-0.5`,children:[l(`web.upload.local`),` `,(0,I.jsx)(`span`,{className:b?`text-emerald-400`:`text-amber-300`,children:l(b?`web.upload.installed`:`web.upload.not_installed_fallback`)})]})]})}),(0,I.jsxs)(`div`,{className:`flex items-start gap-1 p-3 pl-1 shrink-0`,children:[(0,I.jsx)(`button`,{type:`button`,disabled:t,onClick:s,"aria-label":l(`web.upload.md_setup`),title:l(`web.upload.md_setup`),className:`p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/60 border border-transparent hover:border-amber-700/60 transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`,children:(0,I.jsx)(Me,{className:`w-4 h-4`})}),a===`md_beat_this`&&(0,I.jsx)(`div`,{className:`p-1.5 text-amber-400`,"aria-hidden":`true`,children:(0,I.jsx)(oe,{className:`w-5 h-5`})})]})]})]}),a===`md_beat_this`&&(0,I.jsxs)(`div`,{className:`px-3.5 py-2 rounded-xl bg-amber-950/35 border border-amber-600/60 text-xs flex items-center gap-2`,children:[(0,I.jsx)(ze,{className:`w-3.5 h-3.5 text-amber-400 shrink-0`}),(0,I.jsx)(`p`,{className:`text-amber-200 font-medium`,children:l(`web.upload.md_notice`)})]})]}),i&&(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3 shadow-lg`,children:[(0,I.jsx)(ie,{className:`w-5 h-5 text-rose-400 shrink-0 mt-0.5`}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`p`,{className:`font-semibold text-rose-200`,children:l(`web.upload.error_title`)}),(0,I.jsx)(`p`,{className:`text-xs text-rose-300/90 mt-0.5`,children:i})]})]}),t?(0,I.jsxs)(`div`,{className:`p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6`,children:[(0,I.jsxs)(`div`,{className:`relative flex items-center justify-center w-20 h-20 mx-auto`,children:[(0,I.jsx)(`div`,{className:`absolute inset-0 rounded-full border-4 border-slate-800 animate-pulse`}),(0,I.jsx)(`div`,{className:`absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin`,style:{animationDuration:`1.2s`}}),(0,I.jsx)(P,{className:`w-8 h-8 text-cyan-400 animate-bounce`})]}),(0,I.jsxs)(`div`,{className:`space-y-2 max-w-md mx-auto`,children:[(0,I.jsx)(`h3`,{className:`text-lg font-bold text-white`,children:l(`web.upload.analysing`)}),(0,I.jsx)(`p`,{className:`text-xs text-cyan-300 font-mono h-5 transition-all`,children:r||l(`web.upload.analysing`)}),(0,I.jsx)(`div`,{className:`w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mt-4`,children:(0,I.jsx)(`div`,{className:`bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50`,style:{width:`${Math.max(5,n)}%`}})}),(0,I.jsxs)(`div`,{className:`flex justify-between text-[11px] text-slate-500 font-mono pt-1`,children:[(0,I.jsx)(`span`,{children:`Beats`}),(0,I.jsx)(`span`,{children:u(n)}),(0,I.jsx)(`span`,{children:`Downbeats`})]})]})]}):(0,I.jsxs)(`div`,{onDragOver:h,onDragLeave:g,onDrop:_,onClick:()=>p.current?.click(),className:`relative group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 shadow-xl ${d?`border-cyan-400 bg-cyan-950/20 scale-[1.01]`:`border-slate-750 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-600`}`,children:[(0,I.jsx)(`input`,{ref:p,type:`file`,accept:`.mp3,.wav,.flac,.aac,.m4a,.ogg,audio/*`,className:`hidden`,onChange:v}),(0,I.jsxs)(`div`,{className:`flex flex-col items-center gap-4`,children:[(0,I.jsx)(`div`,{className:`w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-950/60 group-hover:text-cyan-300 group-hover:border-cyan-700 transition-all shadow-inner`,children:(0,I.jsx)(Be,{className:`w-8 h-8`})}),(0,I.jsxs)(`div`,{className:`space-y-1`,children:[(0,I.jsxs)(`p`,{className:`text-base font-semibold text-white`,children:[l(`web.upload.drop`),` `,(0,I.jsx)(`span`,{className:`text-cyan-400 underline underline-offset-4 decoration-cyan-500/50 group-hover:decoration-cyan-400`,children:l(`web.upload.browse`)})]}),(0,I.jsx)(`p`,{className:`text-xs text-slate-400`,children:l(`web.upload.drop_hint`)})]}),(0,I.jsx)(`div`,{className:`flex flex-wrap items-center justify-center gap-2 pt-2`,children:[`MP3`,`WAV`,`FLAC`,`AAC / M4A`,`OGG`].map(e=>(0,I.jsx)(`span`,{className:`px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60`,children:e},e))})]})]}),(0,I.jsxs)(`div`,{className:`space-y-3 pt-4`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(fe,{className:`w-4 h-4 text-cyan-400`}),(0,I.jsx)(`h3`,{className:`text-sm font-bold text-slate-200`,children:l(`web.upload.demo_title`)})]}),(0,I.jsx)(`span`,{className:`text-xs text-slate-500`,children:l(`web.upload.demo_hint`)})]}),(0,I.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-3`,children:Nt.map(e=>(0,I.jsxs)(`div`,{onClick:()=>y(e.id),className:`group p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-600/60 hover:bg-slate-850/90 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,I.jsx)(`div`,{className:`w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors`,children:(0,I.jsx)(we,{className:`w-4 h-4 ml-0.5 fill-current`})}),(0,I.jsxs)(`div`,{children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(`h4`,{className:`text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors`,children:e.name}),(0,I.jsxs)(`span`,{className:`text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700`,children:[e.bpm,` BPM`]})]}),(0,I.jsxs)(`p`,{className:`text-xs text-slate-400`,children:[l(`web.sample.${e.id}`),` • `,(0,I.jsx)(`span`,{className:`text-indigo-300 font-mono`,children:e.meter})]})]})]}),(0,I.jsx)(`div`,{className:`text-slate-600 group-hover:text-cyan-400 transition-colors`,children:(0,I.jsx)(E,{className:`w-4 h-4`})})]},e.id))})]})]})},Rt=e=>Math.round((e-.5)*200),zt=e=>Math.round((.5+e/200)*1e3)/1e3,Bt=300,Vt=({result:e,smoothBars:t,protect:n,busyText:r,error:i,onChangeSmoothing:a})=>{let{t:o,num:s,pctValue:c,meter:l}=xt(),u=o(`plugin.smooth_tip`),d=e.activationSource===`beat_this`||e.activationSource===`md_beat_this`,f=r!==null,p=t?Math.max(1,Rt(n)):0,[m,h]=(0,C.useState)(p),[g,_]=(0,C.useState)(!1),v=(0,C.useRef)(null),y=(0,C.useRef)(!1),b=!d||f;(0,C.useEffect)(()=>h(p),[p,e]),(0,C.useEffect)(()=>{i&&h(p)},[i]),(0,C.useEffect)(()=>{let e=()=>_(!1);return window.addEventListener(`pointerup`,e),window.addEventListener(`pointercancel`,e),()=>{window.removeEventListener(`pointerup`,e),window.removeEventListener(`pointercancel`,e)}},[]),(0,C.useEffect)(()=>{if(g||b||m===p)return;let e=setTimeout(()=>{y.current=document.activeElement===v.current,a(m>0,m>0?zt(m):n)},Bt);return()=>clearTimeout(e)},[m,g,b,p]),(0,C.useEffect)(()=>{!f&&y.current&&(y.current=!1,v.current?.focus())},[f]);let x=e=>{let t=Math.floor(e/60),n=Math.floor(e%60),r=Math.floor(e%1*10);return`${t.toString().padStart(2,`0`)}:${n.toString().padStart(2,`0`)}.${r}`},S=e=>o(`web.metrics.tempo_${e<60?`largo`:e<76?`adagio`:e<108?`andante`:e<120?`moderato`:e<156?`allegro`:e<176?`vivace`:`presto`}`),w=l(`${e.timeSignature.numerator}/${e.timeSignature.denominator}`),T=e.beats.length>1?Math.round(e.beats.slice(1).reduce((e,t)=>e+t.deltaMs,0)/(e.beats.length-1)):500;return(0,I.jsxs)(`div`,{className:`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3`,children:[(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all`,children:[(0,I.jsx)(`div`,{className:`absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl -mr-4 -mt-4`}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1`,children:[(0,I.jsx)(_e,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,I.jsx)(`span`,{children:o(`web.metrics.tempo`)})]}),(0,I.jsxs)(`div`,{className:`flex items-baseline gap-1.5`,children:[(0,I.jsx)(`span`,{className:`text-2xl lg:text-3xl font-extrabold text-white tracking-tight`,children:s(e.globalBpm,1)}),(0,I.jsx)(`span`,{className:`text-xs font-semibold text-cyan-400`,children:`BPM`})]}),(0,I.jsx)(`div`,{className:`text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2`,children:S(e.globalBpm)})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all`,children:[(0,I.jsx)(`div`,{className:`absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl -mr-4 -mt-4`}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1`,children:[(0,I.jsx)(F,{className:`w-3.5 h-3.5 text-purple-400`}),(0,I.jsx)(`span`,{children:o(`web.metrics.meter`)})]}),(0,I.jsxs)(`div`,{className:`flex flex-wrap items-baseline gap-x-1.5 gap-y-1`,children:[(0,I.jsx)(`span`,{className:`${w.length>5?`text-2xl`:`text-2xl lg:text-3xl`} font-extrabold text-white tracking-tight whitespace-nowrap`,children:w}),(0,I.jsx)(`span`,{className:`text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 whitespace-nowrap shrink-0`,children:e.timeSignature.barShare===null?`–`:o(`web.metrics.bar_share`,{share:c(e.timeSignature.barShare)})})]}),d&&(0,I.jsx)(`div`,{className:`text-[11px] text-slate-400 mt-1 leading-snug min-h-[2lh]`,children:e.barSmoothing?.applied?(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(`span`,{className:`block`,children:o(`web.metrics.changed_beats`,{n:e.barSmoothing.changedBeats})}),(0,I.jsx)(`span`,{className:`block`,children:o(`web.metrics.reanchors`,{n:e.barSmoothing.reanchors})})]}):o(`web.metrics.not_smoothed`)}),d&&(0,I.jsxs)(`label`,{className:`mt-2 block text-[11px] ${b?`text-slate-600`:`text-slate-300`}`,title:u,children:[(0,I.jsxs)(`span`,{className:`flex items-baseline justify-between gap-2`,children:[(0,I.jsx)(`span`,{children:o(`plugin.smooth_label`)}),(0,I.jsx)(`span`,{className:`whitespace-nowrap tabular-nums`,children:m===0?o(`plugin.smooth_off`):c(m)})]}),(0,I.jsx)(`input`,{type:`range`,min:0,max:100,step:1,value:m,disabled:b,"aria-label":o(`plugin.smooth_label`),className:`mt-1 block w-full min-w-0 accent-purple-500`,ref:v,onChange:e=>h(Number(e.target.value)),onPointerDown:()=>_(!0)})]}),(0,I.jsx)(`div`,{className:`text-[10px] mt-1 h-[1lh] truncate ${f?`text-purple-300`:`text-rose-400`}`,title:f?r??``:i?o(`web.metrics.reanalysis_failed`,{message:i}):``,children:f?r:i?o(`web.metrics.reanalysis_failed`,{message:i}):``})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all`,children:[(0,I.jsx)(`div`,{className:`absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -mr-4 -mt-4`}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1`,children:[(0,I.jsx)(ue,{className:`w-3.5 h-3.5 text-rose-400`}),(0,I.jsx)(`span`,{children:o(`web.metrics.bars`)})]}),(0,I.jsxs)(`div`,{className:`flex items-baseline gap-1.5`,children:[(0,I.jsx)(`span`,{className:`text-2xl lg:text-3xl font-extrabold text-white tracking-tight`,children:e.totalBars}),(0,I.jsx)(`span`,{className:`text-xs font-semibold text-rose-400`,children:o(`web.metrics.bars_unit`)})]}),(0,I.jsx)(`div`,{className:`text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2`,children:o(`web.metrics.beats_total`,{n:e.totalBeats})})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all`,children:[(0,I.jsx)(`div`,{className:`absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-4 -mt-4`}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1`,children:[(0,I.jsx)(We,{className:`w-3.5 h-3.5 text-emerald-400`}),(0,I.jsx)(`span`,{children:o(`web.metrics.stability`)})]}),(0,I.jsx)(`div`,{className:`flex items-baseline gap-1.5`,children:(0,I.jsx)(`span`,{className:`text-2xl lg:text-3xl font-extrabold text-white tracking-tight`,children:c(e.tempoStability)})}),(0,I.jsx)(`div`,{className:`text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2`,children:e.tempoStability>92?o(`web.metrics.stability_click`):e.tempoStability>80?o(`web.metrics.stability_groove`):o(`web.metrics.stability_varies`)})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all`,children:[(0,I.jsx)(`div`,{className:`absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl -mr-4 -mt-4`}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1`,children:[(0,I.jsx)(se,{className:`w-3.5 h-3.5 text-amber-400`}),(0,I.jsx)(`span`,{children:o(`web.metrics.interval`)})]}),(0,I.jsxs)(`div`,{className:`flex items-baseline gap-1.5`,children:[(0,I.jsx)(`span`,{className:`text-2xl lg:text-3xl font-extrabold text-white tracking-tight`,children:T}),(0,I.jsx)(`span`,{className:`text-xs font-semibold text-amber-400`,children:`ms`})]}),(0,I.jsx)(`div`,{className:`text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2`,children:e.swingRatio>55?o(`web.metrics.swing`,{swing:c(e.swingRatio)}):o(`web.metrics.straight`)})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-all`,children:[(0,I.jsx)(`div`,{className:`absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-full blur-xl -mr-4 -mt-4`}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1`,children:[(0,I.jsx)(Ee,{className:`w-3.5 h-3.5 text-sky-400`}),(0,I.jsx)(`span`,{children:o(`web.metrics.audio`)})]}),(0,I.jsx)(`div`,{className:`flex items-baseline gap-1.5`,children:(0,I.jsx)(`span`,{className:`text-xl lg:text-2xl font-extrabold text-white tracking-tight`,children:x(e.metadata.duration)})}),(0,I.jsxs)(`div`,{className:`text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2`,children:[e.metadata.format,` • `,s(e.metadata.sampleRate/1e3,1),` kHz`]})]})]})},Ht=45,Ut=5,Wt=3,Gt=12,Kt=264,qt=82,L=108,Jt=[5,15,30,60],Yt=[.1,.25,.5,1,2,5,10,15,30,60,120,300],Xt=64,Zt=64,Qt=14;function $t(e){let t=e.filter(e=>e.isDownbeat).map(e=>e.time),n=t.slice(1).map((e,n)=>e-t[n]).filter(e=>e>0).sort((e,t)=>e-t);return n.length?n[Math.floor(n.length/2)]:2}var en=256;function tn(e){let t=Array.from({length:e.numberOfChannels},(t,n)=>e.getChannelData(n)),n=Math.ceil(e.length/en),r=new Float32Array(n),i=new Float32Array(n),a=new Float32Array(n),o=1e-9;for(let s=0;s<n;s++){let n=s*en,c=Math.min(e.length,n+en),l=0,u=0,d=0;for(let e=n;e<c;e++){let n=0;for(let r of t)n+=r[e];n/=t.length,n<l&&(l=n),n>u&&(u=n),d+=n*n}r[s]=l,i[s]=u,a[s]=Math.sqrt(d/Math.max(1,c-n)),o=Math.max(o,u,-l)}for(let e=0;e<n;e++)r[e]/=o,i[e]/=o,a[e]/=o;return{min:r,max:i,rms:a,blockSec:en/e.sampleRate}}function nn(e,t,n,r,i,a,o){let s=t.min.length;for(let c=0;c<i;c++){let l=Math.max(0,Math.floor((n+c/i*r)/t.blockSec)),u=Math.min(s,Math.max(l+1,Math.floor((n+(c+1)/i*r)/t.blockSec)));if(l>=s)break;let d=0,f=0,p=0;for(let e=l;e<u;e++)t.min[e]<d&&(d=t.min[e]),t.max[e]>f&&(f=t.max[e]),t.rms[e]>p&&(p=t.rms[e]);e.fillStyle=`rgba(56, 189, 248, 0.45)`,e.fillRect(c,a-f*o,1,Math.max(1,(f-d)*o)),e.fillStyle=`rgba(186, 230, 253, 0.85)`,e.fillRect(c,a-p*o,1,Math.max(1,2*p*o))}}function rn(e){let t=Math.round(Math.max(0,e));return`${Math.floor(t/60)}:${String(t%60).padStart(2,`0`)}`}function an(e){let t=Math.max(0,e);return`${Math.floor(t/60)}:${(t%60).toFixed(3).padStart(6,`0`)}`}var on=({result:e,audioBuffer:t,loopRange:n,onViewChange:r,followPlayhead:i=!0,currentTime:a,onSeek:o,activeBeat:s})=>{let c=(0,C.useRef)(null),{t:l,num:u}=xt(),d=(0,C.useMemo)(()=>(c.current=null,t?tn(t):null),[t]),f=(0,C.useRef)(null),p=(0,C.useRef)(null),m=(0,C.useRef)(null),h=(0,C.useRef)(null),[g,_]=(0,C.useState)(1),[v,y]=(0,C.useState)(0),[b,x]=(0,C.useState)(!0),[S,w]=(0,C.useState)(!0),[T,ee]=(0,C.useState)(!0),[E,te]=(0,C.useState)(!1),[ne,re]=(0,C.useState)(!1),[D,ie]=(0,C.useState)(`none`),[ae,oe]=(0,C.useState)(!1),O=(0,C.useRef)(null),se=(0,C.useRef)(a),[ce,le]=(0,C.useState)(800),[k,ue]=(0,C.useState)(null),A=e.metadata.duration||1,de=Math.max(16,A/Jt[0]),j=A/g;(0,C.useEffect)(()=>{r?.(v,Math.min(A,v+j))},[v,j,A,r]);let fe=Jt.find(e=>A>e&&Math.abs(j-e)<.25)??null,pe=e.activationCurve.some(e=>e.downbeatActivation!==null),me=e.engineInfo?.id===`md_beat_this`||e.selectedModel===`md_beat_this`,he=l(pe?`web.wave.daf_tip`:me?`web.wave.daf_md`:`web.wave.daf_none`),ge=e.activationSource===`onset`?l(`web.wave.baf_onset`):l(`web.wave.baf_tip`),_e=j>=Ht,ve=E&&_e,M=Math.max(320,ce),N=Kt/M*j/Ut,ye=Math.min(A,Math.round(Math.max(Wt,Math.min(Gt,N))*2)/2),be=Kt/Math.max(.5,ye)/(M/Math.max(.5,j));(0,C.useEffect)(()=>{let e=Math.abs(a-se.current)>1e-4;if(se.current=a,e&&D!==`pan`&&i&&(a<v||a>v+j)){let e=Math.max(0,Math.min(a-j*.35,A-j));y(e)}},[a,j,A,v,D,i]);let xe=(0,C.useCallback)(()=>{let t=p.current;if(!t)return;let r=t.getContext(`2d`);if(!r)return;let i=t.width,o=t.height;r.clearRect(0,0,i,o);let s=r.createLinearGradient(0,0,0,o);s.addColorStop(0,`#0b1120`),s.addColorStop(1,`#030712`),r.fillStyle=s,r.fillRect(0,0,i,o),r.strokeStyle=`#1e293b`,r.lineWidth=1;let u=i/j,f=Yt.find(e=>e*u>=Xt)??Yt[Yt.length-1],m=Math.floor(v/f)*f;r.font=`10px Inter, monospace`,r.fillStyle=`#64748b`;for(let e=m;e<=v+j;e+=f){let t=(e-v)/j*i;if(t>=0&&t<=i){r.beginPath(),r.moveTo(t,0),r.lineTo(t,o),r.stroke();let n=Math.round(e*100)/100,i=Math.floor(n/60),a=f<1?f<.5?2:1:0,s=(n%60).toFixed(a);r.fillText(`${i}:${s.padStart(a?3+a:2,`0`)}`,t+4,o-6)}}let h=e.waveformPeaks,g=d?0:h.length/2,_=o*.45,y=o*.35;if(d){let e=`${v}|${j}|${i}|${o}`,t=c.current;if(!t||t.key!==e){let n=t?.canvas??document.createElement(`canvas`);n.width=i,n.height=o;let r=n.getContext(`2d`);r&&(r.clearRect(0,0,i,o),nn(r,d,v,j,i,_,y)),t={key:e,canvas:n},c.current=t}r.drawImage(t.canvas,0,0)}r.strokeStyle=`#38bdf8`,r.fillStyle=`rgba(56, 189, 248, 0.22)`,r.lineWidth=1.5,r.beginPath();let x=Math.floor(v/A*g),C=Math.ceil((v+j)/A*g),w=!0;for(let e=Math.max(0,x);e<Math.min(g,C);e++){let t=(e/g*A-v)/j*i,n=_-h[e*2+1]*y;w?(r.moveTo(t,n),w=!1):r.lineTo(t,n)}for(let e=Math.min(g-1,C-1);e>=Math.max(0,x);e--){let t=(e/g*A-v)/j*i,n=_-h[e*2]*y;r.lineTo(t,n)}r.closePath(),d||(r.fill(),r.stroke());let ee=e.activationCurve,E=o*.88,te=o*.28;if(b&&ee.length>0){r.strokeStyle=`rgba(34, 211, 238, 0.85)`,r.lineWidth=1.5,r.beginPath();let e=!0;for(let t=0;t<ee.length;t++){let n=ee[t];if(n.time<v-.5)continue;if(n.time>v+j+.5)break;let a=(n.time-v)/j*i,o=E-n.beatActivation*te;e?(r.moveTo(a,o),e=!1):r.lineTo(a,o)}r.stroke()}if(S&&ee.length>0){r.strokeStyle=`rgba(244, 63, 94, 0.85)`,r.lineWidth=1.8,r.beginPath();let e=!0;for(let t=0;t<ee.length;t++){let n=ee[t];if(n.downbeatActivation===null||n.time<v-.5)continue;if(n.time>v+j+.5)break;let a=(n.time-v)/j*i,o=E-n.downbeatActivation*te;e?(r.moveTo(a,o),e=!1):r.lineTo(a,o)}r.stroke()}if(T){let t=$t(e.beats),n=1;for(;n*t*u<Zt&&n<1024;)n*=2;let a=t/Math.max(1,e.timeSignature.numerator||4)*u,s=t*u,c=[];e.beats.forEach(e=>{if(e.time<v-.2||e.time>v+j+.2)return;let t=(e.time-v)/j*i;e.isDownbeat?(r.strokeStyle=s>=24?`#f43f5e`:`rgba(244, 63, 94, 0.55)`,r.lineWidth=s>=24?2.5:1,r.beginPath(),r.moveTo(t,0),r.lineTo(t,o),r.stroke(),(e.barIndex-1)%n==0&&c.push({x:t,bar:e.barIndex})):(r.strokeStyle=`rgba(56, 189, 248, 0.45)`,r.lineWidth=1,r.beginPath(),r.moveTo(t,22),r.lineTo(t,o-16),r.stroke(),a>=Qt&&(r.fillStyle=`#94a3b8`,r.font=`9px Inter, monospace`,r.fillText(`${e.beatInBar}`,t+3,34)))}),r.font=`bold 10px Inter, sans-serif`;for(let e of c){let t=l(`output.marker_downbeat`,{bar:e.bar});r.fillStyle=`#f43f5e`,r.fillRect(e.x-1,0,Math.ceil(r.measureText(t).width)+9,18),r.fillStyle=`#ffffff`,r.fillText(t,e.x+4,13)}}if(ve&&k){let e=Math.min(ye,A),t=Math.max(0,Math.min(k.time-e/2,A-e)),n=t+e,a=Math.max(0,(t-v)/j*i),s=Math.min(i,(n-v)/j*i),c=(k.time-v)/j*i;r.fillStyle=`rgba(56, 189, 248, 0.10)`,r.fillRect(a,0,Math.max(2,s-a),o),r.strokeStyle=`rgba(56, 189, 248, 0.55)`,r.lineWidth=1,r.strokeRect(a,1,Math.max(2,s-a),o-2),r.strokeStyle=`rgba(226, 232, 240, 0.7)`,r.lineWidth=1,r.setLineDash([3,3]),r.beginPath(),r.moveTo(c,0),r.lineTo(c,o),r.stroke(),r.setLineDash([])}if(n){let e=(n.start-v)/j*i,t=(n.end-v)/j*i;r.fillStyle=`rgba(2, 6, 23, 0.55)`,e>0&&r.fillRect(0,0,Math.min(i,e),o),t<i&&r.fillRect(Math.max(0,t),0,i-Math.max(0,t),o),r.strokeStyle=`rgba(251, 191, 36, 0.9)`,r.lineWidth=2;for(let n of[e,t])n>=0&&n<=i&&(r.beginPath(),r.moveTo(n,0),r.lineTo(n,o),r.stroke())}if(a>=v&&a<=v+j){let e=(a-v)/j*i;r.strokeStyle=`rgba(251, 191, 36, 0.35)`,r.lineWidth=6,r.beginPath(),r.moveTo(e,0),r.lineTo(e,o),r.stroke(),r.strokeStyle=`#fbbf24`,r.lineWidth=2,r.beginPath(),r.moveTo(e,0),r.lineTo(e,o),r.stroke(),r.fillStyle=`#fbbf24`,r.beginPath(),r.moveTo(e-6,0),r.lineTo(e+6,0),r.lineTo(e,10),r.closePath(),r.fill()}},[e,d,l,n,a,g,v,j,A,b,S,T,ve,ye,k]),P=(0,C.useCallback)(()=>{let t=m.current;if(!t)return;let r=t.getContext(`2d`);if(!r)return;let i=t.width,o=t.height;r.clearRect(0,0,i,o),r.fillStyle=`#0f172a`,r.fillRect(0,0,i,o);let s=e.waveformPeaks,c=s.length/2,l=o/2;r.fillStyle=`rgba(56, 189, 248, 0.4)`;for(let e=0;e<c;e++){let t=e/c*i,n=s[e*2],a=s[e*2+1],u=Math.max(1,(a-n)*(o*.45));r.fillRect(t,l-u/2,Math.max(1,i/c),u)}r.fillStyle=`#f43f5e`,e.downbeats.forEach(e=>{let t=e.time/A*i;r.fillRect(t,0,1.5,o)}),n&&(r.fillStyle=`rgba(251, 191, 36, 0.18)`,r.fillRect(n.start/A*i,0,(n.end-n.start)/A*i,o));let u=v/A*i,d=j/A*i,f=g>1.01&&(ae||D===`pan`);if(r.fillStyle=f?`rgba(56, 189, 248, 0.24)`:`rgba(56, 189, 248, 0.15)`,r.fillRect(u,0,d,o),r.strokeStyle=f?`#7dd3fc`:`#38bdf8`,r.lineWidth=f?2:1.5,r.strokeRect(u,0,d,o),g>1.01&&d>=12){let e=o*.45,t=(o-e)/2;r.fillStyle=f?`rgba(186, 230, 253, 0.85)`:`rgba(56, 189, 248, 0.65)`,r.fillRect(u+3,t,2,e),r.fillRect(u+d-5,t,2,e)}let p=a/A*i;r.fillStyle=`#fbbf24`,r.fillRect(p-1,0,2,o)},[e,A,v,j,a,g,ae,D,n]),F=(0,C.useCallback)(()=>{if(!ve||!k)return;let t=h.current;if(!t)return;let n=t.getContext(`2d`);if(!n)return;let r=window.devicePixelRatio||1,i=Kt,o=qt;(t.width!==i*r||t.height!==o*r)&&(t.width=i*r,t.height=o*r,t.style.width=`${i}px`,t.style.height=`${o}px`),n.setTransform(r,0,0,r,0,0),n.clearRect(0,0,i,o);let s=n.createLinearGradient(0,0,0,o);s.addColorStop(0,`#0b1120`),s.addColorStop(1,`#020617`),n.fillStyle=s,n.fillRect(0,0,i,o);let c=Math.min(ye,A),l=Math.max(0,Math.min(k.time-c/2,A-c)),u=l+c,f=c<=4?.25:c<=8?.5:1,p=c<=8?1:2,m=Math.ceil(l/f)*f;for(let e=m;e<=u;e+=f){let t=(e-l)/c*i,r=Math.abs(e%p);n.strokeStyle=r<.001||Math.abs(r-p)<.001?`rgba(51, 65, 85, 0.9)`:`rgba(30, 41, 59, 0.55)`,n.lineWidth=1,n.beginPath(),n.moveTo(t,0),n.lineTo(t,o),n.stroke()}let g=o*.46,_=o*.38;n.strokeStyle=`rgba(51, 65, 85, 0.45)`,n.lineWidth=1,n.beginPath(),n.moveTo(0,g),n.lineTo(i,g),n.stroke();let v=e.waveformPeaks,y=d?0:v.length/2;if(d&&nn(n,d,l,c,i,g,_),y>0){let e=Math.max(0,Math.floor(l/A*y)-1),t=Math.min(y,Math.ceil(u/A*y)+1);n.strokeStyle=`#38bdf8`,n.fillStyle=`rgba(56, 189, 248, 0.28)`,n.lineWidth=1.25,n.beginPath();let r=!1;for(let a=e;a<t;a++){let e=(a/y*A-l)/c*i,t=g-v[a*2+1]*_;r?n.lineTo(e,t):(n.moveTo(e,t),r=!0)}for(let r=t-1;r>=e;r--){let e=(r/y*A-l)/c*i,t=g-v[r*2]*_;n.lineTo(e,t)}n.closePath(),n.fill(),n.stroke()}let x=e.activationCurve,C=o*.92,w=o*.3;if(b&&x.length>0){n.strokeStyle=`rgba(34, 211, 238, 0.9)`,n.lineWidth=1.2,n.beginPath();let e=!0;for(let t=0;t<x.length;t++){let r=x[t];if(r.time<l-.1)continue;if(r.time>u+.1)break;let a=(r.time-l)/c*i,o=C-r.beatActivation*w;e?(n.moveTo(a,o),e=!1):n.lineTo(a,o)}n.stroke()}if(S&&x.length>0){n.strokeStyle=`rgba(244, 63, 94, 0.9)`,n.lineWidth=1.4,n.beginPath();let e=!0;for(let t=0;t<x.length;t++){let r=x[t];if(r.downbeatActivation===null||r.time<l-.1)continue;if(r.time>u+.1)break;let a=(r.time-l)/c*i,o=C-r.downbeatActivation*w;e?(n.moveTo(a,o),e=!1):n.lineTo(a,o)}n.stroke()}if(T&&e.beats.forEach(e=>{if(e.time<l-.05||e.time>u+.05)return;let t=(e.time-l)/c*i;e.isDownbeat?(n.strokeStyle=`#f43f5e`,n.lineWidth=2,n.beginPath(),n.moveTo(t,0),n.lineTo(t,o),n.stroke(),n.fillStyle=`#f43f5e`,n.fillRect(t,0,38,13),n.fillStyle=`#ffffff`,n.font=`bold 9px Inter, sans-serif`,n.fillText(`T${e.barIndex}`,t+3,10)):(n.strokeStyle=`rgba(56, 189, 248, 0.55)`,n.lineWidth=1,n.beginPath(),n.moveTo(t,10),n.lineTo(t,o),n.stroke(),c<=8&&(n.fillStyle=`#94a3b8`,n.font=`9px Inter, monospace`,n.fillText(`${e.beatInBar}`,t+2,19)))}),a>=l&&a<=u){let e=(a-l)/c*i;n.strokeStyle=`#fbbf24`,n.lineWidth=1.6,n.beginPath(),n.moveTo(e,0),n.lineTo(e,o),n.stroke()}let ee=(k.time-l)/c*i;n.strokeStyle=`rgba(248, 250, 252, 0.85)`,n.lineWidth=1,n.beginPath(),n.moveTo(ee,0),n.lineTo(ee,o),n.stroke()},[ve,ye,k,A,e,d,b,S,T,a]);(0,C.useEffect)(()=>{let e=()=>{if(f.current&&p.current){let e=f.current.getBoundingClientRect();le(e.width),p.current.width=e.width*window.devicePixelRatio,p.current.height=240*window.devicePixelRatio,p.current.style.width=`${e.width}px`,p.current.style.height=`240px`,m.current&&(m.current.width=e.width*window.devicePixelRatio,m.current.height=36*window.devicePixelRatio,m.current.style.width=`${e.width}px`,m.current.style.height=`36px`),xe(),P()}};return e(),window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[xe,P]),(0,C.useEffect)(()=>{xe(),P(),F()},[xe,P,F]);let Ce=e=>{re(!0),De(e)},we=t=>{let n=p.current?.getBoundingClientRect();if(!n)return;let r=t.clientX-n.left,i=Math.max(0,Math.min(1,r/n.width)),a=v+i*j;ne&&o(a);let s=null,c=.25;for(let t of e.beats){let e=Math.abs(t.time-a);e<c&&(c=e,s=t)}ue({x:r,y:t.clientY-n.top,time:a,beat:s})},Te=()=>{re(!1)},Ee=()=>{re(!1),ue(null)},De=e=>{let t=p.current?.getBoundingClientRect();if(!t)return;let n=e.clientX-t.left,r=Math.max(0,Math.min(1,n/t.width));o(v+r*j)},Oe=(0,C.useCallback)(e=>{if(g<=1.01)return!1;let t=m.current?.getBoundingClientRect();if(!t||t.width<=0)return!1;let n=e-t.left,r=v/A*t.width,i=j/A*t.width,a=r+i/2,o=Math.max(10,i/2+4);return Math.abs(n-a)<=o},[g,v,A,j]),ke=e=>{e.preventDefault();let t=m.current?.getBoundingClientRect();if(!t||t.width<=0)return;if(Oe(e.clientX)){O.current={startX:e.clientX,startOffsetSec:v},ie(`pan`);return}let n=e.clientX-t.left,r=Math.max(0,Math.min(1,n/t.width))*A,i=Math.max(0,Math.min(r-j/2,A-j));y(i),o(r),ie(`seek`)},Ae=e=>{D===`none`&&oe(Oe(e.clientX))};(0,C.useEffect)(()=>{if(D===`none`)return;let e=e=>{let t=m.current?.getBoundingClientRect();if(!(!t||t.width<=0)){if(D===`pan`&&O.current){let n=(e.clientX-O.current.startX)/t.width*A,r=Math.max(0,A-j),i=Math.max(0,Math.min(O.current.startOffsetSec+n,r));y(i)}else if(D===`seek`){let n=e.clientX-t.left,r=Math.max(0,Math.min(1,n/t.width))*A,i=Math.max(0,Math.min(r-j/2,Math.max(0,A-j)));y(i),o(r)}}},t=()=>{O.current=null,ie(`none`)};return window.addEventListener(`mousemove`,e),window.addEventListener(`mouseup`,t),()=>{window.removeEventListener(`mousemove`,e),window.removeEventListener(`mouseup`,t)}},[D,A,j,o]);let Me=e=>{let t=Math.max(1,Math.min(de,g*e)),n=v+j/2,r=A/t,i=Math.max(0,Math.min(n-r/2,A-r));_(t),y(i)},Ne=e=>{if(A<=e)return;if(fe===e){Pe();return}let t=Math.min(de,A/e),n=A/t,r=Math.max(0,Math.min(a-n/2,A-n));_(t),y(r)},Pe=()=>{_(1),y(0)},Fe=k?Math.max(8,Math.min(k.x-Kt/2,Math.max(8,ce-Kt-8))):8,Ie=k?k.y>=120?Math.max(8,k.y-L-12):Math.min(124,k.y+14):8;return(0,I.jsxs)(`div`,{className:`space-y-3`,children:[(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2 px-1`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 min-w-0`,children:[(0,I.jsx)(`span`,{className:`text-xs font-semibold text-slate-300 whitespace-nowrap shrink-0`,children:l(`web.wave.title`)}),(0,I.jsxs)(`span`,{className:`text-xs text-slate-400 truncate min-w-0 max-w-[48ch]`,title:`${e.metadata.fileName} · ${rn(A)}`,children:[`· `,(0,I.jsx)(`span`,{className:`text-slate-200 font-medium`,children:e.metadata.fileName}),(0,I.jsxs)(`span`,{className:`text-slate-500 tabular-nums`,children:[` · `,rn(A)]})]}),(0,I.jsx)(`span`,{className:`inline-flex justify-center w-[9.5rem] shrink-0 whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full font-bold border transition-colors ${s?s.isDownbeat?`bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/50`:`bg-cyan-950 text-cyan-300 border-cyan-800`:`invisible border-transparent`}`,"aria-hidden":!s,children:s?s.isDownbeat?l(`web.wave.bar_downbeat`,{bar:s.barIndex}):l(`web.wave.bar_beat`,{bar:s.barIndex,beat:s.beatInBar}):l(`web.wave.bar_downbeat`,{bar:`000`})})]}),(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2.5`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs`,children:[(0,I.jsx)(`button`,{type:`button`,onClick:()=>ee(!T),className:`px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${T?`bg-cyan-900/60 text-cyan-300`:`text-slate-500 hover:text-slate-300`}`,title:l(`web.wave.beats_tip`),children:(0,I.jsx)(`span`,{children:`Beats`})}),(0,I.jsxs)(`button`,{type:`button`,onClick:()=>x(!b),className:`px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${b?`bg-cyan-900/60 text-cyan-300`:`text-slate-500 hover:text-slate-300`}`,title:ge,children:[(0,I.jsx)(`span`,{className:`w-2 h-2 rounded-full bg-cyan-400`}),(0,I.jsx)(`span`,{children:`BAF`})]}),(0,I.jsx)(`span`,{title:he,className:`inline-flex`,children:(0,I.jsxs)(`button`,{type:`button`,onClick:()=>w(!S),disabled:!pe,"aria-pressed":pe&&S,className:`px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${pe?S?`bg-rose-900/60 text-rose-300 cursor-pointer`:`text-slate-500 hover:text-slate-300 cursor-pointer`:`text-slate-600 opacity-50 cursor-not-allowed`}`,children:[(0,I.jsx)(`span`,{className:`w-2 h-2 rounded-full ${pe?`bg-rose-500`:`bg-slate-600`}`}),(0,I.jsx)(`span`,{children:`DAF`})]})})]}),(0,I.jsxs)(`button`,{type:`button`,onClick:()=>te(e=>!e),disabled:!_e&&!E,"aria-pressed":ve,className:`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${ve?`bg-cyan-950/90 border-cyan-600/80 text-cyan-200 shadow-sm shadow-cyan-500/20`:E&&!_e?`bg-slate-900/70 border-slate-700 text-slate-400`:`bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700`}`,title:_e?l(`web.wave.loupe_tip`,{zoom:u(be,0),span:u(ye,1)}):l(E?`web.wave.loupe_paused`:`web.wave.loupe_only_overview`,{sec:Ht}),children:[(0,I.jsx)(je,{className:`w-3.5 h-3.5`}),(0,I.jsx)(`span`,{children:l(`web.wave.loupe`)})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1`,children:[(0,I.jsx)(`button`,{type:`button`,onClick:()=>Me(.7),disabled:g<=1,className:`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer shrink-0`,title:l(`web.wave.zoom_out`),children:(0,I.jsx)(Ke,{className:`w-3.5 h-3.5`})}),(0,I.jsxs)(`span`,{className:`text-[11px] font-mono tabular-nums text-slate-400 px-1 min-w-[38px] text-center whitespace-nowrap shrink-0`,children:[g.toFixed(1),`x`]}),(0,I.jsx)(`button`,{type:`button`,onClick:()=>Me(1.4),disabled:g>=de,className:`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer shrink-0`,title:l(`web.wave.zoom_in`),children:(0,I.jsx)(Ge,{className:`w-3.5 h-3.5`})}),(0,I.jsx)(`div`,{className:`w-px h-3.5 bg-slate-800 mx-0.5 shrink-0`,"aria-hidden":`true`}),Jt.map(e=>{let t=fe===e,n=A<=e;return(0,I.jsxs)(`button`,{type:`button`,onClick:()=>Ne(e),disabled:n,"aria-pressed":t,className:`px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${t?`bg-cyan-900/70 text-cyan-200 border border-cyan-700/70`:`text-slate-300 hover:text-white hover:bg-slate-800`}`,title:n?l(`web.wave.quick_too_short`,{sec:e}):t?l(`web.wave.quick_back`):l(`web.wave.quick_tip`,{sec:e}),children:[e,`s`]},e)}),(0,I.jsx)(`button`,{type:`button`,onClick:Pe,className:`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0`,title:l(`web.wave.whole_file`),children:(0,I.jsx)(Se,{className:`w-3.5 h-3.5`})})]})]})]}),(0,I.jsxs)(`div`,{ref:f,className:`relative rounded-xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950 cursor-crosshair select-none`,children:[(0,I.jsx)(`canvas`,{ref:p,onMouseDown:Ce,onMouseMove:we,onMouseUp:Te,onMouseLeave:Ee,className:`block w-full h-[240px]`}),ve&&k&&(0,I.jsxs)(`div`,{className:`absolute pointer-events-none z-30 rounded-lg border border-cyan-500/60 bg-slate-950/95 shadow-2xl shadow-black/70 backdrop-blur-md overflow-hidden`,style:{left:`${Fe}px`,top:`${Ie}px`,width:`${Kt}px`},children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between gap-2 px-2 py-1 bg-slate-900/95 border-b border-slate-800 text-[10px]`,children:[(0,I.jsx)(`span`,{className:`font-mono tabular-nums font-semibold text-cyan-300 whitespace-nowrap`,children:an(k.time)}),k.beat?(0,I.jsx)(`span`,{className:`truncate font-medium ${k.beat.isDownbeat?`text-rose-400`:`text-slate-300`}`,children:k.beat.isDownbeat?l(`web.wave.bar_downbeat`,{bar:k.beat.barIndex}):l(`web.wave.bar_beat`,{bar:k.beat.barIndex,beat:k.beat.beatInBar})}):(0,I.jsx)(`span`,{className:`text-slate-400 truncate`,children:l(`web.wave.loupe`)}),(0,I.jsxs)(`span`,{className:`font-mono tabular-nums text-cyan-400/90 whitespace-nowrap shrink-0`,children:[u(be,1),`× · `,u(ye,1),` s`]})]}),(0,I.jsx)(`canvas`,{ref:h,className:`block`})]}),!ve&&k&&(0,I.jsxs)(`div`,{className:`absolute pointer-events-none z-30 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-xs text-white backdrop-blur-md -translate-x-1/2 -translate-y-full mb-2`,style:{left:`${k.x}px`,top:`${Math.max(30,k.y)}px`},children:[(0,I.jsxs)(`div`,{className:`font-mono tabular-nums font-semibold text-cyan-300`,children:[u(k.time,3),` s`]}),k.beat&&(0,I.jsxs)(`div`,{className:`text-[11px] text-slate-300 mt-0.5`,children:[k.beat.isDownbeat?(0,I.jsx)(`span`,{className:`text-rose-400 font-bold`,children:l(`web.wave.bar_downbeat`,{bar:k.beat.barIndex})}):(0,I.jsx)(`span`,{children:l(`web.wave.bar_beat`,{bar:k.beat.barIndex,beat:k.beat.beatInBar})}),(0,I.jsxs)(`span`,{className:`ml-1.5 text-slate-400 font-mono tabular-nums`,children:[`(`,k.beat.instantBpm.toFixed(0),` BPM)`]})]})]})]}),(0,I.jsxs)(`div`,{className:`space-y-1`,children:[(0,I.jsxs)(`div`,{className:`flex justify-between text-[10px] text-slate-500 font-mono px-0.5`,children:[(0,I.jsx)(`span`,{children:l(`web.wave.overview`)}),(0,I.jsx)(`span`,{children:l(g>1.01?`web.wave.overview_drag`:`web.wave.overview_click`)})]}),(0,I.jsx)(`div`,{className:`relative rounded-lg border border-slate-800 overflow-hidden bg-slate-950 h-9 shadow-inner select-none ${D===`pan`?`cursor-grabbing`:ae?`cursor-grab`:`cursor-pointer`}`,onMouseDown:ke,onMouseMove:Ae,onMouseLeave:()=>oe(!1),children:(0,I.jsx)(`canvas`,{ref:m,className:`block w-full h-9`})})]})]})},sn=({isPlaying:e,currentTime:t,duration:n,activeBeat:r,playbackSpeed:i,metronomeEnabled:a,metronomeVolume:o,globalBpm:s,onPlay:c,onPause:l,onSeek:u,onSetPlaybackSpeed:d,onToggleMetronome:f,onSetMetronomeVolume:p,musicVolume:m,onSetMusicVolume:h,loopMode:g,onCycleLoop:_})=>{let{t:v,num:y,pctValue:b}=xt(),[x,S]=(0,C.useState)([]),[w,T]=(0,C.useState)(null),[ee,E]=(0,C.useState)(null),te=(0,C.useRef)(null);(0,C.useEffect)(()=>{let t=t=>{t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||t.code===`Space`&&(t.preventDefault(),e?l():c())};return window.addEventListener(`keydown`,t),()=>window.removeEventListener(`keydown`,t)},[e,c,l]);let ne=e=>{let t=Math.floor(e/60),n=Math.floor(e%60),r=Math.floor(e%1*10);return`${t.toString().padStart(2,`0`)}:${n.toString().padStart(2,`0`)}.${r}`};return(0,I.jsxs)(`div`,{className:`p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4`,children:[(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(`button`,{onClick:()=>u(0),className:`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`,title:v(`web.player.to_start`),children:(0,I.jsx)(Ae,{className:`w-4 h-4`})}),(0,I.jsx)(`button`,{onClick:()=>u(Math.max(0,t-5)),className:`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`,title:v(`web.player.back5`),children:(0,I.jsx)(ke,{className:`w-4 h-4`})}),(0,I.jsx)(`button`,{onClick:e?l:c,className:`w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer`,title:v(e?`web.player.pause`:`web.player.play`),children:e?(0,I.jsx)(Ce,{className:`w-5 h-5 fill-current`}):(0,I.jsx)(we,{className:`w-5 h-5 ml-0.5 fill-current`})}),(0,I.jsx)(`button`,{onClick:()=>u(Math.min(n,t+5)),className:`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`,title:v(`web.player.fwd5`),children:(0,I.jsx)(j,{className:`w-4 h-4`})}),(0,I.jsxs)(`button`,{onClick:_,"aria-pressed":g!==`off`,"aria-label":`${v(`web.player.loop_off`)}: ${v(`web.player.loop_${g}`)}`,className:`relative w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${g===`off`?`text-slate-400 border-transparent hover:text-white hover:bg-slate-800`:g===`view`?`text-amber-300 bg-amber-950/60 border-amber-700/70`:`text-emerald-300 bg-emerald-950/60 border-emerald-700/70`}`,title:v(`web.player.loop_${g}_tip`),children:[(0,I.jsx)(Oe,{className:`w-[18px] h-[18px]`,strokeWidth:2.25}),g===`view`&&(0,I.jsx)(`span`,{className:`absolute -bottom-1 -right-1 px-0.5 rounded bg-amber-500 text-[8px] leading-[10px] font-bold text-slate-950`,children:`A-B`})]}),(0,I.jsxs)(`div`,{className:`font-mono text-xs sm:text-sm text-slate-300 ml-2`,children:[(0,I.jsx)(`span`,{className:`text-white font-semibold`,children:ne(t)}),(0,I.jsx)(`span`,{className:`text-slate-600 mx-1`,children:`/`}),(0,I.jsx)(`span`,{className:`text-slate-400`,children:ne(n)})]})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 w-[10.5rem] h-12 shrink-0 overflow-hidden`,children:[(0,I.jsx)(`div`,{className:`relative flex items-center justify-center shrink-0`,children:(0,I.jsx)(`div`,{className:`w-3.5 h-3.5 rounded-full transition-all duration-100 ${r?r.isDownbeat?`bg-rose-500 ring-4 ring-rose-500/40 scale-125 shadow-lg shadow-rose-500`:`bg-cyan-400 ring-2 ring-cyan-400/40 scale-110 shadow-sm shadow-cyan-400`:`bg-slate-700`}`})}),(0,I.jsx)(`div`,{className:`text-xs leading-tight min-w-0`,children:r?(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(`div`,{className:`font-bold truncate ${r.isDownbeat?`text-rose-400`:`text-cyan-300`}`,children:v(`output.marker_downbeat`,{bar:r.barIndex})}),(0,I.jsx)(`div`,{className:`text-slate-200 font-mono text-[11px] whitespace-nowrap`,children:r.isDownbeat?(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(`span`,{className:`text-rose-300 font-bold`,children:`Downbeat`}),` (Beat `,r.beatInBar,`)`]}):(0,I.jsxs)(I.Fragment,{children:[`Beat `,r.beatInBar]})})]}):(0,I.jsx)(`span`,{className:`text-slate-500 font-mono text-[11px]`,children:v(`web.player.ready`)})})]}),(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center gap-4`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 h-10 bg-slate-950/60 border border-slate-800 rounded-xl px-3`,children:[(0,I.jsx)(F,{className:`w-4 h-4 text-indigo-300`}),(0,I.jsx)(`span`,{className:`text-xs font-medium text-slate-300 hidden sm:inline`,children:v(`web.player.song`)}),(0,I.jsx)(`input`,{type:`range`,min:`0`,max:`1`,step:`0.05`,value:m,onChange:e=>h(parseFloat(e.target.value)),className:`w-16 accent-indigo-400 cursor-pointer`,title:v(`web.player.song_volume`),"aria-label":v(`web.player.song_volume`)})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-2 h-10 bg-slate-950/60 border border-slate-800 rounded-xl px-3`,children:[(0,I.jsx)(`button`,{onClick:f,className:`p-1.5 rounded-lg transition-colors cursor-pointer ${a?`text-cyan-400 hover:text-cyan-300 bg-cyan-950/50`:`text-slate-500 hover:text-slate-300`}`,title:v(a?`web.player.metronome_off`:`web.player.metronome_on`),children:a?(0,I.jsx)(Ve,{className:`w-4 h-4`}):(0,I.jsx)(He,{className:`w-4 h-4`})}),(0,I.jsx)(`span`,{className:`text-xs font-medium text-slate-300 hidden sm:inline`,children:v(`web.player.metronome`)}),(0,I.jsx)(`input`,{type:`range`,min:`0`,max:`1`,step:`0.05`,value:a?o:0,onChange:e=>p(parseFloat(e.target.value)),disabled:!a,className:`w-16 accent-cyan-400 cursor-pointer disabled:opacity-30`,title:v(`web.player.metronome_volume`)})]}),(0,I.jsxs)(`label`,{className:`flex items-center gap-1.5 h-10 shrink-0 bg-slate-950/60 border border-slate-800 rounded-xl pl-3 pr-2 text-xs text-slate-300`,title:v(`web.player.speed`),children:[(0,I.jsx)(_e,{className:`w-4 h-4 text-indigo-300`}),(0,I.jsx)(`select`,{value:i,onChange:e=>d(parseFloat(e.target.value)),className:`bg-transparent font-mono text-slate-200 focus:outline-none cursor-pointer min-w-[4.25rem] h-full`,"aria-label":v(`web.player.speed`),children:[.5,.75,1,1.25,1.5].map(e=>(0,I.jsxs)(`option`,{value:e,className:`bg-slate-900`,children:[e,`x`]},e))})]})]})]}),(0,I.jsxs)(`div`,{className:`pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsxs)(`button`,{onClick:()=>{let e=performance.now();te.current&&clearTimeout(te.current);let t=[...x,e].filter(t=>e-t<3e3);if(S(t),t.length>=2){let e=[];for(let n=1;n<t.length;n++)e.push((t[n]-t[n-1])/1e3);let n=e.reduce((e,t)=>e+t,0)/e.length;if(n>.15){let e=Math.round(60/n);T(e);let t=Math.abs(e-s),r=Math.round((1-t/s)*100);E(Math.max(0,r))}}te.current=setTimeout(()=>{S([])},3500)},className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 active:scale-95 transition-all cursor-pointer`,title:v(`web.player.tap_tip`),children:[(0,I.jsx)(he,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,I.jsx)(`span`,{className:`font-semibold`,children:v(`web.player.tap`)})]}),(0,I.jsx)(`span`,{className:`text-slate-400 hidden sm:inline`,children:v(`web.player.tap_hint`)})]}),w&&(0,I.jsxs)(`div`,{className:`flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-mono`,children:[(0,I.jsx)(`span`,{className:`text-slate-400`,children:v(`web.player.your_tap`)}),(0,I.jsxs)(`span`,{className:`text-cyan-400 font-bold`,children:[w,` BPM`]}),(0,I.jsx)(`span`,{className:`text-slate-600`,children:`vs`}),(0,I.jsxs)(`span`,{className:`text-white font-bold`,children:[y(s,0),` BPM`]}),ee!==null&&(0,I.jsx)(`span`,{className:`text-[10px] px-1.5 py-0.5 rounded font-bold ${ee>=90?`bg-emerald-950 text-emerald-300 border border-emerald-800`:`bg-amber-950 text-amber-300 border border-amber-800`}`,children:v(`web.player.match`,{pct:b(ee)})})]})]})]})},cn=({result:e,currentTime:t,onSeek:n})=>{let{t:r,num:i}=xt(),a=(0,C.useRef)(null),[o,s]=(0,C.useState)(null),c=e.beats.filter(e=>e.instantBpm>40&&e.instantBpm<260);if(c.length<2)return null;let l=e.metadata.duration||1,u=Math.max(40,Math.floor(e.minBpm-8)),d=Math.min(260,Math.ceil(e.maxBpm+8)),f=d-u||1,p=e=>20+e/l*760,m=e=>115-(e-u)/f*95,h=`M ${c.map(e=>`${p(e.time).toFixed(1)},${m(e.instantBpm).toFixed(1)}`).join(` L `)}`,g=`${h} L ${p(c[c.length-1].time).toFixed(1)},115 L ${p(c[0].time).toFixed(1)},115 Z`,_=m(e.averageBpm),v=p(t);return(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-2`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between text-xs`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 font-semibold text-slate-300`,children:[(0,I.jsx)(Re,{className:`w-3.5 h-3.5 text-indigo-400`}),(0,I.jsx)(`span`,{children:r(`web.tempo.title`)})]}),(0,I.jsxs)(`div`,{className:`text-[11px] text-slate-400 font-mono`,children:[r(`web.tempo.range`),` `,(0,I.jsx)(`span`,{className:`text-white font-semibold`,children:i(e.minBpm,1)}),` –`,` `,(0,I.jsxs)(`span`,{className:`text-white font-semibold`,children:[i(e.maxBpm,1),` BPM`]}),` • Ø`,` `,(0,I.jsxs)(`span`,{className:`text-cyan-400 font-bold`,children:[i(e.averageBpm,1),` BPM`]})]})]}),(0,I.jsxs)(`div`,{ref:a,className:`relative w-full overflow-hidden select-none`,children:[(0,I.jsxs)(`svg`,{viewBox:`0 0 800 140`,className:`w-full h-28 sm:h-32 cursor-pointer`,onClick:e=>{let t=e.currentTarget.getBoundingClientRect(),r=e.clientX-t.left;n(Math.max(0,Math.min(1,(r-20/800*t.width)/(760/800*t.width)))*l)},children:[(0,I.jsx)(`defs`,{children:(0,I.jsxs)(`linearGradient`,{id:`tempoGradient`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,I.jsx)(`stop`,{offset:`0%`,stopColor:`#818cf8`,stopOpacity:`0.35`}),(0,I.jsx)(`stop`,{offset:`100%`,stopColor:`#818cf8`,stopOpacity:`0.0`})]})}),(0,I.jsx)(`line`,{x1:20,y1:20,x2:780,y2:20,stroke:`#1e293b`,strokeDasharray:`3 3`}),(0,I.jsxs)(`text`,{x:24,y:30,fill:`#64748b`,fontSize:`9`,fontFamily:`monospace`,children:[d,` BPM`]}),(0,I.jsx)(`line`,{x1:20,y1:115,x2:780,y2:115,stroke:`#1e293b`,strokeDasharray:`3 3`}),(0,I.jsxs)(`text`,{x:24,y:111,fill:`#64748b`,fontSize:`9`,fontFamily:`monospace`,children:[u,` BPM`]}),(0,I.jsx)(`line`,{x1:20,y1:_,x2:780,y2:_,stroke:`#38bdf8`,strokeDasharray:`4 4`,strokeWidth:`1.2`,opacity:`0.6`}),(0,I.jsxs)(`text`,{x:720,y:_-4,fill:`#38bdf8`,fontSize:`9`,fontFamily:`monospace`,children:[`Ø `,i(e.averageBpm,1)]}),(0,I.jsx)(`path`,{d:g,fill:`url(#tempoGradient)`}),(0,I.jsx)(`path`,{d:h,fill:`none`,stroke:`#818cf8`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`}),c.filter(e=>e.isDownbeat).map(e=>(0,I.jsx)(`circle`,{cx:p(e.time),cy:m(e.instantBpm),r:`3`,fill:`#f43f5e`,stroke:`#ffffff`,strokeWidth:`1`,className:`hover:scale-150 transition-transform cursor-pointer`,onMouseEnter:()=>s(e),onMouseLeave:()=>s(null)},e.id)),v>=20&&v<=780&&(0,I.jsx)(`line`,{x1:v,y1:15,x2:v,y2:120,stroke:`#fbbf24`,strokeWidth:`2`})]}),o&&(0,I.jsxs)(`div`,{className:`absolute top-2 right-4 px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-700 shadow-md`,children:[r(`output.marker_downbeat`,{bar:o.barIndex}),` (`,i(o.time,2),` s): `,i(o.instantBpm,1),` BPM`]})]})]})},ln=({result:e,currentTime:t,onSeek:n,onUpdateBeats:r})=>{let{t:i,num:a}=xt(),[o,s]=(0,C.useState)(`all`),[c,l]=(0,C.useState)(``),[u,d]=(0,C.useState)(1),[f,p]=(0,C.useState)(!0),m=e.beats.filter(e=>{if(o===`downbeats`&&!e.isDownbeat)return!1;if(c){let t=c.toLowerCase(),n=`${e.barIndex}`===t||`${e.barIndex}`.startsWith(t),r=e.time.toFixed(2).includes(t);return n||r}return!0}),h=Math.ceil(m.length/15)||1,g=-1;for(let e=0;e<m.length&&m[e].time<=t+.02;e++)g=e;let _=g>=0?m[g].id:null,v=g>=0?Math.floor(g/15)+1:1;(0,C.useEffect)(()=>{f&&d(v)},[f,v,o,c]);let y=e=>{p(!1),d(Math.min(h,Math.max(1,e)))},b=m.slice((u-1)*15,u*15),x=e=>{let t=Math.floor(e/60),n=(e%60).toFixed(3);return`${t.toString().padStart(2,`0`)}:${n.padStart(6,`0`)}`},S=(t,n)=>{r(e.beats.map(e=>{if(e.id===t){let t=Math.max(0,e.time+n);return{...e,time:Math.round(t*1e3)/1e3}}return e}))},w=t=>{r(e.beats.map(e=>e.id===t?{...e,isDownbeat:!e.isDownbeat,beatInBar:e.isDownbeat?e.beatInBar:1}:e))};return(0,I.jsxs)(`div`,{className:`p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4`,children:[(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-3`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(Pe,{className:`w-4 h-4 text-cyan-400`}),(0,I.jsx)(`h3`,{className:`text-sm font-bold text-white`,children:i(`web.table.title`,{n:m.length})})]}),(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,I.jsxs)(`label`,{className:`flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none`,title:i(`web.table.follow_tip`),children:[(0,I.jsx)(`input`,{type:`checkbox`,className:`accent-cyan-500`,checked:f,onChange:e=>p(e.target.checked)}),i(`web.table.follow`)]}),(0,I.jsxs)(`div`,{className:`flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs`,children:[(0,I.jsx)(`button`,{onClick:()=>{s(`all`),d(1)},className:`px-3 py-1 rounded-md transition-colors cursor-pointer ${o===`all`?`bg-slate-800 text-white font-medium`:`text-slate-400 hover:text-slate-200`}`,children:i(`web.table.all`,{n:e.totalBeats})}),(0,I.jsx)(`button`,{onClick:()=>{s(`downbeats`),d(1)},className:`px-3 py-1 rounded-md transition-colors cursor-pointer ${o===`downbeats`?`bg-rose-950 text-rose-300 font-semibold border border-rose-800/80`:`text-slate-400 hover:text-slate-200`}`,children:i(`web.table.downbeats`,{n:e.totalBars})})]}),(0,I.jsxs)(`div`,{className:`relative`,children:[(0,I.jsx)(je,{className:`w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2`}),(0,I.jsx)(`input`,{type:`text`,placeholder:i(`web.table.search`),value:c,onChange:e=>{l(e.target.value),d(1)},className:`bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-32 sm:w-40`})]})]})]}),(0,I.jsx)(`div`,{className:`overflow-x-auto rounded-xl border border-slate-800`,children:(0,I.jsxs)(`table`,{className:`w-full text-left text-xs text-slate-300`,children:[(0,I.jsx)(`thead`,{className:`bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800`,children:(0,I.jsxs)(`tr`,{children:[(0,I.jsx)(`th`,{className:`py-2.5 px-3`,children:i(`web.table.col_bar_beat`)}),(0,I.jsx)(`th`,{className:`py-2.5 px-3`,children:i(`web.table.col_time`)}),(0,I.jsx)(`th`,{className:`py-2.5 px-3`,children:i(`web.table.col_interval`)}),(0,I.jsx)(`th`,{className:`py-2.5 px-3`,children:`Tempo`}),(0,I.jsx)(`th`,{className:`py-2.5 px-3`,children:i(`web.table.col_type`)}),(0,I.jsx)(`th`,{className:`py-2.5 px-3`,children:`Confidence`}),(0,I.jsx)(`th`,{className:`py-2.5 px-3 text-right`,children:i(`web.table.col_action`)})]})}),(0,I.jsx)(`tbody`,{className:`divide-y divide-slate-800/60 font-mono`,children:b.map(e=>{let t=e.id===_;return(0,I.jsxs)(`tr`,{"data-current":t?`true`:void 0,className:`transition-colors hover:bg-slate-800/50 ${t?`bg-cyan-950/40 text-cyan-200`:``}`,children:[(0,I.jsxs)(`td`,{className:`py-2 px-3 font-sans`,children:[(0,I.jsx)(`span`,{className:`font-bold text-white`,children:i(`output.marker_downbeat`,{bar:e.barIndex})}),(0,I.jsx)(`span`,{className:`text-slate-500 mx-1`,children:`•`}),(0,I.jsxs)(`span`,{className:e.isDownbeat?`text-rose-400 font-bold`:`text-slate-300`,children:[`Beat `,e.beatInBar]})]}),(0,I.jsxs)(`td`,{className:`py-2 px-3 text-slate-200`,children:[x(e.time),` `,(0,I.jsxs)(`span`,{className:`text-[10px] text-slate-500`,children:[`(`,e.time.toFixed(3),`s)`]})]}),(0,I.jsx)(`td`,{className:`py-2 px-3 text-slate-400`,children:e.deltaMs>0?`${e.deltaMs} ms`:`—`}),(0,I.jsxs)(`td`,{className:`py-2 px-3`,children:[(0,I.jsx)(`span`,{className:`font-semibold text-cyan-400`,children:a(e.instantBpm,1)}),` `,(0,I.jsx)(`span`,{className:`text-[10px] text-slate-500`,children:`BPM`})]}),(0,I.jsx)(`td`,{className:`py-2 px-3`,children:e.isDownbeat?(0,I.jsx)(`span`,{className:`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/80`,children:`Downbeat (1)`}):(0,I.jsxs)(`span`,{className:`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400`,children:[`Beat `,e.beatInBar]})}),(0,I.jsx)(`td`,{className:`py-2 px-3`,children:e.confidence===null?(0,I.jsx)(`span`,{className:`text-[10px] text-slate-500`,children:`–`}):(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,I.jsx)(`div`,{className:`w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden`,children:(0,I.jsx)(`div`,{className:`bg-cyan-400 h-full rounded-full`,style:{width:`${Math.round(e.confidence*100)}%`}})}),(0,I.jsxs)(`span`,{className:`text-[10px] text-slate-400`,children:[Math.round(e.confidence*100),`%`]})]})}),(0,I.jsxs)(`td`,{className:`py-2 px-3 text-right space-x-1`,children:[(0,I.jsx)(`button`,{onClick:()=>n(e.time),className:`p-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors cursor-pointer`,title:i(`web.table.play_from`),children:(0,I.jsx)(we,{className:`w-3 h-3 fill-current`})}),(0,I.jsx)(`button`,{onClick:()=>S(e.id,-.01),className:`px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer`,title:i(`web.table.nudge_back`),children:`-10ms`}),(0,I.jsx)(`button`,{onClick:()=>S(e.id,.01),className:`px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer`,title:i(`web.table.nudge_fwd`),children:`+10ms`}),(0,I.jsx)(`button`,{onClick:()=>w(e.id),className:`px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer`,title:i(`web.table.toggle_downbeat`),children:`1/X`})]})]},e.id)})})]})}),h>1&&(0,I.jsxs)(`div`,{className:`flex items-center justify-between text-xs text-slate-400 pt-1`,children:[(0,I.jsx)(`span`,{children:i(`web.table.page`,{page:u,pages:h})}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1`,children:[(0,I.jsx)(`button`,{onClick:()=>y(u-1),disabled:u===1,className:`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer`,children:(0,I.jsx)(re,{className:`w-4 h-4`})}),(0,I.jsx)(`button`,{onClick:()=>y(u+1),disabled:u===h,className:`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer`,children:(0,I.jsx)(D,{className:`w-4 h-4`})})]})]})]})};function un(e){let t=[];return e.beats.forEach(e=>{let n=e.isDownbeat?`[Bar ${e.barIndex}] ${e.beatInBar}`:`${e.barIndex}.${e.beatInBar}`;t.push(`${e.time.toFixed(6)}\t${e.time.toFixed(6)}\t${n}`)}),t.join(`
`)}function dn(e){let t=e.engineInfo?.id===`md_beat_this`,n={generator:t?`BeatAnalyzer (fosfrancesco/md_beat_this · CC BY-NC 4.0)`:`CPJKU/beat_this Web Analyzer`,...t?{license:e.license??`CC BY-NC 4.0`,attribution:e.attribution??`Masked Diffusion (md_beat_this) by Francesco Foscarin, Filip Korzeniowski, Richard Vogl (https://github.com/fosfrancesco/md_beat_this) — Licensed under CC BY-NC 4.0 (Non-Commercial Use Only).`}:{},metadata:{file_name:e.metadata.fileName,format:e.metadata.format,duration_seconds:e.metadata.duration,sample_rate:e.metadata.sampleRate},tempo:{global_bpm:e.globalBpm,average_bpm:e.averageBpm,median_bpm:e.medianBpm,min_bpm:e.minBpm,max_bpm:e.maxBpm,stability_percent:e.tempoStability,swing_ratio_percent:e.swingRatio},meter:{time_signature:e.timeSignature.name,numerator:e.timeSignature.numerator,denominator:e.timeSignature.denominator,bar_share_percent:e.timeSignature.barShare},counts:{total_beats:e.totalBeats,total_bars:e.totalBars},beats:e.beats.map(e=>e.time),downbeats:e.downbeats.map(e=>e.time),beat_details:e.beats.map(e=>({id:e.id,time:e.time,bar:e.barIndex,beat_in_bar:e.beatInBar,is_downbeat:e.isDownbeat,confidence:e.confidence,instant_bpm:e.instantBpm,delta_ms:e.deltaMs}))};return JSON.stringify(n,null,2)}function fn(e){let t=[`ID`,`Timestamp_Sec`,`Bar`,`Beat_In_Bar`,`Is_Downbeat`,`BPM`,`Interval_MS`,`Confidence`],n=e.beats.map(e=>[e.id,e.time.toFixed(3),e.barIndex,e.beatInBar,+!!e.isDownbeat,e.instantBpm.toFixed(1),e.deltaMs,e.confidence===null?``:e.confidence.toFixed(2)]);return[t.join(`,`),...n.map(e=>e.join(`,`))].join(`
`)}function pn(e){let t=Math.round(e.globalBpm),n=Math.round(6e7/t),r=[];r.push(0,255,81,3),r.push(n>>16&255),r.push(n>>8&255),r.push(n&255);let i=e.timeSignature.numerator,a=Math.log2(e.timeSignature.denominator);r.push(0,255,88,4,i,a,24,8);let o=0;e.beats.forEach(e=>{let n=Math.round(e.time*(t/60)*480),i=Math.max(0,n-o);o=n;let a=e.isDownbeat?76:77,s=e.isDownbeat?120:90;gn(r,i),r.push(153,a,s),gn(r,30),r.push(137,a,0),o+=30}),r.push(0,255,47,0);let s=[77,84,104,100,0,0,0,6,0,0,0,1,1,224],c=r.length,l=[77,84,114,107,c>>24&255,c>>16&255,c>>8&255,c&255],u=new Uint8Array([...s,...l,...r]);return new Blob([u],{type:`audio/midi`})}var mn=`beatthis-resolve-markers/1`;function hn(e,t={}){let n=e.engineInfo?.id===`md_beat_this`,r=t.onlyDownbeats?e.beats.filter(e=>e.isDownbeat):e.beats,i={format:mn,fileName:e.metadata.fileName,duration:e.metadata.duration,globalBpm:e.globalBpm,timeSignature:e.timeSignature.name,markers:r.map(e=>({time:e.time,type:e.isDownbeat?`downbeat`:`beat`,bar:e.barIndex,beat:e.beatInBar,bpm:e.instantBpm,confidence:e.confidence})),...e.engineInfo?{engine:e.engineInfo}:{},...e.resolveOffset?{resolveOffset:e.resolveOffset}:{},...n?{license:e.license??`CC BY-NC 4.0`,attribution:e.attribution??`Masked Diffusion (md_beat_this) by Francesco Foscarin, Filip Korzeniowski, Richard Vogl (https://github.com/fosfrancesco/md_beat_this) — Licensed under CC BY-NC 4.0 (Non-Commercial Use Only).`}:{}};return JSON.stringify(i,null,2)}function gn(e,t){let n=t&127;for(;(t>>=7)>0;)n<<=8,n|=t&127|128;for(;e.push(n&255),n&128;)n>>=8}function _n(e,t,n=`text/plain`){let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}function vn(e,t){let n=URL.createObjectURL(e),r=document.createElement(`a`);r.href=n,r.download=t,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(n)}var yn=`--[[
BeatAnalyzer_Markers.lua - DaVinci Resolve script of BeatAnalyzer.
Opens a window: choose a marker JSON exported by BeatAnalyzer ("DaVinci Resolve" tab), check the target clip,
its length and the open timeline, then put one marker per beat on the audio clip in the media pool.
Media pool markers show on every use of the clip in every timeline. Colours per beat of the bar (downbeat,
beat 2-4, others, or no marker) can be set in the window. "Remove BeatAnalyzer markers" takes them off again.

Target clip: the clips selected in the media pool; with no selection, every media pool clip whose
file name equals "fileName" in the JSON. OK stays locked without a target clip.
Markers written by this script carry the custom data MARKER_TAG; a new run removes them first,
markers set by hand stay. The work runs in steps on a timer, so the window stays responsive and locked.

Subtitles: <song>.srt (one subtitle per beat, all beats) is written into a working folder
<BeatAnalyzer>/resolve_temp/<date-time>, imported into the media pool bin BIN_NAME and deleted again.
With the tick box set and the song on an audio track of the timeline open at OK, <song> (Timeline).srt with
timeline times goes onto the subtitle track "BeatAnalyzer - <song>" under the first use of the song; the
clip of that file is deleted from the media pool afterwards (the subtitles on the track stay). A new run
deletes that track and creates it again. resolve/tools/probe_timeline.lua checks the placement in Resolve.

Texts, language and the BeatAnalyzer folder come from the BA-CONFIG block (backend/resolve_plugin.py).
The window remembers its settings in <BeatAnalyzer>/resolve_temp/plugin.txt.

Install: copy to %APPDATA%\\Blackmagic Design\\DaVinci Resolve\\Support\\Fusion\\Scripts\\Utility\\
Run:     Workspace -> Scripts -> BeatAnalyzer_Markers
Log:     Workspace -> Console (lines starting with "[BeatAnalyzer]")

Written for DaVinci Resolve Studio 21.2. The free version blocks file access for scripts.
]]

local VERSION = "0.2.13"   -- same as the file VERSION; the installer compares it

local M = { VERSION = VERSION }

-- >>> BA-CONFIG (written by backend/resolve_plugin.py - do not edit by hand) >>>
local BA = {
  home = nil,
  python = nil,
  lang = "en",
  texts = {
    ["en"] = {
      ["_meta.decimal"] = ".",
      ["_meta.html_lang"] = "en",
      ["_meta.name"] = "English",
      ["_meta.percent"] = "{v}%",
      ["output.bar_beat"] = "Bar {bar} – Beat {beat}",
      ["output.confidence"] = "Confidence {value}",
      ["output.intro"] = "BeatAnalyzer\\n{file}\\n{bpm} BPM – {meter}",
      ["output.kind_beat"] = "Beat {beat}",
      ["output.kind_downbeat"] = "Downbeat (1)",
      ["output.marker_downbeat"] = "Bar {bar}",
      ["output.marker_note"] = "{time} s | {bpm} BPM",
      ["output.meter"] = "{num}/{den}{suffix}",
      ["output.meter_suffix.16"] = "",
      ["output.meter_suffix.2"] = "",
      ["output.meter_suffix.4"] = "",
      ["output.meter_suffix.8"] = "",
      ["output.model_line"] = "Model: {name} – use under the {license} licence",
      ["output.time_bpm"] = "{clock} – {bpm} BPM",
      ["plugin.analyze_many"] = "Several clips selected – please select exactly one audio clip.",
      ["plugin.analyze_no_path"] = "The selected item has no file (e.g. a Timeline or a Compound Clip).",
      ["plugin.analyze_none"] = "Select exactly one audio clip in the Media Pool.",
      ["plugin.btn_analyze"] = "Analyse",
      ["plugin.btn_apply"] = "Apply markers",
      ["plugin.btn_cancel"] = "Cancel",
      ["plugin.btn_choose"] = "Choose …",
      ["plugin.btn_close"] = "Close",
      ["plugin.btn_ok"] = "OK",
      ["plugin.btn_remove"] = "Remove BeatAnalyzer markers",
      ["plugin.btn_remove_yes"] = "Remove",
      ["plugin.cancel_hint"] = "Cancel works only during the analysis.",
      ["plugin.check_colors"] = "Adjust marker colours",
      ["plugin.check_timeline"] = "Create a Subtitle Track in the Timeline",
      ["plugin.choose_title"] = "BeatAnalyzer – choose marker JSON",
      ["plugin.clip_found"] = "{names} in the Media Pool · {length}",
      ["plugin.color_beat"] = "Beat {n}",
      ["plugin.color_downbeat"] = "Downbeat",
      ["plugin.color_none"] = "no marker",
      ["plugin.color_other"] = "other",
      ["plugin.engine"] = "Analysed with {engine}",
      ["plugin.engine_unknown"] = "Analysis program: not given in the JSON (older JSON or analysed in the browser)",
      ["plugin.explain_absent"] = "The song is not in the Timeline '{timeline}'. Only the Subtitle in the Media Pool is created.",
      ["plugin.explain_no_timeline"] = "No Timeline is open. Only the Subtitle in the Media Pool is created.",
      ["plugin.explain_off"] = "The Timeline stays unchanged. The Subtitle with all beats lies in the folder BeatAnalyzer in the Media Pool and can be dragged from there into any Timeline.",
      ["plugin.explain_present"] = "In the Timeline '{timeline}' the song lies on A{track} from {tc}. Below it the Subtitle Track '{track_name}' is created and made active. Resolve allows only one active Subtitle Track; the others stay but are switched off.",
      ["plugin.explain_present_many"] = "In the Timeline '{timeline}' the song lies on {tracks}. Each of these tracks gets its own Subtitle Track, e.g. '{track_name}'. Resolve allows only one active Subtitle Track; the others stay but are disabled.",
      ["plugin.explain_short_absent"] = "Song not in the Timeline '{timeline}' – only the Subtitle in the Media Pool.",
      ["plugin.explain_short_no_timeline"] = "No Timeline open – only the Subtitle in the Media Pool.",
      ["plugin.explain_short_off"] = "The Timeline stays unchanged, Subtitle in the folder BeatAnalyzer.",
      ["plugin.explain_short_present"] = "The Subtitle Track goes under the song ({tracks}).",
      ["plugin.explain_short_tl_markers"] = "Markers also on the clips in the Timeline ({items}).",
      ["plugin.explain_tl_markers"] = "The song's clips in this Timeline ({items}) get the markers as well.",
      ["plugin.json_none"] = "No JSON chosen.",
      ["plugin.md_confirm"] = "I use md_beat_this for non-commercial purposes only (CC BY-NC 4.0)",
      ["plugin.md_confirm_needed"] = "Tick the licence box to analyse with md_beat_this.",
      ["plugin.md_notice"] = "md_beat_this is licensed under CC BY-NC 4.0 and may only be used for non-commercial purposes, within the terms of the CC BY-NC 4.0 licence: {url}",
      ["plugin.model_beat_this"] = "beat_this (MIT)\\nStandard · also commercial",
      ["plugin.model_md"] = "md_beat_this (CC BY-NC 4.0)\\nNon-commercial only",
      ["plugin.model_tip"] = "beat_this (CPJKU, MIT): standard, also for commercial work.\\nmd_beat_this (Masked Diffusion, CC BY-NC 4.0): non-commercial use only; installed separately (see README).",
      ["plugin.msg_analysis_error"] = "Analysis failed: {message}. Nothing in the project has changed.",
      ["plugin.msg_bad_format"] = "Unknown format '{format}', expected '{expected}'. Export the file in BeatAnalyzer under Export -> DaVinci Resolve.",
      ["plugin.msg_bin_missing"] = "media pool bin '{bin}' not available",
      ["plugin.msg_cancelled"] = "Analysis cancelled. Nothing in the project has changed.",
      ["plugin.msg_cannot_read"] = "Cannot read the file: {path}",
      ["plugin.msg_job_folder"] = "Cannot create the working folder for the analysis in resolve_temp.",
      ["plugin.msg_markers"] = "{n} markers on {clips} clip(s): {names}",
      ["plugin.msg_mp3_shift"] = "MP3: markers moved by {ms} ms (Resolve plays MP3 that much later).",
      ["plugin.msg_no_clip"] = "No clip found. Select the audio clip in the media pool, or import '{file}' into the media pool.",
      ["plugin.msg_no_markers"] = "The JSON contains no markers.",
      ["plugin.msg_no_project"] = "No project is open.",
      ["plugin.msg_no_python"] = "Python of BeatAnalyzer not found. Click 'Install in Resolve' in the web app or install BeatAnalyzer again.",
      ["plugin.msg_no_start"] = "Python did not start ({python}). Install BeatAnalyzer again or click 'Install in Resolve' in the web app.",
      ["plugin.msg_no_work_dir"] = "Subtitles: cannot create a working folder in {path}",
      ["plugin.msg_not_imported"] = "Resolve did not import {path}",
      ["plugin.msg_not_json"] = "The file is not a BeatAnalyzer marker JSON.",
      ["plugin.msg_other_file"] = "Note: the selected clip is not '{file}' from the JSON.",
      ["plugin.msg_skipped"] = "{n} markers skipped (outside the clip or not accepted by Resolve).",
      ["plugin.msg_srt_import"] = "Subtitles: {why} - import {path} by hand",
      ["plugin.msg_srt_ok"] = "Subtitles: {srt} in media pool bin '{bin}'",
      ["plugin.msg_srt_write"] = "Subtitles: cannot write {path}",
      ["plugin.msg_timeout"] = "The analysis was not finished after 10 minutes and was cancelled. Nothing in the project has changed.",
      ["plugin.msg_tl_activate"] = "Timeline: cannot activate the new subtitle track.",
      ["plugin.msg_tl_add"] = "Timeline: cannot add a subtitle track.",
      ["plugin.msg_tl_count"] = "Timeline: placed {placed} subtitles, the SRT has {count}.",
      ["plugin.msg_tl_empty"] = "Timeline: no beats in the part of the song that is in the timeline.",
      ["plugin.msg_tl_import"] = "Timeline: {why}",
      ["plugin.msg_tl_markers"] = "Timeline '{timeline}': {n} markers on {items} clip(s) of the song.",
      ["plugin.msg_tl_none_placed"] = "Timeline: Resolve placed no subtitles.",
      ["plugin.msg_tl_offset"] = "Timeline: first subtitle at frame {actual}, expected {expected} (difference {diff} frames). Please run resolve/tools/probe_timeline.lua and send the console output.",
      ["plugin.msg_tl_ok"] = "Timeline: {n} subtitles on track ST{track} '{name}'{replaced}",
      ["plugin.msg_tl_replaced"] = " (old track replaced)",
      ["plugin.msg_tl_vehicle_left"] = "Timeline: the clip '{clip}' could not be removed from the Media Pool - delete it by hand.",
      ["plugin.msg_tl_write"] = "Timeline: cannot write {path}",
      ["plugin.note_mp3"] = "MP3: Resolve plays MP3 files about 50 ms later; BeatAnalyzer moves the markers to match.",
      ["plugin.note_mp3_json"] = "MP3: the markers are set {ms} ms later (Resolve plays MP3 files that much later).",
      ["plugin.reason_analyzer_failed"] = "the analyzer could not be loaded",
      ["plugin.reason_inference_failed"] = "analysis with beat_this failed",
      ["plugin.reason_md_not_installed"] = "md_beat_this not installed",
      ["plugin.reason_model_load_failed"] = "beat_this model could not be loaded",
      ["plugin.reason_not_installed"] = "beat_this not installed",
      ["plugin.remove_confirm"] = "Remove from '{song}': {markers} BeatAnalyzer markers, {tracks} Subtitle Track(s) in the open Timeline, {srt} Subtitle clip(s) in the folder BeatAnalyzer? Markers set by hand stay.",
      ["plugin.remove_done"] = "Removed: {markers} markers, {tracks} Subtitle Track(s), {srt} Subtitle clip(s).",
      ["plugin.remove_nothing"] = "Nothing from BeatAnalyzer found on '{song}'.",
      ["plugin.sec_output"] = "2. Output in Resolve",
      ["plugin.sec_source"] = "1. Source & analysis model",
      ["plugin.smooth_label"] = "Smoothing",
      ["plugin.smooth_off"] = "off",
      ["plugin.smooth_tip"] = "0 % = off: bars as beat_this hears them.\\nMore % = a more even grid.\\n100 % = fully smoothed; starts anew only where the '1' is clearly elsewhere.\\nThe beats never change.",
      ["plugin.step_analysis"] = "Analysis of '{clip}'",
      ["plugin.step_analysis_hint"] = "Cancel works only now. Up to here nothing in the project has changed.",
      ["plugin.step_analyze"] = "analysing",
      ["plugin.step_bin"] = "Folder BeatAnalyzer in the Media Pool, Subtitle '{srt}'",
      ["plugin.step_markers"] = "Markers on the clip '{clip}' in the Media Pool",
      ["plugin.step_markers_hint"] = "Resolve sets every marker on its own, this takes a while.",
      ["plugin.step_model"] = "loading the model",
      ["plugin.step_track"] = "Subtitle Track '{track}' in '{timeline}'",
      ["plugin.step_write"] = "writing the result",
      ["plugin.task_analyze"] = "Analysing the track",
      ["plugin.task_markers"] = "Setting markers",
      ["plugin.task_subtitle"] = "Creating the Subtitle",
      ["plugin.task_track"] = "Subtitle Track in the Timeline",
      ["plugin.tasks_title"] = "Tasks",
      ["plugin.title"] = "BeatAnalyzer {version}",
      ["plugin.wait"] = "Please wait – the window closes only at the end.",
      ["plugin.wait_short"] = "Please wait …",
      ["plugin.warn_length"] = "The clip's duration ({clip}) differs from the analysed file ({json}).",
      ["plugin.warn_mp3"] = "MP3: Resolve plays MP3 files about 50 ms later than BeatAnalyzer analyses them. This JSON has no correction (older JSON or analysed in the browser): the markers lie that much before the beat. Analyse again with the server or use the song as WAV or FLAC.",
      ["plugin.warn_other_file"] = "The selected clip is not '{file}' from the JSON.",
      ["plugin.way_analyze"] = "Analyse the selected clip",
      ["plugin.way_json"] = "Load JSON",
      ["plugin.work_title"] = "What happens now:",
    },
  },
}
-- <<< BA-CONFIG <<<

-- ─── Settings ────────────────────────────────────────────────────────────────

local DOWNBEAT_COLOR = "Red"     -- marker colour of beat 1 of each bar
local BEAT_COLOR     = "Cyan"    -- marker colour of all other beats
local MARKER_TAG     = "beatthis"     -- kept from the BeatThis versions (up to 0.0.4), so their markers are replaced too
local BIN_NAME       = "BeatAnalyzer"  -- media pool bin for the subtitle files
local TRACK_PREFIX   = "BeatAnalyzer - "
local OLD_TRACK_PREFIX = "BeatThis - "       -- track name up to 0.0.4, deleted on a new run as well
local JSON_FORMAT    = "beatthis-resolve-markers/1"   -- format id kept: JSON files of older versions still work
M.DOWNBEAT_COLOR, M.BEAT_COLOR, M.MARKER_TAG, M.JSON_FORMAT = DOWNBEAT_COLOR, BEAT_COLOR, MARKER_TAG, JSON_FORMAT

-- ─── Basics ──────────────────────────────────────────────────────────────────

local G_io      = rawget(_G, "io")
local G_jit     = rawget(_G, "jit")
local G_os      = rawget(_G, "os")
local G_package = rawget(_G, "package")
local IS_WIN = (G_jit ~= nil and G_jit.os == "Windows")
  or (G_package ~= nil and type(G_package.config) == "string" and G_package.config:sub(1, 1) == "\\\\")

local lines = {}
local function log(...)
  local parts = {}
  for i = 1, select("#", ...) do
    parts[#parts + 1] = tostring((select(i, ...)))
  end
  local text = table.concat(parts, " ")
  lines[#lines + 1] = text
  print("[BeatAnalyzer] " .. text)
end
M.log_lines = lines

local function round(x)
  return math.floor(x + 0.5)
end

-- ─── Texts ───────────────────────────────────────────────────────────────────
-- Texts come from the BA-CONFIG block (lang/<code>.json, written by the installer); English is the fallback.

local function lookup(key)
  local texts = BA.texts or {}
  local value = (texts[BA.lang] or {})[key]
  if value == nil then
    value = (texts.en or {})[key]
  end
  return value
end

-- Text for the key with {name} placeholders filled from vars; unknown placeholders stay as they are.
local function T(key, vars)
  local text = lookup(key) or key
  if vars then
    text = text:gsub("{([%w_]+)}", function(name)
      local v = vars[name]
      return v ~= nil and tostring(v) or nil
    end)
  end
  return text
end
M.T = T

-- Number with the decimal sign of the language: fmt_num(89.6, 1) -> "89,6" in German.
local function fmt_num(x, decimals)
  local text = string.format("%." .. decimals .. "f", tonumber(x) or 0)
  return (text:gsub("%.", lookup("_meta.decimal") or "."))
end
M.fmt_num = fmt_num

-- Percent in the format of the language ("75 %", "75%", "%75"); nil -> "–".
local function fmt_pct(fraction)
  local f = tonumber(fraction)
  if not f then
    return "–"
  end
  return T("_meta.percent", { v = round(f * 100) })
end
M.fmt_pct = fmt_pct

-- Time signature from "4/4" or "4/4 (Standard)" (marker JSON up to 0.0.5) in the format of the language:
-- Turkish "4/4'lük", "6/8'lik". Text without a time signature stays unchanged.
local function fmt_meter(text)
  local num, den = tostring(text or ""):match("^%s*(%d+)/(%d+)")
  if not num then
    return tostring(text or "")
  end
  return T("output.meter", { num = num, den = den, suffix = lookup("output.meter_suffix." .. den) or "" })
end
M.fmt_meter = fmt_meter

local resolve = rawget(_G, "resolve")
if resolve == nil and type(rawget(_G, "Resolve")) == "function" then
  resolve = Resolve()
end
local fu = rawget(_G, "fu") or rawget(_G, "fusion")
if fu == nil and resolve ~= nil then
  local ok, f = pcall(function() return resolve:Fusion() end)
  fu = ok and f or nil
end

-- Call a method of a Resolve object; errors are logged (the same one at most 3 times), never thrown.
local api_problems = {}
local function api(obj, method, ...)
  if obj == nil then
    return nil
  end
  local okf, fn = pcall(function() return obj[method] end)
  if not okf or type(fn) ~= "function" then
    api_problems[method] = (api_problems[method] or 0) + 1
    if api_problems[method] <= 3 then
      log("API not available:", method)
    end
    return nil
  end
  local ok, a, b = pcall(fn, obj, ...)
  if not ok then
    api_problems[method] = (api_problems[method] or 0) + 1
    if api_problems[method] <= 3 then
      log("API error in " .. method .. ":", a)
    end
    return nil
  end
  return a, b
end

-- A media pool clip: an object with the marker methods. GetSelectedClips() of Resolve Studio 21.2
-- also returned an entry without them, which must not be treated as a clip.
local function is_clip(obj)
  local t = type(obj)
  if t ~= "userdata" and t ~= "table" then
    return false
  end
  local ok, fn = pcall(function() return obj.AddMarker end)
  return ok and type(fn) == "function"
end

-- ─── JSON ────────────────────────────────────────────────────────────────────

-- Minimal JSON decoder (objects, arrays, strings with escapes, numbers, true/false/null).
local function json_decode(text)
  local pos = 1

  local function fail(msg)
    error(string.format("JSON error at character %d: %s", pos, msg), 0)
  end

  local function skip()
    pos = text:find("[^ \\t\\r\\n]", pos) or (#text + 1)
  end

  local value

  local function utf8_char(cp)
    if cp < 0x80 then
      return string.char(cp)
    elseif cp < 0x800 then
      return string.char(0xC0 + math.floor(cp / 0x40), 0x80 + cp % 0x40)
    elseif cp < 0x10000 then
      return string.char(0xE0 + math.floor(cp / 0x1000), 0x80 + math.floor(cp / 0x40) % 0x40, 0x80 + cp % 0x40)
    end
    return string.char(0xF0 + math.floor(cp / 0x40000), 0x80 + math.floor(cp / 0x1000) % 0x40,
                       0x80 + math.floor(cp / 0x40) % 0x40, 0x80 + cp % 0x40)
  end

  local escapes = { ['"'] = '"', ["\\\\"] = "\\\\", ["/"] = "/", b = "\\b", f = "\\f", n = "\\n", r = "\\r", t = "\\t" }

  local function str()
    pos = pos + 1
    local out = {}
    while true do
      local c = text:sub(pos, pos)
      if c == "" then
        fail("unterminated string")
      elseif c == '"' then
        pos = pos + 1
        return table.concat(out)
      elseif c == "\\\\" then
        local e = text:sub(pos + 1, pos + 1)
        if e == "u" then
          local hex = text:sub(pos + 2, pos + 5)
          local cp = tonumber(hex, 16) or fail("bad \\\\u escape")
          pos = pos + 6
          if cp >= 0xD800 and cp <= 0xDBFF and text:sub(pos, pos + 1) == "\\\\u" then
            local lo = tonumber(text:sub(pos + 2, pos + 5), 16)
            if lo and lo >= 0xDC00 and lo <= 0xDFFF then
              cp = 0x10000 + (cp - 0xD800) * 0x400 + (lo - 0xDC00)
              pos = pos + 6
            end
          end
          out[#out + 1] = utf8_char(cp)
        else
          out[#out + 1] = escapes[e] or fail("bad escape \\\\" .. e)
          pos = pos + 2
        end
      else
        local stop = text:find('["\\\\]', pos) or (#text + 1)
        out[#out + 1] = text:sub(pos, stop - 1)
        pos = stop
      end
    end
  end

  function value()
    skip()
    local c = text:sub(pos, pos)
    if c == "{" then
      local obj = {}
      pos = pos + 1
      skip()
      if text:sub(pos, pos) == "}" then
        pos = pos + 1
        return obj
      end
      while true do
        skip()
        if text:sub(pos, pos) ~= '"' then fail("expected key") end
        local k = str()
        skip()
        if text:sub(pos, pos) ~= ":" then fail("expected ':'") end
        pos = pos + 1
        obj[k] = value()
        skip()
        local d = text:sub(pos, pos)
        pos = pos + 1
        if d == "}" then return obj end
        if d ~= "," then fail("expected ',' or '}'") end
      end
    elseif c == "[" then
      local arr = {}
      pos = pos + 1
      skip()
      if text:sub(pos, pos) == "]" then
        pos = pos + 1
        return arr
      end
      while true do
        arr[#arr + 1] = value()
        skip()
        local d = text:sub(pos, pos)
        pos = pos + 1
        if d == "]" then return arr end
        if d ~= "," then fail("expected ',' or ']'") end
      end
    elseif c == '"' then
      return str()
    elseif text:sub(pos, pos + 3) == "true" then
      pos = pos + 4
      return true
    elseif text:sub(pos, pos + 4) == "false" then
      pos = pos + 5
      return false
    elseif text:sub(pos, pos + 3) == "null" then
      pos = pos + 4
      return nil
    end
    local num = text:match("^-?%d+%.?%d*[eE]?[-+]?%d*", pos)
    if not num or num == "" then fail("unexpected character '" .. c .. "'") end
    pos = pos + #num
    return tonumber(num) or fail("bad number " .. num)
  end

  local result = value()
  skip()
  if pos <= #text then fail("text after the JSON value") end
  return result
end
M.json_decode = json_decode

-- ─── Files ───────────────────────────────────────────────────────────────────

-- On Windows, io.open in Resolve's Lua cannot open paths with non-ASCII characters.
-- _wfopen with the UTF-8 path converted to UTF-16 can.
local ffi_lib, msvcrt = nil, nil

-- UTF-8 -> UTF-16 for the _w functions of msvcrt (only after wide_open has loaded ffi).
local function wide(s)
  local ffi = ffi_lib
  local n = ffi.C.MultiByteToWideChar(65001, 0, s, -1, nil, 0)
  local buf = ffi.new("wchar_t[?]", n)
  ffi.C.MultiByteToWideChar(65001, 0, s, -1, buf, n)
  return buf
end
-- ffi and msvcrt, loaded once (Windows only); false if not available.
local function load_msvcrt()
  if not IS_WIN then
    return false
  end
  if ffi_lib == nil then
    local okr, ffi = pcall(require, "ffi")
    if not okr or not ffi then
      ffi_lib = false
      return false
    end
    pcall(ffi.cdef, [[
      int MultiByteToWideChar(unsigned int cp, unsigned long flags, const char* s, int n, wchar_t* out, int outn);
      void* _wfopen(const wchar_t* name, const wchar_t* mode);
      size_t fread(void* buf, size_t size, size_t n, void* f);
      size_t fwrite(const void* buf, size_t size, size_t n, void* f);
      int fclose(void* f);
      int _wremove(const wchar_t* name);
      int _wrmdir(const wchar_t* name);
      int _wmkdir(const wchar_t* name);
    ]])
    local okl, lib = pcall(ffi.load, "msvcrt")
    ffi_lib, msvcrt = ffi, okl and lib or nil
  end
  return ffi_lib and msvcrt and true or false
end

local function wide_open(path, mode)
  if not load_msvcrt() then
    return nil
  end
  local f = msvcrt._wfopen(wide(path), wide(mode))
  if f == nil then
    return nil
  end
  return f
end

local function read_file_wide(path)
  local ok, text = pcall(function()
    local f = wide_open(path, "rb")
    if not f then
      return nil
    end
    local chunks, buf = {}, ffi_lib.new("char[65536]")
    while true do
      local got = tonumber(msvcrt.fread(buf, 1, 65536, f))
      if got <= 0 then break end
      chunks[#chunks + 1] = ffi_lib.string(buf, got)
    end
    msvcrt.fclose(f)
    return table.concat(chunks)
  end)
  if ok then
    return text
  end
  log("Wide read failed:", text)
  return nil
end

local function read_file(path)
  if type(G_io) == "table" and type(G_io.open) == "function" then
    local f = G_io.open(path, "rb")
    if f then
      local text = f:read("*a")
      f:close()
      return text
    end
  end
  return read_file_wide(path)
end
M.read_file = read_file

-- Write text to a file. On Windows a path with non-ASCII characters goes through _wfopen,
-- because io.open would create the file under a garbled name instead of failing.
local function write_file(path, text)
  if IS_WIN and path:find("[\\128-\\255]") then
    local ok, done = pcall(function()
      local f = wide_open(path, "wb")
      if not f then
        return false
      end
      local n = tonumber(msvcrt.fwrite(text, 1, #text, f))
      msvcrt.fclose(f)
      return n == #text
    end)
    return ok and done
  end
  if type(G_io) == "table" and type(G_io.open) == "function" then
    local f = G_io.open(path, "wb")
    if f then
      f:write(text)
      f:close()
      return true
    end
  end
  return false
end
M.write_file = write_file

local SEP = IS_WIN and "\\\\" or "/"

-- Delete a file. On Windows through _wremove (Unicode paths; os.remove cannot open non-ASCII paths).
local function remove_file(path)
  if IS_WIN and load_msvcrt() then
    local ok, r = pcall(function() return msvcrt._wremove(wide(path)) end)
    return ok and r == 0
  end
  return G_os ~= nil and G_os.remove(path) == true
end
M.remove_file = remove_file

-- Delete an empty folder. On Windows through _wrmdir (remove() of the CRT cannot delete folders).
local function remove_dir(path)
  local done = false
  if IS_WIN and load_msvcrt() then
    local ok, r = pcall(function() return msvcrt._wrmdir(wide(path)) end)
    done = ok and r == 0
  else
    done = G_os ~= nil and G_os.remove(path) == true   -- POSIX: removes an empty folder
  end
  if not done then
    log("Cannot remove the folder", path)
  end
  return done
end
M.remove_dir = remove_dir

-- Create one folder. On Windows through _wmkdir (Unicode paths, no console window); else mkdir -p.
-- True only if the folder was created; an existing folder gives false.
local function make_dir(path)
  if IS_WIN and load_msvcrt() then
    local ok, r = pcall(function() return msvcrt._wmkdir(wide(path)) end)
    return ok and r == 0
  end
  if not (G_os and type(G_os.execute) == "function") then
    return false
  end
  local r = G_os.execute("mkdir '" .. path:gsub("'", "'\\\\''") .. "' 2>/dev/null")
  return r == 0 or r == true
end

local function work_base()
  return BA.home and (BA.home .. SEP .. "resolve_temp")
    or (G_os and (G_os.getenv("TEMP") or G_os.getenv("TMP"))) or "/tmp"
end
M.work_base = work_base

-- New working folder for the SRT files: <BeatAnalyzer>/resolve_temp/<date-time>-<random>, without a known
-- BeatAnalyzer folder in the temp folder of the system. nil if it cannot be created.
function M.work_dir()
  local base = work_base()
  make_dir(base)   -- usually there already
  local path = base .. SEP .. G_os.date("%Y%m%d-%H%M%S") .. "-" .. string.format("%04d", math.random(0, 9999))
  if not make_dir(path) then
    log("Cannot create the working folder", path)
    return nil
  end
  return path
end

-- ─── Markers ─────────────────────────────────────────────────────────────────

local function parse_fps(value)
  local s = tostring(value or ""):match("%d+[%.,]?%d*")
  local n = s and tonumber((s:gsub(",", "."))) or nil
  if n == nil or n <= 0 then
    return nil
  end
  return n
end
M.parse_fps = parse_fps

-- 29.97 -> 30000/1001 (likewise 23.976, 47.952, 59.94, 119.88)
local function exact_fps(fps)
  for _, base in ipairs({ 24, 30, 48, 60, 120 }) do
    local ntsc = base * 1000 / 1001
    if math.abs(fps - ntsc) < 0.005 then
      return ntsc
    end
  end
  return fps
end
M.exact_fps = exact_fps

-- Check the decoded JSON and return its marker list, or nil and a message.
local function validate(data)
  if type(data) ~= "table" then
    return nil, T("plugin.msg_not_json")
  end
  if data.format ~= JSON_FORMAT then
    return nil, T("plugin.msg_bad_format", { format = tostring(data.format), expected = JSON_FORMAT })
  end
  if type(data.markers) ~= "table" or #data.markers == 0 then
    return nil, T("plugin.msg_no_markers")
  end
  return data.markers
end
M.validate = validate

local function clip_list(folder, out)
  for _, clip in pairs(api(folder, "GetClipList") or {}) do
    out[#out + 1] = clip
  end
  for _, sub in pairs(api(folder, "GetSubFolderList") or {}) do
    clip_list(sub, out)
  end
  return out
end

-- Clips selected in the media pool; without a selection the clips with the file name from the JSON.
-- Clips selected in the media pool (entries without clip methods are ignored).
local function selected_clips(media_pool)
  local selected, ignored = {}, {}
  for key, clip in pairs(api(media_pool, "GetSelectedClips") or {}) do
    if is_clip(clip) then
      selected[#selected + 1] = clip
    else
      ignored[#ignored + 1] = tostring(key) .. "=" .. type(clip)
    end
  end
  local text = table.concat(ignored, ", ")
  if #ignored > 0 and text ~= M.last_ignored then   -- the window checks every second: log it once
    log("Selection: ignored entries that are not clips:", text)
  end
  M.last_ignored = text
  return selected
end
M.selected_clips = selected_clips

local function target_clips(media_pool, file_name)
  local selected = selected_clips(media_pool)
  if #selected > 0 then
    return selected, "selection"
  end
  local found = {}
  for _, clip in ipairs(clip_list(api(media_pool, "GetRootFolder"), {})) do
    if is_clip(clip) and tostring(api(clip, "GetClipProperty", "File Name") or "") == file_name then
      found[#found + 1] = clip
    end
  end
  return found, "file name"
end
M.target_clips = target_clips

-- ─── Analysis job (Teilprojekt 3) ─────────────────────────────────────────────
-- The script writes job.txt into a new working folder, starts backend/resolve_job.py with the Python of the venv
-- without a window and polls progress.txt / done.txt (see backend/resolve_job.py).

local JOB_FORMAT = "beatanalyzer-resolve-job/1"
local JOB_FILES = { "job.txt", "progress.txt", "progress.txt.tmp", "done.txt", "done.txt.tmp", "markers.json",
                    "markers.json.tmp", "cancel.txt", "log.txt" }

-- True if the file can be opened (non-ASCII paths on Windows through _wfopen).
local function file_exists(path)
  if type(G_io) == "table" and type(G_io.open) == "function" then
    local f = G_io.open(path, "rb")
    if f then
      f:close()
      return true
    end
  end
  if IS_WIN then
    local ok, f = pcall(wide_open, path, "rb")
    if ok and f then
      msvcrt.fclose(f)
      return true
    end
  end
  return false
end
M.NO_START_SECONDS, M.TIMEOUT_SECONDS, M.JOB_MAX_AGE = 60, 600, 86400

-- "Glätten" 1 ... 100 % -> protection of clear "1"s 0.5 ... 1.0 (as in the web app); 0 = off
function M.slider_to_protect(v)
  v = math.max(0, math.min(100, tonumber(v) or 90))
  return math.floor((0.5 + v / 200) * 1000 + 0.5) / 1000
end

local function read_kv(path)
  local text = read_file(path)
  if not text then
    return nil
  end
  local out = {}
  for line in (text .. "\\n"):gmatch("(.-)\\r?\\n") do
    local k, v = line:match("^%s*([^=]-)%s*=%s*(.-)%s*$")
    if k and k ~= "" then
      out[k] = v
    end
  end
  return out
end

local function jobs_list()
  return work_base() .. SEP .. "jobs.txt"
end

-- New job folder with job.txt. opts: lang, slider (0 ... 100), model ("beat_this" | "md_beat_this"), now (for
-- tests). Returns the folder or nil, error.
function M.new_job(audio_path, opts)
  opts = opts or {}
  local dir = M.work_dir()
  if not dir then
    return nil, T("plugin.msg_job_folder")
  end
  local slider = tonumber(opts.slider) or 90
  local text = table.concat({
    "format=" .. JOB_FORMAT,
    "audio=" .. tostring(audio_path),
    "lang=" .. tostring(opts.lang or BA.lang or "en"),
    "smooth=" .. (slider > 0 and "1" or "0"),
    "protect=" .. string.format("%g", M.slider_to_protect(slider > 0 and slider or 90)),
    "model=" .. (opts.model == "md_beat_this" and "md_beat_this" or "beat_this"),
  }, "\\n") .. "\\n"
  if not write_file(dir .. SEP .. "job.txt", text) then
    return nil, T("plugin.msg_job_folder")
  end
  -- remembered for cleanup_jobs: Lua cannot list a folder
  local list = read_file(jobs_list()) or ""
  write_file(jobs_list(), list .. tostring(opts.now or G_os.time()) .. "\\t" .. dir .. "\\n")
  return dir
end

-- Start the job without a window. M.spawn is the fallback (and the hook for tests).
function M.spawn(cmd)
  local r = G_os.execute(cmd)
  return r == 0 or r == true
end

local function quote(s)
  if IS_WIN then
    return '"' .. s .. '"'
  end
  return "'" .. s:gsub("'", "'\\\\''") .. "'"
end

local function shell_execute(python, params)
  if not load_msvcrt() then
    return false
  end
  local ok, r = pcall(function()
    pcall(ffi_lib.cdef, [[
      void* ShellExecuteW(void* hwnd, const wchar_t* op, const wchar_t* file, const wchar_t* params,
                          const wchar_t* dir, int show);
    ]])
    local shell32 = ffi_lib.load("shell32")
    local h = shell32.ShellExecuteW(nil, wide("open"), wide(python), wide(params), nil, 0)   -- 0 = SW_HIDE
    return tonumber(ffi_lib.cast("intptr_t", h)) > 32
  end)
  if not ok then
    log("ShellExecuteW failed:", r)
  end
  return ok and r
end
M.shell_execute = shell_execute   -- hook for tests (on Windows the first way to start Python)

function M.launch(job_dir)
  if not BA.python or not BA.home or not file_exists(BA.python) then   -- e.g. the venv was deleted
    return false, T("plugin.msg_no_python")
  end
  local script = BA.home .. SEP .. "backend" .. SEP .. "resolve_job.py"
  local params = quote(script) .. " " .. quote(job_dir)
  log("Start:", BA.python, params)
  if IS_WIN and M.shell_execute(BA.python, params) then
    return true
  end
  local cmd = quote(BA.python) .. " " .. params
  if IS_WIN then
    cmd = 'start "" /b ' .. cmd
  else
    cmd = cmd .. " >/dev/null 2>&1 &"
  end
  if M.spawn(cmd) then
    return true
  end
  return false, T("plugin.msg_no_start", { python = BA.python })
end

-- State of a job: running (step), ok (markers_path), error (message), cancelled, no_start, timeout.
function M.poll(job_dir, started, now)
  local done = read_kv(job_dir .. SEP .. "done.txt")
  if done and done.state then
    return { state = done.state, message = done.message,
             markers_path = done.markers and (job_dir .. SEP .. done.markers) or nil }
  end
  local progress = read_kv(job_dir .. SEP .. "progress.txt")
  local elapsed = (now or G_os.time()) - (started or 0)
  if not progress and elapsed > M.NO_START_SECONDS then
    return { state = "no_start" }
  end
  if elapsed > M.TIMEOUT_SECONDS then
    return { state = "timeout" }
  end
  return { state = "running", step = progress and progress.step or nil }
end

function M.cancel(job_dir)
  return write_file(job_dir .. SEP .. "cancel.txt", "")
end

function M.remove_job(job_dir)
  for _, name in ipairs(JOB_FILES) do
    remove_file(job_dir .. SEP .. name)
  end
  return remove_dir(job_dir)
end

-- Remove job folders older than a day (a crash or a closed Resolve leaves them behind).
function M.cleanup_jobs(now)
  local list = read_file(jobs_list())
  if not list then
    return 0
  end
  local keep, removed = {}, 0
  for line in list:gmatch("[^\\n]+") do
    local t, dir = line:match("^(%d+)\\t(.+)$")
    if t and not file_exists(dir .. SEP .. "job.txt") then
      -- gone already (removed after a successful run): forget it quietly
    elseif t and (file_exists(dir .. SEP .. "done.txt") or (now or G_os.time()) - tonumber(t) > M.JOB_MAX_AGE) then
      -- Python is done (also after Cancel), or the job hangs for more than a day
      M.remove_job(dir)
      removed = removed + 1
    elseif t then
      keep[#keep + 1] = line
    end
  end
  write_file(jobs_list(), #keep > 0 and (table.concat(keep, "\\n") .. "\\n") or "")
  return removed
end

-- The clip to analyse: exactly one selected clip with a file path. Returns clip or nil, "none"|"many"|"no_path".
function M.analysis_target(media_pool)
  local clips = selected_clips(media_pool)
  if #clips == 0 then
    return nil, "none"
  elseif #clips > 1 then
    return nil, "many"
  end
  local path = api(clips[1], "GetClipProperty", "File Path")
  if type(path) ~= "string" or path == "" then
    return nil, "no_path"
  end
  return clips[1], nil
end

local function remove_own_markers(clip)
  local removed = 0
  for _ = 1, 100000 do
    if not api(clip, "DeleteMarkerByCustomData", MARKER_TAG) then
      break
    end
    removed = removed + 1
  end
  return removed
end

-- Put the markers on one media pool clip. Returns added, skipped, removed.
-- Marker colours of Resolve; "none" = no marker for this beat of the bar.
M.MARKER_COLORS = { "Blue", "Cyan", "Green", "Yellow", "Red", "Pink", "Purple", "Fuchsia", "Rose", "Lavender",
                    "Sky", "Mint", "Lemon", "Sand", "Cocoa", "Cream" }
M.NO_MARKER = "none"
-- md_beat_this (Masked Diffusion, CC BY-NC 4.0): non-commercial use only; shown in the window with its address
M.MD_URL = "https://github.com/fosfrancesco/md_beat_this"

M.DEFAULT_COLORS = { downbeat = DOWNBEAT_COLOR, beat2 = BEAT_COLOR, beat3 = BEAT_COLOR, beat4 = BEAT_COLOR,
                     other = BEAT_COLOR }
local COLOR_OK = {}
for _, c in ipairs(M.MARKER_COLORS) do
  COLOR_OK[c] = true
end

-- Colour of a marker by its beat in the bar: downbeat, beat 2-4, all others; nil = no marker.
-- An unknown colour falls back to the default of that slot.
function M.marker_color(m, colors)
  local slot = m.type == "downbeat" and "downbeat"
    or ((tonumber(m.beat) or 0) >= 2 and (tonumber(m.beat) or 0) <= 4 and ("beat" .. tonumber(m.beat)))
    or "other"
  local color = colors and colors[slot]
  if color == M.NO_MARKER then
    return nil
  end
  return COLOR_OK[color] and color or M.DEFAULT_COLORS[slot]
end


-- ─── Subtitles ──────────────────────────────────────────────────────────────

local function srt_time(sec)
  local ms = math.max(0, round(sec * 1000))
  return string.format("%02d:%02d:%02d,%03d", math.floor(ms / 3600000), math.floor(ms / 60000) % 60,
                       math.floor(ms / 1000) % 60, ms % 1000)
end

local function clock(sec)
  local ms = math.max(0, round(sec * 1000))
  return string.format("%02d:%02d.%03d", math.floor(ms / 60000), math.floor(ms / 1000) % 60, ms % 1000)
end

M.INFO_GAP = 0.5   -- seconds before the first beat needed for an own info subtitle; else it goes under that beat

-- Info block of every subtitle: BeatAnalyzer, file, tempo and meter, model with licence (if the JSON has one).
function M.info_lines(data)
  local text = T("output.intro", { file = tostring(data.fileName or ""),
                                   bpm = tonumber(data.globalBpm) and fmt_num(data.globalBpm, 1) or "?",
                                   meter = fmt_meter(data.timeSignature or "?") })
  local model = type(data.engine) == "table" and type(data.engine.model) == "table" and data.engine.model or nil
  if model and model.name then
    text = text .. "\\n" .. T("output.model_line", { name = tostring(model.name),
                                                     license = tostring(model.license or "?") })
  end
  return text
end

-- SRT with one subtitle per marker, shown until the next one. Four lines per beat, in the language of
-- BA.lang (English here):
--   Downbeat (1) | Beat 2
--   Bar 24 – Beat 1
--   01:02.880 – 89.6 BPM
--   Confidence 75%
-- Plus the info block (M.info_lines) per part of the song: its own subtitle before the first beat when there are
-- at least M.INFO_GAP seconds, else under the lines of the first beat. Without opts (media-pool SRT) a first
-- subtitle from 0 s to the first beat keeps the timing when the SRT is placed at the clip start.
-- opts.from / opts.to: only beats in this part of the song (seconds), the last subtitle ends at "to".
-- opts.shift: seconds added to every time (position of song second 0 in the timeline).
-- opts.segments: several such parts { shift, from, to } (every use of the song on one audio track).
-- Returns the SRT text, the number of subtitles and the time of the first one (after the shift).
local function build_srt(data, opts)
  opts = opts or {}
  -- opts.segments: several parts of the song, each { shift, from, to } (one per use of the song on a track)
  local segments = opts.segments or { { shift = opts.shift or 0, from = opts.from, to = opts.to } }
  local info = M.info_lines(data)
  -- md_beat_this gives no confidence: no "Confidence" line (other JSONs without a value show "–")
  local no_confidence = type(data.engine) == "table" and data.engine.id == "md_beat_this"
  local cues = {}
  for _, seg in ipairs(segments) do
    local shift, from, to = seg.shift or 0, seg.from, seg.to
    local markers = {}
    for _, m in ipairs(data.markers) do
      local t = tonumber(m.time)
      if t and (not from or t >= from - 1e-6) and (not to or t < to) then
        markers[#markers + 1] = m
      end
    end
    if #markers > 0 then
      local first = tonumber(markers[1].time)
      local start = from or 0
      -- info block before the first beat of this part, or under the first beat when there is no room
      local info_under = first - start < M.INFO_GAP
      if not info_under then
        cues[#cues + 1] = { start + shift, first + shift, info }
      elseif not from and first > 0.05 then
        -- media-pool SRT: a cue from 0 s keeps the timing when the SRT is placed at the clip start, even when the
        -- room is too short to read the info block there (it is also under the first beat then)
        cues[#cues + 1] = { shift, first + shift, info }
      end
      for i, m in ipairs(markers) do
        local t = tonumber(m.time)
        local nxt = markers[i + 1] and tonumber(markers[i + 1].time)
        if not nxt then
          local prev = markers[i - 1] and tonumber(markers[i - 1].time)
          nxt = t + (prev and math.max(0.1, t - prev) or 0.5)
          if to and nxt > to then
            nxt = to
          end
        end
        local bar, beat = tonumber(m.bar) or 0, tonumber(m.beat) or 0
        local kind = m.type == "downbeat" and T("output.kind_downbeat") or T("output.kind_beat", { beat = beat })
        local lines = {
          kind,
          T("output.bar_beat", { bar = bar, beat = beat }),
          T("output.time_bpm", { clock = clock(t), bpm = fmt_num(m.bpm, 1) }),
        }
        if not no_confidence then
          lines[#lines + 1] = T("output.confidence", { value = fmt_pct(m.confidence) })
        end
        if i == 1 and info_under then
          lines[#lines + 1] = info   -- no empty line: in an SRT it would end the subtitle
        end
        cues[#cues + 1] = { t + shift, nxt + shift, table.concat(lines, "\\n") }
      end
    end
  end
  if #cues == 0 then
    return "", 0, nil
  end
  table.sort(cues, function(a, b) return a[1] < b[1] end)
  local out = {}
  for i, c in ipairs(cues) do
    out[#out + 1] = string.format("%d\\n%s --> %s\\n%s\\n", i, srt_time(c[1]), srt_time(c[2]), c[3])
  end
  return table.concat(out, "\\n"), #cues, cues[1][1]
end
M.build_srt = build_srt

-- Note of a marker: the same parts as its subtitle, e.g. "Takt 24 – Beat 2 | 106,860 s | 120,0 BPM | Confidence 75 %".
function M.marker_note(m)
  local parts = {
    T("output.bar_beat", { bar = tonumber(m.bar) or 0, beat = tonumber(m.beat) or 0 }),
    T("output.marker_note", { time = fmt_num(m.time, 3), bpm = fmt_num(m.bpm, 1) }),
  }
  if tonumber(m.confidence) then
    parts[#parts + 1] = T("output.confidence", { value = fmt_pct(m.confidence) })
  end
  return table.concat(parts, " | ")
end

-- "C:\\\\Downloads\\\\x.json" + "01. Song.flac" -> "C:\\\\Downloads\\\\01. Song.srt"
-- "<dir>" + "01. Song.flac" -> "<dir>/01. Song.srt"; without a file name the name of the JSON.
local function srt_path(dir, file_name, json_path)
  local base = file_name:gsub("%.[^%.]*$", "")
  if base == "" then
    base = (json_path:match("([^/\\\\]+)$") or "BeatAnalyzer"):gsub("%.[^%.]*$", "")
  end
  base = base:gsub('[<>:"/\\\\|%?%*]', "_")
  return dir .. SEP .. base .. ".srt", base .. ".srt"
end
M.srt_path = srt_path

-- The bin BIN_NAME; created if missing unless only_find is set.
local function find_bin(media_pool, only_find)
  local root = api(media_pool, "GetRootFolder")
  for _, sub in pairs(api(root, "GetSubFolderList") or {}) do
    if api(sub, "GetName") == BIN_NAME then
      return sub
    end
  end
  if only_find then
    return nil
  end
  return api(media_pool, "AddSubFolder", root, BIN_NAME)
end

-- Import the SRT into the bin BIN_NAME; a clip of the same name from an earlier run is replaced.
local function import_subtitles(media_pool, path, name)
  local bin = find_bin(media_pool)
  if not bin then
    return nil, T("plugin.msg_bin_missing", { bin = BIN_NAME })
  end
  local old = {}
  for _, clip in pairs(api(bin, "GetClipList") or {}) do
    if is_clip(clip) and api(clip, "GetName") == name then
      old[#old + 1] = clip
    end
  end
  if #old > 0 then
    api(media_pool, "DeleteClips", old)
  end
  local previous = api(media_pool, "GetCurrentFolder")
  api(media_pool, "SetCurrentFolder", bin)
  local items = api(media_pool, "ImportMedia", { path })
  if previous then
    api(media_pool, "SetCurrentFolder", previous)
  end
  local item = items and items[1]
  if not item then
    return nil, T("plugin.msg_not_imported", { path = path })
  end
  log(string.format("Subtitles imported: %s (%d replaced)", tostring(api(item, "GetName") or name), #old))
  return item
end

-- ─── Timeline ───────────────────────────────────────────────────────────────
-- Resolve Studio 21.1.2 (tested for the WhisperX Workbench, resolve/tools/probe_timeline.lua checks it here):
-- AppendToTimeline puts an SRT only on the active subtitle track; on an empty track the SRT times count
-- from the timeline start; recordFrame is ignored; AddTrack("subtitle") creates an inactive track.
-- So the SRT for the timeline carries timeline times and goes onto a new, only active subtitle track.

local function media_key(clip)
  local id = api(clip, "GetMediaId")
  if id and id ~= "" then
    return "id:" .. tostring(id)
  end
  return "path:" .. tostring(api(clip, "GetClipProperty", "File Path") or api(clip, "GetName") or "?")
end

-- First use (smallest start) of one of the clips on an audio track: timeline item or nil.
-- All clips of the song in a timeline (audio and video tracks), for the markers on the timeline clips.
function M.timeline_items(tl, clips)
  local keys, out = {}, {}
  for _, c in ipairs(clips or {}) do
    keys[media_key(c)] = true
  end
  if not tl then
    return out
  end
  for _, kind in ipairs({ "audio", "video" }) do
    local n = tonumber(api(tl, "GetTrackCount", kind)) or 0
    for i = 1, n do
      for _, item in ipairs(api(tl, "GetItemListInTrack", kind, i) or {}) do
        local mpi = api(item, "GetMediaPoolItem")
        if mpi and keys[media_key(mpi)] then
          out[#out + 1] = item
        end
      end
    end
  end
  return out
end

-- Audio tracks with the song: { { track = i, items = { ... } }, ... } in track order.
local function song_tracks(tl, clips)
  local keys, out = {}, {}
  for _, c in ipairs(clips or {}) do
    keys[media_key(c)] = true
  end
  local n = tl and tonumber(api(tl, "GetTrackCount", "audio")) or 0
  for i = 1, n do
    local list = {}
    for _, item in ipairs(api(tl, "GetItemListInTrack", "audio", i) or {}) do
      local mpi = api(item, "GetMediaPoolItem")
      if mpi and keys[media_key(mpi)] then
        list[#list + 1] = item
      end
    end
    if #list > 0 then
      out[#out + 1] = { track = i, items = list }
    end
  end
  return out
end
M.song_tracks = song_tracks

-- Our subtitle track of a song: "BeatAnalyzer - <song>", "BeatAnalyzer - <song> (A<n>)" or "BeatThis - <song>".
local function is_song_track(name, song)
  if type(name) ~= "string" then
    return false
  end
  if name == TRACK_PREFIX .. song or name == OLD_TRACK_PREFIX .. song then
    return true
  end
  local prefix = TRACK_PREFIX .. song .. " (A"
  return name:sub(1, #prefix) == prefix and name:sub(#prefix + 1):match("^%d+%)$") ~= nil
end

local function first_use(tl, clips)
  local keys = {}
  for _, c in ipairs(clips) do
    keys[media_key(c)] = true
  end
  local best, best_start, best_track
  local n = tonumber(api(tl, "GetTrackCount", "audio")) or 0
  for i = 1, n do
    for _, item in ipairs(api(tl, "GetItemListInTrack", "audio", i) or {}) do
      local mpi = api(item, "GetMediaPoolItem")
      local start = tonumber(api(item, "GetStart"))
      if mpi and start and keys[media_key(mpi)] and (not best_start or start < best_start) then
        best, best_start, best_track = item, start, i
      end
    end
  end
  return best, best_track
end
M.first_use = first_use

local function subtitle_count(tl, i)
  local items = api(tl, "GetItemListInTrack", "subtitle", i)
  return type(items) == "table" and #items or 0   -- # not pairs(): pairs() reports 1 on an empty track
end

-- Delete all subtitle tracks of the song (every form of the name, see is_song_track), from the last one,
-- so the indexes stay valid.
local function delete_song_tracks(tl, song)
  local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  local deleted = 0
  for i = n, 1, -1 do
    if is_song_track(api(tl, "GetTrackName", "subtitle", i), song) and api(tl, "DeleteTrack", "subtitle", i) then
      deleted = deleted + 1
    end
  end
  return deleted
end

-- Only one subtitle track can be active: deactivate all others, then activate the target.
local function activate_only(tl, target)
  local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  for i = 1, n do
    if i ~= target then
      api(tl, "SetTrackEnable", "subtitle", i, false)
    end
  end
  api(tl, "SetTrackEnable", "subtitle", target, true)
  return api(tl, "GetIsTrackEnabled", "subtitle", target) == true
end

-- One subtitle track for the given parts (all uses of the song on one audio track). Returns a result line
-- and true if a file was kept (failed import).
-- First phase for one audio track: the SRT file. Returns prep (count, first, srt_name, srt_file, track_name) or
-- nil, a result line and true if a file was kept.
local function write_track_srt(data, segments, dir, base, track_no, several)
  local text, count, first = build_srt(data, { segments = segments })
  if count == 0 then
    return nil, T("plugin.msg_tl_empty")
  end
  local srt_name = base .. " (Timeline" .. (several and (" A" .. track_no) or "") .. ").srt"
  local srt_file = dir .. SEP .. srt_name
  if not write_file(srt_file, text) then
    return nil, T("plugin.msg_tl_write", { path = srt_file }), true
  end
  return { count = count, first = first, srt_name = srt_name, srt_file = srt_file,
           track_name = TRACK_PREFIX .. base .. (several and (" (A" .. track_no .. ")") or "") }
end

-- Second phase: import the SRT and put it on a new subtitle track.
local function place_track(media_pool, tl, prep, replaced, fps, tl_start)
  local count, first, srt_name, srt_file, track_name = prep.count, prep.first, prep.srt_name, prep.srt_file,
                                                      prep.track_name
  local srt_item, ierr = import_subtitles(media_pool, srt_file, srt_name)
  if not srt_item then
    return T("plugin.msg_srt_import", { why = tostring(ierr), path = srt_file }), true
  end
  -- The subtitles on the track belong to the project: the clip and the file are only the way there.
  -- Called on every path after the import; a clip that cannot be deleted stays and is named in the result.
  local function drop_vehicle(msg)
    local deleted_clip = api(media_pool, "DeleteClips", { srt_item })
    remove_file(srt_file)
    if not deleted_clip then
      msg = msg .. "\\n" .. T("plugin.msg_tl_vehicle_left", { clip = srt_name })
    end
    return msg
  end

  local before = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  api(tl, "AddTrack", "subtitle")
  local target = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  if target <= before then
    return drop_vehicle(T("plugin.msg_tl_add"))
  end
  if not activate_only(tl, target) then
    api(tl, "DeleteTrack", "subtitle", target)
    return drop_vehicle(T("plugin.msg_tl_activate"))
  end
  api(media_pool, "AppendToTimeline", { srt_item })
  local placed = subtitle_count(tl, target)
  if placed == 0 then
    api(tl, "DeleteTrack", "subtitle", target)
    return drop_vehicle(T("plugin.msg_tl_none_placed"))
  end
  api(tl, "SetTrackName", "subtitle", target, track_name)

  local msg = T("plugin.msg_tl_ok", { n = placed, track = target, name = track_name,
                                     replaced = replaced and T("plugin.msg_tl_replaced") or "" })
  if placed ~= count then
    msg = msg .. "\\n" .. T("plugin.msg_tl_count", { placed = placed, count = count })
  end
  local actual
  for _, it in ipairs(api(tl, "GetItemListInTrack", "subtitle", target) or {}) do
    local st = tonumber(api(it, "GetStart"))
    if st and (not actual or st < actual) then
      actual = st
    end
  end
  local expected = tl_start + round(first * fps)
  log(string.format("Timeline: first subtitle at frame %s, expected %d", tostring(actual), expected))
  if actual and math.abs(actual - expected) > 1 then
    msg = msg .. "\\n" .. T("plugin.msg_tl_offset", { actual = actual, expected = expected, diff = actual - expected })
  end
  return drop_vehicle(msg)
end

-- Subtitles under the song in the open timeline: one track per audio track with the song (user: one per track),
-- each with all uses of the song on that track, only their visible parts. Returns the result lines, or nil when
-- the song is not on an audio track of the timeline.
local function place_in_timeline(media_pool, tl, data, clips, dir, base)
  local groups = song_tracks(tl, clips)
  if #groups == 0 then
    log("Timeline: the song is not on an audio track of '" .. tostring(api(tl, "GetName") or "?") .. "'")
    return nil
  end
  local fps = exact_fps(parse_fps(api(tl, "GetSetting", "timelineFrameRate")) or 25)
  local tl_start = tonumber(api(tl, "GetStartFrame")) or 0
  local lines, kept, preps = {}, false, {}
  for _, g in ipairs(groups) do
    local segments = {}
    for _, item in ipairs(g.items) do
      local start = tonumber(api(item, "GetStart")) or tl_start
      local left = tonumber(api(item, "GetLeftOffset")) or 0
      local duration = tonumber(api(item, "GetDuration")) or 0
      local seg = { from = left / fps, to = (left + duration) / fps, shift = (start - tl_start - left) / fps }
      segments[#segments + 1] = seg
      log(string.format("Timeline '%s' A%d: song at frame %d (start %d), left offset %d, duration %d, %.3f fps -> song %.3f-%.3f s, shift %.3f s",
          tostring(api(tl, "GetName") or "?"), g.track, start, tl_start, left, duration, fps, seg.from, seg.to,
          seg.shift))
    end
    local prep, line, k = write_track_srt(data, segments, dir, base, g.track, #groups > 1)
    if prep then
      preps[#preps + 1] = prep
    else
      lines[#lines + 1] = line
      kept = kept or k == true
    end
  end
  if #preps == 0 then   -- nothing new to place: the tracks of the last run stay as they are
    return table.concat(lines, "\\n"), kept
  end
  -- The old tracks go before the import: Resolve may refuse to delete a clip that a timeline still uses, so the
  -- clip of the last run can only be replaced once its track is gone. Only now, when the new files exist.
  local replaced = delete_song_tracks(tl, base) > 0
  for _, prep in ipairs(preps) do
    local line, k = place_track(media_pool, tl, prep, replaced, fps, tl_start)
    lines[#lines + 1] = line
    kept = kept or k == true
  end
  return table.concat(lines, "\\n"), kept
end
M.place_in_timeline = place_in_timeline

-- Apply a marker JSON file. Returns true/false and a message for the user.
-- ─── Remove ──────────────────────────────────────────────────────────────────
-- Everything BeatAnalyzer put on a song: own markers on the clips, the subtitle tracks "BeatAnalyzer - <song>"
-- (and "BeatThis - <song>") in the open timeline, the subtitle clips of the song in the bin BeatAnalyzer.

local function removal_targets(clips, tl)
  local song = tostring(api(clips[1], "GetClipProperty", "File Name") or api(clips[1], "GetName") or "")
  song = song:gsub("%.[^%.]*$", "")
  local t = { song = song, markers = 0, tracks = 0, srt_clips = 0, srt_items = {} }
  for _, clip in ipairs(clips) do
    for _, m in pairs(api(clip, "GetMarkers") or {}) do
      if type(m) == "table" and m.customData == MARKER_TAG then
        t.markers = t.markers + 1
      end
    end
  end
  for _, item in ipairs(M.timeline_items(tl, clips)) do
    for _, m in pairs(api(item, "GetMarkers") or {}) do
      if type(m) == "table" and m.customData == MARKER_TAG then
        t.markers = t.markers + 1
      end
    end
  end
  if tl then
    local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
    for i = 1, n do
      if is_song_track(api(tl, "GetTrackName", "subtitle", i), song) then
        t.tracks = t.tracks + 1
      end
    end
  end
  local pm = api(resolve, "GetProjectManager")
  local project = pm and api(pm, "GetCurrentProject")
  t.media_pool = project and api(project, "GetMediaPool")
  local bin = t.media_pool and find_bin(t.media_pool, true)
  for _, clip in pairs(bin and api(bin, "GetClipList") or {}) do
    local name = is_clip(clip) and api(clip, "GetName")
    if name == song .. ".srt" or name == song .. " (Timeline).srt" then
      t.srt_items[#t.srt_items + 1] = clip
    end
  end
  t.srt_clips = #t.srt_items
  return t
end

-- What "Remove BeatAnalyzer markers" would delete, with the question for the window; deletes nothing.
function M.removal(clips, tl)
  local t = removal_targets(clips, tl)
  if t.markers + t.tracks + t.srt_clips == 0 then
    t.text = T("plugin.remove_nothing", { song = t.song })
  else
    t.text = T("plugin.remove_confirm", { song = t.song, markers = t.markers, tracks = t.tracks, srt = t.srt_clips })
  end
  return t
end

-- Delete it; markers set by hand stay.
function M.remove(clips, tl)
  local t = removal_targets(clips, tl)
  local done = { markers = 0, tracks = 0, srt_clips = 0 }
  for _, clip in ipairs(clips) do
    done.markers = done.markers + remove_own_markers(clip)
  end
  for _, item in ipairs(M.timeline_items(tl, clips)) do
    done.markers = done.markers + remove_own_markers(item)
  end
  if tl then
    done.tracks = delete_song_tracks(tl, t.song)
  end
  if #t.srt_items > 0 and api(t.media_pool, "DeleteClips", t.srt_items) then
    done.srt_clips = #t.srt_items
  end
  done.text = T("plugin.remove_done", { markers = done.markers, tracks = done.tracks, srt = done.srt_clips })
  log(done.text)
  return done
end

-- ─── Selection ───────────────────────────────────────────────────────────────
-- What the window shows before OK: the clip, warnings, the analysis program, the timeline.

M.LENGTH_TOLERANCE = 0.5   -- seconds between the length in the JSON and the clip before a warning

-- 222.4 -> "3:42"; with tenths: "3:42.4"
function M.fmt_length(seconds, tenths)
  local x = tonumber(seconds) or 0
  if tenths then
    local t = round(x * 10) / 10
    return string.format("%d:%04.1f", math.floor(t / 60), t - 60 * math.floor(t / 60))
  end
  local total = round(x)
  return string.format("%d:%02d", math.floor(total / 60), total % 60)
end

-- Frame number -> "01:00:10:00" at a whole frame rate (23.976 counts as 24).
function M.timecode(frame, fps)
  local f = round(tonumber(fps) or 25)
  local n = math.max(0, round(tonumber(frame) or 0))
  return string.format("%02d:%02d:%02d:%02d", math.floor(n / (3600 * f)), math.floor(n / (60 * f)) % 60,
                       math.floor(n / f) % 60, n % f)
end

-- "beat_this (CUDA, RTX 3080)", "beat_this (CPU)", "md_beat_this (CPU)", "librosa – <reason>" from the field
-- engine of the JSON.
function M.engine_text(engine)
  if type(engine) ~= "table" or not engine.id then
    return nil
  end
  if engine.id == "beat_this" or engine.id == "md_beat_this" then
    local parts = { string.upper(tostring(engine.device or "?")) }
    if type(engine.gpu) == "string" and engine.gpu ~= "" then
      parts[#parts + 1] = engine.gpu
    end
    return tostring(engine.id) .. " (" .. table.concat(parts, ", ") .. ")"
  end
  local key = tostring(engine.fallbackReason)
  if engine.requestedModel == "md_beat_this" and key == "not_installed" then
    key = "md_not_installed"   -- md_beat_this was chosen but is not installed
  end
  local reason = engine.fallbackReason and lookup("plugin.reason_" .. key)
  return tostring(engine.id) .. (reason and (" – " .. reason) or "")
end

-- Length of a media pool clip in seconds: from "Frames", else from the timecode "Duration" (Resolve 21.2 gives
-- no "Frames" for audio clips). fallback_fps: frame rate of the project when the clip has none.
local function clip_seconds(clip, fallback_fps)
  local fps = exact_fps(parse_fps(api(clip, "GetClipProperty", "FPS")) or fallback_fps or 25)
  local frames = tonumber(api(clip, "GetClipProperty", "Frames"))
  if frames and frames > 0 then
    return frames / fps
  end
  local h, m, sec, f = tostring(api(clip, "GetClipProperty", "Duration") or ""):match("^(%d+):(%d+):(%d+)[:;](%d+)$")
  if not h then
    return nil
  end
  return tonumber(h) * 3600 + tonumber(m) * 60 + tonumber(sec) + tonumber(f) / round(fps)
end

-- Everything the window needs to know about a marker JSON before OK. info.ok = OK may be pressed.
-- Resolve plays MP3 files without dropping the encoder delay at the start (≈ 50 ms, measured in test 0.2.2);
-- BeatAnalyzer drops it, so markers on an MP3 clip lie that much before the audible beat.
function M.is_mp3(name)
  return tostring(name or ""):lower():match("%.mp3$") ~= nil
end

function M.prepare(path)
  local info = { ok = false, warnings = {} }
  local text = read_file(path)
  if not text then
    info.error = T("plugin.msg_cannot_read", { path = tostring(path) })
    return info
  end
  local okj, data = pcall(json_decode, text)
  if not okj then
    info.error = tostring(data)
    return info
  end
  local markers, err = validate(data)
  if not markers then
    info.error = err
    return info
  end
  info.data = data
  info.file_name = tostring(data.fileName or "")
  info.song = (info.file_name:gsub("%.[^%.]*$", ""))
  info.engine = M.engine_text(data.engine)
  info.engine = info.engine and T("plugin.engine", { engine = info.engine }) or T("plugin.engine_unknown")
  local pm = api(resolve, "GetProjectManager")
  local project = pm and api(pm, "GetCurrentProject") or nil
  if not project then
    info.error = T("plugin.msg_no_project")
    return info
  end
  local clips, how = target_clips(api(project, "GetMediaPool"), info.file_name)
  info.clips, info.how = clips, how
  if #clips == 0 then
    info.error = T("plugin.msg_no_clip", { file = info.file_name })
    return info
  end
  local names = {}
  for _, clip in ipairs(clips) do
    names[#names + 1] = tostring(api(clip, "GetName") or "?")
  end
  local seconds = clip_seconds(clips[1], parse_fps(api(project, "GetSetting", "timelineFrameRate")))
  info.clip_text = T("plugin.clip_found", { names = table.concat(names, ", "),
                                            length = seconds and M.fmt_length(seconds) or "?" })
  if how == "selection" and info.file_name ~= "" then
    for _, clip in ipairs(clips) do
      if tostring(api(clip, "GetClipProperty", "File Name") or "") ~= info.file_name then
        info.warnings[#info.warnings + 1] = T("plugin.warn_other_file", { file = info.file_name })
        break
      end
    end
  end
  info.notes = {}
  for _, clip in ipairs(clips) do
    if M.is_mp3(api(clip, "GetClipProperty", "File Name")) then
      local off = tonumber(data.resolveOffset)
      if off and off > 0 then   -- shown before OK (test 0.2.4: the correction was not visible on this way)
        info.notes[#info.notes + 1] = T("plugin.note_mp3_json", { ms = fmt_num(off * 1000, 0) })
      else
        info.warnings[#info.warnings + 1] = T("plugin.warn_mp3")   -- older JSON or browser analysis: no offset
      end
      break
    end
  end
  local json_seconds = tonumber(data.duration)
  if seconds and json_seconds and math.abs(seconds - json_seconds) >= M.LENGTH_TOLERANCE then
    local tenths = M.fmt_length(seconds) == M.fmt_length(json_seconds)   -- never "(0:20) ... (0:20)"
    info.warnings[#info.warnings + 1] = T("plugin.warn_length", { clip = M.fmt_length(seconds, tenths),
                                                                   json = M.fmt_length(json_seconds, tenths) })
  end
  info.ok = true
  return info
end

-- Where the song lies in a timeline: state "none" (no timeline), "absent" or "present" with track and timecode.
function M.timeline_info(tl, clips)
  if not tl then
    return { state = "none" }
  end
  local name = tostring(api(tl, "GetName") or "?")
  local item, track = first_use(tl, clips or {})
  local items = #M.timeline_items(tl, clips or {})
  local tracks = {}
  for _, g in ipairs(song_tracks(tl, clips or {})) do
    tracks[#tracks + 1] = "A" .. g.track
  end
  if not item then
    return { state = "absent", name = name, items = items }
  end
  local fps = parse_fps(api(tl, "GetSetting", "timelineFrameRate")) or 25
  return { state = "present", name = name, track = track, tc = M.timecode(api(item, "GetStart"), fps),
           items = items, tracks = table.concat(tracks, ", ") }
end

-- The text under the tick box "Subtitle Track in the Timeline".
-- Short text for the window and the long one for its tooltip (the user found the long one too much).
function M.explanation(checked, tinfo, song)
  local long = M.subtitle_explanation(checked, tinfo, song)
  local short
  if not checked then
    short = T("plugin.explain_short_off")
  elseif tinfo.state == "present" then
    short = T("plugin.explain_short_present", { tracks = tinfo.tracks or ("A" .. tostring(tinfo.track)) })
  elseif tinfo.state == "absent" then
    short = T("plugin.explain_short_absent", { timeline = tinfo.name })
  else
    short = T("plugin.explain_short_no_timeline")
  end
  if (tonumber(tinfo.items) or 0) > 0 then
    long = long .. " " .. T("plugin.explain_tl_markers", { items = tinfo.items })
    short = short .. " " .. T("plugin.explain_short_tl_markers", { items = tinfo.items })
  end
  return short, long
end

function M.subtitle_explanation(checked, tinfo, song)
  if not checked then
    return T("plugin.explain_off")
  end
  if tinfo.state == "present" and type(tinfo.tracks) == "string" and tinfo.tracks:find(",") then
    local first = tinfo.tracks:match("^(A%d+)")
    return T("plugin.explain_present_many", { timeline = tinfo.name, tracks = tinfo.tracks,
                                              track_name = TRACK_PREFIX .. tostring(song or "") .. " (" .. first .. ")" })
  end
  if tinfo.state == "present" then
    return T("plugin.explain_present", { timeline = tinfo.name, track = tinfo.track, tc = tinfo.tc,
                                         track_name = TRACK_PREFIX .. tostring(song or "") })
  elseif tinfo.state == "absent" then
    return T("plugin.explain_absent", { timeline = tinfo.name })
  end
  return T("plugin.explain_no_timeline")
end

-- ─── Run in steps ────────────────────────────────────────────────────────────
-- M.start() reads and checks everything and fixes project, clips and timeline; job:step() then does a small
-- part (at most CHUNK markers), so the window stays responsive. M.apply() runs all steps at once.

M.CHUNK = 20

local Job = {}
Job.__index = Job

function M.start(path, opts)
  opts = opts or {}
  local info = M.prepare(path)
  if not info.ok then
    return nil, info.error
  end
  local data, clips, how, file_name = info.data, info.clips, info.how, info.file_name
  if opts.clips then   -- the clip analysed from Resolve, fixed at OK (the selection may have changed)
    clips, how = opts.clips, "analysis"
  end
  local markers = data.markers
  local pm = api(resolve, "GetProjectManager")
  local project = api(pm, "GetCurrentProject")
  local media_pool = api(project, "GetMediaPool")
  log(string.format("%d clip(s) by %s, %d markers in %s", #clips, how, #markers, path))
  -- MP3: Resolve plays the Xing frame and the encoder delay first, the analysis dropped them: move every beat
  -- by resolveOffset (markers and subtitles), only when the clip really is an MP3
  local shift = tonumber(data.resolveOffset) or 0
  if shift > 0 and shift < 0.5 and clips[1] and M.is_mp3(api(clips[1], "GetClipProperty", "File Name") or file_name) then
    for _, m in ipairs(markers) do
      m.time = (tonumber(m.time) or 0) + shift
    end
    log(string.format("MP3: markers moved by %.1f ms", shift * 1000))
  else
    shift = 0
  end

  local job = setmetatable({
    path = path, opts = opts, data = data, markers = markers, project = project, media_pool = media_pool,
    file_name = file_name, clips = clips, how = how, phase = "markers", marked = 0, total = 0, mp3_shift = shift,
    clip_index = 1, marker_index = 1, added = 0, skipped = 0, names = {},
    fallback_fps = parse_fps(api(project, "GetSetting", "timelineFrameRate")) or 25,
  }, Job)
  for _, m in ipairs(markers) do
    if M.marker_color(m, opts.colors) then
      job.total = job.total + 1
    end
  end
  job.total = job.total * #clips
  local _, srt_name = srt_path("", file_name, path)
  job.srt_name = srt_name
  job.base = (srt_name:gsub("%.srt$", ""))
  job.track_name = TRACK_PREFIX .. job.base
  if opts.timeline == false then
    job.timeline = nil
  elseif opts.timeline ~= nil then
    job.timeline = opts.timeline
  else
    job.timeline = api(project, "GetCurrentTimeline")
  end
  job.timeline_name = job.timeline and tostring(api(job.timeline, "GetName") or "?") or nil
  -- markers on the song's clips in the timeline: always, also without the subtitle track
  local marker_tl = opts.marker_timeline or job.timeline
    or (opts.timeline == false and api(project, "GetCurrentTimeline")) or nil
  job.tl_items = M.timeline_items(marker_tl, clips)
  job.tl_name = marker_tl and tostring(api(marker_tl, "GetName") or "?") or nil
  job.tl_fps = exact_fps(parse_fps(marker_tl and api(marker_tl, "GetSetting", "timelineFrameRate"))
                         or job.fallback_fps)
  job.tl_index, job.tl_marker_index, job.tl_added = 1, 1, 0
  job.total = job.total + (#clips > 0 and job.total / #clips or 0) * #job.tl_items
  job.step = function() return Job.step(job) end   -- works as job:step() and as job.step() (tests)
  return job, nil
end

-- Up to CHUNK markers; the first step on a clip removes the markers of the last run.
function Job:mark_some()
  local budget = M.CHUNK
  while budget > 0 and self.clip_index <= #self.clips do
    local clip = self.clips[self.clip_index]
    if self.marker_index == 1 then
      self.cur = {
        fps = exact_fps(parse_fps(api(clip, "GetClipProperty", "FPS")) or self.fallback_fps),
        frames = tonumber(api(clip, "GetClipProperty", "Frames")),
        removed = remove_own_markers(clip), added = 0, skipped = 0,
      }
    end
    local c = self.cur
    while budget > 0 and self.marker_index <= #self.markers do
      local m = self.markers[self.marker_index]
      self.marker_index = self.marker_index + 1
      local color = M.marker_color(m, self.opts.colors)
      if color then
        budget = budget - 1
        self.marked = self.marked + 1
        local frame = round((tonumber(m.time) or -1) * c.fps)
        if frame < 0 or (c.frames and frame >= c.frames) then
          c.skipped = c.skipped + 1
        else
          local name = m.type == "downbeat" and T("output.marker_downbeat", { bar = tonumber(m.bar) or 0 })
            or string.format("%d.%d", tonumber(m.bar) or 0, tonumber(m.beat) or 0)
          local note = M.marker_note(m)
          if api(clip, "AddMarker", frame, color, name, note, 1, MARKER_TAG) then
            c.added = c.added + 1
          else
            c.skipped = c.skipped + 1
          end
        end
      end
    end
    if self.marker_index > #self.markers then
      log(string.format("%s: %d markers added, %d skipped, %d old removed (%.3f fps)",
          tostring(api(clip, "GetName") or "?"), c.added, c.skipped, c.removed, c.fps))
      self.added, self.skipped = self.added + c.added, self.skipped + c.skipped
      self.names[#self.names + 1] = tostring(api(clip, "GetName") or "?")
      self.clip_index, self.marker_index = self.clip_index + 1, 1
    end
  end
  if self.clip_index > #self.clips then
    local msg = T("plugin.msg_markers", { n = self.added, clips = #self.clips, names = table.concat(self.names, ", ") })
    if (self.mp3_shift or 0) > 0 then
      msg = msg .. "\\n" .. T("plugin.msg_mp3_shift", { ms = fmt_num(self.mp3_shift * 1000, 0) })
    end
    if self.skipped > 0 then
      msg = msg .. "\\n" .. T("plugin.msg_skipped", { n = self.skipped })
    end
    if self.how == "selection" and self.file_name ~= "" then
      for _, clip in ipairs(self.clips) do
        if tostring(api(clip, "GetClipProperty", "File Name") or "") ~= self.file_name then
          msg = msg .. "\\n" .. T("plugin.msg_other_file", { file = self.file_name })
          break
        end
      end
    end
    self.msg = msg
    self.phase = #self.tl_items > 0 and "tl_markers" or "subtitles"
  end
end

-- Markers on the song's clips in the timeline, up to CHUNK per step. Frames count from the start of the
-- timeline clip; a clip trimmed at the start (left offset) shows only the beats of its visible part.
function Job:mark_timeline()
  local budget = M.CHUNK
  while budget > 0 and self.tl_index <= #self.tl_items do
    local item = self.tl_items[self.tl_index]
    if self.tl_marker_index == 1 then
      self.tl_cur = {
        left = tonumber(api(item, "GetLeftOffset")) or 0,
        duration = tonumber(api(item, "GetDuration")),
        removed = remove_own_markers(item),
      }
      log(string.format("Timeline clip %d: left offset %s, duration %s frames", self.tl_index,
          tostring(self.tl_cur.left), tostring(self.tl_cur.duration)))
    end
    local c = self.tl_cur
    while budget > 0 and self.tl_marker_index <= #self.markers do
      local m = self.markers[self.tl_marker_index]
      self.tl_marker_index = self.tl_marker_index + 1
      local color = M.marker_color(m, self.opts.colors)
      if color then
        budget = budget - 1
        self.marked = self.marked + 1
        -- Resolve counts the markers of a timeline clip from the start of the source file (test 0.1.7: subtracting
        -- the left offset shifted them on a trimmed clip); only the visible part gets markers
        local frame = round((tonumber(m.time) or -1) * self.tl_fps)
        if frame >= c.left and (not c.duration or frame < c.left + c.duration) then
          local name = m.type == "downbeat" and T("output.marker_downbeat", { bar = tonumber(m.bar) or 0 })
            or string.format("%d.%d", tonumber(m.bar) or 0, tonumber(m.beat) or 0)
          local note = M.marker_note(m)
          if api(item, "AddMarker", frame, color, name, note, 1, MARKER_TAG) then
            self.tl_added = self.tl_added + 1
          end
        end
      end
    end
    if self.tl_marker_index > #self.markers then
      self.tl_index, self.tl_marker_index = self.tl_index + 1, 1
    end
  end
  if self.tl_index > #self.tl_items then
    self.msg = self.msg .. "\\n" .. T("plugin.msg_tl_markers", { n = self.tl_added, items = #self.tl_items,
                                                                timeline = self.tl_name or "?" })
    self.phase = "subtitles"
  end
end

-- Subtitles: written into a working folder, imported, then file and folder are deleted. A file whose import
-- failed stays, so it can be imported by hand.
function Job:subtitles()
  self.dir = self.opts.work_dir or M.work_dir()
  self.keep = false
  local srt_file = srt_path(self.dir or "", self.file_name, self.path)
  if not self.dir then
    self.msg = self.msg .. "\\n" .. T("plugin.msg_no_work_dir", { path = work_base() })
  elseif not write_file(srt_file, build_srt(self.data)) then
    self.msg = self.msg .. "\\n" .. T("plugin.msg_srt_write", { path = srt_file })
  else
    local item, ierr = import_subtitles(self.media_pool, srt_file, self.srt_name)
    if item then
      self.msg = self.msg .. "\\n" .. T("plugin.msg_srt_ok", { srt = self.srt_name, bin = BIN_NAME })
      remove_file(srt_file)
    else
      self.msg = self.msg .. "\\n" .. T("plugin.msg_srt_import", { why = tostring(ierr), path = srt_file })
      self.keep = true
    end
  end
  self.phase = "timeline"
end

-- The subtitle track goes into the timeline that was open at the start, even if another one is open now.
function Job:timeline_step()
  local tl = self.timeline
  if tl and self.dir then
    local before = api(self.project, "GetCurrentTimeline")
    api(self.project, "SetCurrentTimeline", tl)
    local line, kept = place_in_timeline(self.media_pool, tl, self.data, self.clips, self.dir, self.base)
    if line then
      self.msg = self.msg .. "\\n" .. line
    end
    self.keep = self.keep or kept == true
    if before and before ~= tl then   -- the user had opened another timeline meanwhile: show it again
      api(self.project, "SetCurrentTimeline", before)
    end
  end
  if self.dir and not self.keep then
    remove_dir(self.dir)
  end
  self.ok = self.added > 0
  self.phase = "done"
end

-- One step; true when the job is done.
function Job:step()
  if self.phase == "markers" then
    self:mark_some()
  elseif self.phase == "tl_markers" then
    self:mark_timeline()
  elseif self.phase == "subtitles" then
    self:subtitles()
  elseif self.phase == "timeline" then
    self:timeline_step()
  end
  return self.phase == "done"
end

-- Apply a marker JSON file in one go. Returns true/false and a message for the user.
function M.apply(path, opts)
  local job, err = M.start(path, opts)
  if not job then
    return false, err
  end
  while not job:step() do
  end
  return job.ok, job.msg
end

-- ─── Settings of the window ──────────────────────────────────────────────────
-- <BeatAnalyzer>/resolve_temp/plugin.txt, lines key=value. Without a known BeatAnalyzer folder nothing is kept.

local COLOR_SLOTS = { "downbeat", "beat2", "beat3", "beat4", "other" }

function M.settings_path()
  return BA.home and (BA.home .. SEP .. "resolve_temp" .. SEP .. "plugin.txt") or nil
end

function M.load_settings()
  local s = { json_dir = "", timeline = true, colors_open = false, colors = {}, geometry = nil, way = "analyze",
              smooth = 90, model = "beat_this" }
  for _, slot in ipairs(COLOR_SLOTS) do
    s.colors[slot] = M.DEFAULT_COLORS[slot]
  end
  local path = M.settings_path()
  local text = path and read_file(path)
  for line in tostring(text or ""):gmatch("[^\\r\\n]+") do
    local key, value = line:match("^([%w_]+)=(.*)$")
    if key == "json_dir" then
      s.json_dir = value
    elseif key == "timeline" or key == "colors_open" then
      if value == "1" or value == "0" then
        s[key] = value == "1"
      end
    elseif key == "way" and (value == "json" or value == "analyze") then
      s.way = value
    elseif key == "model" and (value == "beat_this" or value == "md_beat_this") then
      s.model = value   -- the licence check for md_beat_this is not saved: it is asked in every window
    elseif key == "smooth" and tonumber(value) then
      s.smooth = math.max(0, math.min(100, math.floor(tonumber(value))))
    elseif key == "geometry" then
      local x, y, w, h = value:match("^(-?%d+),(-?%d+),(%d+),(%d+)$")
      if x then
        s.geometry = { tonumber(x), tonumber(y), tonumber(w), tonumber(h) }
      end
    elseif key and key:match("^color_") then
      local slot = key:sub(7)
      if s.colors[slot] and (COLOR_OK[value] or value == M.NO_MARKER) then
        s.colors[slot] = value
      end
    end
  end
  return s
end

function M.save_settings(s)
  local path = M.settings_path()
  if not path then
    return false
  end
  make_dir(BA.home .. SEP .. "resolve_temp")
  local lines = { "# BeatAnalyzer - settings of the Resolve window",
                  "json_dir=" .. tostring(s.json_dir or ""):gsub("[\\r\\n]", ""),
                  "timeline=" .. (s.timeline and "1" or "0"),
                  "colors_open=" .. (s.colors_open and "1" or "0"),
                  "way=" .. (s.way == "analyze" and "analyze" or "json"),
                  "smooth=" .. tostring(math.floor(tonumber(s.smooth) or 90)),
                  "model=" .. (s.model == "md_beat_this" and "md_beat_this" or "beat_this") }
  for _, slot in ipairs(COLOR_SLOTS) do
    lines[#lines + 1] = "color_" .. slot .. "=" .. tostring((s.colors or {})[slot] or M.DEFAULT_COLORS[slot])
  end
  local g = s.geometry
  if type(g) == "table" and tonumber(g[1]) and tonumber(g[4]) then
    lines[#lines + 1] = string.format("geometry=%d,%d,%d,%d", g[1], g[2], g[3], g[4])
  end
  return write_file(path, table.concat(lines, "\\n") .. "\\n")
end

-- ─── Dialogs ─────────────────────────────────────────────────────────────────

-- Master layout: flat leaf rows in root VGroup (never set Hidden on VGroup/HGroup in Resolve
-- UIManager), section header bars (#SecSource/#SecOutput), 2-button model selector, explicit
-- per-button StyleSheets (since Resolve ignores parent #ID button selectors), and live swatches.

local TICK_MS = 50
local WIN_MIN = { 660, 360 }
local WIN_HEIGHT = 440
local LINE_PX, CHAR_PX = 19, 8
local REFRESH_TICKS = 20
local LABEL_WIDTH = 86

local COLOR_IDS = { downbeat = "ColorDownbeat", beat2 = "ColorBeat2", beat3 = "ColorBeat3", beat4 = "ColorBeat4",
                    other = "ColorOther" }

local SWATCH_HEX = {
  Blue = "#3B82F6", Cyan = "#06B6D4", Green = "#22C55E", Yellow = "#EAB308",
  Red = "#EF4444", Pink = "#EC4899", Purple = "#A855F7", Fuchsia = "#D946EF",
  Rose = "#F43F5E", Lavender = "#A78BFA", Sky = "#38BDF8", Mint = "#34D399",
  Lemon = "#FACC15", Sand = "#D6B88D", Cocoa = "#8B5E3C", Cream = "#F3E8D2",
}

local PRIMARY_BTN_CSS = [[
  QPushButton {
    background-color: #E05A47;
    color: #FFFFFF;
    border: 1px solid #E05A47;
    border-radius: 4px;
    padding: 6px 16px;
    font-weight: bold;
  }
  QPushButton:hover {
    background-color: #EB6B59;
    border-color: #EB6B59;
  }
]]

local NEUTRAL_BTN_CSS = [[
  QPushButton {
    background-color: #26262C;
    color: #E4E4E7;
    border: 1px solid #3C3C46;
    border-radius: 4px;
    padding: 6px 14px;
  }
  QPushButton:hover {
    background-color: #303038;
    border-color: #4E4E5A;
  }
]]

local DISABLED_BTN_CSS = [[
  QPushButton {
    background-color: #1E1E24;
    color: #6B6B76;
    border: 1px solid #2C2C34;
    border-radius: 4px;
    padding: 6px 14px;
  }
]]

local DANGER_BTN_CSS = [[
  QPushButton {
    background-color: #991B1B;
    color: #FFFFFF;
    border: 1px solid #DC2626;
    border-radius: 4px;
    padding: 6px 14px;
    font-weight: bold;
  }
  QPushButton:hover {
    background-color: #B91C1C;
  }
]]

local MODEL_ACTIVE_CSS = [[
  QPushButton {
    background-color: #2D2022;
    color: #FFFFFF;
    border: 2px solid #E05A47;
    border-radius: 5px;
    padding: 6px 12px;
    font-weight: bold;
  }
  QPushButton:hover {
    background-color: #352427;
  }
]]

local MODEL_IDLE_CSS = [[
  QPushButton {
    background-color: #222227;
    color: #A1A1AA;
    border: 1px solid #383842;
    border-radius: 5px;
    padding: 6px 12px;
  }
  QPushButton:hover {
    background-color: #292930;
    color: #E4E4E7;
    border-color: #4E4E5A;
  }
]]

local MODEL_MUTED_SELECTED_CSS = [[
  QPushButton {
    background-color: #24242B;
    color: #9CA3AF;
    border: 1px solid #3E3E48;
    border-radius: 5px;
    padding: 6px 12px;
  }
]]

local MODEL_MUTED_IDLE_CSS = [[
  QPushButton {
    background-color: #1C1C21;
    color: #6B6B76;
    border: 1px solid #2A2A32;
    border-radius: 5px;
    padding: 6px 12px;
  }
]]

local TAB_ACTIVE_CSS = [[
  QTabBar {
    font-size: 12px;
  }
  QTabBar::tab {
    background-color: #222227;
    color: #A1A1AA;
    border: 1px solid #32323A;
    padding: 6px 18px;
    min-width: 155px;
    margin-right: 6px;
    border-radius: 4px;
  }
  QTabBar::tab:hover {
    color: #F4F4F6;
    border-color: #464652;
  }
  QTabBar::tab:selected {
    background-color: #E05A47;
    color: #FFFFFF;
    border-color: #E05A47;
  }
]]

local TAB_MUTED_CSS = [[
  QTabBar {
    font-size: 12px;
  }
  QTabBar::tab {
    background-color: #1D1D22;
    color: #6B6B76;
    border: 1px solid #2B2B32;
    padding: 6px 18px;
    min-width: 155px;
    margin-right: 6px;
    border-radius: 4px;
  }
  QTabBar::tab:selected {
    background-color: #27272E;
    color: #9CA3AF;
    border: 1px solid #383842;
  }
]]

local SECTION_HDR_CSS = "background-color: #23232A; border-top: 1px solid #34343F; border-bottom: 1px solid #2C2C34; padding: 4px 8px; color: #B4B4C0; font-weight: bold; font-size: 11px;"

local DIALOG_STYLE = [[
  #BeatAnalyzerWin {
    background-color: #18181B;
    color: #E6E6EA;
  }
]]

local function color_index(color)
  for i, c in ipairs(M.MARKER_COLORS) do
    if c == color then
      return i - 1
    end
  end
  return #M.MARKER_COLORS   -- the last entry: no marker
end

local function swatch_style(color)
  local hex = SWATCH_HEX[color]
  if hex then
    return "background-color: " .. hex .. "; border: 1px solid #52525B; border-radius: 2px;"
  end
  return "background-color: #27272D; border: 1px dashed #52525B; border-radius: 2px;"
end

function M.main()
  log("BeatAnalyzer_Markers " .. VERSION)
  local bmd = rawget(_G, "bmd")
  if not (fu and fu.UIManager and bmd and bmd.UIDispatcher) then
    log("No window available.")
    return
  end
  local ui = fu.UIManager
  local disp = bmd.UIDispatcher(ui)
  local settings = M.load_settings()
  local S = { state = "select", ticks = 0, ok_ready = false, way_idx = settings.way == "json" and 1 or 0,
              model = (settings.model == "md_beat_this") and "md_beat_this" or "beat_this" }

  local BTN_ANALYZE = T("plugin.btn_analyze")
  local BTN_APPLY = T("plugin.btn_apply")
  local SEC_SOURCE = T("plugin.sec_source")
  local SEC_OUTPUT = T("plugin.sec_output")
  local MODEL_BT_TEXT = T("plugin.model_beat_this")
  local MODEL_MD_TEXT = T("plugin.model_md")

  local function section_header(id, title)
    return ui:Label({ ID = id, Text = title, Weight = 0, MinimumSize = { 0, 24 },
                      StyleSheet = SECTION_HDR_CSS })
  end

  local function h_divider(id)
    return ui:Label({ ID = id, Text = "", Weight = 0, MinimumSize = { 0, 1 }, MaximumSize = { 9999, 1 },
                      StyleSheet = "background-color: #2E2E36;" })
  end

  local function color_col(slot, label)
    local id = COLOR_IDS[slot]
    return ui:VGroup({ Weight = 1, Spacing = 4,
      ui:HGroup({ Weight = 0, Spacing = 5,
        ui:Label({ ID = id .. "Swatch", Text = "", Weight = 0, MinimumSize = { 10, 10 }, MaximumSize = { 10, 10 } }),
        ui:Label({ ID = id .. "Label", Text = label, Weight = 1,
                   StyleSheet = "color: #C8C8D0; font-size: 11px;" }) }),
      ui:ComboBox({ ID = id, Weight = 0 }) })
  end

  local function mini_swatch(slot)
    return ui:Label({ ID = COLOR_IDS[slot] .. "Mini", Text = "", Weight = 0,
                      MinimumSize = { 9, 9 }, MaximumSize = { 9, 9 } })
  end

  local saved = settings.geometry or { 300, 150 }
  local geometry = { saved[1], saved[2], WIN_MIN[1], WIN_HEIGHT }
  local initial_way_idx = settings.way == "json" and 1 or 0   -- the window opens on the way used last

  local win = disp:AddWindow({ ID = "BeatAnalyzerWin", WindowTitle = T("plugin.title", { version = VERSION }),
                              Geometry = geometry, MinimumSize = WIN_MIN, StyleSheet = DIALOG_STYLE },
    ui:VGroup({ Spacing = 6,
      -- Resolve ignores the requested width (and Resize) and sizes the window by its content, so the width changed
      -- with every song name. An empty row with a minimum width holds the window at least that wide.
      ui:Label({ ID = "WidthGuard", Text = "", Weight = 0, MinimumSize = { WIN_MIN[1] - 20, 1 } }),

      -- 0. Pinned Context Overview (Clip + Timeline at a glance)
      ui:HGroup({ Weight = 0, Spacing = 10,
        ui:Label({ ID = "ClipInfo", Text = "", WordWrap = true, Weight = 1, MinimumSize = { 0, 20 },
                   StyleSheet = "color: #F4F4F6; font-weight: bold;" }),
        ui:Label({ ID = "OverviewTimeline", Text = "", Weight = 0,
                   Alignment = { AlignRight = true, AlignVCenter = true },
                   StyleSheet = "color: #9CA3AF;" }) }),

      -- 1. Source & Analysis Model Section Header + Tabs
      section_header("SecSource", SEC_SOURCE),

      ui:TabBar({ ID = "WayTabs", Weight = 0, Expanding = false, DrawBase = false, UsesScrollButtons = false,
                  StyleSheet = TAB_ACTIVE_CSS }),

      -- Analyse Mode Controls (leaf widgets toggled via Hidden; never hide VGroup/HGroup)
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Button({ ID = "ModelBeatThis", Text = MODEL_BT_TEXT, Weight = 1, MinimumSize = { 0, 44 },
                    ToolTip = T("plugin.model_tip"), StyleSheet = MODEL_ACTIVE_CSS }),
        ui:Button({ ID = "ModelMd", Text = MODEL_MD_TEXT, Weight = 1, MinimumSize = { 0, 44 },
                    ToolTip = T("plugin.model_tip"), StyleSheet = MODEL_IDLE_CSS }) }),

      ui:Label({ ID = "MdNotice", Text = T("plugin.md_notice", { url = M.MD_URL }), WordWrap = true,
                 Weight = 0, MinimumSize = { 0, 48 }, MaximumSize = { 9999, 48 }, Hidden = true,
                 Alignment = { AlignVCenter = true, AlignLeft = true },
                 StyleSheet = "background-color: #221D15; border: 1px solid #4E3E26; border-radius: 4px; padding: 5px 10px; color: #FCD34D;" }),
      ui:CheckBox({ ID = "MdConfirm", Text = T("plugin.md_confirm"), Checked = false, Weight = 0,
                    MinimumSize = { 0, 24 }, Hidden = true }),

      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Label({ ID = "SmoothLabel", Text = T("plugin.smooth_label"), Weight = 0,
                   MinimumSize = { LABEL_WIDTH, 0 }, ToolTip = T("plugin.smooth_tip"),
                   StyleSheet = "color: #A1A1AA;" }),
        ui:Slider({ ID = "Smooth", Minimum = 0, Maximum = 100, Value = settings.smooth, Weight = 1,
                    ToolTip = T("plugin.smooth_tip") }),
        ui:Label({ ID = "SmoothValue", Text = "", Weight = 0, MinimumSize = { 50, 0 },
                   StyleSheet = "color: #E4E4E7;" }) }),

      -- Load JSON Controls (leaf widgets toggled via Hidden)
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Label({ ID = "JsonLabel", Text = "JSON:", Weight = 0, Hidden = true,
                   MinimumSize = { LABEL_WIDTH, 0 }, StyleSheet = "color: #A1A1AA;" }),
        ui:Label({ ID = "JsonPath", Text = T("plugin.json_none"), WordWrap = true, Weight = 1,
                   MinimumSize = { 0, 20 }, Hidden = true }),
        ui:Button({ ID = "Choose", Text = T("plugin.btn_choose"), Weight = 0, Hidden = true,
                    StyleSheet = NEUTRAL_BTN_CSS }) }),
      ui:Label({ ID = "Engine", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 18 },
                 Hidden = true, StyleSheet = "color: #9CA3AF;" }),

      -- Dedicated Alert / Note Banner (leaf Label toggled via Hidden)
      ui:Label({ ID = "Warnings", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 28 }, Hidden = true,
                 Alignment = { AlignTop = true, AlignLeft = true },
                 StyleSheet = "background-color: #2B2217; border: 1px solid #6E4D24; border-radius: 4px; padding: 6px 10px; color: #FCD34D;" }),

      -- 2. Resolve Output Section Header + Controls
      section_header("SecOutput", SEC_OUTPUT),

      ui:CheckBox({ ID = "Timeline", Text = T("plugin.check_timeline"), Checked = settings.timeline, Weight = 0 }),
      ui:Label({ ID = "Explain", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 34 },
                 StyleSheet = "color: #9CA3AF;" }),
      h_divider("OutputDivider"),
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:CheckBox({ ID = "Colors", Text = T("plugin.check_colors"), Checked = settings.colors_open, Weight = 1 }),
        mini_swatch("downbeat"),
        mini_swatch("beat2"),
        mini_swatch("beat3"),
        mini_swatch("beat4"),
        mini_swatch("other") }),
      ui:HGroup({ Weight = 0, Spacing = 8,
        color_col("downbeat", T("plugin.color_downbeat")),
        color_col("beat2", T("plugin.color_beat", { n = 2 })),
        color_col("beat3", T("plugin.color_beat", { n = 3 })),
        color_col("beat4", T("plugin.color_beat", { n = 4 })),
        color_col("other", T("plugin.color_other")) }),

      -- 3. Dynamic Status / Progress Label (hidden when idle so there is zero dead space)
      ui:Label({ ID = "Status", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 44 }, Hidden = true,
                 Alignment = { AlignTop = true, AlignLeft = true },
                 StyleSheet = "background-color: #212126; border: 1px solid #32323A; border-radius: 5px; padding: 7px 10px; color: #E4E4E7;" }),

      ui:VGap(0, 1),
      h_divider("DivFooter"),

      -- 4. Logical Action Bar (direct StyleSheets on every button)
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Button({ ID = "Remove", Text = T("plugin.btn_remove"), Weight = 0, StyleSheet = NEUTRAL_BTN_CSS }),
        ui:Button({ ID = "RemoveYes", Text = T("plugin.btn_remove_yes"), Weight = 0, Hidden = true,
                    StyleSheet = DANGER_BTN_CSS }),
        ui:HGap(0, 1),
        ui:Button({ ID = "Cancel", Text = T("plugin.btn_cancel"), Weight = 0, Hidden = true,
                    StyleSheet = NEUTRAL_BTN_CSS }),
        ui:Button({ ID = "Close", Text = T("plugin.btn_close"), Weight = 0, StyleSheet = NEUTRAL_BTN_CSS }),
        ui:Button({ ID = "OK", Text = BTN_ANALYZE, Weight = 0, Enabled = false, StyleSheet = DISABLED_BTN_CSS }) }) }))
  local itm = win:GetItems()

  local function set(id, prop, value)
    pcall(function() itm[id][prop] = value end)
  end
  local function get(id, prop)
    local ok, v = pcall(function() return itm[id][prop] end)
    return ok and v or nil
  end

  local function window_width()
    local ok, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
    return ok and type(g) == "table" and tonumber(g[3]) or geometry[3]
  end
  local function wrapped_lines(line, per_line)
    local n, used = 1, 0
    for word in line:gmatch("%S+") do
      local w = #word:gsub("[\\128-\\191]", "")
      if used == 0 then
        used = w
      elseif used + 1 + w <= per_line then
        used = used + 1 + w
      else
        n, used = n + 1, w
      end
      while used > per_line do
        n, used = n + 1, used - per_line
      end
    end
    return n
  end
  -- Resolve does not grow a wrapped label with its text: reserve the lines it needs at the current width.
  local function fit(id, text, min_lines, extra_inset, extra_h)
    local per_line = math.max(24, math.floor((window_width() - 90 - (extra_inset or 0)) / CHAR_PX))
    local lines = 0
    for line in (tostring(text or "") .. "\\n"):gmatch("(.-)\\n") do
      lines = lines + wrapped_lines(line, per_line)
    end
    set(id, "MinimumSize", { 0, math.max(min_lines or 1, lines) * LINE_PX + 8 + (extra_h or 0) })
  end
  local function fit_box(id, text, min_lines, char_px, extra_h)
    local per_line = math.max(32, math.floor((window_width() - 48) / (char_px or 6)))
    local lines = 0
    for line in (tostring(text or "") .. "\\n"):gmatch("(.-)\\n") do
      lines = lines + wrapped_lines(line, per_line)
    end
    local h = math.max(min_lines or 1, lines) * 18 + (extra_h or 14)
    set(id, "MinimumSize", { 0, h })
    set(id, "MaximumSize", { 9999, h })
  end
  -- The UIManager lays a window out for another size than it draws (WhisperX Workbench): lay out now
  -- and once more on the next tick.
  local function relayout()
    pcall(function() win:RecalcLayout() end)
    S.relayout = true
  end
  local function status(text)
    local t = tostring(text or "")
    local empty = (t == "")
    set("Status", "Text", t)
    set("Status", "Hidden", empty)
    if not empty then
      fit_box("Status", t, 1, 6.5, 16)
    end
    relayout()
  end

  pcall(function() itm.WayTabs:AddTab(T("plugin.way_analyze")) end)
  pcall(function() itm.WayTabs:AddTab(T("plugin.way_json")) end)
  set("WayTabs", "CurrentIndex", initial_way_idx)
  set("Status", "Hidden", true)
  set("Warnings", "Hidden", true)

  for slot, id in pairs(COLOR_IDS) do
    for _, c in ipairs(M.MARKER_COLORS) do
      pcall(function() itm[id]:AddItem(c) end)
    end
    pcall(function() itm[id]:AddItem(T("plugin.color_none")) end)
    set(id, "CurrentIndex", color_index(settings.colors[slot]))
  end

  local function read_colors()
    local colors = {}
    for slot, id in pairs(COLOR_IDS) do
      local i = tonumber(get(id, "CurrentIndex")) or 0
      colors[slot] = M.MARKER_COLORS[i + 1] or M.NO_MARKER
    end
    return colors
  end

  local function update_swatches()
    local colors = read_colors()
    for slot, id in pairs(COLOR_IDS) do
      local css = swatch_style(colors[slot])
      set(id .. "Swatch", "StyleSheet", css)
      set(id .. "Mini", "StyleSheet", css)
    end
  end

  local function colors_visibility()
    local open = get("Colors", "Checked") == true
    for _, id in pairs(COLOR_IDS) do
      set(id, "Hidden", not open)
      set(id .. "Label", "Hidden", not open)
      set(id .. "Swatch", "Hidden", not open)
      set(id .. "Mini", "Hidden", open)
    end
    relayout()
  end

  local function project()
    local pm = api(resolve, "GetProjectManager")
    return pm and api(pm, "GetCurrentProject") or nil
  end
  local function current_timeline()
    local p = project()
    return p and api(p, "GetCurrentTimeline") or nil
  end

  local function remove_clips()
    if S.info and S.info.ok then
      return S.info.clips
    end
    local p = project()
    return p and selected_clips(api(p, "GetMediaPool")) or {}
  end

  local function analyze_way()
    return (tonumber(get("WayTabs", "CurrentIndex")) or S.way_idx or 0) == 0
  end

  local function model_value()
    return S.model == "md_beat_this" and "md_beat_this" or "beat_this"
  end
  -- md_beat_this may only analyse once its licence box is ticked
  local function model_ok()
    return model_value() ~= "md_beat_this" or get("MdConfirm", "Checked") == true
  end

  local function sync_model_buttons()
    local is_md = (model_value() == "md_beat_this")
    local unlocked = (S.state == "select")
    set("ModelBeatThis", "Enabled", unlocked)
    set("ModelMd", "Enabled", unlocked)
    if unlocked then
      set("ModelBeatThis", "StyleSheet", (not is_md) and MODEL_ACTIVE_CSS or MODEL_IDLE_CSS)
      set("ModelMd", "StyleSheet", is_md and MODEL_ACTIVE_CSS or MODEL_IDLE_CSS)
    else
      set("ModelBeatThis", "StyleSheet", (not is_md) and MODEL_MUTED_SELECTED_CSS or MODEL_MUTED_IDLE_CSS)
      set("ModelMd", "StyleSheet", is_md and MODEL_MUTED_SELECTED_CSS or MODEL_MUTED_IDLE_CSS)
    end
  end

  -- Buttons per state; buttons that do not fit the state are hidden. Fusion's UIManager ignores a parent's #ID
  -- selector for buttons, so every button gets its own StyleSheet.
  local function sync_buttons()
    sync_model_buttons()
    if S.state ~= "select" then
      set("OK", "Enabled", false)   -- hidden outside "select"; also locked, so it can never start twice
    end
    local can_remove = (#remove_clips() > 0)
    if S.state == "select" then
      set("WayTabs", "StyleSheet", TAB_ACTIVE_CSS)
      set("Choose", "StyleSheet", NEUTRAL_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", can_remove)
      set("Remove", "StyleSheet", can_remove and NEUTRAL_BTN_CSS or DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Cancel", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", true)
      set("Close", "Text", T("plugin.btn_close"))
      set("Close", "StyleSheet", NEUTRAL_BTN_CSS)
      local ready = (S.ok_ready == true)
      set("OK", "Hidden", false)
      set("OK", "Enabled", ready)
      set("OK", "Text", analyze_way() and BTN_ANALYZE or BTN_APPLY)
      set("OK", "StyleSheet", ready and PRIMARY_BTN_CSS or DISABLED_BTN_CSS)
    elseif S.state == "confirm" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", true)
      set("RemoveYes", "Hidden", false)
      set("RemoveYes", "Enabled", true)
      set("RemoveYes", "StyleSheet", DANGER_BTN_CSS)
      set("Cancel", "Hidden", true)
      set("OK", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", true)
      set("Close", "Text", T("plugin.btn_cancel"))
      set("Close", "StyleSheet", NEUTRAL_BTN_CSS)
    elseif S.state == "analyze" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", false)
      set("Remove", "StyleSheet", DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Close", "Hidden", true)
      set("OK", "Hidden", true)
      set("Cancel", "Hidden", false)
      set("Cancel", "Enabled", true)
      set("Cancel", "StyleSheet", NEUTRAL_BTN_CSS)
    elseif S.state == "work" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", false)
      set("Remove", "StyleSheet", DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Cancel", "Hidden", true)
      set("OK", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", false)
      set("Close", "Text", T("plugin.btn_close"))
      set("Close", "StyleSheet", DISABLED_BTN_CSS)
    elseif S.state == "result" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", can_remove)
      set("Remove", "StyleSheet", can_remove and NEUTRAL_BTN_CSS or DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Cancel", "Hidden", true)
      set("OK", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", true)
      set("Close", "Text", T("plugin.btn_ok"))
      set("Close", "StyleSheet", PRIMARY_BTN_CSS)
      set("Close", "Default", true)
    end
  end

  local function smooth_value()
    return math.max(0, math.min(100, math.floor(tonumber(get("Smooth", "Value")) or 90)))
  end

  local function show_way()
    local a = analyze_way()
    local md = a and model_value() == "md_beat_this"
    set("ModelBeatThis", "Hidden", not a)
    set("ModelMd", "Hidden", not a)
    set("MdNotice", "Hidden", not md)
    set("MdConfirm", "Hidden", not md)
    if md then
      fit_box("MdNotice", get("MdNotice", "Text"), 2, 6, 14)
    end
    for _, id in ipairs({ "SmoothLabel", "Smooth", "SmoothValue" }) do
      set(id, "Hidden", not a or md)
    end
    for _, id in ipairs({ "JsonLabel", "JsonPath", "Choose" }) do
      set(id, "Hidden", a)
    end
    local v = smooth_value()
    set("SmoothValue", "Text", v == 0 and T("plugin.smooth_off") or (tostring(v) .. " %"))
  end

  local function analysis_info()
    local info = { ok = false, warnings = {} }
    local p = project()
    if not p then
      info.error = T("plugin.msg_no_project")
      return info
    end
    local clip, reason = M.analysis_target(api(p, "GetMediaPool"))
    if not clip then
      info.error = T("plugin.analyze_" .. reason)
      return info
    end
    local seconds = clip_seconds(clip, parse_fps(api(p, "GetSetting", "timelineFrameRate")))
    info.clips, info.clip = { clip }, clip
    info.path = api(clip, "GetClipProperty", "File Path")
    info.song = (tostring(api(clip, "GetClipProperty", "File Name") or api(clip, "GetName") or "")
                 :gsub("%.[^%.]*$", ""))
    info.clip_text = T("plugin.clip_found", { names = tostring(api(clip, "GetName") or "?"),
                                              length = seconds and M.fmt_length(seconds) or "?" })
    info.ok = true
    return info
  end

  local function set_overview_timeline(tinfo)
    if tinfo and tinfo.state == "present" then
      set("OverviewTimeline", "Text", tinfo.name .. " · " .. (tinfo.tracks or ("A" .. tostring(tinfo.track))))
    elseif tinfo and tinfo.state == "absent" then
      set("OverviewTimeline", "Text", tinfo.name)
    else
      set("OverviewTimeline", "Text", "–")
    end
  end

  local function set_alert(lines_list, is_warning)
    if #lines_list == 0 then
      set("Warnings", "Hidden", true)
      return
    end
    local text = table.concat(lines_list, "\\n")
    set("Warnings", "Text", text)
    set("Warnings", "StyleSheet", is_warning
      and "background-color: #2B2217; border: 1px solid #6E4D24; border-radius: 4px; padding: 5px 10px; color: #FCD34D;"
      or  "background-color: #1A2330; border: 1px solid #2D4A6E; border-radius: 4px; padding: 5px 10px; color: #93C5FD;")
    fit_box("Warnings", text, 1, 6, 14)
    set("Warnings", "Hidden", false)
  end

  local function refresh()
    if S.state ~= "select" then
      return
    end
    show_way()
    if analyze_way() then
      S.info = analysis_info()
      -- the hint for md_beat_this goes in at once: setting one line and then two every second made the window
      -- lay itself out twice per refresh (it twitched, Resolve test 0.2.1)
      local clip_text = S.info.ok and S.info.clip_text or (S.info.error or "")
      if S.info.ok and not model_ok() then
        clip_text = clip_text .. "\\n" .. T("plugin.md_confirm_needed")
      end
      set("ClipInfo", "Text", clip_text)
      set("ClipInfo", "StyleSheet", (S.info.ok and model_ok())
        and "color: #F4F4F6; font-weight: bold;" or "color: #FCA5A5; font-weight: bold;")
      fit("ClipInfo", clip_text, 1, 120)
      local mp3 = S.info.ok and M.is_mp3(S.info.path)
      set_alert(mp3 and { T("plugin.note_mp3") } or {}, false)
      set("Engine", "Hidden", true)
      S.tinfo = M.timeline_info(current_timeline(), S.info.ok and S.info.clips or {})
      set_overview_timeline(S.tinfo)
      local explain, explain_tip = M.explanation(get("Timeline", "Checked"), S.tinfo, S.info.song)
      set("Explain", "Text", explain)
      set("Explain", "ToolTip", explain_tip)
      fit("Explain", explain, 2)
      relayout()
    elseif S.json then
      S.info = M.prepare(S.json)
      set("JsonPath", "Text", S.json:match("([^/\\\\]+)$") or S.json)
      set("JsonPath", "ToolTip", S.json)
      local clip_text = S.info.ok and S.info.clip_text or (S.info.error or "")
      set("ClipInfo", "Text", clip_text)
      set("ClipInfo", "StyleSheet", S.info.ok
        and "color: #F4F4F6; font-weight: bold;" or "color: #FCA5A5; font-weight: bold;")
      local alerts, has_warn = {}, false
      for _, w in ipairs(S.info.warnings or {}) do
        alerts[#alerts + 1] = "⚠ " .. w
        has_warn = true
      end
      for _, n in ipairs(S.info.notes or {}) do
        alerts[#alerts + 1] = n
      end
      set_alert(alerts, has_warn)
      set("Engine", "Text", S.info.engine or "")
      fit("Engine", S.info.engine or "")
      set("Engine", "Hidden", not S.info.engine)
      fit("JsonPath", get("JsonPath", "Text"), 1, 140)
      fit("ClipInfo", clip_text, 1, 120)
      S.tinfo = M.timeline_info(current_timeline(), S.info.ok and S.info.clips or {})
      set_overview_timeline(S.tinfo)
      local explain, explain_tip = M.explanation(get("Timeline", "Checked"), S.tinfo, S.info.song)
      set("Explain", "Text", explain)
      set("Explain", "ToolTip", explain_tip)
      fit("Explain", explain, 2)
      relayout()
    else
      S.info = nil
      set("JsonPath", "Text", T("plugin.json_none"))
      set("JsonPath", "ToolTip", "")
      set("ClipInfo", "Text", T("plugin.json_none"))
      set("ClipInfo", "StyleSheet", "color: #9CA3AF; font-weight: bold;")
      set_alert({}, false)
      set("Engine", "Hidden", true)
      S.tinfo = M.timeline_info(current_timeline(), {})
      set_overview_timeline(S.tinfo)
      local explain, explain_tip = M.explanation(get("Timeline", "Checked"), S.tinfo, "")
      set("Explain", "Text", explain)
      set("Explain", "ToolTip", explain_tip)
      fit("Explain", explain, 2)
      relayout()
    end
    local ok = S.info ~= nil and S.info.ok == true
    if analyze_way() and not model_ok() then
      ok = false
    end
    if analyze_way() and ok and S.failed and S.failed.path == S.info.path and S.failed.model == model_value() then
      ok = false   -- this file failed with this model: only Close, another clip or another model (Resolve test 0.2.2)
    end
    S.ok_ready = ok
    sync_buttons()
  end

  local function lock(locked)
    for _, id in ipairs({ "WayTabs", "ModelBeatThis", "ModelMd", "MdConfirm", "Smooth", "Choose", "Timeline", "Colors" }) do
      set(id, "Enabled", not locked)
    end
    for _, id in pairs(COLOR_IDS) do
      set(id, "Enabled", not locked)
    end
    sync_buttons()
  end

  local function work_text()
    local job = S.job
    local order = { markers = 1, tl_markers = 1, subtitles = 2, timeline = 3, done = 4 }
    local now = order[job.phase] or 4
    local function mark(n)
      return n < now and "✓" or (n == now and "…" or "  ")
    end
    local lines = { T("plugin.tasks_title") }
    if S.analyzed then
      lines[#lines + 1] = "✓ " .. T("plugin.task_analyze")
    end
    lines[#lines + 1] = string.format("%s %s   %d / %d", mark(1), T("plugin.task_markers"), job.marked, job.total)
    lines[#lines + 1] = string.format("%s %s", mark(2), T("plugin.task_subtitle"))
    if S.track_step then
      lines[#lines + 1] = string.format("%s %s", mark(3), T("plugin.task_track"))
    end
    lines[#lines + 1] = ""
    lines[#lines + 1] = T("plugin.wait_short")
    return table.concat(lines, "\\n")
  end

  local save

  local function analysis_text(step)
    local a = S.analysis
    local secs = math.max(0, G_os.time() - a.started)
    local lines = { T("plugin.tasks_title"),
      string.format("… %s (%s)   %d:%02d", T("plugin.task_analyze"), T("plugin.step_" .. (step or "model")),
                    math.floor(secs / 60), secs % 60),
      "  " .. T("plugin.task_markers"),
      "  " .. T("plugin.task_subtitle"),
      "",
      T("plugin.cancel_hint"),
    }
    return table.concat(lines, "\\n")
  end

  local function end_analysis(text, failed)
    S.failed = failed and S.analysis and { path = S.analysis.path, model = S.analysis.model } or nil
    S.state, S.analysis = "select", nil
    lock(false)
    status(text)
    refresh()
  end

  local function start_analysis()
    local info = S.info
    if not model_ok() then
      return
    end
    local dir, err = M.new_job(info.path, { lang = BA.lang, slider = smooth_value(), model = model_value() })
    if not dir then
      status(tostring(err))
      return
    end
    local ok, lerr = M.launch(dir)
    if not ok then
      M.remove_job(dir)
      status(tostring(lerr))
      return
    end
    S.analysis = { dir = dir, started = G_os.time(), clip = info.clip, path = info.path, model = model_value(),
                   marker_timeline = current_timeline(),
                   timeline = get("Timeline", "Checked") and current_timeline() or false }
    S.state = "analyze"
    lock(true)
    status(analysis_text(nil))
  end

  local function cancel_analysis()
    if S.state ~= "analyze" then
      return
    end
    M.cancel(S.analysis.dir)
    end_analysis(T("plugin.msg_cancelled"))
  end

  local function poll_analysis()
    local a = S.analysis
    local r = M.poll(a.dir, a.started, G_os.time())
    if r.state == "running" then
      status(analysis_text(r.step))
      return
    end
    if r.state ~= "ok" then
      local text = r.state == "error" and T("plugin.msg_analysis_error", { message = tostring(r.message or "?") })
        or r.state == "no_start" and T("plugin.msg_no_start", { python = tostring(BA.python) })
        or r.state == "timeout" and T("plugin.msg_timeout")
        or T("plugin.msg_cancelled")
      if r.state == "timeout" then
        M.cancel(a.dir)
      else
        M.remove_job(a.dir)
      end
      end_analysis(text, r.state ~= "cancelled")
      return
    end
    local job, err = M.start(r.markers_path, { colors = read_colors(), timeline = a.timeline, clips = { a.clip },
                                               marker_timeline = a.marker_timeline })
    if not job then
      M.remove_job(a.dir)
      end_analysis(tostring(err), true)
      return
    end
    local engine = M.engine_text(job.data.engine)
    local engine_line = engine and T("plugin.engine", { engine = engine }) or T("plugin.engine_unknown")
    set("Engine", "Text", engine_line)
    fit("Engine", engine_line)
    set("Engine", "Hidden", false)
    S.job, S.state, S.analyzed, S.job_dir = job, "work", true, a.dir
    S.track_step = a.timeline and S.tinfo and S.tinfo.state == "present"
    sync_buttons()
    status(work_text())
  end

  local function finish()
    S.state = "result"
    S.last_result_msg = S.job.msg or ""
    if S.job_dir then
      M.remove_job(S.job_dir)
      S.job_dir = nil
    end
    status(S.last_result_msg)
    lock(true)
    log(S.job.msg)
    if S.close_requested then   -- Resolve closed the window during the work: end now that it is done
      save()
      disp:ExitLoop()
    end
  end

  local function tick()
    S.ticks = S.ticks + 1
    if S.relayout then
      S.relayout = false
      pcall(function() win:RecalcLayout() end)
    end
    if S.state == "work" then
      local ok, done = pcall(S.job.step)
      if not ok then
        log("Error:", done)
        S.job.msg = (S.job.msg or "") .. "\\n" .. tostring(done)
        done = true
      end
      if done then
        finish()
      else
        status(work_text())
      end
    elseif S.state == "analyze" and S.ticks % REFRESH_TICKS == 0 then
      poll_analysis()
    elseif S.state == "select" and S.ticks % REFRESH_TICKS == 0 then
      refresh()
    end
  end

  save = function()
    settings.timeline = get("Timeline", "Checked") and true or false
    settings.colors_open = get("Colors", "Checked") and true or false
    settings.colors = read_colors()
    settings.way = analyze_way() and "analyze" or "json"
    settings.smooth = smooth_value()
    settings.model = model_value()
    local okg, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
    if okg and type(g) == "table" and tonumber(g[1]) and tonumber(g[4]) then
      settings.geometry = { g[1], g[2], g[3], g[4] }
    end
    M.save_settings(settings)
  end

  local function close()
    if S.state == "analyze" then
      cancel_analysis()
    end
    if S.state == "work" then
      log("Close ignored: the work is not finished yet.")
      S.close_requested = true
      pcall(function() win:Show() end)
      return
    end
    save()
    disp:ExitLoop()
  end

  win.On.WayTabs.CurrentChanged = function(ev)
    S.way_idx = tonumber(ev and ev.Index) or 0
    S.info = nil
    refresh()
    relayout()
  end
  win.On.Choose.Clicked = function()
    local okf, path = pcall(function()
      return fu:RequestFile(settings.json_dir or "", "", { FReqB_Saving = false, FReqB_SeqGather = false,
                                                         FReqS_Filter = "BeatAnalyzer JSON (*.json)|*.json",
                                                         FReqS_Title = T("plugin.choose_title") })
    end)
    if not okf or not path or path == "" then
      return
    end
    local okm, mapped = pcall(function() return fu:MapPath(path) end)
    S.json = okm and mapped and mapped ~= "" and mapped or path
    settings.json_dir = S.json:match("^(.*)[/\\\\][^/\\\\]*$") or ""
    refresh()
  end
  win.On.Timeline.Clicked = function() refresh() end
  win.On.Smooth.ValueChanged = function() show_way() end
  win.On.ModelBeatThis.Clicked = function()
    if S.state ~= "select" or S.model == "beat_this" then
      return
    end
    S.model = "beat_this"
    refresh()
    relayout()
  end
  win.On.ModelMd.Clicked = function()
    if S.state ~= "select" or S.model == "md_beat_this" then
      return
    end
    S.model = "md_beat_this"
    refresh()
    relayout()
  end
  win.On.MdConfirm.Clicked = function() refresh() end
  win.On.Cancel.Clicked = function() cancel_analysis() end
  win.On.Colors.Clicked = function() colors_visibility() end
  for _, id in pairs(COLOR_IDS) do
    win.On[id].CurrentIndexChanged = function() update_swatches() end
  end
  win.On.OK.Clicked = function()
    if S.state ~= "select" or not (S.info and S.info.ok) then
      return
    end
    if analyze_way() then
      start_analysis()
      return
    end
    local tl = get("Timeline", "Checked") and current_timeline() or false
    local job, err = M.start(S.json, { colors = read_colors(), timeline = tl })
    if not job then
      status(tostring(err))
      return
    end
    S.job, S.state = job, "work"
    S.track_step = tl and S.tinfo and S.tinfo.state == "present"
    lock(true)
    status(work_text())
  end
  win.On.Remove.Clicked = function()
    if S.state ~= "select" and S.state ~= "result" then
      return
    end
    local clips = remove_clips()
    if #clips == 0 then
      return
    end
    S.remove_clips, S.remove_tl = clips, current_timeline()
    local r = M.removal(clips, S.remove_tl)
    status(r.text)
    if r.markers + r.tracks + r.srt_clips > 0 then
      S.confirm_from = S.state
      S.state = "confirm"
      lock(true)
      relayout()
    end
  end
  win.On.RemoveYes.Clicked = function()
    if S.state ~= "confirm" then
      return
    end
    local done = M.remove(S.remove_clips, S.remove_tl)
    status(done.text)
    S.state = "select"
    lock(false)
    refresh()
  end
  win.On.Close.Clicked = function()
    if S.state == "confirm" then
      local back = S.confirm_from or "select"
      S.confirm_from = nil
      S.state = back
      if back == "result" then
        lock(true)
        status(S.last_result_msg or "")
      else
        lock(false)
        refresh()
        status("")
      end
      return
    end
    close()
  end
  win.On.BeatAnalyzerWin.Close = function() close() end

  local timer = ui:Timer({ ID = "BATimer", Interval = TICK_MS, SingleShot = false })
  local last_event
  local function on_timer(ev)
    if ev ~= nil and ev == last_event then
      return
    end
    last_event = ev
    if ev == nil or ev.who == nil or ev.who == "BATimer" then
      tick()
    end
  end
  disp.On.Timeout = on_timer
  pcall(function() disp.On.BATimer.Timeout = on_timer end)

  M.cleanup_jobs()
  update_swatches()
  colors_visibility()
  refresh()
  timer:Start()
  local want_w, want_h = geometry[3], geometry[4]
  win:Show()
  local okg, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
  local actual = okg and type(g) == "table" and (tostring(g[3]) .. "x" .. tostring(g[4])) or "?"
  log(string.format("Window: requested %dx%d, actual %s", want_w, want_h, actual))
  disp:RunLoop()
  timer:Stop()
  win:Hide()
  log("Window closed")
end

if rawget(_G, "BEATTHIS_NO_RUN") then
  return M
end
M.main()
`,bn=()=>{let{t:e}=xt(),[t,n]=(0,C.useState)(void 0),[r,i]=(0,C.useState)(!1),[a,o]=(0,C.useState)(null);(0,C.useEffect)(()=>{Et().then(n).catch(()=>n(null))},[]);let s=async()=>{i(!0),o(null);try{let t=await Dt();t?n(t):o(e(`web.error.no_server`))}catch(e){o(e instanceof Error?e.message:String(e))}finally{i(!1)}},c=(0,I.jsxs)(`button`,{onClick:()=>_n(yn,`BeatAnalyzer_Markers.lua`,`text/plain`),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer`,children:[(0,I.jsx)(A,{className:`w-3.5 h-3.5`}),(0,I.jsx)(`span`,{children:e(`web.resolve.download_lua`)})]}),l,u=null;return t===void 0?l=e(`web.resolve.checking`):t===null?(l=(0,I.jsxs)(I.Fragment,{children:[e(`web.resolve.no_server`),` `,(0,I.jsx)(`code`,{className:`text-rose-300 break-all`,children:`%APPDATA%\\Blackmagic Design\\DaVinci Resolve\\Support\\Fusion\\Scripts\\Utility\\`})]}),u=c):t.state===`current`?l=(0,I.jsxs)(`span`,{className:`flex items-center gap-1.5 text-emerald-300`,children:[(0,I.jsx)(oe,{className:`w-3.5 h-3.5`}),e(`web.resolve.current`,{version:t.version})]}):(l=t.resolveFound?t.legacyInstalled?e(`web.resolve.legacy`):t.state===`outdated`?e(`web.resolve.outdated`,{installed:t.installedVersion||`?`,version:t.version}):e(`web.resolve.not_installed`):e(`web.resolve.not_found`),u=(0,I.jsxs)(`button`,{onClick:s,disabled:r,className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60 cursor-pointer`,children:[r?(0,I.jsx)(xe,{className:`w-3.5 h-3.5 animate-spin`}):(0,I.jsx)(Te,{className:`w-3.5 h-3.5`}),(0,I.jsx)(`span`,{children:t.state===`outdated`?e(`web.resolve.update`):e(`web.resolve.install`)})]})),(0,I.jsxs)(`div`,{className:`p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2`,children:[(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-3`,children:[(0,I.jsxs)(`div`,{className:`text-slate-300 leading-relaxed flex-1 min-w-[200px]`,children:[(0,I.jsxs)(`span`,{className:`font-semibold text-slate-200`,children:[e(`web.resolve.script`),` `]}),l]}),u]}),t&&t.state===`current`&&(0,I.jsx)(`p`,{className:`text-slate-500 break-all`,children:e(`web.resolve.restart`)}),a&&(0,I.jsx)(`p`,{className:`text-rose-300`,children:a})]})},xn=({result:e,onClose:t})=>{let{t:n,num:r,meter:i}=xt(),[a,o]=(0,C.useState)(`davinci`),[s,c]=(0,C.useState)(!1),[l,u]=(0,C.useState)(!1),d=e.metadata.fileName.replace(/\.[^/.]+$/,``),f=e.engineInfo?.id===`md_beat_this`,p=e.attribution??`Masked Diffusion (md_beat_this) by Francesco Foscarin, Filip Korzeniowski, Richard Vogl (https://github.com/fosfrancesco/md_beat_this) — Licensed under CC BY-NC 4.0 (Non-Commercial Use Only).`,m=hn(e),h=dn(e),g=un(e),_=fn(e),v=e=>{navigator.clipboard.writeText(e),c(!0),setTimeout(()=>c(!1),2e3)};return(0,I.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150`,children:(0,I.jsxs)(`div`,{className:`relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(A,{className:`w-5 h-5 text-cyan-400`}),(0,I.jsx)(`h2`,{className:`text-base font-bold text-white`,children:n(`web.export.title`)})]}),(0,I.jsx)(`button`,{onClick:t,className:`p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`,children:(0,I.jsx)(Ue,{className:`w-5 h-5`})})]}),(0,I.jsxs)(`div`,{className:`grid grid-cols-5 p-2 bg-slate-950/80 border-b border-slate-800 gap-1 text-xs font-medium`,children:[(0,I.jsxs)(`button`,{onClick:()=>o(`davinci`),className:`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${a===`davinci`?`bg-rose-950 text-rose-300 border border-rose-800/80 font-bold shadow-sm`:`text-slate-400 hover:text-slate-200`}`,children:[(0,I.jsx)(me,{className:`w-4 h-4 text-rose-400`}),(0,I.jsx)(`span`,{children:`DaVinci Resolve`})]}),(0,I.jsxs)(`button`,{onClick:()=>o(`audacity`),className:`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${a===`audacity`?`bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm`:`text-slate-400 hover:text-slate-200`}`,children:[(0,I.jsx)(pe,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:`Audacity`})]}),(0,I.jsxs)(`button`,{onClick:()=>o(`json`),className:`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${a===`json`?`bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm`:`text-slate-400 hover:text-slate-200`}`,children:[(0,I.jsx)(ce,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:`beat_this JSON`})]}),(0,I.jsxs)(`button`,{onClick:()=>o(`midi`),className:`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${a===`midi`?`bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm`:`text-slate-400 hover:text-slate-200`}`,children:[(0,I.jsx)(P,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:`MIDI (.mid)`})]}),(0,I.jsxs)(`button`,{onClick:()=>o(`csv`),className:`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-colors cursor-pointer ${a===`csv`?`bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm`:`text-slate-400 hover:text-slate-200`}`,children:[(0,I.jsx)(Ie,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:`CSV`})]})]}),(0,I.jsxs)(`div`,{className:`p-6 flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-4`,children:[f&&(0,I.jsxs)(`div`,{className:`p-3 rounded-xl bg-amber-950/30 border border-amber-700/60 font-sans text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`,children:[(0,I.jsxs)(`div`,{className:`flex items-start gap-2`,children:[(0,I.jsx)(ze,{className:`w-4 h-4 text-amber-400 shrink-0 mt-0.5`}),(0,I.jsxs)(`div`,{className:`space-y-0.5`,children:[(0,I.jsx)(`div`,{className:`font-semibold`,children:n(`web.export.attribution_required`)}),(0,I.jsx)(`div`,{className:`text-[11px] text-amber-200/80`,children:p})]})]}),(0,I.jsx)(`button`,{type:`button`,onClick:()=>{navigator.clipboard.writeText(p),u(!0),setTimeout(()=>u(!1),2e3)},className:`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-amber-900/50 hover:bg-amber-900/80 text-amber-100 border border-amber-700/60 transition-colors cursor-pointer`,children:l?(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(ne,{className:`w-3.5 h-3.5 text-emerald-400`}),(0,I.jsx)(`span`,{children:n(`web.export.copied`)})]}):(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(le,{className:`w-3.5 h-3.5`}),(0,I.jsx)(`span`,{children:n(`web.export.copy_attribution`)})]})})]}),a===`davinci`&&(0,I.jsxs)(`div`,{className:`space-y-4 font-sans`,children:[(0,I.jsxs)(`div`,{className:`p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-800/40 space-y-1.5`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-rose-300 font-bold text-sm`,children:[(0,I.jsx)(me,{className:`w-4 h-4 text-rose-400`}),(0,I.jsx)(`span`,{children:n(`web.export.resolve_title`)})]}),(0,I.jsx)(`p`,{className:`text-slate-400 text-xs leading-relaxed`,children:n(`web.export.resolve_intro`)})]}),(0,I.jsx)(bn,{}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-cyan-300 font-semibold`,children:[(0,I.jsx)(M,{className:`w-4 h-4 text-cyan-400`}),(0,I.jsx)(`span`,{children:n(`web.export.resolve_steps`)})]}),(0,I.jsxs)(`ol`,{className:`list-decimal pl-5 space-y-1 text-slate-300 leading-relaxed`,children:[(0,I.jsx)(`li`,{children:n(`web.export.step_install`)}),(0,I.jsx)(`li`,{children:(0,I.jsx)(`strong`,{children:n(`web.export.step_download`)})}),(0,I.jsxs)(`li`,{children:[n(`web.export.step_select`),` `,(0,I.jsx)(`code`,{className:`text-rose-300`,children:e.metadata.fileName}),`.`]}),(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`code`,{className:`text-rose-300 bg-slate-900 px-1.5 py-0.5 rounded`,children:`Workspace → Scripts → BeatAnalyzer_Markers`}),` `,n(`web.export.step_open`,{way:n(`plugin.way_json`)})]})]}),e.resolveOffset?(0,I.jsxs)(`p`,{className:`rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-3 py-2 text-cyan-200 leading-relaxed`,children:[(0,I.jsx)(`strong`,{children:`MP3:`}),` `,n(`web.export.mp3_offset`,{ms:Math.round(e.resolveOffset*1e3)})]}):null,(0,I.jsx)(`p`,{className:`text-slate-500 leading-relaxed`,children:n(`web.export.resolve_more`,{srt:`${e.metadata.fileName.replace(/\.[^/.]+$/,``)}.srt`})})]}),(0,I.jsxs)(`div`,{className:`space-y-1.5 font-mono`,children:[(0,I.jsxs)(`div`,{className:`flex justify-between items-center text-[11px] text-slate-400`,children:[(0,I.jsx)(`span`,{children:n(`web.export.preview`)}),(0,I.jsxs)(`span`,{children:[e.totalBeats,` Marker`]})]}),(0,I.jsxs)(`pre`,{className:`p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-rose-300 max-h-36`,children:[m.split(`
`).slice(0,24).join(`
`),`
...`]})]})]}),a===`audacity`&&(0,I.jsxs)(`div`,{className:`space-y-2`,children:[(0,I.jsx)(`div`,{className:`text-slate-400 leading-relaxed font-sans text-xs`,children:n(`web.export.audacity`)}),(0,I.jsx)(`pre`,{className:`p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-emerald-300 max-h-72`,children:g})]}),a===`json`&&(0,I.jsxs)(`div`,{className:`space-y-2`,children:[(0,I.jsxs)(`div`,{className:`flex justify-between items-center text-slate-400`,children:[(0,I.jsx)(`span`,{children:n(`web.export.json_title`)}),(0,I.jsx)(`span`,{children:n(`web.export.json_count`,{beats:e.totalBeats,bars:e.totalBars})})]}),(0,I.jsx)(`pre`,{className:`p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-cyan-300 max-h-72`,children:h})]}),a===`midi`&&(0,I.jsxs)(`div`,{className:`p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-center`,children:[(0,I.jsx)(`div`,{className:`w-12 h-12 rounded-full bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-cyan-400 mx-auto`,children:(0,I.jsx)(P,{className:`w-6 h-6`})}),(0,I.jsxs)(`div`,{className:`font-sans space-y-1`,children:[(0,I.jsx)(`h4`,{className:`text-sm font-bold text-white`,children:n(`web.export.midi_title`)}),(0,I.jsx)(`p`,{className:`text-xs text-slate-400 max-w-md mx-auto`,children:n(`web.export.midi_text`,{bpm:r(e.globalBpm,1),meter:i(e.timeSignature.name)})})]}),(0,I.jsx)(`div`,{className:`text-[11px] text-slate-500 font-mono`,children:n(`web.export.midi_compat`)})]}),a===`csv`&&(0,I.jsxs)(`div`,{className:`space-y-2`,children:[(0,I.jsx)(`div`,{className:`text-slate-400 font-sans text-xs`,children:n(`web.export.csv`)}),(0,I.jsx)(`pre`,{className:`p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] overflow-x-auto text-amber-300 max-h-72`,children:_})]})]}),(0,I.jsxs)(`div`,{className:`px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3`,children:[a===`davinci`||a===`midi`?(0,I.jsx)(`div`,{}):(0,I.jsxs)(`button`,{onClick:()=>v(a===`json`?h:a===`audacity`?g:_),className:`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer`,children:[s?(0,I.jsx)(ne,{className:`w-4 h-4 text-emerald-400`}):(0,I.jsx)(le,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:n(s?`web.export.copied`:`web.export.copy`)})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(`button`,{onClick:t,className:`px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer`,children:n(`web.common.close`)}),(0,I.jsxs)(`button`,{onClick:()=>{a===`davinci`?_n(m,`${d}_resolve_markers.json`,`application/json`):a===`json`?_n(h,`${d}_beat_this.json`,`application/json`):a===`audacity`?_n(g,`${d}_audacity_labels.txt`,`text/plain`):a===`csv`?_n(_,`${d}_beats.csv`,`text/csv`):a===`midi`&&vn(pn(e),`${d}_click_track.mid`)},className:`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all cursor-pointer ${a===`davinci`?`bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-rose-950`:`bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-indigo-950`}`,children:[(0,I.jsx)(A,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:n(a===`davinci`?`web.export.download_markers`:`web.export.download`)})]})]})]})]})})},Sn=({onClose:e})=>{let{t}=xt();return(0,I.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150`,children:(0,I.jsxs)(`div`,{className:`relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(k,{className:`w-5 h-5 text-cyan-400`}),(0,I.jsx)(`h2`,{className:`text-base font-bold text-white`,children:t(`web.info.title`)})]}),(0,I.jsx)(`button`,{onClick:e,className:`p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`,children:(0,I.jsx)(Ue,{className:`w-5 h-5`})})]}),(0,I.jsxs)(`div`,{className:`p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed`,children:[(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-2`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,I.jsx)(`span`,{className:`text-[11px] font-bold uppercase tracking-wider text-cyan-400`,children:t(`web.info.standard`)}),(0,I.jsxs)(`a`,{href:`https://github.com/CPJKU/beat_this`,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white font-medium underline`,children:[(0,I.jsx)(`span`,{children:`GitHub`}),(0,I.jsx)(de,{className:`w-3 h-3`})]})]}),(0,I.jsx)(`h3`,{className:`text-sm font-bold text-white`,children:`Beat this! Accurate beat tracking without DBN postprocessing (ISMIR 2024)`}),(0,I.jsx)(`p`,{className:`text-slate-400`,children:t(`web.info.beat_this_text`)})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-amber-950/25 border border-amber-700/50 space-y-2`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between gap-2 flex-wrap`,children:[(0,I.jsx)(`span`,{className:`text-[11px] font-bold uppercase tracking-wider text-amber-300`,children:t(`web.info.optional`)}),(0,I.jsxs)(`a`,{href:`https://github.com/fosfrancesco/md_beat_this/blob/main/README.md#installation`,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center gap-1 text-[11px] text-amber-300 hover:text-white font-medium underline`,children:[(0,I.jsx)(`span`,{children:t(`web.info.installation`)}),(0,I.jsx)(de,{className:`w-3 h-3`})]})]}),(0,I.jsx)(`h3`,{className:`text-sm font-bold text-white`,children:`Masked Diffusion Enables Coherent Beat Tracking (md_beat_this)`}),(0,I.jsxs)(`p`,{className:`text-slate-300`,children:[t(`web.info.md_text`),` `,(0,I.jsx)(`code`,{className:`text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded`,children:`venv\\Scripts\\pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip`})]})]}),(0,I.jsxs)(`div`,{className:`space-y-3`,children:[(0,I.jsxs)(`h4`,{className:`text-sm font-bold text-white flex items-center gap-2`,children:[(0,I.jsx)(be,{className:`w-4 h-4 text-indigo-400`}),t(`web.info.why`)]}),(0,I.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-3`,children:[`downbeats`,`meter`,`robust`,`formats`].map(e=>(0,I.jsxs)(`div`,{className:`p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-cyan-300 font-semibold`,children:[(0,I.jsx)(oe,{className:`w-3.5 h-3.5 text-cyan-400`}),t(`web.info.adv_${e}`)]}),(0,I.jsx)(`p`,{className:`text-[11px] text-slate-400`,children:t(`web.info.adv_${e}_text`)})]},e))})]}),(0,I.jsxs)(`div`,{className:`space-y-3`,children:[(0,I.jsxs)(`h4`,{className:`text-sm font-bold text-white flex items-center gap-2`,children:[(0,I.jsx)(ve,{className:`w-4 h-4 text-cyan-400`}),t(`web.info.pipeline`)]}),(0,I.jsx)(`div`,{className:`space-y-2 text-[11px] text-slate-300`,children:[1,2,3].map(e=>(0,I.jsxs)(`div`,{className:`flex items-start gap-2.5`,children:[(0,I.jsx)(`div`,{className:`w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 font-bold text-[10px]`,children:e}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`strong`,{className:`text-white`,children:t(`web.info.step${e}`)}),` `,t(`web.info.step${e}_text`)]})]},e))})]})]}),(0,I.jsx)(`div`,{className:`px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end`,children:(0,I.jsx)(`button`,{onClick:e,className:`px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer`,children:t(`web.common.close`)})})]})})},Cn=({backendHealth:e,onHealthUpdated:t})=>{let{t:n}=xt(),[r,i]=(0,C.useState)(e?.ffmpeg_dir??``),[a,o]=(0,C.useState)(!1),[s,c]=(0,C.useState)(!1),[l,u]=(0,C.useState)(null),[d,f]=(0,C.useState)(null);if((0,C.useEffect)(()=>{a||i(e?.ffmpeg_dir??``)},[e?.ffmpeg_dir,a]),!e)return(0,I.jsxs)(`div`,{className:`p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400`,children:[(0,I.jsx)(`strong`,{className:`text-slate-200`,children:`ffmpeg:`}),` `,n(`web.ffmpeg.no_server`)]});let p=!!e.ffmpeg_available,m=!p||a,h=async e=>{c(!0),u(null),f(null);try{let r=await Tt(e);if(!r){u(n(`web.error.no_server`));return}let i=await wt();i&&t?.(i),o(!1),f(e.trim()?n(`web.ffmpeg.found`,{path:r.ffmpegPath??``}):r.ffmpegAvailable?n(`web.ffmpeg.reset_system`,{path:r.ffmpegPath??``}):n(`web.ffmpeg.reset_none`))}catch(e){u(e instanceof Error?e.message:n(`web.ffmpeg.save_failed`))}finally{c(!1)}};return(0,I.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-[11px]`,children:[(0,I.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2`,children:[p?(0,I.jsxs)(`div`,{className:`flex items-start gap-2 text-emerald-300`,children:[(0,I.jsx)(oe,{className:`w-4 h-4 text-emerald-400 shrink-0 mt-0.5`}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`span`,{className:`font-semibold`,children:n(`web.ffmpeg.available`,{source:e.ffmpeg_source===`custom`?n(`web.ffmpeg.source_custom`):n(`web.ffmpeg.source_system`)})}),e.ffmpeg_path&&(0,I.jsx)(`code`,{className:`block text-[10px] text-slate-400 font-mono break-all mt-0.5`,children:e.ffmpeg_path})]})]}):(0,I.jsxs)(`div`,{className:`flex items-start gap-2 text-amber-300`,children:[(0,I.jsx)(ze,{className:`w-4 h-4 text-amber-400 shrink-0 mt-0.5`}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`span`,{className:`font-semibold`,children:n(`web.ffmpeg.missing`)}),(0,I.jsx)(`span`,{className:`block text-amber-200/80 mt-0.5`,children:n(`web.ffmpeg.missing_hint`)})]})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 shrink-0`,children:[p&&(0,I.jsx)(`button`,{type:`button`,onClick:()=>{o(e=>!e),u(null)},className:`px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer`,children:n(a?`web.common.close`:`web.ffmpeg.change`)}),e.ffmpeg_dir&&(0,I.jsxs)(`button`,{type:`button`,disabled:s,onClick:()=>{i(``),h(``)},className:`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50`,title:n(`web.ffmpeg.reset_tip`),children:[(0,I.jsx)(Ae,{className:`w-3 h-3`}),(0,I.jsx)(`span`,{children:n(`web.ffmpeg.reset`)})]})]})]}),m&&(0,I.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),h(r)},className:`flex flex-col sm:flex-row gap-2`,children:[(0,I.jsxs)(`div`,{className:`relative flex-1`,children:[(0,I.jsx)(ge,{className:`w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none`}),(0,I.jsx)(`input`,{type:`text`,value:r,onChange:e=>i(e.target.value),placeholder:n(`web.ffmpeg.placeholder`),"aria-label":n(`web.ffmpeg.folder`),className:`w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none`})]}),(0,I.jsxs)(`button`,{type:`submit`,disabled:s||!r.trim(),className:`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0`,children:[s&&(0,I.jsx)(xe,{className:`w-3.5 h-3.5 animate-spin`}),(0,I.jsx)(`span`,{children:n(`web.ffmpeg.save`)})]})]}),l&&(0,I.jsxs)(`div`,{className:`flex items-start gap-1.5 text-rose-300`,children:[(0,I.jsx)(ie,{className:`w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5`}),(0,I.jsx)(`span`,{children:l})]}),d&&!l&&(0,I.jsxs)(`div`,{className:`flex items-start gap-1.5 text-emerald-300`,children:[(0,I.jsx)(oe,{className:`w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5`}),(0,I.jsx)(`span`,{children:d})]})]})},wn=({onClose:e,backendHealth:t,onHealthUpdated:n})=>{let{t:r}=xt(),[i,a]=(0,C.useState)(!1);return(0,I.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150`,children:(0,I.jsxs)(`div`,{className:`relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(Le,{className:`w-5 h-5 text-cyan-400`}),(0,I.jsx)(`h2`,{className:`text-base font-bold text-white`,children:r(`web.setup.title`)})]}),(0,I.jsx)(`button`,{onClick:e,className:`p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`,children:(0,I.jsx)(Ue,{className:`w-5 h-5`})})]}),(0,I.jsxs)(`div`,{className:`p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed`,children:[(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-2`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-cyan-300 font-bold text-sm`,children:[(0,I.jsx)(ye,{className:`w-4 h-4 text-cyan-400`}),(0,I.jsx)(`span`,{children:r(`web.setup.venv_title`)})]}),(0,I.jsx)(`p`,{className:`text-slate-400`,children:r(`web.setup.venv_text`)})]}),(0,I.jsxs)(`div`,{className:`space-y-4`,children:[(0,I.jsxs)(`h3`,{className:`text-sm font-bold text-white flex items-center gap-2`,children:[(0,I.jsx)(O,{className:`w-4 h-4 text-indigo-400`}),r(`web.setup.steps`)]}),(0,I.jsxs)(`div`,{className:`space-y-3`,children:[(0,I.jsxs)(`div`,{className:`p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-white font-semibold`,children:[(0,I.jsx)(`span`,{className:`w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold`,children:`1`}),(0,I.jsx)(`span`,{children:r(`web.setup.step1`)})]}),(0,I.jsxs)(`p`,{className:`text-slate-400 text-[11px] pl-7`,children:[r(`web.setup.step1_text`),` `,(0,I.jsx)(`a`,{href:`https://www.python.org/downloads/`,target:`_blank`,rel:`noopener noreferrer`,className:`text-cyan-400 underline`,children:`python.org`})]})]}),(0,I.jsxs)(`div`,{className:`p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-white font-semibold`,children:[(0,I.jsx)(`span`,{className:`w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold`,children:`2`}),(0,I.jsxs)(`span`,{children:[r(`web.setup.step2`),` `,(0,I.jsx)(`code`,{className:`text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono`,children:`install_and_run.bat`})]})]}),(0,I.jsx)(`p`,{className:`text-slate-400 text-[11px] pl-7`,children:r(`web.setup.step2_text`)})]}),(0,I.jsxs)(`div`,{className:`p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-white font-semibold`,children:[(0,I.jsx)(`span`,{className:`w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold`,children:`3`}),(0,I.jsxs)(`span`,{children:[r(`web.setup.step3`),` `,(0,I.jsx)(`code`,{className:`text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono`,children:`http://localhost:8000`})]})]}),(0,I.jsx)(`p`,{className:`text-slate-400 text-[11px] pl-7`,children:r(`web.setup.step3_text`)})]})]})]}),(0,I.jsxs)(`div`,{className:`space-y-2`,children:[(0,I.jsx)(`h4`,{className:`text-xs font-bold text-slate-300 uppercase tracking-wider`,children:r(`web.setup.files`)}),(0,I.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]`,children:[(0,I.jsxs)(`div`,{className:`p-2.5 rounded-lg bg-slate-950 border border-slate-800`,children:[(0,I.jsx)(`div`,{className:`font-mono font-bold text-cyan-400`,children:`install_and_run.bat`}),(0,I.jsx)(`div`,{className:`text-slate-400 mt-0.5`,children:r(`web.setup.file_install`)})]}),(0,I.jsxs)(`div`,{className:`p-2.5 rounded-lg bg-slate-950 border border-slate-800`,children:[(0,I.jsx)(`div`,{className:`font-mono font-bold text-indigo-400`,children:`start.bat`}),(0,I.jsx)(`div`,{className:`text-slate-400 mt-0.5`,children:r(`web.setup.file_start`)})]}),(0,I.jsxs)(`div`,{className:`p-2.5 rounded-lg bg-slate-950 border border-slate-800`,children:[(0,I.jsx)(`div`,{className:`font-mono font-bold text-emerald-400`,children:`run_cli.bat`}),(0,I.jsx)(`div`,{className:`text-slate-400 mt-0.5`,children:r(`web.setup.file_cli`)})]}),(0,I.jsxs)(`div`,{className:`p-2.5 rounded-lg bg-slate-950 border border-slate-800`,children:[(0,I.jsx)(`div`,{className:`font-mono font-bold text-amber-400`,children:`install_and_run.sh`}),(0,I.jsx)(`div`,{className:`text-slate-400 mt-0.5`,children:r(`web.setup.file_sh`)})]})]})]}),(0,I.jsxs)(`div`,{className:`p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5`,children:[(0,I.jsx)(k,{className:`w-4 h-4 text-emerald-400 shrink-0 mt-0.5`}),(0,I.jsxs)(`div`,{className:`text-[11px] text-slate-400`,children:[(0,I.jsx)(`strong`,{className:`text-slate-200`,children:r(`web.setup.gpu_title`)}),` `,r(`web.setup.gpu_text`)]})]}),(0,I.jsxs)(`div`,{className:`p-3 rounded-lg bg-amber-950/25 border border-amber-800/50 space-y-2`,children:[(0,I.jsx)(`div`,{className:`text-[11px] font-semibold text-amber-300`,children:r(`web.setup.md_title`)}),(0,I.jsxs)(`p`,{className:`text-[11px] text-slate-300`,children:[r(`web.setup.md_text1`),` `,(0,I.jsx)(`a`,{href:`https://github.com/fosfrancesco/md_beat_this/blob/main/README.md#installation`,target:`_blank`,rel:`noopener noreferrer`,className:`text-cyan-400 underline`,children:`fosfrancesco/md_beat_this`}),` `,r(`web.setup.md_text2`)]}),(0,I.jsx)(`code`,{className:`block text-[11px] font-mono text-cyan-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 overflow-x-auto`,children:`venv\\Scripts\\pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip`}),(0,I.jsx)(`code`,{className:`block text-[11px] font-mono text-cyan-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 overflow-x-auto`,children:`venv/bin/pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip`}),(0,I.jsx)(Cn,{backendHealth:t,onHealthUpdated:n})]})]}),(0,I.jsx)(`div`,{className:`px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end`,children:(0,I.jsx)(`button`,{onClick:e,className:`px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer`,children:r(`web.common.ok`)})})]})})},Tn=`venv\\Scripts\\pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip`,En=`venv/bin/pip install https://github.com/fosfrancesco/md_beat_this/archive/main.zip`,Dn=`https://github.com/fosfrancesco/md_beat_this/blob/main/README.md#installation`,On=({onConfirm:e,onCancel:t,backendHealth:n,onHealthUpdated:r,isInstalled:i=!1,alreadyConfirmed:a=!1})=>{let{t:o}=xt(),s=!!n,[c,l]=(0,C.useState)(null),[u,d]=(0,C.useState)(a),f=(e,t)=>{navigator.clipboard.writeText(e),l(t),setTimeout(()=>l(null),2e3)};return(0,I.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`nc-modal-title`,children:(0,I.jsxs)(`div`,{className:`relative w-full max-w-xl rounded-2xl bg-slate-900 border border-amber-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-amber-950/25`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2.5`,children:[(0,I.jsx)(`div`,{className:`w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400`,children:(0,I.jsx)(ze,{className:`w-4 h-4`})}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`h2`,{id:`nc-modal-title`,className:`text-sm sm:text-base font-bold text-white`,children:o(`web.nc.title`)}),(0,I.jsx)(`p`,{className:`text-[11px] text-amber-300/90 font-medium`,children:`Masked Diffusion (md_beat_this) · CC BY-NC 4.0`})]})]}),(0,I.jsx)(`button`,{onClick:t,className:`p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`,"aria-label":o(`web.common.close`),children:(0,I.jsx)(Ue,{className:`w-5 h-5`})})]}),(0,I.jsxs)(`div`,{className:`p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed`,children:[(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-amber-950/35 border border-amber-700/60 space-y-2.5`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-amber-300 font-bold text-sm`,children:[(0,I.jsx)(Ne,{className:`w-4 h-4 text-amber-400 shrink-0`}),(0,I.jsx)(`span`,{children:o(`web.nc.only_nc`)})]}),(0,I.jsx)(`p`,{className:`text-amber-100/90 leading-relaxed`,children:o(`web.nc.intro`)}),(0,I.jsxs)(`ul`,{className:`list-disc pl-4 space-y-1 text-[11px] text-slate-300`,children:[(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`strong`,{className:`text-white`,children:o(`web.nc.private_title`)}),` `,o(`web.nc.private_text`)]}),(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`strong`,{className:`text-white`,children:o(`web.nc.social_title`)}),` `,o(`web.nc.social_text`)]}),(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`strong`,{className:`text-white`,children:o(`web.nc.attribution_title`)}),` `,o(`web.nc.attribution_text`)]})]})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between gap-2`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-200 font-semibold`,children:[(0,I.jsx)(Le,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,I.jsx)(`span`,{children:o(`web.nc.install_title`)})]}),(0,I.jsxs)(`a`,{href:Dn,target:`_blank`,rel:`noopener noreferrer`,className:`inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline`,children:[(0,I.jsx)(`span`,{children:`GitHub README (#installation)`}),(0,I.jsx)(de,{className:`w-3 h-3`})]})]}),s&&i?(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-emerald-300 text-[11px]`,children:[(0,I.jsx)(oe,{className:`w-4 h-4 text-emerald-400 shrink-0`}),(0,I.jsx)(`span`,{children:o(`web.nc.installed`)})]}):(0,I.jsx)(`p`,{className:`text-[11px] text-slate-400`,children:o(`web.nc.install_text`)}),(0,I.jsx)(Cn,{backendHealth:n,onHealthUpdated:r}),(0,I.jsxs)(`div`,{className:`space-y-2`,children:[(0,I.jsxs)(`div`,{className:`space-y-1`,children:[(0,I.jsx)(`div`,{className:`text-[10px] uppercase tracking-wider font-semibold text-slate-400`,children:o(`web.nc.windows`)}),(0,I.jsxs)(`div`,{className:`flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2`,children:[(0,I.jsx)(`code`,{className:`text-[11px] text-cyan-300 font-mono truncate flex-1`,children:Tn}),(0,I.jsx)(`button`,{type:`button`,onClick:()=>f(Tn,`win`),className:`shrink-0 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer`,title:o(`web.nc.copy_cmd`),children:c===`win`?(0,I.jsx)(ne,{className:`w-3.5 h-3.5 text-emerald-400`}):(0,I.jsx)(le,{className:`w-3.5 h-3.5`})})]})]}),(0,I.jsxs)(`div`,{className:`space-y-1`,children:[(0,I.jsx)(`div`,{className:`text-[10px] uppercase tracking-wider font-semibold text-slate-400`,children:o(`web.nc.unix`)}),(0,I.jsxs)(`div`,{className:`flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2`,children:[(0,I.jsx)(`code`,{className:`text-[11px] text-cyan-300 font-mono truncate flex-1`,children:En}),(0,I.jsx)(`button`,{type:`button`,onClick:()=>f(En,`unix`),className:`shrink-0 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer`,title:o(`web.nc.copy_cmd`),children:c===`unix`?(0,I.jsx)(ne,{className:`w-3.5 h-3.5 text-emerald-400`}):(0,I.jsx)(le,{className:`w-3.5 h-3.5`})})]})]})]})]}),a?(0,I.jsxs)(`div`,{className:`flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-700/50 text-[11px] text-emerald-300`,children:[(0,I.jsx)(oe,{className:`w-4 h-4 text-emerald-400 shrink-0`}),(0,I.jsx)(`span`,{children:o(`web.nc.confirmed`)})]}):(0,I.jsxs)(`label`,{className:`flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-amber-700/50 hover:border-amber-500/70 transition-colors cursor-pointer select-none`,children:[(0,I.jsx)(`input`,{type:`checkbox`,checked:u,onChange:e=>d(e.target.checked),className:`mt-0.5 h-4 w-4 rounded border-amber-600 bg-slate-900 text-amber-400 focus:ring-amber-400 cursor-pointer shrink-0`}),(0,I.jsx)(`span`,{className:`text-[11px] text-slate-200 leading-relaxed`,children:o(`web.nc.confirm_text`)})]})]}),(0,I.jsx)(`div`,{className:`px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-end gap-2.5`,children:a?(0,I.jsx)(`button`,{type:`button`,onClick:t,className:`px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer`,children:o(`web.nc.done`)}):(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)(`button`,{type:`button`,onClick:t,className:`px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer`,children:o(`web.common.cancel`)}),(0,I.jsx)(`button`,{type:`button`,disabled:!u,onClick:e,className:`px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-amber-950/50 transition-colors cursor-pointer`,children:o(`web.nc.confirm`)})]})})]})})};function kn(){let{t:e,pctValue:t}=xt(),[n,r]=(0,C.useState)(null),[i,a]=(0,C.useState)(`beat_this`),[o,s]=(0,C.useState)(!1),[c,l]=(0,C.useState)(!1),[u,d]=(0,C.useState)(null),[f,p]=(0,C.useState)(!1),[m,h]=(0,C.useState)(0),[g,_]=(0,C.useState)({key:``}),v=g.key?e(g.key,g.params):``,[y,b]=(0,C.useState)(null),[x,S]=(0,C.useState)(null),[w,T]=(0,C.useState)(!0),[ee,E]=(0,C.useState)(.95),te=(0,C.useRef)(null),ne=(0,C.useRef)(null),[re,D]=(0,C.useState)(!1),[ie,ae]=(0,C.useState)(0),[oe,O]=(0,C.useState)(null),[se,ce]=(0,C.useState)(1),[le,k]=(0,C.useState)(!0),[ue,A]=(0,C.useState)(.65),[de,j]=(0,C.useState)(1),[fe,pe]=(0,C.useState)(`off`),[me,he]=(0,C.useState)(null),ge=(0,C.useRef)(null),_e=(0,C.useRef)(`off`),ve=(0,C.useRef)(null),[M,N]=(0,C.useState)(!1),[ye,be]=(0,C.useState)(!1),[xe,Se]=(0,C.useState)(!1),P=(0,C.useRef)(null);(0,C.useEffect)(()=>{let e=new St;return P.current=e,e.onTimeUpdate=e=>{ae(e)},e.onBeatTrigger=e=>{O(e)},e.onEnded=()=>{D(!1),ae(0),O(null)},wt().then(e=>{e&&d(e)}),()=>{e.destroy(),P.current=null}},[]);let F=async(t,n,a={})=>{let o=a.smooth??!0,s=a.protect??.95,c=a.model??i;a.reanalysis||(te.current=null),ne.current={file:t,name:n};try{b(null),p(!0),h(5),_({key:`web.progress.load`}),P.current&&P.current.stop(),D(!1),ae(0),O(null);let{result:e,audioBuffer:i}=await Ye(t,n,(e,t,n)=>{h(e),_({key:t,params:n})},{smoothBars:o,requireServer:a.reanalysis??!1,protect:s,audioBuffer:a.reanalysis?te.current??void 0:void 0,model:c});te.current=i,S(i),a.reanalysis||(pe(`off`),_e.current=`off`,he(null),P.current?.setLoop(null)),r(e),T(o),E(s),P.current&&P.current.loadBuffer(i,e.beats)}catch(t){console.error(`Analysis error:`,t);let n=t instanceof Je?e(t.key,t.params):t instanceof Error?t.message:e(`web.error.unexpected`);b(n)}finally{p(!1)}},Ce=(0,C.useCallback)(()=>{P.current&&n&&(P.current.play(),D(!0))},[n]),we=(0,C.useCallback)(()=>{P.current&&(P.current.pause(),D(!1))},[]),Te=(0,C.useCallback)((e,t)=>{_e.current=e,pe(e),he(t),P.current?.setLoop(t)},[]),Ee=(0,C.useCallback)(e=>{P.current&&(me&&fe===`view`&&(e<me.start||e>=me.end)&&Te(`off`,null),P.current.seek(e),ae(e))},[me,fe,Te]),De=(0,C.useCallback)(()=>{if(!n)return;let e=n.metadata.duration,t=ge.current,r=t!==null&&t.end-t.start<e-.05;fe===`off`&&r&&t?Te(`view`,{start:t.start,end:t.end}):fe!==`song`&&!(fe===`off`&&r)?Te(`song`,{start:0,end:e}):Te(`off`,null)},[n,fe,Te]),Oe=(0,C.useCallback)((e,t)=>{ge.current={start:e,end:t},_e.current===`view`&&(ve.current&&clearTimeout(ve.current),ve.current=setTimeout(()=>{_e.current===`view`&&Te(`view`,{start:e,end:t})},150))},[Te]),ke=(0,C.useCallback)(e=>{j(e),P.current?.setMusicVolume(e)},[]),Ae=(0,C.useCallback)(e=>{ce(e),P.current&&P.current.setPlaybackRate(e)},[]),je=(0,C.useCallback)(()=>{k(e=>{let t=!e;return P.current?.setMetronomeEnabled(t),t})},[]),Ne=(0,C.useCallback)(e=>{A(e),P.current?.setMetronomeVolume(e)},[]),Pe=(0,C.useCallback)(e=>{if(!n)return;let t=e.filter(e=>e.isDownbeat);r(n=>n?{...n,beats:e,downbeats:t,totalBeats:e.length,totalBars:t.length}:null),P.current?.updateBeats(e)},[n]),Fe=(0,C.useCallback)(()=>{P.current?.stop(),D(!1),ae(0),O(null),r(null),b(null)},[]);return(0,I.jsxs)(`div`,{className:`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans`,children:[(0,I.jsx)(jt,{result:n,selectedModel:i,serverEngine:u?u.models?.[i]??u.engineInfo??null:null,onReset:Fe,onOpenExport:()=>N(!0),onOpenModelInfo:()=>be(!0),onOpenLocalSetup:()=>Se(!0)}),(0,I.jsx)(`main`,{className:`flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6`,children:n?(0,I.jsxs)(`div`,{className:`space-y-6 animate-in fade-in duration-300`,children:[n.selectedModel===`md_beat_this`&&(0,I.jsxs)(`div`,{className:`px-3.5 py-2 rounded-xl bg-amber-950/35 border border-amber-600/60 text-xs flex items-center justify-between gap-3`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 min-w-0`,children:[(0,I.jsx)(ze,{className:`w-3.5 h-3.5 text-amber-400 shrink-0`}),(0,I.jsx)(`p`,{className:`text-amber-200 font-medium truncate`,children:n.engineInfo?.id===`librosa`?e(`web.app.md_fallback`,{engine:n.engine??``}):e(`web.app.md_active`)})]}),(0,I.jsxs)(`button`,{type:`button`,onClick:()=>l(!0),className:`inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded`,children:[(0,I.jsx)(Me,{className:`w-3 h-3`}),(0,I.jsx)(`span`,{children:e(`web.app.setup`)})]})]}),(0,I.jsx)(Vt,{result:n,smoothBars:w,protect:ee,busyText:f?`${v} (${t(m)})`:null,error:y,onChangeSmoothing:(e,t)=>{ne.current&&!f&&F(ne.current.file,ne.current.name,{smooth:e,protect:t,reanalysis:!0,model:n.selectedModel??i})}}),(0,I.jsx)(`div`,{className:`p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4`,children:(0,I.jsx)(on,{result:n,audioBuffer:x,loopRange:me,onViewChange:Oe,followPlayhead:fe!==`view`,currentTime:ie,onSeek:Ee,activeBeat:oe})}),(0,I.jsx)(sn,{isPlaying:re,currentTime:ie,duration:n.metadata.duration,activeBeat:oe,playbackSpeed:se,metronomeEnabled:le,metronomeVolume:ue,globalBpm:n.globalBpm,onPlay:Ce,onPause:we,onSeek:Ee,onSetPlaybackSpeed:Ae,onToggleMetronome:je,onSetMetronomeVolume:Ne,musicVolume:de,onSetMusicVolume:ke,loopMode:fe,onCycleLoop:De}),(0,I.jsx)(cn,{result:n,currentTime:ie,onSeek:Ee}),(0,I.jsx)(ln,{result:n,currentTime:ie,onSeek:Ee,onUpdateBeats:Pe})]}):(0,I.jsx)(Lt,{onFileSelected:F,isAnalyzing:f,progress:m,stageText:v,error:y,selectedModel:i,onSelectModel:e=>{e===`md_beat_this`&&!o?l(!0):a(e)},onOpenMdSetup:()=>l(!0),backendHealth:u})}),(0,I.jsx)(`footer`,{className:`border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500`,children:(0,I.jsxs)(`p`,{children:[`BeatAnalyzer • `,e(`web.app.footer_inspired`),` `,(0,I.jsx)(`a`,{href:`https://github.com/CPJKU/beat_this`,target:`_blank`,rel:`noopener noreferrer`,className:`text-cyan-400 hover:underline font-medium`,children:`CPJKU/beat_this`}),` `,`(Johannes Kepler Universität Linz) • `,e(`web.app.footer_formats`)]})}),M&&n&&(0,I.jsx)(xn,{result:n,onClose:()=>N(!1)}),ye&&(0,I.jsx)(Sn,{onClose:()=>be(!1)}),xe&&(0,I.jsx)(wn,{backendHealth:u,onHealthUpdated:d,onClose:()=>Se(!1)}),c&&(0,I.jsx)(On,{backendHealth:u,onHealthUpdated:d,isInstalled:!!u?.md_beat_this_installed,alreadyConfirmed:o,onConfirm:()=>{s(!0),a(`md_beat_this`),l(!1)},onCancel:()=>{l(!1)}})]})}(0,qe.createRoot)(document.getElementById(`root`)).render((0,I.jsx)(bt,{children:(0,I.jsx)(kn,{})}));