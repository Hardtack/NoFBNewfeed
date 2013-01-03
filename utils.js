String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
};
String.prototype.join = function(array){
    var len = this.array.length
    var str = ''
    for (var i=0; i < len; i++){
        str += array[i];
        if (i + 1 < len){
            str += this;
        }
    }
    return str;
};
function filename(path){
    return path.substring(path.lastIndexOf('/') + 1);
}

function getOSInfoStr(){
    var ua = navigator.userAgent;
 
    if(ua.indexOf("NT 6.0") != -1) return "Windows Vista/Server 2008";
    else if(ua.indexOf("NT 5.2") != -1) return "Windows Server 2003";
    else if(ua.indexOf("NT 5.1") != -1) return "Windows XP";
    else if(ua.indexOf("NT 5.0") != -1) return "Windows 2000";
    else if(ua.indexOf("NT") != -1) return "Windows NT";
    else if(ua.indexOf("9x 4.90") != -1) return "Windows Me";
    else if(ua.indexOf("98") != -1) return "Windows 98";
    else if(ua.indexOf("95") != -1) return "Windows 95";
    else if(ua.indexOf("Win16") != -1) return "Windows 3.x";
    else if(ua.indexOf("Windows") != -1) return "Windows";
    else if(ua.indexOf("Linux") != -1) return "Linux";
    else if(ua.indexOf("Macintosh") != -1) return "Macintosh";
    else return "";
}

function pathDelimiter(){
    if (getOSInfoStr().indexOf('Windows') != -1){
        return '\\';
    }
    return '/';
}

function pathJoin(a, b, delimiter){
    if (delimiter == undefined){
        return pathJoin(a, b, pathDelimiter());
    }
    if (a.endsWith(delimiter)){
        a = a.substring(0, a.length - 1);
    }
    if (b.startsWith(delimiter)){
        b = b.substring(1);
    }
    return a + delimiter + b;
}

/*
 * Copyright 2010 Nicholas C. Zakas. All rights reserved.
 * BSD Licensed.
 */
function CrossDomainStorage(origin, path){
    this.origin = origin;
    this.path = path;
    this._iframe = null;
    this._iframeReady = false;
    this._queue = [];
    this._requests = {};
    this._id = 0;
}

CrossDomainStorage.prototype = {

    //restore constructor
    constructor: CrossDomainStorage,

    //public interface methods

    init: function(){

        var that = this;

        if (!this._iframe){
            if (window.postMessage && window.JSON && window.localStorage){
                this._iframe = document.createElement("iframe");
                this._iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
                document.body.appendChild(this._iframe);

                if (window.addEventListener){
                    this._iframe.addEventListener("load", function(){ that._iframeLoaded(); }, false);
                    window.addEventListener("message", function(event){ that._handleMessage(event); }, false);
                } else if (this._iframe.attachEvent){
                    this._iframe.attachEvent("onload", function(){ that._iframeLoaded(); }, false);
                    window.attachEvent("onmessage", function(event){ that._handleMessage(event); });
                }
            } else {
                throw new Error("Unsupported browser.");
            }
        }

        this._iframe.src = pathJoin(this.origin, this.path, '/');

    },

    requestValue: function(key, callback){
        var request = {
                key: key,
                id: ++this._id
            },
        data = {
            request: request,
            callback: callback
        };

        if (this._iframeReady){
            this._sendRequest(data);
        } else {
            this._queue.push(data);
        }   

        if (!this._iframe){
            this.init();
        }
    },

    //private methods

    _sendRequest: function(data){
        this._requests[data.request.id] = data;
        this._iframe.contentWindow.postMessage(JSON.stringify(data.request), this.origin);
    },

    _iframeLoaded: function(){
        this._iframeReady = true;

        if (this._queue.length){
            for (var i=0, len=this._queue.length; i < len; i++){
                this._sendRequest(this._queue[i]);
            }
            this._queue = [];
        }
    },

    _handleMessage: function(event){
        if (event.origin == this.origin){
            var data = JSON.parse(event.data);
            this._requests[data.id].callback(data.key, data.value);
            delete this._requests[data.id];
        }
    }

};

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
