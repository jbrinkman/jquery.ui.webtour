// 
// jQuery.UI.Webtour 
// Copyright (c) 2002-2011
// by DotNetNuke Corporation
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions 
// of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
// TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
// DEALINGS IN THE SOFTWARE.
//

(function ( $ ) {

	var webtourClasses = {
		firstPage: 'ui-webtour-first',
		lastPage: 'ui-webtour-last',
		page: 'ui-webtour',
		prevButton: 'ui-webtour-previous',
		nextButton: 'ui-webtour-next',
		endButton: 'ui-webtour-end',
		active: 'ui-webtour-active',
		buttonSet: 'ui-webtour-buttonset',
		button: 'ui-webtour-button',
		arrowImage: 'ui-webtour-arrow',
		primaryAction: 'ui-webtour-PrimaryAction',
		secondaryAction: 'ui-webtour-SecondaryAction'
	};

	$.widget( "ui.webtour", {
		options: {
			autoStart: true,
			prevButton: 'Previous',
			nextButton: 'Next',
			stopButton: 'End Tour',
			arrowTemplate: '<div />',
			dialogOptions: {
				autoOpen: false,
				resizable: false,
				draggable: true,
				buttons: {},
				close: function () {
					$( ".ui-webtour-arrow" ).css( { left: '0', top: '0' } ).hide();
					var widget = $( this ).data( "ui-webtour-instance" );
					if ( widget ) {
						widget._isOpen = false;
					}
				}
			},
			pageOptions: {
				defaults: {
					position: { my: 'center center', at: 'center center', of: window },
					arrow: null,
					arrowPosition: null,
					showPrevious: true,
					showNext: true,
					showEnd: true,
					title: 'jQuery Web Tour',
					dialogOptions: {}
				}
			}

		},

		_create: function () {

			var self = this,
				o = self.options,
				el = self.element;

			this.pages = $( [] );

			el.children()
				.first().addClass( webtourClasses.firstPage ).end()
                .last().addClass( webtourClasses.lastPage ).end()
				.each( function () {
					var $this = $( this ),
                    pageData = self._getPageData( $this ),
                    attrTitle = $this.attr( 'title' ),
                    dialogOpts = $.extend( {}, o.dialogOptions ),
                    optButtons = [];

					// Merge the dialog title information
					if ( pageData.title ) {
						$.extend( dialogOpts, { 'title': pageData.title } );
					}
					if ( attrTitle ) {
						$.extend( dialogOpts, { 'title': attrTitle } );
					}

					// Calculate the appropriate buttons to show on each dialog
					if ( pageData.showPrevious && !$this.hasClass( webtourClasses.firstPage ) ) {
						optButtons[optButtons.length] = {
							text: o.prevButton,
							click: function () {
								if ( !$this.hasClass( webtourClasses.firstPage ) ) {
									self.show( self.pages.eq( self.pages.index( $this ) - 1 ) );
								}
							}
						};
					}
					if ( pageData.showNext && !$this.hasClass( webtourClasses.lastPage ) ) {
						optButtons[optButtons.length] = {
							text: o.nextButton,
							click: function () {
								if ( !$this.hasClass( webtourClasses.lastPage ) ) {
									self.show( self.pages.eq( self.pages.index( $this ) + 1 ) );
								}
							}
						};
					}
					if ( pageData.showEnd ) {
						optButtons[optButtons.length] = {
							text: o.stopButton,
							click: function () {
								self.hide( $this );
								self.pages.removeClass( webtourClasses.active );
								self._trigger( "end" );
							}
						};
					}

					if ( optButtons.length > 0 ) {
						$.extend( dialogOpts, { buttons: optButtons } );
					}

					$this.dialog( $.extend({}, dialogOpts, pageData.dialogOptions) )
						.dialog( 'widget' )
						.find( '.ui-dialog-buttonset' )
						.addClass( webtourClasses.buttonSet )
						.find( '.ui-button' )
						.addClass( webtourClasses.button )
						.not( ':contains(' + o.stopButton + ')' )
						.addClass( webtourClasses.primaryAction );
					$this.dialog( 'widget' )
						.find( '.ui-button:contains(' + o.stopButton + ')' )
						.addClass( webtourClasses.secondaryAction);
					
					if ( pageData.arrow && pageData.arrowPosition ) {
						$( o.arrowTemplate )
							.appendTo( 'body' )
							.addClass( pageData.arrow )
							.addClass( webtourClasses.arrowImage )
							.addClass( webtourClasses.arrowImage + '-' + self.pages.length )
							.hide();
					}

					self.pages = self.pages.add( $this.addClass( webtourClasses.page ) );

				} );

			self._isOpen = false;
		},

		_init: function () {
			if ( this.options.autoStart ) {
				this.show();
			}
		},

		destroy: function () {

		},

		_getActivePage: function ( $page ) {
			var $activePage = $page || this.pages.filter( '.' + webtourClasses.active ).first(),
			ui = this.getUI( null );
			if ( !$activePage.length ) {
				if ( this._trigger( "loadActivePage", null, ui ) ) {
					$activePage = ui.savedPage || this.pages.filter( '.' + webtourClasses.firstPage ).first();
				}
			}
			return $activePage;
		},

		_getPageData: function ( $page ) {
			return $.extend( {}, this.options.pageOptions.defaults, this.options.pageOptions[$page[0].id] );
		},

		hide: function ( $page ) {
			var $activePage = this._getActivePage( $page ),
			ui = this.getUI( $activePage, this.pages.index( $activePage ) );
			if ( false === this._trigger( "beforeHide", null, ui ) ) {
				return false;
			}
			if ( $activePage ) {
				$activePage.dialog( 'close' );
			}
			this._isOpen = false;
			this._trigger( "hide", null, ui );
		},

		isOpen: function () {
			return this._isOpen;
		},

		show: function ( $page ) {

			var $activePage = this._getActivePage( $page ),
            pageData = this._getPageData( $activePage ),
			ui = this.getUI( $activePage, this.pages.index( $activePage ) ),
			arrowPosition = pageData.arrowPosition,
			$dialog;

			if ( false === this._trigger( "beforeShow", null, ui ) ) {
				return;
			}
			if ( this._isOpen && this.hide() === false ) {
				return;
			};

			$dialog = $activePage
                .data( 'ui-webtour-instance', this )
				.dialog( 'open' )
                .dialog( 'widget' )
				.position( pageData.position );

			if ( pageData.arrow && pageData.arrowPosition ) {
				if ( pageData.arrowPosition.of === 'dialog' ) {
					arrowPosition.of = $dialog;
				}
				$( '.' + webtourClasses.arrowImage + '-' + this.pages.index( $activePage ) )
					.show()
					.position( arrowPosition )
					.css({zIndex: parseInt( $dialog.css('zIndex') ) + 10}); 
				}

			this.pages.removeClass( webtourClasses.active );
			$activePage.addClass( webtourClasses.active );
			this._isOpen = true;
			this._trigger( "saveActivePage", null, ui )
			this._trigger( "show", null, ui );
		},

		_setOption: function ( option, value ) {
			$.Widget.prototype._setOption.apply( this, arguments );

		},

		getUI: function ( page ) {
			page = ( typeof page === "string" ) ? $( page ) : page;

			return {
				page: page,
				index: page ? this.pages.index( page ) : null
			};
		}

	} );

	$.extend( $.ui.webtour, {
		version: "1.0.0"
	} );

} )( jQuery );