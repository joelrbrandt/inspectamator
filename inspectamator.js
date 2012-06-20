/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $ */

String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

define(function (require, exports, module) {
    'use strict';
    var Inspector = require("Inspector");
    Inspector.init();

    require('jslint'); // jslint isn't a proper module, so return value is undefined
    
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

    function log(obj) {
        if (arguments.length > 1) {
            obj = Array.prototype.slice.call(arguments);
        }
        $('#output').append(tableFor(obj));
        $('body').stop();
        $('body').animate({ scrollTop: $('body').height() });
    }
    
    Inspector.connect("ws://127.0.0.1:9222/devtools/page/" + window.location.search.substr(1));
    Inspector.on('message', function () {
        var args = [].splice.call(arguments,0);
        log(args[0]);
    })

    $('#go').click(function() {
        eval('Inspector.' + $("#command").val());
    })

    $('#clear').click(function() {
        $('#output').empty();
    })

    exports.tableFor = tableFor;
    exports.log = log;

    Inspector.on('connect', function () {
        Inspector.Debugger.enable();
        Inspector.on('Debugger.scriptParsed', function (ev) {
            var scriptId = ev.scriptId;
            Inspector.Debugger.getScriptSource(ev.scriptId, function (ev) {
                var src = ev.scriptSource;
                var lines = src.split('\n');

                log({ scriptId: scriptId, source: $.map(lines, function (line, i) { return ('' + i).lpad(' ', 3) + ': ' + line }).join("\n") });

                if (/^\n\/\/internal/.test(src)) {
                    return;
                }

                // var loc = { scriptId: scriptId, lineNumber: 11, columnNumber: 0 };
                // log('setting breakpoint at', loc, lines[loc.lineNumber].slice(loc.columnNumber));
                // Inspector.Debugger.setBreakpoint(loc);
                // // JSLINT(src);
                // // console.log(JSLINT.tree)
            });
        });
    });

    var sources = {};

    Inspector.on('Debugger.paused', function (ev) {
        var topFrame = ev.callFrames[0];
        var loc = topFrame.location;
        if (ev.reason != 'other') return;

        var f = function (src) {
            var lines = src.split('\n');
            var stopSrc = lines[loc.lineNumber].slice(loc.columnNumber);
            log('stopped at', stopSrc);
            if (stopSrc.indexOf('debugger;') == 0) {
                showEditor(src, loc, 'debugger;'.length);
            }
        }

        if (sources[loc.scriptId]) {
            f(sources[loc.scriptId]);
        } else {
            Inspector.Debugger.getScriptSource(loc.scriptId, function (ev) {
                sources[loc.scriptId] = ev.scriptSource;
                f(ev.scriptSource);
            });
        }
    });

    function showEditor(src, loc, placeholderLength) {
        var lines = src.split('\n');
        var maxLineLength = Math.max.apply(Math, $.map(lines, function (line) { return line.length }));

        var offset = 0;
        for (var i = 0; i < loc.lineNumber; i++) {
            offset += lines[i].length + 1;
        }
        offset += loc.columnNumber;

        var container = $('<div class="item"></div>').appendTo($('#output'));

        var srcBefore = lines.slice(0, loc.lineNumber).join('\n');
        var srcAfter = lines.slice(loc.lineNumber + 1).join('\n');

        $('<pre></pre>').appendTo(container).text(srcBefore);
        container.append('<hr />');
        var editor = CodeMirror(container.get(0), {
            mode: 'javascript',
            autofocus: true
        });
        var button = $('<button>Save</button>').appendTo(container).click(function () {
            var newSrc = srcBefore + '\n' + editor.getValue() + '\n' + srcAfter;

            sources[loc.scriptId] = newSrc;
            Inspector.Debugger.setScriptSource(loc.scriptId, newSrc);

            Inspector.Debugger.resume();
            container.text('Saved!');
            // container.empty().append($('<pre></pre>').text(newSrc));
        });
        // editor.setSelection({ line: loc.lineNumber, ch: loc.columnNumber },
        //                     { line: loc.lineNumber, ch: loc.columnNumber + placeholderLength });
        container.append('<hr />');
        $('<pre></pre>').appendTo(container).text(srcAfter);
    }

});
