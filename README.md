inspectamator
=============

Usage
-----

1.  Launch Chrome with debugging enabled:

        C:\> chrome.exe --remote-debugging-port=9222
        mac$ open -a Google\ Chrome\ Canary --args --remote-debugging-port=9222

2.  Open the page you want to debug in that instances.

3.  Visit http://localhost:9222/json and find the page ID at the end of the
    `webSocketDebuggerUrl` of the page you want to debug (or visit
    http://localhost:9222/, click the screenshot of the page, and find the
    page ID in that URL).

4.  Visit `inspectamator.html?XXX` where XXX is the page ID from the previous step.
