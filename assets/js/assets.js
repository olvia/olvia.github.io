/**
 * Isotope v1.5.25
 * An exquisite jQuery plugin for magical layouts
 * http://isotope.metafizzy.co
 *
 * Commercial use requires one-time license fee
 * http://metafizzy.co/#licenses
 *
 * Copyright 2012 David DeSandro / Metafizzy
 */

/*jshint asi: true, browser: true, curly: true, eqeqeq: true, forin: false, immed: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: false */

(function( window, $, undefined ){

  'use strict';

  // get global vars
  var document = window.document;
  var Modernizr = window.Modernizr;

  // helper function
  var capitalize = function( str ) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // ========================= getStyleProperty by kangax ===============================
  // http://perfectionkills.com/feature-testing-css-properties/

  var prefixes = 'Moz Webkit O Ms'.split(' ');

  var getStyleProperty = function( propName ) {
    var style = document.documentElement.style,
        prefixed;

    // test standard property first
    if ( typeof style[propName] === 'string' ) {
      return propName;
    }

    // capitalize
    propName = capitalize( propName );

    // test vendor specific properties
    for ( var i=0, len = prefixes.length; i < len; i++ ) {
      prefixed = prefixes[i] + propName;
      if ( typeof style[ prefixed ] === 'string' ) {
        return prefixed;
      }
    }
  };

  var transformProp = getStyleProperty('transform'),
      transitionProp = getStyleProperty('transitionProperty');


  // ========================= miniModernizr ===============================
  // <3<3<3 and thanks to Faruk and Paul for doing the heavy lifting

  /*!
   * Modernizr v1.6ish: miniModernizr for Isotope
   * http://www.modernizr.com
   *
   * Developed by:
   * - Faruk Ates  http://farukat.es/
   * - Paul Irish  http://paulirish.com/
   *
   * Copyright (c) 2009-2010
   * Dual-licensed under the BSD or MIT licenses.
   * http://www.modernizr.com/license/
   */

  /*
   * This version whittles down the script just to check support for
   * CSS transitions, transforms, and 3D transforms.
  */

  var tests = {
    csstransforms: function() {
      return !!transformProp;
    },

    csstransforms3d: function() {
      var test = !!getStyleProperty('perspective');
      // double check for Chrome's false positive
      if ( test ) {
        var vendorCSSPrefixes = ' -o- -moz- -ms- -webkit- -khtml- '.split(' '),
            mediaQuery = '@media (' + vendorCSSPrefixes.join('transform-3d),(') + 'modernizr)',
            $style = $('<style>' + mediaQuery + '{#modernizr{height:3px}}' + '</style>')
                        .appendTo('head'),
            $div = $('<div id="modernizr" />').appendTo('html');

        test = $div.height() === 3;

        $div.remove();
        $style.remove();
      }
      return test;
    },

    csstransitions: function() {
      return !!transitionProp;
    }
  };

  var testName;

  if ( Modernizr ) {
    // if there's a previous Modernzir, check if there are necessary tests
    for ( testName in tests) {
      if ( !Modernizr.hasOwnProperty( testName ) ) {
        // if test hasn't been run, use addTest to run it
        Modernizr.addTest( testName, tests[ testName ] );
      }
    }
  } else {
    // or create new mini Modernizr that just has the 3 tests
    Modernizr = window.Modernizr = {
      _version : '1.6ish: miniModernizr for Isotope'
    };

    var classes = ' ';
    var result;

    // Run through tests
    for ( testName in tests) {
      result = tests[ testName ]();
      Modernizr[ testName ] = result;
      classes += ' ' + ( result ?  '' : 'no-' ) + testName;
    }

    // Add the new classes to the <html> element.
    $('html').addClass( classes );
  }


  // ========================= isoTransform ===============================

  /**
   *  provides hooks for .css({ scale: value, translate: [x, y] })
   *  Progressively enhanced CSS transforms
   *  Uses hardware accelerated 3D transforms for Safari
   *  or falls back to 2D transforms.
   */

  if ( Modernizr.csstransforms ) {

        // i.e. transformFnNotations.scale(0.5) >> 'scale3d( 0.5, 0.5, 1)'
    var transformFnNotations = Modernizr.csstransforms3d ?
      { // 3D transform functions
        translate : function ( position ) {
          return 'translate3d(' + position[0] + 'px, ' + position[1] + 'px, 0) ';
        },
        scale : function ( scale ) {
          return 'scale3d(' + scale + ', ' + scale + ', 1) ';
        }
      } :
      { // 2D transform functions
        translate : function ( position ) {
          return 'translate(' + position[0] + 'px, ' + position[1] + 'px) ';
        },
        scale : function ( scale ) {
          return 'scale(' + scale + ') ';
        }
      }
    ;

    var setIsoTransform = function ( elem, name, value ) {
          // unpack current transform data
      var data =  $.data( elem, 'isoTransform' ) || {},
          newData = {},
          fnName,
          transformObj = {},
          transformValue;

      // i.e. newData.scale = 0.5
      newData[ name ] = value;
      // extend new value over current data
      $.extend( data, newData );

      for ( fnName in data ) {
        transformValue = data[ fnName ];
        transformObj[ fnName ] = transformFnNotations[ fnName ]( transformValue );
      }

      // get proper order
      // ideally, we could loop through this give an array, but since we only have
      // a couple transforms we're keeping track of, we'll do it like so
      var translateFn = transformObj.translate || '',
          scaleFn = transformObj.scale || '',
          // sorting so translate always comes first
          valueFns = translateFn + scaleFn;

      // set data back in elem
      $.data( elem, 'isoTransform', data );

      // set name to vendor specific property
      elem.style[ transformProp ] = valueFns;
    };

    // ==================== scale ===================

    $.cssNumber.scale = true;

    $.cssHooks.scale = {
      set: function( elem, value ) {
        // uncomment this bit if you want to properly parse strings
        // if ( typeof value === 'string' ) {
        //   value = parseFloat( value );
        // }
        setIsoTransform( elem, 'scale', value );
      },
      get: function( elem, computed ) {
        var transform = $.data( elem, 'isoTransform' );
        return transform && transform.scale ? transform.scale : 1;
      }
    };

    $.fx.step.scale = function( fx ) {
      $.cssHooks.scale.set( fx.elem, fx.now+fx.unit );
    };


    // ==================== translate ===================

    $.cssNumber.translate = true;

    $.cssHooks.translate = {
      set: function( elem, value ) {

        // uncomment this bit if you want to properly parse strings
        // if ( typeof value === 'string' ) {
        //   value = value.split(' ');
        // }
        //
        // var i, val;
        // for ( i = 0; i < 2; i++ ) {
        //   val = value[i];
        //   if ( typeof val === 'string' ) {
        //     val = parseInt( val );
        //   }
        // }

        setIsoTransform( elem, 'translate', value );
      },

      get: function( elem, computed ) {
        var transform = $.data( elem, 'isoTransform' );
        return transform && transform.translate ? transform.translate : [ 0, 0 ];
      }
    };

  }

  // ========================= get transition-end event ===============================
  var transitionEndEvent, transitionDurProp;

  if ( Modernizr.csstransitions ) {
    transitionEndEvent = {
      WebkitTransitionProperty: 'webkitTransitionEnd',  // webkit
      MozTransitionProperty: 'transitionend',
      OTransitionProperty: 'oTransitionEnd otransitionend',
      transitionProperty: 'transitionend'
    }[ transitionProp ];

    transitionDurProp = getStyleProperty('transitionDuration');
  }

  // ========================= smartresize ===============================

  /*
   * smartresize: debounced resize event for jQuery
   *
   * latest version and complete README available on Github:
   * https://github.com/louisremi/jquery.smartresize.js
   *
   * Copyright 2011 @louis_remi
   * Licensed under the MIT license.
   */

  var $event = $.event,
      dispatchMethod = $.event.handle ? 'handle' : 'dispatch',
      resizeTimeout;

  $event.special.smartresize = {
    setup: function() {
      $(this).bind( "resize", $event.special.smartresize.handler );
    },
    teardown: function() {
      $(this).unbind( "resize", $event.special.smartresize.handler );
    },
    handler: function( event, execAsap ) {
      // Save the context
      var context = this,
          args = arguments;

      // set correct event type
      event.type = "smartresize";

      if ( resizeTimeout ) { clearTimeout( resizeTimeout ); }
      resizeTimeout = setTimeout(function() {
        $event[ dispatchMethod ].apply( context, args );
      }, execAsap === "execAsap"? 0 : 100 );
    }
  };

  $.fn.smartresize = function( fn ) {
    return fn ? this.bind( "smartresize", fn ) : this.trigger( "smartresize", ["execAsap"] );
  };



// ========================= Isotope ===============================


  // our "Widget" object constructor
  $.Isotope = function( options, element, callback ){
    this.element = $( element );

    this._create( options );
    this._init( callback );
  };

  // styles of container element we want to keep track of
  var isoContainerStyles = [ 'width', 'height' ];

  var $window = $(window);

  $.Isotope.settings = {
    resizable: true,
    layoutMode : 'masonry',
    containerClass : 'isotope',
    itemClass : 'isotope-item',
    hiddenClass : 'isotope-hidden',
    hiddenStyle: { opacity: 0, scale: 0.001 },
    visibleStyle: { opacity: 1, scale: 1 },
    containerStyle: {
      position: 'relative',
      overflow: 'hidden'
    },
    animationEngine: 'best-available',
    animationOptions: {
      queue: false,
      duration: 800
    },
    sortBy : 'original-order',
    sortAscending : true,
    resizesContainer : true,
    transformsEnabled: true,
    itemPositionDataEnabled: false
  };

  $.Isotope.prototype = {

    // sets up widget
    _create : function( options ) {

      this.options = $.extend( {}, $.Isotope.settings, options );

      this.styleQueue = [];
      this.elemCount = 0;

      // get original styles in case we re-apply them in .destroy()
      var elemStyle = this.element[0].style;
      this.originalStyle = {};
      // keep track of container styles
      var containerStyles = isoContainerStyles.slice(0);
      for ( var prop in this.options.containerStyle ) {
        containerStyles.push( prop );
      }
      for ( var i=0, len = containerStyles.length; i < len; i++ ) {
        prop = containerStyles[i];
        this.originalStyle[ prop ] = elemStyle[ prop ] || '';
      }
      // apply container style from options
      this.element.css( this.options.containerStyle );

      this._updateAnimationEngine();
      this._updateUsingTransforms();

      // sorting
      var originalOrderSorter = {
        'original-order' : function( $elem, instance ) {
          instance.elemCount ++;
          return instance.elemCount;
        },
        random : function() {
          return Math.random();
        }
      };

      this.options.getSortData = $.extend( this.options.getSortData, originalOrderSorter );

      // need to get atoms
      this.reloadItems();

      // get top left position of where the bricks should be
      this.offset = {
        left: parseInt( ( this.element.css('padding-left') || 0 ), 10 ),
        top: parseInt( ( this.element.css('padding-top') || 0 ), 10 )
      };

      // add isotope class first time around
      var instance = this;
      setTimeout( function() {
        instance.element.addClass( instance.options.containerClass );
      }, 0 );

      // bind resize method
      if ( this.options.resizable ) {
        $window.bind( 'smartresize.isotope', function() {
          instance.resize();
        });
      }

      // dismiss all click events from hidden events
      this.element.delegate( '.' + this.options.hiddenClass, 'click', function(){
        return false;
      });

    },

    _getAtoms : function( $elems ) {
      var selector = this.options.itemSelector,
          // filter & find
          $atoms = selector ? $elems.filter( selector ).add( $elems.find( selector ) ) : $elems,
          // base style for atoms
          atomStyle = { position: 'absolute' };

      // filter out text nodes
      $atoms = $atoms.filter( function( i, atom ) {
        return atom.nodeType === 1;
      });

      if ( this.usingTransforms ) {
        atomStyle.left = 0;
        atomStyle.top = 0;
      }

      $atoms.css( atomStyle ).addClass( this.options.itemClass );

      this.updateSortData( $atoms, true );

      return $atoms;
    },

    // _init fires when your instance is first created
    // (from the constructor above), and when you
    // attempt to initialize the widget again (by the bridge)
    // after it has already been initialized.
    _init : function( callback ) {

      this.$filteredAtoms = this._filter( this.$allAtoms );
      this._sort();
      this.reLayout( callback );

    },

    option : function( opts ){
      // change options AFTER initialization:
      // signature: $('#foo').bar({ cool:false });
      if ( $.isPlainObject( opts ) ){
        this.options = $.extend( true, this.options, opts );

        // trigger _updateOptionName if it exists
        var updateOptionFn;
        for ( var optionName in opts ) {
          updateOptionFn = '_update' + capitalize( optionName );
          if ( this[ updateOptionFn ] ) {
            this[ updateOptionFn ]();
          }
        }
      }
    },

    // ====================== updaters ====================== //
    // kind of like setters

    _updateAnimationEngine : function() {
      var animationEngine = this.options.animationEngine.toLowerCase().replace( /[ _\-]/g, '');
      var isUsingJQueryAnimation;
      // set applyStyleFnName
      switch ( animationEngine ) {
        case 'css' :
        case 'none' :
          isUsingJQueryAnimation = false;
          break;
        case 'jquery' :
          isUsingJQueryAnimation = true;
          break;
        default : // best available
          isUsingJQueryAnimation = !Modernizr.csstransitions;
      }
      this.isUsingJQueryAnimation = isUsingJQueryAnimation;
      this._updateUsingTransforms();
    },

    _updateTransformsEnabled : function() {
      this._updateUsingTransforms();
    },

    _updateUsingTransforms : function() {
      var usingTransforms = this.usingTransforms = this.options.transformsEnabled &&
        Modernizr.csstransforms && Modernizr.csstransitions && !this.isUsingJQueryAnimation;

      // prevent scales when transforms are disabled
      if ( !usingTransforms ) {
        delete this.options.hiddenStyle.scale;
        delete this.options.visibleStyle.scale;
      }

      this.getPositionStyles = usingTransforms ? this._translate : this._positionAbs;
    },


    // ====================== Filtering ======================

    _filter : function( $atoms ) {
      var filter = this.options.filter === '' ? '*' : this.options.filter;

      if ( !filter ) {
        return $atoms;
      }

      var hiddenClass    = this.options.hiddenClass,
          hiddenSelector = '.' + hiddenClass,
          $hiddenAtoms   = $atoms.filter( hiddenSelector ),
          $atomsToShow   = $hiddenAtoms;

      if ( filter !== '*' ) {
        $atomsToShow = $hiddenAtoms.filter( filter );
        var $atomsToHide = $atoms.not( hiddenSelector ).not( filter ).addClass( hiddenClass );
        this.styleQueue.push({ $el: $atomsToHide, style: this.options.hiddenStyle });
      }

      this.styleQueue.push({ $el: $atomsToShow, style: this.options.visibleStyle });
      $atomsToShow.removeClass( hiddenClass );

      return $atoms.filter( filter );
    },

    // ====================== Sorting ======================

    updateSortData : function( $atoms, isIncrementingElemCount ) {
      var instance = this,
          getSortData = this.options.getSortData,
          $this, sortData;
      $atoms.each(function(){
        $this = $(this);
        sortData = {};
        // get value for sort data based on fn( $elem ) passed in
        for ( var key in getSortData ) {
          if ( !isIncrementingElemCount && key === 'original-order' ) {
            // keep original order original
            sortData[ key ] = $.data( this, 'isotope-sort-data' )[ key ];
          } else {
            sortData[ key ] = getSortData[ key ]( $this, instance );
          }
        }
        // apply sort data to element
        $.data( this, 'isotope-sort-data', sortData );
      });
    },

    // used on all the filtered atoms
    _sort : function() {

      var sortBy = this.options.sortBy,
          getSorter = this._getSorter,
          sortDir = this.options.sortAscending ? 1 : -1,
          sortFn = function( alpha, beta ) {
            var a = getSorter( alpha, sortBy ),
                b = getSorter( beta, sortBy );
            // fall back to original order if data matches
            if ( a === b && sortBy !== 'original-order') {
              a = getSorter( alpha, 'original-order' );
              b = getSorter( beta, 'original-order' );
            }
            return ( ( a > b ) ? 1 : ( a < b ) ? -1 : 0 ) * sortDir;
          };

      this.$filteredAtoms.sort( sortFn );
    },

    _getSorter : function( elem, sortBy ) {
      return $.data( elem, 'isotope-sort-data' )[ sortBy ];
    },

    // ====================== Layout Helpers ======================

    _translate : function( x, y ) {
      return { translate : [ x, y ] };
    },

    _positionAbs : function( x, y ) {
      return { left: x, top: y };
    },

    _pushPosition : function( $elem, x, y ) {
      x = Math.round( x + this.offset.left );
      y = Math.round( y + this.offset.top );
      var position = this.getPositionStyles( x, y );
      this.styleQueue.push({ $el: $elem, style: position });
      if ( this.options.itemPositionDataEnabled ) {
        $elem.data('isotope-item-position', {x: x, y: y} );
      }
    },


    // ====================== General Layout ======================

    // used on collection of atoms (should be filtered, and sorted before )
    // accepts atoms-to-be-laid-out to start with
    layout : function( $elems, callback ) {

      var layoutMode = this.options.layoutMode;

      // layout logic
      this[ '_' +  layoutMode + 'Layout' ]( $elems );

      // set the size of the container
      if ( this.options.resizesContainer ) {
        var containerStyle = this[ '_' +  layoutMode + 'GetContainerSize' ]();
        this.styleQueue.push({ $el: this.element, style: containerStyle });
      }

      this._processStyleQueue( $elems, callback );

      this.isLaidOut = true;
    },

    _processStyleQueue : function( $elems, callback ) {
      // are we animating the layout arrangement?
      // use plugin-ish syntax for css or animate
      var styleFn = !this.isLaidOut ? 'css' : (
            this.isUsingJQueryAnimation ? 'animate' : 'css'
          ),
          animOpts = this.options.animationOptions,
          onLayout = this.options.onLayout,
          objStyleFn, processor,
          triggerCallbackNow, callbackFn;

      // default styleQueue processor, may be overwritten down below
      processor = function( i, obj ) {
        obj.$el[ styleFn ]( obj.style, animOpts );
      };

      if ( this._isInserting && this.isUsingJQueryAnimation ) {
        // if using styleQueue to insert items
        processor = function( i, obj ) {
          // only animate if it not being inserted
          objStyleFn = obj.$el.hasClass('no-transition') ? 'css' : styleFn;
          obj.$el[ objStyleFn ]( obj.style, animOpts );
        };

      } else if ( callback || onLayout || animOpts.complete ) {
        // has callback
        var isCallbackTriggered = false,
            // array of possible callbacks to trigger
            callbacks = [ callback, onLayout, animOpts.complete ],
            instance = this;
        triggerCallbackNow = true;
        // trigger callback only once
        callbackFn = function() {
          if ( isCallbackTriggered ) {
            return;
          }
          var hollaback;
          for (var i=0, len = callbacks.length; i < len; i++) {
            hollaback = callbacks[i];
            if ( typeof hollaback === 'function' ) {
              hollaback.call( instance.element, $elems, instance );
            }
          }
          isCallbackTriggered = true;
        };

        if ( this.isUsingJQueryAnimation && styleFn === 'animate' ) {
          // add callback to animation options
          animOpts.complete = callbackFn;
          triggerCallbackNow = false;

        } else if ( Modernizr.csstransitions ) {
          // detect if first item has transition
          var i = 0,
              firstItem = this.styleQueue[0],
              testElem = firstItem && firstItem.$el,
              styleObj;
          // get first non-empty jQ object
          while ( !testElem || !testElem.length ) {
            styleObj = this.styleQueue[ i++ ];
            // HACK: sometimes styleQueue[i] is undefined
            if ( !styleObj ) {
              return;
            }
            testElem = styleObj.$el;
          }
          // get transition duration of the first element in that object
          // yeah, this is inexact
          var duration = parseFloat( getComputedStyle( testElem[0] )[ transitionDurProp ] );
          if ( duration > 0 ) {
            processor = function( i, obj ) {
              obj.$el[ styleFn ]( obj.style, animOpts )
                // trigger callback at transition end
                .one( transitionEndEvent, callbackFn );
            };
            triggerCallbackNow = false;
          }
        }
      }

      // process styleQueue
      $.each( this.styleQueue, processor );

      if ( triggerCallbackNow ) {
        callbackFn();
      }

      // clear out queue for next time
      this.styleQueue = [];
    },


    resize : function() {
      if ( this[ '_' + this.options.layoutMode + 'ResizeChanged' ]() ) {
        this.reLayout();
      }
    },


    reLayout : function( callback ) {

      this[ '_' +  this.options.layoutMode + 'Reset' ]();
      this.layout( this.$filteredAtoms, callback );

    },

    // ====================== Convenience methods ======================

    // ====================== Adding items ======================

    // adds a jQuery object of items to a isotope container
    addItems : function( $content, callback ) {
      var $newAtoms = this._getAtoms( $content );
      // add new atoms to atoms pools
      this.$allAtoms = this.$allAtoms.add( $newAtoms );

      if ( callback ) {
        callback( $newAtoms );
      }
    },

    // convienence method for adding elements properly to any layout
    // positions items, hides them, then animates them back in <--- very sezzy
    insert : function( $content, callback ) {
      // position items
      this.element.append( $content );

      var instance = this;
      this.addItems( $content, function( $newAtoms ) {
        var $newFilteredAtoms = instance._filter( $newAtoms );
        instance._addHideAppended( $newFilteredAtoms );
        instance._sort();
        instance.reLayout();
        instance._revealAppended( $newFilteredAtoms, callback );
      });

    },

    // convienence method for working with Infinite Scroll
    appended : function( $content, callback ) {
      var instance = this;
      this.addItems( $content, function( $newAtoms ) {
        instance._addHideAppended( $newAtoms );
        instance.layout( $newAtoms );
        instance._revealAppended( $newAtoms, callback );
      });
    },

    // adds new atoms, then hides them before positioning
    _addHideAppended : function( $newAtoms ) {
      this.$filteredAtoms = this.$filteredAtoms.add( $newAtoms );
      $newAtoms.addClass('no-transition');

      this._isInserting = true;

      // apply hidden styles
      this.styleQueue.push({ $el: $newAtoms, style: this.options.hiddenStyle });
    },

    // sets visible style on new atoms
    _revealAppended : function( $newAtoms, callback ) {
      var instance = this;
      // apply visible style after a sec
      setTimeout( function() {
        // enable animation
        $newAtoms.removeClass('no-transition');
        // reveal newly inserted filtered elements
        instance.styleQueue.push({ $el: $newAtoms, style: instance.options.visibleStyle });
        instance._isInserting = false;
        instance._processStyleQueue( $newAtoms, callback );
      }, 10 );
    },

    // gathers all atoms
    reloadItems : function() {
      this.$allAtoms = this._getAtoms( this.element.children() );
    },

    // removes elements from Isotope widget
    remove: function( $content, callback ) {
      // remove elements immediately from Isotope instance
      this.$allAtoms = this.$allAtoms.not( $content );
      this.$filteredAtoms = this.$filteredAtoms.not( $content );
      // remove() as a callback, for after transition / animation
      var instance = this;
      var removeContent = function() {
        $content.remove();
        if ( callback ) {
          callback.call( instance.element );
        }
      };

      if ( $content.filter( ':not(.' + this.options.hiddenClass + ')' ).length ) {
        // if any non-hidden content needs to be removed
        this.styleQueue.push({ $el: $content, style: this.options.hiddenStyle });
        this._sort();
        this.reLayout( removeContent );
      } else {
        // remove it now
        removeContent();
      }

    },

    shuffle : function( callback ) {
      this.updateSortData( this.$allAtoms );
      this.options.sortBy = 'random';
      this._sort();
      this.reLayout( callback );
    },

    // destroys widget, returns elements and container back (close) to original style
    destroy : function() {

      var usingTransforms = this.usingTransforms;
      var options = this.options;

      this.$allAtoms
        .removeClass( options.hiddenClass + ' ' + options.itemClass )
        .each(function(){
          var style = this.style;
          style.position = '';
          style.top = '';
          style.left = '';
          style.opacity = '';
          if ( usingTransforms ) {
            style[ transformProp ] = '';
          }
        });

      // re-apply saved container styles
      var elemStyle = this.element[0].style;
      for ( var prop in this.originalStyle ) {
        elemStyle[ prop ] = this.originalStyle[ prop ];
      }

      this.element
        .unbind('.isotope')
        .undelegate( '.' + options.hiddenClass, 'click' )
        .removeClass( options.containerClass )
        .removeData('isotope');

      $window.unbind('.isotope');

    },


    // ====================== LAYOUTS ======================

    // calculates number of rows or columns
    // requires columnWidth or rowHeight to be set on namespaced object
    // i.e. this.masonry.columnWidth = 200
    _getSegments : function( isRows ) {
      var namespace = this.options.layoutMode,
          measure  = isRows ? 'rowHeight' : 'columnWidth',
          size     = isRows ? 'height' : 'width',
          segmentsName = isRows ? 'rows' : 'cols',
          containerSize = this.element[ size ](),
          segments,
                    // i.e. options.masonry && options.masonry.columnWidth
          segmentSize = this.options[ namespace ] && this.options[ namespace ][ measure ] ||
                    // or use the size of the first item, i.e. outerWidth
                    this.$filteredAtoms[ 'outer' + capitalize(size) ](true) ||
                    // if there's no items, use size of container
                    containerSize;

      segments = Math.floor( containerSize / segmentSize );
      segments = Math.max( segments, 1 );

      // i.e. this.masonry.cols = ....
      this[ namespace ][ segmentsName ] = segments;
      // i.e. this.masonry.columnWidth = ...
      this[ namespace ][ measure ] = segmentSize;

    },

    _checkIfSegmentsChanged : function( isRows ) {
      var namespace = this.options.layoutMode,
          segmentsName = isRows ? 'rows' : 'cols',
          prevSegments = this[ namespace ][ segmentsName ];
      // update cols/rows
      this._getSegments( isRows );
      // return if updated cols/rows is not equal to previous
      return ( this[ namespace ][ segmentsName ] !== prevSegments );
    },

    // ====================== Masonry ======================

    _masonryReset : function() {
      // layout-specific props
      this.masonry = {};
      // FIXME shouldn't have to call this again
      this._getSegments();
      var i = this.masonry.cols;
      this.masonry.colYs = [];
      while (i--) {
        this.masonry.colYs.push( 0 );
      }
    },

    _masonryLayout : function( $elems ) {
      var instance = this,
          props = instance.masonry;
      $elems.each(function(){
        var $this  = $(this),
            //how many columns does this brick span
            colSpan = Math.ceil( $this.outerWidth(true) / props.columnWidth );
        colSpan = Math.min( colSpan, props.cols );

        if ( colSpan === 1 ) {
          // if brick spans only one column, just like singleMode
          instance._masonryPlaceBrick( $this, props.colYs );
        } else {
          // brick spans more than one column
          // how many different places could this brick fit horizontally
          var groupCount = props.cols + 1 - colSpan,
              groupY = [],
              groupColY,
              i;

          // for each group potential horizontal position
          for ( i=0; i < groupCount; i++ ) {
            // make an array of colY values for that one group
            groupColY = props.colYs.slice( i, i+colSpan );
            // and get the max value of the array
            groupY[i] = Math.max.apply( Math, groupColY );
          }

          instance._masonryPlaceBrick( $this, groupY );
        }
      });
    },

    // worker method that places brick in the columnSet
    //   with the the minY
    _masonryPlaceBrick : function( $brick, setY ) {
      // get the minimum Y value from the columns
      var minimumY = Math.min.apply( Math, setY ),
          shortCol = 0;

      // Find index of short column, the first from the left
      for (var i=0, len = setY.length; i < len; i++) {
        if ( setY[i] === minimumY ) {
          shortCol = i;
          break;
        }
      }

      // position the brick
      var x = this.masonry.columnWidth * shortCol,
          y = minimumY;
      this._pushPosition( $brick, x, y );

      // apply setHeight to necessary columns
      var setHeight = minimumY + $brick.outerHeight(true),
          setSpan = this.masonry.cols + 1 - len;
      for ( i=0; i < setSpan; i++ ) {
        this.masonry.colYs[ shortCol + i ] = setHeight;
      }

    },

    _masonryGetContainerSize : function() {
      var containerHeight = Math.max.apply( Math, this.masonry.colYs );
      return { height: containerHeight };
    },

    _masonryResizeChanged : function() {
      return this._checkIfSegmentsChanged();
    },

    // ====================== fitRows ======================

    _fitRowsReset : function() {
      this.fitRows = {
        x : 0,
        y : 0,
        height : 0
      };
    },

    _fitRowsLayout : function( $elems ) {
      var instance = this,
          containerWidth = this.element.width(),
          props = this.fitRows;

      $elems.each( function() {
        var $this = $(this),
            atomW = $this.outerWidth(true),
            atomH = $this.outerHeight(true);

        if ( props.x !== 0 && atomW + props.x > containerWidth ) {
          // if this element cannot fit in the current row
          props.x = 0;
          props.y = props.height;
        }

        // position the atom
        instance._pushPosition( $this, props.x, props.y );

        props.height = Math.max( props.y + atomH, props.height );
        props.x += atomW;

      });
    },

    _fitRowsGetContainerSize : function () {
      return { height : this.fitRows.height };
    },

    _fitRowsResizeChanged : function() {
      return true;
    },


    // ====================== cellsByRow ======================

    _cellsByRowReset : function() {
      this.cellsByRow = {
        index : 0
      };
      // get this.cellsByRow.columnWidth
      this._getSegments();
      // get this.cellsByRow.rowHeight
      this._getSegments(true);
    },

    _cellsByRowLayout : function( $elems ) {
      var instance = this,
          props = this.cellsByRow;
      $elems.each( function(){
        var $this = $(this),
            col = props.index % props.cols,
            row = Math.floor( props.index / props.cols ),
            x = ( col + 0.5 ) * props.columnWidth - $this.outerWidth(true) / 2,
            y = ( row + 0.5 ) * props.rowHeight - $this.outerHeight(true) / 2;
        instance._pushPosition( $this, x, y );
        props.index ++;
      });
    },

    _cellsByRowGetContainerSize : function() {
      return { height : Math.ceil( this.$filteredAtoms.length / this.cellsByRow.cols ) * this.cellsByRow.rowHeight + this.offset.top };
    },

    _cellsByRowResizeChanged : function() {
      return this._checkIfSegmentsChanged();
    },


    // ====================== straightDown ======================

    _straightDownReset : function() {
      this.straightDown = {
        y : 0
      };
    },

    _straightDownLayout : function( $elems ) {
      var instance = this;
      $elems.each( function( i ){
        var $this = $(this);
        instance._pushPosition( $this, 0, instance.straightDown.y );
        instance.straightDown.y += $this.outerHeight(true);
      });
    },

    _straightDownGetContainerSize : function() {
      return { height : this.straightDown.y };
    },

    _straightDownResizeChanged : function() {
      return true;
    },


    // ====================== masonryHorizontal ======================

    _masonryHorizontalReset : function() {
      // layout-specific props
      this.masonryHorizontal = {};
      // FIXME shouldn't have to call this again
      this._getSegments( true );
      var i = this.masonryHorizontal.rows;
      this.masonryHorizontal.rowXs = [];
      while (i--) {
        this.masonryHorizontal.rowXs.push( 0 );
      }
    },

    _masonryHorizontalLayout : function( $elems ) {
      var instance = this,
          props = instance.masonryHorizontal;
      $elems.each(function(){
        var $this  = $(this),
            //how many rows does this brick span
            rowSpan = Math.ceil( $this.outerHeight(true) / props.rowHeight );
        rowSpan = Math.min( rowSpan, props.rows );

        if ( rowSpan === 1 ) {
          // if brick spans only one column, just like singleMode
          instance._masonryHorizontalPlaceBrick( $this, props.rowXs );
        } else {
          // brick spans more than one row
          // how many different places could this brick fit horizontally
          var groupCount = props.rows + 1 - rowSpan,
              groupX = [],
              groupRowX, i;

          // for each group potential horizontal position
          for ( i=0; i < groupCount; i++ ) {
            // make an array of colY values for that one group
            groupRowX = props.rowXs.slice( i, i+rowSpan );
            // and get the max value of the array
            groupX[i] = Math.max.apply( Math, groupRowX );
          }

          instance._masonryHorizontalPlaceBrick( $this, groupX );
        }
      });
    },

    _masonryHorizontalPlaceBrick : function( $brick, setX ) {
      // get the minimum Y value from the columns
      var minimumX  = Math.min.apply( Math, setX ),
          smallRow  = 0;
      // Find index of smallest row, the first from the top
      for (var i=0, len = setX.length; i < len; i++) {
        if ( setX[i] === minimumX ) {
          smallRow = i;
          break;
        }
      }

      // position the brick
      var x = minimumX,
          y = this.masonryHorizontal.rowHeight * smallRow;
      this._pushPosition( $brick, x, y );

      // apply setHeight to necessary columns
      var setWidth = minimumX + $brick.outerWidth(true),
          setSpan = this.masonryHorizontal.rows + 1 - len;
      for ( i=0; i < setSpan; i++ ) {
        this.masonryHorizontal.rowXs[ smallRow + i ] = setWidth;
      }
    },

    _masonryHorizontalGetContainerSize : function() {
      var containerWidth = Math.max.apply( Math, this.masonryHorizontal.rowXs );
      return { width: containerWidth };
    },

    _masonryHorizontalResizeChanged : function() {
      return this._checkIfSegmentsChanged(true);
    },


    // ====================== fitColumns ======================

    _fitColumnsReset : function() {
      this.fitColumns = {
        x : 0,
        y : 0,
        width : 0
      };
    },

    _fitColumnsLayout : function( $elems ) {
      var instance = this,
          containerHeight = this.element.height(),
          props = this.fitColumns;
      $elems.each( function() {
        var $this = $(this),
            atomW = $this.outerWidth(true),
            atomH = $this.outerHeight(true);

        if ( props.y !== 0 && atomH + props.y > containerHeight ) {
          // if this element cannot fit in the current column
          props.x = props.width;
          props.y = 0;
        }

        // position the atom
        instance._pushPosition( $this, props.x, props.y );

        props.width = Math.max( props.x + atomW, props.width );
        props.y += atomH;

      });
    },

    _fitColumnsGetContainerSize : function () {
      return { width : this.fitColumns.width };
    },

    _fitColumnsResizeChanged : function() {
      return true;
    },



    // ====================== cellsByColumn ======================

    _cellsByColumnReset : function() {
      this.cellsByColumn = {
        index : 0
      };
      // get this.cellsByColumn.columnWidth
      this._getSegments();
      // get this.cellsByColumn.rowHeight
      this._getSegments(true);
    },

    _cellsByColumnLayout : function( $elems ) {
      var instance = this,
          props = this.cellsByColumn;
      $elems.each( function(){
        var $this = $(this),
            col = Math.floor( props.index / props.rows ),
            row = props.index % props.rows,
            x = ( col + 0.5 ) * props.columnWidth - $this.outerWidth(true) / 2,
            y = ( row + 0.5 ) * props.rowHeight - $this.outerHeight(true) / 2;
        instance._pushPosition( $this, x, y );
        props.index ++;
      });
    },

    _cellsByColumnGetContainerSize : function() {
      return { width : Math.ceil( this.$filteredAtoms.length / this.cellsByColumn.rows ) * this.cellsByColumn.columnWidth };
    },

    _cellsByColumnResizeChanged : function() {
      return this._checkIfSegmentsChanged(true);
    },

    // ====================== straightAcross ======================

    _straightAcrossReset : function() {
      this.straightAcross = {
        x : 0
      };
    },

    _straightAcrossLayout : function( $elems ) {
      var instance = this;
      $elems.each( function( i ){
        var $this = $(this);
        instance._pushPosition( $this, instance.straightAcross.x, 0 );
        instance.straightAcross.x += $this.outerWidth(true);
      });
    },

    _straightAcrossGetContainerSize : function() {
      return { width : this.straightAcross.x };
    },

    _straightAcrossResizeChanged : function() {
      return true;
    }

  };


  // ======================= imagesLoaded Plugin ===============================
  /*!
   * jQuery imagesLoaded plugin v1.1.0
   * http://github.com/desandro/imagesloaded
   *
   * MIT License. by Paul Irish et al.
   */


  // $('#my-container').imagesLoaded(myFunction)
  // or
  // $('img').imagesLoaded(myFunction)

  // execute a callback when all images have loaded.
  // needed because .load() doesn't work on cached images

  // callback function gets image collection as argument
  //  `this` is the container

  $.fn.imagesLoaded = function( callback ) {
    var $this = this,
        $images = $this.find('img').add( $this.filter('img') ),
        len = $images.length,
        blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        loaded = [];

    function triggerCallback() {
      callback.call( $this, $images );
    }

    function imgLoaded( event ) {
      var img = event.target;
      if ( img.src !== blank && $.inArray( img, loaded ) === -1 ){
        loaded.push( img );
        if ( --len <= 0 ){
          setTimeout( triggerCallback );
          $images.unbind( '.imagesLoaded', imgLoaded );
        }
      }
    }

    // if no images, trigger immediately
    if ( !len ) {
      triggerCallback();
    }

    $images.bind( 'load.imagesLoaded error.imagesLoaded',  imgLoaded ).each( function() {
      // cached images don't fire load sometimes, so we reset src.
      var src = this.src;
      // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
      // data uri bypasses webkit log warning (thx doug jones)
      this.src = blank;
      this.src = src;
    });

    return $this;
  };


  // helper function for logging errors
  // $.error breaks jQuery chaining
  var logError = function( message ) {
    if ( window.console ) {
      window.console.error( message );
    }
  };

  // =======================  Plugin bridge  ===============================
  // leverages data method to either create or return $.Isotope constructor
  // A bit from jQuery UI
  //   https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
  // A bit from jcarousel
  //   https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

  $.fn.isotope = function( options, callback ) {
    if ( typeof options === 'string' ) {
      // call method
      var args = Array.prototype.slice.call( arguments, 1 );

      this.each(function(){
        var instance = $.data( this, 'isotope' );
        if ( !instance ) {
          logError( "cannot call methods on isotope prior to initialization; " +
              "attempted to call method '" + options + "'" );
          return;
        }
        if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
          logError( "no such method '" + options + "' for isotope instance" );
          return;
        }
        // apply method
        instance[ options ].apply( instance, args );
      });
    } else {
      this.each(function() {
        var instance = $.data( this, 'isotope' );
        if ( instance ) {
          // apply options & init
          instance.option( options );
          instance._init( callback );
        } else {
          // initialize new instance
          $.data( this, 'isotope', new $.Isotope( options, this, callback ) );
        }
      });
    }
    // return jQuery object
    // so plugin methods do not have to
    return this;
  };

})( window, jQuery );
/* ------------------------------------------------------------------------
	Class: prettyPhoto
	Use: Lightbox clone for jQuery
	Author: Stephane Caron (http://www.no-margin-for-errors.com)
	Version: 3.1.5
------------------------------------------------------------------------- */
(function(e){function t(){var e=location.href;hashtag=e.indexOf("#prettyPhoto")!==-1?decodeURI(e.substring(e.indexOf("#prettyPhoto")+1,e.length)):false;return hashtag}function n(){if(typeof theRel=="undefined")return;location.hash=theRel+"/"+rel_index+"/"}function r(){if(location.href.indexOf("#prettyPhoto")!==-1)location.hash="prettyPhoto"}function i(e,t){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var n="[\\?&]"+e+"=([^&#]*)";var r=new RegExp(n);var i=r.exec(t);return i==null?"":i[1]}e.prettyPhoto={version:"3.1.5"};e.fn.prettyPhoto=function(s){function g(){e(".pp_loaderIcon").hide();projectedTop=scroll_pos["scrollTop"]+(d/2-a["containerHeight"]/2);if(projectedTop<0)projectedTop=0;$ppt.fadeTo(settings.animation_speed,1);$pp_pic_holder.find(".pp_content").animate({height:a["contentHeight"],width:a["contentWidth"]},settings.animation_speed);$pp_pic_holder.animate({top:projectedTop,left:v/2-a["containerWidth"]/2<0?0:v/2-a["containerWidth"]/2,width:a["containerWidth"]},settings.animation_speed,function(){$pp_pic_holder.find(".pp_hoverContainer,#fullResImage").height(a["height"]).width(a["width"]);$pp_pic_holder.find(".pp_fade").fadeIn(settings.animation_speed);if(isSet&&S(pp_images[set_position])=="image"){$pp_pic_holder.find(".pp_hoverContainer").show()}else{$pp_pic_holder.find(".pp_hoverContainer").hide()}if(settings.allow_expand){if(a["resized"]){e("a.pp_expand,a.pp_contract").show()}else{e("a.pp_expand").hide()}}if(settings.autoplay_slideshow&&!m&&!f)e.prettyPhoto.startSlideshow();settings.changepicturecallback();f=true});C();s.ajaxcallback()}function y(t){$pp_pic_holder.find("#pp_full_res object,#pp_full_res embed").css("visibility","hidden");$pp_pic_holder.find(".pp_fade").fadeOut(settings.animation_speed,function(){e(".pp_loaderIcon").show();t()})}function b(t){t>1?e(".pp_nav").show():e(".pp_nav").hide()}function w(e,t){resized=false;E(e,t);imageWidth=e,imageHeight=t;if((p>v||h>d)&&doresize&&settings.allow_resize&&!u){resized=true,fitting=false;while(!fitting){if(p>v){imageWidth=v-200;imageHeight=t/e*imageWidth}else if(h>d){imageHeight=d-200;imageWidth=e/t*imageHeight}else{fitting=true}h=imageHeight,p=imageWidth}if(p>v||h>d){w(p,h)}E(imageWidth,imageHeight)}return{width:Math.floor(imageWidth),height:Math.floor(imageHeight),containerHeight:Math.floor(h),containerWidth:Math.floor(p)+settings.horizontal_padding*2,contentHeight:Math.floor(l),contentWidth:Math.floor(c),resized:resized}}function E(t,n){t=parseFloat(t);n=parseFloat(n);$pp_details=$pp_pic_holder.find(".pp_details");$pp_details.width(t);detailsHeight=parseFloat($pp_details.css("marginTop"))+parseFloat($pp_details.css("marginBottom"));$pp_details=$pp_details.clone().addClass(settings.theme).width(t).appendTo(e("body")).css({position:"absolute",top:-1e4});detailsHeight+=$pp_details.height();detailsHeight=detailsHeight<=34?36:detailsHeight;$pp_details.remove();$pp_title=$pp_pic_holder.find(".ppt");$pp_title.width(t);titleHeight=parseFloat($pp_title.css("marginTop"))+parseFloat($pp_title.css("marginBottom"));$pp_title=$pp_title.clone().appendTo(e("body")).css({position:"absolute",top:-1e4});titleHeight+=$pp_title.height();$pp_title.remove();l=n+detailsHeight;c=t;h=l+titleHeight+$pp_pic_holder.find(".pp_top").height()+$pp_pic_holder.find(".pp_bottom").height();p=t}function S(e){if(e.match(/youtube\.com\/watch/i)||e.match(/youtu\.be/i)){return"youtube"}else if(e.match(/vimeo\.com/i)){return"vimeo"}else if(e.match(/\b.mov\b/i)){return"quicktime"}else if(e.match(/\b.swf\b/i)){return"flash"}else if(e.match(/\biframe=true\b/i)){return"iframe"}else if(e.match(/\bajax=true\b/i)){return"ajax"}else if(e.match(/\bcustom=true\b/i)){return"custom"}else if(e.substr(0,1)=="#"){return"inline"}else{return"image"}}function x(){if(doresize&&typeof $pp_pic_holder!="undefined"){scroll_pos=T();contentHeight=$pp_pic_holder.height(),contentwidth=$pp_pic_holder.width();projectedTop=d/2+scroll_pos["scrollTop"]-contentHeight/2;if(projectedTop<0)projectedTop=0;if(contentHeight>d)return;$pp_pic_holder.css({top:projectedTop,left:v/2+scroll_pos["scrollLeft"]-contentwidth/2})}}function T(){if(self.pageYOffset){return{scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset}}else if(document.documentElement&&document.documentElement.scrollTop){return{scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft}}else if(document.body){return{scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft}}}function N(){d=e(window).height(),v=e(window).width();if(typeof $pp_overlay!="undefined")$pp_overlay.height(e(document).height()).width(v)}function C(){if(isSet&&settings.overlay_gallery&&S(pp_images[set_position])=="image"){itemWidth=52+5;navWidth=settings.theme=="facebook"||settings.theme=="pp_default"?50:30;itemsPerPage=Math.floor((a["containerWidth"]-100-navWidth)/itemWidth);itemsPerPage=itemsPerPage<pp_images.length?itemsPerPage:pp_images.length;totalPage=Math.ceil(pp_images.length/itemsPerPage)-1;if(totalPage==0){navWidth=0;$pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").hide()}else{$pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").show()}galleryWidth=itemsPerPage*itemWidth;fullGalleryWidth=pp_images.length*itemWidth;$pp_gallery.css("margin-left",-(galleryWidth/2+navWidth/2)).find("div:first").width(galleryWidth+5).find("ul").width(fullGalleryWidth).find("li.selected").removeClass("selected");goToPage=Math.floor(set_position/itemsPerPage)<totalPage?Math.floor(set_position/itemsPerPage):totalPage;e.prettyPhoto.changeGalleryPage(goToPage);$pp_gallery_li.filter(":eq("+set_position+")").addClass("selected")}else{$pp_pic_holder.find(".pp_content").unbind("mouseenter mouseleave")}}function k(t){if(settings.social_tools)facebook_like_link=settings.social_tools.replace("{location_href}",encodeURIComponent(location.href));settings.markup=settings.markup.replace("{pp_social}","");e("body").append(settings.markup);$pp_pic_holder=e(".pp_pic_holder"),$ppt=e(".ppt"),$pp_overlay=e("div.pp_overlay");if(isSet&&settings.overlay_gallery){currentGalleryPage=0;toInject="";for(var n=0;n<pp_images.length;n++){if(!pp_images[n].match(/\b(jpg|jpeg|png|gif)\b/gi)){classname="default";img_src=""}else{classname="";img_src=pp_images[n]}toInject+="<li class='"+classname+"'><a href='#'><img src='"+img_src+"' width='50' alt='' /></a></li>"}toInject=settings.gallery_markup.replace(/{gallery}/g,toInject);$pp_pic_holder.find("#pp_full_res").after(toInject);$pp_gallery=e(".pp_pic_holder .pp_gallery"),$pp_gallery_li=$pp_gallery.find("li");$pp_gallery.find(".pp_arrow_next").click(function(){e.prettyPhoto.changeGalleryPage("next");e.prettyPhoto.stopSlideshow();return false});$pp_gallery.find(".pp_arrow_previous").click(function(){e.prettyPhoto.changeGalleryPage("previous");e.prettyPhoto.stopSlideshow();return false});$pp_pic_holder.find(".pp_content").hover(function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeIn()},function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeOut()});itemWidth=52+5;$pp_gallery_li.each(function(t){e(this).find("a").click(function(){e.prettyPhoto.changePage(t);e.prettyPhoto.stopSlideshow();return false})})}if(settings.slideshow){$pp_pic_holder.find(".pp_nav").prepend('<a href="#" class="pp_play">Play</a>');$pp_pic_holder.find(".pp_nav .pp_play").click(function(){e.prettyPhoto.startSlideshow();return false})}$pp_pic_holder.attr("class","pp_pic_holder "+settings.theme);$pp_overlay.css({opacity:0,height:e(document).height(),width:e(window).width()}).bind("click",function(){if(!settings.modal)e.prettyPhoto.close()});e("a.pp_close").bind("click",function(){e.prettyPhoto.close();return false});if(settings.allow_expand){e("a.pp_expand").bind("click",function(t){if(e(this).hasClass("pp_expand")){e(this).removeClass("pp_expand").addClass("pp_contract");doresize=false}else{e(this).removeClass("pp_contract").addClass("pp_expand");doresize=true}y(function(){e.prettyPhoto.open()});return false})}$pp_pic_holder.find(".pp_previous, .pp_nav .pp_arrow_previous").bind("click",function(){e.prettyPhoto.changePage("previous");e.prettyPhoto.stopSlideshow();return false});$pp_pic_holder.find(".pp_next, .pp_nav .pp_arrow_next").bind("click",function(){e.prettyPhoto.changePage("next");e.prettyPhoto.stopSlideshow();return false});x()}s=jQuery.extend({hook:"rel",animation_speed:"fast",ajaxcallback:function(){},slideshow:5e3,autoplay_slideshow:false,opacity:.8,show_title:true,allow_resize:true,allow_expand:true,default_width:500,default_height:344,counter_separator_label:"/",theme:"pp_default",horizontal_padding:20,hideflash:false,wmode:"opaque",autoplay:true,modal:false,deeplinking:true,overlay_gallery:true,overlay_gallery_max:30,keyboard_shortcuts:true,changepicturecallback:function(){},callback:function(){},ie6_fallback:true,markup:'<div class="pp_pic_holder"> 						<div class="ppt"> </div> 						<div class="pp_top"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 						<div class="pp_content_container"> 							<div class="pp_left"> 							<div class="pp_right"> 								<div class="pp_content"> 									<div class="pp_loaderIcon"></div> 									<div class="pp_fade"> 										<a href="#" class="pp_expand" title="Expand the image">Expand</a> 										<div class="pp_hoverContainer"> 											<a class="pp_next" href="#">next</a> 											<a class="pp_previous" href="#">previous</a> 										</div> 										<div id="pp_full_res"></div> 										<div class="pp_details"> 											<div class="pp_nav"> 												<a href="#" class="pp_arrow_previous">Previous</a> 												<p class="currentTextHolder">0/0</p> 												<a href="#" class="pp_arrow_next">Next</a> 											</div> 											<p class="pp_description"></p> 											<div class="pp_social">{pp_social}</div> 											<a class="pp_close" href="#">Close</a> 										</div> 									</div> 								</div> 							</div> 							</div> 						</div> 						<div class="pp_bottom"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 					</div> 					<div class="pp_overlay"></div>',gallery_markup:'<div class="pp_gallery"> 								<a href="#" class="pp_arrow_previous">Previous</a> 								<div> 									<ul> 										{gallery} 									</ul> 								</div> 								<a href="#" class="pp_arrow_next">Next</a> 							</div>',image_markup:'<img id="fullResImage" src="{path}" />',flash_markup:'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',quicktime_markup:'<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',iframe_markup:'<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',inline_markup:'<div class="pp_inline">{content}</div>',custom_markup:"",social_tools:'<div class="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&layout=button_count&show_faces=true&width=500&action=like&font&colorscheme=light&height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>'},s);var o=this,u=false,a,f,l,c,h,p,d=e(window).height(),v=e(window).width(),m;doresize=true,scroll_pos=T();e(window).unbind("resize.prettyphoto").bind("resize.prettyphoto",function(){x();N()});if(s.keyboard_shortcuts){e(document).unbind("keydown.prettyphoto").bind("keydown.prettyphoto",function(t){if(typeof $pp_pic_holder!="undefined"){if($pp_pic_holder.is(":visible")){switch(t.keyCode){case 37:e.prettyPhoto.changePage("previous");t.preventDefault();break;case 39:e.prettyPhoto.changePage("next");t.preventDefault();break;case 27:if(!settings.modal)e.prettyPhoto.close();t.preventDefault();break}}}})}e.prettyPhoto.initialize=function(){settings=s;if(settings.theme=="pp_default")settings.horizontal_padding=16;theRel=e(this).attr(settings.hook);galleryRegExp=/\[(?:.*)\]/;isSet=galleryRegExp.exec(theRel)?true:false;pp_images=isSet?jQuery.map(o,function(t,n){if(e(t).attr(settings.hook).indexOf(theRel)!=-1)return e(t).attr("href")}):e.makeArray(e(this).attr("href"));pp_titles=isSet?jQuery.map(o,function(t,n){if(e(t).attr(settings.hook).indexOf(theRel)!=-1)return e(t).find("img").attr("alt")?e(t).find("img").attr("alt"):""}):e.makeArray(e(this).find("img").attr("alt"));pp_descriptions=isSet?jQuery.map(o,function(t,n){if(e(t).attr(settings.hook).indexOf(theRel)!=-1)return e(t).attr("title")?e(t).attr("title"):""}):e.makeArray(e(this).attr("title"));if(pp_images.length>settings.overlay_gallery_max)settings.overlay_gallery=false;set_position=jQuery.inArray(e(this).attr("href"),pp_images);rel_index=isSet?set_position:e("a["+settings.hook+"^='"+theRel+"']").index(e(this));k(this);if(settings.allow_resize)e(window).bind("scroll.prettyphoto",function(){x()});e.prettyPhoto.open();return false};e.prettyPhoto.open=function(t){if(typeof settings=="undefined"){settings=s;pp_images=e.makeArray(arguments[0]);pp_titles=arguments[1]?e.makeArray(arguments[1]):e.makeArray("");pp_descriptions=arguments[2]?e.makeArray(arguments[2]):e.makeArray("");isSet=pp_images.length>1?true:false;set_position=arguments[3]?arguments[3]:0;k(t.target)}if(settings.hideflash)e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility","hidden");b(e(pp_images).size());e(".pp_loaderIcon").show();if(settings.deeplinking)n();if(settings.social_tools){facebook_like_link=settings.social_tools.replace("{location_href}",encodeURIComponent(location.href));$pp_pic_holder.find(".pp_social").html(facebook_like_link)}if($ppt.is(":hidden"))$ppt.css("opacity",0).show();$pp_overlay.show().fadeTo(settings.animation_speed,settings.opacity);$pp_pic_holder.find(".currentTextHolder").text(set_position+1+settings.counter_separator_label+e(pp_images).size());if(typeof pp_descriptions[set_position]!="undefined"&&pp_descriptions[set_position]!=""){$pp_pic_holder.find(".pp_description").show().html(unescape(pp_descriptions[set_position]))}else{$pp_pic_holder.find(".pp_description").hide()}movie_width=parseFloat(i("width",pp_images[set_position]))?i("width",pp_images[set_position]):settings.default_width.toString();movie_height=parseFloat(i("height",pp_images[set_position]))?i("height",pp_images[set_position]):settings.default_height.toString();u=false;if(movie_height.indexOf("%")!=-1){movie_height=parseFloat(e(window).height()*parseFloat(movie_height)/100-150);u=true}if(movie_width.indexOf("%")!=-1){movie_width=parseFloat(e(window).width()*parseFloat(movie_width)/100-150);u=true}$pp_pic_holder.fadeIn(function(){settings.show_title&&pp_titles[set_position]!=""&&typeof pp_titles[set_position]!="undefined"?$ppt.html(unescape(pp_titles[set_position])):$ppt.html(" ");imgPreloader="";skipInjection=false;switch(S(pp_images[set_position])){case"image":imgPreloader=new Image;nextImage=new Image;if(isSet&&set_position<e(pp_images).size()-1)nextImage.src=pp_images[set_position+1];prevImage=new Image;if(isSet&&pp_images[set_position-1])prevImage.src=pp_images[set_position-1];$pp_pic_holder.find("#pp_full_res")[0].innerHTML=settings.image_markup.replace(/{path}/g,pp_images[set_position]);imgPreloader.onload=function(){a=w(imgPreloader.width,imgPreloader.height);g()};imgPreloader.onerror=function(){alert("Image cannot be loaded. Make sure the path is correct and image exist.");e.prettyPhoto.close()};imgPreloader.src=pp_images[set_position];break;case"youtube":a=w(movie_width,movie_height);movie_id=i("v",pp_images[set_position]);if(movie_id==""){movie_id=pp_images[set_position].split("youtu.be/");movie_id=movie_id[1];if(movie_id.indexOf("?")>0)movie_id=movie_id.substr(0,movie_id.indexOf("?"));if(movie_id.indexOf("&")>0)movie_id=movie_id.substr(0,movie_id.indexOf("&"))}movie="http://www.youtube.com/embed/"+movie_id;i("rel",pp_images[set_position])?movie+="?rel="+i("rel",pp_images[set_position]):movie+="?rel=1";if(settings.autoplay)movie+="&autoplay=1";toInject=settings.iframe_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);break;case"vimeo":a=w(movie_width,movie_height);movie_id=pp_images[set_position];var t=/http(s?):\/\/(www\.)?vimeo.com\/(\d+)/;var n=movie_id.match(t);movie="http://player.vimeo.com/video/"+n[3]+"?title=0&byline=0&portrait=0";if(settings.autoplay)movie+="&autoplay=1;";vimeo_width=a["width"]+"/embed/?moog_width="+a["width"];toInject=settings.iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,a["height"]).replace(/{path}/g,movie);break;case"quicktime":a=w(movie_width,movie_height);a["height"]+=15;a["contentHeight"]+=15;a["containerHeight"]+=15;toInject=settings.quicktime_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,pp_images[set_position]).replace(/{autoplay}/g,settings.autoplay);break;case"flash":a=w(movie_width,movie_height);flash_vars=pp_images[set_position];flash_vars=flash_vars.substring(pp_images[set_position].indexOf("flashvars")+10,pp_images[set_position].length);filename=pp_images[set_position];filename=filename.substring(0,filename.indexOf("?"));toInject=settings.flash_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+"?"+flash_vars);break;case"iframe":a=w(movie_width,movie_height);frame_url=pp_images[set_position];frame_url=frame_url.substr(0,frame_url.indexOf("iframe")-1);toInject=settings.iframe_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{path}/g,frame_url);break;case"ajax":doresize=false;a=w(movie_width,movie_height);doresize=true;skipInjection=true;e.get(pp_images[set_position],function(e){toInject=settings.inline_markup.replace(/{content}/g,e);$pp_pic_holder.find("#pp_full_res")[0].innerHTML=toInject;g()});break;case"custom":a=w(movie_width,movie_height);toInject=settings.custom_markup;break;case"inline":myClone=e(pp_images[set_position]).clone().append('<br clear="all" />').css({width:settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo(e("body")).show();doresize=false;a=w(e(myClone).width(),e(myClone).height());doresize=true;e(myClone).remove();toInject=settings.inline_markup.replace(/{content}/g,e(pp_images[set_position]).html());break}if(!imgPreloader&&!skipInjection){$pp_pic_holder.find("#pp_full_res")[0].innerHTML=toInject;g()}});return false};e.prettyPhoto.changePage=function(t){currentGalleryPage=0;if(t=="previous"){set_position--;if(set_position<0)set_position=e(pp_images).size()-1}else if(t=="next"){set_position++;if(set_position>e(pp_images).size()-1)set_position=0}else{set_position=t}rel_index=set_position;if(!doresize)doresize=true;if(settings.allow_expand){e(".pp_contract").removeClass("pp_contract").addClass("pp_expand")}y(function(){e.prettyPhoto.open()})};e.prettyPhoto.changeGalleryPage=function(e){if(e=="next"){currentGalleryPage++;if(currentGalleryPage>totalPage)currentGalleryPage=0}else if(e=="previous"){currentGalleryPage--;if(currentGalleryPage<0)currentGalleryPage=totalPage}else{currentGalleryPage=e}slide_speed=e=="next"||e=="previous"?settings.animation_speed:0;slide_to=currentGalleryPage*itemsPerPage*itemWidth;$pp_gallery.find("ul").animate({left:-slide_to},slide_speed)};e.prettyPhoto.startSlideshow=function(){if(typeof m=="undefined"){$pp_pic_holder.find(".pp_play").unbind("click").removeClass("pp_play").addClass("pp_pause").click(function(){e.prettyPhoto.stopSlideshow();return false});m=setInterval(e.prettyPhoto.startSlideshow,settings.slideshow)}else{e.prettyPhoto.changePage("next")}};e.prettyPhoto.stopSlideshow=function(){$pp_pic_holder.find(".pp_pause").unbind("click").removeClass("pp_pause").addClass("pp_play").click(function(){e.prettyPhoto.startSlideshow();return false});clearInterval(m);m=undefined};e.prettyPhoto.close=function(){if($pp_overlay.is(":animated"))return;e.prettyPhoto.stopSlideshow();$pp_pic_holder.stop().find("object,embed").css("visibility","hidden");e("div.pp_pic_holder,div.ppt,.pp_fade").fadeOut(settings.animation_speed,function(){e(this).remove()});$pp_overlay.fadeOut(settings.animation_speed,function(){if(settings.hideflash)e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility","visible");e(this).remove();e(window).unbind("scroll.prettyphoto");r();settings.callback();doresize=true;f=false;delete settings})};if(!pp_alreadyInitialized&&t()){pp_alreadyInitialized=true;hashIndex=t();hashRel=hashIndex;hashIndex=hashIndex.substring(hashIndex.indexOf("/")+1,hashIndex.length-1);hashRel=hashRel.substring(0,hashRel.indexOf("/"));setTimeout(function(){e("a["+s.hook+"^='"+hashRel+"']:eq("+hashIndex+")").trigger("click")},50)}return this.unbind("click.prettyphoto").bind("click.prettyphoto",e.prettyPhoto.initialize)};})(jQuery);var pp_alreadyInitialized=false

function main() {

(function () {
   'use strict';
   
   // Testimonial slider
  	$('a.page-scroll').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top - 40
            }, 900);
            return false;
          }
        }
      });

  	$(document).ready(function() {
  	    $("#testimonial").owlCarousel({
        navigation : false, // Show next and prev buttons
        slideSpeed : 300,
        paginationSpeed : 400,
        singleItem:true
        });

  	});
	

  	// Portfolio isotope filter
    $(window).load(function() {
        var $container = $('.project-items');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        $('.cat a').click(function() {
            $('.cat .active').removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false
                }
            });
            
            return false;
        });

    });
	

  	// Pretty Photo
	
  $("a[rel^='prettyPhoto']").prettyPhoto({
		social_tools: false
	});	

}());


}
main();

/*
 *  jQuery OwlCarousel v1.3.2
 *
 *  Copyright (c) 2013 Bartosz Wojciechowski
 *  http://www.owlgraphic.com/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function ($, window, document) {

    var Carousel = {
        init : function (options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent : function () {
            var base = this, url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn : function () {
            var base = this;

            base.$elem.data("owl-originalStyles", base.$elem.attr("style"))
                      .data("owl-originalClasses", base.$elem.attr("class"));

            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars : function () {
            var base = this;
            if (base.$elem.children().length === 0) {return false; }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup : function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate : function () {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars : function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload : function () {
            var base = this;
            window.setTimeout(function () {
                base.updateVars();
            }, 0);
        },

        watchVisibility : function () {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems : function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass : function () {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems : function () {
            var base = this, width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function (a, b) {return a[0] - b[0]; });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response : function () {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition : function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes : function () {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this
                    .css({"width": base.itemWidth})
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes : function () {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll : function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth : function () {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items);
        },

        max : function () {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min : function () {
            return 0;
        },

        loops : function () {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls : function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons : function () {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class" : "owl-prev",
                "html" : base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class" : "owl-next",
                "html" : base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination : function () {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination : function () {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class" : "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination : function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function () {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation : function () {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls : function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls : function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo : function (position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }

            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo : function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo : function () {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop : function () {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp : function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play : function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed : function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed : function (speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition : function () {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate : function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d : function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move : function (value) {
            var base = this;
            base.$owlWrapper.css({"left" : value});
        },

        css2slide : function (value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left" : value
            }, {
                duration : speed || base.options.slideSpeed,
                complete : function () {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser : function () {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                                  "; -ms-transform:"     + translate3D +
                                  "; -o-transform:"      + translate3D +
                                  "; -webkit-transform:" + translate3D +
                                  "; transform:"         + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            support3d = (asSupport !== null && asSupport.length === 1);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d" : support3d,
                "isTouch" : isTouch
            };
        },

        moveEvents : function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes : function () {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents :  function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) { event.preventDefault(); });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures : function () {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX : 0,
                    offsetY : 0,
                    baseElWidth : 0,
                    relativePos : 0,
                    position: null,
                    minSwipe : null,
                    maxSwipe: null,
                    sliding : null,
                    dargging: null,
                    targetElement : null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x : event.touches[0].pageX,
                        y : event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x : event.pageX,
                            y : event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x : event.clientX,
                            y : event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function () {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition : function () {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition  = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem : function () {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection : function () {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents : function () {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover : function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad : function () {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    base.lazyPreload($item, $lazyImg);
                }
            }
        },

        lazyPreload : function ($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {//if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight : function () {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg : function (img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems : function () {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes : function (className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition : function () {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin" : origin + "px",
                    "-moz-perspective-origin" : origin + "px",
                    "perspective-origin" : origin + "px"
                });
            function transStyles(prevPos) {
                return {
                    "position" : "relative",
                    "left" : prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function () {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function () {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle : function (item, classToRemove) {
            var base = this;
            item.css({
                "position" : "",
                "left" : ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus : function () {
            var base = this;
            base.owl = {
                "userOptions"   : base.userOptions,
                "baseElement"   : base.$elem,
                "userItems"     : base.$userItems,
                "owlItems"      : base.$owlItems,
                "currentItem"   : base.currentItem,
                "prevItem"      : base.prevItem,
                "visibleItems"  : base.visibleItems,
                "isTouch"       : base.browser.isTouch,
                "browser"       : base.browser,
                "dragDirection" : base.dragDirection
            };
        },

        clearEvents : function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap : function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem
                .attr("style", base.$elem.data("owl-originalStyles") || "")
                .attr("class", base.$elem.data("owl-originalClasses"));
        },

        destroy : function () {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit : function (newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem : function (htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {return false; }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem : function (targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items : 5,
        itemsCustom : false,
        itemsDesktop : [1199, 4],
        itemsDesktopSmall : [979, 3],
        itemsTablet : [768, 2],
        itemsTabletSmall : false,
        itemsMobile : [479, 1],
        singleItem : false,
        itemsScaleUp : false,

        slideSpeed : 200,
        paginationSpeed : 800,
        rewindSpeed : 1000,

        autoPlay : false,
        stopOnHover : false,

        navigation : false,
        navigationText : ["prev", "next"],
        rewindNav : true,
        scrollPerPage : false,

        pagination : true,
        paginationNumbers : false,

        responsive : true,
        responsiveRefreshRate : 200,
        responsiveBaseWidth : window,

        baseClass : "owl-carousel",
        theme : "owl-theme",

        lazyLoad : false,
        lazyFollow : true,
        lazyEffect : "fade",

        autoHeight : false,

        jsonPath : false,
        jsonSuccess : false,

        dragBeforeAnimFinish : true,
        mouseDrag : true,
        touchDrag : true,

        addClassActive : false,
        transitionStyle : false,

        beforeUpdate : false,
        afterUpdate : false,
        beforeInit : false,
        afterInit : false,
        beforeMove : false,
        afterMove : false,
        afterAction : false,
        startDragging : false,
        afterLazyLoad: false
    };
}(jQuery, window, document));
// SmoothScroll for websites v1.2.1
// Licensed under the terms of the MIT license.

// People involved
//  - Balazs Galambosi (maintainer)  
//  - Michael Herf     (Pulse Algorithm)

(function(){
  
// Scroll Variables (tweakable)
var defaultOptions = {

    // Scrolling Core
    frameRate        : 150, // [Hz]
    animationTime    : 400, // [px]
    stepSize         : 120, // [px]

    // Pulse (less tweakable)
    // ratio of "tail" to "acceleration"
    pulseAlgorithm   : true,
    pulseScale       : 8,
    pulseNormalize   : 1,

    // Acceleration
    accelerationDelta : 20,  // 20
    accelerationMax   : 1,   // 1

    // Keyboard Settings
    keyboardSupport   : true,  // option
    arrowScroll       : 50,     // [px]

    // Other
    touchpadSupport   : true,
    fixedBackground   : true, 
    excluded          : ""    
};

var options = defaultOptions;


// Other Variables
var isExcluded = false;
var isFrame = false;
var direction = { x: 0, y: 0 };
var initDone  = false;
var root = document.documentElement;
var activeElement;
var observer;
var deltaBuffer = [ 120, 120, 120 ];

var key = { left: 37, up: 38, right: 39, down: 40, spacebar: 32, 
            pageup: 33, pagedown: 34, end: 35, home: 36 };


/***********************************************
 * SETTINGS
 ***********************************************/

var options = defaultOptions;


/***********************************************
 * INITIALIZE
 ***********************************************/

/**
 * Tests if smooth scrolling is allowed. Shuts down everything if not.
 */
function initTest() {

    var disableKeyboard = false; 
    
    // disable keyboard support if anything above requested it
    if (disableKeyboard) {
        removeEvent("keydown", keydown);
    }

    if (options.keyboardSupport && !disableKeyboard) {
        addEvent("keydown", keydown);
    }
}

/**
 * Sets up scrolls array, determines if frames are involved.
 */
function init() {
  
    if (!document.body) return;

    var body = document.body;
    var html = document.documentElement;
    var windowHeight = window.innerHeight; 
    var scrollHeight = body.scrollHeight;
    
    // check compat mode for root element
    root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
    activeElement = body;
    
    initTest();
    initDone = true;

    // Checks if this script is running in a frame
    if (top != self) {
        isFrame = true;
    }

    /**
     * This fixes a bug where the areas left and right to 
     * the content does not trigger the onmousewheel event
     * on some pages. e.g.: html, body { height: 100% }
     */
    else if (scrollHeight > windowHeight &&
            (body.offsetHeight <= windowHeight || 
             html.offsetHeight <= windowHeight)) {

        html.style.height = 'auto';
        setTimeout(refresh, 10);

        // clearfix
        if (root.offsetHeight <= windowHeight) {
            var underlay = document.createElement("div"); 	
            underlay.style.clear = "both";
            body.appendChild(underlay);
        }
    }

    // disable fixed background
    if (!options.fixedBackground && !isExcluded) {
        body.style.backgroundAttachment = "scroll";
        html.style.backgroundAttachment = "scroll";
    }
}


/************************************************
 * SCROLLING 
 ************************************************/
 
var que = [];
var pending = false;
var lastScroll = +new Date;

/**
 * Pushes scroll actions to the scrolling queue.
 */
function scrollArray(elem, left, top, delay) {
    
    delay || (delay = 1000);
    directionCheck(left, top);

    if (options.accelerationMax != 1) {
        var now = +new Date;
        var elapsed = now - lastScroll;
        if (elapsed < options.accelerationDelta) {
            var factor = (1 + (30 / elapsed)) / 2;
            if (factor > 1) {
                factor = Math.min(factor, options.accelerationMax);
                left *= factor;
                top  *= factor;
            }
        }
        lastScroll = +new Date;
    }          
    
    // push a scroll command
    que.push({
        x: left, 
        y: top, 
        lastX: (left < 0) ? 0.99 : -0.99,
        lastY: (top  < 0) ? 0.99 : -0.99, 
        start: +new Date
    });
        
    // don't act if there's a pending queue
    if (pending) {
        return;
    }  

    var scrollWindow = (elem === document.body);
    
    var step = function (time) {
        
        var now = +new Date;
        var scrollX = 0;
        var scrollY = 0; 
    
        for (var i = 0; i < que.length; i++) {
            
            var item = que[i];
            var elapsed  = now - item.start;
            var finished = (elapsed >= options.animationTime);
            
            // scroll position: [0, 1]
            var position = (finished) ? 1 : elapsed / options.animationTime;
            
            // easing [optional]
            if (options.pulseAlgorithm) {
                position = pulse(position);
            }
            
            // only need the difference
            var x = (item.x * position - item.lastX) >> 0;
            var y = (item.y * position - item.lastY) >> 0;
            
            // add this to the total scrolling
            scrollX += x;
            scrollY += y;            
            
            // update last values
            item.lastX += x;
            item.lastY += y;
        
            // delete and step back if it's over
            if (finished) {
                que.splice(i, 1); i--;
            }           
        }

        // scroll left and top
        if (scrollWindow) {
            window.scrollBy(scrollX, scrollY);
        } 
        else {
            if (scrollX) elem.scrollLeft += scrollX;
            if (scrollY) elem.scrollTop  += scrollY;                    
        }
        
        // clean up if there's nothing left to do
        if (!left && !top) {
            que = [];
        }
        
        if (que.length) { 
            requestFrame(step, elem, (delay / options.frameRate + 1)); 
        } else { 
            pending = false;
        }
    };
    
    // start a new queue of actions
    requestFrame(step, elem, 0);
    pending = true;
}


/***********************************************
 * EVENTS
 ***********************************************/

/**
 * Mouse wheel handler.
 * @param {Object} event
 */
function wheel(event) {

    if (!initDone) {
        init();
    }
    
    var target = event.target;
    var overflowing = overflowingAncestor(target);
    
    // use default if there's no overflowing
    // element or default action is prevented    
    if (!overflowing || event.defaultPrevented ||
        isNodeName(activeElement, "embed") ||
       (isNodeName(target, "embed") && /\.pdf/i.test(target.src))) {
        return true;
    }

    var deltaX = event.wheelDeltaX || 0;
    var deltaY = event.wheelDeltaY || 0;
    
    // use wheelDelta if deltaX/Y is not available
    if (!deltaX && !deltaY) {
        deltaY = event.wheelDelta || 0;
    }

    // check if it's a touchpad scroll that should be ignored
    if (!options.touchpadSupport && isTouchpad(deltaY)) {
        return true;
    }

    // scale by step size
    // delta is 120 most of the time
    // synaptics seems to send 1 sometimes
    if (Math.abs(deltaX) > 1.2) {
        deltaX *= options.stepSize / 120;
    }
    if (Math.abs(deltaY) > 1.2) {
        deltaY *= options.stepSize / 120;
    }
    
    scrollArray(overflowing, -deltaX, -deltaY);
    event.preventDefault();
}

/**
 * Keydown event handler.
 * @param {Object} event
 */
function keydown(event) {

    var target   = event.target;
    var modifier = event.ctrlKey || event.altKey || event.metaKey || 
                  (event.shiftKey && event.keyCode !== key.spacebar);
    
    // do nothing if user is editing text
    // or using a modifier key (except shift)
    // or in a dropdown
    if ( /input|textarea|select|embed/i.test(target.nodeName) ||
         target.isContentEditable || 
         event.defaultPrevented   ||
         modifier ) {
      return true;
    }
    // spacebar should trigger button press
    if (isNodeName(target, "button") &&
        event.keyCode === key.spacebar) {
      return true;
    }
    
    var shift, x = 0, y = 0;
    var elem = overflowingAncestor(activeElement);
    var clientHeight = elem.clientHeight;

    if (elem == document.body) {
        clientHeight = window.innerHeight;
    }

    switch (event.keyCode) {
        case key.up:
            y = -options.arrowScroll;
            break;
        case key.down:
            y = options.arrowScroll;
            break;         
        case key.spacebar: // (+ shift)
            shift = event.shiftKey ? 1 : -1;
            y = -shift * clientHeight * 0.9;
            break;
        case key.pageup:
            y = -clientHeight * 0.9;
            break;
        case key.pagedown:
            y = clientHeight * 0.9;
            break;
        case key.home:
            y = -elem.scrollTop;
            break;
        case key.end:
            var damt = elem.scrollHeight - elem.scrollTop - clientHeight;
            y = (damt > 0) ? damt+10 : 0;
            break;
        case key.left:
            x = -options.arrowScroll;
            break;
        case key.right:
            x = options.arrowScroll;
            break;            
        default:
            return true; // a key we don't care about
    }

    scrollArray(elem, x, y);
    event.preventDefault();
}

/**
 * Mousedown event only for updating activeElement
 */
function mousedown(event) {
    activeElement = event.target;
}


/***********************************************
 * OVERFLOW
 ***********************************************/
 
var cache = {}; // cleared out every once in while
setInterval(function () { cache = {}; }, 10 * 1000);

var uniqueID = (function () {
    var i = 0;
    return function (el) {
        return el.uniqueID || (el.uniqueID = i++);
    };
})();

function setCache(elems, overflowing) {
    for (var i = elems.length; i--;)
        cache[uniqueID(elems[i])] = overflowing;
    return overflowing;
}

function overflowingAncestor(el) {
    var elems = [];
    var rootScrollHeight = root.scrollHeight;
    do {
        var cached = cache[uniqueID(el)];
        if (cached) {
            return setCache(elems, cached);
        }
        elems.push(el);
        if (rootScrollHeight === el.scrollHeight) {
            if (!isFrame || root.clientHeight + 10 < rootScrollHeight) {
                return setCache(elems, document.body); // scrolling root in WebKit
            }
        } else if (el.clientHeight + 10 < el.scrollHeight) {
            overflow = getComputedStyle(el, "").getPropertyValue("overflow-y");
            if (overflow === "scroll" || overflow === "auto") {
                return setCache(elems, el);
            }
        }
    } while (el = el.parentNode);
}


/***********************************************
 * HELPERS
 ***********************************************/

function addEvent(type, fn, bubble) {
    window.addEventListener(type, fn, (bubble||false));
}

function removeEvent(type, fn, bubble) {
    window.removeEventListener(type, fn, (bubble||false));  
}

function isNodeName(el, tag) {
    return (el.nodeName||"").toLowerCase() === tag.toLowerCase();
}

function directionCheck(x, y) {
    x = (x > 0) ? 1 : -1;
    y = (y > 0) ? 1 : -1;
    if (direction.x !== x || direction.y !== y) {
        direction.x = x;
        direction.y = y;
        que = [];
        lastScroll = 0;
    }
}

var deltaBufferTimer;

function isTouchpad(deltaY) {
    if (!deltaY) return;
    deltaY = Math.abs(deltaY)
    deltaBuffer.push(deltaY);
    deltaBuffer.shift();
    clearTimeout(deltaBufferTimer);

    var allEquals    = (deltaBuffer[0] == deltaBuffer[1] && 
                        deltaBuffer[1] == deltaBuffer[2]);
    var allDivisable = (isDivisible(deltaBuffer[0], 120) &&
                        isDivisible(deltaBuffer[1], 120) &&
                        isDivisible(deltaBuffer[2], 120));
    return !(allEquals || allDivisable);
} 

function isDivisible(n, divisor) {
    return (Math.floor(n / divisor) == n / divisor);
}

var requestFrame = (function () {
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              function (callback, element, delay) {
                  window.setTimeout(callback, delay || (1000/60));
              };
})();


/***********************************************
 * PULSE
 ***********************************************/
 
/**
 * Viscous fluid with a pulse for part and decay for the rest.
 * - Applies a fixed force over an interval (a damped acceleration), and
 * - Lets the exponential bleed away the velocity over a longer interval
 * - Michael Herf, http://stereopsis.com/stopping/
 */
function pulse_(x) {
    var val, start, expx;
    // test
    x = x * options.pulseScale;
    if (x < 1) { // acceleartion
        val = x - (1 - Math.exp(-x));
    } else {     // tail
        // the previous animation ended here:
        start = Math.exp(-1);
        // simple viscous drag
        x -= 1;
        expx = 1 - Math.exp(-x);
        val = start + (expx * (1 - start));
    }
    return val * options.pulseNormalize;
}

function pulse(x) {
    if (x >= 1) return 1;
    if (x <= 0) return 0;

    if (options.pulseNormalize == 1) {
        options.pulseNormalize /= pulse_(1);
    }
    return pulse_(x);
}

var isChrome = /chrome/i.test(window.navigator.userAgent);
var isMouseWheelSupported = 'onmousewheel' in document; 

if (isMouseWheelSupported && isChrome) {
	addEvent("mousedown", mousedown);
	addEvent("mousewheel", wheel);
	addEvent("load", init);
};

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5pc290b3BlLmpzIiwianF1ZXJ5LnByZXR0eVBob3RvLmpzIiwibWFpbi5qcyIsIm93bC5jYXJvdXNlbC5qcyIsIlNtb290aFNjcm9sbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5M0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDditDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhc3NldHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIElzb3RvcGUgdjEuNS4yNVxuICogQW4gZXhxdWlzaXRlIGpRdWVyeSBwbHVnaW4gZm9yIG1hZ2ljYWwgbGF5b3V0c1xuICogaHR0cDovL2lzb3RvcGUubWV0YWZpenp5LmNvXG4gKlxuICogQ29tbWVyY2lhbCB1c2UgcmVxdWlyZXMgb25lLXRpbWUgbGljZW5zZSBmZWVcbiAqIGh0dHA6Ly9tZXRhZml6enkuY28vI2xpY2Vuc2VzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgRGF2aWQgRGVTYW5kcm8gLyBNZXRhZml6enlcbiAqL1xuXG4vKmpzaGludCBhc2k6IHRydWUsIGJyb3dzZXI6IHRydWUsIGN1cmx5OiB0cnVlLCBlcWVxZXE6IHRydWUsIGZvcmluOiBmYWxzZSwgaW1tZWQ6IGZhbHNlLCBuZXdjYXA6IHRydWUsIG5vZW1wdHk6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUgKi9cbi8qZ2xvYmFsIGpRdWVyeTogZmFsc2UgKi9cblxuKGZ1bmN0aW9uKCB3aW5kb3csICQsIHVuZGVmaW5lZCApe1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBnZXQgZ2xvYmFsIHZhcnNcbiAgdmFyIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xuICB2YXIgTW9kZXJuaXpyID0gd2luZG93Lk1vZGVybml6cjtcblxuICAvLyBoZWxwZXIgZnVuY3Rpb25cbiAgdmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbiggc3RyICkge1xuICAgIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG4gIH07XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PSBnZXRTdHlsZVByb3BlcnR5IGJ5IGthbmdheCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIGh0dHA6Ly9wZXJmZWN0aW9ua2lsbHMuY29tL2ZlYXR1cmUtdGVzdGluZy1jc3MtcHJvcGVydGllcy9cblxuICB2YXIgcHJlZml4ZXMgPSAnTW96IFdlYmtpdCBPIE1zJy5zcGxpdCgnICcpO1xuXG4gIHZhciBnZXRTdHlsZVByb3BlcnR5ID0gZnVuY3Rpb24oIHByb3BOYW1lICkge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSxcbiAgICAgICAgcHJlZml4ZWQ7XG5cbiAgICAvLyB0ZXN0IHN0YW5kYXJkIHByb3BlcnR5IGZpcnN0XG4gICAgaWYgKCB0eXBlb2Ygc3R5bGVbcHJvcE5hbWVdID09PSAnc3RyaW5nJyApIHtcbiAgICAgIHJldHVybiBwcm9wTmFtZTtcbiAgICB9XG5cbiAgICAvLyBjYXBpdGFsaXplXG4gICAgcHJvcE5hbWUgPSBjYXBpdGFsaXplKCBwcm9wTmFtZSApO1xuXG4gICAgLy8gdGVzdCB2ZW5kb3Igc3BlY2lmaWMgcHJvcGVydGllc1xuICAgIGZvciAoIHZhciBpPTAsIGxlbiA9IHByZWZpeGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgcHJlZml4ZWQgPSBwcmVmaXhlc1tpXSArIHByb3BOYW1lO1xuICAgICAgaWYgKCB0eXBlb2Ygc3R5bGVbIHByZWZpeGVkIF0gPT09ICdzdHJpbmcnICkge1xuICAgICAgICByZXR1cm4gcHJlZml4ZWQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciB0cmFuc2Zvcm1Qcm9wID0gZ2V0U3R5bGVQcm9wZXJ0eSgndHJhbnNmb3JtJyksXG4gICAgICB0cmFuc2l0aW9uUHJvcCA9IGdldFN0eWxlUHJvcGVydHkoJ3RyYW5zaXRpb25Qcm9wZXJ0eScpO1xuXG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PSBtaW5pTW9kZXJuaXpyID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gPDM8MzwzIGFuZCB0aGFua3MgdG8gRmFydWsgYW5kIFBhdWwgZm9yIGRvaW5nIHRoZSBoZWF2eSBsaWZ0aW5nXG5cbiAgLyohXG4gICAqIE1vZGVybml6ciB2MS42aXNoOiBtaW5pTW9kZXJuaXpyIGZvciBJc290b3BlXG4gICAqIGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbVxuICAgKlxuICAgKiBEZXZlbG9wZWQgYnk6XG4gICAqIC0gRmFydWsgQXRlcyAgaHR0cDovL2ZhcnVrYXQuZXMvXG4gICAqIC0gUGF1bCBJcmlzaCAgaHR0cDovL3BhdWxpcmlzaC5jb20vXG4gICAqXG4gICAqIENvcHlyaWdodCAoYykgMjAwOS0yMDEwXG4gICAqIER1YWwtbGljZW5zZWQgdW5kZXIgdGhlIEJTRCBvciBNSVQgbGljZW5zZXMuXG4gICAqIGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS9saWNlbnNlL1xuICAgKi9cblxuICAvKlxuICAgKiBUaGlzIHZlcnNpb24gd2hpdHRsZXMgZG93biB0aGUgc2NyaXB0IGp1c3QgdG8gY2hlY2sgc3VwcG9ydCBmb3JcbiAgICogQ1NTIHRyYW5zaXRpb25zLCB0cmFuc2Zvcm1zLCBhbmQgM0QgdHJhbnNmb3Jtcy5cbiAgKi9cblxuICB2YXIgdGVzdHMgPSB7XG4gICAgY3NzdHJhbnNmb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISF0cmFuc2Zvcm1Qcm9wO1xuICAgIH0sXG5cbiAgICBjc3N0cmFuc2Zvcm1zM2Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRlc3QgPSAhIWdldFN0eWxlUHJvcGVydHkoJ3BlcnNwZWN0aXZlJyk7XG4gICAgICAvLyBkb3VibGUgY2hlY2sgZm9yIENocm9tZSdzIGZhbHNlIHBvc2l0aXZlXG4gICAgICBpZiAoIHRlc3QgKSB7XG4gICAgICAgIHZhciB2ZW5kb3JDU1NQcmVmaXhlcyA9ICcgLW8tIC1tb3otIC1tcy0gLXdlYmtpdC0gLWtodG1sLSAnLnNwbGl0KCcgJyksXG4gICAgICAgICAgICBtZWRpYVF1ZXJ5ID0gJ0BtZWRpYSAoJyArIHZlbmRvckNTU1ByZWZpeGVzLmpvaW4oJ3RyYW5zZm9ybS0zZCksKCcpICsgJ21vZGVybml6ciknLFxuICAgICAgICAgICAgJHN0eWxlID0gJCgnPHN0eWxlPicgKyBtZWRpYVF1ZXJ5ICsgJ3sjbW9kZXJuaXpye2hlaWdodDozcHh9fScgKyAnPC9zdHlsZT4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKCdoZWFkJyksXG4gICAgICAgICAgICAkZGl2ID0gJCgnPGRpdiBpZD1cIm1vZGVybml6clwiIC8+JykuYXBwZW5kVG8oJ2h0bWwnKTtcblxuICAgICAgICB0ZXN0ID0gJGRpdi5oZWlnaHQoKSA9PT0gMztcblxuICAgICAgICAkZGl2LnJlbW92ZSgpO1xuICAgICAgICAkc3R5bGUucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVzdDtcbiAgICB9LFxuXG4gICAgY3NzdHJhbnNpdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICEhdHJhbnNpdGlvblByb3A7XG4gICAgfVxuICB9O1xuXG4gIHZhciB0ZXN0TmFtZTtcblxuICBpZiAoIE1vZGVybml6ciApIHtcbiAgICAvLyBpZiB0aGVyZSdzIGEgcHJldmlvdXMgTW9kZXJuemlyLCBjaGVjayBpZiB0aGVyZSBhcmUgbmVjZXNzYXJ5IHRlc3RzXG4gICAgZm9yICggdGVzdE5hbWUgaW4gdGVzdHMpIHtcbiAgICAgIGlmICggIU1vZGVybml6ci5oYXNPd25Qcm9wZXJ0eSggdGVzdE5hbWUgKSApIHtcbiAgICAgICAgLy8gaWYgdGVzdCBoYXNuJ3QgYmVlbiBydW4sIHVzZSBhZGRUZXN0IHRvIHJ1biBpdFxuICAgICAgICBNb2Rlcm5penIuYWRkVGVzdCggdGVzdE5hbWUsIHRlc3RzWyB0ZXN0TmFtZSBdICk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIG9yIGNyZWF0ZSBuZXcgbWluaSBNb2Rlcm5penIgdGhhdCBqdXN0IGhhcyB0aGUgMyB0ZXN0c1xuICAgIE1vZGVybml6ciA9IHdpbmRvdy5Nb2Rlcm5penIgPSB7XG4gICAgICBfdmVyc2lvbiA6ICcxLjZpc2g6IG1pbmlNb2Rlcm5penIgZm9yIElzb3RvcGUnXG4gICAgfTtcblxuICAgIHZhciBjbGFzc2VzID0gJyAnO1xuICAgIHZhciByZXN1bHQ7XG5cbiAgICAvLyBSdW4gdGhyb3VnaCB0ZXN0c1xuICAgIGZvciAoIHRlc3ROYW1lIGluIHRlc3RzKSB7XG4gICAgICByZXN1bHQgPSB0ZXN0c1sgdGVzdE5hbWUgXSgpO1xuICAgICAgTW9kZXJuaXpyWyB0ZXN0TmFtZSBdID0gcmVzdWx0O1xuICAgICAgY2xhc3NlcyArPSAnICcgKyAoIHJlc3VsdCA/ICAnJyA6ICduby0nICkgKyB0ZXN0TmFtZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIG5ldyBjbGFzc2VzIHRvIHRoZSA8aHRtbD4gZWxlbWVudC5cbiAgICAkKCdodG1sJykuYWRkQ2xhc3MoIGNsYXNzZXMgKTtcbiAgfVxuXG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PSBpc29UcmFuc2Zvcm0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qKlxuICAgKiAgcHJvdmlkZXMgaG9va3MgZm9yIC5jc3MoeyBzY2FsZTogdmFsdWUsIHRyYW5zbGF0ZTogW3gsIHldIH0pXG4gICAqICBQcm9ncmVzc2l2ZWx5IGVuaGFuY2VkIENTUyB0cmFuc2Zvcm1zXG4gICAqICBVc2VzIGhhcmR3YXJlIGFjY2VsZXJhdGVkIDNEIHRyYW5zZm9ybXMgZm9yIFNhZmFyaVxuICAgKiAgb3IgZmFsbHMgYmFjayB0byAyRCB0cmFuc2Zvcm1zLlxuICAgKi9cblxuICBpZiAoIE1vZGVybml6ci5jc3N0cmFuc2Zvcm1zICkge1xuXG4gICAgICAgIC8vIGkuZS4gdHJhbnNmb3JtRm5Ob3RhdGlvbnMuc2NhbGUoMC41KSA+PiAnc2NhbGUzZCggMC41LCAwLjUsIDEpJ1xuICAgIHZhciB0cmFuc2Zvcm1Gbk5vdGF0aW9ucyA9IE1vZGVybml6ci5jc3N0cmFuc2Zvcm1zM2QgP1xuICAgICAgeyAvLyAzRCB0cmFuc2Zvcm0gZnVuY3Rpb25zXG4gICAgICAgIHRyYW5zbGF0ZSA6IGZ1bmN0aW9uICggcG9zaXRpb24gKSB7XG4gICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUzZCgnICsgcG9zaXRpb25bMF0gKyAncHgsICcgKyBwb3NpdGlvblsxXSArICdweCwgMCkgJztcbiAgICAgICAgfSxcbiAgICAgICAgc2NhbGUgOiBmdW5jdGlvbiAoIHNjYWxlICkge1xuICAgICAgICAgIHJldHVybiAnc2NhbGUzZCgnICsgc2NhbGUgKyAnLCAnICsgc2NhbGUgKyAnLCAxKSAnO1xuICAgICAgICB9XG4gICAgICB9IDpcbiAgICAgIHsgLy8gMkQgdHJhbnNmb3JtIGZ1bmN0aW9uc1xuICAgICAgICB0cmFuc2xhdGUgOiBmdW5jdGlvbiAoIHBvc2l0aW9uICkge1xuICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBwb3NpdGlvblswXSArICdweCwgJyArIHBvc2l0aW9uWzFdICsgJ3B4KSAnO1xuICAgICAgICB9LFxuICAgICAgICBzY2FsZSA6IGZ1bmN0aW9uICggc2NhbGUgKSB7XG4gICAgICAgICAgcmV0dXJuICdzY2FsZSgnICsgc2NhbGUgKyAnKSAnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgO1xuXG4gICAgdmFyIHNldElzb1RyYW5zZm9ybSA9IGZ1bmN0aW9uICggZWxlbSwgbmFtZSwgdmFsdWUgKSB7XG4gICAgICAgICAgLy8gdW5wYWNrIGN1cnJlbnQgdHJhbnNmb3JtIGRhdGFcbiAgICAgIHZhciBkYXRhID0gICQuZGF0YSggZWxlbSwgJ2lzb1RyYW5zZm9ybScgKSB8fCB7fSxcbiAgICAgICAgICBuZXdEYXRhID0ge30sXG4gICAgICAgICAgZm5OYW1lLFxuICAgICAgICAgIHRyYW5zZm9ybU9iaiA9IHt9LFxuICAgICAgICAgIHRyYW5zZm9ybVZhbHVlO1xuXG4gICAgICAvLyBpLmUuIG5ld0RhdGEuc2NhbGUgPSAwLjVcbiAgICAgIG5ld0RhdGFbIG5hbWUgXSA9IHZhbHVlO1xuICAgICAgLy8gZXh0ZW5kIG5ldyB2YWx1ZSBvdmVyIGN1cnJlbnQgZGF0YVxuICAgICAgJC5leHRlbmQoIGRhdGEsIG5ld0RhdGEgKTtcblxuICAgICAgZm9yICggZm5OYW1lIGluIGRhdGEgKSB7XG4gICAgICAgIHRyYW5zZm9ybVZhbHVlID0gZGF0YVsgZm5OYW1lIF07XG4gICAgICAgIHRyYW5zZm9ybU9ialsgZm5OYW1lIF0gPSB0cmFuc2Zvcm1Gbk5vdGF0aW9uc1sgZm5OYW1lIF0oIHRyYW5zZm9ybVZhbHVlICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBwcm9wZXIgb3JkZXJcbiAgICAgIC8vIGlkZWFsbHksIHdlIGNvdWxkIGxvb3AgdGhyb3VnaCB0aGlzIGdpdmUgYW4gYXJyYXksIGJ1dCBzaW5jZSB3ZSBvbmx5IGhhdmVcbiAgICAgIC8vIGEgY291cGxlIHRyYW5zZm9ybXMgd2UncmUga2VlcGluZyB0cmFjayBvZiwgd2UnbGwgZG8gaXQgbGlrZSBzb1xuICAgICAgdmFyIHRyYW5zbGF0ZUZuID0gdHJhbnNmb3JtT2JqLnRyYW5zbGF0ZSB8fCAnJyxcbiAgICAgICAgICBzY2FsZUZuID0gdHJhbnNmb3JtT2JqLnNjYWxlIHx8ICcnLFxuICAgICAgICAgIC8vIHNvcnRpbmcgc28gdHJhbnNsYXRlIGFsd2F5cyBjb21lcyBmaXJzdFxuICAgICAgICAgIHZhbHVlRm5zID0gdHJhbnNsYXRlRm4gKyBzY2FsZUZuO1xuXG4gICAgICAvLyBzZXQgZGF0YSBiYWNrIGluIGVsZW1cbiAgICAgICQuZGF0YSggZWxlbSwgJ2lzb1RyYW5zZm9ybScsIGRhdGEgKTtcblxuICAgICAgLy8gc2V0IG5hbWUgdG8gdmVuZG9yIHNwZWNpZmljIHByb3BlcnR5XG4gICAgICBlbGVtLnN0eWxlWyB0cmFuc2Zvcm1Qcm9wIF0gPSB2YWx1ZUZucztcbiAgICB9O1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gc2NhbGUgPT09PT09PT09PT09PT09PT09PVxuXG4gICAgJC5jc3NOdW1iZXIuc2NhbGUgPSB0cnVlO1xuXG4gICAgJC5jc3NIb29rcy5zY2FsZSA9IHtcbiAgICAgIHNldDogZnVuY3Rpb24oIGVsZW0sIHZhbHVlICkge1xuICAgICAgICAvLyB1bmNvbW1lbnQgdGhpcyBiaXQgaWYgeW91IHdhbnQgdG8gcHJvcGVybHkgcGFyc2Ugc3RyaW5nc1xuICAgICAgICAvLyBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgIC8vICAgdmFsdWUgPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuICAgICAgICAvLyB9XG4gICAgICAgIHNldElzb1RyYW5zZm9ybSggZWxlbSwgJ3NjYWxlJywgdmFsdWUgKTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCBlbGVtLCBjb21wdXRlZCApIHtcbiAgICAgICAgdmFyIHRyYW5zZm9ybSA9ICQuZGF0YSggZWxlbSwgJ2lzb1RyYW5zZm9ybScgKTtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybSAmJiB0cmFuc2Zvcm0uc2NhbGUgPyB0cmFuc2Zvcm0uc2NhbGUgOiAxO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkLmZ4LnN0ZXAuc2NhbGUgPSBmdW5jdGlvbiggZnggKSB7XG4gICAgICAkLmNzc0hvb2tzLnNjYWxlLnNldCggZnguZWxlbSwgZngubm93K2Z4LnVuaXQgKTtcbiAgICB9O1xuXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSB0cmFuc2xhdGUgPT09PT09PT09PT09PT09PT09PVxuXG4gICAgJC5jc3NOdW1iZXIudHJhbnNsYXRlID0gdHJ1ZTtcblxuICAgICQuY3NzSG9va3MudHJhbnNsYXRlID0ge1xuICAgICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUgKSB7XG5cbiAgICAgICAgLy8gdW5jb21tZW50IHRoaXMgYml0IGlmIHlvdSB3YW50IHRvIHByb3Blcmx5IHBhcnNlIHN0cmluZ3NcbiAgICAgICAgLy8gaWYgKCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAvLyAgIHZhbHVlID0gdmFsdWUuc3BsaXQoJyAnKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvL1xuICAgICAgICAvLyB2YXIgaSwgdmFsO1xuICAgICAgICAvLyBmb3IgKCBpID0gMDsgaSA8IDI7IGkrKyApIHtcbiAgICAgICAgLy8gICB2YWwgPSB2YWx1ZVtpXTtcbiAgICAgICAgLy8gICBpZiAoIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAvLyAgICAgdmFsID0gcGFyc2VJbnQoIHZhbCApO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHNldElzb1RyYW5zZm9ybSggZWxlbSwgJ3RyYW5zbGF0ZScsIHZhbHVlICk7XG4gICAgICB9LFxuXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCBlbGVtLCBjb21wdXRlZCApIHtcbiAgICAgICAgdmFyIHRyYW5zZm9ybSA9ICQuZGF0YSggZWxlbSwgJ2lzb1RyYW5zZm9ybScgKTtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybSAmJiB0cmFuc2Zvcm0udHJhbnNsYXRlID8gdHJhbnNmb3JtLnRyYW5zbGF0ZSA6IFsgMCwgMCBdO1xuICAgICAgfVxuICAgIH07XG5cbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT0gZ2V0IHRyYW5zaXRpb24tZW5kIGV2ZW50ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIHRyYW5zaXRpb25FbmRFdmVudCwgdHJhbnNpdGlvbkR1clByb3A7XG5cbiAgaWYgKCBNb2Rlcm5penIuY3NzdHJhbnNpdGlvbnMgKSB7XG4gICAgdHJhbnNpdGlvbkVuZEV2ZW50ID0ge1xuICAgICAgV2Via2l0VHJhbnNpdGlvblByb3BlcnR5OiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsICAvLyB3ZWJraXRcbiAgICAgIE1velRyYW5zaXRpb25Qcm9wZXJ0eTogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgT1RyYW5zaXRpb25Qcm9wZXJ0eTogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcbiAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogJ3RyYW5zaXRpb25lbmQnXG4gICAgfVsgdHJhbnNpdGlvblByb3AgXTtcblxuICAgIHRyYW5zaXRpb25EdXJQcm9wID0gZ2V0U3R5bGVQcm9wZXJ0eSgndHJhbnNpdGlvbkR1cmF0aW9uJyk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09IHNtYXJ0cmVzaXplID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvKlxuICAgKiBzbWFydHJlc2l6ZTogZGVib3VuY2VkIHJlc2l6ZSBldmVudCBmb3IgalF1ZXJ5XG4gICAqXG4gICAqIGxhdGVzdCB2ZXJzaW9uIGFuZCBjb21wbGV0ZSBSRUFETUUgYXZhaWxhYmxlIG9uIEdpdGh1YjpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2xvdWlzcmVtaS9qcXVlcnkuc21hcnRyZXNpemUuanNcbiAgICpcbiAgICogQ29weXJpZ2h0IDIwMTEgQGxvdWlzX3JlbWlcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICAgKi9cblxuICB2YXIgJGV2ZW50ID0gJC5ldmVudCxcbiAgICAgIGRpc3BhdGNoTWV0aG9kID0gJC5ldmVudC5oYW5kbGUgPyAnaGFuZGxlJyA6ICdkaXNwYXRjaCcsXG4gICAgICByZXNpemVUaW1lb3V0O1xuXG4gICRldmVudC5zcGVjaWFsLnNtYXJ0cmVzaXplID0ge1xuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykuYmluZCggXCJyZXNpemVcIiwgJGV2ZW50LnNwZWNpYWwuc21hcnRyZXNpemUuaGFuZGxlciApO1xuICAgIH0sXG4gICAgdGVhcmRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS51bmJpbmQoIFwicmVzaXplXCIsICRldmVudC5zcGVjaWFsLnNtYXJ0cmVzaXplLmhhbmRsZXIgKTtcbiAgICB9LFxuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKCBldmVudCwgZXhlY0FzYXAgKSB7XG4gICAgICAvLyBTYXZlIHRoZSBjb250ZXh0XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsXG4gICAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgLy8gc2V0IGNvcnJlY3QgZXZlbnQgdHlwZVxuICAgICAgZXZlbnQudHlwZSA9IFwic21hcnRyZXNpemVcIjtcblxuICAgICAgaWYgKCByZXNpemVUaW1lb3V0ICkgeyBjbGVhclRpbWVvdXQoIHJlc2l6ZVRpbWVvdXQgKTsgfVxuICAgICAgcmVzaXplVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRldmVudFsgZGlzcGF0Y2hNZXRob2QgXS5hcHBseSggY29udGV4dCwgYXJncyApO1xuICAgICAgfSwgZXhlY0FzYXAgPT09IFwiZXhlY0FzYXBcIj8gMCA6IDEwMCApO1xuICAgIH1cbiAgfTtcblxuICAkLmZuLnNtYXJ0cmVzaXplID0gZnVuY3Rpb24oIGZuICkge1xuICAgIHJldHVybiBmbiA/IHRoaXMuYmluZCggXCJzbWFydHJlc2l6ZVwiLCBmbiApIDogdGhpcy50cmlnZ2VyKCBcInNtYXJ0cmVzaXplXCIsIFtcImV4ZWNBc2FwXCJdICk7XG4gIH07XG5cblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09IElzb3RvcGUgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cbiAgLy8gb3VyIFwiV2lkZ2V0XCIgb2JqZWN0IGNvbnN0cnVjdG9yXG4gICQuSXNvdG9wZSA9IGZ1bmN0aW9uKCBvcHRpb25zLCBlbGVtZW50LCBjYWxsYmFjayApe1xuICAgIHRoaXMuZWxlbWVudCA9ICQoIGVsZW1lbnQgKTtcblxuICAgIHRoaXMuX2NyZWF0ZSggb3B0aW9ucyApO1xuICAgIHRoaXMuX2luaXQoIGNhbGxiYWNrICk7XG4gIH07XG5cbiAgLy8gc3R5bGVzIG9mIGNvbnRhaW5lciBlbGVtZW50IHdlIHdhbnQgdG8ga2VlcCB0cmFjayBvZlxuICB2YXIgaXNvQ29udGFpbmVyU3R5bGVzID0gWyAnd2lkdGgnLCAnaGVpZ2h0JyBdO1xuXG4gIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gICQuSXNvdG9wZS5zZXR0aW5ncyA9IHtcbiAgICByZXNpemFibGU6IHRydWUsXG4gICAgbGF5b3V0TW9kZSA6ICdtYXNvbnJ5JyxcbiAgICBjb250YWluZXJDbGFzcyA6ICdpc290b3BlJyxcbiAgICBpdGVtQ2xhc3MgOiAnaXNvdG9wZS1pdGVtJyxcbiAgICBoaWRkZW5DbGFzcyA6ICdpc290b3BlLWhpZGRlbicsXG4gICAgaGlkZGVuU3R5bGU6IHsgb3BhY2l0eTogMCwgc2NhbGU6IDAuMDAxIH0sXG4gICAgdmlzaWJsZVN0eWxlOiB7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH0sXG4gICAgY29udGFpbmVyU3R5bGU6IHtcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXG4gICAgfSxcbiAgICBhbmltYXRpb25FbmdpbmU6ICdiZXN0LWF2YWlsYWJsZScsXG4gICAgYW5pbWF0aW9uT3B0aW9uczoge1xuICAgICAgcXVldWU6IGZhbHNlLFxuICAgICAgZHVyYXRpb246IDgwMFxuICAgIH0sXG4gICAgc29ydEJ5IDogJ29yaWdpbmFsLW9yZGVyJyxcbiAgICBzb3J0QXNjZW5kaW5nIDogdHJ1ZSxcbiAgICByZXNpemVzQ29udGFpbmVyIDogdHJ1ZSxcbiAgICB0cmFuc2Zvcm1zRW5hYmxlZDogdHJ1ZSxcbiAgICBpdGVtUG9zaXRpb25EYXRhRW5hYmxlZDogZmFsc2VcbiAgfTtcblxuICAkLklzb3RvcGUucHJvdG90eXBlID0ge1xuXG4gICAgLy8gc2V0cyB1cCB3aWRnZXRcbiAgICBfY3JlYXRlIDogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCB7fSwgJC5Jc290b3BlLnNldHRpbmdzLCBvcHRpb25zICk7XG5cbiAgICAgIHRoaXMuc3R5bGVRdWV1ZSA9IFtdO1xuICAgICAgdGhpcy5lbGVtQ291bnQgPSAwO1xuXG4gICAgICAvLyBnZXQgb3JpZ2luYWwgc3R5bGVzIGluIGNhc2Ugd2UgcmUtYXBwbHkgdGhlbSBpbiAuZGVzdHJveSgpXG4gICAgICB2YXIgZWxlbVN0eWxlID0gdGhpcy5lbGVtZW50WzBdLnN0eWxlO1xuICAgICAgdGhpcy5vcmlnaW5hbFN0eWxlID0ge307XG4gICAgICAvLyBrZWVwIHRyYWNrIG9mIGNvbnRhaW5lciBzdHlsZXNcbiAgICAgIHZhciBjb250YWluZXJTdHlsZXMgPSBpc29Db250YWluZXJTdHlsZXMuc2xpY2UoMCk7XG4gICAgICBmb3IgKCB2YXIgcHJvcCBpbiB0aGlzLm9wdGlvbnMuY29udGFpbmVyU3R5bGUgKSB7XG4gICAgICAgIGNvbnRhaW5lclN0eWxlcy5wdXNoKCBwcm9wICk7XG4gICAgICB9XG4gICAgICBmb3IgKCB2YXIgaT0wLCBsZW4gPSBjb250YWluZXJTdHlsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICAgIHByb3AgPSBjb250YWluZXJTdHlsZXNbaV07XG4gICAgICAgIHRoaXMub3JpZ2luYWxTdHlsZVsgcHJvcCBdID0gZWxlbVN0eWxlWyBwcm9wIF0gfHwgJyc7XG4gICAgICB9XG4gICAgICAvLyBhcHBseSBjb250YWluZXIgc3R5bGUgZnJvbSBvcHRpb25zXG4gICAgICB0aGlzLmVsZW1lbnQuY3NzKCB0aGlzLm9wdGlvbnMuY29udGFpbmVyU3R5bGUgKTtcblxuICAgICAgdGhpcy5fdXBkYXRlQW5pbWF0aW9uRW5naW5lKCk7XG4gICAgICB0aGlzLl91cGRhdGVVc2luZ1RyYW5zZm9ybXMoKTtcblxuICAgICAgLy8gc29ydGluZ1xuICAgICAgdmFyIG9yaWdpbmFsT3JkZXJTb3J0ZXIgPSB7XG4gICAgICAgICdvcmlnaW5hbC1vcmRlcicgOiBmdW5jdGlvbiggJGVsZW0sIGluc3RhbmNlICkge1xuICAgICAgICAgIGluc3RhbmNlLmVsZW1Db3VudCArKztcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2UuZWxlbUNvdW50O1xuICAgICAgICB9LFxuICAgICAgICByYW5kb20gOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5vcHRpb25zLmdldFNvcnREYXRhID0gJC5leHRlbmQoIHRoaXMub3B0aW9ucy5nZXRTb3J0RGF0YSwgb3JpZ2luYWxPcmRlclNvcnRlciApO1xuXG4gICAgICAvLyBuZWVkIHRvIGdldCBhdG9tc1xuICAgICAgdGhpcy5yZWxvYWRJdGVtcygpO1xuXG4gICAgICAvLyBnZXQgdG9wIGxlZnQgcG9zaXRpb24gb2Ygd2hlcmUgdGhlIGJyaWNrcyBzaG91bGQgYmVcbiAgICAgIHRoaXMub2Zmc2V0ID0ge1xuICAgICAgICBsZWZ0OiBwYXJzZUludCggKCB0aGlzLmVsZW1lbnQuY3NzKCdwYWRkaW5nLWxlZnQnKSB8fCAwICksIDEwICksXG4gICAgICAgIHRvcDogcGFyc2VJbnQoICggdGhpcy5lbGVtZW50LmNzcygncGFkZGluZy10b3AnKSB8fCAwICksIDEwIClcbiAgICAgIH07XG5cbiAgICAgIC8vIGFkZCBpc290b3BlIGNsYXNzIGZpcnN0IHRpbWUgYXJvdW5kXG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgIGluc3RhbmNlLmVsZW1lbnQuYWRkQ2xhc3MoIGluc3RhbmNlLm9wdGlvbnMuY29udGFpbmVyQ2xhc3MgKTtcbiAgICAgIH0sIDAgKTtcblxuICAgICAgLy8gYmluZCByZXNpemUgbWV0aG9kXG4gICAgICBpZiAoIHRoaXMub3B0aW9ucy5yZXNpemFibGUgKSB7XG4gICAgICAgICR3aW5kb3cuYmluZCggJ3NtYXJ0cmVzaXplLmlzb3RvcGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGRpc21pc3MgYWxsIGNsaWNrIGV2ZW50cyBmcm9tIGhpZGRlbiBldmVudHNcbiAgICAgIHRoaXMuZWxlbWVudC5kZWxlZ2F0ZSggJy4nICsgdGhpcy5vcHRpb25zLmhpZGRlbkNsYXNzLCAnY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICBfZ2V0QXRvbXMgOiBmdW5jdGlvbiggJGVsZW1zICkge1xuICAgICAgdmFyIHNlbGVjdG9yID0gdGhpcy5vcHRpb25zLml0ZW1TZWxlY3RvcixcbiAgICAgICAgICAvLyBmaWx0ZXIgJiBmaW5kXG4gICAgICAgICAgJGF0b21zID0gc2VsZWN0b3IgPyAkZWxlbXMuZmlsdGVyKCBzZWxlY3RvciApLmFkZCggJGVsZW1zLmZpbmQoIHNlbGVjdG9yICkgKSA6ICRlbGVtcyxcbiAgICAgICAgICAvLyBiYXNlIHN0eWxlIGZvciBhdG9tc1xuICAgICAgICAgIGF0b21TdHlsZSA9IHsgcG9zaXRpb246ICdhYnNvbHV0ZScgfTtcblxuICAgICAgLy8gZmlsdGVyIG91dCB0ZXh0IG5vZGVzXG4gICAgICAkYXRvbXMgPSAkYXRvbXMuZmlsdGVyKCBmdW5jdGlvbiggaSwgYXRvbSApIHtcbiAgICAgICAgcmV0dXJuIGF0b20ubm9kZVR5cGUgPT09IDE7XG4gICAgICB9KTtcblxuICAgICAgaWYgKCB0aGlzLnVzaW5nVHJhbnNmb3JtcyApIHtcbiAgICAgICAgYXRvbVN0eWxlLmxlZnQgPSAwO1xuICAgICAgICBhdG9tU3R5bGUudG9wID0gMDtcbiAgICAgIH1cblxuICAgICAgJGF0b21zLmNzcyggYXRvbVN0eWxlICkuYWRkQ2xhc3MoIHRoaXMub3B0aW9ucy5pdGVtQ2xhc3MgKTtcblxuICAgICAgdGhpcy51cGRhdGVTb3J0RGF0YSggJGF0b21zLCB0cnVlICk7XG5cbiAgICAgIHJldHVybiAkYXRvbXM7XG4gICAgfSxcblxuICAgIC8vIF9pbml0IGZpcmVzIHdoZW4geW91ciBpbnN0YW5jZSBpcyBmaXJzdCBjcmVhdGVkXG4gICAgLy8gKGZyb20gdGhlIGNvbnN0cnVjdG9yIGFib3ZlKSwgYW5kIHdoZW4geW91XG4gICAgLy8gYXR0ZW1wdCB0byBpbml0aWFsaXplIHRoZSB3aWRnZXQgYWdhaW4gKGJ5IHRoZSBicmlkZ2UpXG4gICAgLy8gYWZ0ZXIgaXQgaGFzIGFscmVhZHkgYmVlbiBpbml0aWFsaXplZC5cbiAgICBfaW5pdCA6IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcblxuICAgICAgdGhpcy4kZmlsdGVyZWRBdG9tcyA9IHRoaXMuX2ZpbHRlciggdGhpcy4kYWxsQXRvbXMgKTtcbiAgICAgIHRoaXMuX3NvcnQoKTtcbiAgICAgIHRoaXMucmVMYXlvdXQoIGNhbGxiYWNrICk7XG5cbiAgICB9LFxuXG4gICAgb3B0aW9uIDogZnVuY3Rpb24oIG9wdHMgKXtcbiAgICAgIC8vIGNoYW5nZSBvcHRpb25zIEFGVEVSIGluaXRpYWxpemF0aW9uOlxuICAgICAgLy8gc2lnbmF0dXJlOiAkKCcjZm9vJykuYmFyKHsgY29vbDpmYWxzZSB9KTtcbiAgICAgIGlmICggJC5pc1BsYWluT2JqZWN0KCBvcHRzICkgKXtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIHRydWUsIHRoaXMub3B0aW9ucywgb3B0cyApO1xuXG4gICAgICAgIC8vIHRyaWdnZXIgX3VwZGF0ZU9wdGlvbk5hbWUgaWYgaXQgZXhpc3RzXG4gICAgICAgIHZhciB1cGRhdGVPcHRpb25GbjtcbiAgICAgICAgZm9yICggdmFyIG9wdGlvbk5hbWUgaW4gb3B0cyApIHtcbiAgICAgICAgICB1cGRhdGVPcHRpb25GbiA9ICdfdXBkYXRlJyArIGNhcGl0YWxpemUoIG9wdGlvbk5hbWUgKTtcbiAgICAgICAgICBpZiAoIHRoaXNbIHVwZGF0ZU9wdGlvbkZuIF0gKSB7XG4gICAgICAgICAgICB0aGlzWyB1cGRhdGVPcHRpb25GbiBdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gdXBkYXRlcnMgPT09PT09PT09PT09PT09PT09PT09PSAvL1xuICAgIC8vIGtpbmQgb2YgbGlrZSBzZXR0ZXJzXG5cbiAgICBfdXBkYXRlQW5pbWF0aW9uRW5naW5lIDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYW5pbWF0aW9uRW5naW5lID0gdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVuZ2luZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoIC9bIF9cXC1dL2csICcnKTtcbiAgICAgIHZhciBpc1VzaW5nSlF1ZXJ5QW5pbWF0aW9uO1xuICAgICAgLy8gc2V0IGFwcGx5U3R5bGVGbk5hbWVcbiAgICAgIHN3aXRjaCAoIGFuaW1hdGlvbkVuZ2luZSApIHtcbiAgICAgICAgY2FzZSAnY3NzJyA6XG4gICAgICAgIGNhc2UgJ25vbmUnIDpcbiAgICAgICAgICBpc1VzaW5nSlF1ZXJ5QW5pbWF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2pxdWVyeScgOlxuICAgICAgICAgIGlzVXNpbmdKUXVlcnlBbmltYXRpb24gPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0IDogLy8gYmVzdCBhdmFpbGFibGVcbiAgICAgICAgICBpc1VzaW5nSlF1ZXJ5QW5pbWF0aW9uID0gIU1vZGVybml6ci5jc3N0cmFuc2l0aW9ucztcbiAgICAgIH1cbiAgICAgIHRoaXMuaXNVc2luZ0pRdWVyeUFuaW1hdGlvbiA9IGlzVXNpbmdKUXVlcnlBbmltYXRpb247XG4gICAgICB0aGlzLl91cGRhdGVVc2luZ1RyYW5zZm9ybXMoKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVRyYW5zZm9ybXNFbmFibGVkIDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVVc2luZ1RyYW5zZm9ybXMoKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVVzaW5nVHJhbnNmb3JtcyA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVzaW5nVHJhbnNmb3JtcyA9IHRoaXMudXNpbmdUcmFuc2Zvcm1zID0gdGhpcy5vcHRpb25zLnRyYW5zZm9ybXNFbmFibGVkICYmXG4gICAgICAgIE1vZGVybml6ci5jc3N0cmFuc2Zvcm1zICYmIE1vZGVybml6ci5jc3N0cmFuc2l0aW9ucyAmJiAhdGhpcy5pc1VzaW5nSlF1ZXJ5QW5pbWF0aW9uO1xuXG4gICAgICAvLyBwcmV2ZW50IHNjYWxlcyB3aGVuIHRyYW5zZm9ybXMgYXJlIGRpc2FibGVkXG4gICAgICBpZiAoICF1c2luZ1RyYW5zZm9ybXMgKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnMuaGlkZGVuU3R5bGUuc2NhbGU7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnMudmlzaWJsZVN0eWxlLnNjYWxlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdldFBvc2l0aW9uU3R5bGVzID0gdXNpbmdUcmFuc2Zvcm1zID8gdGhpcy5fdHJhbnNsYXRlIDogdGhpcy5fcG9zaXRpb25BYnM7XG4gICAgfSxcblxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBGaWx0ZXJpbmcgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX2ZpbHRlciA6IGZ1bmN0aW9uKCAkYXRvbXMgKSB7XG4gICAgICB2YXIgZmlsdGVyID0gdGhpcy5vcHRpb25zLmZpbHRlciA9PT0gJycgPyAnKicgOiB0aGlzLm9wdGlvbnMuZmlsdGVyO1xuXG4gICAgICBpZiAoICFmaWx0ZXIgKSB7XG4gICAgICAgIHJldHVybiAkYXRvbXM7XG4gICAgICB9XG5cbiAgICAgIHZhciBoaWRkZW5DbGFzcyAgICA9IHRoaXMub3B0aW9ucy5oaWRkZW5DbGFzcyxcbiAgICAgICAgICBoaWRkZW5TZWxlY3RvciA9ICcuJyArIGhpZGRlbkNsYXNzLFxuICAgICAgICAgICRoaWRkZW5BdG9tcyAgID0gJGF0b21zLmZpbHRlciggaGlkZGVuU2VsZWN0b3IgKSxcbiAgICAgICAgICAkYXRvbXNUb1Nob3cgICA9ICRoaWRkZW5BdG9tcztcblxuICAgICAgaWYgKCBmaWx0ZXIgIT09ICcqJyApIHtcbiAgICAgICAgJGF0b21zVG9TaG93ID0gJGhpZGRlbkF0b21zLmZpbHRlciggZmlsdGVyICk7XG4gICAgICAgIHZhciAkYXRvbXNUb0hpZGUgPSAkYXRvbXMubm90KCBoaWRkZW5TZWxlY3RvciApLm5vdCggZmlsdGVyICkuYWRkQ2xhc3MoIGhpZGRlbkNsYXNzICk7XG4gICAgICAgIHRoaXMuc3R5bGVRdWV1ZS5wdXNoKHsgJGVsOiAkYXRvbXNUb0hpZGUsIHN0eWxlOiB0aGlzLm9wdGlvbnMuaGlkZGVuU3R5bGUgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3R5bGVRdWV1ZS5wdXNoKHsgJGVsOiAkYXRvbXNUb1Nob3csIHN0eWxlOiB0aGlzLm9wdGlvbnMudmlzaWJsZVN0eWxlIH0pO1xuICAgICAgJGF0b21zVG9TaG93LnJlbW92ZUNsYXNzKCBoaWRkZW5DbGFzcyApO1xuXG4gICAgICByZXR1cm4gJGF0b21zLmZpbHRlciggZmlsdGVyICk7XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gU29ydGluZyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICB1cGRhdGVTb3J0RGF0YSA6IGZ1bmN0aW9uKCAkYXRvbXMsIGlzSW5jcmVtZW50aW5nRWxlbUNvdW50ICkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcyxcbiAgICAgICAgICBnZXRTb3J0RGF0YSA9IHRoaXMub3B0aW9ucy5nZXRTb3J0RGF0YSxcbiAgICAgICAgICAkdGhpcywgc29ydERhdGE7XG4gICAgICAkYXRvbXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHNvcnREYXRhID0ge307XG4gICAgICAgIC8vIGdldCB2YWx1ZSBmb3Igc29ydCBkYXRhIGJhc2VkIG9uIGZuKCAkZWxlbSApIHBhc3NlZCBpblxuICAgICAgICBmb3IgKCB2YXIga2V5IGluIGdldFNvcnREYXRhICkge1xuICAgICAgICAgIGlmICggIWlzSW5jcmVtZW50aW5nRWxlbUNvdW50ICYmIGtleSA9PT0gJ29yaWdpbmFsLW9yZGVyJyApIHtcbiAgICAgICAgICAgIC8vIGtlZXAgb3JpZ2luYWwgb3JkZXIgb3JpZ2luYWxcbiAgICAgICAgICAgIHNvcnREYXRhWyBrZXkgXSA9ICQuZGF0YSggdGhpcywgJ2lzb3RvcGUtc29ydC1kYXRhJyApWyBrZXkgXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc29ydERhdGFbIGtleSBdID0gZ2V0U29ydERhdGFbIGtleSBdKCAkdGhpcywgaW5zdGFuY2UgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwbHkgc29ydCBkYXRhIHRvIGVsZW1lbnRcbiAgICAgICAgJC5kYXRhKCB0aGlzLCAnaXNvdG9wZS1zb3J0LWRhdGEnLCBzb3J0RGF0YSApO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIHVzZWQgb24gYWxsIHRoZSBmaWx0ZXJlZCBhdG9tc1xuICAgIF9zb3J0IDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzb3J0QnkgPSB0aGlzLm9wdGlvbnMuc29ydEJ5LFxuICAgICAgICAgIGdldFNvcnRlciA9IHRoaXMuX2dldFNvcnRlcixcbiAgICAgICAgICBzb3J0RGlyID0gdGhpcy5vcHRpb25zLnNvcnRBc2NlbmRpbmcgPyAxIDogLTEsXG4gICAgICAgICAgc29ydEZuID0gZnVuY3Rpb24oIGFscGhhLCBiZXRhICkge1xuICAgICAgICAgICAgdmFyIGEgPSBnZXRTb3J0ZXIoIGFscGhhLCBzb3J0QnkgKSxcbiAgICAgICAgICAgICAgICBiID0gZ2V0U29ydGVyKCBiZXRhLCBzb3J0QnkgKTtcbiAgICAgICAgICAgIC8vIGZhbGwgYmFjayB0byBvcmlnaW5hbCBvcmRlciBpZiBkYXRhIG1hdGNoZXNcbiAgICAgICAgICAgIGlmICggYSA9PT0gYiAmJiBzb3J0QnkgIT09ICdvcmlnaW5hbC1vcmRlcicpIHtcbiAgICAgICAgICAgICAgYSA9IGdldFNvcnRlciggYWxwaGEsICdvcmlnaW5hbC1vcmRlcicgKTtcbiAgICAgICAgICAgICAgYiA9IGdldFNvcnRlciggYmV0YSwgJ29yaWdpbmFsLW9yZGVyJyApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICggKCBhID4gYiApID8gMSA6ICggYSA8IGIgKSA/IC0xIDogMCApICogc29ydERpcjtcbiAgICAgICAgICB9O1xuXG4gICAgICB0aGlzLiRmaWx0ZXJlZEF0b21zLnNvcnQoIHNvcnRGbiApO1xuICAgIH0sXG5cbiAgICBfZ2V0U29ydGVyIDogZnVuY3Rpb24oIGVsZW0sIHNvcnRCeSApIHtcbiAgICAgIHJldHVybiAkLmRhdGEoIGVsZW0sICdpc290b3BlLXNvcnQtZGF0YScgKVsgc29ydEJ5IF07XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gTGF5b3V0IEhlbHBlcnMgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3RyYW5zbGF0ZSA6IGZ1bmN0aW9uKCB4LCB5ICkge1xuICAgICAgcmV0dXJuIHsgdHJhbnNsYXRlIDogWyB4LCB5IF0gfTtcbiAgICB9LFxuXG4gICAgX3Bvc2l0aW9uQWJzIDogZnVuY3Rpb24oIHgsIHkgKSB7XG4gICAgICByZXR1cm4geyBsZWZ0OiB4LCB0b3A6IHkgfTtcbiAgICB9LFxuXG4gICAgX3B1c2hQb3NpdGlvbiA6IGZ1bmN0aW9uKCAkZWxlbSwgeCwgeSApIHtcbiAgICAgIHggPSBNYXRoLnJvdW5kKCB4ICsgdGhpcy5vZmZzZXQubGVmdCApO1xuICAgICAgeSA9IE1hdGgucm91bmQoIHkgKyB0aGlzLm9mZnNldC50b3AgKTtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb25TdHlsZXMoIHgsIHkgKTtcbiAgICAgIHRoaXMuc3R5bGVRdWV1ZS5wdXNoKHsgJGVsOiAkZWxlbSwgc3R5bGU6IHBvc2l0aW9uIH0pO1xuICAgICAgaWYgKCB0aGlzLm9wdGlvbnMuaXRlbVBvc2l0aW9uRGF0YUVuYWJsZWQgKSB7XG4gICAgICAgICRlbGVtLmRhdGEoJ2lzb3RvcGUtaXRlbS1wb3NpdGlvbicsIHt4OiB4LCB5OiB5fSApO1xuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gR2VuZXJhbCBMYXlvdXQgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gdXNlZCBvbiBjb2xsZWN0aW9uIG9mIGF0b21zIChzaG91bGQgYmUgZmlsdGVyZWQsIGFuZCBzb3J0ZWQgYmVmb3JlIClcbiAgICAvLyBhY2NlcHRzIGF0b21zLXRvLWJlLWxhaWQtb3V0IHRvIHN0YXJ0IHdpdGhcbiAgICBsYXlvdXQgOiBmdW5jdGlvbiggJGVsZW1zLCBjYWxsYmFjayApIHtcblxuICAgICAgdmFyIGxheW91dE1vZGUgPSB0aGlzLm9wdGlvbnMubGF5b3V0TW9kZTtcblxuICAgICAgLy8gbGF5b3V0IGxvZ2ljXG4gICAgICB0aGlzWyAnXycgKyAgbGF5b3V0TW9kZSArICdMYXlvdXQnIF0oICRlbGVtcyApO1xuXG4gICAgICAvLyBzZXQgdGhlIHNpemUgb2YgdGhlIGNvbnRhaW5lclxuICAgICAgaWYgKCB0aGlzLm9wdGlvbnMucmVzaXplc0NvbnRhaW5lciApIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lclN0eWxlID0gdGhpc1sgJ18nICsgIGxheW91dE1vZGUgKyAnR2V0Q29udGFpbmVyU2l6ZScgXSgpO1xuICAgICAgICB0aGlzLnN0eWxlUXVldWUucHVzaCh7ICRlbDogdGhpcy5lbGVtZW50LCBzdHlsZTogY29udGFpbmVyU3R5bGUgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3Byb2Nlc3NTdHlsZVF1ZXVlKCAkZWxlbXMsIGNhbGxiYWNrICk7XG5cbiAgICAgIHRoaXMuaXNMYWlkT3V0ID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgX3Byb2Nlc3NTdHlsZVF1ZXVlIDogZnVuY3Rpb24oICRlbGVtcywgY2FsbGJhY2sgKSB7XG4gICAgICAvLyBhcmUgd2UgYW5pbWF0aW5nIHRoZSBsYXlvdXQgYXJyYW5nZW1lbnQ/XG4gICAgICAvLyB1c2UgcGx1Z2luLWlzaCBzeW50YXggZm9yIGNzcyBvciBhbmltYXRlXG4gICAgICB2YXIgc3R5bGVGbiA9ICF0aGlzLmlzTGFpZE91dCA/ICdjc3MnIDogKFxuICAgICAgICAgICAgdGhpcy5pc1VzaW5nSlF1ZXJ5QW5pbWF0aW9uID8gJ2FuaW1hdGUnIDogJ2NzcydcbiAgICAgICAgICApLFxuICAgICAgICAgIGFuaW1PcHRzID0gdGhpcy5vcHRpb25zLmFuaW1hdGlvbk9wdGlvbnMsXG4gICAgICAgICAgb25MYXlvdXQgPSB0aGlzLm9wdGlvbnMub25MYXlvdXQsXG4gICAgICAgICAgb2JqU3R5bGVGbiwgcHJvY2Vzc29yLFxuICAgICAgICAgIHRyaWdnZXJDYWxsYmFja05vdywgY2FsbGJhY2tGbjtcblxuICAgICAgLy8gZGVmYXVsdCBzdHlsZVF1ZXVlIHByb2Nlc3NvciwgbWF5IGJlIG92ZXJ3cml0dGVuIGRvd24gYmVsb3dcbiAgICAgIHByb2Nlc3NvciA9IGZ1bmN0aW9uKCBpLCBvYmogKSB7XG4gICAgICAgIG9iai4kZWxbIHN0eWxlRm4gXSggb2JqLnN0eWxlLCBhbmltT3B0cyApO1xuICAgICAgfTtcblxuICAgICAgaWYgKCB0aGlzLl9pc0luc2VydGluZyAmJiB0aGlzLmlzVXNpbmdKUXVlcnlBbmltYXRpb24gKSB7XG4gICAgICAgIC8vIGlmIHVzaW5nIHN0eWxlUXVldWUgdG8gaW5zZXJ0IGl0ZW1zXG4gICAgICAgIHByb2Nlc3NvciA9IGZ1bmN0aW9uKCBpLCBvYmogKSB7XG4gICAgICAgICAgLy8gb25seSBhbmltYXRlIGlmIGl0IG5vdCBiZWluZyBpbnNlcnRlZFxuICAgICAgICAgIG9ialN0eWxlRm4gPSBvYmouJGVsLmhhc0NsYXNzKCduby10cmFuc2l0aW9uJykgPyAnY3NzJyA6IHN0eWxlRm47XG4gICAgICAgICAgb2JqLiRlbFsgb2JqU3R5bGVGbiBdKCBvYmouc3R5bGUsIGFuaW1PcHRzICk7XG4gICAgICAgIH07XG5cbiAgICAgIH0gZWxzZSBpZiAoIGNhbGxiYWNrIHx8IG9uTGF5b3V0IHx8IGFuaW1PcHRzLmNvbXBsZXRlICkge1xuICAgICAgICAvLyBoYXMgY2FsbGJhY2tcbiAgICAgICAgdmFyIGlzQ2FsbGJhY2tUcmlnZ2VyZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIC8vIGFycmF5IG9mIHBvc3NpYmxlIGNhbGxiYWNrcyB0byB0cmlnZ2VyXG4gICAgICAgICAgICBjYWxsYmFja3MgPSBbIGNhbGxiYWNrLCBvbkxheW91dCwgYW5pbU9wdHMuY29tcGxldGUgXSxcbiAgICAgICAgICAgIGluc3RhbmNlID0gdGhpcztcbiAgICAgICAgdHJpZ2dlckNhbGxiYWNrTm93ID0gdHJ1ZTtcbiAgICAgICAgLy8gdHJpZ2dlciBjYWxsYmFjayBvbmx5IG9uY2VcbiAgICAgICAgY2FsbGJhY2tGbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICggaXNDYWxsYmFja1RyaWdnZXJlZCApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGhvbGxhYmFjaztcbiAgICAgICAgICBmb3IgKHZhciBpPTAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaG9sbGFiYWNrID0gY2FsbGJhY2tzW2ldO1xuICAgICAgICAgICAgaWYgKCB0eXBlb2YgaG9sbGFiYWNrID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgICAgICBob2xsYWJhY2suY2FsbCggaW5zdGFuY2UuZWxlbWVudCwgJGVsZW1zLCBpbnN0YW5jZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpc0NhbGxiYWNrVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIHRoaXMuaXNVc2luZ0pRdWVyeUFuaW1hdGlvbiAmJiBzdHlsZUZuID09PSAnYW5pbWF0ZScgKSB7XG4gICAgICAgICAgLy8gYWRkIGNhbGxiYWNrIHRvIGFuaW1hdGlvbiBvcHRpb25zXG4gICAgICAgICAgYW5pbU9wdHMuY29tcGxldGUgPSBjYWxsYmFja0ZuO1xuICAgICAgICAgIHRyaWdnZXJDYWxsYmFja05vdyA9IGZhbHNlO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoIE1vZGVybml6ci5jc3N0cmFuc2l0aW9ucyApIHtcbiAgICAgICAgICAvLyBkZXRlY3QgaWYgZmlyc3QgaXRlbSBoYXMgdHJhbnNpdGlvblxuICAgICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgICAgZmlyc3RJdGVtID0gdGhpcy5zdHlsZVF1ZXVlWzBdLFxuICAgICAgICAgICAgICB0ZXN0RWxlbSA9IGZpcnN0SXRlbSAmJiBmaXJzdEl0ZW0uJGVsLFxuICAgICAgICAgICAgICBzdHlsZU9iajtcbiAgICAgICAgICAvLyBnZXQgZmlyc3Qgbm9uLWVtcHR5IGpRIG9iamVjdFxuICAgICAgICAgIHdoaWxlICggIXRlc3RFbGVtIHx8ICF0ZXN0RWxlbS5sZW5ndGggKSB7XG4gICAgICAgICAgICBzdHlsZU9iaiA9IHRoaXMuc3R5bGVRdWV1ZVsgaSsrIF07XG4gICAgICAgICAgICAvLyBIQUNLOiBzb21ldGltZXMgc3R5bGVRdWV1ZVtpXSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgIGlmICggIXN0eWxlT2JqICkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZXN0RWxlbSA9IHN0eWxlT2JqLiRlbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZ2V0IHRyYW5zaXRpb24gZHVyYXRpb24gb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhhdCBvYmplY3RcbiAgICAgICAgICAvLyB5ZWFoLCB0aGlzIGlzIGluZXhhY3RcbiAgICAgICAgICB2YXIgZHVyYXRpb24gPSBwYXJzZUZsb2F0KCBnZXRDb21wdXRlZFN0eWxlKCB0ZXN0RWxlbVswXSApWyB0cmFuc2l0aW9uRHVyUHJvcCBdICk7XG4gICAgICAgICAgaWYgKCBkdXJhdGlvbiA+IDAgKSB7XG4gICAgICAgICAgICBwcm9jZXNzb3IgPSBmdW5jdGlvbiggaSwgb2JqICkge1xuICAgICAgICAgICAgICBvYmouJGVsWyBzdHlsZUZuIF0oIG9iai5zdHlsZSwgYW5pbU9wdHMgKVxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgY2FsbGJhY2sgYXQgdHJhbnNpdGlvbiBlbmRcbiAgICAgICAgICAgICAgICAub25lKCB0cmFuc2l0aW9uRW5kRXZlbnQsIGNhbGxiYWNrRm4gKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0cmlnZ2VyQ2FsbGJhY2tOb3cgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBzdHlsZVF1ZXVlXG4gICAgICAkLmVhY2goIHRoaXMuc3R5bGVRdWV1ZSwgcHJvY2Vzc29yICk7XG5cbiAgICAgIGlmICggdHJpZ2dlckNhbGxiYWNrTm93ICkge1xuICAgICAgICBjYWxsYmFja0ZuKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNsZWFyIG91dCBxdWV1ZSBmb3IgbmV4dCB0aW1lXG4gICAgICB0aGlzLnN0eWxlUXVldWUgPSBbXTtcbiAgICB9LFxuXG5cbiAgICByZXNpemUgOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggdGhpc1sgJ18nICsgdGhpcy5vcHRpb25zLmxheW91dE1vZGUgKyAnUmVzaXplQ2hhbmdlZCcgXSgpICkge1xuICAgICAgICB0aGlzLnJlTGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSxcblxuXG4gICAgcmVMYXlvdXQgOiBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG5cbiAgICAgIHRoaXNbICdfJyArICB0aGlzLm9wdGlvbnMubGF5b3V0TW9kZSArICdSZXNldCcgXSgpO1xuICAgICAgdGhpcy5sYXlvdXQoIHRoaXMuJGZpbHRlcmVkQXRvbXMsIGNhbGxiYWNrICk7XG5cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBDb252ZW5pZW5jZSBtZXRob2RzID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gQWRkaW5nIGl0ZW1zID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIGFkZHMgYSBqUXVlcnkgb2JqZWN0IG9mIGl0ZW1zIHRvIGEgaXNvdG9wZSBjb250YWluZXJcbiAgICBhZGRJdGVtcyA6IGZ1bmN0aW9uKCAkY29udGVudCwgY2FsbGJhY2sgKSB7XG4gICAgICB2YXIgJG5ld0F0b21zID0gdGhpcy5fZ2V0QXRvbXMoICRjb250ZW50ICk7XG4gICAgICAvLyBhZGQgbmV3IGF0b21zIHRvIGF0b21zIHBvb2xzXG4gICAgICB0aGlzLiRhbGxBdG9tcyA9IHRoaXMuJGFsbEF0b21zLmFkZCggJG5ld0F0b21zICk7XG5cbiAgICAgIGlmICggY2FsbGJhY2sgKSB7XG4gICAgICAgIGNhbGxiYWNrKCAkbmV3QXRvbXMgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gY29udmllbmVuY2UgbWV0aG9kIGZvciBhZGRpbmcgZWxlbWVudHMgcHJvcGVybHkgdG8gYW55IGxheW91dFxuICAgIC8vIHBvc2l0aW9ucyBpdGVtcywgaGlkZXMgdGhlbSwgdGhlbiBhbmltYXRlcyB0aGVtIGJhY2sgaW4gPC0tLSB2ZXJ5IHNlenp5XG4gICAgaW5zZXJ0IDogZnVuY3Rpb24oICRjb250ZW50LCBjYWxsYmFjayApIHtcbiAgICAgIC8vIHBvc2l0aW9uIGl0ZW1zXG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kKCAkY29udGVudCApO1xuXG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdGhpcy5hZGRJdGVtcyggJGNvbnRlbnQsIGZ1bmN0aW9uKCAkbmV3QXRvbXMgKSB7XG4gICAgICAgIHZhciAkbmV3RmlsdGVyZWRBdG9tcyA9IGluc3RhbmNlLl9maWx0ZXIoICRuZXdBdG9tcyApO1xuICAgICAgICBpbnN0YW5jZS5fYWRkSGlkZUFwcGVuZGVkKCAkbmV3RmlsdGVyZWRBdG9tcyApO1xuICAgICAgICBpbnN0YW5jZS5fc29ydCgpO1xuICAgICAgICBpbnN0YW5jZS5yZUxheW91dCgpO1xuICAgICAgICBpbnN0YW5jZS5fcmV2ZWFsQXBwZW5kZWQoICRuZXdGaWx0ZXJlZEF0b21zLCBjYWxsYmFjayApO1xuICAgICAgfSk7XG5cbiAgICB9LFxuXG4gICAgLy8gY29udmllbmVuY2UgbWV0aG9kIGZvciB3b3JraW5nIHdpdGggSW5maW5pdGUgU2Nyb2xsXG4gICAgYXBwZW5kZWQgOiBmdW5jdGlvbiggJGNvbnRlbnQsIGNhbGxiYWNrICkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcztcbiAgICAgIHRoaXMuYWRkSXRlbXMoICRjb250ZW50LCBmdW5jdGlvbiggJG5ld0F0b21zICkge1xuICAgICAgICBpbnN0YW5jZS5fYWRkSGlkZUFwcGVuZGVkKCAkbmV3QXRvbXMgKTtcbiAgICAgICAgaW5zdGFuY2UubGF5b3V0KCAkbmV3QXRvbXMgKTtcbiAgICAgICAgaW5zdGFuY2UuX3JldmVhbEFwcGVuZGVkKCAkbmV3QXRvbXMsIGNhbGxiYWNrICk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gYWRkcyBuZXcgYXRvbXMsIHRoZW4gaGlkZXMgdGhlbSBiZWZvcmUgcG9zaXRpb25pbmdcbiAgICBfYWRkSGlkZUFwcGVuZGVkIDogZnVuY3Rpb24oICRuZXdBdG9tcyApIHtcbiAgICAgIHRoaXMuJGZpbHRlcmVkQXRvbXMgPSB0aGlzLiRmaWx0ZXJlZEF0b21zLmFkZCggJG5ld0F0b21zICk7XG4gICAgICAkbmV3QXRvbXMuYWRkQ2xhc3MoJ25vLXRyYW5zaXRpb24nKTtcblxuICAgICAgdGhpcy5faXNJbnNlcnRpbmcgPSB0cnVlO1xuXG4gICAgICAvLyBhcHBseSBoaWRkZW4gc3R5bGVzXG4gICAgICB0aGlzLnN0eWxlUXVldWUucHVzaCh7ICRlbDogJG5ld0F0b21zLCBzdHlsZTogdGhpcy5vcHRpb25zLmhpZGRlblN0eWxlIH0pO1xuICAgIH0sXG5cbiAgICAvLyBzZXRzIHZpc2libGUgc3R5bGUgb24gbmV3IGF0b21zXG4gICAgX3JldmVhbEFwcGVuZGVkIDogZnVuY3Rpb24oICRuZXdBdG9tcywgY2FsbGJhY2sgKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgLy8gYXBwbHkgdmlzaWJsZSBzdHlsZSBhZnRlciBhIHNlY1xuICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGVuYWJsZSBhbmltYXRpb25cbiAgICAgICAgJG5ld0F0b21zLnJlbW92ZUNsYXNzKCduby10cmFuc2l0aW9uJyk7XG4gICAgICAgIC8vIHJldmVhbCBuZXdseSBpbnNlcnRlZCBmaWx0ZXJlZCBlbGVtZW50c1xuICAgICAgICBpbnN0YW5jZS5zdHlsZVF1ZXVlLnB1c2goeyAkZWw6ICRuZXdBdG9tcywgc3R5bGU6IGluc3RhbmNlLm9wdGlvbnMudmlzaWJsZVN0eWxlIH0pO1xuICAgICAgICBpbnN0YW5jZS5faXNJbnNlcnRpbmcgPSBmYWxzZTtcbiAgICAgICAgaW5zdGFuY2UuX3Byb2Nlc3NTdHlsZVF1ZXVlKCAkbmV3QXRvbXMsIGNhbGxiYWNrICk7XG4gICAgICB9LCAxMCApO1xuICAgIH0sXG5cbiAgICAvLyBnYXRoZXJzIGFsbCBhdG9tc1xuICAgIHJlbG9hZEl0ZW1zIDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRhbGxBdG9tcyA9IHRoaXMuX2dldEF0b21zKCB0aGlzLmVsZW1lbnQuY2hpbGRyZW4oKSApO1xuICAgIH0sXG5cbiAgICAvLyByZW1vdmVzIGVsZW1lbnRzIGZyb20gSXNvdG9wZSB3aWRnZXRcbiAgICByZW1vdmU6IGZ1bmN0aW9uKCAkY29udGVudCwgY2FsbGJhY2sgKSB7XG4gICAgICAvLyByZW1vdmUgZWxlbWVudHMgaW1tZWRpYXRlbHkgZnJvbSBJc290b3BlIGluc3RhbmNlXG4gICAgICB0aGlzLiRhbGxBdG9tcyA9IHRoaXMuJGFsbEF0b21zLm5vdCggJGNvbnRlbnQgKTtcbiAgICAgIHRoaXMuJGZpbHRlcmVkQXRvbXMgPSB0aGlzLiRmaWx0ZXJlZEF0b21zLm5vdCggJGNvbnRlbnQgKTtcbiAgICAgIC8vIHJlbW92ZSgpIGFzIGEgY2FsbGJhY2ssIGZvciBhZnRlciB0cmFuc2l0aW9uIC8gYW5pbWF0aW9uXG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdmFyIHJlbW92ZUNvbnRlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJGNvbnRlbnQucmVtb3ZlKCk7XG4gICAgICAgIGlmICggY2FsbGJhY2sgKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbCggaW5zdGFuY2UuZWxlbWVudCApO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAoICRjb250ZW50LmZpbHRlciggJzpub3QoLicgKyB0aGlzLm9wdGlvbnMuaGlkZGVuQ2xhc3MgKyAnKScgKS5sZW5ndGggKSB7XG4gICAgICAgIC8vIGlmIGFueSBub24taGlkZGVuIGNvbnRlbnQgbmVlZHMgdG8gYmUgcmVtb3ZlZFxuICAgICAgICB0aGlzLnN0eWxlUXVldWUucHVzaCh7ICRlbDogJGNvbnRlbnQsIHN0eWxlOiB0aGlzLm9wdGlvbnMuaGlkZGVuU3R5bGUgfSk7XG4gICAgICAgIHRoaXMuX3NvcnQoKTtcbiAgICAgICAgdGhpcy5yZUxheW91dCggcmVtb3ZlQ29udGVudCApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVtb3ZlIGl0IG5vd1xuICAgICAgICByZW1vdmVDb250ZW50KCk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgc2h1ZmZsZSA6IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcbiAgICAgIHRoaXMudXBkYXRlU29ydERhdGEoIHRoaXMuJGFsbEF0b21zICk7XG4gICAgICB0aGlzLm9wdGlvbnMuc29ydEJ5ID0gJ3JhbmRvbSc7XG4gICAgICB0aGlzLl9zb3J0KCk7XG4gICAgICB0aGlzLnJlTGF5b3V0KCBjYWxsYmFjayApO1xuICAgIH0sXG5cbiAgICAvLyBkZXN0cm95cyB3aWRnZXQsIHJldHVybnMgZWxlbWVudHMgYW5kIGNvbnRhaW5lciBiYWNrIChjbG9zZSkgdG8gb3JpZ2luYWwgc3R5bGVcbiAgICBkZXN0cm95IDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciB1c2luZ1RyYW5zZm9ybXMgPSB0aGlzLnVzaW5nVHJhbnNmb3JtcztcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICB0aGlzLiRhbGxBdG9tc1xuICAgICAgICAucmVtb3ZlQ2xhc3MoIG9wdGlvbnMuaGlkZGVuQ2xhc3MgKyAnICcgKyBvcHRpb25zLml0ZW1DbGFzcyApXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgdmFyIHN0eWxlID0gdGhpcy5zdHlsZTtcbiAgICAgICAgICBzdHlsZS5wb3NpdGlvbiA9ICcnO1xuICAgICAgICAgIHN0eWxlLnRvcCA9ICcnO1xuICAgICAgICAgIHN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgICBzdHlsZS5vcGFjaXR5ID0gJyc7XG4gICAgICAgICAgaWYgKCB1c2luZ1RyYW5zZm9ybXMgKSB7XG4gICAgICAgICAgICBzdHlsZVsgdHJhbnNmb3JtUHJvcCBdID0gJyc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgLy8gcmUtYXBwbHkgc2F2ZWQgY29udGFpbmVyIHN0eWxlc1xuICAgICAgdmFyIGVsZW1TdHlsZSA9IHRoaXMuZWxlbWVudFswXS5zdHlsZTtcbiAgICAgIGZvciAoIHZhciBwcm9wIGluIHRoaXMub3JpZ2luYWxTdHlsZSApIHtcbiAgICAgICAgZWxlbVN0eWxlWyBwcm9wIF0gPSB0aGlzLm9yaWdpbmFsU3R5bGVbIHByb3AgXTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbGVtZW50XG4gICAgICAgIC51bmJpbmQoJy5pc290b3BlJylcbiAgICAgICAgLnVuZGVsZWdhdGUoICcuJyArIG9wdGlvbnMuaGlkZGVuQ2xhc3MsICdjbGljaycgKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoIG9wdGlvbnMuY29udGFpbmVyQ2xhc3MgKVxuICAgICAgICAucmVtb3ZlRGF0YSgnaXNvdG9wZScpO1xuXG4gICAgICAkd2luZG93LnVuYmluZCgnLmlzb3RvcGUnKTtcblxuICAgIH0sXG5cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gTEFZT1VUUyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBjYWxjdWxhdGVzIG51bWJlciBvZiByb3dzIG9yIGNvbHVtbnNcbiAgICAvLyByZXF1aXJlcyBjb2x1bW5XaWR0aCBvciByb3dIZWlnaHQgdG8gYmUgc2V0IG9uIG5hbWVzcGFjZWQgb2JqZWN0XG4gICAgLy8gaS5lLiB0aGlzLm1hc29ucnkuY29sdW1uV2lkdGggPSAyMDBcbiAgICBfZ2V0U2VnbWVudHMgOiBmdW5jdGlvbiggaXNSb3dzICkge1xuICAgICAgdmFyIG5hbWVzcGFjZSA9IHRoaXMub3B0aW9ucy5sYXlvdXRNb2RlLFxuICAgICAgICAgIG1lYXN1cmUgID0gaXNSb3dzID8gJ3Jvd0hlaWdodCcgOiAnY29sdW1uV2lkdGgnLFxuICAgICAgICAgIHNpemUgICAgID0gaXNSb3dzID8gJ2hlaWdodCcgOiAnd2lkdGgnLFxuICAgICAgICAgIHNlZ21lbnRzTmFtZSA9IGlzUm93cyA/ICdyb3dzJyA6ICdjb2xzJyxcbiAgICAgICAgICBjb250YWluZXJTaXplID0gdGhpcy5lbGVtZW50WyBzaXplIF0oKSxcbiAgICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lLiBvcHRpb25zLm1hc29ucnkgJiYgb3B0aW9ucy5tYXNvbnJ5LmNvbHVtbldpZHRoXG4gICAgICAgICAgc2VnbWVudFNpemUgPSB0aGlzLm9wdGlvbnNbIG5hbWVzcGFjZSBdICYmIHRoaXMub3B0aW9uc1sgbmFtZXNwYWNlIF1bIG1lYXN1cmUgXSB8fFxuICAgICAgICAgICAgICAgICAgICAvLyBvciB1c2UgdGhlIHNpemUgb2YgdGhlIGZpcnN0IGl0ZW0sIGkuZS4gb3V0ZXJXaWR0aFxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRmaWx0ZXJlZEF0b21zWyAnb3V0ZXInICsgY2FwaXRhbGl6ZShzaXplKSBdKHRydWUpIHx8XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3Mgbm8gaXRlbXMsIHVzZSBzaXplIG9mIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJTaXplO1xuXG4gICAgICBzZWdtZW50cyA9IE1hdGguZmxvb3IoIGNvbnRhaW5lclNpemUgLyBzZWdtZW50U2l6ZSApO1xuICAgICAgc2VnbWVudHMgPSBNYXRoLm1heCggc2VnbWVudHMsIDEgKTtcblxuICAgICAgLy8gaS5lLiB0aGlzLm1hc29ucnkuY29scyA9IC4uLi5cbiAgICAgIHRoaXNbIG5hbWVzcGFjZSBdWyBzZWdtZW50c05hbWUgXSA9IHNlZ21lbnRzO1xuICAgICAgLy8gaS5lLiB0aGlzLm1hc29ucnkuY29sdW1uV2lkdGggPSAuLi5cbiAgICAgIHRoaXNbIG5hbWVzcGFjZSBdWyBtZWFzdXJlIF0gPSBzZWdtZW50U2l6ZTtcblxuICAgIH0sXG5cbiAgICBfY2hlY2tJZlNlZ21lbnRzQ2hhbmdlZCA6IGZ1bmN0aW9uKCBpc1Jvd3MgKSB7XG4gICAgICB2YXIgbmFtZXNwYWNlID0gdGhpcy5vcHRpb25zLmxheW91dE1vZGUsXG4gICAgICAgICAgc2VnbWVudHNOYW1lID0gaXNSb3dzID8gJ3Jvd3MnIDogJ2NvbHMnLFxuICAgICAgICAgIHByZXZTZWdtZW50cyA9IHRoaXNbIG5hbWVzcGFjZSBdWyBzZWdtZW50c05hbWUgXTtcbiAgICAgIC8vIHVwZGF0ZSBjb2xzL3Jvd3NcbiAgICAgIHRoaXMuX2dldFNlZ21lbnRzKCBpc1Jvd3MgKTtcbiAgICAgIC8vIHJldHVybiBpZiB1cGRhdGVkIGNvbHMvcm93cyBpcyBub3QgZXF1YWwgdG8gcHJldmlvdXNcbiAgICAgIHJldHVybiAoIHRoaXNbIG5hbWVzcGFjZSBdWyBzZWdtZW50c05hbWUgXSAhPT0gcHJldlNlZ21lbnRzICk7XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gTWFzb25yeSA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfbWFzb25yeVJlc2V0IDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBsYXlvdXQtc3BlY2lmaWMgcHJvcHNcbiAgICAgIHRoaXMubWFzb25yeSA9IHt9O1xuICAgICAgLy8gRklYTUUgc2hvdWxkbid0IGhhdmUgdG8gY2FsbCB0aGlzIGFnYWluXG4gICAgICB0aGlzLl9nZXRTZWdtZW50cygpO1xuICAgICAgdmFyIGkgPSB0aGlzLm1hc29ucnkuY29scztcbiAgICAgIHRoaXMubWFzb25yeS5jb2xZcyA9IFtdO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICB0aGlzLm1hc29ucnkuY29sWXMucHVzaCggMCApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfbWFzb25yeUxheW91dCA6IGZ1bmN0aW9uKCAkZWxlbXMgKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLFxuICAgICAgICAgIHByb3BzID0gaW5zdGFuY2UubWFzb25yeTtcbiAgICAgICRlbGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciAkdGhpcyAgPSAkKHRoaXMpLFxuICAgICAgICAgICAgLy9ob3cgbWFueSBjb2x1bW5zIGRvZXMgdGhpcyBicmljayBzcGFuXG4gICAgICAgICAgICBjb2xTcGFuID0gTWF0aC5jZWlsKCAkdGhpcy5vdXRlcldpZHRoKHRydWUpIC8gcHJvcHMuY29sdW1uV2lkdGggKTtcbiAgICAgICAgY29sU3BhbiA9IE1hdGgubWluKCBjb2xTcGFuLCBwcm9wcy5jb2xzICk7XG5cbiAgICAgICAgaWYgKCBjb2xTcGFuID09PSAxICkge1xuICAgICAgICAgIC8vIGlmIGJyaWNrIHNwYW5zIG9ubHkgb25lIGNvbHVtbiwganVzdCBsaWtlIHNpbmdsZU1vZGVcbiAgICAgICAgICBpbnN0YW5jZS5fbWFzb25yeVBsYWNlQnJpY2soICR0aGlzLCBwcm9wcy5jb2xZcyApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGJyaWNrIHNwYW5zIG1vcmUgdGhhbiBvbmUgY29sdW1uXG4gICAgICAgICAgLy8gaG93IG1hbnkgZGlmZmVyZW50IHBsYWNlcyBjb3VsZCB0aGlzIGJyaWNrIGZpdCBob3Jpem9udGFsbHlcbiAgICAgICAgICB2YXIgZ3JvdXBDb3VudCA9IHByb3BzLmNvbHMgKyAxIC0gY29sU3BhbixcbiAgICAgICAgICAgICAgZ3JvdXBZID0gW10sXG4gICAgICAgICAgICAgIGdyb3VwQ29sWSxcbiAgICAgICAgICAgICAgaTtcblxuICAgICAgICAgIC8vIGZvciBlYWNoIGdyb3VwIHBvdGVudGlhbCBob3Jpem9udGFsIHBvc2l0aW9uXG4gICAgICAgICAgZm9yICggaT0wOyBpIDwgZ3JvdXBDb3VudDsgaSsrICkge1xuICAgICAgICAgICAgLy8gbWFrZSBhbiBhcnJheSBvZiBjb2xZIHZhbHVlcyBmb3IgdGhhdCBvbmUgZ3JvdXBcbiAgICAgICAgICAgIGdyb3VwQ29sWSA9IHByb3BzLmNvbFlzLnNsaWNlKCBpLCBpK2NvbFNwYW4gKTtcbiAgICAgICAgICAgIC8vIGFuZCBnZXQgdGhlIG1heCB2YWx1ZSBvZiB0aGUgYXJyYXlcbiAgICAgICAgICAgIGdyb3VwWVtpXSA9IE1hdGgubWF4LmFwcGx5KCBNYXRoLCBncm91cENvbFkgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbnN0YW5jZS5fbWFzb25yeVBsYWNlQnJpY2soICR0aGlzLCBncm91cFkgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIHdvcmtlciBtZXRob2QgdGhhdCBwbGFjZXMgYnJpY2sgaW4gdGhlIGNvbHVtblNldFxuICAgIC8vICAgd2l0aCB0aGUgdGhlIG1pbllcbiAgICBfbWFzb25yeVBsYWNlQnJpY2sgOiBmdW5jdGlvbiggJGJyaWNrLCBzZXRZICkge1xuICAgICAgLy8gZ2V0IHRoZSBtaW5pbXVtIFkgdmFsdWUgZnJvbSB0aGUgY29sdW1uc1xuICAgICAgdmFyIG1pbmltdW1ZID0gTWF0aC5taW4uYXBwbHkoIE1hdGgsIHNldFkgKSxcbiAgICAgICAgICBzaG9ydENvbCA9IDA7XG5cbiAgICAgIC8vIEZpbmQgaW5kZXggb2Ygc2hvcnQgY29sdW1uLCB0aGUgZmlyc3QgZnJvbSB0aGUgbGVmdFxuICAgICAgZm9yICh2YXIgaT0wLCBsZW4gPSBzZXRZLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICggc2V0WVtpXSA9PT0gbWluaW11bVkgKSB7XG4gICAgICAgICAgc2hvcnRDb2wgPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHBvc2l0aW9uIHRoZSBicmlja1xuICAgICAgdmFyIHggPSB0aGlzLm1hc29ucnkuY29sdW1uV2lkdGggKiBzaG9ydENvbCxcbiAgICAgICAgICB5ID0gbWluaW11bVk7XG4gICAgICB0aGlzLl9wdXNoUG9zaXRpb24oICRicmljaywgeCwgeSApO1xuXG4gICAgICAvLyBhcHBseSBzZXRIZWlnaHQgdG8gbmVjZXNzYXJ5IGNvbHVtbnNcbiAgICAgIHZhciBzZXRIZWlnaHQgPSBtaW5pbXVtWSArICRicmljay5vdXRlckhlaWdodCh0cnVlKSxcbiAgICAgICAgICBzZXRTcGFuID0gdGhpcy5tYXNvbnJ5LmNvbHMgKyAxIC0gbGVuO1xuICAgICAgZm9yICggaT0wOyBpIDwgc2V0U3BhbjsgaSsrICkge1xuICAgICAgICB0aGlzLm1hc29ucnkuY29sWXNbIHNob3J0Q29sICsgaSBdID0gc2V0SGVpZ2h0O1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIF9tYXNvbnJ5R2V0Q29udGFpbmVyU2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRhaW5lckhlaWdodCA9IE1hdGgubWF4LmFwcGx5KCBNYXRoLCB0aGlzLm1hc29ucnkuY29sWXMgKTtcbiAgICAgIHJldHVybiB7IGhlaWdodDogY29udGFpbmVySGVpZ2h0IH07XG4gICAgfSxcblxuICAgIF9tYXNvbnJ5UmVzaXplQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NoZWNrSWZTZWdtZW50c0NoYW5nZWQoKTtcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBmaXRSb3dzID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9maXRSb3dzUmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZml0Um93cyA9IHtcbiAgICAgICAgeCA6IDAsXG4gICAgICAgIHkgOiAwLFxuICAgICAgICBoZWlnaHQgOiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBfZml0Um93c0xheW91dCA6IGZ1bmN0aW9uKCAkZWxlbXMgKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLFxuICAgICAgICAgIGNvbnRhaW5lcldpZHRoID0gdGhpcy5lbGVtZW50LndpZHRoKCksXG4gICAgICAgICAgcHJvcHMgPSB0aGlzLmZpdFJvd3M7XG5cbiAgICAgICRlbGVtcy5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGF0b21XID0gJHRoaXMub3V0ZXJXaWR0aCh0cnVlKSxcbiAgICAgICAgICAgIGF0b21IID0gJHRoaXMub3V0ZXJIZWlnaHQodHJ1ZSk7XG5cbiAgICAgICAgaWYgKCBwcm9wcy54ICE9PSAwICYmIGF0b21XICsgcHJvcHMueCA+IGNvbnRhaW5lcldpZHRoICkge1xuICAgICAgICAgIC8vIGlmIHRoaXMgZWxlbWVudCBjYW5ub3QgZml0IGluIHRoZSBjdXJyZW50IHJvd1xuICAgICAgICAgIHByb3BzLnggPSAwO1xuICAgICAgICAgIHByb3BzLnkgPSBwcm9wcy5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwb3NpdGlvbiB0aGUgYXRvbVxuICAgICAgICBpbnN0YW5jZS5fcHVzaFBvc2l0aW9uKCAkdGhpcywgcHJvcHMueCwgcHJvcHMueSApO1xuXG4gICAgICAgIHByb3BzLmhlaWdodCA9IE1hdGgubWF4KCBwcm9wcy55ICsgYXRvbUgsIHByb3BzLmhlaWdodCApO1xuICAgICAgICBwcm9wcy54ICs9IGF0b21XO1xuXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2ZpdFJvd3NHZXRDb250YWluZXJTaXplIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHsgaGVpZ2h0IDogdGhpcy5maXRSb3dzLmhlaWdodCB9O1xuICAgIH0sXG5cbiAgICBfZml0Um93c1Jlc2l6ZUNoYW5nZWQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gY2VsbHNCeVJvdyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfY2VsbHNCeVJvd1Jlc2V0IDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmNlbGxzQnlSb3cgPSB7XG4gICAgICAgIGluZGV4IDogMFxuICAgICAgfTtcbiAgICAgIC8vIGdldCB0aGlzLmNlbGxzQnlSb3cuY29sdW1uV2lkdGhcbiAgICAgIHRoaXMuX2dldFNlZ21lbnRzKCk7XG4gICAgICAvLyBnZXQgdGhpcy5jZWxsc0J5Um93LnJvd0hlaWdodFxuICAgICAgdGhpcy5fZ2V0U2VnbWVudHModHJ1ZSk7XG4gICAgfSxcblxuICAgIF9jZWxsc0J5Um93TGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgcHJvcHMgPSB0aGlzLmNlbGxzQnlSb3c7XG4gICAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGNvbCA9IHByb3BzLmluZGV4ICUgcHJvcHMuY29scyxcbiAgICAgICAgICAgIHJvdyA9IE1hdGguZmxvb3IoIHByb3BzLmluZGV4IC8gcHJvcHMuY29scyApLFxuICAgICAgICAgICAgeCA9ICggY29sICsgMC41ICkgKiBwcm9wcy5jb2x1bW5XaWR0aCAtICR0aGlzLm91dGVyV2lkdGgodHJ1ZSkgLyAyLFxuICAgICAgICAgICAgeSA9ICggcm93ICsgMC41ICkgKiBwcm9wcy5yb3dIZWlnaHQgLSAkdGhpcy5vdXRlckhlaWdodCh0cnVlKSAvIDI7XG4gICAgICAgIGluc3RhbmNlLl9wdXNoUG9zaXRpb24oICR0aGlzLCB4LCB5ICk7XG4gICAgICAgIHByb3BzLmluZGV4ICsrO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9jZWxsc0J5Um93R2V0Q29udGFpbmVyU2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgaGVpZ2h0IDogTWF0aC5jZWlsKCB0aGlzLiRmaWx0ZXJlZEF0b21zLmxlbmd0aCAvIHRoaXMuY2VsbHNCeVJvdy5jb2xzICkgKiB0aGlzLmNlbGxzQnlSb3cucm93SGVpZ2h0ICsgdGhpcy5vZmZzZXQudG9wIH07XG4gICAgfSxcblxuICAgIF9jZWxsc0J5Um93UmVzaXplQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NoZWNrSWZTZWdtZW50c0NoYW5nZWQoKTtcbiAgICB9LFxuXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09IHN0cmFpZ2h0RG93biA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfc3RyYWlnaHREb3duUmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RyYWlnaHREb3duID0ge1xuICAgICAgICB5IDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgX3N0cmFpZ2h0RG93bkxheW91dCA6IGZ1bmN0aW9uKCAkZWxlbXMgKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgJGVsZW1zLmVhY2goIGZ1bmN0aW9uKCBpICl7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIGluc3RhbmNlLl9wdXNoUG9zaXRpb24oICR0aGlzLCAwLCBpbnN0YW5jZS5zdHJhaWdodERvd24ueSApO1xuICAgICAgICBpbnN0YW5jZS5zdHJhaWdodERvd24ueSArPSAkdGhpcy5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfc3RyYWlnaHREb3duR2V0Q29udGFpbmVyU2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgaGVpZ2h0IDogdGhpcy5zdHJhaWdodERvd24ueSB9O1xuICAgIH0sXG5cbiAgICBfc3RyYWlnaHREb3duUmVzaXplQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBtYXNvbnJ5SG9yaXpvbnRhbCA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfbWFzb25yeUhvcml6b250YWxSZXNldCA6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gbGF5b3V0LXNwZWNpZmljIHByb3BzXG4gICAgICB0aGlzLm1hc29ucnlIb3Jpem9udGFsID0ge307XG4gICAgICAvLyBGSVhNRSBzaG91bGRuJ3QgaGF2ZSB0byBjYWxsIHRoaXMgYWdhaW5cbiAgICAgIHRoaXMuX2dldFNlZ21lbnRzKCB0cnVlICk7XG4gICAgICB2YXIgaSA9IHRoaXMubWFzb25yeUhvcml6b250YWwucm93cztcbiAgICAgIHRoaXMubWFzb25yeUhvcml6b250YWwucm93WHMgPSBbXTtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdGhpcy5tYXNvbnJ5SG9yaXpvbnRhbC5yb3dYcy5wdXNoKCAwICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9tYXNvbnJ5SG9yaXpvbnRhbExheW91dCA6IGZ1bmN0aW9uKCAkZWxlbXMgKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLFxuICAgICAgICAgIHByb3BzID0gaW5zdGFuY2UubWFzb25yeUhvcml6b250YWw7XG4gICAgICAkZWxlbXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgJHRoaXMgID0gJCh0aGlzKSxcbiAgICAgICAgICAgIC8vaG93IG1hbnkgcm93cyBkb2VzIHRoaXMgYnJpY2sgc3BhblxuICAgICAgICAgICAgcm93U3BhbiA9IE1hdGguY2VpbCggJHRoaXMub3V0ZXJIZWlnaHQodHJ1ZSkgLyBwcm9wcy5yb3dIZWlnaHQgKTtcbiAgICAgICAgcm93U3BhbiA9IE1hdGgubWluKCByb3dTcGFuLCBwcm9wcy5yb3dzICk7XG5cbiAgICAgICAgaWYgKCByb3dTcGFuID09PSAxICkge1xuICAgICAgICAgIC8vIGlmIGJyaWNrIHNwYW5zIG9ubHkgb25lIGNvbHVtbiwganVzdCBsaWtlIHNpbmdsZU1vZGVcbiAgICAgICAgICBpbnN0YW5jZS5fbWFzb25yeUhvcml6b250YWxQbGFjZUJyaWNrKCAkdGhpcywgcHJvcHMucm93WHMgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBicmljayBzcGFucyBtb3JlIHRoYW4gb25lIHJvd1xuICAgICAgICAgIC8vIGhvdyBtYW55IGRpZmZlcmVudCBwbGFjZXMgY291bGQgdGhpcyBicmljayBmaXQgaG9yaXpvbnRhbGx5XG4gICAgICAgICAgdmFyIGdyb3VwQ291bnQgPSBwcm9wcy5yb3dzICsgMSAtIHJvd1NwYW4sXG4gICAgICAgICAgICAgIGdyb3VwWCA9IFtdLFxuICAgICAgICAgICAgICBncm91cFJvd1gsIGk7XG5cbiAgICAgICAgICAvLyBmb3IgZWFjaCBncm91cCBwb3RlbnRpYWwgaG9yaXpvbnRhbCBwb3NpdGlvblxuICAgICAgICAgIGZvciAoIGk9MDsgaSA8IGdyb3VwQ291bnQ7IGkrKyApIHtcbiAgICAgICAgICAgIC8vIG1ha2UgYW4gYXJyYXkgb2YgY29sWSB2YWx1ZXMgZm9yIHRoYXQgb25lIGdyb3VwXG4gICAgICAgICAgICBncm91cFJvd1ggPSBwcm9wcy5yb3dYcy5zbGljZSggaSwgaStyb3dTcGFuICk7XG4gICAgICAgICAgICAvLyBhbmQgZ2V0IHRoZSBtYXggdmFsdWUgb2YgdGhlIGFycmF5XG4gICAgICAgICAgICBncm91cFhbaV0gPSBNYXRoLm1heC5hcHBseSggTWF0aCwgZ3JvdXBSb3dYICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5zdGFuY2UuX21hc29ucnlIb3Jpem9udGFsUGxhY2VCcmljayggJHRoaXMsIGdyb3VwWCApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX21hc29ucnlIb3Jpem9udGFsUGxhY2VCcmljayA6IGZ1bmN0aW9uKCAkYnJpY2ssIHNldFggKSB7XG4gICAgICAvLyBnZXQgdGhlIG1pbmltdW0gWSB2YWx1ZSBmcm9tIHRoZSBjb2x1bW5zXG4gICAgICB2YXIgbWluaW11bVggID0gTWF0aC5taW4uYXBwbHkoIE1hdGgsIHNldFggKSxcbiAgICAgICAgICBzbWFsbFJvdyAgPSAwO1xuICAgICAgLy8gRmluZCBpbmRleCBvZiBzbWFsbGVzdCByb3csIHRoZSBmaXJzdCBmcm9tIHRoZSB0b3BcbiAgICAgIGZvciAodmFyIGk9MCwgbGVuID0gc2V0WC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoIHNldFhbaV0gPT09IG1pbmltdW1YICkge1xuICAgICAgICAgIHNtYWxsUm93ID0gaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBwb3NpdGlvbiB0aGUgYnJpY2tcbiAgICAgIHZhciB4ID0gbWluaW11bVgsXG4gICAgICAgICAgeSA9IHRoaXMubWFzb25yeUhvcml6b250YWwucm93SGVpZ2h0ICogc21hbGxSb3c7XG4gICAgICB0aGlzLl9wdXNoUG9zaXRpb24oICRicmljaywgeCwgeSApO1xuXG4gICAgICAvLyBhcHBseSBzZXRIZWlnaHQgdG8gbmVjZXNzYXJ5IGNvbHVtbnNcbiAgICAgIHZhciBzZXRXaWR0aCA9IG1pbmltdW1YICsgJGJyaWNrLm91dGVyV2lkdGgodHJ1ZSksXG4gICAgICAgICAgc2V0U3BhbiA9IHRoaXMubWFzb25yeUhvcml6b250YWwucm93cyArIDEgLSBsZW47XG4gICAgICBmb3IgKCBpPTA7IGkgPCBzZXRTcGFuOyBpKysgKSB7XG4gICAgICAgIHRoaXMubWFzb25yeUhvcml6b250YWwucm93WHNbIHNtYWxsUm93ICsgaSBdID0gc2V0V2lkdGg7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9tYXNvbnJ5SG9yaXpvbnRhbEdldENvbnRhaW5lclNpemUgOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250YWluZXJXaWR0aCA9IE1hdGgubWF4LmFwcGx5KCBNYXRoLCB0aGlzLm1hc29ucnlIb3Jpem9udGFsLnJvd1hzICk7XG4gICAgICByZXR1cm4geyB3aWR0aDogY29udGFpbmVyV2lkdGggfTtcbiAgICB9LFxuXG4gICAgX21hc29ucnlIb3Jpem9udGFsUmVzaXplQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NoZWNrSWZTZWdtZW50c0NoYW5nZWQodHJ1ZSk7XG4gICAgfSxcblxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBmaXRDb2x1bW5zID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9maXRDb2x1bW5zUmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZml0Q29sdW1ucyA9IHtcbiAgICAgICAgeCA6IDAsXG4gICAgICAgIHkgOiAwLFxuICAgICAgICB3aWR0aCA6IDBcbiAgICAgIH07XG4gICAgfSxcblxuICAgIF9maXRDb2x1bW5zTGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gdGhpcy5lbGVtZW50LmhlaWdodCgpLFxuICAgICAgICAgIHByb3BzID0gdGhpcy5maXRDb2x1bW5zO1xuICAgICAgJGVsZW1zLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgYXRvbVcgPSAkdGhpcy5vdXRlcldpZHRoKHRydWUpLFxuICAgICAgICAgICAgYXRvbUggPSAkdGhpcy5vdXRlckhlaWdodCh0cnVlKTtcblxuICAgICAgICBpZiAoIHByb3BzLnkgIT09IDAgJiYgYXRvbUggKyBwcm9wcy55ID4gY29udGFpbmVySGVpZ2h0ICkge1xuICAgICAgICAgIC8vIGlmIHRoaXMgZWxlbWVudCBjYW5ub3QgZml0IGluIHRoZSBjdXJyZW50IGNvbHVtblxuICAgICAgICAgIHByb3BzLnggPSBwcm9wcy53aWR0aDtcbiAgICAgICAgICBwcm9wcy55ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBvc2l0aW9uIHRoZSBhdG9tXG4gICAgICAgIGluc3RhbmNlLl9wdXNoUG9zaXRpb24oICR0aGlzLCBwcm9wcy54LCBwcm9wcy55ICk7XG5cbiAgICAgICAgcHJvcHMud2lkdGggPSBNYXRoLm1heCggcHJvcHMueCArIGF0b21XLCBwcm9wcy53aWR0aCApO1xuICAgICAgICBwcm9wcy55ICs9IGF0b21IO1xuXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2ZpdENvbHVtbnNHZXRDb250YWluZXJTaXplIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHsgd2lkdGggOiB0aGlzLmZpdENvbHVtbnMud2lkdGggfTtcbiAgICB9LFxuXG4gICAgX2ZpdENvbHVtbnNSZXNpemVDaGFuZ2VkIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG5cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gY2VsbHNCeUNvbHVtbiA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfY2VsbHNCeUNvbHVtblJlc2V0IDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmNlbGxzQnlDb2x1bW4gPSB7XG4gICAgICAgIGluZGV4IDogMFxuICAgICAgfTtcbiAgICAgIC8vIGdldCB0aGlzLmNlbGxzQnlDb2x1bW4uY29sdW1uV2lkdGhcbiAgICAgIHRoaXMuX2dldFNlZ21lbnRzKCk7XG4gICAgICAvLyBnZXQgdGhpcy5jZWxsc0J5Q29sdW1uLnJvd0hlaWdodFxuICAgICAgdGhpcy5fZ2V0U2VnbWVudHModHJ1ZSk7XG4gICAgfSxcblxuICAgIF9jZWxsc0J5Q29sdW1uTGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgcHJvcHMgPSB0aGlzLmNlbGxzQnlDb2x1bW47XG4gICAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGNvbCA9IE1hdGguZmxvb3IoIHByb3BzLmluZGV4IC8gcHJvcHMucm93cyApLFxuICAgICAgICAgICAgcm93ID0gcHJvcHMuaW5kZXggJSBwcm9wcy5yb3dzLFxuICAgICAgICAgICAgeCA9ICggY29sICsgMC41ICkgKiBwcm9wcy5jb2x1bW5XaWR0aCAtICR0aGlzLm91dGVyV2lkdGgodHJ1ZSkgLyAyLFxuICAgICAgICAgICAgeSA9ICggcm93ICsgMC41ICkgKiBwcm9wcy5yb3dIZWlnaHQgLSAkdGhpcy5vdXRlckhlaWdodCh0cnVlKSAvIDI7XG4gICAgICAgIGluc3RhbmNlLl9wdXNoUG9zaXRpb24oICR0aGlzLCB4LCB5ICk7XG4gICAgICAgIHByb3BzLmluZGV4ICsrO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9jZWxsc0J5Q29sdW1uR2V0Q29udGFpbmVyU2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgd2lkdGggOiBNYXRoLmNlaWwoIHRoaXMuJGZpbHRlcmVkQXRvbXMubGVuZ3RoIC8gdGhpcy5jZWxsc0J5Q29sdW1uLnJvd3MgKSAqIHRoaXMuY2VsbHNCeUNvbHVtbi5jb2x1bW5XaWR0aCB9O1xuICAgIH0sXG5cbiAgICBfY2VsbHNCeUNvbHVtblJlc2l6ZUNoYW5nZWQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jaGVja0lmU2VnbWVudHNDaGFuZ2VkKHRydWUpO1xuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09IHN0cmFpZ2h0QWNyb3NzID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9zdHJhaWdodEFjcm9zc1Jlc2V0IDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN0cmFpZ2h0QWNyb3NzID0ge1xuICAgICAgICB4IDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgX3N0cmFpZ2h0QWNyb3NzTGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oIGkgKXtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgaW5zdGFuY2UuX3B1c2hQb3NpdGlvbiggJHRoaXMsIGluc3RhbmNlLnN0cmFpZ2h0QWNyb3NzLngsIDAgKTtcbiAgICAgICAgaW5zdGFuY2Uuc3RyYWlnaHRBY3Jvc3MueCArPSAkdGhpcy5vdXRlcldpZHRoKHRydWUpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9zdHJhaWdodEFjcm9zc0dldENvbnRhaW5lclNpemUgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IHdpZHRoIDogdGhpcy5zdHJhaWdodEFjcm9zcy54IH07XG4gICAgfSxcblxuICAgIF9zdHJhaWdodEFjcm9zc1Jlc2l6ZUNoYW5nZWQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICB9O1xuXG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT0gaW1hZ2VzTG9hZGVkIFBsdWdpbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8qIVxuICAgKiBqUXVlcnkgaW1hZ2VzTG9hZGVkIHBsdWdpbiB2MS4xLjBcbiAgICogaHR0cDovL2dpdGh1Yi5jb20vZGVzYW5kcm8vaW1hZ2VzbG9hZGVkXG4gICAqXG4gICAqIE1JVCBMaWNlbnNlLiBieSBQYXVsIElyaXNoIGV0IGFsLlxuICAgKi9cblxuXG4gIC8vICQoJyNteS1jb250YWluZXInKS5pbWFnZXNMb2FkZWQobXlGdW5jdGlvbilcbiAgLy8gb3JcbiAgLy8gJCgnaW1nJykuaW1hZ2VzTG9hZGVkKG15RnVuY3Rpb24pXG5cbiAgLy8gZXhlY3V0ZSBhIGNhbGxiYWNrIHdoZW4gYWxsIGltYWdlcyBoYXZlIGxvYWRlZC5cbiAgLy8gbmVlZGVkIGJlY2F1c2UgLmxvYWQoKSBkb2Vzbid0IHdvcmsgb24gY2FjaGVkIGltYWdlc1xuXG4gIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGdldHMgaW1hZ2UgY29sbGVjdGlvbiBhcyBhcmd1bWVudFxuICAvLyAgYHRoaXNgIGlzIHRoZSBjb250YWluZXJcblxuICAkLmZuLmltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcbiAgICB2YXIgJHRoaXMgPSB0aGlzLFxuICAgICAgICAkaW1hZ2VzID0gJHRoaXMuZmluZCgnaW1nJykuYWRkKCAkdGhpcy5maWx0ZXIoJ2ltZycpICksXG4gICAgICAgIGxlbiA9ICRpbWFnZXMubGVuZ3RoLFxuICAgICAgICBibGFuayA9ICdkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFBQUFBUC8vL3l3QUFBQUFBUUFCQUFBQ0FVd0FPdz09JyxcbiAgICAgICAgbG9hZGVkID0gW107XG5cbiAgICBmdW5jdGlvbiB0cmlnZ2VyQ2FsbGJhY2soKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKCAkdGhpcywgJGltYWdlcyApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGltZ0xvYWRlZCggZXZlbnQgKSB7XG4gICAgICB2YXIgaW1nID0gZXZlbnQudGFyZ2V0O1xuICAgICAgaWYgKCBpbWcuc3JjICE9PSBibGFuayAmJiAkLmluQXJyYXkoIGltZywgbG9hZGVkICkgPT09IC0xICl7XG4gICAgICAgIGxvYWRlZC5wdXNoKCBpbWcgKTtcbiAgICAgICAgaWYgKCAtLWxlbiA8PSAwICl7XG4gICAgICAgICAgc2V0VGltZW91dCggdHJpZ2dlckNhbGxiYWNrICk7XG4gICAgICAgICAgJGltYWdlcy51bmJpbmQoICcuaW1hZ2VzTG9hZGVkJywgaW1nTG9hZGVkICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiBubyBpbWFnZXMsIHRyaWdnZXIgaW1tZWRpYXRlbHlcbiAgICBpZiAoICFsZW4gKSB7XG4gICAgICB0cmlnZ2VyQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICAkaW1hZ2VzLmJpbmQoICdsb2FkLmltYWdlc0xvYWRlZCBlcnJvci5pbWFnZXNMb2FkZWQnLCAgaW1nTG9hZGVkICkuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAvLyBjYWNoZWQgaW1hZ2VzIGRvbid0IGZpcmUgbG9hZCBzb21ldGltZXMsIHNvIHdlIHJlc2V0IHNyYy5cbiAgICAgIHZhciBzcmMgPSB0aGlzLnNyYztcbiAgICAgIC8vIHdlYmtpdCBoYWNrIGZyb20gaHR0cDovL2dyb3Vwcy5nb29nbGUuY29tL2dyb3VwL2pxdWVyeS1kZXYvYnJvd3NlX3RocmVhZC90aHJlYWQvZWVlNmFiN2IyZGE1MGUxZlxuICAgICAgLy8gZGF0YSB1cmkgYnlwYXNzZXMgd2Via2l0IGxvZyB3YXJuaW5nICh0aHggZG91ZyBqb25lcylcbiAgICAgIHRoaXMuc3JjID0gYmxhbms7XG4gICAgICB0aGlzLnNyYyA9IHNyYztcbiAgICB9KTtcblxuICAgIHJldHVybiAkdGhpcztcbiAgfTtcblxuXG4gIC8vIGhlbHBlciBmdW5jdGlvbiBmb3IgbG9nZ2luZyBlcnJvcnNcbiAgLy8gJC5lcnJvciBicmVha3MgalF1ZXJ5IGNoYWluaW5nXG4gIHZhciBsb2dFcnJvciA9IGZ1bmN0aW9uKCBtZXNzYWdlICkge1xuICAgIGlmICggd2luZG93LmNvbnNvbGUgKSB7XG4gICAgICB3aW5kb3cuY29uc29sZS5lcnJvciggbWVzc2FnZSApO1xuICAgIH1cbiAgfTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PSAgUGx1Z2luIGJyaWRnZSAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBsZXZlcmFnZXMgZGF0YSBtZXRob2QgdG8gZWl0aGVyIGNyZWF0ZSBvciByZXR1cm4gJC5Jc290b3BlIGNvbnN0cnVjdG9yXG4gIC8vIEEgYml0IGZyb20galF1ZXJ5IFVJXG4gIC8vICAgaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnktdWkvYmxvYi9tYXN0ZXIvdWkvanF1ZXJ5LnVpLndpZGdldC5qc1xuICAvLyBBIGJpdCBmcm9tIGpjYXJvdXNlbFxuICAvLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qc29yL2pjYXJvdXNlbC9ibG9iL21hc3Rlci9saWIvanF1ZXJ5LmpjYXJvdXNlbC5qc1xuXG4gICQuZm4uaXNvdG9wZSA9IGZ1bmN0aW9uKCBvcHRpb25zLCBjYWxsYmFjayApIHtcbiAgICBpZiAoIHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJyApIHtcbiAgICAgIC8vIGNhbGwgbWV0aG9kXG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcblxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9ICQuZGF0YSggdGhpcywgJ2lzb3RvcGUnICk7XG4gICAgICAgIGlmICggIWluc3RhbmNlICkge1xuICAgICAgICAgIGxvZ0Vycm9yKCBcImNhbm5vdCBjYWxsIG1ldGhvZHMgb24gaXNvdG9wZSBwcmlvciB0byBpbml0aWFsaXphdGlvbjsgXCIgK1xuICAgICAgICAgICAgICBcImF0dGVtcHRlZCB0byBjYWxsIG1ldGhvZCAnXCIgKyBvcHRpb25zICsgXCInXCIgKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhJC5pc0Z1bmN0aW9uKCBpbnN0YW5jZVtvcHRpb25zXSApIHx8IG9wdGlvbnMuY2hhckF0KDApID09PSBcIl9cIiApIHtcbiAgICAgICAgICBsb2dFcnJvciggXCJubyBzdWNoIG1ldGhvZCAnXCIgKyBvcHRpb25zICsgXCInIGZvciBpc290b3BlIGluc3RhbmNlXCIgKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwbHkgbWV0aG9kXG4gICAgICAgIGluc3RhbmNlWyBvcHRpb25zIF0uYXBwbHkoIGluc3RhbmNlLCBhcmdzICk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSAkLmRhdGEoIHRoaXMsICdpc290b3BlJyApO1xuICAgICAgICBpZiAoIGluc3RhbmNlICkge1xuICAgICAgICAgIC8vIGFwcGx5IG9wdGlvbnMgJiBpbml0XG4gICAgICAgICAgaW5zdGFuY2Uub3B0aW9uKCBvcHRpb25zICk7XG4gICAgICAgICAgaW5zdGFuY2UuX2luaXQoIGNhbGxiYWNrICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gaW5pdGlhbGl6ZSBuZXcgaW5zdGFuY2VcbiAgICAgICAgICAkLmRhdGEoIHRoaXMsICdpc290b3BlJywgbmV3ICQuSXNvdG9wZSggb3B0aW9ucywgdGhpcywgY2FsbGJhY2sgKSApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gcmV0dXJuIGpRdWVyeSBvYmplY3RcbiAgICAvLyBzbyBwbHVnaW4gbWV0aG9kcyBkbyBub3QgaGF2ZSB0b1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG59KSggd2luZG93LCBqUXVlcnkgKTsiLCIvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Q2xhc3M6IHByZXR0eVBob3RvXG5cdFVzZTogTGlnaHRib3ggY2xvbmUgZm9yIGpRdWVyeVxuXHRBdXRob3I6IFN0ZXBoYW5lIENhcm9uIChodHRwOi8vd3d3Lm5vLW1hcmdpbi1mb3ItZXJyb3JzLmNvbSlcblx0VmVyc2lvbjogMy4xLjVcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbihmdW5jdGlvbihlKXtmdW5jdGlvbiB0KCl7dmFyIGU9bG9jYXRpb24uaHJlZjtoYXNodGFnPWUuaW5kZXhPZihcIiNwcmV0dHlQaG90b1wiKSE9PS0xP2RlY29kZVVSSShlLnN1YnN0cmluZyhlLmluZGV4T2YoXCIjcHJldHR5UGhvdG9cIikrMSxlLmxlbmd0aCkpOmZhbHNlO3JldHVybiBoYXNodGFnfWZ1bmN0aW9uIG4oKXtpZih0eXBlb2YgdGhlUmVsPT1cInVuZGVmaW5lZFwiKXJldHVybjtsb2NhdGlvbi5oYXNoPXRoZVJlbCtcIi9cIityZWxfaW5kZXgrXCIvXCJ9ZnVuY3Rpb24gcigpe2lmKGxvY2F0aW9uLmhyZWYuaW5kZXhPZihcIiNwcmV0dHlQaG90b1wiKSE9PS0xKWxvY2F0aW9uLmhhc2g9XCJwcmV0dHlQaG90b1wifWZ1bmN0aW9uIGkoZSx0KXtlPWUucmVwbGFjZSgvW1xcW10vLFwiXFxcXFtcIikucmVwbGFjZSgvW1xcXV0vLFwiXFxcXF1cIik7dmFyIG49XCJbXFxcXD8mXVwiK2UrXCI9KFteJiNdKilcIjt2YXIgcj1uZXcgUmVnRXhwKG4pO3ZhciBpPXIuZXhlYyh0KTtyZXR1cm4gaT09bnVsbD9cIlwiOmlbMV19ZS5wcmV0dHlQaG90bz17dmVyc2lvbjpcIjMuMS41XCJ9O2UuZm4ucHJldHR5UGhvdG89ZnVuY3Rpb24ocyl7ZnVuY3Rpb24gZygpe2UoXCIucHBfbG9hZGVySWNvblwiKS5oaWRlKCk7cHJvamVjdGVkVG9wPXNjcm9sbF9wb3NbXCJzY3JvbGxUb3BcIl0rKGQvMi1hW1wiY29udGFpbmVySGVpZ2h0XCJdLzIpO2lmKHByb2plY3RlZFRvcDwwKXByb2plY3RlZFRvcD0wOyRwcHQuZmFkZVRvKHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZCwxKTskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2NvbnRlbnRcIikuYW5pbWF0ZSh7aGVpZ2h0OmFbXCJjb250ZW50SGVpZ2h0XCJdLHdpZHRoOmFbXCJjb250ZW50V2lkdGhcIl19LHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZCk7JHBwX3BpY19ob2xkZXIuYW5pbWF0ZSh7dG9wOnByb2plY3RlZFRvcCxsZWZ0OnYvMi1hW1wiY29udGFpbmVyV2lkdGhcIl0vMjwwPzA6di8yLWFbXCJjb250YWluZXJXaWR0aFwiXS8yLHdpZHRoOmFbXCJjb250YWluZXJXaWR0aFwiXX0sc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLGZ1bmN0aW9uKCl7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9ob3ZlckNvbnRhaW5lciwjZnVsbFJlc0ltYWdlXCIpLmhlaWdodChhW1wiaGVpZ2h0XCJdKS53aWR0aChhW1wid2lkdGhcIl0pOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfZmFkZVwiKS5mYWRlSW4oc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkKTtpZihpc1NldCYmUyhwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSk9PVwiaW1hZ2VcIil7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9ob3ZlckNvbnRhaW5lclwiKS5zaG93KCl9ZWxzZXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2hvdmVyQ29udGFpbmVyXCIpLmhpZGUoKX1pZihzZXR0aW5ncy5hbGxvd19leHBhbmQpe2lmKGFbXCJyZXNpemVkXCJdKXtlKFwiYS5wcF9leHBhbmQsYS5wcF9jb250cmFjdFwiKS5zaG93KCl9ZWxzZXtlKFwiYS5wcF9leHBhbmRcIikuaGlkZSgpfX1pZihzZXR0aW5ncy5hdXRvcGxheV9zbGlkZXNob3cmJiFtJiYhZillLnByZXR0eVBob3RvLnN0YXJ0U2xpZGVzaG93KCk7c2V0dGluZ3MuY2hhbmdlcGljdHVyZWNhbGxiYWNrKCk7Zj10cnVlfSk7QygpO3MuYWpheGNhbGxiYWNrKCl9ZnVuY3Rpb24geSh0KXskcHBfcGljX2hvbGRlci5maW5kKFwiI3BwX2Z1bGxfcmVzIG9iamVjdCwjcHBfZnVsbF9yZXMgZW1iZWRcIikuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfZmFkZVwiKS5mYWRlT3V0KHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZCxmdW5jdGlvbigpe2UoXCIucHBfbG9hZGVySWNvblwiKS5zaG93KCk7dCgpfSl9ZnVuY3Rpb24gYih0KXt0PjE/ZShcIi5wcF9uYXZcIikuc2hvdygpOmUoXCIucHBfbmF2XCIpLmhpZGUoKX1mdW5jdGlvbiB3KGUsdCl7cmVzaXplZD1mYWxzZTtFKGUsdCk7aW1hZ2VXaWR0aD1lLGltYWdlSGVpZ2h0PXQ7aWYoKHA+dnx8aD5kKSYmZG9yZXNpemUmJnNldHRpbmdzLmFsbG93X3Jlc2l6ZSYmIXUpe3Jlc2l6ZWQ9dHJ1ZSxmaXR0aW5nPWZhbHNlO3doaWxlKCFmaXR0aW5nKXtpZihwPnYpe2ltYWdlV2lkdGg9di0yMDA7aW1hZ2VIZWlnaHQ9dC9lKmltYWdlV2lkdGh9ZWxzZSBpZihoPmQpe2ltYWdlSGVpZ2h0PWQtMjAwO2ltYWdlV2lkdGg9ZS90KmltYWdlSGVpZ2h0fWVsc2V7Zml0dGluZz10cnVlfWg9aW1hZ2VIZWlnaHQscD1pbWFnZVdpZHRofWlmKHA+dnx8aD5kKXt3KHAsaCl9RShpbWFnZVdpZHRoLGltYWdlSGVpZ2h0KX1yZXR1cm57d2lkdGg6TWF0aC5mbG9vcihpbWFnZVdpZHRoKSxoZWlnaHQ6TWF0aC5mbG9vcihpbWFnZUhlaWdodCksY29udGFpbmVySGVpZ2h0Ok1hdGguZmxvb3IoaCksY29udGFpbmVyV2lkdGg6TWF0aC5mbG9vcihwKStzZXR0aW5ncy5ob3Jpem9udGFsX3BhZGRpbmcqMixjb250ZW50SGVpZ2h0Ok1hdGguZmxvb3IobCksY29udGVudFdpZHRoOk1hdGguZmxvb3IoYykscmVzaXplZDpyZXNpemVkfX1mdW5jdGlvbiBFKHQsbil7dD1wYXJzZUZsb2F0KHQpO249cGFyc2VGbG9hdChuKTskcHBfZGV0YWlscz0kcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2RldGFpbHNcIik7JHBwX2RldGFpbHMud2lkdGgodCk7ZGV0YWlsc0hlaWdodD1wYXJzZUZsb2F0KCRwcF9kZXRhaWxzLmNzcyhcIm1hcmdpblRvcFwiKSkrcGFyc2VGbG9hdCgkcHBfZGV0YWlscy5jc3MoXCJtYXJnaW5Cb3R0b21cIikpOyRwcF9kZXRhaWxzPSRwcF9kZXRhaWxzLmNsb25lKCkuYWRkQ2xhc3Moc2V0dGluZ3MudGhlbWUpLndpZHRoKHQpLmFwcGVuZFRvKGUoXCJib2R5XCIpKS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6LTFlNH0pO2RldGFpbHNIZWlnaHQrPSRwcF9kZXRhaWxzLmhlaWdodCgpO2RldGFpbHNIZWlnaHQ9ZGV0YWlsc0hlaWdodDw9MzQ/MzY6ZGV0YWlsc0hlaWdodDskcHBfZGV0YWlscy5yZW1vdmUoKTskcHBfdGl0bGU9JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcHRcIik7JHBwX3RpdGxlLndpZHRoKHQpO3RpdGxlSGVpZ2h0PXBhcnNlRmxvYXQoJHBwX3RpdGxlLmNzcyhcIm1hcmdpblRvcFwiKSkrcGFyc2VGbG9hdCgkcHBfdGl0bGUuY3NzKFwibWFyZ2luQm90dG9tXCIpKTskcHBfdGl0bGU9JHBwX3RpdGxlLmNsb25lKCkuYXBwZW5kVG8oZShcImJvZHlcIikpLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDotMWU0fSk7dGl0bGVIZWlnaHQrPSRwcF90aXRsZS5oZWlnaHQoKTskcHBfdGl0bGUucmVtb3ZlKCk7bD1uK2RldGFpbHNIZWlnaHQ7Yz10O2g9bCt0aXRsZUhlaWdodCskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX3RvcFwiKS5oZWlnaHQoKSskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2JvdHRvbVwiKS5oZWlnaHQoKTtwPXR9ZnVuY3Rpb24gUyhlKXtpZihlLm1hdGNoKC95b3V0dWJlXFwuY29tXFwvd2F0Y2gvaSl8fGUubWF0Y2goL3lvdXR1XFwuYmUvaSkpe3JldHVyblwieW91dHViZVwifWVsc2UgaWYoZS5tYXRjaCgvdmltZW9cXC5jb20vaSkpe3JldHVyblwidmltZW9cIn1lbHNlIGlmKGUubWF0Y2goL1xcYi5tb3ZcXGIvaSkpe3JldHVyblwicXVpY2t0aW1lXCJ9ZWxzZSBpZihlLm1hdGNoKC9cXGIuc3dmXFxiL2kpKXtyZXR1cm5cImZsYXNoXCJ9ZWxzZSBpZihlLm1hdGNoKC9cXGJpZnJhbWU9dHJ1ZVxcYi9pKSl7cmV0dXJuXCJpZnJhbWVcIn1lbHNlIGlmKGUubWF0Y2goL1xcYmFqYXg9dHJ1ZVxcYi9pKSl7cmV0dXJuXCJhamF4XCJ9ZWxzZSBpZihlLm1hdGNoKC9cXGJjdXN0b209dHJ1ZVxcYi9pKSl7cmV0dXJuXCJjdXN0b21cIn1lbHNlIGlmKGUuc3Vic3RyKDAsMSk9PVwiI1wiKXtyZXR1cm5cImlubGluZVwifWVsc2V7cmV0dXJuXCJpbWFnZVwifX1mdW5jdGlvbiB4KCl7aWYoZG9yZXNpemUmJnR5cGVvZiAkcHBfcGljX2hvbGRlciE9XCJ1bmRlZmluZWRcIil7c2Nyb2xsX3Bvcz1UKCk7Y29udGVudEhlaWdodD0kcHBfcGljX2hvbGRlci5oZWlnaHQoKSxjb250ZW50d2lkdGg9JHBwX3BpY19ob2xkZXIud2lkdGgoKTtwcm9qZWN0ZWRUb3A9ZC8yK3Njcm9sbF9wb3NbXCJzY3JvbGxUb3BcIl0tY29udGVudEhlaWdodC8yO2lmKHByb2plY3RlZFRvcDwwKXByb2plY3RlZFRvcD0wO2lmKGNvbnRlbnRIZWlnaHQ+ZClyZXR1cm47JHBwX3BpY19ob2xkZXIuY3NzKHt0b3A6cHJvamVjdGVkVG9wLGxlZnQ6di8yK3Njcm9sbF9wb3NbXCJzY3JvbGxMZWZ0XCJdLWNvbnRlbnR3aWR0aC8yfSl9fWZ1bmN0aW9uIFQoKXtpZihzZWxmLnBhZ2VZT2Zmc2V0KXtyZXR1cm57c2Nyb2xsVG9wOnNlbGYucGFnZVlPZmZzZXQsc2Nyb2xsTGVmdDpzZWxmLnBhZ2VYT2Zmc2V0fX1lbHNlIGlmKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCYmZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCl7cmV0dXJue3Njcm9sbFRvcDpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wLHNjcm9sbExlZnQ6ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnR9fWVsc2UgaWYoZG9jdW1lbnQuYm9keSl7cmV0dXJue3Njcm9sbFRvcDpkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCxzY3JvbGxMZWZ0OmRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdH19fWZ1bmN0aW9uIE4oKXtkPWUod2luZG93KS5oZWlnaHQoKSx2PWUod2luZG93KS53aWR0aCgpO2lmKHR5cGVvZiAkcHBfb3ZlcmxheSE9XCJ1bmRlZmluZWRcIikkcHBfb3ZlcmxheS5oZWlnaHQoZShkb2N1bWVudCkuaGVpZ2h0KCkpLndpZHRoKHYpfWZ1bmN0aW9uIEMoKXtpZihpc1NldCYmc2V0dGluZ3Mub3ZlcmxheV9nYWxsZXJ5JiZTKHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKT09XCJpbWFnZVwiKXtpdGVtV2lkdGg9NTIrNTtuYXZXaWR0aD1zZXR0aW5ncy50aGVtZT09XCJmYWNlYm9va1wifHxzZXR0aW5ncy50aGVtZT09XCJwcF9kZWZhdWx0XCI/NTA6MzA7aXRlbXNQZXJQYWdlPU1hdGguZmxvb3IoKGFbXCJjb250YWluZXJXaWR0aFwiXS0xMDAtbmF2V2lkdGgpL2l0ZW1XaWR0aCk7aXRlbXNQZXJQYWdlPWl0ZW1zUGVyUGFnZTxwcF9pbWFnZXMubGVuZ3RoP2l0ZW1zUGVyUGFnZTpwcF9pbWFnZXMubGVuZ3RoO3RvdGFsUGFnZT1NYXRoLmNlaWwocHBfaW1hZ2VzLmxlbmd0aC9pdGVtc1BlclBhZ2UpLTE7aWYodG90YWxQYWdlPT0wKXtuYXZXaWR0aD0wOyRwcF9nYWxsZXJ5LmZpbmQoXCIucHBfYXJyb3dfbmV4dCwucHBfYXJyb3dfcHJldmlvdXNcIikuaGlkZSgpfWVsc2V7JHBwX2dhbGxlcnkuZmluZChcIi5wcF9hcnJvd19uZXh0LC5wcF9hcnJvd19wcmV2aW91c1wiKS5zaG93KCl9Z2FsbGVyeVdpZHRoPWl0ZW1zUGVyUGFnZSppdGVtV2lkdGg7ZnVsbEdhbGxlcnlXaWR0aD1wcF9pbWFnZXMubGVuZ3RoKml0ZW1XaWR0aDskcHBfZ2FsbGVyeS5jc3MoXCJtYXJnaW4tbGVmdFwiLC0oZ2FsbGVyeVdpZHRoLzIrbmF2V2lkdGgvMikpLmZpbmQoXCJkaXY6Zmlyc3RcIikud2lkdGgoZ2FsbGVyeVdpZHRoKzUpLmZpbmQoXCJ1bFwiKS53aWR0aChmdWxsR2FsbGVyeVdpZHRoKS5maW5kKFwibGkuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtnb1RvUGFnZT1NYXRoLmZsb29yKHNldF9wb3NpdGlvbi9pdGVtc1BlclBhZ2UpPHRvdGFsUGFnZT9NYXRoLmZsb29yKHNldF9wb3NpdGlvbi9pdGVtc1BlclBhZ2UpOnRvdGFsUGFnZTtlLnByZXR0eVBob3RvLmNoYW5nZUdhbGxlcnlQYWdlKGdvVG9QYWdlKTskcHBfZ2FsbGVyeV9saS5maWx0ZXIoXCI6ZXEoXCIrc2V0X3Bvc2l0aW9uK1wiKVwiKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpfWVsc2V7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9jb250ZW50XCIpLnVuYmluZChcIm1vdXNlZW50ZXIgbW91c2VsZWF2ZVwiKX19ZnVuY3Rpb24gayh0KXtpZihzZXR0aW5ncy5zb2NpYWxfdG9vbHMpZmFjZWJvb2tfbGlrZV9saW5rPXNldHRpbmdzLnNvY2lhbF90b29scy5yZXBsYWNlKFwie2xvY2F0aW9uX2hyZWZ9XCIsZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLmhyZWYpKTtzZXR0aW5ncy5tYXJrdXA9c2V0dGluZ3MubWFya3VwLnJlcGxhY2UoXCJ7cHBfc29jaWFsfVwiLFwiXCIpO2UoXCJib2R5XCIpLmFwcGVuZChzZXR0aW5ncy5tYXJrdXApOyRwcF9waWNfaG9sZGVyPWUoXCIucHBfcGljX2hvbGRlclwiKSwkcHB0PWUoXCIucHB0XCIpLCRwcF9vdmVybGF5PWUoXCJkaXYucHBfb3ZlcmxheVwiKTtpZihpc1NldCYmc2V0dGluZ3Mub3ZlcmxheV9nYWxsZXJ5KXtjdXJyZW50R2FsbGVyeVBhZ2U9MDt0b0luamVjdD1cIlwiO2Zvcih2YXIgbj0wO248cHBfaW1hZ2VzLmxlbmd0aDtuKyspe2lmKCFwcF9pbWFnZXNbbl0ubWF0Y2goL1xcYihqcGd8anBlZ3xwbmd8Z2lmKVxcYi9naSkpe2NsYXNzbmFtZT1cImRlZmF1bHRcIjtpbWdfc3JjPVwiXCJ9ZWxzZXtjbGFzc25hbWU9XCJcIjtpbWdfc3JjPXBwX2ltYWdlc1tuXX10b0luamVjdCs9XCI8bGkgY2xhc3M9J1wiK2NsYXNzbmFtZStcIic+PGEgaHJlZj0nIyc+PGltZyBzcmM9J1wiK2ltZ19zcmMrXCInIHdpZHRoPSc1MCcgYWx0PScnIC8+PC9hPjwvbGk+XCJ9dG9JbmplY3Q9c2V0dGluZ3MuZ2FsbGVyeV9tYXJrdXAucmVwbGFjZSgve2dhbGxlcnl9L2csdG9JbmplY3QpOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIjcHBfZnVsbF9yZXNcIikuYWZ0ZXIodG9JbmplY3QpOyRwcF9nYWxsZXJ5PWUoXCIucHBfcGljX2hvbGRlciAucHBfZ2FsbGVyeVwiKSwkcHBfZ2FsbGVyeV9saT0kcHBfZ2FsbGVyeS5maW5kKFwibGlcIik7JHBwX2dhbGxlcnkuZmluZChcIi5wcF9hcnJvd19uZXh0XCIpLmNsaWNrKGZ1bmN0aW9uKCl7ZS5wcmV0dHlQaG90by5jaGFuZ2VHYWxsZXJ5UGFnZShcIm5leHRcIik7ZS5wcmV0dHlQaG90by5zdG9wU2xpZGVzaG93KCk7cmV0dXJuIGZhbHNlfSk7JHBwX2dhbGxlcnkuZmluZChcIi5wcF9hcnJvd19wcmV2aW91c1wiKS5jbGljayhmdW5jdGlvbigpe2UucHJldHR5UGhvdG8uY2hhbmdlR2FsbGVyeVBhZ2UoXCJwcmV2aW91c1wiKTtlLnByZXR0eVBob3RvLnN0b3BTbGlkZXNob3coKTtyZXR1cm4gZmFsc2V9KTskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2NvbnRlbnRcIikuaG92ZXIoZnVuY3Rpb24oKXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2dhbGxlcnk6bm90KC5kaXNhYmxlZClcIikuZmFkZUluKCl9LGZ1bmN0aW9uKCl7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9nYWxsZXJ5Om5vdCguZGlzYWJsZWQpXCIpLmZhZGVPdXQoKX0pO2l0ZW1XaWR0aD01Mis1OyRwcF9nYWxsZXJ5X2xpLmVhY2goZnVuY3Rpb24odCl7ZSh0aGlzKS5maW5kKFwiYVwiKS5jbGljayhmdW5jdGlvbigpe2UucHJldHR5UGhvdG8uY2hhbmdlUGFnZSh0KTtlLnByZXR0eVBob3RvLnN0b3BTbGlkZXNob3coKTtyZXR1cm4gZmFsc2V9KX0pfWlmKHNldHRpbmdzLnNsaWRlc2hvdyl7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9uYXZcIikucHJlcGVuZCgnPGEgaHJlZj1cIiNcIiBjbGFzcz1cInBwX3BsYXlcIj5QbGF5PC9hPicpOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfbmF2IC5wcF9wbGF5XCIpLmNsaWNrKGZ1bmN0aW9uKCl7ZS5wcmV0dHlQaG90by5zdGFydFNsaWRlc2hvdygpO3JldHVybiBmYWxzZX0pfSRwcF9waWNfaG9sZGVyLmF0dHIoXCJjbGFzc1wiLFwicHBfcGljX2hvbGRlciBcIitzZXR0aW5ncy50aGVtZSk7JHBwX292ZXJsYXkuY3NzKHtvcGFjaXR5OjAsaGVpZ2h0OmUoZG9jdW1lbnQpLmhlaWdodCgpLHdpZHRoOmUod2luZG93KS53aWR0aCgpfSkuYmluZChcImNsaWNrXCIsZnVuY3Rpb24oKXtpZighc2V0dGluZ3MubW9kYWwpZS5wcmV0dHlQaG90by5jbG9zZSgpfSk7ZShcImEucHBfY2xvc2VcIikuYmluZChcImNsaWNrXCIsZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLmNsb3NlKCk7cmV0dXJuIGZhbHNlfSk7aWYoc2V0dGluZ3MuYWxsb3dfZXhwYW5kKXtlKFwiYS5wcF9leHBhbmRcIikuYmluZChcImNsaWNrXCIsZnVuY3Rpb24odCl7aWYoZSh0aGlzKS5oYXNDbGFzcyhcInBwX2V4cGFuZFwiKSl7ZSh0aGlzKS5yZW1vdmVDbGFzcyhcInBwX2V4cGFuZFwiKS5hZGRDbGFzcyhcInBwX2NvbnRyYWN0XCIpO2RvcmVzaXplPWZhbHNlfWVsc2V7ZSh0aGlzKS5yZW1vdmVDbGFzcyhcInBwX2NvbnRyYWN0XCIpLmFkZENsYXNzKFwicHBfZXhwYW5kXCIpO2RvcmVzaXplPXRydWV9eShmdW5jdGlvbigpe2UucHJldHR5UGhvdG8ub3BlbigpfSk7cmV0dXJuIGZhbHNlfSl9JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9wcmV2aW91cywgLnBwX25hdiAucHBfYXJyb3dfcHJldmlvdXNcIikuYmluZChcImNsaWNrXCIsZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLmNoYW5nZVBhZ2UoXCJwcmV2aW91c1wiKTtlLnByZXR0eVBob3RvLnN0b3BTbGlkZXNob3coKTtyZXR1cm4gZmFsc2V9KTskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX25leHQsIC5wcF9uYXYgLnBwX2Fycm93X25leHRcIikuYmluZChcImNsaWNrXCIsZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLmNoYW5nZVBhZ2UoXCJuZXh0XCIpO2UucHJldHR5UGhvdG8uc3RvcFNsaWRlc2hvdygpO3JldHVybiBmYWxzZX0pO3goKX1zPWpRdWVyeS5leHRlbmQoe2hvb2s6XCJyZWxcIixhbmltYXRpb25fc3BlZWQ6XCJmYXN0XCIsYWpheGNhbGxiYWNrOmZ1bmN0aW9uKCl7fSxzbGlkZXNob3c6NWUzLGF1dG9wbGF5X3NsaWRlc2hvdzpmYWxzZSxvcGFjaXR5Oi44LHNob3dfdGl0bGU6dHJ1ZSxhbGxvd19yZXNpemU6dHJ1ZSxhbGxvd19leHBhbmQ6dHJ1ZSxkZWZhdWx0X3dpZHRoOjUwMCxkZWZhdWx0X2hlaWdodDozNDQsY291bnRlcl9zZXBhcmF0b3JfbGFiZWw6XCIvXCIsdGhlbWU6XCJwcF9kZWZhdWx0XCIsaG9yaXpvbnRhbF9wYWRkaW5nOjIwLGhpZGVmbGFzaDpmYWxzZSx3bW9kZTpcIm9wYXF1ZVwiLGF1dG9wbGF5OnRydWUsbW9kYWw6ZmFsc2UsZGVlcGxpbmtpbmc6dHJ1ZSxvdmVybGF5X2dhbGxlcnk6dHJ1ZSxvdmVybGF5X2dhbGxlcnlfbWF4OjMwLGtleWJvYXJkX3Nob3J0Y3V0czp0cnVlLGNoYW5nZXBpY3R1cmVjYWxsYmFjazpmdW5jdGlvbigpe30sY2FsbGJhY2s6ZnVuY3Rpb24oKXt9LGllNl9mYWxsYmFjazp0cnVlLG1hcmt1cDonPGRpdiBjbGFzcz1cInBwX3BpY19ob2xkZXJcIj4gXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwdFwiPsKgPC9kaXY+IFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF90b3BcIj4gXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfbGVmdFwiPjwvZGl2PiBcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9taWRkbGVcIj48L2Rpdj4gXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfcmlnaHRcIj48L2Rpdj4gXHRcdFx0XHRcdFx0PC9kaXY+IFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9jb250ZW50X2NvbnRhaW5lclwiPiBcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9sZWZ0XCI+IFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX3JpZ2h0XCI+IFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfY29udGVudFwiPiBcdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfbG9hZGVySWNvblwiPjwvZGl2PiBcdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfZmFkZVwiPiBcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJwcF9leHBhbmRcIiB0aXRsZT1cIkV4cGFuZCB0aGUgaW1hZ2VcIj5FeHBhbmQ8L2E+IFx0XHRcdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX2hvdmVyQ29udGFpbmVyXCI+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8YSBjbGFzcz1cInBwX25leHRcIiBocmVmPVwiI1wiPm5leHQ8L2E+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8YSBjbGFzcz1cInBwX3ByZXZpb3VzXCIgaHJlZj1cIiNcIj5wcmV2aW91czwvYT4gXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGlkPVwicHBfZnVsbF9yZXNcIj48L2Rpdj4gXHRcdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfZGV0YWlsc1wiPiBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX25hdlwiPiBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8YSBocmVmPVwiI1wiIGNsYXNzPVwicHBfYXJyb3dfcHJldmlvdXNcIj5QcmV2aW91czwvYT4gXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHAgY2xhc3M9XCJjdXJyZW50VGV4dEhvbGRlclwiPjAvMDwvcD4gXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cIiNcIiBjbGFzcz1cInBwX2Fycm93X25leHRcIj5OZXh0PC9hPiBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9kaXY+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8cCBjbGFzcz1cInBwX2Rlc2NyaXB0aW9uXCI+PC9wPiBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX3NvY2lhbFwiPntwcF9zb2NpYWx9PC9kaXY+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8YSBjbGFzcz1cInBwX2Nsb3NlXCIgaHJlZj1cIiNcIj5DbG9zZTwvYT4gXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0XHRcdFx0PC9kaXY+IFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0PC9kaXY+IFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9ib3R0b21cIj4gXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfbGVmdFwiPjwvZGl2PiBcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9taWRkbGVcIj48L2Rpdj4gXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfcmlnaHRcIj48L2Rpdj4gXHRcdFx0XHRcdFx0PC9kaXY+IFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9vdmVybGF5XCI+PC9kaXY+JyxnYWxsZXJ5X21hcmt1cDonPGRpdiBjbGFzcz1cInBwX2dhbGxlcnlcIj4gXHRcdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJwcF9hcnJvd19wcmV2aW91c1wiPlByZXZpb3VzPC9hPiBcdFx0XHRcdFx0XHRcdFx0PGRpdj4gXHRcdFx0XHRcdFx0XHRcdFx0PHVsPiBcdFx0XHRcdFx0XHRcdFx0XHRcdHtnYWxsZXJ5fSBcdFx0XHRcdFx0XHRcdFx0XHQ8L3VsPiBcdFx0XHRcdFx0XHRcdFx0PC9kaXY+IFx0XHRcdFx0XHRcdFx0XHQ8YSBocmVmPVwiI1wiIGNsYXNzPVwicHBfYXJyb3dfbmV4dFwiPk5leHQ8L2E+IFx0XHRcdFx0XHRcdFx0PC9kaXY+JyxpbWFnZV9tYXJrdXA6JzxpbWcgaWQ9XCJmdWxsUmVzSW1hZ2VcIiBzcmM9XCJ7cGF0aH1cIiAvPicsZmxhc2hfbWFya3VwOic8b2JqZWN0IGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiB3aWR0aD1cInt3aWR0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiPjxwYXJhbSBuYW1lPVwid21vZGVcIiB2YWx1ZT1cInt3bW9kZX1cIiAvPjxwYXJhbSBuYW1lPVwiYWxsb3dmdWxsc2NyZWVuXCIgdmFsdWU9XCJ0cnVlXCIgLz48cGFyYW0gbmFtZT1cImFsbG93c2NyaXB0YWNjZXNzXCIgdmFsdWU9XCJhbHdheXNcIiAvPjxwYXJhbSBuYW1lPVwibW92aWVcIiB2YWx1ZT1cIntwYXRofVwiIC8+PGVtYmVkIHNyYz1cIntwYXRofVwiIHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGFsbG93ZnVsbHNjcmVlbj1cInRydWVcIiBhbGxvd3NjcmlwdGFjY2Vzcz1cImFsd2F5c1wiIHdpZHRoPVwie3dpZHRofVwiIGhlaWdodD1cIntoZWlnaHR9XCIgd21vZGU9XCJ7d21vZGV9XCI+PC9lbWJlZD48L29iamVjdD4nLHF1aWNrdGltZV9tYXJrdXA6JzxvYmplY3QgY2xhc3NpZD1cImNsc2lkOjAyQkYyNUQ1LThDMTctNEIyMy1CQzgwLUQzNDg4QUJEREM2QlwiIGNvZGViYXNlPVwiaHR0cDovL3d3dy5hcHBsZS5jb20vcXRhY3RpdmV4L3F0cGx1Z2luLmNhYlwiIGhlaWdodD1cIntoZWlnaHR9XCIgd2lkdGg9XCJ7d2lkdGh9XCI+PHBhcmFtIG5hbWU9XCJzcmNcIiB2YWx1ZT1cIntwYXRofVwiPjxwYXJhbSBuYW1lPVwiYXV0b3BsYXlcIiB2YWx1ZT1cInthdXRvcGxheX1cIj48cGFyYW0gbmFtZT1cInR5cGVcIiB2YWx1ZT1cInZpZGVvL3F1aWNrdGltZVwiPjxlbWJlZCBzcmM9XCJ7cGF0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiIHdpZHRoPVwie3dpZHRofVwiIGF1dG9wbGF5PVwie2F1dG9wbGF5fVwiIHR5cGU9XCJ2aWRlby9xdWlja3RpbWVcIiBwbHVnaW5zcGFnZT1cImh0dHA6Ly93d3cuYXBwbGUuY29tL3F1aWNrdGltZS9kb3dubG9hZC9cIj48L2VtYmVkPjwvb2JqZWN0PicsaWZyYW1lX21hcmt1cDonPGlmcmFtZSBzcmMgPVwie3BhdGh9XCIgd2lkdGg9XCJ7d2lkdGh9XCIgaGVpZ2h0PVwie2hlaWdodH1cIiBmcmFtZWJvcmRlcj1cIm5vXCI+PC9pZnJhbWU+JyxpbmxpbmVfbWFya3VwOic8ZGl2IGNsYXNzPVwicHBfaW5saW5lXCI+e2NvbnRlbnR9PC9kaXY+JyxjdXN0b21fbWFya3VwOlwiXCIsc29jaWFsX3Rvb2xzOic8ZGl2IGNsYXNzPVwidHdpdHRlclwiPjxhIGhyZWY9XCJodHRwOi8vdHdpdHRlci5jb20vc2hhcmVcIiBjbGFzcz1cInR3aXR0ZXItc2hhcmUtYnV0dG9uXCIgZGF0YS1jb3VudD1cIm5vbmVcIj5Ud2VldDwvYT48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCJodHRwOi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy5qc1wiPjwvc2NyaXB0PjwvZGl2PjxkaXYgY2xhc3M9XCJmYWNlYm9va1wiPjxpZnJhbWUgc3JjPVwiLy93d3cuZmFjZWJvb2suY29tL3BsdWdpbnMvbGlrZS5waHA/bG9jYWxlPWVuX1VTJmhyZWY9e2xvY2F0aW9uX2hyZWZ9JmxheW91dD1idXR0b25fY291bnQmc2hvd19mYWNlcz10cnVlJndpZHRoPTUwMCZhY3Rpb249bGlrZSZmb250JmNvbG9yc2NoZW1lPWxpZ2h0JmhlaWdodD0yM1wiIHNjcm9sbGluZz1cIm5vXCIgZnJhbWVib3JkZXI9XCIwXCIgc3R5bGU9XCJib3JkZXI6bm9uZTsgb3ZlcmZsb3c6aGlkZGVuOyB3aWR0aDo1MDBweDsgaGVpZ2h0OjIzcHg7XCIgYWxsb3dUcmFuc3BhcmVuY3k9XCJ0cnVlXCI+PC9pZnJhbWU+PC9kaXY+J30scyk7dmFyIG89dGhpcyx1PWZhbHNlLGEsZixsLGMsaCxwLGQ9ZSh3aW5kb3cpLmhlaWdodCgpLHY9ZSh3aW5kb3cpLndpZHRoKCksbTtkb3Jlc2l6ZT10cnVlLHNjcm9sbF9wb3M9VCgpO2Uod2luZG93KS51bmJpbmQoXCJyZXNpemUucHJldHR5cGhvdG9cIikuYmluZChcInJlc2l6ZS5wcmV0dHlwaG90b1wiLGZ1bmN0aW9uKCl7eCgpO04oKX0pO2lmKHMua2V5Ym9hcmRfc2hvcnRjdXRzKXtlKGRvY3VtZW50KS51bmJpbmQoXCJrZXlkb3duLnByZXR0eXBob3RvXCIpLmJpbmQoXCJrZXlkb3duLnByZXR0eXBob3RvXCIsZnVuY3Rpb24odCl7aWYodHlwZW9mICRwcF9waWNfaG9sZGVyIT1cInVuZGVmaW5lZFwiKXtpZigkcHBfcGljX2hvbGRlci5pcyhcIjp2aXNpYmxlXCIpKXtzd2l0Y2godC5rZXlDb2RlKXtjYXNlIDM3OmUucHJldHR5UGhvdG8uY2hhbmdlUGFnZShcInByZXZpb3VzXCIpO3QucHJldmVudERlZmF1bHQoKTticmVhaztjYXNlIDM5OmUucHJldHR5UGhvdG8uY2hhbmdlUGFnZShcIm5leHRcIik7dC5wcmV2ZW50RGVmYXVsdCgpO2JyZWFrO2Nhc2UgMjc6aWYoIXNldHRpbmdzLm1vZGFsKWUucHJldHR5UGhvdG8uY2xvc2UoKTt0LnByZXZlbnREZWZhdWx0KCk7YnJlYWt9fX19KX1lLnByZXR0eVBob3RvLmluaXRpYWxpemU9ZnVuY3Rpb24oKXtzZXR0aW5ncz1zO2lmKHNldHRpbmdzLnRoZW1lPT1cInBwX2RlZmF1bHRcIilzZXR0aW5ncy5ob3Jpem9udGFsX3BhZGRpbmc9MTY7dGhlUmVsPWUodGhpcykuYXR0cihzZXR0aW5ncy5ob29rKTtnYWxsZXJ5UmVnRXhwPS9cXFsoPzouKilcXF0vO2lzU2V0PWdhbGxlcnlSZWdFeHAuZXhlYyh0aGVSZWwpP3RydWU6ZmFsc2U7cHBfaW1hZ2VzPWlzU2V0P2pRdWVyeS5tYXAobyxmdW5jdGlvbih0LG4pe2lmKGUodCkuYXR0cihzZXR0aW5ncy5ob29rKS5pbmRleE9mKHRoZVJlbCkhPS0xKXJldHVybiBlKHQpLmF0dHIoXCJocmVmXCIpfSk6ZS5tYWtlQXJyYXkoZSh0aGlzKS5hdHRyKFwiaHJlZlwiKSk7cHBfdGl0bGVzPWlzU2V0P2pRdWVyeS5tYXAobyxmdW5jdGlvbih0LG4pe2lmKGUodCkuYXR0cihzZXR0aW5ncy5ob29rKS5pbmRleE9mKHRoZVJlbCkhPS0xKXJldHVybiBlKHQpLmZpbmQoXCJpbWdcIikuYXR0cihcImFsdFwiKT9lKHQpLmZpbmQoXCJpbWdcIikuYXR0cihcImFsdFwiKTpcIlwifSk6ZS5tYWtlQXJyYXkoZSh0aGlzKS5maW5kKFwiaW1nXCIpLmF0dHIoXCJhbHRcIikpO3BwX2Rlc2NyaXB0aW9ucz1pc1NldD9qUXVlcnkubWFwKG8sZnVuY3Rpb24odCxuKXtpZihlKHQpLmF0dHIoc2V0dGluZ3MuaG9vaykuaW5kZXhPZih0aGVSZWwpIT0tMSlyZXR1cm4gZSh0KS5hdHRyKFwidGl0bGVcIik/ZSh0KS5hdHRyKFwidGl0bGVcIik6XCJcIn0pOmUubWFrZUFycmF5KGUodGhpcykuYXR0cihcInRpdGxlXCIpKTtpZihwcF9pbWFnZXMubGVuZ3RoPnNldHRpbmdzLm92ZXJsYXlfZ2FsbGVyeV9tYXgpc2V0dGluZ3Mub3ZlcmxheV9nYWxsZXJ5PWZhbHNlO3NldF9wb3NpdGlvbj1qUXVlcnkuaW5BcnJheShlKHRoaXMpLmF0dHIoXCJocmVmXCIpLHBwX2ltYWdlcyk7cmVsX2luZGV4PWlzU2V0P3NldF9wb3NpdGlvbjplKFwiYVtcIitzZXR0aW5ncy5ob29rK1wiXj0nXCIrdGhlUmVsK1wiJ11cIikuaW5kZXgoZSh0aGlzKSk7ayh0aGlzKTtpZihzZXR0aW5ncy5hbGxvd19yZXNpemUpZSh3aW5kb3cpLmJpbmQoXCJzY3JvbGwucHJldHR5cGhvdG9cIixmdW5jdGlvbigpe3goKX0pO2UucHJldHR5UGhvdG8ub3BlbigpO3JldHVybiBmYWxzZX07ZS5wcmV0dHlQaG90by5vcGVuPWZ1bmN0aW9uKHQpe2lmKHR5cGVvZiBzZXR0aW5ncz09XCJ1bmRlZmluZWRcIil7c2V0dGluZ3M9cztwcF9pbWFnZXM9ZS5tYWtlQXJyYXkoYXJndW1lbnRzWzBdKTtwcF90aXRsZXM9YXJndW1lbnRzWzFdP2UubWFrZUFycmF5KGFyZ3VtZW50c1sxXSk6ZS5tYWtlQXJyYXkoXCJcIik7cHBfZGVzY3JpcHRpb25zPWFyZ3VtZW50c1syXT9lLm1ha2VBcnJheShhcmd1bWVudHNbMl0pOmUubWFrZUFycmF5KFwiXCIpO2lzU2V0PXBwX2ltYWdlcy5sZW5ndGg+MT90cnVlOmZhbHNlO3NldF9wb3NpdGlvbj1hcmd1bWVudHNbM10/YXJndW1lbnRzWzNdOjA7ayh0LnRhcmdldCl9aWYoc2V0dGluZ3MuaGlkZWZsYXNoKWUoXCJvYmplY3QsZW1iZWQsaWZyYW1lW3NyYyo9eW91dHViZV0saWZyYW1lW3NyYyo9dmltZW9dXCIpLmNzcyhcInZpc2liaWxpdHlcIixcImhpZGRlblwiKTtiKGUocHBfaW1hZ2VzKS5zaXplKCkpO2UoXCIucHBfbG9hZGVySWNvblwiKS5zaG93KCk7aWYoc2V0dGluZ3MuZGVlcGxpbmtpbmcpbigpO2lmKHNldHRpbmdzLnNvY2lhbF90b29scyl7ZmFjZWJvb2tfbGlrZV9saW5rPXNldHRpbmdzLnNvY2lhbF90b29scy5yZXBsYWNlKFwie2xvY2F0aW9uX2hyZWZ9XCIsZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLmhyZWYpKTskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX3NvY2lhbFwiKS5odG1sKGZhY2Vib29rX2xpa2VfbGluayl9aWYoJHBwdC5pcyhcIjpoaWRkZW5cIikpJHBwdC5jc3MoXCJvcGFjaXR5XCIsMCkuc2hvdygpOyRwcF9vdmVybGF5LnNob3coKS5mYWRlVG8oc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLHNldHRpbmdzLm9wYWNpdHkpOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIuY3VycmVudFRleHRIb2xkZXJcIikudGV4dChzZXRfcG9zaXRpb24rMStzZXR0aW5ncy5jb3VudGVyX3NlcGFyYXRvcl9sYWJlbCtlKHBwX2ltYWdlcykuc2l6ZSgpKTtpZih0eXBlb2YgcHBfZGVzY3JpcHRpb25zW3NldF9wb3NpdGlvbl0hPVwidW5kZWZpbmVkXCImJnBwX2Rlc2NyaXB0aW9uc1tzZXRfcG9zaXRpb25dIT1cIlwiKXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2Rlc2NyaXB0aW9uXCIpLnNob3coKS5odG1sKHVuZXNjYXBlKHBwX2Rlc2NyaXB0aW9uc1tzZXRfcG9zaXRpb25dKSl9ZWxzZXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2Rlc2NyaXB0aW9uXCIpLmhpZGUoKX1tb3ZpZV93aWR0aD1wYXJzZUZsb2F0KGkoXCJ3aWR0aFwiLHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKSk/aShcIndpZHRoXCIscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pOnNldHRpbmdzLmRlZmF1bHRfd2lkdGgudG9TdHJpbmcoKTttb3ZpZV9oZWlnaHQ9cGFyc2VGbG9hdChpKFwiaGVpZ2h0XCIscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pKT9pKFwiaGVpZ2h0XCIscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pOnNldHRpbmdzLmRlZmF1bHRfaGVpZ2h0LnRvU3RyaW5nKCk7dT1mYWxzZTtpZihtb3ZpZV9oZWlnaHQuaW5kZXhPZihcIiVcIikhPS0xKXttb3ZpZV9oZWlnaHQ9cGFyc2VGbG9hdChlKHdpbmRvdykuaGVpZ2h0KCkqcGFyc2VGbG9hdChtb3ZpZV9oZWlnaHQpLzEwMC0xNTApO3U9dHJ1ZX1pZihtb3ZpZV93aWR0aC5pbmRleE9mKFwiJVwiKSE9LTEpe21vdmllX3dpZHRoPXBhcnNlRmxvYXQoZSh3aW5kb3cpLndpZHRoKCkqcGFyc2VGbG9hdChtb3ZpZV93aWR0aCkvMTAwLTE1MCk7dT10cnVlfSRwcF9waWNfaG9sZGVyLmZhZGVJbihmdW5jdGlvbigpe3NldHRpbmdzLnNob3dfdGl0bGUmJnBwX3RpdGxlc1tzZXRfcG9zaXRpb25dIT1cIlwiJiZ0eXBlb2YgcHBfdGl0bGVzW3NldF9wb3NpdGlvbl0hPVwidW5kZWZpbmVkXCI/JHBwdC5odG1sKHVuZXNjYXBlKHBwX3RpdGxlc1tzZXRfcG9zaXRpb25dKSk6JHBwdC5odG1sKFwiwqBcIik7aW1nUHJlbG9hZGVyPVwiXCI7c2tpcEluamVjdGlvbj1mYWxzZTtzd2l0Y2goUyhwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSkpe2Nhc2VcImltYWdlXCI6aW1nUHJlbG9hZGVyPW5ldyBJbWFnZTtuZXh0SW1hZ2U9bmV3IEltYWdlO2lmKGlzU2V0JiZzZXRfcG9zaXRpb248ZShwcF9pbWFnZXMpLnNpemUoKS0xKW5leHRJbWFnZS5zcmM9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbisxXTtwcmV2SW1hZ2U9bmV3IEltYWdlO2lmKGlzU2V0JiZwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uLTFdKXByZXZJbWFnZS5zcmM9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbi0xXTskcHBfcGljX2hvbGRlci5maW5kKFwiI3BwX2Z1bGxfcmVzXCIpWzBdLmlubmVySFRNTD1zZXR0aW5ncy5pbWFnZV9tYXJrdXAucmVwbGFjZSgve3BhdGh9L2cscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pO2ltZ1ByZWxvYWRlci5vbmxvYWQ9ZnVuY3Rpb24oKXthPXcoaW1nUHJlbG9hZGVyLndpZHRoLGltZ1ByZWxvYWRlci5oZWlnaHQpO2coKX07aW1nUHJlbG9hZGVyLm9uZXJyb3I9ZnVuY3Rpb24oKXthbGVydChcIkltYWdlIGNhbm5vdCBiZSBsb2FkZWQuIE1ha2Ugc3VyZSB0aGUgcGF0aCBpcyBjb3JyZWN0IGFuZCBpbWFnZSBleGlzdC5cIik7ZS5wcmV0dHlQaG90by5jbG9zZSgpfTtpbWdQcmVsb2FkZXIuc3JjPXBwX2ltYWdlc1tzZXRfcG9zaXRpb25dO2JyZWFrO2Nhc2VcInlvdXR1YmVcIjphPXcobW92aWVfd2lkdGgsbW92aWVfaGVpZ2h0KTttb3ZpZV9pZD1pKFwidlwiLHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKTtpZihtb3ZpZV9pZD09XCJcIil7bW92aWVfaWQ9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0uc3BsaXQoXCJ5b3V0dS5iZS9cIik7bW92aWVfaWQ9bW92aWVfaWRbMV07aWYobW92aWVfaWQuaW5kZXhPZihcIj9cIik+MCltb3ZpZV9pZD1tb3ZpZV9pZC5zdWJzdHIoMCxtb3ZpZV9pZC5pbmRleE9mKFwiP1wiKSk7aWYobW92aWVfaWQuaW5kZXhPZihcIiZcIik+MCltb3ZpZV9pZD1tb3ZpZV9pZC5zdWJzdHIoMCxtb3ZpZV9pZC5pbmRleE9mKFwiJlwiKSl9bW92aWU9XCJodHRwOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL1wiK21vdmllX2lkO2koXCJyZWxcIixwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSk/bW92aWUrPVwiP3JlbD1cIitpKFwicmVsXCIscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pOm1vdmllKz1cIj9yZWw9MVwiO2lmKHNldHRpbmdzLmF1dG9wbGF5KW1vdmllKz1cIiZhdXRvcGxheT0xXCI7dG9JbmplY3Q9c2V0dGluZ3MuaWZyYW1lX21hcmt1cC5yZXBsYWNlKC97d2lkdGh9L2csYVtcIndpZHRoXCJdKS5yZXBsYWNlKC97aGVpZ2h0fS9nLGFbXCJoZWlnaHRcIl0pLnJlcGxhY2UoL3t3bW9kZX0vZyxzZXR0aW5ncy53bW9kZSkucmVwbGFjZSgve3BhdGh9L2csbW92aWUpO2JyZWFrO2Nhc2VcInZpbWVvXCI6YT13KG1vdmllX3dpZHRoLG1vdmllX2hlaWdodCk7bW92aWVfaWQ9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbl07dmFyIHQ9L2h0dHAocz8pOlxcL1xcLyh3d3dcXC4pP3ZpbWVvLmNvbVxcLyhcXGQrKS87dmFyIG49bW92aWVfaWQubWF0Y2godCk7bW92aWU9XCJodHRwOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby9cIituWzNdK1wiP3RpdGxlPTAmYnlsaW5lPTAmcG9ydHJhaXQ9MFwiO2lmKHNldHRpbmdzLmF1dG9wbGF5KW1vdmllKz1cIiZhdXRvcGxheT0xO1wiO3ZpbWVvX3dpZHRoPWFbXCJ3aWR0aFwiXStcIi9lbWJlZC8/bW9vZ193aWR0aD1cIithW1wid2lkdGhcIl07dG9JbmplY3Q9c2V0dGluZ3MuaWZyYW1lX21hcmt1cC5yZXBsYWNlKC97d2lkdGh9L2csdmltZW9fd2lkdGgpLnJlcGxhY2UoL3toZWlnaHR9L2csYVtcImhlaWdodFwiXSkucmVwbGFjZSgve3BhdGh9L2csbW92aWUpO2JyZWFrO2Nhc2VcInF1aWNrdGltZVwiOmE9dyhtb3ZpZV93aWR0aCxtb3ZpZV9oZWlnaHQpO2FbXCJoZWlnaHRcIl0rPTE1O2FbXCJjb250ZW50SGVpZ2h0XCJdKz0xNTthW1wiY29udGFpbmVySGVpZ2h0XCJdKz0xNTt0b0luamVjdD1zZXR0aW5ncy5xdWlja3RpbWVfbWFya3VwLnJlcGxhY2UoL3t3aWR0aH0vZyxhW1wid2lkdGhcIl0pLnJlcGxhY2UoL3toZWlnaHR9L2csYVtcImhlaWdodFwiXSkucmVwbGFjZSgve3dtb2RlfS9nLHNldHRpbmdzLndtb2RlKS5yZXBsYWNlKC97cGF0aH0vZyxwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSkucmVwbGFjZSgve2F1dG9wbGF5fS9nLHNldHRpbmdzLmF1dG9wbGF5KTticmVhaztjYXNlXCJmbGFzaFwiOmE9dyhtb3ZpZV93aWR0aCxtb3ZpZV9oZWlnaHQpO2ZsYXNoX3ZhcnM9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbl07Zmxhc2hfdmFycz1mbGFzaF92YXJzLnN1YnN0cmluZyhwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXS5pbmRleE9mKFwiZmxhc2h2YXJzXCIpKzEwLHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dLmxlbmd0aCk7ZmlsZW5hbWU9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbl07ZmlsZW5hbWU9ZmlsZW5hbWUuc3Vic3RyaW5nKDAsZmlsZW5hbWUuaW5kZXhPZihcIj9cIikpO3RvSW5qZWN0PXNldHRpbmdzLmZsYXNoX21hcmt1cC5yZXBsYWNlKC97d2lkdGh9L2csYVtcIndpZHRoXCJdKS5yZXBsYWNlKC97aGVpZ2h0fS9nLGFbXCJoZWlnaHRcIl0pLnJlcGxhY2UoL3t3bW9kZX0vZyxzZXR0aW5ncy53bW9kZSkucmVwbGFjZSgve3BhdGh9L2csZmlsZW5hbWUrXCI/XCIrZmxhc2hfdmFycyk7YnJlYWs7Y2FzZVwiaWZyYW1lXCI6YT13KG1vdmllX3dpZHRoLG1vdmllX2hlaWdodCk7ZnJhbWVfdXJsPXBwX2ltYWdlc1tzZXRfcG9zaXRpb25dO2ZyYW1lX3VybD1mcmFtZV91cmwuc3Vic3RyKDAsZnJhbWVfdXJsLmluZGV4T2YoXCJpZnJhbWVcIiktMSk7dG9JbmplY3Q9c2V0dGluZ3MuaWZyYW1lX21hcmt1cC5yZXBsYWNlKC97d2lkdGh9L2csYVtcIndpZHRoXCJdKS5yZXBsYWNlKC97aGVpZ2h0fS9nLGFbXCJoZWlnaHRcIl0pLnJlcGxhY2UoL3twYXRofS9nLGZyYW1lX3VybCk7YnJlYWs7Y2FzZVwiYWpheFwiOmRvcmVzaXplPWZhbHNlO2E9dyhtb3ZpZV93aWR0aCxtb3ZpZV9oZWlnaHQpO2RvcmVzaXplPXRydWU7c2tpcEluamVjdGlvbj10cnVlO2UuZ2V0KHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dLGZ1bmN0aW9uKGUpe3RvSW5qZWN0PXNldHRpbmdzLmlubGluZV9tYXJrdXAucmVwbGFjZSgve2NvbnRlbnR9L2csZSk7JHBwX3BpY19ob2xkZXIuZmluZChcIiNwcF9mdWxsX3Jlc1wiKVswXS5pbm5lckhUTUw9dG9JbmplY3Q7ZygpfSk7YnJlYWs7Y2FzZVwiY3VzdG9tXCI6YT13KG1vdmllX3dpZHRoLG1vdmllX2hlaWdodCk7dG9JbmplY3Q9c2V0dGluZ3MuY3VzdG9tX21hcmt1cDticmVhaztjYXNlXCJpbmxpbmVcIjpteUNsb25lPWUocHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pLmNsb25lKCkuYXBwZW5kKCc8YnIgY2xlYXI9XCJhbGxcIiAvPicpLmNzcyh7d2lkdGg6c2V0dGluZ3MuZGVmYXVsdF93aWR0aH0pLndyYXBJbm5lcignPGRpdiBpZD1cInBwX2Z1bGxfcmVzXCI+PGRpdiBjbGFzcz1cInBwX2lubGluZVwiPjwvZGl2PjwvZGl2PicpLmFwcGVuZFRvKGUoXCJib2R5XCIpKS5zaG93KCk7ZG9yZXNpemU9ZmFsc2U7YT13KGUobXlDbG9uZSkud2lkdGgoKSxlKG15Q2xvbmUpLmhlaWdodCgpKTtkb3Jlc2l6ZT10cnVlO2UobXlDbG9uZSkucmVtb3ZlKCk7dG9JbmplY3Q9c2V0dGluZ3MuaW5saW5lX21hcmt1cC5yZXBsYWNlKC97Y29udGVudH0vZyxlKHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKS5odG1sKCkpO2JyZWFrfWlmKCFpbWdQcmVsb2FkZXImJiFza2lwSW5qZWN0aW9uKXskcHBfcGljX2hvbGRlci5maW5kKFwiI3BwX2Z1bGxfcmVzXCIpWzBdLmlubmVySFRNTD10b0luamVjdDtnKCl9fSk7cmV0dXJuIGZhbHNlfTtlLnByZXR0eVBob3RvLmNoYW5nZVBhZ2U9ZnVuY3Rpb24odCl7Y3VycmVudEdhbGxlcnlQYWdlPTA7aWYodD09XCJwcmV2aW91c1wiKXtzZXRfcG9zaXRpb24tLTtpZihzZXRfcG9zaXRpb248MClzZXRfcG9zaXRpb249ZShwcF9pbWFnZXMpLnNpemUoKS0xfWVsc2UgaWYodD09XCJuZXh0XCIpe3NldF9wb3NpdGlvbisrO2lmKHNldF9wb3NpdGlvbj5lKHBwX2ltYWdlcykuc2l6ZSgpLTEpc2V0X3Bvc2l0aW9uPTB9ZWxzZXtzZXRfcG9zaXRpb249dH1yZWxfaW5kZXg9c2V0X3Bvc2l0aW9uO2lmKCFkb3Jlc2l6ZSlkb3Jlc2l6ZT10cnVlO2lmKHNldHRpbmdzLmFsbG93X2V4cGFuZCl7ZShcIi5wcF9jb250cmFjdFwiKS5yZW1vdmVDbGFzcyhcInBwX2NvbnRyYWN0XCIpLmFkZENsYXNzKFwicHBfZXhwYW5kXCIpfXkoZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLm9wZW4oKX0pfTtlLnByZXR0eVBob3RvLmNoYW5nZUdhbGxlcnlQYWdlPWZ1bmN0aW9uKGUpe2lmKGU9PVwibmV4dFwiKXtjdXJyZW50R2FsbGVyeVBhZ2UrKztpZihjdXJyZW50R2FsbGVyeVBhZ2U+dG90YWxQYWdlKWN1cnJlbnRHYWxsZXJ5UGFnZT0wfWVsc2UgaWYoZT09XCJwcmV2aW91c1wiKXtjdXJyZW50R2FsbGVyeVBhZ2UtLTtpZihjdXJyZW50R2FsbGVyeVBhZ2U8MCljdXJyZW50R2FsbGVyeVBhZ2U9dG90YWxQYWdlfWVsc2V7Y3VycmVudEdhbGxlcnlQYWdlPWV9c2xpZGVfc3BlZWQ9ZT09XCJuZXh0XCJ8fGU9PVwicHJldmlvdXNcIj9zZXR0aW5ncy5hbmltYXRpb25fc3BlZWQ6MDtzbGlkZV90bz1jdXJyZW50R2FsbGVyeVBhZ2UqaXRlbXNQZXJQYWdlKml0ZW1XaWR0aDskcHBfZ2FsbGVyeS5maW5kKFwidWxcIikuYW5pbWF0ZSh7bGVmdDotc2xpZGVfdG99LHNsaWRlX3NwZWVkKX07ZS5wcmV0dHlQaG90by5zdGFydFNsaWRlc2hvdz1mdW5jdGlvbigpe2lmKHR5cGVvZiBtPT1cInVuZGVmaW5lZFwiKXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX3BsYXlcIikudW5iaW5kKFwiY2xpY2tcIikucmVtb3ZlQ2xhc3MoXCJwcF9wbGF5XCIpLmFkZENsYXNzKFwicHBfcGF1c2VcIikuY2xpY2soZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLnN0b3BTbGlkZXNob3coKTtyZXR1cm4gZmFsc2V9KTttPXNldEludGVydmFsKGUucHJldHR5UGhvdG8uc3RhcnRTbGlkZXNob3csc2V0dGluZ3Muc2xpZGVzaG93KX1lbHNle2UucHJldHR5UGhvdG8uY2hhbmdlUGFnZShcIm5leHRcIil9fTtlLnByZXR0eVBob3RvLnN0b3BTbGlkZXNob3c9ZnVuY3Rpb24oKXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX3BhdXNlXCIpLnVuYmluZChcImNsaWNrXCIpLnJlbW92ZUNsYXNzKFwicHBfcGF1c2VcIikuYWRkQ2xhc3MoXCJwcF9wbGF5XCIpLmNsaWNrKGZ1bmN0aW9uKCl7ZS5wcmV0dHlQaG90by5zdGFydFNsaWRlc2hvdygpO3JldHVybiBmYWxzZX0pO2NsZWFySW50ZXJ2YWwobSk7bT11bmRlZmluZWR9O2UucHJldHR5UGhvdG8uY2xvc2U9ZnVuY3Rpb24oKXtpZigkcHBfb3ZlcmxheS5pcyhcIjphbmltYXRlZFwiKSlyZXR1cm47ZS5wcmV0dHlQaG90by5zdG9wU2xpZGVzaG93KCk7JHBwX3BpY19ob2xkZXIuc3RvcCgpLmZpbmQoXCJvYmplY3QsZW1iZWRcIikuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpO2UoXCJkaXYucHBfcGljX2hvbGRlcixkaXYucHB0LC5wcF9mYWRlXCIpLmZhZGVPdXQoc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLGZ1bmN0aW9uKCl7ZSh0aGlzKS5yZW1vdmUoKX0pOyRwcF9vdmVybGF5LmZhZGVPdXQoc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLGZ1bmN0aW9uKCl7aWYoc2V0dGluZ3MuaGlkZWZsYXNoKWUoXCJvYmplY3QsZW1iZWQsaWZyYW1lW3NyYyo9eW91dHViZV0saWZyYW1lW3NyYyo9dmltZW9dXCIpLmNzcyhcInZpc2liaWxpdHlcIixcInZpc2libGVcIik7ZSh0aGlzKS5yZW1vdmUoKTtlKHdpbmRvdykudW5iaW5kKFwic2Nyb2xsLnByZXR0eXBob3RvXCIpO3IoKTtzZXR0aW5ncy5jYWxsYmFjaygpO2RvcmVzaXplPXRydWU7Zj1mYWxzZTtkZWxldGUgc2V0dGluZ3N9KX07aWYoIXBwX2FscmVhZHlJbml0aWFsaXplZCYmdCgpKXtwcF9hbHJlYWR5SW5pdGlhbGl6ZWQ9dHJ1ZTtoYXNoSW5kZXg9dCgpO2hhc2hSZWw9aGFzaEluZGV4O2hhc2hJbmRleD1oYXNoSW5kZXguc3Vic3RyaW5nKGhhc2hJbmRleC5pbmRleE9mKFwiL1wiKSsxLGhhc2hJbmRleC5sZW5ndGgtMSk7aGFzaFJlbD1oYXNoUmVsLnN1YnN0cmluZygwLGhhc2hSZWwuaW5kZXhPZihcIi9cIikpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtlKFwiYVtcIitzLmhvb2srXCJePSdcIitoYXNoUmVsK1wiJ106ZXEoXCIraGFzaEluZGV4K1wiKVwiKS50cmlnZ2VyKFwiY2xpY2tcIil9LDUwKX1yZXR1cm4gdGhpcy51bmJpbmQoXCJjbGljay5wcmV0dHlwaG90b1wiKS5iaW5kKFwiY2xpY2sucHJldHR5cGhvdG9cIixlLnByZXR0eVBob3RvLmluaXRpYWxpemUpfTt9KShqUXVlcnkpO3ZhciBwcF9hbHJlYWR5SW5pdGlhbGl6ZWQ9ZmFsc2UiLCJcbmZ1bmN0aW9uIG1haW4oKSB7XG5cbihmdW5jdGlvbiAoKSB7XG4gICAndXNlIHN0cmljdCc7XG4gICBcbiAgIC8vIFRlc3RpbW9uaWFsIHNsaWRlclxuICBcdCQoJ2EucGFnZS1zY3JvbGwnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSA9PSB0aGlzLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSAmJiBsb2NhdGlvbi5ob3N0bmFtZSA9PSB0aGlzLmhvc3RuYW1lKSB7XG4gICAgICAgICAgdmFyIHRhcmdldCA9ICQodGhpcy5oYXNoKTtcbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQubGVuZ3RoID8gdGFyZ2V0IDogJCgnW25hbWU9JyArIHRoaXMuaGFzaC5zbGljZSgxKSArJ10nKTtcbiAgICAgICAgICBpZiAodGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIHNjcm9sbFRvcDogdGFyZ2V0Lm9mZnNldCgpLnRvcCAtIDQwXG4gICAgICAgICAgICB9LCA5MDApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgXHQgICAgJChcIiN0ZXN0aW1vbmlhbFwiKS5vd2xDYXJvdXNlbCh7XG4gICAgICAgIG5hdmlnYXRpb24gOiBmYWxzZSwgLy8gU2hvdyBuZXh0IGFuZCBwcmV2IGJ1dHRvbnNcbiAgICAgICAgc2xpZGVTcGVlZCA6IDMwMCxcbiAgICAgICAgcGFnaW5hdGlvblNwZWVkIDogNDAwLFxuICAgICAgICBzaW5nbGVJdGVtOnRydWVcbiAgICAgICAgfSk7XG5cbiAgXHR9KTtcblx0XG5cbiAgXHQvLyBQb3J0Zm9saW8gaXNvdG9wZSBmaWx0ZXJcbiAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRjb250YWluZXIgPSAkKCcucHJvamVjdC1pdGVtcycpO1xuICAgICAgICAkY29udGFpbmVyLmlzb3RvcGUoe1xuICAgICAgICAgICAgZmlsdGVyOiAnKicsXG4gICAgICAgICAgICBhbmltYXRpb25PcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIHF1ZXVlOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJCgnLmNhdCBhJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCcuY2F0IC5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHZhciBzZWxlY3RvciA9ICQodGhpcykuYXR0cignZGF0YS1maWx0ZXInKTtcbiAgICAgICAgICAgICRjb250YWluZXIuaXNvdG9wZSh7XG4gICAgICAgICAgICAgICAgZmlsdGVyOiBzZWxlY3RvcixcbiAgICAgICAgICAgICAgICBhbmltYXRpb25PcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2xpbmVhcicsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cdFxuXG4gIFx0Ly8gUHJldHR5IFBob3RvXG5cdFxuICAkKFwiYVtyZWxePSdwcmV0dHlQaG90byddXCIpLnByZXR0eVBob3RvKHtcblx0XHRzb2NpYWxfdG9vbHM6IGZhbHNlXG5cdH0pO1x0XG5cbn0oKSk7XG5cblxufVxubWFpbigpO1xuIiwiLypcbiAqICBqUXVlcnkgT3dsQ2Fyb3VzZWwgdjEuMy4yXG4gKlxuICogIENvcHlyaWdodCAoYykgMjAxMyBCYXJ0b3N6IFdvamNpZWNob3dza2lcbiAqICBodHRwOi8vd3d3Lm93bGdyYXBoaWMuY29tL293bGNhcm91c2VsL1xuICpcbiAqICBMaWNlbnNlZCB1bmRlciBNSVRcbiAqXG4gKi9cblxuLypKUyBMaW50IGhlbHBlcnM6ICovXG4vKmdsb2JhbCBkcmFnTW92ZTogZmFsc2UsIGRyYWdFbmQ6IGZhbHNlLCAkLCBqUXVlcnksIGFsZXJ0LCB3aW5kb3csIGRvY3VtZW50ICovXG4vKmpzbGludCBub21lbjogdHJ1ZSwgY29udGludWU6dHJ1ZSAqL1xuXG5pZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgIE9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGZ1bmN0aW9uIEYoKSB7fVxuICAgICAgICBGLnByb3RvdHlwZSA9IG9iajtcbiAgICAgICAgcmV0dXJuIG5ldyBGKCk7XG4gICAgfTtcbn1cbihmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCkge1xuXG4gICAgdmFyIENhcm91c2VsID0ge1xuICAgICAgICBpbml0IDogZnVuY3Rpb24gKG9wdGlvbnMsIGVsKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UuJGVsZW0gPSAkKGVsKTtcbiAgICAgICAgICAgIGJhc2Uub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmZuLm93bENhcm91c2VsLm9wdGlvbnMsIGJhc2UuJGVsZW0uZGF0YSgpLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgYmFzZS51c2VyT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICBiYXNlLmxvYWRDb250ZW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZENvbnRlbnQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsIHVybDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RGF0YShkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGksIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmpzb25TdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmpzb25TdWNjZXNzLmFwcGx5KHRoaXMsIFtkYXRhXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpIGluIGRhdGEub3dsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5vd2wuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50ICs9IGRhdGEub3dsW2ldLml0ZW07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5odG1sKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiYXNlLmxvZ0luKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmJlZm9yZUluaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5iZWZvcmVJbml0LmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmpzb25QYXRoID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gYmFzZS5vcHRpb25zLmpzb25QYXRoO1xuICAgICAgICAgICAgICAgICQuZ2V0SlNPTih1cmwsIGdldERhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLmxvZ0luKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9nSW4gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UuJGVsZW0uZGF0YShcIm93bC1vcmlnaW5hbFN0eWxlc1wiLCBiYXNlLiRlbGVtLmF0dHIoXCJzdHlsZVwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAuZGF0YShcIm93bC1vcmlnaW5hbENsYXNzZXNcIiwgYmFzZS4kZWxlbS5hdHRyKFwiY2xhc3NcIikpO1xuXG4gICAgICAgICAgICBiYXNlLiRlbGVtLmNzcyh7b3BhY2l0eTogMH0pO1xuICAgICAgICAgICAgYmFzZS5vcmlnbmFsSXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXM7XG4gICAgICAgICAgICBiYXNlLmNoZWNrQnJvd3NlcigpO1xuICAgICAgICAgICAgYmFzZS53cmFwcGVyV2lkdGggPSAwO1xuICAgICAgICAgICAgYmFzZS5jaGVja1Zpc2libGUgPSBudWxsO1xuICAgICAgICAgICAgYmFzZS5zZXRWYXJzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VmFycyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmNoaWxkcmVuKCkubGVuZ3RoID09PSAwKSB7cmV0dXJuIGZhbHNlOyB9XG4gICAgICAgICAgICBiYXNlLmJhc2VDbGFzcygpO1xuICAgICAgICAgICAgYmFzZS5ldmVudFR5cGVzKCk7XG4gICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMgPSBiYXNlLiRlbGVtLmNoaWxkcmVuKCk7XG4gICAgICAgICAgICBiYXNlLml0ZW1zQW1vdW50ID0gYmFzZS4kdXNlckl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIGJhc2Uud3JhcEl0ZW1zKCk7XG4gICAgICAgICAgICBiYXNlLiRvd2xJdGVtcyA9IGJhc2UuJGVsZW0uZmluZChcIi5vd2wtaXRlbVwiKTtcbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIgPSBiYXNlLiRlbGVtLmZpbmQoXCIub3dsLXdyYXBwZXJcIik7XG4gICAgICAgICAgICBiYXNlLnBsYXlEaXJlY3Rpb24gPSBcIm5leHRcIjtcbiAgICAgICAgICAgIGJhc2UucHJldkl0ZW0gPSAwO1xuICAgICAgICAgICAgYmFzZS5wcmV2QXJyID0gWzBdO1xuICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IDA7XG4gICAgICAgICAgICBiYXNlLmN1c3RvbUV2ZW50cygpO1xuICAgICAgICAgICAgYmFzZS5vblN0YXJ0dXAoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblN0YXJ0dXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZUl0ZW1zKCk7XG4gICAgICAgICAgICBiYXNlLmNhbGN1bGF0ZUFsbCgpO1xuICAgICAgICAgICAgYmFzZS5idWlsZENvbnRyb2xzKCk7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZUNvbnRyb2xzKCk7XG4gICAgICAgICAgICBiYXNlLnJlc3BvbnNlKCk7XG4gICAgICAgICAgICBiYXNlLm1vdmVFdmVudHMoKTtcbiAgICAgICAgICAgIGJhc2Uuc3RvcE9uSG92ZXIoKTtcbiAgICAgICAgICAgIGJhc2Uub3dsU3RhdHVzKCk7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMudHJhbnNpdGlvblN0eWxlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UudHJhbnNpdGlvblR5cGVzKGJhc2Uub3B0aW9ucy50cmFuc2l0aW9uU3R5bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvUGxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hdXRvUGxheSA9IDUwMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLnBsYXkoKTtcblxuICAgICAgICAgICAgYmFzZS4kZWxlbS5maW5kKFwiLm93bC13cmFwcGVyXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcblxuICAgICAgICAgICAgaWYgKCFiYXNlLiRlbGVtLmlzKFwiOnZpc2libGVcIikpIHtcbiAgICAgICAgICAgICAgICBiYXNlLndhdGNoVmlzaWJpbGl0eSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmNzcyhcIm9wYWNpdHlcIiwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLm9uc3RhcnR1cCA9IGZhbHNlO1xuICAgICAgICAgICAgYmFzZS5lYWNoTW92ZVVwZGF0ZSgpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYWZ0ZXJJbml0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYWZ0ZXJJbml0LmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZWFjaE1vdmVVcGRhdGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubGF6eUxvYWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmxhenlMb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9IZWlnaHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmF1dG9IZWlnaHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uub25WaXNpYmxlSXRlbXMoKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYWZ0ZXJBY3Rpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlckFjdGlvbi5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVZhcnMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5iZWZvcmVVcGRhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5iZWZvcmVVcGRhdGUuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uud2F0Y2hWaXNpYmlsaXR5KCk7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZUl0ZW1zKCk7XG4gICAgICAgICAgICBiYXNlLmNhbGN1bGF0ZUFsbCgpO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVDb250cm9scygpO1xuICAgICAgICAgICAgYmFzZS5lYWNoTW92ZVVwZGF0ZSgpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYWZ0ZXJVcGRhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlclVwZGF0ZS5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbG9hZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnVwZGF0ZVZhcnMoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdhdGNoVmlzaWJpbGl0eSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKGJhc2UuJGVsZW0uaXMoXCI6dmlzaWJsZVwiKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmNzcyh7b3BhY2l0eTogMH0pO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuYXV0b1BsYXlJbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5jaGVja1Zpc2libGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmNoZWNrVmlzaWJsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuJGVsZW0uaXMoXCI6dmlzaWJsZVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmFuaW1hdGUoe29wYWNpdHk6IDF9LCAyMDApO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmNoZWNrVmlzaWJsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3cmFwSXRlbXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMud3JhcEFsbChcIjxkaXYgY2xhc3M9XFxcIm93bC13cmFwcGVyXFxcIj5cIikud3JhcChcIjxkaXYgY2xhc3M9XFxcIm93bC1pdGVtXFxcIj48L2Rpdj5cIik7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLmZpbmQoXCIub3dsLXdyYXBwZXJcIikud3JhcChcIjxkaXYgY2xhc3M9XFxcIm93bC13cmFwcGVyLW91dGVyXFxcIj5cIik7XG4gICAgICAgICAgICBiYXNlLndyYXBwZXJPdXRlciA9IGJhc2UuJGVsZW0uZmluZChcIi5vd2wtd3JhcHBlci1vdXRlclwiKTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0uY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJhc2VDbGFzcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBoYXNCYXNlQ2xhc3MgPSBiYXNlLiRlbGVtLmhhc0NsYXNzKGJhc2Uub3B0aW9ucy5iYXNlQ2xhc3MpLFxuICAgICAgICAgICAgICAgIGhhc1RoZW1lQ2xhc3MgPSBiYXNlLiRlbGVtLmhhc0NsYXNzKGJhc2Uub3B0aW9ucy50aGVtZSk7XG5cbiAgICAgICAgICAgIGlmICghaGFzQmFzZUNsYXNzKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYmFzZUNsYXNzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFoYXNUaGVtZUNsYXNzKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5hZGRDbGFzcyhiYXNlLm9wdGlvbnMudGhlbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUl0ZW1zIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLCB3aWR0aCwgaTtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5yZXNwb25zaXZlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuc2luZ2xlSXRlbSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3JpZ25hbEl0ZW1zID0gMTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b20gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFNtYWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0U21hbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNNb2JpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpZHRoID0gJChiYXNlLm9wdGlvbnMucmVzcG9uc2l2ZUJhc2VXaWR0aCkud2lkdGgoKTtcblxuICAgICAgICAgICAgaWYgKHdpZHRoID4gKGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3BbMF0gfHwgYmFzZS5vcmlnbmFsSXRlbXMpKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcmlnbmFsSXRlbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIC8vUmVvcmRlciBhcnJheSBieSBzY3JlZW4gc2l6ZVxuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7cmV0dXJuIGFbMF0gLSBiWzBdOyB9KTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b20ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbVtpXVswXSA8PSB3aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tW2ldWzFdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDw9IGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3BbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFsxXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPD0gYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFNtYWxsWzBdICYmIGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3BTbWFsbCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFNtYWxsWzFdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXRbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXRbMV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDw9IGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFNtYWxsWzBdICYmIGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFNtYWxsICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXRTbWFsbFsxXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPD0gYmFzZS5vcHRpb25zLml0ZW1zTW9iaWxlWzBdICYmIGJhc2Uub3B0aW9ucy5pdGVtc01vYmlsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcHRpb25zLml0ZW1zTW9iaWxlWzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9pZiBudW1iZXIgb2YgaXRlbXMgaXMgbGVzcyB0aGFuIGRlY2xhcmVkXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zID4gYmFzZS5pdGVtc0Ftb3VudCAmJiBiYXNlLm9wdGlvbnMuaXRlbXNTY2FsZVVwID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5pdGVtc0Ftb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZXNwb25zZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzbWFsbERlbGF5LFxuICAgICAgICAgICAgICAgIGxhc3RXaW5kb3dXaWR0aDtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5yZXNwb25zaXZlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFdpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICAgICAgICAgIGJhc2UucmVzaXplciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgIT09IGxhc3RXaW5kb3dXaWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHNtYWxsRGVsYXkpO1xuICAgICAgICAgICAgICAgICAgICBzbWFsbERlbGF5ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFdpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLnVwZGF0ZVZhcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLnJlc3BvbnNpdmVSZWZyZXNoUmF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICQod2luZG93KS5yZXNpemUoYmFzZS5yZXNpemVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVQb3NpdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuanVtcFRvKGJhc2UuY3VycmVudEl0ZW0pO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvUGxheSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmNoZWNrQXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmRJdGVtc1NpemVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHJvdW5kUGFnZXMgPSAwLFxuICAgICAgICAgICAgICAgIGxhc3RJdGVtID0gYmFzZS5pdGVtc0Ftb3VudCAtIGJhc2Uub3B0aW9ucy5pdGVtcztcblxuICAgICAgICAgICAgYmFzZS4kb3dsSXRlbXMuZWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICR0aGlzXG4gICAgICAgICAgICAgICAgICAgIC5jc3Moe1wid2lkdGhcIjogYmFzZS5pdGVtV2lkdGh9KVxuICAgICAgICAgICAgICAgICAgICAuZGF0YShcIm93bC1pdGVtXCIsIE51bWJlcihpbmRleCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICUgYmFzZS5vcHRpb25zLml0ZW1zID09PSAwIHx8IGluZGV4ID09PSBsYXN0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShpbmRleCA+IGxhc3RJdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91bmRQYWdlcyArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJvd2wtcm91bmRQYWdlc1wiLCByb3VuZFBhZ2VzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZFdyYXBwZXJTaXplcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICB3aWR0aCA9IGJhc2UuJG93bEl0ZW1zLmxlbmd0aCAqIGJhc2UuaXRlbVdpZHRoO1xuXG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyh7XG4gICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiB3aWR0aCAqIDIsXG4gICAgICAgICAgICAgICAgXCJsZWZ0XCI6IDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS5hcHBlbmRJdGVtc1NpemVzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsY3VsYXRlQWxsIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5jYWxjdWxhdGVXaWR0aCgpO1xuICAgICAgICAgICAgYmFzZS5hcHBlbmRXcmFwcGVyU2l6ZXMoKTtcbiAgICAgICAgICAgIGJhc2UubG9vcHMoKTtcbiAgICAgICAgICAgIGJhc2UubWF4KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsY3VsYXRlV2lkdGggOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLml0ZW1XaWR0aCA9IE1hdGgucm91bmQoYmFzZS4kZWxlbS53aWR0aCgpIC8gYmFzZS5vcHRpb25zLml0ZW1zKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtYXggOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbWF4aW11bSA9ICgoYmFzZS5pdGVtc0Ftb3VudCAqIGJhc2UuaXRlbVdpZHRoKSAtIGJhc2Uub3B0aW9ucy5pdGVtcyAqIGJhc2UuaXRlbVdpZHRoKSAqIC0xO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5pdGVtcyA+IGJhc2UuaXRlbXNBbW91bnQpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm1heGltdW1JdGVtID0gMDtcbiAgICAgICAgICAgICAgICBtYXhpbXVtID0gMDtcbiAgICAgICAgICAgICAgICBiYXNlLm1heGltdW1QaXhlbHMgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLm1heGltdW1JdGVtID0gYmFzZS5pdGVtc0Ftb3VudCAtIGJhc2Uub3B0aW9ucy5pdGVtcztcbiAgICAgICAgICAgICAgICBiYXNlLm1heGltdW1QaXhlbHMgPSBtYXhpbXVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1heGltdW07XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWluIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9vcHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcHJldiA9IDAsXG4gICAgICAgICAgICAgICAgZWxXaWR0aCA9IDAsXG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICAgIHJvdW5kUGFnZU51bTtcblxuICAgICAgICAgICAgYmFzZS5wb3NpdGlvbnNJbkFycmF5ID0gWzBdO1xuICAgICAgICAgICAgYmFzZS5wYWdlc0luQXJyYXkgPSBbXTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJhc2UuaXRlbXNBbW91bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGVsV2lkdGggKz0gYmFzZS5pdGVtV2lkdGg7XG4gICAgICAgICAgICAgICAgYmFzZS5wb3NpdGlvbnNJbkFycmF5LnB1c2goLWVsV2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPSAkKGJhc2UuJG93bEl0ZW1zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgcm91bmRQYWdlTnVtID0gaXRlbS5kYXRhKFwib3dsLXJvdW5kUGFnZXNcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3VuZFBhZ2VOdW0gIT09IHByZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UucGFnZXNJbkFycmF5W3ByZXZdID0gYmFzZS5wb3NpdGlvbnNJbkFycmF5W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IHJvdW5kUGFnZU51bTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZENvbnRyb2xzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5uYXZpZ2F0aW9uID09PSB0cnVlIHx8IGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scyA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJvd2wtY29udHJvbHNcXFwiLz5cIikudG9nZ2xlQ2xhc3MoXCJjbGlja2FibGVcIiwgIWJhc2UuYnJvd3Nlci5pc1RvdWNoKS5hcHBlbmRUbyhiYXNlLiRlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucGFnaW5hdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuYnVpbGRQYWdpbmF0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLm5hdmlnYXRpb24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmJ1aWxkQnV0dG9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkQnV0dG9ucyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBidXR0b25zV3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJvd2wtYnV0dG9uc1xcXCIvPlwiKTtcbiAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMuYXBwZW5kKGJ1dHRvbnNXcmFwcGVyKTtcblxuICAgICAgICAgICAgYmFzZS5idXR0b25QcmV2ID0gJChcIjxkaXYvPlwiLCB7XG4gICAgICAgICAgICAgICAgXCJjbGFzc1wiIDogXCJvd2wtcHJldlwiLFxuICAgICAgICAgICAgICAgIFwiaHRtbFwiIDogYmFzZS5vcHRpb25zLm5hdmlnYXRpb25UZXh0WzBdIHx8IFwiXCJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBiYXNlLmJ1dHRvbk5leHQgPSAkKFwiPGRpdi8+XCIsIHtcbiAgICAgICAgICAgICAgICBcImNsYXNzXCIgOiBcIm93bC1uZXh0XCIsXG4gICAgICAgICAgICAgICAgXCJodG1sXCIgOiBiYXNlLm9wdGlvbnMubmF2aWdhdGlvblRleHRbMV0gfHwgXCJcIlxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJ1dHRvbnNXcmFwcGVyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChiYXNlLmJ1dHRvblByZXYpXG4gICAgICAgICAgICAgICAgLmFwcGVuZChiYXNlLmJ1dHRvbk5leHQpO1xuXG4gICAgICAgICAgICBidXR0b25zV3JhcHBlci5vbihcInRvdWNoc3RhcnQub3dsQ29udHJvbHMgbW91c2Vkb3duLm93bENvbnRyb2xzXCIsIFwiZGl2W2NsYXNzXj1cXFwib3dsXFxcIl1cIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBidXR0b25zV3JhcHBlci5vbihcInRvdWNoZW5kLm93bENvbnRyb2xzIG1vdXNldXAub3dsQ29udHJvbHNcIiwgXCJkaXZbY2xhc3NePVxcXCJvd2xcXFwiXVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKFwib3dsLW5leHRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5wcmV2KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRQYWdpbmF0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBiYXNlLnBhZ2luYXRpb25XcmFwcGVyID0gJChcIjxkaXYgY2xhc3M9XFxcIm93bC1wYWdpbmF0aW9uXFxcIi8+XCIpO1xuICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5hcHBlbmQoYmFzZS5wYWdpbmF0aW9uV3JhcHBlcik7XG5cbiAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIub24oXCJ0b3VjaGVuZC5vd2xDb250cm9scyBtb3VzZXVwLm93bENvbnRyb2xzXCIsIFwiLm93bC1wYWdlXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKE51bWJlcigkKHRoaXMpLmRhdGEoXCJvd2wtcGFnZVwiKSkgIT09IGJhc2UuY3VycmVudEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5nb1RvKE51bWJlcigkKHRoaXMpLmRhdGEoXCJvd2wtcGFnZVwiKSksIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVBhZ2luYXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY291bnRlcixcbiAgICAgICAgICAgICAgICBsYXN0UGFnZSxcbiAgICAgICAgICAgICAgICBsYXN0SXRlbSxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b24sXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbklubmVyO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnBhZ2luYXRpb24gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYXNlLnBhZ2luYXRpb25XcmFwcGVyLmh0bWwoXCJcIik7XG5cbiAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgbGFzdFBhZ2UgPSBiYXNlLml0ZW1zQW1vdW50IC0gYmFzZS5pdGVtc0Ftb3VudCAlIGJhc2Uub3B0aW9ucy5pdGVtcztcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJhc2UuaXRlbXNBbW91bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChpICUgYmFzZS5vcHRpb25zLml0ZW1zID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RQYWdlID09PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0SXRlbSA9IGJhc2UuaXRlbXNBbW91bnQgLSBiYXNlLm9wdGlvbnMuaXRlbXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbiA9ICQoXCI8ZGl2Lz5cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc1wiIDogXCJvd2wtcGFnZVwiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uSW5uZXIgPSAkKFwiPHNwYW4+PC9zcGFuPlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInRleHRcIjogYmFzZS5vcHRpb25zLnBhZ2luYXRpb25OdW1iZXJzID09PSB0cnVlID8gY291bnRlciA6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzXCI6IGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uTnVtYmVycyA9PT0gdHJ1ZSA/IFwib3dsLW51bWJlcnNcIiA6IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b24uYXBwZW5kKHBhZ2luYXRpb25CdXR0b25Jbm5lcik7XG5cbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbi5kYXRhKFwib3dsLXBhZ2VcIiwgbGFzdFBhZ2UgPT09IGkgPyBsYXN0SXRlbSA6IGkpO1xuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uLmRhdGEoXCJvd2wtcm91bmRQYWdlc1wiLCBjb3VudGVyKTtcblxuICAgICAgICAgICAgICAgICAgICBiYXNlLnBhZ2luYXRpb25XcmFwcGVyLmFwcGVuZChwYWdpbmF0aW9uQnV0dG9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmNoZWNrUGFnaW5hdGlvbigpO1xuICAgICAgICB9LFxuICAgICAgICBjaGVja1BhZ2luYXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnBhZ2luYXRpb24gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlci5maW5kKFwiLm93bC1wYWdlXCIpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpLmRhdGEoXCJvd2wtcm91bmRQYWdlc1wiKSA9PT0gJChiYXNlLiRvd2xJdGVtc1tiYXNlLmN1cnJlbnRJdGVtXSkuZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKFwiLm93bC1wYWdlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hlY2tOYXZpZ2F0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLm5hdmlnYXRpb24gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5yZXdpbmROYXYgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuY3VycmVudEl0ZW0gPT09IDAgJiYgYmFzZS5tYXhpbXVtSXRlbSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25OZXh0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLmN1cnJlbnRJdGVtID09PSAwICYmIGJhc2UubWF4aW11bUl0ZW0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25QcmV2LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uTmV4dC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5jdXJyZW50SXRlbSA9PT0gYmFzZS5tYXhpbXVtSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25OZXh0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLmN1cnJlbnRJdGVtICE9PSAwICYmIGJhc2UuY3VycmVudEl0ZW0gIT09IGJhc2UubWF4aW11bUl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25QcmV2LnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uTmV4dC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVDb250cm9scyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UudXBkYXRlUGFnaW5hdGlvbigpO1xuICAgICAgICAgICAgYmFzZS5jaGVja05hdmlnYXRpb24oKTtcbiAgICAgICAgICAgIGlmIChiYXNlLm93bENvbnRyb2xzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5pdGVtcyA+PSBiYXNlLml0ZW1zQW1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95Q29udHJvbHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS5vd2xDb250cm9scykge1xuICAgICAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dCA6IGZ1bmN0aW9uIChzcGVlZCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5pc1RyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gKz0gYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUgPyBiYXNlLm9wdGlvbnMuaXRlbXMgOiAxO1xuICAgICAgICAgICAgaWYgKGJhc2UuY3VycmVudEl0ZW0gPiBiYXNlLm1heGltdW1JdGVtICsgKGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlID8gKGJhc2Uub3B0aW9ucy5pdGVtcyAtIDEpIDogMCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJld2luZE5hdiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gMDtcbiAgICAgICAgICAgICAgICAgICAgc3BlZWQgPSBcInJld2luZFwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5nb1RvKGJhc2UuY3VycmVudEl0ZW0sIHNwZWVkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwcmV2IDogZnVuY3Rpb24gKHNwZWVkKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLmlzVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlICYmIGJhc2UuY3VycmVudEl0ZW0gPiAwICYmIGJhc2UuY3VycmVudEl0ZW0gPCBiYXNlLm9wdGlvbnMuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSAtPSBiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSA/IGJhc2Uub3B0aW9ucy5pdGVtcyA6IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5jdXJyZW50SXRlbSA8IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJld2luZE5hdiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gYmFzZS5tYXhpbXVtSXRlbTtcbiAgICAgICAgICAgICAgICAgICAgc3BlZWQgPSBcInJld2luZFwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5nb1RvKGJhc2UuY3VycmVudEl0ZW0sIHNwZWVkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnb1RvIDogZnVuY3Rpb24gKHBvc2l0aW9uLCBzcGVlZCwgZHJhZykge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGdvVG9QaXhlbDtcblxuICAgICAgICAgICAgaWYgKGJhc2UuaXNUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYmVmb3JlTW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmJlZm9yZU1vdmUuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiA+PSBiYXNlLm1heGltdW1JdGVtKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gYmFzZS5vd2wuY3VycmVudEl0ZW0gPSBwb3NpdGlvbjtcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMudHJhbnNpdGlvblN0eWxlICE9PSBmYWxzZSAmJiBkcmFnICE9PSBcImRyYWdcIiAmJiBiYXNlLm9wdGlvbnMuaXRlbXMgPT09IDEgJiYgYmFzZS5icm93c2VyLnN1cHBvcnQzZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKDApO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLmJyb3dzZXIuc3VwcG9ydDNkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UudHJhbnNpdGlvbjNkKGJhc2UucG9zaXRpb25zSW5BcnJheVtwb3NpdGlvbl0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3NzMnNsaWRlKGJhc2UucG9zaXRpb25zSW5BcnJheVtwb3NpdGlvbl0sIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiYXNlLmFmdGVyR28oKTtcbiAgICAgICAgICAgICAgICBiYXNlLnNpbmdsZUl0ZW1UcmFuc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ29Ub1BpeGVsID0gYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXTtcblxuICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5zdXBwb3J0M2QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLmlzQ3NzM0ZpbmlzaCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNwZWVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKFwicGFnaW5hdGlvblNwZWVkXCIpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmlzQ3NzM0ZpbmlzaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sIGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uU3BlZWQpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gXCJyZXdpbmRcIikge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnN3YXBTcGVlZChiYXNlLm9wdGlvbnMucmV3aW5kU3BlZWQpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmlzQ3NzM0ZpbmlzaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sIGJhc2Uub3B0aW9ucy5yZXdpbmRTcGVlZCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnN3YXBTcGVlZChcInNsaWRlU3BlZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuaXNDc3MzRmluaXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLnNsaWRlU3BlZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiYXNlLnRyYW5zaXRpb24zZChnb1RvUGl4ZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3BlZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoZ29Ub1BpeGVsLCBiYXNlLm9wdGlvbnMucGFnaW5hdGlvblNwZWVkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSBcInJld2luZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3NzMnNsaWRlKGdvVG9QaXhlbCwgYmFzZS5vcHRpb25zLnJld2luZFNwZWVkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNzczJzbGlkZShnb1RvUGl4ZWwsIGJhc2Uub3B0aW9ucy5zbGlkZVNwZWVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmFmdGVyR28oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBqdW1wVG8gOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmJlZm9yZU1vdmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5iZWZvcmVNb3ZlLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPj0gYmFzZS5tYXhpbXVtSXRlbSB8fCBwb3NpdGlvbiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uIDw9IDApIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLnN3YXBTcGVlZCgwKTtcbiAgICAgICAgICAgIGlmIChiYXNlLmJyb3dzZXIuc3VwcG9ydDNkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS50cmFuc2l0aW9uM2QoYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuY3NzMnNsaWRlKGJhc2UucG9zaXRpb25zSW5BcnJheVtwb3NpdGlvbl0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGJhc2Uub3dsLmN1cnJlbnRJdGVtID0gcG9zaXRpb247XG4gICAgICAgICAgICBiYXNlLmFmdGVyR28oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZnRlckdvIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBiYXNlLnByZXZBcnIucHVzaChiYXNlLmN1cnJlbnRJdGVtKTtcbiAgICAgICAgICAgIGJhc2UucHJldkl0ZW0gPSBiYXNlLm93bC5wcmV2SXRlbSA9IGJhc2UucHJldkFycltiYXNlLnByZXZBcnIubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICBiYXNlLnByZXZBcnIuc2hpZnQoMCk7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLnByZXZJdGVtICE9PSBiYXNlLmN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5jaGVja1BhZ2luYXRpb24oKTtcbiAgICAgICAgICAgICAgICBiYXNlLmNoZWNrTmF2aWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGJhc2UuZWFjaE1vdmVVcGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY2hlY2tBcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmFmdGVyTW92ZSA9PT0gXCJmdW5jdGlvblwiICYmIGJhc2UucHJldkl0ZW0gIT09IGJhc2UuY3VycmVudEl0ZW0pIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYWZ0ZXJNb3ZlLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuYXBTdGF0dXMgPSBcInN0b3BcIjtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuYXV0b1BsYXlJbnRlcnZhbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hlY2tBcCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLmFwU3RhdHVzICE9PSBcInN0b3BcIikge1xuICAgICAgICAgICAgICAgIGJhc2UucGxheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYXkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLmFwU3RhdHVzID0gXCJwbGF5XCI7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuYXV0b1BsYXlJbnRlcnZhbCk7XG4gICAgICAgICAgICBiYXNlLmF1dG9QbGF5SW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhc2UubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIH0sIGJhc2Uub3B0aW9ucy5hdXRvUGxheSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3dhcFNwZWVkIDogZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gXCJzbGlkZVNwZWVkXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyhiYXNlLmFkZENzc1NwZWVkKGJhc2Uub3B0aW9ucy5zbGlkZVNwZWVkKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gXCJwYWdpbmF0aW9uU3BlZWRcIikge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKGJhc2UuYWRkQ3NzU3BlZWQoYmFzZS5vcHRpb25zLnBhZ2luYXRpb25TcGVlZCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYWN0aW9uICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5jc3MoYmFzZS5hZGRDc3NTcGVlZChhY3Rpb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhZGRDc3NTcGVlZCA6IGZ1bmN0aW9uIChzcGVlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNpdGlvblwiOiBcImFsbCBcIiArIHNwZWVkICsgXCJtcyBlYXNlXCIsXG4gICAgICAgICAgICAgICAgXCItbW96LXRyYW5zaXRpb25cIjogXCJhbGwgXCIgKyBzcGVlZCArIFwibXMgZWFzZVwiLFxuICAgICAgICAgICAgICAgIFwiLW8tdHJhbnNpdGlvblwiOiBcImFsbCBcIiArIHNwZWVkICsgXCJtcyBlYXNlXCIsXG4gICAgICAgICAgICAgICAgXCJ0cmFuc2l0aW9uXCI6IFwiYWxsIFwiICsgc3BlZWQgKyBcIm1zIGVhc2VcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVUcmFuc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNpdGlvblwiOiBcIlwiLFxuICAgICAgICAgICAgICAgIFwiLW1vei10cmFuc2l0aW9uXCI6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCItby10cmFuc2l0aW9uXCI6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCJ0cmFuc2l0aW9uXCI6IFwiXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZG9UcmFuc2xhdGUgOiBmdW5jdGlvbiAocGl4ZWxzKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGUzZChcIiArIHBpeGVscyArIFwicHgsIDBweCwgMHB4KVwiLFxuICAgICAgICAgICAgICAgIFwiLW1vei10cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGUzZChcIiArIHBpeGVscyArIFwicHgsIDBweCwgMHB4KVwiLFxuICAgICAgICAgICAgICAgIFwiLW8tdHJhbnNmb3JtXCI6IFwidHJhbnNsYXRlM2QoXCIgKyBwaXhlbHMgKyBcInB4LCAwcHgsIDBweClcIixcbiAgICAgICAgICAgICAgICBcIi1tcy10cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGUzZChcIiArIHBpeGVscyArIFwicHgsIDBweCwgMHB4KVwiLFxuICAgICAgICAgICAgICAgIFwidHJhbnNmb3JtXCI6IFwidHJhbnNsYXRlM2QoXCIgKyBwaXhlbHMgKyBcInB4LCAwcHgsMHB4KVwiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyYW5zaXRpb24zZCA6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5jc3MoYmFzZS5kb1RyYW5zbGF0ZSh2YWx1ZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNzczJtb3ZlIDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyh7XCJsZWZ0XCIgOiB2YWx1ZX0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNzczJzbGlkZSA6IGZ1bmN0aW9uICh2YWx1ZSwgc3BlZWQpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgYmFzZS5pc0Nzc0ZpbmlzaCA9IGZhbHNlO1xuICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5zdG9wKHRydWUsIHRydWUpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIFwibGVmdFwiIDogdmFsdWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA6IHNwZWVkIHx8IGJhc2Uub3B0aW9ucy5zbGlkZVNwZWVkLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmlzQ3NzRmluaXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja0Jyb3dzZXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlM0QgPSBcInRyYW5zbGF0ZTNkKDBweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgdGVtcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgIHJlZ2V4LFxuICAgICAgICAgICAgICAgIGFzU3VwcG9ydCxcbiAgICAgICAgICAgICAgICBzdXBwb3J0M2QsXG4gICAgICAgICAgICAgICAgaXNUb3VjaDtcblxuICAgICAgICAgICAgdGVtcEVsZW0uc3R5bGUuY3NzVGV4dCA9IFwiICAtbW96LXRyYW5zZm9ybTpcIiArIHRyYW5zbGF0ZTNEICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjsgLW1zLXRyYW5zZm9ybTpcIiAgICAgKyB0cmFuc2xhdGUzRCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI7IC1vLXRyYW5zZm9ybTpcIiAgICAgICsgdHJhbnNsYXRlM0QgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOyAtd2Via2l0LXRyYW5zZm9ybTpcIiArIHRyYW5zbGF0ZTNEICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjsgdHJhbnNmb3JtOlwiICAgICAgICAgKyB0cmFuc2xhdGUzRDtcbiAgICAgICAgICAgIHJlZ2V4ID0gL3RyYW5zbGF0ZTNkXFwoMHB4LCAwcHgsIDBweFxcKS9nO1xuICAgICAgICAgICAgYXNTdXBwb3J0ID0gdGVtcEVsZW0uc3R5bGUuY3NzVGV4dC5tYXRjaChyZWdleCk7XG4gICAgICAgICAgICBzdXBwb3J0M2QgPSAoYXNTdXBwb3J0ICE9PSBudWxsICYmIGFzU3VwcG9ydC5sZW5ndGggPT09IDEpO1xuXG4gICAgICAgICAgICBpc1RvdWNoID0gXCJvbnRvdWNoc3RhcnRcIiBpbiB3aW5kb3cgfHwgd2luZG93Lm5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzO1xuXG4gICAgICAgICAgICBiYXNlLmJyb3dzZXIgPSB7XG4gICAgICAgICAgICAgICAgXCJzdXBwb3J0M2RcIiA6IHN1cHBvcnQzZCxcbiAgICAgICAgICAgICAgICBcImlzVG91Y2hcIiA6IGlzVG91Y2hcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZUV2ZW50cyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubW91c2VEcmFnICE9PSBmYWxzZSB8fCBiYXNlLm9wdGlvbnMudG91Y2hEcmFnICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuZ2VzdHVyZXMoKTtcbiAgICAgICAgICAgICAgICBiYXNlLmRpc2FibGVkRXZlbnRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRUeXBlcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcInNcIiwgXCJlXCIsIFwieFwiXTtcblxuICAgICAgICAgICAgYmFzZS5ldl90eXBlcyA9IHt9O1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLm1vdXNlRHJhZyA9PT0gdHJ1ZSAmJiBiYXNlLm9wdGlvbnMudG91Y2hEcmFnID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdHlwZXMgPSBbXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2hzdGFydC5vd2wgbW91c2Vkb3duLm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcInRvdWNobW92ZS5vd2wgbW91c2Vtb3ZlLm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcInRvdWNoZW5kLm93bCB0b3VjaGNhbmNlbC5vd2wgbW91c2V1cC5vd2xcIlxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2Uub3B0aW9ucy5tb3VzZURyYWcgPT09IGZhbHNlICYmIGJhc2Uub3B0aW9ucy50b3VjaERyYWcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaHN0YXJ0Lm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcInRvdWNobW92ZS5vd2xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaGVuZC5vd2wgdG91Y2hjYW5jZWwub3dsXCJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLm9wdGlvbnMubW91c2VEcmFnID09PSB0cnVlICYmIGJhc2Uub3B0aW9ucy50b3VjaERyYWcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdHlwZXMgPSBbXG4gICAgICAgICAgICAgICAgICAgIFwibW91c2Vkb3duLm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcIm1vdXNlbW92ZS5vd2xcIixcbiAgICAgICAgICAgICAgICAgICAgXCJtb3VzZXVwLm93bFwiXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS5ldl90eXBlcy5zdGFydCA9IHR5cGVzWzBdO1xuICAgICAgICAgICAgYmFzZS5ldl90eXBlcy5tb3ZlID0gdHlwZXNbMV07XG4gICAgICAgICAgICBiYXNlLmV2X3R5cGVzLmVuZCA9IHR5cGVzWzJdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVkRXZlbnRzIDogIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJkcmFnc3RhcnQub3dsXCIsIGZ1bmN0aW9uIChldmVudCkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJtb3VzZWRvd24uZGlzYWJsZVRleHRTZWxlY3RcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJChlLnRhcmdldCkuaXMoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBvcHRpb24nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdlc3R1cmVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLypqc2xpbnQgdW5wYXJhbTogdHJ1ZSovXG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbG9jYWxzID0ge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXRYIDogMCxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0WSA6IDAsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VFbFdpZHRoIDogMCxcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVQb3MgOiAwLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluU3dpcGUgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBtYXhTd2lwZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGluZyA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGRhcmdnaW5nOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFbGVtZW50IDogbnVsbFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGJhc2UuaXNDc3NGaW5pc2ggPSB0cnVlO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRUb3VjaGVzKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeCA6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICB5IDogZXZlbnQudG91Y2hlc1swXS5wYWdlWVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChldmVudC50b3VjaGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnBhZ2VYICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeCA6IGV2ZW50LnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgOiBldmVudC5wYWdlWVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFnZVggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4IDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5IDogZXZlbnQuY2xpZW50WVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gc3dhcEV2ZW50cyh0eXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwib25cIikge1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbihiYXNlLmV2X3R5cGVzLm1vdmUsIGRyYWdNb3ZlKTtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oYmFzZS5ldl90eXBlcy5lbmQsIGRyYWdFbmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJvZmZcIikge1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoYmFzZS5ldl90eXBlcy5tb3ZlKTtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKGJhc2UuZXZfdHlwZXMuZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYWdTdGFydChldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBldiA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgfHwgZXZlbnQgfHwgd2luZG93LmV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjtcblxuICAgICAgICAgICAgICAgIGlmIChldi53aGljaCA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiYXNlLml0ZW1zQW1vdW50IDw9IGJhc2Uub3B0aW9ucy5pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiYXNlLmlzQ3NzRmluaXNoID09PSBmYWxzZSAmJiAhYmFzZS5vcHRpb25zLmRyYWdCZWZvcmVBbmltRmluaXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuaXNDc3MzRmluaXNoID09PSBmYWxzZSAmJiAhYmFzZS5vcHRpb25zLmRyYWdCZWZvcmVBbmltRmluaXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmF1dG9QbGF5SW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLmJyb3dzZXIuaXNUb3VjaCAhPT0gdHJ1ZSAmJiAhYmFzZS4kb3dsV3JhcHBlci5oYXNDbGFzcyhcImdyYWJiaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuYWRkQ2xhc3MoXCJncmFiYmluZ1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBiYXNlLm5ld1Bvc1ggPSAwO1xuICAgICAgICAgICAgICAgIGJhc2UubmV3UmVsYXRpdmVYID0gMDtcblxuICAgICAgICAgICAgICAgICQodGhpcykuY3NzKGJhc2UucmVtb3ZlVHJhbnNpdGlvbigpKTtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gJCh0aGlzKS5wb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIGxvY2Fscy5yZWxhdGl2ZVBvcyA9IHBvc2l0aW9uLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBsb2NhbHMub2Zmc2V0WCA9IGdldFRvdWNoZXMoZXYpLnggLSBwb3NpdGlvbi5sZWZ0O1xuICAgICAgICAgICAgICAgIGxvY2Fscy5vZmZzZXRZID0gZ2V0VG91Y2hlcyhldikueSAtIHBvc2l0aW9uLnRvcDtcblxuICAgICAgICAgICAgICAgIHN3YXBFdmVudHMoXCJvblwiKTtcblxuICAgICAgICAgICAgICAgIGxvY2Fscy5zbGlkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbG9jYWxzLnRhcmdldEVsZW1lbnQgPSBldi50YXJnZXQgfHwgZXYuc3JjRWxlbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhZ01vdmUoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXYgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50IHx8IHdpbmRvdy5ldmVudCxcbiAgICAgICAgICAgICAgICAgICAgbWluU3dpcGUsXG4gICAgICAgICAgICAgICAgICAgIG1heFN3aXBlO1xuXG4gICAgICAgICAgICAgICAgYmFzZS5uZXdQb3NYID0gZ2V0VG91Y2hlcyhldikueCAtIGxvY2Fscy5vZmZzZXRYO1xuICAgICAgICAgICAgICAgIGJhc2UubmV3UG9zWSA9IGdldFRvdWNoZXMoZXYpLnkgLSBsb2NhbHMub2Zmc2V0WTtcbiAgICAgICAgICAgICAgICBiYXNlLm5ld1JlbGF0aXZlWCA9IGJhc2UubmV3UG9zWCAtIGxvY2Fscy5yZWxhdGl2ZVBvcztcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLnN0YXJ0RHJhZ2dpbmcgPT09IFwiZnVuY3Rpb25cIiAmJiBsb2NhbHMuZHJhZ2dpbmcgIT09IHRydWUgJiYgYmFzZS5uZXdSZWxhdGl2ZVggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLnN0YXJ0RHJhZ2dpbmcuYXBwbHkoYmFzZSwgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoKGJhc2UubmV3UmVsYXRpdmVYID4gOCB8fCBiYXNlLm5ld1JlbGF0aXZlWCA8IC04KSAmJiAoYmFzZS5icm93c2VyLmlzVG91Y2ggPT09IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldi5wcmV2ZW50RGVmYXVsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXYucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbHMuc2xpZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKChiYXNlLm5ld1Bvc1kgPiAxMCB8fCBiYXNlLm5ld1Bvc1kgPCAtMTApICYmIGxvY2Fscy5zbGlkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXCJ0b3VjaG1vdmUub3dsXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1pblN3aXBlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5uZXdSZWxhdGl2ZVggLyA1O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBtYXhTd2lwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2UubWF4aW11bVBpeGVscyArIGJhc2UubmV3UmVsYXRpdmVYIC8gNTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgYmFzZS5uZXdQb3NYID0gTWF0aC5tYXgoTWF0aC5taW4oYmFzZS5uZXdQb3NYLCBtaW5Td2lwZSgpKSwgbWF4U3dpcGUoKSk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5zdXBwb3J0M2QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS50cmFuc2l0aW9uM2QoYmFzZS5uZXdQb3NYKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNzczJtb3ZlKGJhc2UubmV3UG9zWCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmFnRW5kKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ID0gZXZlbnQub3JpZ2luYWxFdmVudCB8fCBldmVudCB8fCB3aW5kb3cuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVycyxcbiAgICAgICAgICAgICAgICAgICAgb3dsU3RvcEV2ZW50O1xuXG4gICAgICAgICAgICAgICAgZXYudGFyZ2V0ID0gZXYudGFyZ2V0IHx8IGV2LnNyY0VsZW1lbnQ7XG5cbiAgICAgICAgICAgICAgICBsb2NhbHMuZHJhZ2dpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLmJyb3dzZXIuaXNUb3VjaCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLnJlbW92ZUNsYXNzKFwiZ3JhYmJpbmdcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2UubmV3UmVsYXRpdmVYIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmRyYWdEaXJlY3Rpb24gPSBiYXNlLm93bC5kcmFnRGlyZWN0aW9uID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5kcmFnRGlyZWN0aW9uID0gYmFzZS5vd2wuZHJhZ0RpcmVjdGlvbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5uZXdSZWxhdGl2ZVggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UG9zaXRpb24gPSBiYXNlLmdldE5ld1Bvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuZ29UbyhuZXdQb3NpdGlvbiwgZmFsc2UsIFwiZHJhZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2Fscy50YXJnZXRFbGVtZW50ID09PSBldi50YXJnZXQgJiYgYmFzZS5icm93c2VyLmlzVG91Y2ggIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZXYudGFyZ2V0KS5vbihcImNsaWNrLmRpc2FibGVcIiwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXYuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2LnRhcmdldCkub2ZmKFwiY2xpY2suZGlzYWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMgPSAkLl9kYXRhKGV2LnRhcmdldCwgXCJldmVudHNcIikuY2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICBvd2xTdG9wRXZlbnQgPSBoYW5kbGVycy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZSgwLCAwLCBvd2xTdG9wRXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3YXBFdmVudHMoXCJvZmZcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKGJhc2UuZXZfdHlwZXMuc3RhcnQsIFwiLm93bC13cmFwcGVyXCIsIGRyYWdTdGFydCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TmV3UG9zaXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb24gPSBiYXNlLmNsb3Nlc3RJdGVtKCk7XG5cbiAgICAgICAgICAgIGlmIChuZXdQb3NpdGlvbiA+IGJhc2UubWF4aW11bUl0ZW0pIHtcbiAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gYmFzZS5tYXhpbXVtSXRlbTtcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiAgPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLm5ld1Bvc1ggPj0gMCkge1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdQb3NpdGlvbjtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2VzdEl0ZW0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYXJyYXkgPSBiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSA/IGJhc2UucGFnZXNJbkFycmF5IDogYmFzZS5wb3NpdGlvbnNJbkFycmF5LFxuICAgICAgICAgICAgICAgIGdvYWwgPSBiYXNlLm5ld1Bvc1gsXG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IG51bGw7XG5cbiAgICAgICAgICAgICQuZWFjaChhcnJheSwgZnVuY3Rpb24gKGksIHYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZ29hbCAtIChiYXNlLml0ZW1XaWR0aCAvIDIwKSA+IGFycmF5W2kgKyAxXSAmJiBnb2FsIC0gKGJhc2UuaXRlbVdpZHRoIC8gMjApIDwgdiAmJiBiYXNlLm1vdmVEaXJlY3Rpb24oKSA9PT0gXCJsZWZ0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IHY7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9ICQuaW5BcnJheShjbG9zZXN0LCBiYXNlLnBvc2l0aW9uc0luQXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGdvYWwgKyAoYmFzZS5pdGVtV2lkdGggLyAyMCkgPCB2ICYmIGdvYWwgKyAoYmFzZS5pdGVtV2lkdGggLyAyMCkgPiAoYXJyYXlbaSArIDFdIHx8IGFycmF5W2ldIC0gYmFzZS5pdGVtV2lkdGgpICYmIGJhc2UubW92ZURpcmVjdGlvbigpID09PSBcInJpZ2h0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gYXJyYXlbaSArIDFdIHx8IGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9ICQuaW5BcnJheShjbG9zZXN0LCBiYXNlLnBvc2l0aW9uc0luQXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGFycmF5W2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGJhc2UuY3VycmVudEl0ZW07XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZURpcmVjdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb247XG4gICAgICAgICAgICBpZiAoYmFzZS5uZXdSZWxhdGl2ZVggPCAwKSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgIGJhc2UucGxheURpcmVjdGlvbiA9IFwibmV4dFwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBiYXNlLnBsYXlEaXJlY3Rpb24gPSBcInByZXZcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3Rpb247XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3VzdG9tRXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLypqc2xpbnQgdW5wYXJhbTogdHJ1ZSovXG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwib3dsLm5leHRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhc2UubmV4dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwib3dsLnByZXZcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhc2UucHJldigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwib3dsLnBsYXlcIiwgZnVuY3Rpb24gKGV2ZW50LCBzcGVlZCkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hdXRvUGxheSA9IHNwZWVkO1xuICAgICAgICAgICAgICAgIGJhc2UucGxheSgpO1xuICAgICAgICAgICAgICAgIGJhc2UuaG92ZXJTdGF0dXMgPSBcInBsYXlcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5zdG9wXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnN0b3AoKTtcbiAgICAgICAgICAgICAgICBiYXNlLmhvdmVyU3RhdHVzID0gXCJzdG9wXCI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wuZ29Ub1wiLCBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBiYXNlLmdvVG8oaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wuanVtcFRvXCIsIGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2UuanVtcFRvKGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcE9uSG92ZXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnN0b3BPbkhvdmVyID09PSB0cnVlICYmIGJhc2UuYnJvd3Nlci5pc1RvdWNoICE9PSB0cnVlICYmIGJhc2Uub3B0aW9ucy5hdXRvUGxheSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5zdG9wKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UuaG92ZXJTdGF0dXMgIT09IFwic3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxhenlMb2FkIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgJGl0ZW0sXG4gICAgICAgICAgICAgICAgaXRlbU51bWJlcixcbiAgICAgICAgICAgICAgICAkbGF6eUltZyxcbiAgICAgICAgICAgICAgICBmb2xsb3c7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubGF6eUxvYWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJhc2UuaXRlbXNBbW91bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICRpdGVtID0gJChiYXNlLiRvd2xJdGVtc1tpXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoJGl0ZW0uZGF0YShcIm93bC1sb2FkZWRcIikgPT09IFwibG9hZGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaXRlbU51bWJlciA9ICRpdGVtLmRhdGEoXCJvd2wtaXRlbVwiKTtcbiAgICAgICAgICAgICAgICAkbGF6eUltZyA9ICRpdGVtLmZpbmQoXCIubGF6eU93bFwiKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgJGxhenlJbWcuZGF0YShcInNyY1wiKSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAkaXRlbS5kYXRhKFwib3dsLWxvYWRlZFwiLCBcImxvYWRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgkaXRlbS5kYXRhKFwib3dsLWxvYWRlZFwiKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICRsYXp5SW1nLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoXCJsb2FkaW5nXCIpLmRhdGEoXCJvd2wtbG9hZGVkXCIsIFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5sYXp5Rm9sbG93ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGxvdyA9IGl0ZW1OdW1iZXIgPj0gYmFzZS5jdXJyZW50SXRlbTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb2xsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZm9sbG93ICYmIGl0ZW1OdW1iZXIgPCBiYXNlLmN1cnJlbnRJdGVtICsgYmFzZS5vcHRpb25zLml0ZW1zICYmICRsYXp5SW1nLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmxhenlQcmVsb2FkKCRpdGVtLCAkbGF6eUltZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxhenlQcmVsb2FkIDogZnVuY3Rpb24gKCRpdGVtLCAkbGF6eUltZykge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbnMgPSAwLFxuICAgICAgICAgICAgICAgIGlzQmFja2dyb3VuZEltZztcblxuICAgICAgICAgICAgaWYgKCRsYXp5SW1nLnByb3AoXCJ0YWdOYW1lXCIpID09PSBcIkRJVlwiKSB7XG4gICAgICAgICAgICAgICAgJGxhenlJbWcuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBcInVybChcIiArICRsYXp5SW1nLmRhdGEoXCJzcmNcIikgKyBcIilcIik7XG4gICAgICAgICAgICAgICAgaXNCYWNrZ3JvdW5kSW1nID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGxhenlJbWdbMF0uc3JjID0gJGxhenlJbWcuZGF0YShcInNyY1wiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gc2hvd0ltYWdlKCkge1xuICAgICAgICAgICAgICAgICRpdGVtLmRhdGEoXCJvd2wtbG9hZGVkXCIsIFwibG9hZGVkXCIpLnJlbW92ZUNsYXNzKFwibG9hZGluZ1wiKTtcbiAgICAgICAgICAgICAgICAkbGF6eUltZy5yZW1vdmVBdHRyKFwiZGF0YS1zcmNcIik7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5sYXp5RWZmZWN0ID09PSBcImZhZGVcIikge1xuICAgICAgICAgICAgICAgICAgICAkbGF6eUltZy5mYWRlSW4oNDAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkbGF6eUltZy5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmFmdGVyTGF6eUxvYWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYWZ0ZXJMYXp5TG9hZC5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tMYXp5SW1hZ2UoKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucyArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLmNvbXBsZXRlSW1nKCRsYXp5SW1nLmdldCgwKSkgfHwgaXNCYWNrZ3JvdW5kSW1nID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dJbWFnZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlcmF0aW9ucyA8PSAxMDApIHsvL2lmIGltYWdlIGxvYWRzIGluIGxlc3MgdGhhbiAxMCBzZWNvbmRzIFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjaGVja0xhenlJbWFnZSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaG93SW1hZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoZWNrTGF6eUltYWdlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXV0b0hlaWdodCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkY3VycmVudGltZyA9ICQoYmFzZS4kb3dsSXRlbXNbYmFzZS5jdXJyZW50SXRlbV0pLmZpbmQoXCJpbWdcIiksXG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucztcblxuICAgICAgICAgICAgZnVuY3Rpb24gYWRkSGVpZ2h0KCkge1xuICAgICAgICAgICAgICAgIHZhciAkY3VycmVudEl0ZW0gPSAkKGJhc2UuJG93bEl0ZW1zW2Jhc2UuY3VycmVudEl0ZW1dKS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICBiYXNlLndyYXBwZXJPdXRlci5jc3MoXCJoZWlnaHRcIiwgJGN1cnJlbnRJdGVtICsgXCJweFwiKTtcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2Uud3JhcHBlck91dGVyLmhhc0NsYXNzKFwiYXV0b0hlaWdodFwiKSkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLndyYXBwZXJPdXRlci5hZGRDbGFzcyhcImF1dG9IZWlnaHRcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tJbWFnZSgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRpb25zICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuY29tcGxldGVJbWcoJGN1cnJlbnRpbWcuZ2V0KDApKSkge1xuICAgICAgICAgICAgICAgICAgICBhZGRIZWlnaHQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZXJhdGlvbnMgPD0gMTAwKSB7IC8vaWYgaW1hZ2UgbG9hZHMgaW4gbGVzcyB0aGFuIDEwIHNlY29uZHMgXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNoZWNrSW1hZ2UsIDEwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS53cmFwcGVyT3V0ZXIuY3NzKFwiaGVpZ2h0XCIsIFwiXCIpOyAvL0Vsc2UgcmVtb3ZlIGhlaWdodCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkY3VycmVudGltZy5nZXQoMCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgICAgICAgICAgIGNoZWNrSW1hZ2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkSGVpZ2h0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29tcGxldGVJbWcgOiBmdW5jdGlvbiAoaW1nKSB7XG4gICAgICAgICAgICB2YXIgbmF0dXJhbFdpZHRoVHlwZTtcblxuICAgICAgICAgICAgaWYgKCFpbWcuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuYXR1cmFsV2lkdGhUeXBlID0gdHlwZW9mIGltZy5uYXR1cmFsV2lkdGg7XG4gICAgICAgICAgICBpZiAobmF0dXJhbFdpZHRoVHlwZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBpbWcubmF0dXJhbFdpZHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WaXNpYmxlSXRlbXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaTtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hZGRDbGFzc0FjdGl2ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bEl0ZW1zLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS52aXNpYmxlSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSA9IGJhc2UuY3VycmVudEl0ZW07IGkgPCBiYXNlLmN1cnJlbnRJdGVtICsgYmFzZS5vcHRpb25zLml0ZW1zOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnZpc2libGVJdGVtcy5wdXNoKGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hZGRDbGFzc0FjdGl2ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAkKGJhc2UuJG93bEl0ZW1zW2ldKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLm93bC52aXNpYmxlSXRlbXMgPSBiYXNlLnZpc2libGVJdGVtcztcbiAgICAgICAgfSxcblxuICAgICAgICB0cmFuc2l0aW9uVHlwZXMgOiBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICAvL0N1cnJlbnRseSBhdmFpbGFibGU6IFwiZmFkZVwiLCBcImJhY2tTbGlkZVwiLCBcImdvRG93blwiLCBcImZhZGVVcFwiXG4gICAgICAgICAgICBiYXNlLm91dENsYXNzID0gXCJvd2wtXCIgKyBjbGFzc05hbWUgKyBcIi1vdXRcIjtcbiAgICAgICAgICAgIGJhc2UuaW5DbGFzcyA9IFwib3dsLVwiICsgY2xhc3NOYW1lICsgXCItaW5cIjtcbiAgICAgICAgfSxcblxuICAgICAgICBzaW5nbGVJdGVtVHJhbnNpdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvdXRDbGFzcyA9IGJhc2Uub3V0Q2xhc3MsXG4gICAgICAgICAgICAgICAgaW5DbGFzcyA9IGJhc2UuaW5DbGFzcyxcbiAgICAgICAgICAgICAgICAkY3VycmVudEl0ZW0gPSBiYXNlLiRvd2xJdGVtcy5lcShiYXNlLmN1cnJlbnRJdGVtKSxcbiAgICAgICAgICAgICAgICAkcHJldkl0ZW0gPSBiYXNlLiRvd2xJdGVtcy5lcShiYXNlLnByZXZJdGVtKSxcbiAgICAgICAgICAgICAgICBwcmV2UG9zID0gTWF0aC5hYnMoYmFzZS5wb3NpdGlvbnNJbkFycmF5W2Jhc2UuY3VycmVudEl0ZW1dKSArIGJhc2UucG9zaXRpb25zSW5BcnJheVtiYXNlLnByZXZJdGVtXSxcbiAgICAgICAgICAgICAgICBvcmlnaW4gPSBNYXRoLmFicyhiYXNlLnBvc2l0aW9uc0luQXJyYXlbYmFzZS5jdXJyZW50SXRlbV0pICsgYmFzZS5pdGVtV2lkdGggLyAyLFxuICAgICAgICAgICAgICAgIGFuaW1FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG9BbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgYW5pbWF0aW9uZW5kJztcblxuICAgICAgICAgICAgYmFzZS5pc1RyYW5zaXRpb24gPSB0cnVlO1xuXG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdvd2wtb3JpZ2luJylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgXCItd2Via2l0LXRyYW5zZm9ybS1vcmlnaW5cIiA6IG9yaWdpbiArIFwicHhcIixcbiAgICAgICAgICAgICAgICAgICAgXCItbW96LXBlcnNwZWN0aXZlLW9yaWdpblwiIDogb3JpZ2luICsgXCJweFwiLFxuICAgICAgICAgICAgICAgICAgICBcInBlcnNwZWN0aXZlLW9yaWdpblwiIDogb3JpZ2luICsgXCJweFwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmdW5jdGlvbiB0cmFuc1N0eWxlcyhwcmV2UG9zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvblwiIDogXCJyZWxhdGl2ZVwiLFxuICAgICAgICAgICAgICAgICAgICBcImxlZnRcIiA6IHByZXZQb3MgKyBcInB4XCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkcHJldkl0ZW1cbiAgICAgICAgICAgICAgICAuY3NzKHRyYW5zU3R5bGVzKHByZXZQb3MsIDEwKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3Mob3V0Q2xhc3MpXG4gICAgICAgICAgICAgICAgLm9uKGFuaW1FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5lbmRQcmV2ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgJHByZXZJdGVtLm9mZihhbmltRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jbGVhclRyYW5zU3R5bGUoJHByZXZJdGVtLCBvdXRDbGFzcyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRjdXJyZW50SXRlbVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhpbkNsYXNzKVxuICAgICAgICAgICAgICAgIC5vbihhbmltRW5kLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuZW5kQ3VycmVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICRjdXJyZW50SXRlbS5vZmYoYW5pbUVuZCk7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY2xlYXJUcmFuc1N0eWxlKCRjdXJyZW50SXRlbSwgaW5DbGFzcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXJUcmFuc1N0eWxlIDogZnVuY3Rpb24gKGl0ZW0sIGNsYXNzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGl0ZW0uY3NzKHtcbiAgICAgICAgICAgICAgICBcInBvc2l0aW9uXCIgOiBcIlwiLFxuICAgICAgICAgICAgICAgIFwibGVmdFwiIDogXCJcIlxuICAgICAgICAgICAgfSkucmVtb3ZlQ2xhc3MoY2xhc3NUb1JlbW92ZSk7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLmVuZFByZXYgJiYgYmFzZS5lbmRDdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5yZW1vdmVDbGFzcygnb3dsLW9yaWdpbicpO1xuICAgICAgICAgICAgICAgIGJhc2UuZW5kUHJldiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2UuZW5kQ3VycmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2UuaXNUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3dsU3RhdHVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5vd2wgPSB7XG4gICAgICAgICAgICAgICAgXCJ1c2VyT3B0aW9uc1wiICAgOiBiYXNlLnVzZXJPcHRpb25zLFxuICAgICAgICAgICAgICAgIFwiYmFzZUVsZW1lbnRcIiAgIDogYmFzZS4kZWxlbSxcbiAgICAgICAgICAgICAgICBcInVzZXJJdGVtc1wiICAgICA6IGJhc2UuJHVzZXJJdGVtcyxcbiAgICAgICAgICAgICAgICBcIm93bEl0ZW1zXCIgICAgICA6IGJhc2UuJG93bEl0ZW1zLFxuICAgICAgICAgICAgICAgIFwiY3VycmVudEl0ZW1cIiAgIDogYmFzZS5jdXJyZW50SXRlbSxcbiAgICAgICAgICAgICAgICBcInByZXZJdGVtXCIgICAgICA6IGJhc2UucHJldkl0ZW0sXG4gICAgICAgICAgICAgICAgXCJ2aXNpYmxlSXRlbXNcIiAgOiBiYXNlLnZpc2libGVJdGVtcyxcbiAgICAgICAgICAgICAgICBcImlzVG91Y2hcIiAgICAgICA6IGJhc2UuYnJvd3Nlci5pc1RvdWNoLFxuICAgICAgICAgICAgICAgIFwiYnJvd3NlclwiICAgICAgIDogYmFzZS5icm93c2VyLFxuICAgICAgICAgICAgICAgIFwiZHJhZ0RpcmVjdGlvblwiIDogYmFzZS5kcmFnRGlyZWN0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyRXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vZmYoXCIub3dsIG93bCBtb3VzZWRvd24uZGlzYWJsZVRleHRTZWxlY3RcIik7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXCIub3dsIG93bFwiKTtcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoXCJyZXNpemVcIiwgYmFzZS5yZXNpemVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1bldyYXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5jaGlsZHJlbigpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIudW53cmFwKCk7XG4gICAgICAgICAgICAgICAgYmFzZS4kdXNlckl0ZW1zLnVud3JhcCgpLnVud3JhcCgpO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLm93bENvbnRyb2xzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3dsQ29udHJvbHMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5jbGVhckV2ZW50cygpO1xuICAgICAgICAgICAgYmFzZS4kZWxlbVxuICAgICAgICAgICAgICAgIC5hdHRyKFwic3R5bGVcIiwgYmFzZS4kZWxlbS5kYXRhKFwib3dsLW9yaWdpbmFsU3R5bGVzXCIpIHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBiYXNlLiRlbGVtLmRhdGEoXCJvd2wtb3JpZ2luYWxDbGFzc2VzXCIpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5zdG9wKCk7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmNoZWNrVmlzaWJsZSk7XG4gICAgICAgICAgICBiYXNlLnVuV3JhcCgpO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5yZW1vdmVEYXRhKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVpbml0IDogZnVuY3Rpb24gKG5ld09wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIGJhc2UudXNlck9wdGlvbnMsIG5ld09wdGlvbnMpO1xuICAgICAgICAgICAgYmFzZS51bldyYXAoKTtcbiAgICAgICAgICAgIGJhc2UuaW5pdChvcHRpb25zLCBiYXNlLiRlbGVtKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRJdGVtIDogZnVuY3Rpb24gKGh0bWxTdHJpbmcsIHRhcmdldFBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcG9zaXRpb247XG5cbiAgICAgICAgICAgIGlmICghaHRtbFN0cmluZykge3JldHVybiBmYWxzZTsgfVxuXG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5jaGlsZHJlbigpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uYXBwZW5kKGh0bWxTdHJpbmcpO1xuICAgICAgICAgICAgICAgIGJhc2Uuc2V0VmFycygpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UudW5XcmFwKCk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0UG9zaXRpb24gPT09IHVuZGVmaW5lZCB8fCB0YXJnZXRQb3NpdGlvbiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IC0xO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID49IGJhc2UuJHVzZXJJdGVtcy5sZW5ndGggfHwgcG9zaXRpb24gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kdXNlckl0ZW1zLmVxKC0xKS5hZnRlcihodG1sU3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kdXNlckl0ZW1zLmVxKHBvc2l0aW9uKS5iZWZvcmUoaHRtbFN0cmluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2Uuc2V0VmFycygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUl0ZW0gOiBmdW5jdGlvbiAodGFyZ2V0UG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjtcblxuICAgICAgICAgICAgaWYgKGJhc2UuJGVsZW0uY2hpbGRyZW4oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0UG9zaXRpb24gPT09IHVuZGVmaW5lZCB8fCB0YXJnZXRQb3NpdGlvbiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IC0xO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYXNlLnVuV3JhcCgpO1xuICAgICAgICAgICAgYmFzZS4kdXNlckl0ZW1zLmVxKHBvc2l0aW9uKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGJhc2Uuc2V0VmFycygpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgJC5mbi5vd2xDYXJvdXNlbCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCQodGhpcykuZGF0YShcIm93bC1pbml0XCIpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKFwib3dsLWluaXRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB2YXIgY2Fyb3VzZWwgPSBPYmplY3QuY3JlYXRlKENhcm91c2VsKTtcbiAgICAgICAgICAgIGNhcm91c2VsLmluaXQob3B0aW9ucywgdGhpcyk7XG4gICAgICAgICAgICAkLmRhdGEodGhpcywgXCJvd2xDYXJvdXNlbFwiLCBjYXJvdXNlbCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkLmZuLm93bENhcm91c2VsLm9wdGlvbnMgPSB7XG5cbiAgICAgICAgaXRlbXMgOiA1LFxuICAgICAgICBpdGVtc0N1c3RvbSA6IGZhbHNlLFxuICAgICAgICBpdGVtc0Rlc2t0b3AgOiBbMTE5OSwgNF0sXG4gICAgICAgIGl0ZW1zRGVza3RvcFNtYWxsIDogWzk3OSwgM10sXG4gICAgICAgIGl0ZW1zVGFibGV0IDogWzc2OCwgMl0sXG4gICAgICAgIGl0ZW1zVGFibGV0U21hbGwgOiBmYWxzZSxcbiAgICAgICAgaXRlbXNNb2JpbGUgOiBbNDc5LCAxXSxcbiAgICAgICAgc2luZ2xlSXRlbSA6IGZhbHNlLFxuICAgICAgICBpdGVtc1NjYWxlVXAgOiBmYWxzZSxcblxuICAgICAgICBzbGlkZVNwZWVkIDogMjAwLFxuICAgICAgICBwYWdpbmF0aW9uU3BlZWQgOiA4MDAsXG4gICAgICAgIHJld2luZFNwZWVkIDogMTAwMCxcblxuICAgICAgICBhdXRvUGxheSA6IGZhbHNlLFxuICAgICAgICBzdG9wT25Ib3ZlciA6IGZhbHNlLFxuXG4gICAgICAgIG5hdmlnYXRpb24gOiBmYWxzZSxcbiAgICAgICAgbmF2aWdhdGlvblRleHQgOiBbXCJwcmV2XCIsIFwibmV4dFwiXSxcbiAgICAgICAgcmV3aW5kTmF2IDogdHJ1ZSxcbiAgICAgICAgc2Nyb2xsUGVyUGFnZSA6IGZhbHNlLFxuXG4gICAgICAgIHBhZ2luYXRpb24gOiB0cnVlLFxuICAgICAgICBwYWdpbmF0aW9uTnVtYmVycyA6IGZhbHNlLFxuXG4gICAgICAgIHJlc3BvbnNpdmUgOiB0cnVlLFxuICAgICAgICByZXNwb25zaXZlUmVmcmVzaFJhdGUgOiAyMDAsXG4gICAgICAgIHJlc3BvbnNpdmVCYXNlV2lkdGggOiB3aW5kb3csXG5cbiAgICAgICAgYmFzZUNsYXNzIDogXCJvd2wtY2Fyb3VzZWxcIixcbiAgICAgICAgdGhlbWUgOiBcIm93bC10aGVtZVwiLFxuXG4gICAgICAgIGxhenlMb2FkIDogZmFsc2UsXG4gICAgICAgIGxhenlGb2xsb3cgOiB0cnVlLFxuICAgICAgICBsYXp5RWZmZWN0IDogXCJmYWRlXCIsXG5cbiAgICAgICAgYXV0b0hlaWdodCA6IGZhbHNlLFxuXG4gICAgICAgIGpzb25QYXRoIDogZmFsc2UsXG4gICAgICAgIGpzb25TdWNjZXNzIDogZmFsc2UsXG5cbiAgICAgICAgZHJhZ0JlZm9yZUFuaW1GaW5pc2ggOiB0cnVlLFxuICAgICAgICBtb3VzZURyYWcgOiB0cnVlLFxuICAgICAgICB0b3VjaERyYWcgOiB0cnVlLFxuXG4gICAgICAgIGFkZENsYXNzQWN0aXZlIDogZmFsc2UsXG4gICAgICAgIHRyYW5zaXRpb25TdHlsZSA6IGZhbHNlLFxuXG4gICAgICAgIGJlZm9yZVVwZGF0ZSA6IGZhbHNlLFxuICAgICAgICBhZnRlclVwZGF0ZSA6IGZhbHNlLFxuICAgICAgICBiZWZvcmVJbml0IDogZmFsc2UsXG4gICAgICAgIGFmdGVySW5pdCA6IGZhbHNlLFxuICAgICAgICBiZWZvcmVNb3ZlIDogZmFsc2UsXG4gICAgICAgIGFmdGVyTW92ZSA6IGZhbHNlLFxuICAgICAgICBhZnRlckFjdGlvbiA6IGZhbHNlLFxuICAgICAgICBzdGFydERyYWdnaW5nIDogZmFsc2UsXG4gICAgICAgIGFmdGVyTGF6eUxvYWQ6IGZhbHNlXG4gICAgfTtcbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7IiwiLy8gU21vb3RoU2Nyb2xsIGZvciB3ZWJzaXRlcyB2MS4yLjFcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIGxpY2Vuc2UuXG5cbi8vIFBlb3BsZSBpbnZvbHZlZFxuLy8gIC0gQmFsYXpzIEdhbGFtYm9zaSAobWFpbnRhaW5lcikgIFxuLy8gIC0gTWljaGFlbCBIZXJmICAgICAoUHVsc2UgQWxnb3JpdGhtKVxuXG4oZnVuY3Rpb24oKXtcbiAgXG4vLyBTY3JvbGwgVmFyaWFibGVzICh0d2Vha2FibGUpXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG5cbiAgICAvLyBTY3JvbGxpbmcgQ29yZVxuICAgIGZyYW1lUmF0ZSAgICAgICAgOiAxNTAsIC8vIFtIel1cbiAgICBhbmltYXRpb25UaW1lICAgIDogNDAwLCAvLyBbcHhdXG4gICAgc3RlcFNpemUgICAgICAgICA6IDEyMCwgLy8gW3B4XVxuXG4gICAgLy8gUHVsc2UgKGxlc3MgdHdlYWthYmxlKVxuICAgIC8vIHJhdGlvIG9mIFwidGFpbFwiIHRvIFwiYWNjZWxlcmF0aW9uXCJcbiAgICBwdWxzZUFsZ29yaXRobSAgIDogdHJ1ZSxcbiAgICBwdWxzZVNjYWxlICAgICAgIDogOCxcbiAgICBwdWxzZU5vcm1hbGl6ZSAgIDogMSxcblxuICAgIC8vIEFjY2VsZXJhdGlvblxuICAgIGFjY2VsZXJhdGlvbkRlbHRhIDogMjAsICAvLyAyMFxuICAgIGFjY2VsZXJhdGlvbk1heCAgIDogMSwgICAvLyAxXG5cbiAgICAvLyBLZXlib2FyZCBTZXR0aW5nc1xuICAgIGtleWJvYXJkU3VwcG9ydCAgIDogdHJ1ZSwgIC8vIG9wdGlvblxuICAgIGFycm93U2Nyb2xsICAgICAgIDogNTAsICAgICAvLyBbcHhdXG5cbiAgICAvLyBPdGhlclxuICAgIHRvdWNocGFkU3VwcG9ydCAgIDogdHJ1ZSxcbiAgICBmaXhlZEJhY2tncm91bmQgICA6IHRydWUsIFxuICAgIGV4Y2x1ZGVkICAgICAgICAgIDogXCJcIiAgICBcbn07XG5cbnZhciBvcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG5cblxuLy8gT3RoZXIgVmFyaWFibGVzXG52YXIgaXNFeGNsdWRlZCA9IGZhbHNlO1xudmFyIGlzRnJhbWUgPSBmYWxzZTtcbnZhciBkaXJlY3Rpb24gPSB7IHg6IDAsIHk6IDAgfTtcbnZhciBpbml0RG9uZSAgPSBmYWxzZTtcbnZhciByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIGFjdGl2ZUVsZW1lbnQ7XG52YXIgb2JzZXJ2ZXI7XG52YXIgZGVsdGFCdWZmZXIgPSBbIDEyMCwgMTIwLCAxMjAgXTtcblxudmFyIGtleSA9IHsgbGVmdDogMzcsIHVwOiAzOCwgcmlnaHQ6IDM5LCBkb3duOiA0MCwgc3BhY2ViYXI6IDMyLCBcbiAgICAgICAgICAgIHBhZ2V1cDogMzMsIHBhZ2Vkb3duOiAzNCwgZW5kOiAzNSwgaG9tZTogMzYgfTtcblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIFNFVFRJTkdTXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBvcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBJTklUSUFMSVpFXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qKlxuICogVGVzdHMgaWYgc21vb3RoIHNjcm9sbGluZyBpcyBhbGxvd2VkLiBTaHV0cyBkb3duIGV2ZXJ5dGhpbmcgaWYgbm90LlxuICovXG5mdW5jdGlvbiBpbml0VGVzdCgpIHtcblxuICAgIHZhciBkaXNhYmxlS2V5Ym9hcmQgPSBmYWxzZTsgXG4gICAgXG4gICAgLy8gZGlzYWJsZSBrZXlib2FyZCBzdXBwb3J0IGlmIGFueXRoaW5nIGFib3ZlIHJlcXVlc3RlZCBpdFxuICAgIGlmIChkaXNhYmxlS2V5Ym9hcmQpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnQoXCJrZXlkb3duXCIsIGtleWRvd24pO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmtleWJvYXJkU3VwcG9ydCAmJiAhZGlzYWJsZUtleWJvYXJkKSB7XG4gICAgICAgIGFkZEV2ZW50KFwia2V5ZG93blwiLCBrZXlkb3duKTtcbiAgICB9XG59XG5cbi8qKlxuICogU2V0cyB1cCBzY3JvbGxzIGFycmF5LCBkZXRlcm1pbmVzIGlmIGZyYW1lcyBhcmUgaW52b2x2ZWQuXG4gKi9cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIFxuICAgIGlmICghZG9jdW1lbnQuYm9keSkgcmV0dXJuO1xuXG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgIHZhciB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7IFxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSBib2R5LnNjcm9sbEhlaWdodDtcbiAgICBcbiAgICAvLyBjaGVjayBjb21wYXQgbW9kZSBmb3Igcm9vdCBlbGVtZW50XG4gICAgcm9vdCA9IChkb2N1bWVudC5jb21wYXRNb2RlLmluZGV4T2YoJ0NTUycpID49IDApID8gaHRtbCA6IGJvZHk7XG4gICAgYWN0aXZlRWxlbWVudCA9IGJvZHk7XG4gICAgXG4gICAgaW5pdFRlc3QoKTtcbiAgICBpbml0RG9uZSA9IHRydWU7XG5cbiAgICAvLyBDaGVja3MgaWYgdGhpcyBzY3JpcHQgaXMgcnVubmluZyBpbiBhIGZyYW1lXG4gICAgaWYgKHRvcCAhPSBzZWxmKSB7XG4gICAgICAgIGlzRnJhbWUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZml4ZXMgYSBidWcgd2hlcmUgdGhlIGFyZWFzIGxlZnQgYW5kIHJpZ2h0IHRvIFxuICAgICAqIHRoZSBjb250ZW50IGRvZXMgbm90IHRyaWdnZXIgdGhlIG9ubW91c2V3aGVlbCBldmVudFxuICAgICAqIG9uIHNvbWUgcGFnZXMuIGUuZy46IGh0bWwsIGJvZHkgeyBoZWlnaHQ6IDEwMCUgfVxuICAgICAqL1xuICAgIGVsc2UgaWYgKHNjcm9sbEhlaWdodCA+IHdpbmRvd0hlaWdodCAmJlxuICAgICAgICAgICAgKGJvZHkub2Zmc2V0SGVpZ2h0IDw9IHdpbmRvd0hlaWdodCB8fCBcbiAgICAgICAgICAgICBodG1sLm9mZnNldEhlaWdodCA8PSB3aW5kb3dIZWlnaHQpKSB7XG5cbiAgICAgICAgaHRtbC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgICAgIHNldFRpbWVvdXQocmVmcmVzaCwgMTApO1xuXG4gICAgICAgIC8vIGNsZWFyZml4XG4gICAgICAgIGlmIChyb290Lm9mZnNldEhlaWdodCA8PSB3aW5kb3dIZWlnaHQpIHtcbiAgICAgICAgICAgIHZhciB1bmRlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7IFx0XG4gICAgICAgICAgICB1bmRlcmxheS5zdHlsZS5jbGVhciA9IFwiYm90aFwiO1xuICAgICAgICAgICAgYm9keS5hcHBlbmRDaGlsZCh1bmRlcmxheSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkaXNhYmxlIGZpeGVkIGJhY2tncm91bmRcbiAgICBpZiAoIW9wdGlvbnMuZml4ZWRCYWNrZ3JvdW5kICYmICFpc0V4Y2x1ZGVkKSB7XG4gICAgICAgIGJvZHkuc3R5bGUuYmFja2dyb3VuZEF0dGFjaG1lbnQgPSBcInNjcm9sbFwiO1xuICAgICAgICBodG1sLnN0eWxlLmJhY2tncm91bmRBdHRhY2htZW50ID0gXCJzY3JvbGxcIjtcbiAgICB9XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogU0NST0xMSU5HIFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiBcbnZhciBxdWUgPSBbXTtcbnZhciBwZW5kaW5nID0gZmFsc2U7XG52YXIgbGFzdFNjcm9sbCA9ICtuZXcgRGF0ZTtcblxuLyoqXG4gKiBQdXNoZXMgc2Nyb2xsIGFjdGlvbnMgdG8gdGhlIHNjcm9sbGluZyBxdWV1ZS5cbiAqL1xuZnVuY3Rpb24gc2Nyb2xsQXJyYXkoZWxlbSwgbGVmdCwgdG9wLCBkZWxheSkge1xuICAgIFxuICAgIGRlbGF5IHx8IChkZWxheSA9IDEwMDApO1xuICAgIGRpcmVjdGlvbkNoZWNrKGxlZnQsIHRvcCk7XG5cbiAgICBpZiAob3B0aW9ucy5hY2NlbGVyYXRpb25NYXggIT0gMSkge1xuICAgICAgICB2YXIgbm93ID0gK25ldyBEYXRlO1xuICAgICAgICB2YXIgZWxhcHNlZCA9IG5vdyAtIGxhc3RTY3JvbGw7XG4gICAgICAgIGlmIChlbGFwc2VkIDwgb3B0aW9ucy5hY2NlbGVyYXRpb25EZWx0YSkge1xuICAgICAgICAgICAgdmFyIGZhY3RvciA9ICgxICsgKDMwIC8gZWxhcHNlZCkpIC8gMjtcbiAgICAgICAgICAgIGlmIChmYWN0b3IgPiAxKSB7XG4gICAgICAgICAgICAgICAgZmFjdG9yID0gTWF0aC5taW4oZmFjdG9yLCBvcHRpb25zLmFjY2VsZXJhdGlvbk1heCk7XG4gICAgICAgICAgICAgICAgbGVmdCAqPSBmYWN0b3I7XG4gICAgICAgICAgICAgICAgdG9wICAqPSBmYWN0b3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGFzdFNjcm9sbCA9ICtuZXcgRGF0ZTtcbiAgICB9ICAgICAgICAgIFxuICAgIFxuICAgIC8vIHB1c2ggYSBzY3JvbGwgY29tbWFuZFxuICAgIHF1ZS5wdXNoKHtcbiAgICAgICAgeDogbGVmdCwgXG4gICAgICAgIHk6IHRvcCwgXG4gICAgICAgIGxhc3RYOiAobGVmdCA8IDApID8gMC45OSA6IC0wLjk5LFxuICAgICAgICBsYXN0WTogKHRvcCAgPCAwKSA/IDAuOTkgOiAtMC45OSwgXG4gICAgICAgIHN0YXJ0OiArbmV3IERhdGVcbiAgICB9KTtcbiAgICAgICAgXG4gICAgLy8gZG9uJ3QgYWN0IGlmIHRoZXJlJ3MgYSBwZW5kaW5nIHF1ZXVlXG4gICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gIFxuXG4gICAgdmFyIHNjcm9sbFdpbmRvdyA9IChlbGVtID09PSBkb2N1bWVudC5ib2R5KTtcbiAgICBcbiAgICB2YXIgc3RlcCA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgbm93ID0gK25ldyBEYXRlO1xuICAgICAgICB2YXIgc2Nyb2xsWCA9IDA7XG4gICAgICAgIHZhciBzY3JvbGxZID0gMDsgXG4gICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpdGVtID0gcXVlW2ldO1xuICAgICAgICAgICAgdmFyIGVsYXBzZWQgID0gbm93IC0gaXRlbS5zdGFydDtcbiAgICAgICAgICAgIHZhciBmaW5pc2hlZCA9IChlbGFwc2VkID49IG9wdGlvbnMuYW5pbWF0aW9uVGltZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHNjcm9sbCBwb3NpdGlvbjogWzAsIDFdXG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSAoZmluaXNoZWQpID8gMSA6IGVsYXBzZWQgLyBvcHRpb25zLmFuaW1hdGlvblRpbWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGVhc2luZyBbb3B0aW9uYWxdXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wdWxzZUFsZ29yaXRobSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcHVsc2UocG9zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBvbmx5IG5lZWQgdGhlIGRpZmZlcmVuY2VcbiAgICAgICAgICAgIHZhciB4ID0gKGl0ZW0ueCAqIHBvc2l0aW9uIC0gaXRlbS5sYXN0WCkgPj4gMDtcbiAgICAgICAgICAgIHZhciB5ID0gKGl0ZW0ueSAqIHBvc2l0aW9uIC0gaXRlbS5sYXN0WSkgPj4gMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gYWRkIHRoaXMgdG8gdGhlIHRvdGFsIHNjcm9sbGluZ1xuICAgICAgICAgICAgc2Nyb2xsWCArPSB4O1xuICAgICAgICAgICAgc2Nyb2xsWSArPSB5OyAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyB1cGRhdGUgbGFzdCB2YWx1ZXNcbiAgICAgICAgICAgIGl0ZW0ubGFzdFggKz0geDtcbiAgICAgICAgICAgIGl0ZW0ubGFzdFkgKz0geTtcbiAgICAgICAgXG4gICAgICAgICAgICAvLyBkZWxldGUgYW5kIHN0ZXAgYmFjayBpZiBpdCdzIG92ZXJcbiAgICAgICAgICAgIGlmIChmaW5pc2hlZCkge1xuICAgICAgICAgICAgICAgIHF1ZS5zcGxpY2UoaSwgMSk7IGktLTtcbiAgICAgICAgICAgIH0gICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2Nyb2xsIGxlZnQgYW5kIHRvcFxuICAgICAgICBpZiAoc2Nyb2xsV2luZG93KSB7XG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsQnkoc2Nyb2xsWCwgc2Nyb2xsWSk7XG4gICAgICAgIH0gXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNjcm9sbFgpIGVsZW0uc2Nyb2xsTGVmdCArPSBzY3JvbGxYO1xuICAgICAgICAgICAgaWYgKHNjcm9sbFkpIGVsZW0uc2Nyb2xsVG9wICArPSBzY3JvbGxZOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGNsZWFuIHVwIGlmIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvXG4gICAgICAgIGlmICghbGVmdCAmJiAhdG9wKSB7XG4gICAgICAgICAgICBxdWUgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHF1ZS5sZW5ndGgpIHsgXG4gICAgICAgICAgICByZXF1ZXN0RnJhbWUoc3RlcCwgZWxlbSwgKGRlbGF5IC8gb3B0aW9ucy5mcmFtZVJhdGUgKyAxKSk7IFxuICAgICAgICB9IGVsc2UgeyBcbiAgICAgICAgICAgIHBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLy8gc3RhcnQgYSBuZXcgcXVldWUgb2YgYWN0aW9uc1xuICAgIHJlcXVlc3RGcmFtZShzdGVwLCBlbGVtLCAwKTtcbiAgICBwZW5kaW5nID0gdHJ1ZTtcbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEVWRU5UU1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKipcbiAqIE1vdXNlIHdoZWVsIGhhbmRsZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gd2hlZWwoZXZlbnQpIHtcblxuICAgIGlmICghaW5pdERvbmUpIHtcbiAgICAgICAgaW5pdCgpO1xuICAgIH1cbiAgICBcbiAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgIHZhciBvdmVyZmxvd2luZyA9IG92ZXJmbG93aW5nQW5jZXN0b3IodGFyZ2V0KTtcbiAgICBcbiAgICAvLyB1c2UgZGVmYXVsdCBpZiB0aGVyZSdzIG5vIG92ZXJmbG93aW5nXG4gICAgLy8gZWxlbWVudCBvciBkZWZhdWx0IGFjdGlvbiBpcyBwcmV2ZW50ZWQgICAgXG4gICAgaWYgKCFvdmVyZmxvd2luZyB8fCBldmVudC5kZWZhdWx0UHJldmVudGVkIHx8XG4gICAgICAgIGlzTm9kZU5hbWUoYWN0aXZlRWxlbWVudCwgXCJlbWJlZFwiKSB8fFxuICAgICAgIChpc05vZGVOYW1lKHRhcmdldCwgXCJlbWJlZFwiKSAmJiAvXFwucGRmL2kudGVzdCh0YXJnZXQuc3JjKSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhWCA9IGV2ZW50LndoZWVsRGVsdGFYIHx8IDA7XG4gICAgdmFyIGRlbHRhWSA9IGV2ZW50LndoZWVsRGVsdGFZIHx8IDA7XG4gICAgXG4gICAgLy8gdXNlIHdoZWVsRGVsdGEgaWYgZGVsdGFYL1kgaXMgbm90IGF2YWlsYWJsZVxuICAgIGlmICghZGVsdGFYICYmICFkZWx0YVkpIHtcbiAgICAgICAgZGVsdGFZID0gZXZlbnQud2hlZWxEZWx0YSB8fCAwO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGl0J3MgYSB0b3VjaHBhZCBzY3JvbGwgdGhhdCBzaG91bGQgYmUgaWdub3JlZFxuICAgIGlmICghb3B0aW9ucy50b3VjaHBhZFN1cHBvcnQgJiYgaXNUb3VjaHBhZChkZWx0YVkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIHNjYWxlIGJ5IHN0ZXAgc2l6ZVxuICAgIC8vIGRlbHRhIGlzIDEyMCBtb3N0IG9mIHRoZSB0aW1lXG4gICAgLy8gc3luYXB0aWNzIHNlZW1zIHRvIHNlbmQgMSBzb21ldGltZXNcbiAgICBpZiAoTWF0aC5hYnMoZGVsdGFYKSA+IDEuMikge1xuICAgICAgICBkZWx0YVggKj0gb3B0aW9ucy5zdGVwU2l6ZSAvIDEyMDtcbiAgICB9XG4gICAgaWYgKE1hdGguYWJzKGRlbHRhWSkgPiAxLjIpIHtcbiAgICAgICAgZGVsdGFZICo9IG9wdGlvbnMuc3RlcFNpemUgLyAxMjA7XG4gICAgfVxuICAgIFxuICAgIHNjcm9sbEFycmF5KG92ZXJmbG93aW5nLCAtZGVsdGFYLCAtZGVsdGFZKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG4vKipcbiAqIEtleWRvd24gZXZlbnQgaGFuZGxlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICovXG5mdW5jdGlvbiBrZXlkb3duKGV2ZW50KSB7XG5cbiAgICB2YXIgdGFyZ2V0ICAgPSBldmVudC50YXJnZXQ7XG4gICAgdmFyIG1vZGlmaWVyID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5hbHRLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBcbiAgICAgICAgICAgICAgICAgIChldmVudC5zaGlmdEtleSAmJiBldmVudC5rZXlDb2RlICE9PSBrZXkuc3BhY2ViYXIpO1xuICAgIFxuICAgIC8vIGRvIG5vdGhpbmcgaWYgdXNlciBpcyBlZGl0aW5nIHRleHRcbiAgICAvLyBvciB1c2luZyBhIG1vZGlmaWVyIGtleSAoZXhjZXB0IHNoaWZ0KVxuICAgIC8vIG9yIGluIGEgZHJvcGRvd25cbiAgICBpZiAoIC9pbnB1dHx0ZXh0YXJlYXxzZWxlY3R8ZW1iZWQvaS50ZXN0KHRhcmdldC5ub2RlTmFtZSkgfHxcbiAgICAgICAgIHRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSB8fCBcbiAgICAgICAgIGV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgICB8fFxuICAgICAgICAgbW9kaWZpZXIgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gc3BhY2ViYXIgc2hvdWxkIHRyaWdnZXIgYnV0dG9uIHByZXNzXG4gICAgaWYgKGlzTm9kZU5hbWUodGFyZ2V0LCBcImJ1dHRvblwiKSAmJlxuICAgICAgICBldmVudC5rZXlDb2RlID09PSBrZXkuc3BhY2ViYXIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICB2YXIgc2hpZnQsIHggPSAwLCB5ID0gMDtcbiAgICB2YXIgZWxlbSA9IG92ZXJmbG93aW5nQW5jZXN0b3IoYWN0aXZlRWxlbWVudCk7XG4gICAgdmFyIGNsaWVudEhlaWdodCA9IGVsZW0uY2xpZW50SGVpZ2h0O1xuXG4gICAgaWYgKGVsZW0gPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICBjbGllbnRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgfVxuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2Uga2V5LnVwOlxuICAgICAgICAgICAgeSA9IC1vcHRpb25zLmFycm93U2Nyb2xsO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5LmRvd246XG4gICAgICAgICAgICB5ID0gb3B0aW9ucy5hcnJvd1Njcm9sbDtcbiAgICAgICAgICAgIGJyZWFrOyAgICAgICAgIFxuICAgICAgICBjYXNlIGtleS5zcGFjZWJhcjogLy8gKCsgc2hpZnQpXG4gICAgICAgICAgICBzaGlmdCA9IGV2ZW50LnNoaWZ0S2V5ID8gMSA6IC0xO1xuICAgICAgICAgICAgeSA9IC1zaGlmdCAqIGNsaWVudEhlaWdodCAqIDAuOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGtleS5wYWdldXA6XG4gICAgICAgICAgICB5ID0gLWNsaWVudEhlaWdodCAqIDAuOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGtleS5wYWdlZG93bjpcbiAgICAgICAgICAgIHkgPSBjbGllbnRIZWlnaHQgKiAwLjk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBrZXkuaG9tZTpcbiAgICAgICAgICAgIHkgPSAtZWxlbS5zY3JvbGxUb3A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBrZXkuZW5kOlxuICAgICAgICAgICAgdmFyIGRhbXQgPSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uc2Nyb2xsVG9wIC0gY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgeSA9IChkYW10ID4gMCkgPyBkYW10KzEwIDogMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGtleS5sZWZ0OlxuICAgICAgICAgICAgeCA9IC1vcHRpb25zLmFycm93U2Nyb2xsO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5LnJpZ2h0OlxuICAgICAgICAgICAgeCA9IG9wdGlvbnMuYXJyb3dTY3JvbGw7XG4gICAgICAgICAgICBicmVhazsgICAgICAgICAgICBcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBhIGtleSB3ZSBkb24ndCBjYXJlIGFib3V0XG4gICAgfVxuXG4gICAgc2Nyb2xsQXJyYXkoZWxlbSwgeCwgeSk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn1cblxuLyoqXG4gKiBNb3VzZWRvd24gZXZlbnQgb25seSBmb3IgdXBkYXRpbmcgYWN0aXZlRWxlbWVudFxuICovXG5mdW5jdGlvbiBtb3VzZWRvd24oZXZlbnQpIHtcbiAgICBhY3RpdmVFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogT1ZFUkZMT1dcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiBcbnZhciBjYWNoZSA9IHt9OyAvLyBjbGVhcmVkIG91dCBldmVyeSBvbmNlIGluIHdoaWxlXG5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7IGNhY2hlID0ge307IH0sIDEwICogMTAwMCk7XG5cbnZhciB1bmlxdWVJRCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIHJldHVybiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgcmV0dXJuIGVsLnVuaXF1ZUlEIHx8IChlbC51bmlxdWVJRCA9IGkrKyk7XG4gICAgfTtcbn0pKCk7XG5cbmZ1bmN0aW9uIHNldENhY2hlKGVsZW1zLCBvdmVyZmxvd2luZykge1xuICAgIGZvciAodmFyIGkgPSBlbGVtcy5sZW5ndGg7IGktLTspXG4gICAgICAgIGNhY2hlW3VuaXF1ZUlEKGVsZW1zW2ldKV0gPSBvdmVyZmxvd2luZztcbiAgICByZXR1cm4gb3ZlcmZsb3dpbmc7XG59XG5cbmZ1bmN0aW9uIG92ZXJmbG93aW5nQW5jZXN0b3IoZWwpIHtcbiAgICB2YXIgZWxlbXMgPSBbXTtcbiAgICB2YXIgcm9vdFNjcm9sbEhlaWdodCA9IHJvb3Quc2Nyb2xsSGVpZ2h0O1xuICAgIGRvIHtcbiAgICAgICAgdmFyIGNhY2hlZCA9IGNhY2hlW3VuaXF1ZUlEKGVsKV07XG4gICAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXRDYWNoZShlbGVtcywgY2FjaGVkKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtcy5wdXNoKGVsKTtcbiAgICAgICAgaWYgKHJvb3RTY3JvbGxIZWlnaHQgPT09IGVsLnNjcm9sbEhlaWdodCkge1xuICAgICAgICAgICAgaWYgKCFpc0ZyYW1lIHx8IHJvb3QuY2xpZW50SGVpZ2h0ICsgMTAgPCByb290U2Nyb2xsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENhY2hlKGVsZW1zLCBkb2N1bWVudC5ib2R5KTsgLy8gc2Nyb2xsaW5nIHJvb3QgaW4gV2ViS2l0XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuY2xpZW50SGVpZ2h0ICsgMTAgPCBlbC5zY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgIG92ZXJmbG93ID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCwgXCJcIikuZ2V0UHJvcGVydHlWYWx1ZShcIm92ZXJmbG93LXlcIik7XG4gICAgICAgICAgICBpZiAob3ZlcmZsb3cgPT09IFwic2Nyb2xsXCIgfHwgb3ZlcmZsb3cgPT09IFwiYXV0b1wiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENhY2hlKGVsZW1zLCBlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IHdoaWxlIChlbCA9IGVsLnBhcmVudE5vZGUpO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogSEVMUEVSU1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5mdW5jdGlvbiBhZGRFdmVudCh0eXBlLCBmbiwgYnViYmxlKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIChidWJibGV8fGZhbHNlKSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50KHR5cGUsIGZuLCBidWJibGUpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgKGJ1YmJsZXx8ZmFsc2UpKTsgIFxufVxuXG5mdW5jdGlvbiBpc05vZGVOYW1lKGVsLCB0YWcpIHtcbiAgICByZXR1cm4gKGVsLm5vZGVOYW1lfHxcIlwiKS50b0xvd2VyQ2FzZSgpID09PSB0YWcudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gZGlyZWN0aW9uQ2hlY2soeCwgeSkge1xuICAgIHggPSAoeCA+IDApID8gMSA6IC0xO1xuICAgIHkgPSAoeSA+IDApID8gMSA6IC0xO1xuICAgIGlmIChkaXJlY3Rpb24ueCAhPT0geCB8fCBkaXJlY3Rpb24ueSAhPT0geSkge1xuICAgICAgICBkaXJlY3Rpb24ueCA9IHg7XG4gICAgICAgIGRpcmVjdGlvbi55ID0geTtcbiAgICAgICAgcXVlID0gW107XG4gICAgICAgIGxhc3RTY3JvbGwgPSAwO1xuICAgIH1cbn1cblxudmFyIGRlbHRhQnVmZmVyVGltZXI7XG5cbmZ1bmN0aW9uIGlzVG91Y2hwYWQoZGVsdGFZKSB7XG4gICAgaWYgKCFkZWx0YVkpIHJldHVybjtcbiAgICBkZWx0YVkgPSBNYXRoLmFicyhkZWx0YVkpXG4gICAgZGVsdGFCdWZmZXIucHVzaChkZWx0YVkpO1xuICAgIGRlbHRhQnVmZmVyLnNoaWZ0KCk7XG4gICAgY2xlYXJUaW1lb3V0KGRlbHRhQnVmZmVyVGltZXIpO1xuXG4gICAgdmFyIGFsbEVxdWFscyAgICA9IChkZWx0YUJ1ZmZlclswXSA9PSBkZWx0YUJ1ZmZlclsxXSAmJiBcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhQnVmZmVyWzFdID09IGRlbHRhQnVmZmVyWzJdKTtcbiAgICB2YXIgYWxsRGl2aXNhYmxlID0gKGlzRGl2aXNpYmxlKGRlbHRhQnVmZmVyWzBdLCAxMjApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0RpdmlzaWJsZShkZWx0YUJ1ZmZlclsxXSwgMTIwKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgaXNEaXZpc2libGUoZGVsdGFCdWZmZXJbMl0sIDEyMCkpO1xuICAgIHJldHVybiAhKGFsbEVxdWFscyB8fCBhbGxEaXZpc2FibGUpO1xufSBcblxuZnVuY3Rpb24gaXNEaXZpc2libGUobiwgZGl2aXNvcikge1xuICAgIHJldHVybiAoTWF0aC5mbG9vcihuIC8gZGl2aXNvcikgPT0gbiAvIGRpdmlzb3IpO1xufVxuXG52YXIgcmVxdWVzdEZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fCBcbiAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcbiAgICAgICAgICAgICAgZnVuY3Rpb24gKGNhbGxiYWNrLCBlbGVtZW50LCBkZWxheSkge1xuICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIGRlbGF5IHx8ICgxMDAwLzYwKSk7XG4gICAgICAgICAgICAgIH07XG59KSgpO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogUFVMU0VcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiBcbi8qKlxuICogVmlzY291cyBmbHVpZCB3aXRoIGEgcHVsc2UgZm9yIHBhcnQgYW5kIGRlY2F5IGZvciB0aGUgcmVzdC5cbiAqIC0gQXBwbGllcyBhIGZpeGVkIGZvcmNlIG92ZXIgYW4gaW50ZXJ2YWwgKGEgZGFtcGVkIGFjY2VsZXJhdGlvbiksIGFuZFxuICogLSBMZXRzIHRoZSBleHBvbmVudGlhbCBibGVlZCBhd2F5IHRoZSB2ZWxvY2l0eSBvdmVyIGEgbG9uZ2VyIGludGVydmFsXG4gKiAtIE1pY2hhZWwgSGVyZiwgaHR0cDovL3N0ZXJlb3BzaXMuY29tL3N0b3BwaW5nL1xuICovXG5mdW5jdGlvbiBwdWxzZV8oeCkge1xuICAgIHZhciB2YWwsIHN0YXJ0LCBleHB4O1xuICAgIC8vIHRlc3RcbiAgICB4ID0geCAqIG9wdGlvbnMucHVsc2VTY2FsZTtcbiAgICBpZiAoeCA8IDEpIHsgLy8gYWNjZWxlYXJ0aW9uXG4gICAgICAgIHZhbCA9IHggLSAoMSAtIE1hdGguZXhwKC14KSk7XG4gICAgfSBlbHNlIHsgICAgIC8vIHRhaWxcbiAgICAgICAgLy8gdGhlIHByZXZpb3VzIGFuaW1hdGlvbiBlbmRlZCBoZXJlOlxuICAgICAgICBzdGFydCA9IE1hdGguZXhwKC0xKTtcbiAgICAgICAgLy8gc2ltcGxlIHZpc2NvdXMgZHJhZ1xuICAgICAgICB4IC09IDE7XG4gICAgICAgIGV4cHggPSAxIC0gTWF0aC5leHAoLXgpO1xuICAgICAgICB2YWwgPSBzdGFydCArIChleHB4ICogKDEgLSBzdGFydCkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsICogb3B0aW9ucy5wdWxzZU5vcm1hbGl6ZTtcbn1cblxuZnVuY3Rpb24gcHVsc2UoeCkge1xuICAgIGlmICh4ID49IDEpIHJldHVybiAxO1xuICAgIGlmICh4IDw9IDApIHJldHVybiAwO1xuXG4gICAgaWYgKG9wdGlvbnMucHVsc2VOb3JtYWxpemUgPT0gMSkge1xuICAgICAgICBvcHRpb25zLnB1bHNlTm9ybWFsaXplIC89IHB1bHNlXygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHB1bHNlXyh4KTtcbn1cblxudmFyIGlzQ2hyb21lID0gL2Nocm9tZS9pLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpO1xudmFyIGlzTW91c2VXaGVlbFN1cHBvcnRlZCA9ICdvbm1vdXNld2hlZWwnIGluIGRvY3VtZW50OyBcblxuaWYgKGlzTW91c2VXaGVlbFN1cHBvcnRlZCAmJiBpc0Nocm9tZSkge1xuXHRhZGRFdmVudChcIm1vdXNlZG93blwiLCBtb3VzZWRvd24pO1xuXHRhZGRFdmVudChcIm1vdXNld2hlZWxcIiwgd2hlZWwpO1xuXHRhZGRFdmVudChcImxvYWRcIiwgaW5pdCk7XG59O1xuXG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
