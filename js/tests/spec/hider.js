/*global ajaxurl, jQuery, userSettings, WidgetsWidgets, wpWidgets */
/*global jasmine, beforeEach, describe, expect, it, loadFixtures, spyOn */


describe('hider', function () {
	'use strict';

	var $ = jQuery,
		ajax_expection = {
			type: 'POST',
			url: ajaxurl,
			data: {
				action: 'widgets_widgets',
				agent: 'hider',
				nonce: WidgetsWidgets.nonce,
				uid: userSettings.uid
			}
		},
		selectors = {
			hide: '.widgets-widgets-hide',
			unhide: '.widgets-widgets-unhide',
			hideHiddenWidgets: '.widgets-widgets-hide-hidden-widgets',
			showHiddenWidgets: '.widgets-widgets-show-hidden-widgets'
		},
		l10n = WidgetsWidgets.l10n;

	function expectShowHiddenWidgetsButtonToExist() {
		var $target = $('#widget-list')
			.next('.clear') // Should place after this
			.next(selectors.showHiddenWidgets);
		expect($target).toExist();
		expect($target).toHaveText(l10n.showHiddenWidgets);
	}

	function setup() {
		loadFixtures('hider.html');
		wpWidgets.init();
		WidgetsWidgets.hider.init();
	}

	beforeEach(setup);

	it('restores states', function () {
		spyOn($, 'ajaxQueue');
		WidgetsWidgets.data.hidden_widgets = [
			'archives', 'calendar'
		];
		jasmine.getFixtures().cleanUp();
		setup();

		expect($('#widget-1_archives-__i__')).toBeHidden();
		expect($('#widget-2_calendar-__i__')).toBeHidden();
		expect($('#widget-3_categories-__i__')).toBeVisible();

		WidgetsWidgets.data.hidden_widgets = [];

		expectShowHiddenWidgetsButtonToExist();

		expect($.ajaxQueue).not.toHaveBeenCalled();
	});

	it('adds "Hide" buttons to the available widgets', function () {
		var $targets = $('#widget-list .widget-title').find(selectors.hide);
		expect($targets).toExist(selectors.hide);
		$.each($targets, function (index, target) {
			expect($(target)).toHaveText(l10n.hide);
		});
	});

	describe('when click the "Hide" button', function () {
		var $widget,
			$title;

		beforeEach(function () {
			spyOn($, 'ajaxQueue');
			$widget = $('#widget-1_archives-__i__');
			$title = $widget.find('.widget-title');
			$title.find(selectors.hide).click();
		});

		it('changes the button to "Unhide"', function () {
			var $unhide = $title.find(selectors.unhide);
			expect($title).not.toContain(selectors.hide);
			expect($unhide).toExist();
			expect($unhide).toHaveText(l10n.unhide);
		});
		it('hides the widget', function () {
			expect($widget).toBeHidden();
		});
		it('sends ajax', function () {
			expect($.ajaxQueue).toHaveBeenCalledWith(
				$.extend(true, {}, ajax_expection, { data: {
					state: 'hide',
					widgetId: 'archives'
				}})
			);
		});
		it('adds a "Show Hidden Widgets" button if not exists', function () {
			expectShowHiddenWidgetsButtonToExist();
			$('#widget-2_calendar-__i__').find(selectors.hide).click();
			expect($(selectors.showHiddenWidgets).length).toEqual(1);
		});
	});

	describe('when click the "Show Hidden Widgets" button', function () {
		var showHiddenButton = selectors.showHiddenWidgets,
			hideHiddenButton = selectors.hideHiddenWidgets,
			hiddenWidgets;

		beforeEach(function () {
			spyOn($, 'ajaxQueue');
			hiddenWidgets = [
				$('#widget-1_archives-__i__'),
				$('#widget-2_calendar-__i__')
			];
			$.each(hiddenWidgets, function (index, $widget) {
				$widget.find(selectors.hide).click();
			});
			$(showHiddenButton).click();
		});

		it('changes the button to "Hide Hidden Widgets"', function () {
			var $container = $('#widget-list').parent(),
				$hideHiddenButton = $container.find(hideHiddenButton);
			expect($container).not.toContain(showHiddenButton);
			expect($hideHiddenButton).toExist();
			expect($hideHiddenButton).toHaveText(l10n.hideHiddenWidgets);
		});
		it('shows the hidden widgets', function () {
			$.each(hiddenWidgets, function (index, $widget) {
				expect($widget).toBeVisible();
			});
		});

		describe('when click the "Hide" button', function () {
			var $widget,
				$title;

			beforeEach(function () {
				$widget = $('#widget-3_categories-__i__');
				$title = $widget.find('.widget-title');
				$title.find(selectors.hide).click();
			});
			it('not hides the widget', function () {
				expect($widget).toBeVisible();
			});
			it('not adds the "Show Hidden Widgets" button', function () {
				expect($(selectors.showHiddenWidgets)).not.toExist();
			});
		});

		describe('when click the "Unhide" button', function () {
			var $title;

			beforeEach(function () {
				$title = $('#widget-1_archives-__i__ .widget-title');
				$title.find(selectors.unhide).click();
			});

			it('changes the button to "Hide"', function () {
				var $hide = $title.find(selectors.hide);
				expect($title).not.toContain(selectors.unhide);
				expect($hide).toExist();
				expect($hide).toHaveText(l10n.hide);
			});
			it('sends ajax', function () {
				expect($.ajaxQueue).toHaveBeenCalledWith(
					$.extend(true, {}, ajax_expection, { data: {
						state: 'unhide',
						widgetId: 'archives'
					}})
				);
			});
			it('removes the "Hide Hidden Widgets" button if no more hidden widgets', function () {
				expect($(hideHiddenButton)).toExist();
				$('#widget-2_calendar-__i__').find(selectors.unhide).click();
				expect($(hideHiddenButton)).not.toExist();
			});
		});

		describe('when click the "Hide Hidden Widgets" button', function () {
			beforeEach(function () {
				$(hideHiddenButton).click();
			});

			it('changes the button to "Show Hidden Widgets"', function () {
				var $container = $('#widget-list').parent(),
					$showHiddenButton = $container.find(showHiddenButton);
				expect($container).not.toContain(hideHiddenButton);
				expect($showHiddenButton).toExist();
				expect($showHiddenButton).toHaveText(l10n.showHiddenWidgets);
			});
			it('hides the hidden widgets', function () {
				$.each(hiddenWidgets, function (index, $widget) {
					expect($widget).toBeHidden();
				});
			});
		});
	});
});
