<?php
/*
Plugin Name: Widgets Widgets
Plugin URI: https://github.com/draebb/widgets-widgets
Description: Improve widget management.
Version: 1.0
License: GPLv2 or later
*/


define( 'WIDGETS_WIDGETS_VERSION', '1.0' );
define( 'WIDGETS_WIDGETS_DB_VERSION', 1 );
define( 'WIDGETS_WIDGETS_NONCE', 'widgets-widgets' );


add_action( 'init', 'widgets_widgets_load_textdomain' );
function widgets_widgets_load_textdomain() {
	$plugin_dir = basename( dirname( __FILE__ ) );
	load_plugin_textdomain(
		'widgets-widgets', false, $plugin_dir . '/languages'
	);
}


add_action( 'admin_enqueue_scripts', 'widgets_widgets_enqueue_scripts' );
function widgets_widgets_enqueue_scripts( $hook ) {
	if ( $hook !== 'widgets.php' ) {
		return;
	}

	wp_enqueue_style(
		'widgets-widgets',
		plugins_url( 'style.css', __FILE__ ),
		false,
		WIDGETS_WIDGETS_VERSION
	);

	wp_register_script(
		'jquery-ajaxqueue',
		plugins_url( 'js/external/jQuery.ajaxQueue.min.js', __FILE__ )
	);

	$deps = array( 'jquery-ajaxqueue', 'admin-widgets' );

	wp_enqueue_script(
		'widgets-widgets-doorman',
		plugins_url( 'js/src/doorman.js', __FILE__ ),
		$deps,
		WIDGETS_WIDGETS_VERSION
	);

	wp_enqueue_script(
		'widgets-widgets-hider',
		plugins_url( 'js/src/hider.js', __FILE__ ),
		$deps,
		WIDGETS_WIDGETS_VERSION
	);

	$option = get_option( 'widgets_widgets_data' );
	$user_id = wp_get_current_user()->ID;
	if ( isset( $option[$user_id] ) ) {
		$data = $option[$user_id];
	} else {
		$data = array();
		$data['opened_areas'] = array( 'available-widgets' );
		$option[$user_id] = $data;
		update_option( 'widgets_widgets_data', $option );
	}

	wp_localize_script(
		'widgets-widgets-doorman', 'WidgetsWidgets', array(
			'data' => $data,
			'nonce' => wp_create_nonce( WIDGETS_WIDGETS_NONCE ),
			'l10n' => array(
				'hide' => __( 'Hide', 'widgets-widgets' ),
				'unhide' => __( 'Unhide', 'widgets-widgets' ),
				'hideHiddenWidgets' => __(
					'Hide Hidden Widgets', 'widgets-widgets'
				),
				'showHiddenWidgets' => __(
					'Show Hidden Widgets', 'widgets-widgets'
				)
			)
		)
	);
}


add_action( 'wp_ajax_widgets_widgets', 'widgets_widgets_do_ajax' );
function widgets_widgets_do_ajax() {
	check_ajax_referer( WIDGETS_WIDGETS_NONCE, 'nonce' );

	$user_id = intval( $_POST['uid'] );
	$agent = $_POST['agent'];
	$state = $_POST['state'];

	$option = get_option( 'widgets_widgets_data' );

	if ( $agent === 'doorman' ) {
		$data_key = 'opened_areas';
		$to_add_data = ( $state === 'open' );
		$target_id = $_POST['areaId'];
	} elseif ( $agent === 'hider' ) {
		$data_key = 'hidden_widgets';
		$to_add_data = ( $state === 'hide' );
		$target_id = $_POST['widgetId'];
	}
	$data = &$option[$user_id][$data_key];

	if ( $to_add_data ) {
		if ( ! in_array( $target_id, $data ) ) {
			$data[] = $target_id;
		}
	} else {
		// delete data
		$index = array_search( $target_id, $data );
		if ( $index !== false ) {
			array_splice( $data, $index, 1 );
		}
	}

	update_option( 'widgets_widgets_data', $option );

	die();
}


register_activation_hook( __FILE__, 'widgets_widgets_activation' );
function widgets_widgets_activation() {
	$db_version = get_option( 'widgets_widgets_db_version' );
	if ( ! $db_version ) {
		add_option(
			'widgets_widgets_db_version',
			WIDGETS_WIDGETS_DB_VERSION, '', 'no'
		);
	}
	$data = get_option( 'widgets_widgets_data' );
	if ( ! $data ) {
		add_option( 'widgets_widgets_data', '', '', 'no' );
	}
}


register_uninstall_hook( __FILE__, 'widgets_widgets_uninstall' );
function widgets_widgets_uninstall() {
	delete_option( 'widgets_widgets_db_version' );
	delete_option( 'widgets_widgets_data' );
}
