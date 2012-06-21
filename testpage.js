var promiseId = 0;

Function.prototype.promise = function () {
  this.promiseId = promiseId++;
  debugger;
  return this.bind(this);
}

function todo() {
  return function () {
    if (this.impl) {
      this.impl.apply(this, arguments);
    } else {
      debugger;
      if (this.impl) {
        this.impl.apply(this, arguments);
      }
    }
  }.promise();
}



button.addEventListener('click', todo());

button2.addEventListener('click', function () {
  $.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?', { tags: "cat", tagmode: "any", format: "json" }, todo()).error(todo());
});

/*
$.each(data.items, function (i, item) {
  $("<img/>").attr("src", item.media.m).appendTo("#images");
  if ( i == 3 ) return false;
});
*/



function tableFor(obj, seen) {
    if (typeof(obj) === 'number' || typeof(obj) === 'string' || obj === undefined || obj === null) {
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
    var headers = document.createElement('tr'); table.appendChild(headers);
    var values = document.createElement('tr'); table.appendChild(values);

    for (var field in obj) {
        var headerCell = document.createElement('th'); headers.appendChild(headerCell);
        var valueCell = document.createElement('td'); values.appendChild(valueCell);

        headerCell.appendChild( document.createTextNode(field) );
        valueCell.appendChild( tableFor(obj[field]), seen );
    }

    return table;
}

function htmlTableFor(obj) {
    var target = tableFor(obj);
    var wrap = document.createElement('div');
    wrap.appendChild(target);
    return wrap.innerHTML;
}
