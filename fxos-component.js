(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["fxosComponent"] = factory();
	else
		root["fxosComponent"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Locals
	 */

	var getDescriptor = Object.getOwnPropertyDescriptor;
	var textContent = getDescriptor(Node.prototype, 'textContent');
	var innerHTML = getDescriptor(Element.prototype, 'innerHTML');
	var removeAttribute = Element.prototype.removeAttribute;
	var setAttribute = Element.prototype.setAttribute;
	var noop  = () => {};

	var base = {
	  properties: {
	    FXOSComponent: true,
	    attributeChanged: noop,
	    attached: noop,
	    detached: noop,
	    created: noop,

	    createdCallback() {
	      if (this.dirObserver) { addDirObserver(); }
	      injectLightCss(this);
	      this.created();
	    },

	    /**
	     * It is very common to want to keep object
	     * properties in-sync with attributes,,
	     * for example:
	     *
	     *   el.value = 'foo';
	     *   el.setAttribute('value', 'foo');
	     *
	     * So we support an object on the prototype
	     * named 'attrs' to provide a consistent
	     * way for component authors to define
	     * these properties. When an attribute
	     * changes we keep the attr[name]
	     * up-to-date.
	     *
	     * @param  {String} name
	     * @param  {(String|null)} from
	     * @param  {(String|null)} to
	     */
	    attributeChangedCallback(name, from, to) {
	      var prop = toCamelCase(name);
	      if (this._attrs && this._attrs[prop]) { this[prop] = to; }
	      this.attributeChanged(name, from, to);
	    },

	    attachedCallback() {
	      if (this.dirObserver) {
	        this.setInnerDirAttributes = setInnerDirAttributes.bind(null, this);
	        document.addEventListener('dirchanged', this.setInnerDirAttributes);
	      }
	      this.attached();
	    },

	    detachedCallback() {
	      if (this.dirObserver) {
	        document.removeEventListener('dirchanged', this.setInnerDirAttributes);
	      }

	      if (document.l10n && this.onDOMRetranslated) {
	        document.l10n.ready.then(() => document.removeEventListener(
	          'DOMRetranslated', this.onDOMRetranslated));
	      }

	      this.detached();
	    },

	    /**
	     * A convenient method for setting up
	     * a shadow-root using the defined template.
	     *
	     * @return {ShadowRoot}
	     */
	    setupShadowRoot() {
	      if (!this.template) return;
	      var node = document.importNode(this.template.content, true);
	      this.createShadowRoot().appendChild(node);
	      if (this.dirObserver) setInnerDirAttributes(this);
	      return this.shadowRoot;
	    },

	    /**
	     * A convenient method for triggering
	     * l10n for component's shadow DOM.
	     */
	    setupShadowL10n() {
	      if (!document.l10n) return this.localizeShadow(this.shadowRoot);
	      this.onDOMRetranslated = this.localizeShadow.bind(null, this.shadowRoot);
	      document.l10n.ready.then(() => {
	        document.addEventListener('DOMRetranslated', this.onDOMRetranslated);
	        this.localizeShadow(this.shadowRoot);
	      });
	    },

	    /**
	     * Localizes the shadowRoot subtree.
	     *
	     * @param {ShadowRoot}
	     */
	    localizeShadow(shadowRoot) {
	      if (!document.l10n) return;
	      document.l10n.translateFragment(shadowRoot);
	    },

	    /**
	     * Sets an attribute internally
	     * and externally. This is so that
	     * we can style internal shadow-dom
	     * content.
	     *
	     * @param {String} name
	     * @param {String} value
	     */
	    setAttr(name, value) {
	      var internal = this.shadowRoot.firstElementChild;
	      setAttribute.call(internal, name, value);
	      setAttribute.call(this, name, value);
	    },

	    /**
	     * Removes an attribute internally
	     * and externally. This is so that
	     * we can style internal shadow-dom
	     * content.
	     *
	     * @param {String} name
	     * @param {String} value
	     */
	    removeAttr(name) {
	      var internal = this.shadowRoot.firstElementChild;
	      removeAttribute.call(internal, name);
	      removeAttribute.call(this, name);
	    }
	  },

	  descriptors: {
	    textContent: {
	      set: function(value) {
	        textContent.set.call(this, value);
	        if (this.lightStyle) { this.appendChild(this.lightStyle); }
	      },

	      get: function() {
	        return textContent.get();
	      }
	    },

	    innerHTML: {
	      set: function(value) {
	        innerHTML.set.call(this, value);
	        if (this.lightStyle) { this.appendChild(this.lightStyle); }
	      },

	      get: innerHTML.get
	    }
	  }
	};

	/**
	 * Register a new component.
	 *
	 * @param  {String} name
	 * @param  {Object} props
	 * @return {constructor}
	 * @public
	 */
	exports.register = function(name, props) {
	  var baseProto = getBaseProto(props.extends);
	  var template = props.template || baseProto.templateString;

	  // Components are extensible by default but can be declared
	  // as non extensible as an optimization to avoid
	  // storing the template strings
	  var extensible = props.extensible = props.hasOwnProperty('extensible')?
	    props.extensible : true;

	  // Clean up
	  delete props.extends;

	  // Pull out CSS that needs to be in the light-dom
	  if (template) {
	    // Stores the string to be reprocessed when
	    // a new component extends this one
	    if (extensible && props.template) {
	      props.templateString = props.template;
	    }

	    var output = processCss(template, name);

	    props.template = document.createElement('template');
	    props.template.innerHTML = output.template;
	    props.lightCss = output.lightCss;

	    props.globalCss = props.globalCss || '';
	    props.globalCss += output.globalCss;
	  }

	  // Inject global CSS into the document,
	  // and delete as no longer needed
	  injectGlobalCss(props.globalCss);
	  delete props.globalCss;

	  // Merge base getter/setter attributes with the user's,
	  // then define the property descriptors on the prototype.
	  var descriptors = Object.assign(props.attrs || {}, base.descriptors);

	  // Store the orginal descriptors somewhere
	  // a little more private and delete the original
	  props._attrs = props.attrs;
	  delete props.attrs;

	  // Create the prototype, extended from base and
	  // define the descriptors directly on the prototype
	  var proto = createProto(baseProto, props);
	  Object.defineProperties(proto, descriptors);

	  // Register the custom-element and return the constructor
	  try {
	    return document.registerElement(name, { prototype: proto });
	  } catch (e) {
	    if (e.name !== 'NotSupportedError') throw e;
	  }
	};

	/**
	 * The default base prototype to use
	 * when `extends` is undefined.
	 *
	 * @type {Object}
	 */
	var defaultPrototype = createProto(HTMLElement.prototype, base.properties);

	/**
	 * Returns a suitable prototype based
	 * on the object passed.
	 *
	 * @private
	 * @param  {HTMLElementPrototype|undefined} proto
	 * @return {HTMLElementPrototype}
	 */
	function getBaseProto(proto) {
	  if (!proto) return defaultPrototype;
	  proto = proto.prototype || proto;
	  return !proto.FXOSComponent
	    ? createProto(proto, base.properties)
	    : proto;
	}

	/**
	 * Extends the given proto and mixes
	 * in the given properties.
	 *
	 * @private
	 * @param  {Object} proto
	 * @param  {Object} props
	 * @return {Object}
	 */
	function createProto(proto, props) {
	  return Object.assign(Object.create(proto), props);
	}

	/**
	 * Detects presence of shadow-dom
	 * CSS selectors.
	 *
	 * @private
	 * @return {Boolean}
	 */
	var hasShadowCSS = (function() {
	  var div = document.createElement('div');
	  try { div.querySelector(':host'); return true; }
	  catch (e) { return false; }
	})();

	/**
	 * Regexs used to extract shadow-css
	 *
	 * @type {Object}
	 */
	var regex = {
	  shadowCss: /(?:\:host|\:\:content)[^{]*\{[^}]*\}/g,
	  ':host': /(?:\:host)/g,
	  ':host()': /\:host\((.+)\)(?: \:\:content)?/g,
	  ':host-context': /\:host-context\((.+)\)([^{,]+)?/g,
	  '::content': /(?:\:\:content)/g
	};

	/**
	 * Extracts the :host and ::content rules
	 * from the shadow-dom CSS and rewrites
	 * them to work from the <style scoped>
	 * injected at the root of the component.
	 *
	 * @private
	 * @return {String}
	 */
	function processCss(template, name) {
	  var globalCss = '';
	  var lightCss = '';

	  if (!hasShadowCSS) {
	    template = template.replace(regex.shadowCss, function(match) {
	      var hostContext = regex[':host-context'].exec(match);

	      if (hostContext) {
	        globalCss += match
	          .replace(regex['::content'], '')
	          .replace(regex[':host-context'], '$1 ' + name + '$2')
	          .replace(/ +/g, ' '); // excess whitespace
	      } else {
	        lightCss += match
	          .replace(regex[':host()'], name + '$1')
	          .replace(regex[':host'], name)
	          .replace(regex['::content'], name);
	      }

	      return '';
	    });
	  }

	  return {
	    template: template,
	    lightCss: lightCss,
	    globalCss: globalCss
	  };
	}

	/**
	 * Some CSS rules, such as @keyframes
	 * and @font-face don't work inside
	 * scoped or shadow <style>. So we
	 * have to put them into 'global'
	 * <style> in the head of the
	 * document.
	 *
	 * @private
	 * @param  {String} css
	 */
	function injectGlobalCss(css) {
	  if (!css) {return;}
	  var style = document.createElement('style');
	  style.innerHTML = css.trim();
	  headReady().then(function() {
	    document.head.appendChild(style);
	  });
	}

	/**
	 * Resolves a promise once document.head is ready.
	 *
	 * @private
	 */
	function headReady() {
	  return new Promise(function(resolve) {
	    if (document.head) { return resolve(); }
	    window.addEventListener('load', function fn() {
	      window.removeEventListener('load', fn);
	      resolve();
	    });
	  });
	}

	/**
	 * The Gecko platform doesn't yet have
	 * `::content` or `:host`, selectors,
	 * without these we are unable to style
	 * user-content in the light-dom from
	 * within our shadow-dom style-sheet.
	 *
	 * To workaround this, we clone the <style>
	 * node into the root of the component,
	 * so our selectors are able to target
	 * light-dom content.
	 *
	 * @private
	 */
	function injectLightCss(el) {
	  if (hasShadowCSS) { return; }
	  var stylesheet = el.querySelector('style');

	  if (!stylesheet) {
	    stylesheet = document.createElement('style');
	    stylesheet.setAttribute('scoped', '');
	    stylesheet.appendChild(document.createTextNode(el.lightCss));
	    el.appendChild(stylesheet);
	  }

	  el.lightStyle = stylesheet;
	}

	/**
	 * Convert hyphen separated
	 * string to camel-case.
	 *
	 * Example:
	 *
	 *   toCamelCase('foo-bar'); //=> 'fooBar'
	 *
	 * @private
	 * @param  {String} string
	 * @return {String}
	 */
	function toCamelCase(string) {
	  return string.replace(/-(.)/g, function replacer(string, p1) {
	    return p1.toUpperCase();
	  });
	}

	/**
	 * Observer (singleton)
	 *
	 * @type {MutationObserver|undefined}
	 */
	var dirObserver;

	/**
	 * Workaround for bug 1100912: applies a `dir` attribute to all shadowRoot
	 * children so that :-moz-dir() selectors work on shadow DOM elements.
	 *
	 * In order to keep decent performances, the `dir` is the component dir if
	 * defined, or the document dir otherwise. This won't work if the component's
	 * direction is defined by CSS or inherited from a parent container.
	 *
	 * This method should be removed when bug 1100912 is fixed.
	 *
	 * @private
	 * @param  {WebComponent}
	 */
	function setInnerDirAttributes(component) {
	  var dir = component.dir || document.dir;
	  Array.from(component.shadowRoot.children).forEach(element => {
	    if (element.nodeName !== 'STYLE') {
	      element.dir = dir;
	    }
	  });
	}

	/**
	 * Observes the document `dir` (direction)
	 * attribute and when it changes:
	 *
	 *  - dispatches a global `dirchanged` event;
	 *  - forces the `dir` attribute of all shadowRoot children.
	 *
	 * Components can listen to this event
	 * and make internal changes if needed.
	 *
	 * @private
	 */
	function addDirObserver() {
	  if (dirObserver) { return; }

	  dirObserver = new MutationObserver(onChanged);
	  dirObserver.observe(document.documentElement, {
	    attributeFilter: ['dir'],
	    attributes: true
	  });

	  function onChanged(mutations) {
	    document.dispatchEvent(new Event('dirchanged'));
	  }
	}


/***/ }
/******/ ])
});
;