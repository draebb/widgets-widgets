/*global ajaxurl, jQuery, userSettings, WidgetsWidgets, wpWidgets */
/*global jasmine, beforeEach, describe, expect, it, loadFixtures, spyOn */


describe('doorman', function () {
	'use strict';

	var $ = jQuery,
		ajax_expection = {
			type: 'POST',
			url: ajaxurl,
			data: {
				action: 'widgets_widgets',
				agent: 'doorman',
				nonce: WidgetsWidgets.nonce,
				uid: userSettings.uid
			}
		};

	function setup() {
		loadFixtures('doorman.html');
		wpWidgets.init();
		WidgetsWidgets.doorman.init();
	}

	beforeEach(setup);

	it('closes all areas initially', function () {
		expect($('.widgets-holder-wrap').not('.closed')).not.toExist();
	});

	it('restores states', function () {
		var sortable_disabled;

		WidgetsWidgets.data.opened_areas = [
			'available-widgets', 'wp_inactive_widgets',
			'sidebar-1', 'sidebar-2', 'sidebar-3', 'sidebar-4', 'sidebar-5'
		];
		jasmine.getFixtures().cleanUp();
		setup();

		expect($('.widgets-holder-wrap.closed')).not.toExist();

		sortable_disabled = [];
		$('#widgets-right .widgets-sortables').each(function () {
			sortable_disabled.push($(this).sortable('option', 'disabled'));
		});
		// Expect each area is sortable enabled
		expect($.inArray(true, sortable_disabled)).toEqual(-1);

		WidgetsWidgets.data.opened_areas = [];
	});

	describe('when open or close a area', function () {
		it('sends a ajax', function () {
			spyOn($, 'ajaxQueue');

			// Available widgets area has a different html structure
			$('#available-widgets .sidebar-name').click();
			expect($.ajaxQueue).toHaveBeenCalledWith(
				$.extend(true, {}, ajax_expection, { data: {
					state: 'open',
					areaId: 'available-widgets'
				}})
			);

			$('#sidebar-1').siblings('.sidebar-name').click();
			expect($.ajaxQueue).toHaveBeenCalledWith(
				$.extend(true, {}, ajax_expection, { data: {
					state: 'open',
					areaId: 'sidebar-1'
				}})
			);

			$('#sidebar-1').siblings('.sidebar-name').click();
			expect($.ajaxQueue).toHaveBeenCalledWith(
				$.extend(true, {}, ajax_expection, { data: {
					state: 'close',
					areaId: 'sidebar-1'
				}})
			);
		});
		it('tracks open/close state correctly', function () {
			spyOn($, 'ajaxQueue');

			$('#sidebar-1').siblings('.sidebar-name').click();
			$('#sidebar-1').siblings('.sidebar-name').click();
			$.ajaxQueue.reset();
			$('#sidebar-1').siblings('.sidebar-name').click();

			expect($.ajaxQueue).toHaveBeenCalledWith(
				$.extend(true, {}, ajax_expection, { data: {
					state: 'open',
					areaId: 'sidebar-1'
				}})
			);
		});
	});
});
