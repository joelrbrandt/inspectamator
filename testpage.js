/*jslint vars: true, debug: true */
/*global document, $ */

var nextLaterId = 0;

Function.prototype.later = function () {
    'use strict';
    nextLaterId += 1;
    this.laterId = nextLaterId;
    debugger;
    return this.bind(this);
};

function later() {
    'use strict';
    return function () {
        if (this.impl) {
            this.impl.apply(this, arguments);
        } else {
            debugger;
            if (this.impl) {
                this.impl.apply(this, arguments);
            }
        }
    }.later();
}








function dumb() { return function () { alert('poop') } };

function registerEventHandlers() {
    'use strict';
    
    var answer = 42;
    
    document.getElementById('button').addEventListener('click', function () {
        'use strict';
        alert('hi');
    });
    
    document.getElementById('button2').addEventListener('click', function () {
        $.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?',
                  { tags: "cat", tagmode: "any", format: "json" }, later())
            .error(later());
    });
}

registerEventHandlers();























/*
$.each(data.items, function (i, item) {
  $("<img/>").attr("src", item.media.m).appendTo("#images");
  if ( i == 3 ) return false;
});
*/









function tableFor(obj, seen) {
    'use strict';
    if (typeof obj === 'number' || typeof obj === 'string' || obj === undefined || obj === null) {
        var div = document.createElement('div');
        div.className = 'value';
        div.appendChild(document.createTextNode(obj));
        return div;
    }

    if (seen && seen.indexOf(obj) !== -1) {
        return document.createTextNode('...');
    }

    seen = (seen || []);
    seen.push(obj);

    var table = document.createElement('table');
    var headers = document.createElement('tr');
    var values = document.createElement('tr');
    
    table.appendChild(headers);
    table.appendChild(values);

    var field;
    /*jslint forin: true */
    for (field in obj) {
        var headerCell = document.createElement('th');
        var valueCell = document.createElement('td');
        
        headers.appendChild(headerCell);
        values.appendChild(valueCell);

        headerCell.appendChild(document.createTextNode(field));
        valueCell.appendChild(tableFor(obj[field]), seen);
    }

    return table;
}

function htmlTableFor(obj) {
    'use strict';
    var target = tableFor(obj);
    var wrap = document.createElement('div');
    wrap.appendChild(target);
    return wrap.innerHTML;
}
