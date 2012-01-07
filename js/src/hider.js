/*jslint browser: true */
/*global ajaxurl, jQuery, userSettings, WidgetsWidgets */


(function ($) {
	'use strict';

	var classes = {
			hide: 'widgets-widgets-hide',
			unhide: 'widgets-widgets-unhide',
			hideHiddenWidgets: 'widgets-widgets-hide-hidden-widgets',
			showHiddenWidgets: 'widgets-widgets-show-hidden-widgets'
		},
		selectors,
		ajaxDefaultArgs = {
			type: 'POST',
			url: ajaxurl,
			data: {
				action: 'widgets_widgets',
				agent: 'hider',
				nonce: WidgetsWidgets.nonce,
				uid: userSettings.uid
			}
		},
		idRe = /widget-\d+_([\w\-]+)-__i__/,
		l10n = WidgetsWidgets.l10n,
		$widgetList,
		init,
		setup,
		restore,
		onHide,
		onUnhide,
		onShowHiddenWidgets,
		onHideHiddenWidgets;

	selectors = $.extend({}, classes);
	$.each(classes, function (key, value) {
		selectors[key] = '.' + value;
	});

	init = function () {
		setup();
		restore();
	};

	setup = function () {
		var $availableWidgets = $('#available-widgets');

		$widgetList = $('#widget-list');

		$('<a/>', {
			'class': classes.hide,
			text: l10n.hide
		}).prependTo('#widget-list .widget-title');

		$widgetList.on('click', selectors.hide, onHide);
		$widgetList.on('click', selectors.unhide, onUnhide);
		$availableWidgets
			.on('click', selectors.showHiddenWidgets, onShowHiddenWidgets);
		$availableWidgets
			.on('click', selectors.hideHiddenWidgets, onHideHiddenWidgets);
	};

	restore = function () {
		var hiddenWidgets = WidgetsWidgets.data.hidden_widgets || [],
			tmp;

		// Disable ajax temporary, which should not send while restoring
		tmp = $.ajaxQueue;

		$.ajaxQueue = function () {};
		$('#widget-list > .widget').each(function () {
			var $this = $(this),
				baseId = idRe.exec($this.attr('id'))[1];
			if ($.inArray(baseId, hiddenWidgets) > -1) {
				$this.find(selectors.hide).click();
			}
		});

		$.ajaxQueue = tmp;
	};

	onHide = function () {
		var $this = $(this),
			$widget = $this.closest('.widget'),
			noShowHiddenButton,
			noHideHiddenButton,
			ajaxArgs = $.extend(true, {}, ajaxDefaultArgs);

		noShowHiddenButton = $(selectors.showHiddenWidgets).length === 0;
		noHideHiddenButton = $(selectors.hideHiddenWidgets).length === 0;

		$this
			.removeClass(classes.hide)
			.addClass(classes.unhide)
			.text(l10n.unhide);

		if (noHideHiddenButton) {
			$widget.hide();
		}

		if (noShowHiddenButton && noHideHiddenButton) {
			$('<a/>', {
				'class': classes.showHiddenWidgets,
				text: l10n.showHiddenWidgets
			}).appendTo($('#widget-list').parent());
		}

		ajaxArgs.data.state = 'hide';
		ajaxArgs.data.widgetId = idRe.exec($widget.attr('id'))[1];
		$.ajaxQueue(ajaxArgs);
	};

	onUnhide = function () {
		var $this = $(this),
			$widget = $this.closest('.widget'),
			ajaxArgs = $.extend(true, {}, ajaxDefaultArgs);

		$(this)
			.removeClass(classes.unhide)
			.addClass(classes.hide)
			.text(l10n.hide);

		$widget.show();

		if ($(selectors.unhide).length === 0) {
			$(selectors.hideHiddenWidgets).remove();
		}

		ajaxArgs.data.state = 'unhide';
		ajaxArgs.data.widgetId = idRe.exec($widget.attr('id'))[1];
		$.ajaxQueue(ajaxArgs);
	};

	onShowHiddenWidgets = function () {
		$(this)
			.removeClass(classes.showHiddenWidgets)
			.addClass(classes.hideHiddenWidgets)
			.text(l10n.hideHiddenWidgets);

		$widgetList.children('.widget:hidden').show();
	};

	onHideHiddenWidgets = function () {
		$(this)
			.removeClass(classes.hideHiddenWidgets)
			.addClass(classes.showHiddenWidgets)
			.text(l10n.showHiddenWidgets);

		$widgetList.find(selectors.unhide).closest('.widget').hide();
	};

	WidgetsWidgets.hider = {
		init: init
	};

	$(document).ready(WidgetsWidgets.hider.init);

}(jQuery));
