import{__spreadArray}from"tslib";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */var printIonWarning=function(r){return console.warn("[Ionic Warning]: ".concat(r))};var printIonError=function(r){var n=[];for(var o=1;o<arguments.length;o++){n[o-1]=arguments[o]}return console.error.apply(console,__spreadArray(["[Ionic Error]: ".concat(r)],n,false))};var printRequiredElementError=function(r){var n=[];for(var o=1;o<arguments.length;o++){n[o-1]=arguments[o]}return console.error("<".concat(r.tagName.toLowerCase(),"> must be used inside ").concat(n.join(" or "),"."))};export{printRequiredElementError as a,printIonError as b,printIonWarning as p};