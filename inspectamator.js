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

define(function (require, exports, module) {
    'use strict';
    var Inspector = require("Inspector");
    Inspector.init();

    function tableFor(obj, seen) {
        if (typeof(obj) === 'number' || typeof(obj) === 'string' || obj === undefined || obj === null) {
            return document.createTextNode(obj);
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
        $('#output').prepend(tableFor(obj));
    }
    
    Inspector.connect("ws://127.0.0.1:9222/devtools/page/" + window.location.search.substr(1));
    Inspector.on('message', function() { 
        var args = [].splice.call(arguments,0);
        console.log("got message", args);
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

});
