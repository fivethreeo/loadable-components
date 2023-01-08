import path from 'path'
import fs from 'fs'
import { Volume } from 'memfs'
import MemoryFileSystem from 'memory-fs'
import { Union } from 'unionfs'
import webpack from 'webpack'
import { promisify } from 'util'

function getFileSystems(jsonFs = {}) {
  const inputUnionFileSystem = new Union()
  const inputMemoryFileSystem = new MemoryFileSystem()

  const inputVolume = Volume.fromJSON(jsonFs)

  inputUnionFileSystem
    .use(fs)
    .use(inputVolume)
    .use(inputMemoryFileSystem)

  const outputFileSystem = new MemoryFileSystem()

  return {
    inputUnion: inputUnionFileSystem,
    inputMemory: inputMemoryFileSystem,
    outputMemory: outputFileSystem,
  }
}

function getCompiler(config) {
  const compiler = webpack(config)
  compiler.run = promisify(compiler.run)
  return compiler
}

function getCompilerWithFs(config, jsonFs = {}) {
  const fileSystems = getFileSystems(jsonFs)
  const compiler = getCompiler(config)
  compiler.inputFileSystem = fileSystems.inputUnion
  compiler.resolvers.normal.fileSystem = fileSystems.inputUnion
  compiler.outputFileSystem = fileSystems.outputMemory
  return {
    compiler,
    input: fileSystems.inputMemory,
    output: fileSystems.outputMemory,
  }
}

describe('LoadablePlugin', () => {
  it('builds', done => {
    const root = path.resolve(__dirname)
    const outputDir = path.resolve(root, 'build')
    const outputMain = path.resolve(outputDir, 'main.js')
    const entryFile = path.resolve(root, 'file.js')
    const aFile = path.resolve(root, 'A.js')

    const target = 'web'
    const { compiler, input, output } = getCompilerWithFs(
      {
        mode: 'production',
        entry: entryFile,
        target: target,
        context: root,
        optimization: {
          minimize: false,
        },
        resolveLoader: {
          modules: [path.resolve(root, '../', 'node_modules'), 'node_modules'],
        },
        output: {
          path: outputDir,
          filename: '[name].js',
        },
        module: {
          rules: [
            {
              test: /\.js?$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  caller: { target },
                  cwd: root,
                },
              },
            },
          ],
        },
      },
      {
        [entryFile]: `
        import React from 'react'
        import loadable from '@loadable/component'
        const A = loadable(() => import('./A.js'))
        `,
        [aFile]: `export default () => 'A'`,
      },
    )
    compiler.run().then(stats => {
      expect(stats.compilation.errors).toMatchInlineSnapshot(`Array []`)

      expect(output.readdirSync(outputDir)).toMatchInlineSnapshot(`
        Array [
          "A.js",
          "main.js",
        ]
      `)
      expect(output.readFileSync(outputMain).toString()).toMatchInlineSnapshot(`
        "/******/ (function(modules) { // webpackBootstrap
        /******/ 	// install a JSONP callback for chunk loading
        /******/ 	function webpackJsonpCallback(data) {
        /******/ 		var chunkIds = data[0];
        /******/ 		var moreModules = data[1];
        /******/
        /******/
        /******/ 		// add \\"moreModules\\" to the modules object,
        /******/ 		// then flag all \\"chunkIds\\" as loaded and fire callback
        /******/ 		var moduleId, chunkId, i = 0, resolves = [];
        /******/ 		for(;i < chunkIds.length; i++) {
        /******/ 			chunkId = chunkIds[i];
        /******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
        /******/ 				resolves.push(installedChunks[chunkId][0]);
        /******/ 			}
        /******/ 			installedChunks[chunkId] = 0;
        /******/ 		}
        /******/ 		for(moduleId in moreModules) {
        /******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        /******/ 				modules[moduleId] = moreModules[moduleId];
        /******/ 			}
        /******/ 		}
        /******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
        /******/
        /******/ 		while(resolves.length) {
        /******/ 			resolves.shift()();
        /******/ 		}
        /******/
        /******/ 	};
        /******/
        /******/
        /******/ 	// The module cache
        /******/ 	var installedModules = {};
        /******/
        /******/ 	// object to store loaded and loading chunks
        /******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
        /******/ 	// Promise = chunk loading, 0 = chunk loaded
        /******/ 	var installedChunks = {
        /******/ 		1: 0
        /******/ 	};
        /******/
        /******/
        /******/
        /******/ 	// script path function
        /******/ 	function jsonpScriptSrc(chunkId) {
        /******/ 		return __webpack_require__.p + \\"\\" + ({\\"0\\":\\"A\\"}[chunkId]||chunkId) + \\".js\\"
        /******/ 	}
        /******/
        /******/ 	// The require function
        /******/ 	function __webpack_require__(moduleId) {
        /******/
        /******/ 		// Check if module is in cache
        /******/ 		if(installedModules[moduleId]) {
        /******/ 			return installedModules[moduleId].exports;
        /******/ 		}
        /******/ 		// Create a new module (and put it into the cache)
        /******/ 		var module = installedModules[moduleId] = {
        /******/ 			i: moduleId,
        /******/ 			l: false,
        /******/ 			exports: {}
        /******/ 		};
        /******/
        /******/ 		// Execute the module function
        /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ 		// Flag the module as loaded
        /******/ 		module.l = true;
        /******/
        /******/ 		// Return the exports of the module
        /******/ 		return module.exports;
        /******/ 	}
        /******/
        /******/ 	// This file contains only the entry chunk.
        /******/ 	// The chunk loading function for additional chunks
        /******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
        /******/ 		var promises = [];
        /******/
        /******/
        /******/ 		// JSONP chunk loading for javascript
        /******/
        /******/ 		var installedChunkData = installedChunks[chunkId];
        /******/ 		if(installedChunkData !== 0) { // 0 means \\"already installed\\".
        /******/
        /******/ 			// a Promise means \\"currently loading\\".
        /******/ 			if(installedChunkData) {
        /******/ 				promises.push(installedChunkData[2]);
        /******/ 			} else {
        /******/ 				// setup Promise in chunk cache
        /******/ 				var promise = new Promise(function(resolve, reject) {
        /******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
        /******/ 				});
        /******/ 				promises.push(installedChunkData[2] = promise);
        /******/
        /******/ 				// start chunk loading
        /******/ 				var script = document.createElement('script');
        /******/ 				var onScriptComplete;
        /******/
        /******/ 				script.charset = 'utf-8';
        /******/ 				script.timeout = 120;
        /******/ 				if (__webpack_require__.nc) {
        /******/ 					script.setAttribute(\\"nonce\\", __webpack_require__.nc);
        /******/ 				}
        /******/ 				script.src = jsonpScriptSrc(chunkId);
        /******/
        /******/ 				// create error before stack unwound to get useful stacktrace later
        /******/ 				var error = new Error();
        /******/ 				onScriptComplete = function (event) {
        /******/ 					// avoid mem leaks in IE.
        /******/ 					script.onerror = script.onload = null;
        /******/ 					clearTimeout(timeout);
        /******/ 					var chunk = installedChunks[chunkId];
        /******/ 					if(chunk !== 0) {
        /******/ 						if(chunk) {
        /******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
        /******/ 							var realSrc = event && event.target && event.target.src;
        /******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\\\\n(' + errorType + ': ' + realSrc + ')';
        /******/ 							error.name = 'ChunkLoadError';
        /******/ 							error.type = errorType;
        /******/ 							error.request = realSrc;
        /******/ 							chunk[1](error);
        /******/ 						}
        /******/ 						installedChunks[chunkId] = undefined;
        /******/ 					}
        /******/ 				};
        /******/ 				var timeout = setTimeout(function(){
        /******/ 					onScriptComplete({ type: 'timeout', target: script });
        /******/ 				}, 120000);
        /******/ 				script.onerror = script.onload = onScriptComplete;
        /******/ 				document.head.appendChild(script);
        /******/ 			}
        /******/ 		}
        /******/ 		return Promise.all(promises);
        /******/ 	};
        /******/
        /******/ 	// expose the modules object (__webpack_modules__)
        /******/ 	__webpack_require__.m = modules;
        /******/
        /******/ 	// expose the module cache
        /******/ 	__webpack_require__.c = installedModules;
        /******/
        /******/ 	// define getter function for harmony exports
        /******/ 	__webpack_require__.d = function(exports, name, getter) {
        /******/ 		if(!__webpack_require__.o(exports, name)) {
        /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
        /******/ 		}
        /******/ 	};
        /******/
        /******/ 	// define __esModule on exports
        /******/ 	__webpack_require__.r = function(exports) {
        /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        /******/ 		}
        /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
        /******/ 	};
        /******/
        /******/ 	// create a fake namespace object
        /******/ 	// mode & 1: value is a module id, require it
        /******/ 	// mode & 2: merge all properties of value into the ns
        /******/ 	// mode & 4: return value when already ns object
        /******/ 	// mode & 8|1: behave like require
        /******/ 	__webpack_require__.t = function(value, mode) {
        /******/ 		if(mode & 1) value = __webpack_require__(value);
        /******/ 		if(mode & 8) return value;
        /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        /******/ 		var ns = Object.create(null);
        /******/ 		__webpack_require__.r(ns);
        /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
        /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
        /******/ 		return ns;
        /******/ 	};
        /******/
        /******/ 	// getDefaultExport function for compatibility with non-harmony modules
        /******/ 	__webpack_require__.n = function(module) {
        /******/ 		var getter = module && module.__esModule ?
        /******/ 			function getDefault() { return module['default']; } :
        /******/ 			function getModuleExports() { return module; };
        /******/ 		__webpack_require__.d(getter, 'a', getter);
        /******/ 		return getter;
        /******/ 	};
        /******/
        /******/ 	// Object.prototype.hasOwnProperty.call
        /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
        /******/
        /******/ 	// __webpack_public_path__
        /******/ 	__webpack_require__.p = \\"\\";
        /******/
        /******/ 	// on error function for async loading
        /******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
        /******/
        /******/ 	var jsonpArray = window[\\"webpackJsonp\\"] = window[\\"webpackJsonp\\"] || [];
        /******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
        /******/ 	jsonpArray.push = webpackJsonpCallback;
        /******/ 	jsonpArray = jsonpArray.slice();
        /******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
        /******/ 	var parentJsonpFunction = oldJsonpFunction;
        /******/
        /******/
        /******/ 	// Load entry module and return exports
        /******/ 	return __webpack_require__(__webpack_require__.s = 5);
        /******/ })
        /************************************************************************/
        /******/ ([
        /* 0 */
        /***/ (function(module, exports, __webpack_require__) {

        \\"use strict\\";


        if (true) {
          module.exports = __webpack_require__(6);
        } else {}


        /***/ }),
        /* 1 */
        /***/ (function(module, exports, __webpack_require__) {

        \\"use strict\\";


        if (true) {
          module.exports = __webpack_require__(8);
        } else {}


        /***/ }),
        /* 2 */
        /***/ (function(module, exports, __webpack_require__) {

        \\"use strict\\";


        var reactIs = __webpack_require__(1);

        /**
         * Copyright 2015, Yahoo! Inc.
         * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
         */
        var REACT_STATICS = {
          childContextTypes: true,
          contextType: true,
          contextTypes: true,
          defaultProps: true,
          displayName: true,
          getDefaultProps: true,
          getDerivedStateFromError: true,
          getDerivedStateFromProps: true,
          mixins: true,
          propTypes: true,
          type: true
        };
        var KNOWN_STATICS = {
          name: true,
          length: true,
          prototype: true,
          caller: true,
          callee: true,
          arguments: true,
          arity: true
        };
        var FORWARD_REF_STATICS = {
          '$$typeof': true,
          render: true,
          defaultProps: true,
          displayName: true,
          propTypes: true
        };
        var MEMO_STATICS = {
          '$$typeof': true,
          compare: true,
          defaultProps: true,
          displayName: true,
          propTypes: true,
          type: true
        };
        var TYPE_STATICS = {};
        TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;

        function getStatics(component) {
          if (reactIs.isMemo(component)) {
            return MEMO_STATICS;
          }

          return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
        }

        var defineProperty = Object.defineProperty;
        var getOwnPropertyNames = Object.getOwnPropertyNames;
        var getOwnPropertySymbols = Object.getOwnPropertySymbols;
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        var getPrototypeOf = Object.getPrototypeOf;
        var objectPrototype = Object.prototype;
        function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
          if (typeof sourceComponent !== 'string') {
            // don't hoist over string (html) components
            if (objectPrototype) {
              var inheritedComponent = getPrototypeOf(sourceComponent);

              if (inheritedComponent && inheritedComponent !== objectPrototype) {
                hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
              }
            }

            var keys = getOwnPropertyNames(sourceComponent);

            if (getOwnPropertySymbols) {
              keys = keys.concat(getOwnPropertySymbols(sourceComponent));
            }

            var targetStatics = getStatics(targetComponent);
            var sourceStatics = getStatics(sourceComponent);

            for (var i = 0; i < keys.length; ++i) {
              var key = keys[i];

              if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
                var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

                try {
                  // Avoid failures from read-only properties
                  defineProperty(targetComponent, key, descriptor);
                } catch (e) {}
              }
            }
          }

          return targetComponent;
        }

        module.exports = hoistNonReactStatics;


        /***/ }),
        /* 3 */
        /***/ (function(module, __webpack_exports__, __webpack_require__) {

        \\"use strict\\";

        // UNUSED EXPORTS: __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, lazy, loadableReady

        // EXTERNAL MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/node_modules/react/index.js
        var react = __webpack_require__(0);
        var react_default = /*#__PURE__*/__webpack_require__.n(react);

        // CONCATENATED MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
        function _objectWithoutPropertiesLoose(source, excluded) {
          if (source == null) return {};
          var target = {};
          var sourceKeys = Object.keys(source);
          var key, i;

          for (i = 0; i < sourceKeys.length; i++) {
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            target[key] = source[key];
          }

          return target;
        }
        // CONCATENATED MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/node_modules/@babel/runtime/helpers/esm/extends.js
        function _extends() {
          _extends = Object.assign || function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];

              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }

            return target;
          };

          return _extends.apply(this, arguments);
        }
        // CONCATENATED MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
        function _assertThisInitialized(self) {
          if (self === void 0) {
            throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\");
          }

          return self;
        }
        // CONCATENATED MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
        function _inheritsLoose(subClass, superClass) {
          subClass.prototype = Object.create(superClass.prototype);
          subClass.prototype.constructor = subClass;
          subClass.__proto__ = superClass;
        }
        // EXTERNAL MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/node_modules/react-is/index.js
        var react_is = __webpack_require__(1);

        // EXTERNAL MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js
        var hoist_non_react_statics_cjs = __webpack_require__(2);
        var hoist_non_react_statics_cjs_default = /*#__PURE__*/__webpack_require__.n(hoist_non_react_statics_cjs);

        // CONCATENATED MODULE: /home/oyvind/Dokumenter/GitHub/loadable-components/packages/component/dist/loadable.esm.js







        /* eslint-disable import/prefer-default-export */

        function invariant(condition, message) {
          if (condition) return;
          var error = new Error(\\"loadable: \\" + message);
          error.framesToPop = 1;
          error.name = 'Invariant Violation';
          throw error;
        }

        function warn(message) {
          // eslint-disable-next-line no-console
          console.warn(\\"loadable: \\" + message);
        }

        var Context =
        /*#__PURE__*/
        react_default.a.createContext();
        var LOADABLE_REQUIRED_CHUNKS_KEY = '__LOADABLE_REQUIRED_CHUNKS__';

        function getRequiredChunkKey(namespace) {
          return \\"\\" + namespace + LOADABLE_REQUIRED_CHUNKS_KEY;
        }

        var sharedInternals =
        /*#__PURE__*/
        Object.freeze({
          __proto__: null,
          getRequiredChunkKey: getRequiredChunkKey,
          invariant: invariant,
          Context: Context
        });
        var LOADABLE_SHARED = {
          initialChunks: {}
        };
        var STATUS_PENDING = 'PENDING';
        var STATUS_RESOLVED = 'RESOLVED';
        var STATUS_REJECTED = 'REJECTED';

        function resolveConstructor(ctor) {
          if (typeof ctor === 'function') {
            return {
              requireAsync: ctor,
              resolve: function resolve() {
                return undefined;
              },
              chunkName: function chunkName() {
                return undefined;
              }
            };
          }

          return ctor;
        }

        var loadable_esm_withChunkExtractor = function withChunkExtractor(Component) {
          var LoadableWithChunkExtractor = function LoadableWithChunkExtractor(props) {
            return react_default.a.createElement(Context.Consumer, null, function (extractor) {
              return react_default.a.createElement(Component, Object.assign({
                __chunkExtractor: extractor
              }, props));
            });
          };

          if (Component.displayName) {
            LoadableWithChunkExtractor.displayName = Component.displayName + \\"WithChunkExtractor\\";
          }

          return LoadableWithChunkExtractor;
        };

        var identity = function identity(v) {
          return v;
        };

        function createLoadable(_ref) {
          var _ref$defaultResolveCo = _ref.defaultResolveComponent,
              defaultResolveComponent = _ref$defaultResolveCo === void 0 ? identity : _ref$defaultResolveCo,
              _render = _ref.render,
              onLoad = _ref.onLoad;

          function loadable(loadableConstructor, options) {
            if (options === void 0) {
              options = {};
            }

            var ctor = resolveConstructor(loadableConstructor);
            var cache = {};
            /**
             * Cachekey represents the component to be loaded
             * if key changes - component has to be reloaded
             * @param props
             * @returns {null|Component}
             */

            function _getCacheKey(props) {
              if (options.cacheKey) {
                return options.cacheKey(props);
              }

              if (ctor.resolve) {
                return ctor.resolve(props);
              }

              return 'static';
            }
            /**
             * Resolves loaded \`module\` to a specific \`Component
             * @param module
             * @param props
             * @param Loadable
             * @returns Component
             */


            function resolve(module, props, Loadable) {
              var Component = options.resolveComponent ? options.resolveComponent(module, props) : defaultResolveComponent(module);

              if (options.resolveComponent && !Object(react_is[\\"isValidElementType\\"])(Component)) {
                throw new Error(\\"resolveComponent returned something that is not a React component!\\");
              }

              hoist_non_react_statics_cjs_default()(Loadable, Component, {
                preload: true
              });
              return Component;
            }

            var cachedLoad = function cachedLoad(props) {
              var cacheKey = _getCacheKey(props);

              var promise = cache[cacheKey];

              if (!promise || promise.status === STATUS_REJECTED) {
                promise = ctor.requireAsync(props);
                promise.status = STATUS_PENDING;
                cache[cacheKey] = promise;
                promise.then(function () {
                  promise.status = STATUS_RESOLVED;
                }, function (error) {
                  console.error('loadable-components: failed to asynchronously load component', {
                    fileName: ctor.resolve(props),
                    chunkName: ctor.chunkName(props),
                    error: error ? error.message : error
                  });
                  promise.status = STATUS_REJECTED;
                });
              }

              return promise;
            };

            var InnerLoadable =
            /*#__PURE__*/
            function (_React$Component) {
              _inheritsLoose(InnerLoadable, _React$Component);

              InnerLoadable.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
                var cacheKey = _getCacheKey(props);

                return _extends({}, state, {
                  cacheKey: cacheKey,
                  // change of a key triggers loading state automatically
                  loading: state.loading || state.cacheKey !== cacheKey
                });
              };

              function InnerLoadable(props) {
                var _this;

                _this = _React$Component.call(this, props) || this;
                _this.state = {
                  result: null,
                  error: null,
                  loading: true,
                  cacheKey: _getCacheKey(props)
                };
                invariant(!props.__chunkExtractor || ctor.requireSync, 'SSR requires \`@loadable/babel-plugin\`, please install it'); // Server-side

                if (props.__chunkExtractor) {
                  // This module has been marked with no SSR
                  if (options.ssr === false) {
                    return _assertThisInitialized(_this);
                  } // We run load function, we assume that it won't fail and that it
                  // triggers a synchronous loading of the module


                  ctor.requireAsync(props)[\\"catch\\"](function () {
                    return null;
                  }); // So we can require now the module synchronously

                  _this.loadSync();

                  props.__chunkExtractor.addChunk(ctor.chunkName(props));

                  return _assertThisInitialized(_this);
                } // Client-side with \`isReady\` method present (SSR probably)
                // If module is already loaded, we use a synchronous loading
                // Only perform this synchronous loading if the component has not
                // been marked with no SSR, else we risk hydration mismatches


                if (options.ssr !== false && ( // is ready - was loaded in this session
                ctor.isReady && ctor.isReady(props) || // is ready - was loaded during SSR process
                ctor.chunkName && LOADABLE_SHARED.initialChunks[ctor.chunkName(props)])) {
                  _this.loadSync();
                }

                return _this;
              }

              var _proto = InnerLoadable.prototype;

              _proto.componentDidMount = function componentDidMount() {
                this.mounted = true; // retrieve loading promise from a global cache

                var cachedPromise = this.getCache(); // if promise exists, but rejected - clear cache

                if (cachedPromise && cachedPromise.status === STATUS_REJECTED) {
                  this.setCache();
                } // component might be resolved synchronously in the constructor


                if (this.state.loading) {
                  this.loadAsync();
                }
              };

              _proto.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
                // Component has to be reloaded on cacheKey change
                if (prevState.cacheKey !== this.state.cacheKey) {
                  this.loadAsync();
                }
              };

              _proto.componentWillUnmount = function componentWillUnmount() {
                this.mounted = false;
              };

              _proto.safeSetState = function safeSetState(nextState, callback) {
                if (this.mounted) {
                  this.setState(nextState, callback);
                }
              }
              /**
               * returns a cache key for the current props
               * @returns {Component|string}
               */
              ;

              _proto.getCacheKey = function getCacheKey() {
                return _getCacheKey(this.props);
              }
              /**
               * access the persistent cache
               */
              ;

              _proto.getCache = function getCache() {
                return cache[this.getCacheKey()];
              }
              /**
               * sets the cache value. If called without value sets it as undefined
               */
              ;

              _proto.setCache = function setCache(value) {
                if (value === void 0) {
                  value = undefined;
                }

                cache[this.getCacheKey()] = value;
              };

              _proto.triggerOnLoad = function triggerOnLoad() {
                var _this2 = this;

                if (onLoad) {
                  setTimeout(function () {
                    onLoad(_this2.state.result, _this2.props);
                  });
                }
              }
              /**
               * Synchronously loads component
               * target module is expected to already exists in the module cache
               * or be capable to resolve synchronously (webpack target=node)
               */
              ;

              _proto.loadSync = function loadSync() {
                // load sync is expecting component to be in the \\"loading\\" state already
                // sounds weird, but loading=true is the initial state of InnerLoadable
                if (!this.state.loading) return;

                try {
                  var loadedModule = ctor.requireSync(this.props);
                  var result = resolve(loadedModule, this.props, Loadable);
                  this.state.result = result;
                  this.state.loading = false;
                } catch (error) {
                  console.error('loadable-components: failed to synchronously load component, which expected to be available', {
                    fileName: ctor.resolve(this.props),
                    chunkName: ctor.chunkName(this.props),
                    error: error ? error.message : error
                  });
                  this.state.error = error;
                }
              }
              /**
               * Asynchronously loads a component.
               */
              ;

              _proto.loadAsync = function loadAsync() {
                var _this3 = this;

                var promise = this.resolveAsync();
                promise.then(function (loadedModule) {
                  var result = resolve(loadedModule, _this3.props, Loadable);

                  _this3.safeSetState({
                    result: result,
                    loading: false
                  }, function () {
                    return _this3.triggerOnLoad();
                  });
                })[\\"catch\\"](function (error) {
                  return _this3.safeSetState({
                    error: error,
                    loading: false
                  });
                });
                return promise;
              }
              /**
               * Asynchronously resolves(not loads) a component.
               * Note - this function does not change the state
               */
              ;

              _proto.resolveAsync = function resolveAsync() {
                var _this$props = this.props,
                    __chunkExtractor = _this$props.__chunkExtractor,
                    forwardedRef = _this$props.forwardedRef,
                    props = _objectWithoutPropertiesLoose(_this$props, [\\"__chunkExtractor\\", \\"forwardedRef\\"]);

                return cachedLoad(props);
              };

              _proto.render = function render() {
                var _this$props2 = this.props,
                    forwardedRef = _this$props2.forwardedRef,
                    propFallback = _this$props2.fallback,
                    __chunkExtractor = _this$props2.__chunkExtractor,
                    props = _objectWithoutPropertiesLoose(_this$props2, [\\"forwardedRef\\", \\"fallback\\", \\"__chunkExtractor\\"]);

                var _this$state = this.state,
                    error = _this$state.error,
                    loading = _this$state.loading,
                    result = _this$state.result;

                if (options.suspense) {
                  var cachedPromise = this.getCache() || this.loadAsync();

                  if (cachedPromise.status === STATUS_PENDING) {
                    throw this.loadAsync();
                  }
                }

                if (error) {
                  throw error;
                }

                var fallback = propFallback || options.fallback || null;

                if (loading) {
                  return fallback;
                }

                return _render({
                  fallback: fallback,
                  result: result,
                  options: options,
                  props: _extends({}, props, {
                    ref: forwardedRef
                  })
                });
              };

              return InnerLoadable;
            }(react_default.a.Component);

            var EnhancedInnerLoadable = loadable_esm_withChunkExtractor(InnerLoadable);
            var Loadable = react_default.a.forwardRef(function (props, ref) {
              return react_default.a.createElement(EnhancedInnerLoadable, Object.assign({
                forwardedRef: ref
              }, props));
            });
            Loadable.displayName = 'Loadable'; // In future, preload could use \`<link rel=\\"preload\\">\`

            Loadable.preload = function (props) {
              Loadable.load(props);
            };

            Loadable.load = function (props) {
              return cachedLoad(props);
            };

            return Loadable;
          }

          function lazy(ctor, options) {
            return loadable(ctor, _extends({}, options, {
              suspense: true
            }));
          }

          return {
            loadable: loadable,
            lazy: lazy
          };
        }

        function loadable_esm_defaultResolveComponent(loadedModule) {
          // eslint-disable-next-line no-underscore-dangle
          return loadedModule.__esModule ? loadedModule[\\"default\\"] : loadedModule[\\"default\\"] || loadedModule;
        }
        /* eslint-disable no-use-before-define, react/no-multi-comp */


        var _createLoadable =
        /*#__PURE__*/
        createLoadable({
          defaultResolveComponent: loadable_esm_defaultResolveComponent,
          render: function render(_ref) {
            var Component = _ref.result,
                props = _ref.props;
            return react_default.a.createElement(Component, props);
          }
        }),
            loadable_esm_loadable = _createLoadable.loadable,
            loadable_esm_lazy = _createLoadable.lazy;
        /* eslint-disable no-use-before-define, react/no-multi-comp */


        var _createLoadable$1 =
        /*#__PURE__*/
        createLoadable({
          onLoad: function onLoad(result, props) {
            if (result && props.forwardedRef) {
              if (typeof props.forwardedRef === 'function') {
                props.forwardedRef(result);
              } else {
                props.forwardedRef.current = result;
              }
            }
          },
          render: function render(_ref) {
            var result = _ref.result,
                props = _ref.props;

            if (props.children) {
              return props.children(result);
            }

            return null;
          }
        }),
            loadable$1 = _createLoadable$1.loadable,
            lazy$1 = _createLoadable$1.lazy;
        /* eslint-disable no-underscore-dangle, camelcase */


        var BROWSER = typeof window !== 'undefined';

        function loadableReady(done, _temp) {
          if (done === void 0) {
            done = function done() {};
          }

          var _ref = _temp === void 0 ? {} : _temp,
              _ref$namespace = _ref.namespace,
              namespace = _ref$namespace === void 0 ? '' : _ref$namespace,
              _ref$chunkLoadingGlob = _ref.chunkLoadingGlobal,
              chunkLoadingGlobal = _ref$chunkLoadingGlob === void 0 ? '__LOADABLE_LOADED_CHUNKS__' : _ref$chunkLoadingGlob;

          if (!BROWSER) {
            warn('\`loadableReady()\` must be called in browser only');
            done();
            return Promise.resolve();
          }

          var requiredChunks = null;

          if (BROWSER) {
            var id = getRequiredChunkKey(namespace);
            var dataElement = document.getElementById(id);

            if (dataElement) {
              requiredChunks = JSON.parse(dataElement.textContent);
              var extElement = document.getElementById(id + \\"_ext\\");

              if (extElement) {
                var _JSON$parse = JSON.parse(extElement.textContent),
                    namedChunks = _JSON$parse.namedChunks;

                namedChunks.forEach(function (chunkName) {
                  LOADABLE_SHARED.initialChunks[chunkName] = true;
                });
              } else {
                // version mismatch
                throw new Error('loadable-component: @loadable/server does not match @loadable/component');
              }
            }
          }

          if (!requiredChunks) {
            warn('\`loadableReady()\` requires state, please use \`getScriptTags\` or \`getScriptElements\` server-side');
            done();
            return Promise.resolve();
          }

          var resolved = false;
          return new Promise(function (resolve) {
            window[chunkLoadingGlobal] = window[chunkLoadingGlobal] || [];
            var loadedChunks = window[chunkLoadingGlobal];
            var originalPush = loadedChunks.push.bind(loadedChunks);

            function checkReadyState() {
              if (requiredChunks.every(function (chunk) {
                return loadedChunks.some(function (_ref2) {
                  var chunks = _ref2[0];
                  return chunks.indexOf(chunk) > -1;
                });
              })) {
                if (!resolved) {
                  resolved = true;
                  resolve();
                }
              }
            }

            loadedChunks.push = function () {
              originalPush.apply(void 0, arguments);
              checkReadyState();
            };

            checkReadyState();
          }).then(done);
        }
        /* eslint-disable no-underscore-dangle */


        var loadable$2 = loadable_esm_loadable;
        loadable$2.lib = loadable$1;
        var lazy$2 = loadable_esm_lazy;
        lazy$2.lib = lazy$1;
        var __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sharedInternals;
        /* harmony default export */ var loadable_esm = __webpack_exports__[\\"a\\"] = (loadable$2);


        /***/ }),
        /* 4 */,
        /* 5 */
        /***/ (function(module, __webpack_exports__, __webpack_require__) {

        \\"use strict\\";
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
        /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
        /* harmony import */ var _loadable_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);


        var A = Object(_loadable_component__WEBPACK_IMPORTED_MODULE_1__[/* default */ \\"a\\"])({
          resolved: {},
          chunkName: function chunkName() {
            return \\"A\\";
          },
          isReady: function isReady(props) {
            var key = this.resolve(props);

            if (this.resolved[key] !== true) {
              return false;
            }

            if (true) {
              return !!__webpack_require__.m[key];
            }

            return false;
          },
          importAsync: function importAsync() {
            return __webpack_require__.e(/* import() | A */ 0).then(__webpack_require__.bind(null, 4));
          },
          requireAsync: function requireAsync(props) {
            var _this = this;

            var key = this.resolve(props);
            this.resolved[key] = false;
            return this.importAsync(props).then(function (resolved) {
              _this.resolved[key] = true;
              return resolved;
            });
          },
          requireSync: function requireSync(props) {
            var id = this.resolve(props);

            if (true) {
              return __webpack_require__(id);
            }

            return eval('module.require')(id);
          },
          resolve: function resolve() {
            if (true) {
              return /*require.resolve*/(4);
            }

            return eval('require.resolve')(\\"./A.js\\");
          }
        });

        /***/ }),
        /* 6 */
        /***/ (function(module, exports, __webpack_require__) {

        \\"use strict\\";
        /** @license React v16.12.0
         * react.production.min.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var h=__webpack_require__(7),n=\\"function\\"===typeof Symbol&&Symbol.for,p=n?Symbol.for(\\"react.element\\"):60103,q=n?Symbol.for(\\"react.portal\\"):60106,r=n?Symbol.for(\\"react.fragment\\"):60107,t=n?Symbol.for(\\"react.strict_mode\\"):60108,u=n?Symbol.for(\\"react.profiler\\"):60114,v=n?Symbol.for(\\"react.provider\\"):60109,w=n?Symbol.for(\\"react.context\\"):60110,x=n?Symbol.for(\\"react.forward_ref\\"):60112,y=n?Symbol.for(\\"react.suspense\\"):60113;n&&Symbol.for(\\"react.suspense_list\\");
        var z=n?Symbol.for(\\"react.memo\\"):60115,aa=n?Symbol.for(\\"react.lazy\\"):60116;n&&Symbol.for(\\"react.fundamental\\");n&&Symbol.for(\\"react.responder\\");n&&Symbol.for(\\"react.scope\\");var A=\\"function\\"===typeof Symbol&&Symbol.iterator;
        function B(a){for(var b=\\"https://reactjs.org/docs/error-decoder.html?invariant=\\"+a,c=1;c<arguments.length;c++)b+=\\"&args[]=\\"+encodeURIComponent(arguments[c]);return\\"Minified React error #\\"+a+\\"; visit \\"+b+\\" for the full message or use the non-minified dev environment for full errors and additional helpful warnings.\\"}var C={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},D={};
        function E(a,b,c){this.props=a;this.context=b;this.refs=D;this.updater=c||C}E.prototype.isReactComponent={};E.prototype.setState=function(a,b){if(\\"object\\"!==typeof a&&\\"function\\"!==typeof a&&null!=a)throw Error(B(85));this.updater.enqueueSetState(this,a,b,\\"setState\\")};E.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,\\"forceUpdate\\")};function F(){}F.prototype=E.prototype;function G(a,b,c){this.props=a;this.context=b;this.refs=D;this.updater=c||C}var H=G.prototype=new F;
        H.constructor=G;h(H,E.prototype);H.isPureReactComponent=!0;var I={current:null},J={current:null},K=Object.prototype.hasOwnProperty,L={key:!0,ref:!0,__self:!0,__source:!0};
        function M(a,b,c){var e,d={},g=null,l=null;if(null!=b)for(e in void 0!==b.ref&&(l=b.ref),void 0!==b.key&&(g=\\"\\"+b.key),b)K.call(b,e)&&!L.hasOwnProperty(e)&&(d[e]=b[e]);var f=arguments.length-2;if(1===f)d.children=c;else if(1<f){for(var k=Array(f),m=0;m<f;m++)k[m]=arguments[m+2];d.children=k}if(a&&a.defaultProps)for(e in f=a.defaultProps,f)void 0===d[e]&&(d[e]=f[e]);return{$$typeof:p,type:a,key:g,ref:l,props:d,_owner:J.current}}
        function ba(a,b){return{$$typeof:p,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function N(a){return\\"object\\"===typeof a&&null!==a&&a.$$typeof===p}function escape(a){var b={\\"=\\":\\"=0\\",\\":\\":\\"=2\\"};return\\"$\\"+(\\"\\"+a).replace(/[=:]/g,function(a){return b[a]})}var O=/\\\\/+/g,P=[];function Q(a,b,c,e){if(P.length){var d=P.pop();d.result=a;d.keyPrefix=b;d.func=c;d.context=e;d.count=0;return d}return{result:a,keyPrefix:b,func:c,context:e,count:0}}
        function R(a){a.result=null;a.keyPrefix=null;a.func=null;a.context=null;a.count=0;10>P.length&&P.push(a)}
        function S(a,b,c,e){var d=typeof a;if(\\"undefined\\"===d||\\"boolean\\"===d)a=null;var g=!1;if(null===a)g=!0;else switch(d){case \\"string\\":case \\"number\\":g=!0;break;case \\"object\\":switch(a.$$typeof){case p:case q:g=!0}}if(g)return c(e,a,\\"\\"===b?\\".\\"+T(a,0):b),1;g=0;b=\\"\\"===b?\\".\\":b+\\":\\";if(Array.isArray(a))for(var l=0;l<a.length;l++){d=a[l];var f=b+T(d,l);g+=S(d,f,c,e)}else if(null===a||\\"object\\"!==typeof a?f=null:(f=A&&a[A]||a[\\"@@iterator\\"],f=\\"function\\"===typeof f?f:null),\\"function\\"===typeof f)for(a=f.call(a),l=
        0;!(d=a.next()).done;)d=d.value,f=b+T(d,l++),g+=S(d,f,c,e);else if(\\"object\\"===d)throw c=\\"\\"+a,Error(B(31,\\"[object Object]\\"===c?\\"object with keys {\\"+Object.keys(a).join(\\", \\")+\\"}\\":c,\\"\\"));return g}function U(a,b,c){return null==a?0:S(a,\\"\\",b,c)}function T(a,b){return\\"object\\"===typeof a&&null!==a&&null!=a.key?escape(a.key):b.toString(36)}function ca(a,b){a.func.call(a.context,b,a.count++)}
        function da(a,b,c){var e=a.result,d=a.keyPrefix;a=a.func.call(a.context,b,a.count++);Array.isArray(a)?V(a,e,c,function(a){return a}):null!=a&&(N(a)&&(a=ba(a,d+(!a.key||b&&b.key===a.key?\\"\\":(\\"\\"+a.key).replace(O,\\"$&/\\")+\\"/\\")+c)),e.push(a))}function V(a,b,c,e,d){var g=\\"\\";null!=c&&(g=(\\"\\"+c).replace(O,\\"$&/\\")+\\"/\\");b=Q(b,g,e,d);U(a,da,b);R(b)}function W(){var a=I.current;if(null===a)throw Error(B(321));return a}
        var X={Children:{map:function(a,b,c){if(null==a)return a;var e=[];V(a,e,null,b,c);return e},forEach:function(a,b,c){if(null==a)return a;b=Q(null,null,b,c);U(a,ca,b);R(b)},count:function(a){return U(a,function(){return null},null)},toArray:function(a){var b=[];V(a,b,null,function(a){return a});return b},only:function(a){if(!N(a))throw Error(B(143));return a}},createRef:function(){return{current:null}},Component:E,PureComponent:G,createContext:function(a,b){void 0===b&&(b=null);a={$$typeof:w,_calculateChangedBits:b,
        _currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null};a.Provider={$$typeof:v,_context:a};return a.Consumer=a},forwardRef:function(a){return{$$typeof:x,render:a}},lazy:function(a){return{$$typeof:aa,_ctor:a,_status:-1,_result:null}},memo:function(a,b){return{$$typeof:z,type:a,compare:void 0===b?null:b}},useCallback:function(a,b){return W().useCallback(a,b)},useContext:function(a,b){return W().useContext(a,b)},useEffect:function(a,b){return W().useEffect(a,b)},useImperativeHandle:function(a,
        b,c){return W().useImperativeHandle(a,b,c)},useDebugValue:function(){},useLayoutEffect:function(a,b){return W().useLayoutEffect(a,b)},useMemo:function(a,b){return W().useMemo(a,b)},useReducer:function(a,b,c){return W().useReducer(a,b,c)},useRef:function(a){return W().useRef(a)},useState:function(a){return W().useState(a)},Fragment:r,Profiler:u,StrictMode:t,Suspense:y,createElement:M,cloneElement:function(a,b,c){if(null===a||void 0===a)throw Error(B(267,a));var e=h({},a.props),d=a.key,g=a.ref,l=a._owner;
        if(null!=b){void 0!==b.ref&&(g=b.ref,l=J.current);void 0!==b.key&&(d=\\"\\"+b.key);if(a.type&&a.type.defaultProps)var f=a.type.defaultProps;for(k in b)K.call(b,k)&&!L.hasOwnProperty(k)&&(e[k]=void 0===b[k]&&void 0!==f?f[k]:b[k])}var k=arguments.length-2;if(1===k)e.children=c;else if(1<k){f=Array(k);for(var m=0;m<k;m++)f[m]=arguments[m+2];e.children=f}return{$$typeof:p,type:a.type,key:d,ref:g,props:e,_owner:l}},createFactory:function(a){var b=M.bind(null,a);b.type=a;return b},isValidElement:N,version:\\"16.12.0\\",
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentDispatcher:I,ReactCurrentBatchConfig:{suspense:null},ReactCurrentOwner:J,IsSomeRendererActing:{current:!1},assign:h}},Y={default:X},Z=Y&&X||Y;module.exports=Z.default||Z;


        /***/ }),
        /* 7 */
        /***/ (function(module, exports, __webpack_require__) {

        \\"use strict\\";
        /*
        object-assign
        (c) Sindre Sorhus
        @license MIT
        */


        /* eslint-disable no-unused-vars */
        var getOwnPropertySymbols = Object.getOwnPropertySymbols;
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var propIsEnumerable = Object.prototype.propertyIsEnumerable;

        function toObject(val) {
        	if (val === null || val === undefined) {
        		throw new TypeError('Object.assign cannot be called with null or undefined');
        	}

        	return Object(val);
        }

        function shouldUseNative() {
        	try {
        		if (!Object.assign) {
        			return false;
        		}

        		// Detect buggy property enumeration order in older V8 versions.

        		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
        		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
        		test1[5] = 'de';
        		if (Object.getOwnPropertyNames(test1)[0] === '5') {
        			return false;
        		}

        		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
        		var test2 = {};
        		for (var i = 0; i < 10; i++) {
        			test2['_' + String.fromCharCode(i)] = i;
        		}
        		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
        			return test2[n];
        		});
        		if (order2.join('') !== '0123456789') {
        			return false;
        		}

        		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
        		var test3 = {};
        		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
        			test3[letter] = letter;
        		});
        		if (Object.keys(Object.assign({}, test3)).join('') !==
        				'abcdefghijklmnopqrst') {
        			return false;
        		}

        		return true;
        	} catch (err) {
        		// We don't expect any of the above to throw, but better to be safe.
        		return false;
        	}
        }

        module.exports = shouldUseNative() ? Object.assign : function (target, source) {
        	var from;
        	var to = toObject(target);
        	var symbols;

        	for (var s = 1; s < arguments.length; s++) {
        		from = Object(arguments[s]);

        		for (var key in from) {
        			if (hasOwnProperty.call(from, key)) {
        				to[key] = from[key];
        			}
        		}

        		if (getOwnPropertySymbols) {
        			symbols = getOwnPropertySymbols(from);
        			for (var i = 0; i < symbols.length; i++) {
        				if (propIsEnumerable.call(from, symbols[i])) {
        					to[symbols[i]] = from[symbols[i]];
        				}
        			}
        		}
        	}

        	return to;
        };


        /***/ }),
        /* 8 */
        /***/ (function(module, exports, __webpack_require__) {

        \\"use strict\\";
        /** @license React v16.12.0
         * react-is.production.min.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        Object.defineProperty(exports,\\"__esModule\\",{value:!0});
        var b=\\"function\\"===typeof Symbol&&Symbol.for,c=b?Symbol.for(\\"react.element\\"):60103,d=b?Symbol.for(\\"react.portal\\"):60106,e=b?Symbol.for(\\"react.fragment\\"):60107,f=b?Symbol.for(\\"react.strict_mode\\"):60108,g=b?Symbol.for(\\"react.profiler\\"):60114,h=b?Symbol.for(\\"react.provider\\"):60109,k=b?Symbol.for(\\"react.context\\"):60110,l=b?Symbol.for(\\"react.async_mode\\"):60111,m=b?Symbol.for(\\"react.concurrent_mode\\"):60111,n=b?Symbol.for(\\"react.forward_ref\\"):60112,p=b?Symbol.for(\\"react.suspense\\"):60113,q=b?Symbol.for(\\"react.suspense_list\\"):
        60120,r=b?Symbol.for(\\"react.memo\\"):60115,t=b?Symbol.for(\\"react.lazy\\"):60116,v=b?Symbol.for(\\"react.fundamental\\"):60117,w=b?Symbol.for(\\"react.responder\\"):60118,x=b?Symbol.for(\\"react.scope\\"):60119;function y(a){if(\\"object\\"===typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function z(a){return y(a)===m}
        exports.typeOf=y;exports.AsyncMode=l;exports.ConcurrentMode=m;exports.ContextConsumer=k;exports.ContextProvider=h;exports.Element=c;exports.ForwardRef=n;exports.Fragment=e;exports.Lazy=t;exports.Memo=r;exports.Portal=d;exports.Profiler=g;exports.StrictMode=f;exports.Suspense=p;
        exports.isValidElementType=function(a){return\\"string\\"===typeof a||\\"function\\"===typeof a||a===e||a===m||a===g||a===f||a===p||a===q||\\"object\\"===typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===v||a.$$typeof===w||a.$$typeof===x)};exports.isAsyncMode=function(a){return z(a)||y(a)===l};exports.isConcurrentMode=z;exports.isContextConsumer=function(a){return y(a)===k};exports.isContextProvider=function(a){return y(a)===h};
        exports.isElement=function(a){return\\"object\\"===typeof a&&null!==a&&a.$$typeof===c};exports.isForwardRef=function(a){return y(a)===n};exports.isFragment=function(a){return y(a)===e};exports.isLazy=function(a){return y(a)===t};exports.isMemo=function(a){return y(a)===r};exports.isPortal=function(a){return y(a)===d};exports.isProfiler=function(a){return y(a)===g};exports.isStrictMode=function(a){return y(a)===f};exports.isSuspense=function(a){return y(a)===p};


        /***/ })
        /******/ ]);"
      `)
      done()
    })
  })
})
