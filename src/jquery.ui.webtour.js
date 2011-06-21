(function ( $, undefined ) {

	var webtourClasses = {
		firstPage: 'ui-webtour-first',
		lastPage: 'ui-webtour-last',
		page: 'ui-webtour',
		prevButton: 'ui-webtour-previous',
		nextButton: 'ui-webtour-next',
		endButton: 'ui-webtour-end',
		active: 'ui-webtour-active'
	};

	$.widget( "ui.webtour", {
		options: {
			autoStart: true,
			prevButton: 'Previous',
			nextButton: 'Next',
			stopButton: 'End Tour',
			arrowImage: '<div id="jTourArrow" class="arrow" />',
			dialogOptions: {
				autoOpen: false,
				dialogClass: "dnnFormPopup",
				resizable: false,
				draggable: true,
				buttons: {}
			},
			pageOptions: {
				defaults: {
					position: { my: 'center center', at: 'center center', of: window },
					arrow: 'none',
					showPrevious: true,
					showNext: true,
					showEnd: true,
					title: 'jQuery Web Tour'
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
							}
						};
					}

					if ( optButtons.length > 0 ) {
						$.extend( dialogOpts, { buttons: optButtons } );
					}

					$this.dialog( dialogOpts );
					
					self.pages = self.pages.add( $this.addClass( webtourClasses.page ) );

				} );

		},

		_init: function () {
			if ( this.options.autoStart ) {
				this.show();
			}
		},

		destroy: function () {

		},

		_getActivePage: function ( $page ) {
			var $activePage = $page || this.pages.filter( '.' + webtourClasses.active ).first();
			if (!$activePage.length) {
				$activePage = this.pages.filter( '.' + webtourClasses.firstPage ).first()
			}
			return $activePage;
		},

		_getPageData: function ( $page ) {
			return $.extend( {}, this.options.pageOptions.defaults, this.options.pageOptions[$page[0].id] );
		},

		hide: function ( $page ) {
			var $activePage = this._getActivePage( $page ),
			ui = this._ui( $activePage, this.pages.index($activePage) );
			this._trigger( "beforeHide", null, ui );
			if ( $activePage ) {
				$activePage.dialog( 'close' );
			}
			this._trigger( "Hide", null, ui);
		},

		show: function ( $page ) {

			var $activePage = this._getActivePage( $page ),
            pageData = this._getPageData( $activePage ),
			ui = this._ui( $activePage, this.pages.index($activePage) ) ;

			this._trigger( "beforeShow", null, ui);
			if (false === self._trigger('beforeClose', event)) {
				return;
			}
			this.hide();

			$activePage
                .dialog( 'open' )
                .dialog( 'widget' )
                .position( pageData.position );

			this.pages.removeClass( webtourClasses.active );
			$activePage.addClass( webtourClasses.active );
			this._trigger( "show", null, ui );
		},

		_setOption: function ( option, value ) {
			$.Widget.prototype._setOption.apply( this, arguments );

		},

		_ui: function( page ) {
			return {
				page: page,
				index: this.pages.index( page )
			};
		}

	} );

	$.extend( $.ui.webtour, {
		version: "0.9.0"
	} );

} )( jQuery );