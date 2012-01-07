/*jslint browser: true */
/*global ajaxurl, jQuery, userSettings, WidgetsWidgets */


(function ($) {
	'use strict';

	var init;

	init = function () {
		var openedAreas = WidgetsWidgets.data.opened_areas || [],
			ajaxDefaultArgs = {
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'widgets_widgets',
					agent: 'doorman',
					nonce: WidgetsWidgets.nonce,
					uid: userSettings.uid
				}
			};

		// Close the available and inactive widgets boxes
		$('#available-widgets').addClass('closed');
		$('#wp_inactive_widgets')
			.closest('.widgets-holder-wrap').addClass('closed');

		// Close the first sidebar
		$('#widgets-right > .widgets-holder-wrap').eq(0).addClass('closed');

		$('.sidebar-name').each(function () {
			var $this = $(this),
				$parent = $this.parent(),
				$box = $parent.find('.widgets-sortables'),
				id = $box.attr('id');

			if (!id) {
				id = 'available-widgets';
			}

			// Restore the open/close statues
			if ($.inArray(id, openedAreas) > -1) {
				$parent.removeClass('closed');
				if (id !== 'available-widgets') {
					$box.sortable('enable').sortable('refresh');
				}
			}

			$(this).click(function () {
				var index,
					ajaxArgs = $.extend(true, {}, ajaxDefaultArgs);

				index = $.inArray(id, openedAreas);
				if (index === -1) {
					ajaxArgs.data.state = 'open';
					openedAreas.push(id);
				} else {
					ajaxArgs.data.state = 'close';
					openedAreas.splice(index, 1);
				}

				ajaxArgs.data.areaId = id;
				$.ajaxQueue(ajaxArgs);
			});
		});
	};

	WidgetsWidgets.doorman = {
		init: init
	};

	$(document).ready(WidgetsWidgets.doorman.init);

}(jQuery));
