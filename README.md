A simple javascript event router.
Add a callback to any custom event which is keyed by two strings, a model name and an action name.

Interface Documentation
=======================

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [EventRouter](#eventrouter)
    -   [name](#name)
    -   [log](#log)
    -   [constructor](#constructor)
    -   [add](#add)
    -   [emit](#emit)
    -   [getModels](#getmodels)
    -   [purge](#purge)
    -   [remove](#remove)

## EventRouter

The EventRouter Class

### name

Type: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

### log

Type: logFunction

### constructor

Creates a new EventRouter

**Parameters**

-   `options` **{name: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?, log: logFunction?}** 

Returns **void** 

### add

Adds callback to model/action

**Parameters**

-   `model` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `action` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `cb` **callbackFunction** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

### emit

Emits data to all callbacks on the model/action

**Parameters**

-   `model` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `action` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `data` **any** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

### getModels

Get all models

Returns **MaybeModels** 

### purge

Remove model and all its actions and callbacks

**Parameters**

-   `model` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

### remove

Remove callback from a model/action

**Parameters**

-   `model` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `action` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `cb` **callbackFunction** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 
