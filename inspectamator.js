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
            log(ev);
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
    var promises = [];

    function getPromise(promiseId) {
        for (var i in promises) {
            if (promises[i].promiseId === promiseId) {
                return promises[i];
            }
        }
    }

    Inspector.on('Debugger.globalObjectCleared', function () {
        sources = {};
        promises = [];
        $('#output').empty();
    });

    Inspector.on('Debugger.paused', function (ev) {
        var loc = ev.callFrames[0].location;
        var callFrames = ev.callFrames;

        var f = function (src) {
            var lines = src.split('\n');

            if (callFrames[0].functionName == 'Function.promise') {
                // new promise

                var realLoc = callFrames[2].location;
                var realSrc = lines[realLoc.lineNumber].slice(realLoc.columnNumber)
                var length = 0;

                var regexp = /^later(?:\s*\(\s*\)\s*;?)?/;
                var match = regexp.exec(realSrc);
                if (match) {
                    var length = match[0].length;
                } else {
                    log('warning: did not match', realSrc)
                }

                Inspector.Debugger.evaluateOnCallFrame(callFrames[0].callFrameId, 'this.promiseId', 'promises', false, true, function (ev) {
                    var promise = { loc: realLoc, length: length, promiseId: ev.result.value };
                    promises.push(promise);
                    // log('got a promise', promise);
                    log('got a later');

                    Inspector.Debugger.resume();
                });
            } else {
                Inspector.Debugger.evaluateOnCallFrame(callFrames[0].callFrameId, 'this.promiseId', 'promises', false, true, function (ev) {
                    var promise = getPromise(ev.result.value);
                    if (promise) {
                        // log('promise!', promise);
                        Inspector.Debugger.evaluateOnCallFrame(callFrames[0].callFrameId, 'this.arguments.length', 'promises', false, true, function (ev) {
                            var makeArgsStr = function (count) {
                                return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].slice(0, count).join(', ');
                            };
                            var prefix = 'function (' + makeArgsStr(ev.result.value) + ') {\n  ';
                            var suffix = '\n}';
                            showEditor(src, promise.loc, promise.length, prefix, suffix, callFrames);
                        });
                    } else {
                        log('not promise', ev.result);
                    }
                });
            }

            return;

            var stopSrc = lines[loc.lineNumber].slice(loc.columnNumber);
            log('stopped at', stopSrc);
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

    function showEditor(src, loc, placeholderLength, prefix, suffix, callFrames) {
        var lines = src.split('\n');
        var maxLineLength = Math.max.apply(Math, $.map(lines, function (line) { return line.length }));

        var offset = 0;
        for (var i = 0; i < loc.lineNumber; i++) {
            offset += lines[i].length + 1;
        }
        offset += loc.columnNumber;

        var container = $('<div class="item"></div>').appendTo($('#output'));

        var srcBefore = lines.slice(0, loc.lineNumber).join('\n');
        var srcLineBefore = lines[loc.lineNumber].substr(0, loc.columnNumber).trim();
        var srcLineAfter = lines[loc.lineNumber].substr(loc.columnNumber + placeholderLength).trim();
        var srcAfter = lines.slice(loc.lineNumber + 1).join('\n');

        if (srcLineBefore) { srcBefore += '\n' + srcLineBefore }
        if (srcLineAfter) { srcAfter = srcLineAfter + '\n' + srcAfter }

        var prefixLines = prefix.split('\n');

        $('<pre></pre>').appendTo(container).text(srcBefore);
        container.append('<hr />');
        var editor = CodeMirror(container.get(0), {
            mode: 'javascript',
            autofocus: true,
            value: prefix + suffix
        });
        editor.setCursor({ line: prefixLines.length - 1, ch: prefixLines[prefixLines.length - 1].length });
        var button = $('<button>Save</button>').appendTo(container).click(function () {
            var newSrc = srcBefore + '\n' + editor.getValue() + '\n' + srcAfter;

            Inspector.Debugger.evaluateOnCallFrame(callFrames[0].callFrameId, 'this.impl = ' + editor.getValue(), 'promises', false, true, function (ev) {
                sources[loc.scriptId] = newSrc;
                Inspector.Debugger.setScriptSource(loc.scriptId, newSrc);

                Inspector.Debugger.resume();
                container.text('Saved!');
            });
        });
        var button = $('<button>Cancel</button>').appendTo(container).click(function () {
            Inspector.Debugger.resume();
            container.text('Canceled!');
        });
        container.append('<hr />')
        container.append('Console:')
        var konsole = $('<input />').appendTo(container).keypress(function (e) {
            if (e.keyCode == 13) {
                Inspector.Debugger.evaluateOnCallFrame(callFrames[0].callFrameId, 'htmlTableFor(' + $(this).val() + ')', 'promises', false, true, function (ev) {
                    log('console result', ev.result);
                });
                e.preventDefault();
                return;
            }
        });
        container.append('<hr />');
        $('<pre></pre>').appendTo(container).text(srcAfter);
    }

});
