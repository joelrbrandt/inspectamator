define(function (require, exports, module) {
    'use strict';
    exports.api = {
    "version": { "major": "1", "minor": "0" },
    "domains": [{
        "domain": "Inspector",
        "hidden": true,
        "types": [],
        "commands": [
            {
                "name": "enable",
                "description": "Enables inspector domain notifications."
            },
            {
                "name": "disable",
                "description": "Disables inspector domain notifications."
            }
        ],
        "events": [
            {
                "name": "evaluateForTestInFrontend",
                "parameters": [
                    { "name": "testCallId", "type": "integer" },
                    { "name": "script", "type": "string" }
                ]
            },
            {
                "name": "inspect",
                "parameters": [
                    { "name": "object", "$ref": "Runtime.RemoteObject" },
                    { "name": "hints", "type": "object" }
                ]
            },
            {
                "name": "didCreateWorker",
                "parameters": [
                    { "name": "id", "type": "integer" },
                    { "name": "url", "type": "string" },
                    { "name": "isShared", "type": "boolean" }
                ]
            },
            {
                "name": "didDestroyWorker",
                "parameters": [
                    { "name": "id", "type": "integer" }
                ]
            }
        ]
    },
    {
        "domain": "Memory",
        "hidden": true,
        "types": [
            {
                "id": "NodeCount",
                "type": "object",
                "properties": [
                    { "name": "nodeName", "type": "string" },
                    { "name": "count", "type": "integer" }
                ],
                "description": "Number of nodes with given name."
            },
            {
                "id": "ListenerCount",
                "type": "object",
                "properties": [
                    { "name": "type", "type": "string" },
                    { "name": "count", "type": "integer" }
                ],
                "description": "Number of JS event listeners by event type."
            },
            {
                "id": "StringStatistics",
                "type": "object",
                "properties": [
                    { "name": "dom", "type": "integer" },
                    { "name": "js", "type": "integer" },
                    { "name": "shared", "type": "integer" }
                ],
                "description": "Character data statistics for the page."
            },
            {
                "id": "DOMGroup",
                "type": "object",
                "properties": [
                    { "name": "size", "type": "integer" },
                    { "name": "title", "type": "string" },
                    { "name": "documentURI", "type": "string", "optional": true },
                    { "name": "nodeCount", "type": "array", "items": { "$ref": "NodeCount" }},
                    { "name": "listenerCount", "type": "array", "items": { "$ref": "ListenerCount" }}
                ]
            },
            {
                "id": "MemoryBlock",
                "type": "object",
                "properties": [
                    { "name": "size", "type": "integer", "optional": true, "description": "Size of the block in bytes if available" },
                    { "name": "name", "type": "string", "description": "Unique name used to identify the component that allocated this block" },
                    { "name": "children", "type": "array", "optional": true, "items": { "$ref": "MemoryBlock" }}
                ]
            }
        ],
        "commands": [
            {
                "name": "getDOMNodeCount",
                "returns": [
                    { "name": "domGroups", "type": "array", "items": { "$ref": "DOMGroup" }},
                    { "name": "strings", "$ref": "StringStatistics" }
                ]
            },
            {
                "name": "getProcessMemoryDistribution",
                "returns": [
                    { "name": "distribution", "$ref": "MemoryBlock", "description": "An object describing all memory allocated by the process"}
                ]
            }
        ]
    },
    {
        "domain": "Page",
        "description": "Actions and events related to the inspected page belong to the page domain.",
        "types": [
            {
                "id": "ResourceType",
                "type": "string",
                "enum": ["Document", "Stylesheet", "Image", "Font", "Script", "XHR", "WebSocket", "Other"],
                "description": "Resource type as it was perceived by the rendering engine."
            },
            {
                "id": "Frame",
                "type": "object",
                "description": "Information about the Frame on the page.",
                "properties": [
                    { "name": "id", "type": "string", "description": "Frame unique identifier." },
                    { "name": "parentId", "type": "string", "optional": true, "description": "Parent frame identifier." },
                    { "name": "loaderId", "$ref": "Network.LoaderId", "description": "Identifier of the loader associated with this frame." },
                    { "name": "name", "type": "string", "optional": true, "description": "Frame's name as specified in the tag." },
                    { "name": "url", "type": "string", "description": "Frame document's URL." },
                    { "name": "securityOrigin", "type": "string", "optional": true, "description": "Frame document's security origin." },
                    { "name": "mimeType", "type": "string", "description": "Frame document's mimeType as determined by the browser." }
                ],
                "hidden": true
            },
            {
                "id": "FrameResourceTree",
                "type": "object",
                "description": "Information about the Frame hierarchy along with their cached resources.",
                "properties": [
                    { "name": "frame", "$ref": "Frame", "description": "Frame information for this tree item." },
                    { "name": "childFrames", "type": "array", "optional": true, "items": { "$ref": "FrameResourceTree" }, "description": "Child frames." },
                    { "name": "resources", "type": "array",
                        "items": {
                            "type": "object",
                            "properties": [
                                { "name": "url", "type": "string", "description": "Resource URL." },
                                { "name": "type", "$ref": "ResourceType", "description": "Type of this resource." },
                                { "name": "mimeType", "type": "string", "description": "Resource mimeType as determined by the browser." },
                                { "name": "failed", "type": "boolean", "optional": true, "description": "True if the resource failed to load." },
                                { "name": "canceled", "type": "boolean", "optional": true, "description": "True if the resource was canceled during loading." }
                            ]
                        },
                        "description": "Information about frame resources."
                    }
                ],
                "hidden": true
            },
            {
                "id": "SearchMatch",
                "type": "object",
                "description": "Search match for resource.",
                "properties": [
                    { "name": "lineNumber", "type": "number", "description": "Line number in resource content." },
                    { "name": "lineContent", "type": "string", "description": "Line with match content." }
                ],
                "hidden": true
            },
            {
                "id": "SearchResult",
                "type": "object",
                "description": "Search result for resource.",
                "properties": [
                    { "name": "url", "type": "string", "description": "Resource URL." },
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Resource frame id." },
                    { "name": "matchesCount", "type": "number", "description": "Number of matches in the resource content." }
                ],
                "hidden": true
            },
            {
                "id": "Cookie",
                "type": "object",
                "description": "Cookie object",
                "properties": [
                    { "name": "name", "type": "string", "description": "Cookie name." },
                    { "name": "value", "type": "string", "description": "Cookie value." },
                    { "name": "domain", "type": "string", "description": "Cookie domain." },
                    { "name": "path", "type": "string", "description": "Cookie path." },
                    { "name": "expires", "type": "number", "description": "Cookie expires." },
                    { "name": "size", "type": "integer", "description": "Cookie size." },
                    { "name": "httpOnly", "type": "boolean", "description": "True if cookie is http-only." },
                    { "name": "secure", "type": "boolean", "description": "True if cookie is secure." },
                    { "name": "session", "type": "boolean", "description": "True in case of session cookie." }
                ],
                "hidden": true
            },
            {
                "id": "ScriptIdentifier",
                "type": "string",
                "description": "Unique script identifier.",
                "hidden": true
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables page domain notifications."
            },
            {
                "name": "disable",
                "description": "Disables page domain notifications."
            },
            {
                "name": "addScriptToEvaluateOnLoad",
                "parameters": [
                    { "name": "scriptSource", "type": "string" }
                ],
                "returns": [
                    { "name": "identifier", "$ref": "ScriptIdentifier", "description": "Identifier of the added script." }
                ],
                "hidden": true
            },
            {
                "name": "removeScriptToEvaluateOnLoad",
                "parameters": [
                    { "name": "identifier", "$ref": "ScriptIdentifier" }
                ],
                "hidden": true
            },
            {
                "name": "reload",
                "parameters": [
                    { "name": "ignoreCache", "type": "boolean", "optional": true, "description": "If true, browser cache is ignored (as if the user pressed Shift+refresh)." },
                    { "name": "scriptToEvaluateOnLoad", "type": "string", "optional": true, "description": "If set, the script will be injected into all frames of the inspected page after reload." }
                ],
                "description": "Reloads given page optionally ignoring the cache."
            },
            {
                "name": "navigate",
                "parameters": [
                    { "name": "url", "type": "string", "description": "URL to navigate the page to." }
                ],
                "description": "Navigates current page to the given URL."
            },
            {
                "name": "getCookies",
                "returns": [
                    { "name": "cookies", "type": "array", "items": { "$ref": "Cookie"}, "description": "Array of cookie objects." },
                    { "name": "cookiesString", "type": "string", "description": "document.cookie string representation of the cookies." }
                ],
                "description": "Returns all browser cookies. Depending on the backend support, will either return detailed cookie information in the <code>cookie</code> field or string cookie representation using <code>cookieString</code>.",
                "hidden": true
            },
            {
                "name": "deleteCookie",
                "parameters": [
                    { "name": "cookieName", "type": "string", "description": "Name of the cookie to remove." },
                    { "name": "domain", "type": "string", "description": "Domain of the cookie to remove." }
                ],
                "description": "Deletes browser cookie with given name for the given domain.",
                "hidden": true
            },
            {
                "name": "getResourceTree",
                "description": "Returns present frame / resource tree structure.",
                "returns": [
                    { "name": "frameTree", "$ref": "FrameResourceTree", "description": "Present frame / resource tree structure." }
                ],
                "hidden": true
            },
            {
                "name": "getResourceContent",
                "description": "Returns content of the given resource.",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Frame id to get resource for." },
                    { "name": "url", "type": "string", "description": "URL of the resource to get content for." }
                ],
                "returns": [
                    { "name": "content", "type": "string", "description": "Resource content." },
                    { "name": "base64Encoded", "type": "boolean", "description": "True, if content was served as base64." }
                ],
                "hidden": true
            },
            {
                "name": "searchInResource",
                "description": "Searches for given string in resource content.",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Frame id for resource to search in." },
                    { "name": "url", "type": "string", "description": "URL of the resource to search in." },
                    { "name": "query", "type": "string", "description": "String to search for."  },
                    { "name": "caseSensitive", "type": "boolean", "optional": true, "description": "If true, search is case sensitive." },
                    { "name": "isRegex", "type": "boolean", "optional": true, "description": "If true, treats string parameter as regex." }
                ],
                "returns": [
                    { "name": "result", "type": "array", "items": { "$ref": "SearchMatch" }, "description": "List of search matches." }
                ],
                "hidden": true
            },
            {
                "name": "searchInResources",
                "description": "Searches for given string in frame / resource tree structure.",
                "parameters": [
                    { "name": "text", "type": "string", "description": "String to search for."  },
                    { "name": "caseSensitive", "type": "boolean", "optional": true, "description": "If true, search is case sensitive." },
                    { "name": "isRegex", "type": "boolean", "optional": true, "description": "If true, treats string parameter as regex." }
                ],
                "returns": [
                    { "name": "result", "type": "array", "items": { "$ref": "SearchResult" }, "description": "List of search results." }
                ],
                "hidden": true
            },
            {
                "name": "setDocumentContent",
                "description": "Sets given markup as the document's HTML.",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Frame id to set HTML for." },
                    { "name": "html", "type": "string", "description": "HTML content to set."  }
                ],
                "hidden": true
            },
            {
                "name": "canOverrideDeviceMetrics",
                "description": "Checks whether <code>setDeviceMetricsOverride</code> can be invoked.",
                "returns": [
                    { "name": "result", "type": "boolean", "description": "If true, <code>setDeviceMetricsOverride</code> can safely be invoked on the agent." }
                ],
                "hidden": true
            },
            {
                "name": "setDeviceMetricsOverride",
                "description": "Overrides the values of device screen dimensions (window.screen.width, window.screen.height, window.innerWidth, window.innerHeight, and \"device-width\"/\"device-height\"-related CSS media query results) and the font scale factor.",
                "parameters": [
                    { "name": "width", "type": "integer", "description": "Overriding width value in pixels (minimum 0, maximum 10000000). 0 disables the override." },
                    { "name": "height", "type": "integer", "description": "Overriding height value in pixels (minimum 0, maximum 10000000). 0 disables the override." },
                    { "name": "fontScaleFactor", "type": "number", "description": "Overriding font scale factor value (must be positive). 1 disables the override." },
                    { "name": "fitWindow", "type": "boolean", "description": "Whether a view that exceeds the available browser window area should be scaled down to fit." }
                ],
                "hidden": true
            },
            {
                "name": "setShowPaintRects",
                "description": "Requests that backend shows paint rectangles",
                "parameters": [
                    { "name": "result", "type": "boolean", "description": "True for showing paint rectangles" }
                ],
                "hidden": true
            },
            {
                "name": "getScriptExecutionStatus",
                "description": "Determines if scripts can be executed in the page.",
                "returns": [
                    { "name": "result", "type": "string", "enum": ["allowed", "disabled", "forbidden"], "description": "Script execution status: \"allowed\" if scripts can be executed, \"disabled\" if script execution has been disabled through page settings, \"forbidden\" if script execution for the given page is not possible for other reasons." }
                ]
            },
            {
                "name": "setScriptExecutionDisabled",
                "description": "Switches script execution in the page.",
                "parameters": [
                    { "name": "value", "type": "boolean", "description": "Whether script execution should be disabled in the page." }
                ]
            }
        ],
        "events": [
            {
                "name": "domContentEventFired",
                "parameters": [
                    { "name": "timestamp", "type": "number" }
                ]
            },
            {
                "name": "loadEventFired",
                "parameters": [
                    { "name": "timestamp", "type": "number" }
                ]
            },
            {
                "name": "frameNavigated",
                "description": "Fired once navigation of the frame has completed. Frame is now associated with the new loader.",
                "parameters": [
                    { "name": "frame", "$ref": "Frame", "description": "Frame object." }
                ],
                "hidden": true
            },
            {
                "name": "frameDetached",
                "description": "Fired when frame has been detached from its parent.",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Id of the frame that has been detached." }
                ],
                "hidden": true
            }
        ]
    },
    {
        "domain": "Runtime",
        "description": "Runtime domain exposes JavaScript runtime by means of remote evaluation and mirror objects. Evaluation results are returned as mirror object that expose object type, string representation and unique identifier that can be used for further object reference. Original objects are maintained in memory unless they are either explicitly released or are released along with the other objects in their object group.",
        "types": [
            {
                "id": "RemoteObjectId",
                "type": "string",
                "description": "Unique object identifier."
            },
            {
                "id": "RemoteObject",
                "type": "object",
                "description": "Mirror object referencing original JavaScript object.",
                "properties": [
                    { "name": "type", "type": "string", "enum": ["object", "function", "undefined", "string", "number", "boolean"], "description": "Object type." },
                    { "name": "subtype", "type": "string", "optional": true, "enum": ["array", "null", "node", "regexp", "date"], "description": "Object subtype hint. Specified for <code>object</code> type values only." },
                    { "name": "className", "type": "string", "optional": true, "description": "Object class (constructor) name. Specified for <code>object</code> type values only." },
                    { "name": "value", "type": "any", "optional": true, "description": "Remote object value (in case of primitive values or JSON values if it was requested)." },
                    { "name": "description", "type": "string", "optional": true, "description": "String representation of the object." },
                    { "name": "objectId", "$ref": "RemoteObjectId", "optional": true, "description": "Unique object identifier (for non-primitive values)." }
                ]
            },
            {
                "id": "PropertyDescriptor",
                "type": "object",
                "description": "Object property descriptor.",
                "properties": [
                    { "name": "name", "type": "string", "description": "Property name." },
                    { "name": "value", "$ref": "RemoteObject", "optional": true, "description": "The value associated with the property." },
                    { "name": "writable", "type": "boolean", "optional": true, "description": "True if the value associated with the property may be changed (data descriptors only)." },
                    { "name": "get", "$ref": "RemoteObject", "optional": true, "description": "A function which serves as a getter for the property, or <code>undefined</code> if there is no getter (accessor descriptors only)." },
                    { "name": "set", "$ref": "RemoteObject", "optional": true, "description": "A function which serves as a setter for the property, or <code>undefined</code> if there is no setter (accessor descriptors only)." },
                    { "name": "configurable", "type": "boolean", "description": "True if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object." },
                    { "name": "enumerable", "type": "boolean", "description": "True if this property shows up during enumeration of the properties on the corresponding object." },
                    { "name": "wasThrown", "type": "boolean", "optional": true, "description": "True if the result was thrown during the evaluation." }
                ]
            },
            {
                "id": "CallArgument",
                "type": "object",
                "description": "Represents function call argument. Either remote object id <code>objectId</code> or primitive <code>value</code> or neither of (for undefined) them should be specified.",
                "properties": [
                    { "name": "value", "type": "any", "optional": true, "description": "Primitive value." },
                    { "name": "objectId", "$ref": "RemoteObjectId", "optional": true, "description": "Remote object handle." }
                ]
            },
            {
                "id": "ExecutionContextId",
                "type": "integer",
                "description": "Id of an execution context.",
                "hidden": true
            },
            {
                "id": "ExecutionContextDescription",
                "type": "object",
                "description": "Description of an isolated world.",
                "properties": [
                    { "name": "id", "$ref": "ExecutionContextId", "description": "Unique id of the execution context. It can be used to specify in which execution context script evaluation should be performed." },
                    { "name": "isPageContext", "type": "boolean", "description": "True if this is a context where inpspected web page scripts run. False if it is a content script isolated context." },
                    { "name": "name", "type": "string", "description": "Human readable name describing given context." },
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Id of the owning frame." }
                ],
                "hidden": true
            }

        ],
        "commands": [
            {
                "name": "evaluate",
                "parameters": [
                    { "name": "expression", "type": "string", "description": "Expression to evaluate." },
                    { "name": "objectGroup", "type": "string", "optional": true, "description": "Symbolic group name that can be used to release multiple objects." },
                    { "name": "includeCommandLineAPI", "type": "boolean", "optional": true, "description": "Determines whether Command Line API should be available during the evaluation.", "hidden": true },
                    { "name": "doNotPauseOnExceptionsAndMuteConsole", "type": "boolean", "optional": true, "description": "Specifies whether evaluation should stop on exceptions and mute console. Overrides setPauseOnException state.", "hidden": true },
                    { "name": "contextId", "type": "integer", "optional": true, "description": "Specifies in which isolated context to perform evaluation. Each content script lives in an isolated context and this parameter may be used to specify on of those contexts. If the parameter is omitted or 0 the evaluation will be performed in the context of the inspected page.", "hidden": true },
                    { "name": "returnByValue", "type": "boolean", "optional": true, "description": "Whether the result is expected to be a JSON object that should be sent by value." }
                ],
                "returns": [
                    { "name": "result", "$ref": "RemoteObject", "description": "Evaluation result." },
                    { "name": "wasThrown", "type": "boolean", "optional": true, "description": "True if the result was thrown during the evaluation." }
                ],
                "description": "Evaluates expression on global object."
            },
            {
                "name": "callFunctionOn",
                "parameters": [
                    { "name": "objectId", "$ref": "RemoteObjectId", "description": "Identifier of the object to call function on." },
                    { "name": "functionDeclaration", "type": "string", "description": "Declaration of the function to call." },
                    { "name": "arguments", "type": "array", "items": { "$ref": "CallArgument", "description": "Call argument." }, "optional": true, "description": "Call arguments. All call arguments must belong to the same JavaScript world as the target object." },
                    { "name": "doNotPauseOnExceptionsAndMuteConsole", "type": "boolean", "optional": true, "description": "Specifies whether function call should stop on exceptions and mute console. Overrides setPauseOnException state.", "hidden": true },
                    { "name": "returnByValue", "type": "boolean", "optional": true, "description": "Whether the result is expected to be a JSON object which should be sent by value." }
                ],
                "returns": [
                    { "name": "result", "$ref": "RemoteObject", "description": "Call result." },
                    { "name": "wasThrown", "type": "boolean", "optional": true, "description": "True if the result was thrown during the evaluation." }
                ],
                "description": "Calls function with given declaration on the given object. Object group of the result is inherited from the target object."
            },
            {
                "name": "getProperties",
                "parameters": [
                    { "name": "objectId", "$ref": "RemoteObjectId", "description": "Identifier of the object to return properties for." },
                    { "name": "ownProperties", "optional": true, "type": "boolean", "description": "If true, returns properties belonging only to the element itself, not to its prototype chain." }
                ],
                "returns": [
                    { "name": "result", "type": "array", "items": { "$ref": "PropertyDescriptor"}, "description": "Object properties." }
                ],
                "description": "Returns properties of a given object. Object group of the result is inherited from the target object."
            },
            {
                "name": "releaseObject",
                "parameters": [
                    { "name": "objectId", "$ref": "RemoteObjectId", "description": "Identifier of the object to release." }
                ],
                "description": "Releases remote object with given id."
            },
            {
                "name": "releaseObjectGroup",
                "parameters": [
                    { "name": "objectGroup", "type": "string", "description": "Symbolic object group name." }
                ],
                "description": "Releases all remote objects that belong to a given group."
            },
            {
                "name": "run",
                "hidden": true,
                "description": "Tells inspected instance(worker or page) that it can run in case it was started paused."
            },
            {
                "name": "setReportExecutionContextCreation",
                "parameters": [
                    { "name": "enabled", "type": "boolean", "description": "Reporting enabled state." }
                ],
                "hidden": true,
                "description": "Enables reporting about creation of isolated contexts by means of <code>isolatedContextCreated</code> event. When the reporting gets enabled the event will be sent immediately for each existing isolated context."
            }

        ],
        "events": [
            {
                "name": "isolatedContextCreated",
                "parameters": [
                    { "name": "context", "$ref": "ExecutionContextDescription", "description": "A newly created isolated contex." }
                ],
                "description": "Issued when new isolated context is created."
            }
        ]
    },
    {
        "domain": "Console",
        "description": "Console domain defines methods and events for interaction with the JavaScript console. Console collects messages created by means of the <a href='http://getfirebug.com/wiki/index.php/Console_API'>JavaScript Console API</a>. One needs to enable this domain using <code>enable</code> command in order to start receiving the console messages. Browser collects messages issued while console domain is not enabled as well and reports them using <code>messageAdded</code> notification upon enabling.",
        "types": [
            {
                "id": "ConsoleMessage",
                "type": "object",
                "description": "Console message.",
                "properties": [
                    { "name": "source", "type": "string", "enum": ["html", "wml", "xml", "javascript", "network", "console-api", "other"], "description": "Message source." },
                    { "name": "level", "type": "string", "enum": ["tip", "log", "warning", "error", "debug"], "description": "Message severity." },
                    { "name": "text", "type": "string", "description": "Message text." },
                    { "name": "type", "type": "string", "optional": true, "enum": ["log", "dir", "dirxml", "trace", "startGroup", "startGroupCollapsed", "endGroup", "assert"], "description": "Console message type." },
                    { "name": "url", "type": "string", "optional": true, "description": "URL of the message origin." },
                    { "name": "line", "type": "integer", "optional": true, "description": "Line number in the resource that generated this message." },
                    { "name": "repeatCount", "type": "integer", "optional": true, "description": "Repeat count for repeated messages." },
                    { "name": "parameters", "type": "array", "items": { "$ref": "Runtime.RemoteObject" }, "optional": true, "description": "Message parameters in case of the formatted message." },
                    { "name": "stackTrace", "$ref": "StackTrace", "optional": true, "description": "JavaScript stack trace for assertions and error messages." },
                    { "name": "networkRequestId", "$ref": "Network.RequestId", "optional": true, "description": "Identifier of the network request associated with this message." }
                ]
            },
            {
                "id": "CallFrame",
                "type": "object",
                "description": "Stack entry for console errors and assertions.",
                "properties": [
                    { "name": "functionName", "type": "string", "description": "JavaScript function name." },
                    { "name": "url", "type": "string", "description": "JavaScript script name or url." },
                    { "name": "lineNumber", "type": "integer", "description": "JavaScript script line number." },
                    { "name": "columnNumber", "type": "integer", "description": "JavaScript script column number." }
                ]
            },
            {
                "id": "StackTrace",
                "type": "array",
                "items": { "$ref": "CallFrame" },
                "description": "Call frames for assertions or error messages."
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables console domain, sends the messages collected so far to the client by means of the <code>messageAdded</code> notification." 
            },
            {
                "name": "disable",
                "description": "Disables console domain, prevents further console messages from being reported to the client." 
            },
            {
                "name": "clearMessages",
                "description": "Clears console messages collected in the browser." 
            },
            {
                "name": "setMonitoringXHREnabled",
                "parameters": [
                    { "name": "enabled", "type": "boolean", "description": "Monitoring enabled state." }
                ],
                "description": "Toggles monitoring of XMLHttpRequest. If <code>true</code>, console will receive messages upon each XHR issued.", 
                "hidden": true
            },
            {
                "name": "addInspectedNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "DOM.NodeId", "description": "DOM node id to be accessible by means of $x command line API." }
                ],
                "description": "Enables console to refer to the node with given id via $x (see Command Line API for more details $x functions).",
                "hidden": true
            },
            {
                "name": "addInspectedHeapObject",
                "parameters": [
                    { "name": "heapObjectId", "type": "integer" }
		]
            }
        ],
        "events": [
            {
                "name": "messageAdded",
                "parameters": [
                    { "name": "message", "$ref": "ConsoleMessage", "description": "Console message that has been added." }
                ],
                "description": "Issued when new console message is added."
            },
            {
                "name": "messageRepeatCountUpdated",
                "parameters": [
                    { "name": "count", "type": "integer", "description": "New repeat count value." }
                ],
                "description": "Issued when subsequent message(s) are equal to the previous one(s)."
            },
            {
                "name": "messagesCleared",
                "description": "Issued when console is cleared. This happens either upon <code>clearMessages</code> command or after page navigation."
            }
        ]
    },
    {
        "domain": "Network",
        "description": "Network domain allows tracking network activities of the page. It exposes information about http, file, data and other requests and responses, their headers, bodies, timing, etc.",
        "types": [
            {
                "id": "LoaderId",
                "type": "string",
                "description": "Unique loader identifier."
            },
            {
                "id": "FrameId",
                "type": "string",
                "description": "Unique frame identifier.",
                "hidden": true
            },
            {
                "id": "RequestId",
                "type": "string",
                "description": "Unique request identifier."
            },
            {
                "id": "Timestamp",
                "type": "number",
                "description": "Number of seconds since epoch."
            },
            {
                "id": "Headers",
                "type": "object",
                "description": "Request / response headers as keys / values of JSON object."
            },
            {
                "id": "ResourceTiming",
                "type": "object",
                "description": "Timing information for the request.",
                "properties": [
                    { "name": "requestTime", "type": "number", "description": "Timing's requestTime is a baseline in seconds, while the other numbers are ticks in milliseconds relatively to this requestTime." },
                    { "name": "proxyStart", "type": "number", "description": "Started resolving proxy." },
                    { "name": "proxyEnd", "type": "number", "description": "Finished resolving proxy." },
                    { "name": "dnsStart", "type": "number", "description": "Started DNS address resolve." },
                    { "name": "dnsEnd", "type": "number", "description": "Finished DNS address resolve." },
                    { "name": "connectStart", "type": "number", "description": "Started connecting to the remote host." },
                    { "name": "connectEnd", "type": "number", "description": "Connected to the remote host." },
                    { "name": "sslStart", "type": "number", "description": "Started SSL handshake." },
                    { "name": "sslEnd", "type": "number", "description": "Finished SSL handshake." },
                    { "name": "sendStart", "type": "number", "description": "Started sending request." },
                    { "name": "sendEnd", "type": "number", "description": "Finished sending request." },
                    { "name": "receiveHeadersEnd", "type": "number", "description": "Finished receiving response headers." }
                ]
            },
            {
                "id": "Request",
                "type": "object",
                "description": "HTTP request data.",
                "properties": [
                    { "name": "url", "type": "string", "description": "Request URL." },
                    { "name": "method", "type": "string", "description": "HTTP request method." },
                    { "name": "headers", "$ref": "Headers", "description": "HTTP request headers." },
                    { "name": "postData", "type": "string", "optional": true, "description": "HTTP POST request data." }
                ]
            },
            {
                "id": "Response",
                "type": "object",
                "description": "HTTP response data.",
                "properties": [
                    { "name": "url", "type": "string", "description": "Response URL." },
                    { "name": "status", "type": "number", "description": "HTTP response status code." },
                    { "name": "statusText", "type": "string", "description": "HTTP response status text." },
                    { "name": "headers", "$ref": "Headers", "description": "HTTP response headers." },
                    { "name": "headersText", "type": "string", "optional": true, "description": "HTTP response headers text." },
                    { "name": "mimeType", "type": "string", "description": "Resource mimeType as determined by the browser." },
                    { "name": "requestHeaders", "$ref": "Headers", "optional": true, "description": "Refined HTTP request headers that were actually transmitted over the network." },
                    { "name": "requestHeadersText", "type": "string", "optional": true, "description": "HTTP request headers text." },
                    { "name": "connectionReused", "type": "boolean", "description": "Specifies whether physical connection was actually reused for this request." },
                    { "name": "connectionId", "type": "number", "description": "Physical connection id that was actually used for this request." },
                    { "name": "fromDiskCache", "type": "boolean", "optional": true, "description": "Specifies that the request was served from the disk cache." },
                    { "name": "timing", "$ref": "ResourceTiming", "optional": true, "description": "Timing information for the given request." }
                ]
            },
            {
                "id": "WebSocketRequest",
                "type": "object",
                "description": "WebSocket request data.",
                "hidden": true,
                "properties": [
                    { "name": "requestKey3", "type": "string", "description": "HTTP response status text." },
                    { "name": "headers", "$ref": "Headers", "description": "HTTP response headers." }
                ]
            },
            {
                "id": "WebSocketResponse",
                "type": "object",
                "description": "WebSocket response data.",
                "hidden": true,
                "properties": [
                    { "name": "status", "type": "number", "description": "HTTP response status code." },
                    { "name": "statusText", "type": "string", "description": "HTTP response status text." },
                    { "name": "headers", "$ref": "Headers", "description": "HTTP response headers." },
                    { "name": "challengeResponse", "type": "string", "description": "Challenge response." }
                ]
            },
            {
                "id": "WebSocketFrame",
                "type": "object",
                "description": "WebSocket frame data.",
                "hidden": true,
                "properties": [
                    { "name": "opcode", "type": "number", "description": "WebSocket frame opcode." },
                    { "name": "mask", "type": "boolean", "description": "WebSocke frame mask." },
                    { "name": "payloadData", "type": "string", "description": "WebSocke frame payload data." }
                ]
            },
            {
                "id": "CachedResource",
                "type": "object",
                "description": "Information about the cached resource.",
                "properties": [
                    { "name": "url", "type": "string", "description": "Resource URL." },
                    { "name": "type", "$ref": "Page.ResourceType", "description": "Type of this resource." },
                    { "name": "response", "$ref": "Response", "optional": true, "description": "Cached response data." },
                    { "name": "bodySize", "type": "number", "description": "Cached response body size." }
                ]
            },
            {
                "id": "Initiator",
                "type": "object",
                "description": "Information about the request initiator.",
                "properties": [
                    { "name": "type", "type": "string", "enum": ["parser", "script", "other"], "description": "Type of this initiator." },
                    { "name": "stackTrace", "$ref": "Console.StackTrace", "optional": true, "description": "Initiator JavaScript stack trace, set for Script only." },
                    { "name": "url", "type": "string", "optional": true, "description": "Initiator URL, set for Parser type only." },
                    { "name": "lineNumber", "type": "number", "optional": true, "description": "Initiator line number, set for Parser type only." }
                ]
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables network tracking, network events will now be delivered to the client."
            },
            {
                "name": "disable",
                "description": "Disables network tracking, prevents network events from being sent to the client."
            },
            {
                "name": "setUserAgentOverride",
                "description": "Allows overriding user agent with the given string.",
                "parameters": [
                    { "name": "userAgent", "type": "string", "description": "User agent to use." }
                ]
            },
            {
                "name": "setExtraHTTPHeaders",
                "description": "Specifies whether to always send extra HTTP headers with the requests from this page.",
                "parameters": [
                    { "name": "headers", "$ref": "Headers", "description": "Map with extra HTTP headers." }
                ]
            },
            {
                "name": "getResponseBody",
                "description": "Returns content served for the given request.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Identifier of the network request to get content for." }
                ],
                "returns": [
                    { "name": "body", "type": "string", "description": "Response body." },
                    { "name": "base64Encoded", "type": "boolean", "description": "True, if content was sent as base64." }
                ]
            },
            {
                "name": "canClearBrowserCache",
                "description": "Tells whether clearing browser cache is supported.",
                "returns": [
                    { "name": "result", "type": "boolean", "description": "True if browser cache can be cleared." }
                ]
            },
            {
                "name": "clearBrowserCache",
                "description": "Clears browser cache."
            },
            {
                "name": "canClearBrowserCookies",
                "description": "Tells whether clearing browser cookies is supported.",
                "returns": [
                    { "name": "result", "type": "boolean", "description": "True if browser cookies can be cleared." }
                ]
            },
            {
                "name": "clearBrowserCookies",
                "description": "Clears browser cookies."
            },
            {
                "name": "setCacheDisabled",
                "parameters": [
                    { "name": "cacheDisabled", "type": "boolean", "description": "Cache disabled state." }
                ],
                "description": "Toggles ignoring cache for each request. If <code>true</code>, cache will not be used." 
            }
        ],
        "events": [
            {
                "name": "requestWillBeSent",
                "description": "Fired when page is about to send HTTP request.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "frameId", "$ref": "FrameId", "description": "Frame identifier.", "hidden": true },
                    { "name": "loaderId", "$ref": "LoaderId", "description": "Loader identifier." },
                    { "name": "documentURL", "type": "string", "description": "URL of the document this request is loaded for." },
                    { "name": "request", "$ref": "Request", "description": "Request data." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "initiator", "$ref": "Initiator", "description": "Request initiator." },
                    { "name": "redirectResponse", "optional": true, "$ref": "Response", "description": "Redirect response data." }
                ]
            },
            {
                "name": "requestServedFromCache",
                "description": "Fired if request ended up loading from cache.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." }
                ]
            },
            {
                "name": "responseReceived",
                "description": "Fired when HTTP response is available.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "frameId", "$ref": "FrameId", "description": "Frame identifier.", "hidden": true },
                    { "name": "loaderId", "$ref": "LoaderId", "description": "Loader identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "type", "$ref": "Page.ResourceType", "description": "Resource type." },
                    { "name": "response", "$ref": "Response", "description": "Response data." }
                ]
            },
            {
                "name": "dataReceived",
                "description": "Fired when data chunk was received over the network.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "dataLength", "type": "integer", "description": "Data chunk length." },
                    { "name": "encodedDataLength", "type": "integer", "description": "Actual bytes received (might be less than dataLength for compressed encodings)." }
                ]
            },
            {
                "name": "loadingFinished",
                "description": "Fired when HTTP request has finished loading.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." }
                ]
            },
            {
                "name": "loadingFailed",
                "description": "Fired when HTTP request has failed to load.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "errorText", "type": "string", "description": "User friendly error message." },
                    { "name": "canceled", "type": "boolean", "optional": true, "description": "True if loading was canceled." }
                ]
            },
            {
                "name": "requestServedFromMemoryCache",
                "description": "Fired when HTTP request has been served from memory cache.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "frameId", "$ref": "FrameId", "description": "Frame identifier.", "hidden": true },
                    { "name": "loaderId", "$ref": "LoaderId", "description": "Loader identifier." },
                    { "name": "documentURL", "type": "string", "description": "URL of the document this request is loaded for." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "initiator", "$ref": "Initiator", "description": "Request initiator." },
                    { "name": "resource", "$ref": "CachedResource", "description": "Cached resource data." }
                ]
            },
            {
                "name": "webSocketWillSendHandshakeRequest",
                "description": "Fired when WebSocket is about to initiate handshake.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "request", "$ref": "WebSocketRequest", "description": "WebSocket request data." }
                ],
                "hidden": true
            },
            {
                "name": "webSocketHandshakeResponseReceived",
                "description": "Fired when WebSocket handshake response becomes available.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "response", "$ref": "WebSocketResponse", "description": "WebSocket response data." }
                ],
                "hidden": true
            },
            {
                "name": "webSocketCreated",
                "description": "Fired upon WebSocket creation.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "url", "type": "string", "description": "WebSocket request URL." }
                ],
                "hidden": true
            },
            {
                "name": "webSocketClosed",
                "description": "Fired when WebSocket is closed.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." }
                ],
                "hidden": true
            },
            {
                "name": "webSocketFrameReceived",
                "description": "Fired when WebSocket frame is received.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "response", "$ref": "WebSocketFrame", "description": "WebSocket response data." }
                ],
                "hidden": true
            },
            {
                "name": "webSocketFrameError",
                "description": "Fired when WebSocket frame error occurs.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "errorMessage", "type": "string", "description": "WebSocket frame error message." }
                ],
                "hidden": true
            },
            {
                "name": "webSocketFrameSent",
                "description": "Fired when WebSocket frame is sent.",
                "parameters": [
                    { "name": "requestId", "$ref": "RequestId", "description": "Request identifier." },
                    { "name": "timestamp", "$ref": "Timestamp", "description": "Timestamp." },
                    { "name": "response", "$ref": "WebSocketFrame", "description": "WebSocket response data." }
                ],
                "hidden": true
            }
        ]
    },
    {
        "domain": "Database",
        "hidden": true,
        "types": [
            {
                "id": "DatabaseId",
                "type": "string",
                "description": "Unique identifier of Database object.",
                "hidden": true
            },
            {
                "id": "Database",
                "type": "object",
                "description": "Database object.",
                "hidden": true,
                "properties": [
                    { "name": "id", "$ref": "DatabaseId", "description": "Database ID." },
                    { "name": "domain", "type": "string", "description": "Database domain." },
                    { "name": "name", "type": "string", "description": "Database name." },
                    { "name": "version", "type": "string", "description": "Database version." }
                ]
            },
            {
                "id": "Error",
                "type": "object",
                "description": "Database error."
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables database tracking, database events will now be delivered to the client."
            },
            {
                "name": "disable",
                "description": "Disables database tracking, prevents database events from being sent to the client."
            },
            {
                "name": "getDatabaseTableNames",
                "parameters": [
                    { "name": "databaseId", "$ref": "DatabaseId" }
                ],
                "returns": [
                    { "name": "tableNames", "type": "array", "items": { "type": "string" } }
                ]
            },
            {
                "name": "executeSQL",
                "parameters": [
                    { "name": "databaseId", "$ref": "DatabaseId" },
                    { "name": "query", "type": "string" }
                ],
                "returns": [
                    { "name": "success", "type": "boolean" },
                    { "name": "transactionId", "type": "integer" }
                ]
            }
        ],
        "events": [
            {
                "name": "addDatabase",
                "parameters": [
                    { "name": "database", "$ref": "Database" }
                ]
            },
            {
                "name": "sqlTransactionSucceeded",
                "parameters": [
                    { "name": "transactionId", "type": "integer" },
                    { "name": "columnNames", "type": "array", "items": { "type": "string" } },
                    { "name": "values", "type": "array", "items": { "type": "any" }}
                ]
            },
            {
                "name": "sqlTransactionFailed",
                "parameters": [
                    { "name": "transactionId", "type": "integer" },
                    { "name": "sqlError", "$ref": "Error" }
                ]
            }
        ]
    },
    {
        "domain": "IndexedDB",
        "hidden": true,
        "types": [
            {
                "id": "SecurityOriginWithDatabaseNames",
                "type": "object",
                "description": "Security origin with database names.",
                "properties": [
                    { "name": "securityOrigin", "type": "string", "description": "Security origin." },
                    { "name": "databaseNames", "type": "array", "items": { "type": "string" }, "description": "Database names for this origin." }
                ]
            },
            {
                "id": "DatabaseWithObjectStores",
                "type": "object",
                "description": "Database with an array of object stores.",
                "properties": [
                    { "name": "name", "type": "string", "description": "Database name." },
                    { "name": "version", "type": "string", "description": "Database version." },
                    { "name": "objectStores", "type": "array", "items": { "$ref": "ObjectStore" }, "description": "Object stores in this database." }
                ]
            },
            {
                "id": "ObjectStore",
                "type": "object",
                "description": "Object store.",
                "properties": [
                    { "name": "name", "type": "string", "description": "Object store name." },
                    { "name": "keyPath", "$ref": "KeyPath", "description": "Object store key path." },
                    { "name": "indexes", "type": "array", "items": { "$ref": "ObjectStoreIndex" }, "description": "Indexes in this object store." }
                ]
            },
            {
                "id": "ObjectStoreIndex",
                "type": "object",
                "description": "Object store index.",
                "properties": [
                    { "name": "name", "type": "string", "description": "Index name." },
                    { "name": "keyPath", "$ref": "KeyPath", "description": "Index key path." },
                    { "name": "unique", "type": "boolean", "description": "If true, index is unique." },
                    { "name": "multiEntry", "type": "boolean", "description": "If true, index allows multiple entries for a key." }
                ]
            },
            {
                "id": "Key",
                "type": "object",
                "description": "Key.",
                "properties": [
                    { "name": "type", "type": "string", "enum": ["number", "string", "date", "array"], "description": "Key type." },
                    { "name": "number", "type": "number", "optional": true, "description": "Number value." },
                    { "name": "string", "type": "string", "optional": true, "description": "String value." },
                    { "name": "date", "type": "number", "optional": true, "description": "Date value." },
                    { "name": "array", "type": "array", "optional": true, "items": { "$ref": "Key" }, "description": "Array value." }
                ]
            },
            {
                "id": "KeyRange",
                "type": "object",
                "description": "Key range.",
                "properties": [
                    { "name": "lower", "$ref": "Key", "optional": true, "description": "Lower bound." },
                    { "name": "upper", "$ref": "Key", "optional": true, "description": "Upper bound." },
                    { "name": "lowerOpen", "type": "boolean", "description": "If true lower bound is open." },
                    { "name": "upperOpen", "type": "boolean", "description": "If true upper bound is open." }
                ]
            },
            {
                "id": "DataEntry",
                "type": "object",
                "description": "Data entry.",
                "properties": [
                    { "name": "key", "$ref": "Key", "description": "Key." },
                    { "name": "primaryKey", "$ref": "Key", "description": "Primary key." },
                    { "name": "value", "$ref": "Runtime.RemoteObject", "description": "Value." }
                ]
            },
            {
                "id": "KeyPath",
                "type": "object",
                "description": "Key path.",
                "properties": [
                    { "name": "type", "type": "string", "enum": ["null", "string", "array"], "description": "Key path type." },
                    { "name": "string", "type": "string", "optional": true, "description": "String value." },
                    { "name": "array", "type": "array", "optional": true, "items": { "type": "string" }, "description": "Array value." }
                ]
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables events from backend."
            },
            {
                "name": "disable",
                "description": "Disables events from backend."
            },
            {
                "name": "requestDatabaseNamesForFrame",
                "parameters": [
                    { "name": "requestId", "type": "integer", "description": "Request id." },
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Frame id." }
                ],
                "description": "Requests database names for given frame's security origin."
            },
            {
                "name": "requestDatabase",
                "parameters": [
                    { "name": "requestId", "type": "integer", "description": "Request id." },
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Frame id." },
                    { "name": "databaseName", "type": "string", "description": "Database name." }
                ],
                "description": "Requests database with given name in given frame."
            },
            {
                "name": "requestData",
                "parameters": [
                    { "name": "requestId", "type": "integer", "description": "Request id." },
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Frame id." },
                    { "name": "databaseName", "type": "string", "description": "Database name." },
                    { "name": "objectStoreName", "type": "string", "description": "Object store name." },
                    { "name": "indexName", "type": "string", "description": "Index name, empty string for object store data requests." },
                    { "name": "skipCount", "type": "integer", "description": "Number of records to skip." },
                    { "name": "pageSize", "type": "integer", "description": "Number of records to fetch." },
                    { "name": "keyRange", "$ref": "KeyRange", "optional": true, "description": "Key range." }
                ],
                "description": "Requests data from object store or index."
            }
        ],
        "events": [
            {
                "name": "databaseNamesLoaded",
                "parameters": [
                    { "name": "requestId", "type": "number", "description": "Request id." },
                    { "name": "securityOriginWithDatabaseNames", "$ref": "SecurityOriginWithDatabaseNames", "description": "Frame with database names." }
                ]
            },
            {
                "name": "databaseLoaded",
                "parameters": [
                    { "name": "requestId", "type": "integer", "description": "Request id." },
                    { "name": "databaseWithObjectStores", "$ref": "DatabaseWithObjectStores", "description": "Database with an array of object stores." }
                ]
            },
            {
                "name": "objectStoreDataLoaded",
                "parameters": [
                    { "name": "requestId", "type": "integer", "description": "Request id." },
                    { "name": "objectStoreDataEntries", "type": "array", "items": { "$ref": "DataEntry" }, "description": "Array of object store data entries." },
                    { "name": "hasMore", "type": "boolean", "description": "If true, there are more entries to fetch in the given range." }
                ]
            },
            {
                "name": "indexDataLoaded",
                "parameters": [
                    { "name": "requestId", "type": "integer", "description": "Request id." },
                    { "name": "indexDataEntries", "type": "array", "items": { "$ref": "DataEntry" }, "description": "Array of index data entries." },
                    { "name": "hasMore", "type": "boolean", "description": "If true, there are more entries to fetch in the given range." }
                ]
            }
        ]
    },
    {
        "domain": "DOMStorage",
        "hidden": true,
        "types": [
            {
                "id": "StorageId",
                "type": "string",
                "description": "Unique identifier of DOM storage entry.",
                "hidden": true
            },
            {
                "id": "Entry",
                "type": "object",
                "description": "DOM Storage entry.",
                "hidden": true,
                "properties": [
                    { "name": "host", "type": "string", "description": "Domain name." },
                    { "name": "isLocalStorage", "type": "boolean", "description": "True for local storage." },
                    { "name": "id", "$ref": "StorageId", "description": "Entry id for further reference." }
                ]
            },
            {
                "id": "Item",
                "type": "array",
                "description": "DOM Storage item.",
                "hidden": true,
                "items": { "type": "string" }
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables storage tracking, storage events will now be delivered to the client."
            },
            {
                "name": "disable",
                "description": "Disables storage tracking, prevents storage events from being sent to the client."
            },
            {
                "name": "getDOMStorageEntries",
                "parameters": [
                    { "name": "storageId", "$ref": "StorageId" }
                ],
                "returns": [
                    { "name": "entries", "type": "array", "items": { "$ref": "Item" } }
                ]
            },
            {
                "name": "setDOMStorageItem",
                "parameters": [
                    { "name": "storageId", "$ref": "StorageId" },
                    { "name": "key", "type": "string" },
                    { "name": "value", "type": "string" }
                ],
                "returns": [
                    { "name": "success", "type": "boolean" }
                ]
            },
            {
                "name": "removeDOMStorageItem",
                "parameters": [
                    { "name": "storageId", "$ref": "StorageId" },
                    { "name": "key", "type": "string" }
                ],
                "returns": [
                    { "name": "success", "type": "boolean" }
                ]
            }
        ],
        "events": [
            {
                "name": "addDOMStorage",
                "parameters": [
                    { "name": "storage", "$ref": "Entry" }
                ]
            },
            {
                "name": "domStorageUpdated",
                "parameters": [
                    { "name": "storageId",  "$ref": "StorageId" }
                ]
            }
        ]
    },
    {
        "domain": "ApplicationCache",
        "hidden": true,
        "types": [
            {
                "id": "ApplicationCacheResource",
                "type": "object",
                "description": "Detailed application cache resource information.",
                "properties": [
                    { "name": "url", "type": "string", "description": "Resource url." },
                    { "name": "size", "type": "integer", "description": "Resource size." },
                    { "name": "type", "type": "string", "description": "Resource type." }
                ]
            },
            {
                "id": "ApplicationCache",
                "type": "object",
                "description": "Detailed application cache information.",
                "properties": [
                    { "name": "manifestURL", "type": "string", "description": "Manifest URL." },
                    { "name": "size", "type": "number", "description": "Application cache size." },
                    { "name": "creationTime", "type": "number", "description": "Application cache creation time." },
                    { "name": "updateTime", "type": "number", "description": "Application cache update time." },
                    { "name": "resources", "type": "array", "items": { "$ref": "ApplicationCacheResource" }, "description": "Application cache resources." }
                ]
            },
            {
                "id": "FrameWithManifest",
                "type": "object",
                "description": "Frame identifier - manifest URL pair.",
                "properties": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Frame identifier." },
                    { "name": "manifestURL", "type": "string", "description": "Manifest URL." },
                    { "name": "status", "type": "integer", "description": "Application cache status." }
                ]
            }
        ],
        "commands": [
            {
                "name": "getFramesWithManifests",
                "returns": [
                    { "name": "frameIds", "type": "array", "items": { "$ref": "FrameWithManifest" }, "description": "Array of frame identifiers with manifest urls for each frame containing a document associated with some application cache." }
                ],
                "description": "Returns array of frame identifiers with manifest urls for each frame containing a document associated with some application cache."
            },
            {
                "name": "enable",
                "description": "Enables application cache domain notifications."
            },
            {
                "name": "getManifestForFrame",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Identifier of the frame containing document whose manifest is retrieved." }
                ],
                "returns": [
                    { "name": "manifestURL", "type": "string", "description": "Manifest URL for document in the given frame." }
                ],
                "description": "Returns manifest URL for document in the given frame."
            },
            {
                "name": "getApplicationCacheForFrame",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Identifier of the frame containing document whose application cache is retrieved." }
                ],
                "returns": [
                    { "name": "applicationCache", "$ref": "ApplicationCache", "description": "Relevant application cache data for the document in given frame." }
                ],
                "description": "Returns relevant application cache data for the document in given frame."
            }
        ],
        "events": [
            {
                "name": "applicationCacheStatusUpdated",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Identifier of the frame containing document whose application cache updated status." },
                    { "name": "manifestURL", "type": "string", "description": "Manifest URL." },
                    { "name": "status", "type": "integer", "description": "Updated application cache status." }
                ]
            },
            {
                "name": "networkStateUpdated",
                "parameters": [
                    { "name": "isNowOnline", "type": "boolean" }
                ]
            }
        ]
    },
    {
        "domain": "FileSystem",
        "hidden": true,
        "types": [
            {
                "id": "Entry",
                "type": "object",
                "properties": [
                    { "name": "url", "type": "string", "description": "filesystem: URL for the entry." },
                    { "name": "name", "type": "string" },
                    { "name": "isDirectory", "type": "boolean", "description": "True if the entry is a directory." },
                    { "name": "mimeType", "type": "string", "optional": true, "description": "MIME type of the entry, available for a file only." },
                    { "name": "resourceType", "$ref": "Page.ResourceType", "optional": true, "description": "ResourceType of the entry, available for a file only." }
                ]
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables events from backend."
            },
            {
                "name": "disable",
                "description": "Disables events from backend."
            },
            {
                "name": "readDirectory",
                "description": "Requests to read the directory content. Result should return on didReadDirectory event with request id.",
                "parameters": [
                    { "name": "requestId", "type": "integer" },
                    { "name": "frameId", "type": "string" },
                    { "name": "url", "type": "string" }
                ]
            }
        ],
        "events": [
            {
                "name": "didReadDirectory",
                "parameters": [
                    { "name": "requestId", "type": "integer" },
                    { "name": "errorCode", "description": "0, if no error. Otherwise, errorCode is set to FileError::ErrorCode value.", "type": "integer" },
                    { "name": "entries", "type": "array", "items": { "$ref": "FileSystem.Entry" }, "optional": true, "description": "Entries of the directory." }
                ]
            }
        ]
    },
    {
        "domain": "DOM",
        "description": "This domain exposes DOM read/write operations. Each DOM Node is represented with its mirror object that has an <code>id</code>. This <code>id</code> can be used to get additional information on the Node, resolve it into the JavaScript object wrapper, etc. It is important that client receives DOM events only for the nodes that are known to the client. Backend keeps track of the nodes that were sent to the client and never sends the same node twice. It is client's responsibility to collect information about the nodes that were sent to the client.<p>Note that <code>iframe</code> owner elements will return corresponding document elements as their child nodes.</p>",
        "types": [
            {
                "id": "NodeId",
                "type": "integer",
                "description": "Unique DOM node identifier."
            },
            {
                "id": "Node",
                "type": "object",
                "properties": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Node identifier that is passed into the rest of the DOM messages as the <code>nodeId</code>. Backend will only push node with given <code>id</code> once. It is aware of all requested nodes and will only fire DOM events for nodes known to the client." },
                    { "name": "nodeType", "type": "integer", "description": "<code>Node</code>'s nodeType." },
                    { "name": "nodeName", "type": "string", "description": "<code>Node</code>'s nodeName." },
                    { "name": "localName", "type": "string", "description": "<code>Node</code>'s localName." },
                    { "name": "nodeValue", "type": "string", "description": "<code>Node</code>'s nodeValue." },
                    { "name": "childNodeCount", "type": "integer", "optional": true, "description": "Child count for <code>Container</code> nodes." },
                    { "name": "children", "type": "array", "optional": true, "items": { "$ref": "Node" }, "description": "Child nodes of this node when requested with children." },
                    { "name": "attributes", "type": "array", "optional": true, "items": { "type": "string" }, "description": "Attributes of the <code>Element</code> node in the form of flat array <code>[name1, value1, name2, value2]</code>." },
                    { "name": "documentURL", "type": "string", "optional": true, "description": "Document URL that <code>Document</code> or <code>FrameOwner</code> node points to." },
                    { "name": "publicId", "type": "string", "optional": true, "description": "<code>DocumentType</code>'s publicId." },
                    { "name": "systemId", "type": "string", "optional": true, "description": "<code>DocumentType</code>'s systemId." },
                    { "name": "internalSubset", "type": "string", "optional": true, "description": "<code>DocumentType</code>'s internalSubset." },
                    { "name": "xmlVersion", "type": "string", "optional": true, "description": "<code>Document</code>'s XML version in case of XML documents." },
                    { "name": "name", "type": "string", "optional": true, "description": "<code>Attr</code>'s name." },
                    { "name": "value", "type": "string", "optional": true, "description": "<code>Attr</code>'s value." },
                    { "name": "contentDocument", "$ref": "Node", "optional": true, "description": "Content document for frame owner elements." },
                    { "name": "shadowRoots", "type": "array", "optional": true, "items": { "$ref": "Node" }, "description": "Shadow root list for given element host." }
                ],
                "description": "DOM interaction is implemented in terms of mirror objects that represent the actual DOM nodes. DOMNode is a base node mirror type."
            },
            {
                "id": "EventListener",
                "type": "object",
                "hidden": true,
                "properties": [
                    { "name": "type", "type": "string", "description": "<code>EventListener</code>'s type." },
                    { "name": "useCapture", "type": "boolean", "description": "<code>EventListener</code>'s useCapture." },
                    { "name": "isAttribute", "type": "boolean", "description": "<code>EventListener</code>'s isAttribute." },
                    { "name": "nodeId", "$ref": "NodeId", "description": "Target <code>DOMNode</code> id." },
                    { "name": "handlerBody", "type": "string", "description": "Event handler function body." },
                    { "name": "location", "$ref": "Debugger.Location", "optional": true, "description": "Handler code location." }
                ],
                "description": "DOM interaction is implemented in terms of mirror objects that represent the actual DOM nodes. DOMNode is a base node mirror type."
            },
            {
                "id": "RGBA",
                "type": "object",
                "properties": [
                    { "name": "r", "type": "integer", "description": "The red component, in the [0-255] range." },
                    { "name": "g", "type": "integer", "description": "The green component, in the [0-255] range." },
                    { "name": "b", "type": "integer", "description": "The blue component, in the [0-255] range." },
                    { "name": "a", "type": "number", "optional": true, "description": "The alpha component, in the [0-1] range (default: 1)." }
                ],
                "description": "A structure holding an RGBA color."
            },
            {
                "id": "HighlightConfig",
                "type": "object",
                "properties": [
                    { "name": "showInfo", "type": "boolean", "optional": true, "description": "Whether the node info tooltip should be shown (default: false)." },
                    { "name": "contentColor", "$ref": "RGBA", "optional": true, "description": "The content box highlight fill color (default: transparent)." },
                    { "name": "paddingColor", "$ref": "RGBA", "optional": true, "description": "The padding highlight fill color (default: transparent)." },
                    { "name": "borderColor", "$ref": "RGBA", "optional": true, "description": "The border highlight fill color (default: transparent)." },
                    { "name": "marginColor", "$ref": "RGBA", "optional": true, "description": "The margin highlight fill color (default: transparent)." }
                ],
                "description": "Configuration data for the highlighting of page elements."
            }
        ],
        "commands": [
            {
                "name": "getDocument",
                "returns": [
                    { "name": "root", "$ref": "Node", "description": "Resulting node." }
                ],
                "description": "Returns the root DOM node to the caller."
            },
            {
                "name": "requestChildNodes",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to get children for." }
                ],
                "description": "Requests that children of the node with given id are returned to the caller in form of <code>setChildNodes</code> events."
            },
            {
                "name": "querySelector",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to query upon." },
                    { "name": "selector", "type": "string", "description": "Selector string." }
                ],
                "returns": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Query selector result." }
                ],
                "description": "Executes <code>querySelector</code> on a given node."
            },
            {
                "name": "querySelectorAll",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to query upon." },
                    { "name": "selector", "type": "string", "description": "Selector string." }
                ],
                "returns": [
                    { "name": "nodeIds", "type": "array", "items": { "$ref": "NodeId" }, "description": "Query selector result." }
                ],
                "description": "Executes <code>querySelectorAll</code> on a given node."
            },
            {
                "name": "setNodeName",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to set name for." },
                    { "name": "name", "type": "string", "description": "New node's name." }
                ],
                "returns": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "New node's id." }
                ],
                "description": "Sets node name for a node with given id."
            },
            {
                "name": "setNodeValue",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to set value for." },
                    { "name": "value", "type": "string", "description": "New node's value." }
                ],
                "description": "Sets node value for a node with given id."
            },
            {
                "name": "removeNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to remove." }
                ],
                "description": "Removes node with given id."
            },
            {
                "name": "setAttributeValue",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the element to set attribute for." },
                    { "name": "name", "type": "string", "description": "Attribute name." },
                    { "name": "value", "type": "string", "description": "Attribute value." }
                ],
                "description": "Sets attribute for an element with given id."
            },
            {
                "name": "setAttributesAsText",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the element to set attributes for." },
                    { "name": "text", "type": "string", "description": "Text with a number of attributes. Will parse this text using HTML parser." },
                    { "name": "name", "type": "string", "optional": true, "description": "Attribute name to replace with new attributes derived from text in case text parsed successfully." }
                ],
                "description": "Sets attributes on element with given id. This method is useful when user edits some existing attribute value and types in several attribute name/value pairs."
            },
            {
                "name": "removeAttribute",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the element to remove attribute from." },
                    { "name": "name", "type": "string", "description": "Name of the attribute to remove." }
                ],
                "description": "Removes attribute with given name from an element with given id."
            },
            {
                "name": "getEventListenersForNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to get listeners for." }
                ],
                "returns": [
                    { "name": "listeners", "type": "array", "items": { "$ref": "EventListener"}, "description": "Array of relevant listeners." }
                ],
                "description": "Returns event listeners relevant to the node.",
                "hidden": true
            },
            {
                "name": "getOuterHTML",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to get markup for." }
                ],
                "returns": [
                    { "name": "outerHTML", "type": "string", "description": "Outer HTML markup." }
                ],
                "description": "Returns node's HTML markup."
            },
            {
                "name": "setOuterHTML",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to set markup for." },
                    { "name": "outerHTML", "type": "string", "description": "Outer HTML markup to set." }
                ],
                "description": "Sets node HTML markup, returns new node id."
            },
            {
                "name": "performSearch",
                "parameters": [
                    { "name": "query", "type": "string", "description": "Plain text or query selector or XPath search query." }
                ],
                "returns": [
                    { "name": "searchId", "type": "string", "description": "Unique search session identifier." },
                    { "name": "resultCount", "type": "integer", "description": "Number of search results." }
                ],
                "description": "Searches for a given string in the DOM tree. Use <code>getSearchResults</code> to access search results or <code>cancelSearch</code> to end this search session.",
                "hidden": true
            },
            {
                "name": "getSearchResults",
                "parameters": [
                    { "name": "searchId", "type": "string", "description": "Unique search session identifier." },
                    { "name": "fromIndex", "type": "integer", "description": "Start index of the search result to be returned." },
                    { "name": "toIndex", "type": "integer", "description": "End index of the search result to be returned." }
                ],
                "returns": [
                    { "name": "nodeIds", "type": "array", "items": { "$ref": "NodeId" }, "description": "Ids of the search result nodes." }
                ],
                "description": "Returns search results from given <code>fromIndex</code> to given <code>toIndex</code> from the sarch with the given identifier.",
                "hidden": true
            },
            {
                "name": "discardSearchResults",
                "parameters": [
                    { "name": "searchId", "type": "string", "description": "Unique search session identifier." }
                ],
                "description": "Discards search results from the session with the given id. <code>getSearchResults</code> should no longer be called for that search.",
                "hidden": true
            },
            {
                "name": "requestNode",
                "parameters": [
                    { "name": "objectId", "$ref": "Runtime.RemoteObjectId", "description": "JavaScript object id to convert into node." }
                ],
                "returns": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Node id for given object." }
                ],
                "description": "Requests that the node is sent to the caller given the JavaScript node object reference. All nodes that form the path from the node to the root are also sent to the client as a series of <code>setChildNodes</code> notifications."
            },
            {
                "name": "setInspectModeEnabled",
                "hidden": true,
                "parameters": [
                    { "name": "enabled", "type": "boolean", "description": "True to enable inspection mode, false to disable it." },
                    { "name": "highlightConfig", "$ref": "HighlightConfig", "optional": true, "description": "A descriptor for the highlight appearance of hovered-over nodes. May be omitted if <code>enabled == false</code>." }
                ],
                "description": "Enters the 'inspect' mode. In this mode, elements that user is hovering over are highlighted. Backend then generates 'inspect' command upon element selection."
            },
            {
                "name": "highlightRect",
                "parameters": [
                    { "name": "x", "type": "integer", "description": "X coordinate" },
                    { "name": "y", "type": "integer", "description": "Y coordinate" },
                    { "name": "width", "type": "integer", "description": "Rectangle width" },
                    { "name": "height", "type": "integer", "description": "Rectangle height" },
                    { "name": "color", "$ref": "RGBA", "optional": true, "description": "The highlight fill color (default: transparent)." },
                    { "name": "outlineColor", "$ref": "RGBA", "optional": true, "description": "The highlight outline color (default: transparent)." }
                ],
                "description": "Highlights given rectangle. Coordinates are absolute with respect to the main frame viewport."
            },
            {
                "name": "highlightNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Identifier of the node to highlight." },
                    { "name": "highlightConfig", "$ref": "HighlightConfig", "description": "A descriptor for the highlight appearance." }
                ],
                "description": "Highlights DOM node with given id."
            },
            {
                "name": "hideHighlight",
                "description": "Hides DOM node highlight."
            },
            {
                "name": "highlightFrame",
                "parameters": [
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Identifier of the frame to highlight." },
                    { "name": "contentColor", "$ref": "RGBA", "optional": true, "description": "The content box highlight fill color (default: transparent)." },
                    { "name": "contentOutlineColor", "$ref": "RGBA", "optional": true, "description": "The content box highlight outline color (default: transparent)." }
                ],
                "description": "Highlights owner element of the frame with given id.",
                "hidden": true
            },
            {
                "name": "pushNodeByPathToFrontend",
                "parameters": [
                    { "name": "path", "type": "string", "description": "Path to node in the proprietary format." }
                ],
                "returns": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node for given path." }
                ],
                "description": "Requests that the node is sent to the caller given its path. // FIXME, use XPath",
                "hidden": true
            },
            {
                "name": "resolveNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to resolve." },
                    { "name": "objectGroup", "type": "string", "optional": true, "description": "Symbolic group name that can be used to release multiple objects." }
                ],
                "returns": [
                    { "name": "object", "$ref": "Runtime.RemoteObject", "description": "JavaScript object wrapper for given node." }
                ],
                "description": "Resolves JavaScript node object for given node id."
            },
            {
                "name": "getAttributes",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to retrieve attibutes for." }
                ],
                "returns": [
                    { "name": "attributes", "type": "array", "items": { "type": "string" }, "description": "An interleaved array of node attribute names and values." }
                ],
                "description": "Returns attributes for the specified node."
            },
            {
                "name": "moveTo",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node to drop." },
                    { "name": "targetNodeId", "$ref": "NodeId", "description": "Id of the element to drop into." },
                    { "name": "insertBeforeNodeId", "$ref": "NodeId", "optional": true, "description": "Drop node before given one." }
                ],
                "returns": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "New id of the moved node." }
                ],
                "description": "Moves node into the new container, places it before the given anchor."
            },
            {
                "name": "setTouchEmulationEnabled",
                "parameters": [
                    { "name": "enabled", "type": "boolean", "description": "Whether the touch event emulation should be enabled." }
                ],
                "description": "Toggles mouse event-based touch event emulation.",
                "hidden": true
            },
            {
                "name": "undo",
                "description": "Undoes the last performed action.",
                "hidden": true
            },
            {
                "name": "redo",
                "description": "Re-does the last undone action.",
                "hidden": true
            },
            {
                "name": "markUndoableState",
                "description": "Marks last undoable state.",
                "hidden": true
            }
        ],
        "events": [
            {
                "name": "documentUpdated",
                "description": "Fired when <code>Document</code> has been totally updated. Node ids are no longer valid."
            },
            {
                "name": "setChildNodes",
                "parameters": [
                    { "name": "parentId", "$ref": "NodeId", "description": "Parent node id to populate with children." },
                    { "name": "nodes", "type": "array", "items": { "$ref": "Node"}, "description": "Child nodes array." }
                ],
                "description": "Fired when backend wants to provide client with the missing DOM structure. This happens upon most of the calls requesting node ids."
            },
            {
                "name": "attributeModified",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node that has changed." },
                    { "name": "name", "type": "string", "description": "Attribute name." },
                    { "name": "value", "type": "string", "description": "Attribute value." }
                ],
                "description": "Fired when <code>Element</code>'s attribute is modified."
            },
            {
                "name": "attributeRemoved",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node that has changed." },
                    { "name": "name", "type": "string", "description": "A ttribute name." }
                ],
                "description": "Fired when <code>Element</code>'s attribute is removed."
            },
            {
                "name": "inlineStyleInvalidated",
                "parameters": [
                    { "name": "nodeIds", "type": "array", "items": { "$ref": "NodeId" }, "description": "Ids of the nodes for which the inline styles have been invalidated." }
                ],
                "description": "Fired when <code>Element</code>'s inline style is modified via a CSS property modification.",
                "hidden": true
            },
            {
                "name": "characterDataModified",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node that has changed." },
                    { "name": "characterData", "type": "string", "description": "New text value." }
                ],
                "description": "Mirrors <code>DOMCharacterDataModified</code> event."
            },
            {
                "name": "childNodeCountUpdated",
                "parameters": [
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node that has changed." },
                    { "name": "childNodeCount", "type": "integer", "description": "New node count." }
                ],
                "description": "Fired when <code>Container</code>'s child node count has changed."
            },
            {
                "name": "childNodeInserted",
                "parameters": [
                    { "name": "parentNodeId", "$ref": "NodeId", "description": "Id of the node that has changed." },
                    { "name": "previousNodeId", "$ref": "NodeId", "description": "If of the previous siblint." },
                    { "name": "node", "$ref": "Node", "description": "Inserted node data." }
                ],
                "description": "Mirrors <code>DOMNodeInserted</code> event."
            },
            {
                "name": "childNodeRemoved",
                "parameters": [
                    { "name": "parentNodeId", "$ref": "NodeId", "description": "Parent id." },
                    { "name": "nodeId", "$ref": "NodeId", "description": "Id of the node that has been removed." }
                ],
                "description": "Mirrors <code>DOMNodeRemoved</code> event."
            },
            {
                "name": "shadowRootPushed",
                "parameters": [
                    { "name": "hostId", "$ref": "NodeId", "description": "Host element id." },
                    { "name": "root", "$ref": "Node", "description": "Shadow root." }
                ],
                "description": "Called when shadow root is pushed into the element.",
                "hidden": true
            },
            {
                "name": "shadowRootPopped",
                "parameters": [
                    { "name": "hostId", "$ref": "NodeId", "description": "Host element id." },
                    { "name": "rootId", "$ref": "NodeId", "description": "Shadow root id." }
                ],
                "description": "Called when shadow root is popped from the element.",
                "hidden": true
            }
        ]
    },
    {
        "domain": "CSS",
        "hidden": true,
        "description": "This domain exposes CSS read/write operations. All CSS objects, like stylesheets, rules, and styles, have an associated <code>id</code> used in subsequent operations on the related object. Each object type has a specific <code>id</code> structure, and those are not interchangeable between objects of different kinds. CSS objects can be loaded using the <code>get*ForNode()</code> calls (which accept a DOM node id). Alternatively, a client can discover all the existing stylesheets with the <code>getAllStyleSheets()</code> method and subsequently load the required stylesheet contents using the <code>getStyleSheet[Text]()</code> methods.",
        "types": [
            {
                "id": "StyleSheetId",
                "type": "string"
            },
            {
                "id": "CSSStyleId",
                "type": "object",
                "properties": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId", "description": "Enclosing stylesheet identifier." },
                    { "name": "ordinal", "type": "integer", "description": "The style ordinal within the stylesheet." }
                ],
                "description": "This object identifies a CSS style in a unique way."
            },
            {
                "id": "StyleSheetOrigin",
                "type": "string",
                "enum": ["user", "user-agent", "inspector", "regular"],
                "description": "Stylesheet type: \"user\" for user stylesheets, \"user-agent\" for user-agent stylesheets, \"inspector\" for stylesheets created by the inspector (i.e. those holding the \"via inspector\" rules), \"regular\" for regular stylesheets."
            },
            {
                "id": "CSSRuleId",
                "type": "object",
                "properties": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId", "description": "Enclosing stylesheet identifier." },
                    { "name": "ordinal", "type": "integer", "description": "The rule ordinal within the stylesheet." }
                ],
                "description": "This object identifies a CSS rule in a unique way."
            },
            {
                "id": "PseudoIdRules",
                "type": "object",
                "properties": [
                    { "name": "pseudoId", "type": "integer", "description": "Pseudo style identifier (see <code>enum PseudoId</code> in <code>RenderStyleConstants.h</code>)."},
                    { "name": "rules", "type": "array", "items": { "$ref": "CSSRule" }, "description": "CSS rules applicable to the pseudo style."}
                ],
                "description": "CSS rule collection for a single pseudo style."
            },
            {
                "id": "InheritedStyleEntry",
                "type": "object",
                "properties": [
                    { "name": "inlineStyle", "$ref": "CSSStyle", "optional": true, "description": "The ancestor node's inline style, if any, in the style inheritance chain." },
                    { "name": "matchedCSSRules", "type": "array", "items": { "$ref": "CSSRule" }, "description": "CSS rules matching the ancestor node in the style inheritance chain." }
                ],
                "description": "CSS rule collection for a single pseudo style."
            },
            {
                "id": "CSSStyleAttribute",
                "type": "object",
                "properties": [
                    { "name": "name", "type": "string", "description": "DOM attribute name (e.g. \"width\")."},
                    { "name": "style", "$ref": "CSSStyle", "description": "CSS style generated by the respective DOM attribute."}
                ],
                "description": "CSS style information for a DOM style attribute."
            },
            {
                "id": "CSSStyleSheetHeader",
                "type": "object",
                "properties": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId", "description": "The stylesheet identifier."},
                    { "name": "frameId", "$ref": "Network.FrameId", "description": "Owner frame identifier."},
                    { "name": "sourceURL", "type": "string", "description": "Stylesheet resource URL."},
                    { "name": "origin", "$ref": "StyleSheetOrigin", "description": "Stylesheet origin."},
                    { "name": "title", "type": "string", "description": "Stylesheet title."},
                    { "name": "disabled", "type": "boolean", "description": "Denotes whether the stylesheet is disabled."}
                ],
                "description": "CSS stylesheet metainformation."
            },
            {
                "id": "CSSStyleSheetBody",
                "type": "object",
                "properties": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId", "description": "The stylesheet identifier."},
                    { "name": "rules", "type": "array", "items": { "$ref": "CSSRule" }, "description": "Stylesheet resource URL."},
                    { "name": "text", "type": "string", "optional": true, "description": "Stylesheet resource contents (if available)."}
                ],
                "description": "CSS stylesheet contents."
            },
            {
                "id": "CSSRule",
                "type": "object",
                "properties": [
                    { "name": "ruleId", "$ref": "CSSRuleId", "optional": true, "description": "The CSS rule identifier (absent for user agent stylesheet and user-specified stylesheet rules)."},
                    { "name": "selectorText", "type": "string", "description": "Rule selector."},
                    { "name": "sourceURL", "type": "string", "optional": true, "description": "Parent stylesheet resource URL (for regular rules)."},
                    { "name": "sourceLine", "type": "integer", "description": "Line ordinal of the rule selector start character in the resource."},
                    { "name": "origin", "$ref": "StyleSheetOrigin", "description": "Parent stylesheet's origin."},
                    { "name": "style", "$ref": "CSSStyle", "description": "Associated style declaration." },
                    { "name": "selectorRange", "$ref": "SourceRange", "optional": true, "description": "The rule selector range in the underlying resource (if available)." },
                    { "name": "media", "type": "array", "items": { "$ref": "CSSMedia" }, "optional": true, "description": "Media list array (for rules involving media queries). The array enumerates media queries starting with the innermost one, going outwards." }
                ],
                "description": "CSS rule representation."
            },
            {
                "id": "SourceRange",
                "type": "object",
                "properties": [
                    { "name": "start", "type": "integer", "description": "Start of range (inclusive)."},
                    { "name": "end", "type": "integer", "description": "End of range (exclusive)."}
                ],
                "description": "Text range within a resource."
            },
            {
                "id": "ShorthandEntry",
                "type": "object"
            },
            {
                "id": "CSSComputedStyleProperty",
                "type": "object",
                "properties": [
                    { "name": "name", "type": "string", "description": "Computed style property name." },
                    { "name": "value", "type": "string", "description": "Computed style property value." }
                ]
            },            
            {
                "id": "CSSStyle",
                "type": "object",
                "properties": [
                    { "name": "styleId", "$ref": "CSSStyleId", "optional": true, "description": "The CSS style identifier (absent for attribute styles)." },
                    { "name": "cssProperties", "type": "array", "items": { "$ref": "CSSProperty" }, "description": "CSS properties in the style." },
                    { "name": "shorthandEntries", "type": "array", "items": { "$ref": "ShorthandEntry" }, "description": "Computed values for all shorthands found in the style." },
                    { "name": "cssText", "type": "string", "optional": true, "description": "Style declaration text (if available)." },
                    { "name": "range", "$ref": "SourceRange", "optional": true, "description": "Style declaration range in the enclosing stylesheet (if available)." },
                    { "name": "width", "type": "string", "optional": true, "description": "The effective \"width\" property value from this style." },
                    { "name": "height", "type": "string", "optional": true, "description": "The effective \"height\" property value from this style." }
                ],
                "description": "CSS style representation."
            },
            {
                "id": "CSSProperty",
                "type": "object",
                "properties": [
                    { "name": "name", "type": "string", "description": "The property name." },
                    { "name": "value", "type": "string", "description": "The property value." },
                    { "name": "priority", "type": "string", "optional": true, "description": "The property priority (implies \"\" if absent)." },
                    { "name": "implicit", "type": "boolean", "optional": true, "description": "Whether the property is implicit (implies <code>false</code> if absent)." },
                    { "name": "text", "type": "string", "optional": true, "description": "The full property text as specified in the style." },
                    { "name": "parsedOk", "type": "boolean", "optional": true, "description": "Whether the property is understood by the browser (implies <code>true</code> if absent)." },
                    { "name": "status", "type": "string", "enum": ["active", "inactive", "disabled", "style"], "optional": true, "description": "The property status: \"active\" (implied if absent) if the property is effective in the style, \"inactive\" if the property is overridden by a same-named property in this style later on, \"disabled\" if the property is disabled by the user, \"style\" if the property is reported by the browser rather than by the CSS source parser." },
                    { "name": "shorthandName", "type": "string", "optional": true, "description": "The related shorthand property name (absent if this property is not a longhand)." },
                    { "name": "range", "$ref": "SourceRange", "optional": true, "description": "The entire property range in the enclosing style declaration (if available)." }
                ],
                "description": "CSS style effective visual dimensions and source offsets."
            },
            {
                "id": "CSSMedia",
                "type": "object",
                "properties": [
                    { "name": "text", "type": "string", "description": "Media query text." },
                    { "name": "source", "type": "string", "enum": ["mediaRule", "importRule", "linkedSheet", "inlineSheet"], "description": "Source of the media query: \"mediaRule\" if specified by a @media rule, \"importRule\" if specified by an @import rule, \"linkedSheet\" if specified by a \"media\" attribute in a linked stylesheet's LINK tag, \"inlineSheet\" if specified by a \"media\" attribute in an inline stylesheet's STYLE tag." },
                    { "name": "sourceURL", "type": "string", "optional": true, "description": "URL of the document containing the media query description." },
                    { "name": "sourceLine", "type": "integer", "optional": true, "description": "Line in the document containing the media query (not defined for the \"stylesheet\" source)." }
                ],
                "description": "CSS media query descriptor."
            },
            {
                "id": "SelectorProfileEntry",
                "type": "object",
                "properties": [
                    { "name": "selector", "type": "string", "description": "CSS selector of the corresponding rule." },
                    { "name": "url", "type": "string", "description": "URL of the resource containing the corresponding rule." },
                    { "name": "lineNumber", "type": "integer", "description": "Selector line number in the resource for the corresponding rule." },
                    { "name": "time", "type": "number", "description": "Total time this rule handling contributed to the browser running time during profiling (in milliseconds.)" },
                    { "name": "hitCount", "type": "integer", "description": "Number of times this rule was considered a candidate for matching against DOM elements." },
                    { "name": "matchCount", "type": "integer", "description": "Number of times this rule actually matched a DOM element." }
                ],
                "description": "CSS selector profile entry."
            },
            {
                "id": "SelectorProfile",
                "type": "object",
                "properties": [
                    { "name": "totalTime", "type": "number", "description": "Total processing time for all selectors in the profile (in milliseconds.)" },
                    { "name": "data", "type": "array", "items": { "$ref": "SelectorProfileEntry" }, "description": "CSS selector profile entries." }
                ]
            }
        ],
        "commands": [
            {
                "name": "enable",
                "description": "Enables the CSS agent for the given page. Clients should not assume that the CSS agent has been enabled until the result of this command is received."
            },
            {
                "name": "disable",
                "description": "Disables the CSS agent for the given page."
            },
            {
                "name": "getMatchedStylesForNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "DOM.NodeId" },
                    { "name": "forcedPseudoClasses", "type": "array", "items": { "type": "string", "enum": ["active", "focus", "hover", "visited"] }, "optional": true, "description": "Element pseudo classes to force when computing applicable style rules." },
                    { "name": "includePseudo", "type": "boolean", "optional": true, "description": "Whether to include pseudo styles (default: true)." },
                    { "name": "includeInherited", "type": "boolean", "optional": true, "description": "Whether to include inherited styles (default: true)." }
                ],
                "returns": [
                    { "name": "matchedCSSRules", "type": "array", "items": { "$ref": "CSSRule" }, "optional": true, "description": "CSS rules matching this node, from all applicable stylesheets." },
                    { "name": "pseudoElements", "type": "array", "items": { "$ref": "PseudoIdRules" }, "optional": true, "description": "Pseudo style rules for this node." },
                    { "name": "inherited", "type": "array", "items": { "$ref": "InheritedStyleEntry" }, "optional": true, "description": "A chain of inherited styles (from the immediate node parent up to the DOM tree root)." }
                ],
                "description": "Returns requested styles for a DOM node identified by <code>nodeId</code>."
            },
            {
                "name": "getInlineStylesForNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "DOM.NodeId" }
                ],
                "returns": [
                    { "name": "inlineStyle", "$ref": "CSSStyle", "optional": true, "description": "Inline style for the specified DOM node." },
                    { "name": "attributesStyle", "$ref": "CSSStyle", "optional": true, "description": "Attribute-defined element style (e.g. resulting from \"width=20 height=100%\")."}
                ],
                "description": "Returns the styles defined inline (explicitly in the \"style\" attribute and implicitly, using DOM attributes) for a DOM node identified by <code>nodeId</code>."
            },
            {
                "name": "getComputedStyleForNode",
                "parameters": [
                    { "name": "nodeId", "$ref": "DOM.NodeId" },
                    { "name": "forcedPseudoClasses", "type": "array", "items": { "type": "string", "enum": ["active", "focus", "hover", "visited"] }, "optional": true, "description": "Element pseudo classes to force when computing applicable style rules." }
                ],
                "returns": [
                    { "name": "computedStyle", "type": "array", "items": { "$ref": "CSSComputedStyleProperty" }, "description": "Computed style for the specified DOM node." }
                ],
                "description": "Returns the computed style for a DOM node identified by <code>nodeId</code>."
            },
            {
                "name": "getAllStyleSheets",
                "returns": [
                    { "name": "headers", "type": "array", "items": { "$ref": "CSSStyleSheetHeader" }, "description": "Descriptor entries for all available stylesheets." }
                ],
                "description": "Returns metainfo entries for all known stylesheets."
            },
            {
                "name": "getStyleSheet",
                "parameters": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId" }
                ],
                "returns": [
                    { "name": "styleSheet", "$ref": "CSSStyleSheetBody", "description": "Stylesheet contents for the specified <code>styleSheetId</code>." }
                ],
                "description": "Returns stylesheet data for the specified <code>styleSheetId</code>."
            },
            {
                "name": "getStyleSheetText",
                "parameters": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId" }
                ],
                "returns": [
                    { "name": "text", "type": "string", "description": "The stylesheet text." }
                ],
                "description": "Returns the current textual content and the URL for a stylesheet."
            },
            {
                "name": "setStyleSheetText",
                "parameters": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId" },
                    { "name": "text", "type": "string" }
                ],
                "description": "Sets the new stylesheet text, thereby invalidating all existing <code>CSSStyleId</code>'s and <code>CSSRuleId</code>'s contained by this stylesheet."
            },
            {
                "name": "setPropertyText",
                "parameters": [
                    { "name": "styleId", "$ref": "CSSStyleId" },
                    { "name": "propertyIndex", "type": "integer" },
                    { "name": "text", "type": "string" },
                    { "name": "overwrite", "type": "boolean" }
                ],
                "returns": [
                    { "name": "style", "$ref": "CSSStyle", "description": "The resulting style after the property text modification." }
                ],
                "description": "Sets the new <code>text</code> for a property in the respective style, at offset <code>propertyIndex</code>. If <code>overwrite</code> is <code>true</code>, a property at the given offset is overwritten, otherwise inserted. <code>text</code> entirely replaces the property <code>name: value</code>."
            },
            {
                "name": "toggleProperty",
                "parameters": [
                    { "name": "styleId", "$ref": "CSSStyleId" },
                    { "name": "propertyIndex", "type": "integer" },
                    { "name": "disable", "type": "boolean" }
                ],
                "returns": [
                    { "name": "style", "$ref": "CSSStyle", "description": "The resulting style after the property toggling." }
                ],
                "description": "Toggles the property in the respective style, at offset <code>propertyIndex</code>. The <code>disable</code> parameter denotes whether the property should be disabled (i.e. removed from the style declaration). If <code>disable == false</code>, the property gets put back into its original place in the style declaration."
            },
            {
                "name": "setRuleSelector",
                "parameters": [
                    { "name": "ruleId", "$ref": "CSSRuleId" },
                    { "name": "selector", "type": "string" }
                ],
                "returns": [
                    { "name": "rule", "$ref": "CSSRule", "description": "The resulting rule after the selector modification." }
                ],
                "description": "Modifies the rule selector."
            },
            {
                "name": "addRule",
                "parameters": [
                    { "name": "contextNodeId", "$ref": "DOM.NodeId" },
                    { "name": "selector", "type": "string" }
                ],
                "returns": [
                    { "name": "rule", "$ref": "CSSRule", "description": "The newly created rule." }
                ],
                "description": "Creates a new empty rule with the given <code>selector</code> in a special \"inspector\" stylesheet in the owner document of the context node."
            },
            {
                "name": "getSupportedCSSProperties",
                "returns": [
                    { "name": "cssProperties", "type": "array", "items": { "type": "string" }, "description": "Supported property names." }
                ],
                "description": "Returns all supported CSS property names."
            },
            {
                "name": "startSelectorProfiler"
            },
            {
                "name": "stopSelectorProfiler",
                "returns": [
                    { "name": "profile", "$ref": "SelectorProfile" }
                ]
            }
        ],
        "events": [
            {
                "name": "mediaQueryResultChanged",
                "description": "Fires whenever a MediaQuery result changes (for example, after a browser window has been resized.) The current implementation considers only viewport-dependent media features."
            },
            {
                "name": "styleSheetChanged",
                "parameters": [
                    { "name": "styleSheetId", "$ref": "StyleSheetId" }
                ],
                "description": "Fired whenever a stylesheet is changed as a result of the client operation."
            }
        ]
    },
    {
        "domain": "Timeline",
        "description": "Timeline provides its clients with instrumentation records that are generated during the page runtime. Timeline instrumentation can be started and stopped using corresponding commands. While timeline is started, it is generating timeline event records.",
        "types": [
            {
                "id": "TimelineEvent",
                "type": "object",
                "properties": [
                    { "name": "type", "type": "string", "description": "Event type." },
                    { "name": "data", "type": "object", "description": "Event data." },
                    { "name": "children", "type": "array", "optional": true, "items": { "$ref": "TimelineEvent" }, "description": "Nested records." }
                ],
                "description": "Timeline record contains information about the recorded activity."
            }
        ],
        "commands": [
            {
                "name": "start",
                "parameters": [
                    { "name": "maxCallStackDepth", "optional": true, "type": "integer", "description": "Samples JavaScript stack traces up to <code>maxCallStackDepth</code>, defaults to 5." }
                ],
                "description": "Starts capturing instrumentation events."
            },
            {
                "name": "stop",
                "description": "Stops capturing instrumentation events."
            },
            {
                "name": "setIncludeMemoryDetails",
                "parameters": [
                    { "name": "enabled", "type": "boolean", "description": "True to start collecting DOM counters." }
                ],
                "hidden": true,
                "description": "Starts calculating various DOM statistics and sending them as part of timeline events."
            },
            {
                "name": "supportsFrameInstrumentation",
                "returns": [
                    { "name": "result", "type": "boolean", "description": "True if timeline supports frame instrumentation." }
                ],
                "hidden": true,
                "description": "Tells whether timeline agent supports frame instrumentation."
            }
        ],
        "events": [
            {
                "name": "eventRecorded",
                "parameters": [
                    { "name": "record", "$ref": "TimelineEvent", "description": "Timeline event record data." }
                ],
                "description": "Fired for every instrumentation event while timeline is started."
            }
        ]
    },
    {
        "domain": "Debugger",
        "description": "Debugger domain exposes JavaScript debugging capabilities. It allows setting and removing breakpoints, stepping through execution, exploring stack traces, etc.",
        "types": [
            {
                "id": "BreakpointId",
                "type": "string",
                "description": "Breakpoint identifier."
            },
            {
                "id": "ScriptId",
                "type": "string",
                "description": "Unique script identifier."
            },
            {
                "id": "CallFrameId",
                "type": "string",
                "description": "Call frame identifier."
            },
            {
                "id": "Location",
                "type": "object",
                "properties": [
                    { "name": "scriptId", "$ref": "ScriptId", "description": "Script identifier as reported in the <code>Debugger.scriptParsed</code>." },
                    { "name": "lineNumber", "type": "integer", "description": "Line number in the script." },
                    { "name": "columnNumber", "type": "integer", "optional": true, "description": "Column number in the script." }
                ],
                "description": "Location in the source code."
            },
            {
                "id": "FunctionDetails",
                "hidden": true,
                "type": "object",
                "properties": [
                    { "name": "location", "$ref": "Location", "description": "Location of the function." },
                    { "name": "name", "type": "string", "optional": true, "description": "Name of the function. Not present for anonymous functions." },
                    { "name": "displayName", "type": "string", "optional": true, "description": "Display name of the function(specified in 'displayName' property on the function object)." },
                    { "name": "inferredName", "type": "string", "optional": true, "description": "Name of the function inferred from its initial assignment." },
                    { "name": "scopeChain", "type": "array", "optional": true, "items": { "$ref": "Scope" }, "description": "Scope chain for this closure." }
                ],
                "description": "Information about the function."
            },
            {
                "id": "CallFrame",
                "type": "object",
                "properties": [
                    { "name": "callFrameId", "$ref": "CallFrameId", "description": "Call frame identifier. This identifier is only valid while the virtual machine is paused." },
                    { "name": "functionName", "type": "string", "description": "Name of the JavaScript function called on this call frame." },
                    { "name": "location", "$ref": "Location", "description": "Location in the source code." },
                    { "name": "scopeChain", "type": "array", "items": { "$ref": "Scope" }, "description": "Scope chain for this call frame." },
                    { "name": "this", "$ref": "Runtime.RemoteObject", "description": "<code>this</code> object for this call frame." }
                ],
                "description": "JavaScript call frame. Array of call frames form the call stack."
            },
            {
                "id": "Scope",
                "type": "object",
                "properties": [
                    { "name": "type", "type": "string", "enum": ["global", "local", "with", "closure", "catch"], "description": "Scope type." },
                    { "name": "object", "$ref": "Runtime.RemoteObject", "description": "Object representing the scope. For <code>global</code> and <code>with</code> scopes it represents the actual object; for the rest of the scopes, it is artificial transient object enumerating scope variables as its properties." }
                ],
                "description": "Scope description."
            }
        ],
        "commands": [
            {
                "name": "causesRecompilation",
                "returns": [
                    { "name": "result", "type": "boolean", "description": "True if enabling debugger causes scripts recompilation." }
                ],
                "hidden": true,
                "description": "Tells whether enabling debugger causes scripts recompilation."
            },
            {
                "name": "supportsNativeBreakpoints",
                "returns": [
                    { "name": "result", "type": "boolean", "description": "True if debugger supports native breakpoints." }
                ],
                "hidden": true,
                "description": "Tells whether debugger supports native breakpoints."
            },
            {
                "name": "enable",
                "description": "Enables debugger for the given page. Clients should not assume that the debugging has been enabled until the result for this command is received."
            },
            {
                "name": "disable",
                "description": "Disables debugger for given page."
            },
            {
                "name": "setBreakpointsActive",
                "parameters": [
                    { "name": "active", "type": "boolean", "description": "New value for breakpoints active state." }
                ],
                "description": "Activates / deactivates all breakpoints on the page."
            },
            {
                "name": "setBreakpointByUrl",
                "parameters": [
                    { "name": "lineNumber", "type": "integer", "description": "Line number to set breakpoint at." },
                    { "name": "url", "type": "string", "optional": true, "description": "URL of the resources to set breakpoint on." },
                    { "name": "urlRegex", "type": "string", "optional": true, "description": "Regex pattern for the URLs of the resources to set breakpoints on. Either <code>url</code> or <code>urlRegex</code> must be specified." },
                    { "name": "columnNumber", "type": "integer", "optional": true, "description": "Offset in the line to set breakpoint at." },
                    { "name": "condition", "type": "string", "optional": true, "description": "Expression to use as a breakpoint condition. When specified, debugger will only stop on the breakpoint if this expression evaluates to true." }
                ],
                "returns": [
                    { "name": "breakpointId", "$ref": "BreakpointId", "description": "Id of the created breakpoint for further reference." },
                    { "name": "locations", "type": "array", "items": { "$ref": "Location"}, "description": "List of the locations this breakpoint resolved into upon addition." }
                ],
                "description": "Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this command is issued, all existing parsed scripts will have breakpoints resolved and returned in <code>locations</code> property. Further matching script parsing will result in subsequent <code>breakpointResolved</code> events issued. This logical breakpoint will survive page reloads."
            },
            {
                "name": "setBreakpoint",
                "parameters": [
                    { "name": "location", "$ref": "Location", "description": "Location to set breakpoint in." },
                    { "name": "condition", "type": "string", "optional": true, "description": "Expression to use as a breakpoint condition. When specified, debugger will only stop on the breakpoint if this expression evaluates to true." }
                ],
                "returns": [
                    { "name": "breakpointId", "$ref": "BreakpointId", "description": "Id of the created breakpoint for further reference." },
                    { "name": "actualLocation", "$ref": "Location", "description": "Location this breakpoint resolved into." }
                ],
                "description": "Sets JavaScript breakpoint at a given location."
            },
            {
                "name": "removeBreakpoint",
                "parameters": [
                    { "name": "breakpointId", "$ref": "BreakpointId" }
                ],
                "description": "Removes JavaScript breakpoint."
            },
            {
                "name": "continueToLocation",
                "parameters": [
                    { "name": "location", "$ref": "Location", "description": "Location to continue to." }
                ],
                "description": "Continues execution until specific location is reached."
            },
            {
                "name": "stepOver",
                "description": "Steps over the statement."
            },
            {
                "name": "stepInto",
                "description": "Steps into the function call."
            },
            {
                "name": "stepOut",
                "description": "Steps out of the function call."
            },
            {
                "name": "pause",
                "description": "Stops on the next JavaScript statement."
            },
            {
                "name": "resume",
                "description": "Resumes JavaScript execution."
            },
            {
                "name": "searchInContent",
                "parameters": [
                    { "name": "scriptId", "$ref": "ScriptId", "description": "Id of the script to search in." },
                    { "name": "query", "type": "string", "description": "String to search for."  },
                    { "name": "caseSensitive", "type": "boolean", "optional": true, "description": "If true, search is case sensitive." },
                    { "name": "isRegex", "type": "boolean", "optional": true, "description": "If true, treats string parameter as regex." }
                ],
                "returns": [
                    { "name": "result", "type": "array", "items": { "$ref": "Page.SearchMatch" }, "description": "List of search matches." }
                ],
                "description": "Searches for given string in script content."
            },
            {
                "name": "canSetScriptSource",
                "returns": [
                    { "name": "result", "type": "boolean", "description": "True if <code>setScriptSource</code> is supported." }
                ],
                "description": "Tells whether <code>setScriptSource</code> is supported."
            },
            {
                "name": "setScriptSource",
                "parameters": [
                    { "name": "scriptId", "$ref": "ScriptId", "description": "Id of the script to edit." },
                    { "name": "scriptSource", "type": "string", "description": "New content of the script." },
                    { "name": "preview", "type": "boolean", "optional": true, "description": " If true the change will not actually be applied. Preview mode may be used to get result description without actually modifying the code.", "hidden": true }
                ],
                "returns": [
                    { "name": "callFrames", "type": "array", "optional": true, "items": { "$ref": "CallFrame"}, "description": "New stack trace in case editing has happened while VM was stopped." },
                    { "name": "result", "type": "object", "optional": true, "description": "VM-specific description of the changes applied.", "hidden": true }
                ],
                "description": "Edits JavaScript source live."
            },
            {
                "name": "getScriptSource",
                "parameters": [
                    { "name": "scriptId", "$ref": "ScriptId", "description": "Id of the script to get source for." }
                ],
                "returns": [
                    { "name": "scriptSource", "type": "string", "description": "Script source." }
                ],
                "description": "Returns source for the script with given id."
            },
            {
                "name": "getFunctionDetails",
                "hidden": true,
                "parameters": [
                    { "name": "functionId", "$ref": "Runtime.RemoteObjectId", "description": "Id of the function to get location for." }
                ],
                "returns": [
                    { "name": "details", "$ref": "FunctionDetails", "description": "Information about the function." }
                ],
                "description": "Returns detailed informtation on given function."
            },
            {
                "name": "setPauseOnExceptions",
                "parameters": [
                    { "name": "state", "type": "string", "enum": ["none", "uncaught", "all"], "description": "Pause on exceptions mode." }
                ],
                "description": "Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or no exceptions. Initial pause on exceptions state is <code>none</code>."
            },
            {
                "name": "evaluateOnCallFrame",
                "parameters": [
                    { "name": "callFrameId", "$ref": "CallFrameId", "description": "Call frame identifier to evaluate on." },
                    { "name": "expression", "type": "string", "description": "Expression to evaluate." },
                    { "name": "objectGroup", "type": "string", "optional": true, "description": "String object group name to put result into (allows rapid releasing resulting object handles using <code>releaseObjectGroup</code>)." },
                    { "name": "includeCommandLineAPI", "type": "boolean", "optional": true, "description": "Specifies whether command line API should be available to the evaluated expression, defaults to false.", "hidden": true },
                    { "name": "doNotPauseOnExceptionsAndMuteConsole", "type": "boolean", "optional": true, "description": "Specifies whether evaluation should stop on exceptions and mute console. Overrides setPauseOnException state.", "hidden": true },
                    { "name": "returnByValue", "type": "boolean", "optional": true, "description": "Whether the result is expected to be a JSON object that should be sent by value." }
                ],
                "returns": [
                    { "name": "result", "$ref": "Runtime.RemoteObject", "description": "Object wrapper for the evaluation result." },
                    { "name": "wasThrown", "type": "boolean", "optional": true, "description": "True if the result was thrown during the evaluation." }
                ],
                "description": "Evaluates expression on a given call frame."
            }
        ],
        "events": [
            {
                "name": "globalObjectCleared",
                "description": "Called when global has been cleared and debugger client should reset its state. Happens upon navigation or reload."
            },
            {
                "name": "scriptParsed",
                "parameters": [
                    { "name": "scriptId", "$ref": "ScriptId", "description": "Identifier of the script parsed." },
                    { "name": "url", "type": "string", "description": "URL or name of the script parsed (if any)." },
                    { "name": "startLine", "type": "integer", "description": "Line offset of the script within the resource with given URL (for script tags)." },
                    { "name": "startColumn", "type": "integer", "description": "Column offset of the script within the resource with given URL." },
                    { "name": "endLine", "type": "integer", "description": "Last line of the script." },
                    { "name": "endColumn", "type": "integer", "description": "Length of the last line of the script." },
                    { "name": "isContentScript", "type": "boolean", "optional": true, "description": "Determines whether this script is a user extension script." },
                    { "name": "sourceMapURL", "type": "string", "optional": true, "description": "URL of source map associated with script (if any)." }
                ],
                "description": "Fired when virtual machine parses script. This event is also fired for all known and uncollected scripts upon enabling debugger."
            },
            {
                "name": "scriptFailedToParse",
                "parameters": [
                    { "name": "url", "type": "string", "description": "URL of the script that failed to parse." },
                    { "name": "scriptSource", "type": "string", "description": "Source text of the script that failed to parse." },
                    { "name": "startLine", "type": "integer", "description": "Line offset of the script within the resource." },
                    { "name": "errorLine", "type": "integer", "description": "Line with error." },
                    { "name": "errorMessage", "type": "string", "description": "Parse error message." }
                ],
                "description": "Fired when virtual machine fails to parse the script."
            },
            {
                "name": "breakpointResolved",
                "parameters": [
                    { "name": "breakpointId", "$ref": "BreakpointId", "description": "Breakpoint unique identifier." },
                    { "name": "location", "$ref": "Location", "description": "Actual breakpoint location." }
                ],
                "description": "Fired when breakpoint is resolved to an actual script and location."
            },
            {
                "name": "paused",
                "parameters": [
                    { "name": "callFrames", "type": "array", "items": { "$ref": "CallFrame" }, "description": "Call stack the virtual machine stopped on." },
                    { "name": "reason", "type": "string", "enum": [ "XHR", "DOM", "EventListener", "exception", "other" ], "description": "Pause reason." },
                    { "name": "data", "type": "object", "optional": true, "description": "Object containing break-specific auxiliary properties." }
                ],
                "description": "Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria."
            },
            {
                "name": "resumed",
                "description": "Fired when the virtual machine resumed execution."
            }
        ]
    },
    {
        "domain": "DOMDebugger",
        "description": "DOM debugging allows setting breakpoints on particular DOM operations and events. JavaScript execution will stop on these operations as if there was a regular breakpoint set.",
        "types": [
            {
                "id": "DOMBreakpointType",
                "type": "string",
                "enum": ["subtree-modified", "attribute-modified", "node-removed"],
                "description": "DOM breakpoint type."
            }
        ],
        "commands": [
            {
                "name": "setDOMBreakpoint",
                "parameters": [
                    { "name": "nodeId", "$ref": "DOM.NodeId", "description": "Identifier of the node to set breakpoint on." },
                    { "name": "type", "$ref": "DOMBreakpointType", "description": "Type of the operation to stop upon." }
                ],
                "description": "Sets breakpoint on particular operation with DOM."
            },
            {
                "name": "removeDOMBreakpoint",
                "parameters": [
                    { "name": "nodeId", "$ref": "DOM.NodeId", "description": "Identifier of the node to remove breakpoint from." },
                    { "name": "type", "$ref": "DOMBreakpointType", "description": "Type of the breakpoint to remove." }
                ],
                "description": "Removes DOM breakpoint that was set using <code>setDOMBreakpoint</code>."
            },
            {
                "name": "setEventListenerBreakpoint",
                "parameters": [
                    { "name": "eventName", "type": "string", "description": "DOM Event name to stop on (any DOM event will do)." }
                ],
                "description": "Sets breakpoint on particular DOM event."
            },
            {
                "name": "removeEventListenerBreakpoint",
                "parameters": [
                    { "name": "eventName", "type": "string", "description": "Event name." }
                ],
                "description": "Removes breakpoint on particular DOM event."
            },
            {
                "name": "setInstrumentationBreakpoint",
                "parameters": [
                    { "name": "eventName", "type": "string", "description": "Instrumentation name to stop on." }
                ],
                "description": "Sets breakpoint on particular native event.",
                "hidden": true
            },
            {
                "name": "removeInstrumentationBreakpoint",
                "parameters": [
                    { "name": "eventName", "type": "string", "description": "Instrumentation name to stop on." }
                ],
                "description": "Sets breakpoint on particular native event.",
                "hidden": true
            },
            {
                "name": "setXHRBreakpoint",
                "parameters": [
                    { "name": "url", "type": "string", "description": "Resource URL substring. All XHRs having this substring in the URL will get stopped upon." }
                ],
                "description": "Sets breakpoint on XMLHttpRequest."
            },
            {
                "name": "removeXHRBreakpoint",
                "parameters": [
                    { "name": "url", "type": "string", "description": "Resource URL substring." }
                ],
                "description": "Removes breakpoint from XMLHttpRequest."
            }
        ]
    },
    {
        "domain": "Profiler",
        "hidden": true,
        "types": [
            {
                "id": "ProfileHeader",
                "type": "object",
                "description": "Profile header.",
                "properties": [
                    { "name": "typeId", "type": "string", "enum": ["CPU", "CSS", "HEAP"], "description": "Profile type name." },
                    { "name": "title", "type": "string", "description": "Profile title." },
                    { "name": "uid", "type": "integer", "description": "Unique identifier of the profile." },
                    { "name": "maxJSObjectId", "type": "integer", "optional": true, "description": "Last seen JS object Id." }
                ]
            },
            {
                "id": "Profile",
                "type": "object",
                "description": "Profile.",
                "properties": [
                    { "name": "head", "type": "object", "optional": true },
                    { "name": "bottomUpHead", "type": "object", "optional": true }
                ]
            },
            {
                "id": "HeapSnapshotObjectId",
                "type": "string",
                "description": "Heap snashot object id."
            }
        ],
        "commands": [
            {
                "name": "causesRecompilation",
                "returns": [
                    { "name": "result", "type": "boolean" }
                ]
            },
            {
                "name": "isSampling",
                "returns": [
                    { "name": "result", "type": "boolean" }
                ]
            },
            {
                "name": "hasHeapProfiler",
                "returns": [
                    { "name": "result", "type": "boolean" }
                ]
            },
            {
                "name": "enable"
            },
            {
                "name": "disable"
            },
            {
                "name": "start"
            },
            {
                "name": "stop"
            },
            {
                "name": "getProfileHeaders",
                "returns": [
                    { "name": "headers", "type": "array", "items": { "$ref": "ProfileHeader"} }
                ]
            },
            {
                "name": "getProfile",
                "parameters": [
                    { "name": "type", "type": "string" },
                    { "name": "uid", "type": "integer" }
                ],
                "returns": [
                    { "name": "profile", "$ref": "Profile" }
                ]
            },
            {
                "name": "removeProfile",
                "parameters": [
                    { "name": "type", "type": "string" },
                    { "name": "uid", "type": "integer" }
                ]
            },
            {
                "name": "clearProfiles"
            },
            {
                "name": "takeHeapSnapshot"
            },
            {
                "name": "collectGarbage"
            },
            {
                "name": "getObjectByHeapObjectId",
                "parameters": [
                    { "name": "objectId", "$ref": "HeapSnapshotObjectId" },
                    { "name": "objectGroup", "type": "string", "optional": true, "description": "Symbolic group name that can be used to release multiple objects." }
                ],
                "returns": [
                    { "name": "result", "$ref": "Runtime.RemoteObject", "description": "Evaluation result." }
                ]
            },
            {
                "name": "getHeapObjectId",
                "parameters": [
                    { "name": "objectId", "$ref": "Runtime.RemoteObjectId", "description": "Identifier of the object to get heap object id for." }
                ],
                "returns": [
                    { "name": "heapSnapshotObjectId", "$ref": "HeapSnapshotObjectId", "description": "Id of the heap snapshot object corresponding to the passed remote object id." }
                ]
            }
        ],
        "events": [
            {
                "name": "addProfileHeader",
                "parameters": [
                    { "name": "header", "$ref": "ProfileHeader" }
                ]
            },
            {
                "name": "addHeapSnapshotChunk",
                "parameters": [
                    { "name": "uid", "type": "integer" },
                    { "name": "chunk", "type": "string" }
                ]
            },
            {
                "name": "finishHeapSnapshot",
                "parameters": [
                    { "name": "uid", "type": "integer" }
                ]
            },
            {
                "name": "setRecordingProfile",
                "parameters": [
                    { "name": "isProfiling", "type": "boolean" }
                ]
            },
            {
                "name": "resetProfiles"
            },
            {
                "name": "reportHeapSnapshotProgress",
                "parameters": [
                    { "name": "done", "type": "integer" },
                    { "name": "total", "type": "integer" }
                ]
            }
        ]
    },
    {
        "domain": "Worker",
        "hidden": true,
        "types": [],
        "commands": [
            {
                "name": "setWorkerInspectionEnabled",
                "parameters": [
                    { "name": "value", "type": "boolean" }
                ]
            },
            {
                "name": "sendMessageToWorker",
                "parameters": [
                    { "name": "workerId", "type": "integer" },
                    { "name": "message", "type": "object" }
                ]
            },
            {
                "name": "connectToWorker",
                "parameters": [
                    { "name": "workerId", "type": "integer" }
                ]
            },
            {
                "name": "disconnectFromWorker",
                "parameters": [
                    { "name": "workerId", "type": "integer" }
                ]
            },
            {
                "name": "setAutoconnectToWorkers",
                "parameters": [
                    { "name": "value", "type": "boolean" }
                ]
            }
        ],
        "events": [
            {
                "name": "workerCreated",
                "parameters": [
                    { "name": "workerId", "type": "integer" },
                    { "name": "url", "type": "string" },
                    { "name": "inspectorConnected", "type": "boolean" }
                ]
            },
            {
                "name": "workerTerminated",
                "parameters": [
                    { "name": "workerId", "type": "integer" }
                ]
            },
            {
                "name": "dispatchMessageFromWorker",
                "parameters": [
                    { "name": "workerId", "type": "integer" },
                    { "name": "message", "type": "object" }
                ]
            },
            {
                "name": "disconnectedFromWorker"
            }
        ]
    },
    {
        "domain": "WebGL",
        "hidden": true,
        "types": [],
        "commands": [
            {
                "name": "enable",
                "description": "Enables WebGL inspection."
            },
            {
                "name": "disable",
                "description": "Disables WebGL inspection."
            }
        ],
        "events": []
    }]
}

});
