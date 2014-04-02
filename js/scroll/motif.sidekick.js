(function ( $, window, document, LB, undefined ) {

    "use strict";

    var StickySide = function ( elem ) {
            
            // Init Vars
            this.$elem = $( elem );
            this.elem = this.$elem[0];
        },
        $document = $( document );

    StickySide.counter = 0;

    StickySide.prototype = {
        "defaults": {
            "context": false,
            "stickyClass": "is-sticky",
            "stuckClass": "was-sticky",
            "topOffset": null,
            "bottomOffset": null,
            "keepWidth": true,
            "minWidth": false,
            "window": $( window )
        },

        "init": function ( userOptions ) {
            if ( !this.$elem.length ) {
                return;
            }

            this.initVars.call( this, userOptions );
            this.bindEvents.call( this );
            this.buildEvents.call( this );
            this.initScrollFire.call( this );
            StickySide.counter += 1;

            return this;
        },

            "initVars": function ( userOptions ) {
                this.config = userOptions;
                this.metadata = this.$elem.data("sticky-side-options");
                this.options = $.extend( true, {}, this.defaults, this.config, this.metadata );

                if ( this.options.context ) {
                    this.$context = this.options.context;
                } else {
                    this.$context = this.$elem.parent();
                }

                this.identity = this.$elem.attr("id") || "sticky-side-" + StickySide.counter;
                this.$window = this.options.window;
                this.scrollFireEvents = [];
            },

            "bindEvents": function () {
                var self = this;

                $document.on("sticky-side/" + self.identity + "/top", function onStickyTop ( event, dir ) {
                    self.topEvent.call( self, dir );
                });

                $document.on("sticky-side/" + self.identity + "/bottom", function onStickyBottom ( event, dir ) {
                    self.bottomEvent.call( self, dir );
                });
            },

            "buildEvents": function () {
                var self = this,
                    topObject = {
                        "trigger": function () {
                            return self.getTopPosition.call( self );
                        },
                        "event": function ( dir ) {
                            $document.trigger( "sticky-side/" + self.identity + "/top", [ dir ] );
                        },
                        "repeat": true
                    },
                    bottomObject = {
                        "trigger": function () {
                            return self.getBottomPosition.call( self );
                        },
                        "event": function ( dir ) {
                            $document.trigger( "sticky-side/" + self.identity + "/bottom", [ dir ] );
                        },
                        "repeat": true
                    };

                self.scrollFireEvents.push( topObject, bottomObject );

                return self.scrollFireEvents;
            },

                "getTopPosition": function () {
                    if ( typeof this.options.topOffset === "function" ) {
                        return this.options.topOffset.call( this );
                    } else {
                        return this.$context.offset().top;
                    }
                },

                "topEvent": function ( dir ) {

                    var sideWidth = this.options.keepWidth ? this.$elem.outerWidth() : false;

                    if ( this.options.minWidth && this.$window.width() >= this.options.minWidth ) {
                        if ( dir === "down" ) {
                            this.stick.call( this, sideWidth );
                        } else if ( dir === "up" ) {
                            this.unstick.call( this );
                        }
                    } else {
                        this.unstick.call( this );
                    }
                },

                "getBottomPosition": function () {
                    if ( typeof this.options.bottomOffset === "function" ) {
                        return this.options.bottomOffset.call( this );
                    } else {
                        return this.$context.offset().top + this.$context.outerHeight() - this.$elem.outerHeight();
                    }
                },

                "bottomEvent": function ( dir ) {

                    var sideWidth = this.options.keepWidth ? this.$elem.outerWidth() : false;

                    if ( this.options.minWidth && this.$window.width() >= this.options.minWidth ) {
                        if ( dir === "up" ) {
                            this.stick.call( this, sideWidth );
                        } else if ( dir === "down" ) {
                            this.stuck.call( this );
                        }
                    } else {
                        this.unstick.call( this );
                    }
                },

                    "stick": function ( sideWidth ) {
                        if ( sideWidth ) {
                            this.$elem.outerWidth( sideWidth );
                        }

                        this.$context.addClass( this.options.stickyClass );
                        this.$elem.removeClass( this.options.stuckClass ).addClass( this.options.stickyClass );
                    },

                    "unstick": function () {
                        this.$context.removeClass( this.options.stickyClass );
                        this.$elem.removeAttr("style").removeClass( this.options.stuckClass + " " + this.options.stickyClass );
                    },

                    "stuck": function () {
                        this.$elem.removeAttr("style").removeClass( this.options.stickyClass ).addClass( this.options.stuckClass );
                    },

            "initScrollFire": function () {
                var self = this;

                self.$context.plugin("scrollFire", {
                    "window": this.$window,
                    "events": self.scrollFireEvents
                });
            }
    };

    StickySide.defaults = StickySide.prototype.defaults;

    LB.apps.StickySide = StickySide;

}( jQuery, window, document, window.LB = window.LB || {
    "utils": {},
    "apps": {}
} ) );

$.createPlugin( "stickySide", window.LB.apps.StickySide );