/**
 * Ultimate Media Background (UMBG)
 * UMBG jQuery Plugin
 * http://codecanyon.net/user/theefarmer?ref=theefarmer
 * http://theefarmer.com
 *
 * Version: v1.5.0
 * Author: TheeFarmer | Alendee Internet Solutions
 * Copyright: (c) 2016 Alendee Internet Solutions
 *
 * Last Change: 2016-07-04 - 1.5.0 - Add keyboard controls.
 *                                 - Add mediaStartFadeIn.
 *                                 - Add public playback methods.
 *                                 - Add start, pause, & end playback callbacks.
 *                                 - Add scroll-to-top button.
 *                                 - Add meta generator tag.
 *                                 - Change playback functions.
 *                                 - Change player controls functionality.
 *                                 - Change YouTube API callback.
 *                                 - Change Vimeo API to use Froogaloop.
 *                                 - Fix YT Page Visibility Pause.
 *                                 - Fix Dailymotion API events change.
 *              2016-03-02 - 1.4.3 - Fix media end fade-out function.
 *                                 - Change default mediaLink value to ''.
 *              2016-02-27 - 1.4.2 - Fix Page Visability Pause and autoplay.
 *              2016-02-25 - 1.4.1 - Fix autoplay on image slideshow.
 *                                 - Fix UMBG-Slider script not loading with some EU mobile providers.
 *              2015-11-28 - 1.4.0 - Add autoPlay (option to start playback paused).
 *                                 - Add mediaLink & mediaLinktarget.
 *                                 - Change default setting for pudUp to 1.
 *              2015-11-01 - 1.3.3 - Fix YouTube API change causing looping issue with Safari.
 *              2015-10-18 - 1.3.2 - Add default settings missing description comments.
 *                                 - Enhance code format.
 *                                 - Change default value of disableOnMobileVideoOnly from 1 to 0.
 *              2015-10-14 - 1.3.1 - Enhance slideTransitionDuration (making sure it is type of integer).
 *                                 - Fix FIO transition effect sometimes not initializing properly.
 *                                 - Fix disabling on mobile devices not working when Image type is selected.
 *              2015-09-22 - 1.3.0 - Add start video with audio muted.
 *                                 - Add FIO (Fade-In-Out) for page content.
 *                                 - Add Media End Fade-Out (MEFO).
 *                                 - Add slideTransitionDuration for umbg-slider.
 *                                 - Enhance start PUD down, page will start down immediately.
 *                                 - Enhanced Page Visibility Pause functionality.
 *                                 - Enhanced resizing for mobile devices.
 *                                 - Fix delayBy when using Image media.
 *                                 - Renamed variable videoOverlayTransparent to mediaOverlayTransparent.
 *              2015-07-21 - 1.2.3 - Enhance code for YT video quality detection.
 *                                 - Add using YT HTML5 player first then fallback to flash.
 *              2015-07-06 - 1.2.2 - Remove PUD restriction to hide controls.
 *              2015-06-29 - 1.2.1 - Fix YouTube play button sometimes not working.
 *                                   Enhance disable on mobile code.
 *              2015-06-21 - 1.2.0 - Add option to disable backgrounds on mobile phones only.
 *                                   Add Wistia option (doNotTrack) to track video views.
 *              2015-06-17 - 1.1.2 - Fix HTML5 audio volume not matching set level.
 *              2015-06-16 - 1.1.1 - Fix HTML5 audio playing while audio option is disable.
 *              2015-06-16 - 1.1.0 - Add option to disable backgrounds for mobile devices.
 *                                   Fix Vimeo API change.
 *              2015-05-25 - 1.0.0 - Initial release.
 **/

//START UMBG.
(function ( $ ) {
	'use strict';

	// The + in front of some setting values (i.e. +opts.setting) is to change string type (in case it is string) to number type where needed.

	$.fn.umbg = function ( options ) {

		var opts = $.extend( {}, $.fn.umbg.defaults, options );

		return this.each( function () {

			// Add UMBG meta generator tag to <head> tag.
			var metaGenerator = document.createElement( 'meta' );
			metaGenerator.id = 'umbg-meta-generator';
			metaGenerator.content = 'Ultimate Media Background (UMBG)';
			metaGenerator.name = 'generator';
			// If not already in <head> then append to <head>.
			if ( $( '#umbg-meta-generator' ).length <= 0 ) {
				$( 'head' ).append( metaGenerator );
			}

			// Create video controls
			var mediaControls = '<div class="umbg-player-controls ' + opts.placeControls + '">' +
				'<a class="umbg-fio-button" data-umbg-fade-in-icon="umbg-player-icon fa fa-file" data-umbg-fade-out-icon="umbg-player-icon fa fa-file-o" href="#"></a>' +
				'<a class="umbg-pud-button" data-umbg-page-down-icon="umbg-player-icon fa fa-arrows-v" data-umbg-page-up-icon="umbg-player-icon fa fa-arrows-v" href="#"></a>' +
				'<a class="umbg-play-button" data-umbg-play-icon="umbg-player-icon fa fa-play" data-umbg-pause-icon="umbg-player-icon fa fa-pause" href="#"></a>' +
				'<a class="umbg-volume-button" data-umbg-mute-icon="umbg-player-icon fa fa-volume-up" data-umbg-unmute-icon="umbg-player-icon fa fa-volume-off" href="#"></a>' +

				'</div>';

			// Display video controls
			if ( opts.displayControls === 1 ) {
				$( this ).prepend( mediaControls );
				$( '.umbg-player-controls' ).hide().fadeIn( 1000 );
			}

			// Variables.
			var $this = $( this ),
				umbgMediaPlayer,
				mediaPlayerType = opts.mediaPlayerType.toLowerCase(),
				mobilePoster = '<img class="' + opts.mediaPosterCss + '" src="' + opts.mediaPoster + '" alt="" />',
				mediaOverlay = '<div class="umbg-overlay ' + opts.mediaOverlayCss + '" style="background-color: ' + opts.mediaOverlayColor + ';"></div>',
				mediaOverlayTransparent = '<div class="umbg-overlay umbg-overlay-transparent"></div>',
				$playerControls = $( '.umbg-player-controls' ),
				$playButton = $( '.umbg-play-button' ),
				$volumeButton = $( '.umbg-volume-button' ),
				$pudButton = $( '.umbg-pud-button' ),
				$fioButton = $( '.umbg-fio-button' ),
				volumeLevel,
				videoQuality,
				player,
				startTime = opts.startAt,
				stopTime = opts.endAt,
				rewindToStartAt = + opts.rewindToStartAt,
				mediaEnded = 0,
				umbgPlaying = 0,
				umbgInitialStart = 1,
				adEnded = 0,
				play,
				pause,
				seek,
				mute,
				unmute,
				umbgMuted,
				// CHANGE HERE
				

			// Variables for disable on mobile devices functions.
				disableMobileAll = ( isMobilePhone() || isMobileTablet() ) && opts.disableOnMobileAll === 1,
				disableMobileVideo = ( isMobilePhone() || isMobileTablet() ) && opts.disableOnMobileVideoOnly === 1 && opts.disableOnMobilePhonesOnly === 0,
				disableMobilePhone = ( isMobilePhone() && opts.disableOnMobilePhonesOnly === 1 ),

			// For Page Visibility API
			// Set the name of the hidden property and the change event for visibility
				hidden,
				visibilityChange,
				userPause = 0
				;

			// AUTOPLAY
			// Reset variables as needed based on autoplay.
			if ( opts.autoPlay === 1 ) {
				umbgPlaying = 1;
			} else {
				userPause = 1;
			}

			// If a custom colors are provided for the controls then change it.
			if ( opts.controlColor ) {
				$( '.umbg-player-controls a' ).css( 'color', opts.controlColor );
			}

			if ( opts.controlBgColor ) {
				$playerControls.css( 'background-color', opts.controlBgColor );
			}

			// START - PUD Page-Up-Down
			// Define PUD variables
			var pudPosition,
				wH = $( window ).height(),
				pageMargin = $( opts.pudElement ).css( 'marginTop' ),
			//pud = wH - opts.pudShow,
				pudAmt = wH - opts.pudShow
				;

			// If PUD is on & controls are displayed then PUD can be used. Disable or enable for mobile devices.
			if ( opts.pud === 1 ) {

				// If disable on all mobile devices is on then disable. Else if disable on video only then display only image/color backgrounds. Else enable PUD normally.
				if ( disableMobileAll || disableMobilePhone && opts.disableOnMobileVideoOnly !== 1 ) {
					$.fn.umbg.defaults.pud = 0;
				} else if ( ( disableMobileVideo || disableMobilePhone ) && mediaPlayerType !== 'image' ) {
					$.fn.umbg.defaults.pud = 0;
				} else {

					// If pudDown is on then start page in down position.
					if ( opts.pudDown === 1 ) {
						if ( opts.delayBy > 0 ) {
							setTimeout( pageDown, opts.delayBy - 600 );
						} else {
							pageDown();
						}
					} else {
						pudPosition = 'up';
					}

					// On window resize keep the 'pudShow' amount visible.
					$( window ).resize( function () {
						wH = $( window ).height();
						pudAmt = wH - opts.pudShow;

						if ( pudPosition === 'down' ) {
							pageDown();
						}
					} );

				} //
			}

			// If PUD is off then remove PUD button.
			if ( opts.pud !== 1 ) {
				$pudButton.remove();
			}

			// Page up & down functions.
			function pageDown() {
				if ( opts.pudDown === 1 && opts.delayBy <= 0 ) {
					$( opts.pudElement ).css( {
						'margin-top': pudAmt + 'px'
					} );
				} else {
					$( opts.pudElement ).css( {
						'margin-top'        : pudAmt + 'px',
						'-webkit-transition': 'margin-top 1.5s',
						'transition'        : 'margin-top 1.5s'
					} );
				}

				pudPosition = 'down';
			}

			function pageUp() {
				$( opts.pudElement ).css( {
					'margin-top'        : pageMargin,
					'-webkit-transition': 'margin-top 1.5s',
					'transition'        : 'margin-top 1.5s'
				} );

				pudPosition = 'up';
			}

			// If PUD is down and on end PUD up is enable then make PUD up.
			function autoPud() {
				if ( pudPosition === 'down' && opts.pudUp === 1 && opts.pud === 1 ) {
					pageUp();
					pudPosition = 'up';
				}
			}

			// END - PUD

			// START - FIO
			var fioStatus
			//$fioButton = $( '.umbg-fio-button' )
				;

			if ( opts.fio === 1 ) {

				if ( disableMobileAll || disableMobilePhone && opts.disableOnMobileVideoOnly !== 1 ) {
					$.fn.umbg.defaults.fio = 0;
				} else if ( ( disableMobileVideo || disableMobilePhone ) && mediaPlayerType !== 'image' ) {
					$.fn.umbg.defaults.fio = 0;
				} else {
					// If fioStart is 'on' then start playback with page opacity 'on'.
					if ( opts.fioStart === 1 ) {

						fioStatus = 'on';

						if ( opts.delayBy > 0 ) {
							setTimeout( setFioOpacity, + opts.delayBy - 700 );
						} else {
							setTimeout( setFioOpacity, 1000 );
						}

					} else {
						fioStatus = 'off';
					}
				}
			}

			// If FIO is off then hide from the controls.
			if ( opts.fio !== 1 ) {
				$fioButton.hide();
			} else {
				$fioButton.show();
			}

			function setFioOpacity() {
				$( opts.fioElement ).css( {
					'opacity'   : opts.fioOpacity,
					'filter'    : 'Alpha(opacity=' + ( opts.fioOpacity * 100 ) + ')',
					'transition': 'all 0.5s linear'
				} );
				fioStatus = 'on';
				//$fioButton.find( 'i' ).removeClass( 'fa-file' ).addClass( 'fa-file-o' );
				fioButton();
			}

			function removeFioOpacity() {
				$( opts.fioElement ).css( {
					'opacity'   : 1,
					'filter'    : 'Alpha(opacity=100)',
					'transition': 'all 0.5s linear'
				} );
				fioStatus = 'off';
				//$fioButton.find( 'i' ).removeClass( 'fa-file-o' ).addClass( 'fa-file' );
				fioButton();
			}

			function autoFio() {
				if ( fioStatus === 'on' && opts.fioEnd === 1 && opts.fio === 1 ) {
					removeFioOpacity();
				}
			}

			// END - FIO

			// START - MEFO (Media End Fade-Out)
			if ( opts.mediaEndFadeOut === 1 ) {
				if ( ( disableMobileAll || disableMobilePhone ) && opts.disableOnMobileVideoOnly !== 1 ) {
					$.fn.umbg.defaults.mediaEndFadeOut = 0;
					$.fn.umbg.defaults.mediaStartFadeIn = 0;
				} else if ( ( disableMobileVideo || disableMobilePhone ) && mediaPlayerType !== 'image' ) {
					$.fn.umbg.defaults.mediaEndFadeOut = 0;
					$.fn.umbg.defaults.mediaStartFadeIn = 0;
				}
			}

			function setMefo() {
				if ( mediaPlayerType === 'dailymotion' ) {

					$( '#' + opts.mediaPlayerId + ', .umbg-overlay-link, .umbg-overlay' ).animate( {
						opacity   : 0,
						visibility: 'hidden'
					}, 1500 );
				} else {
					$( '.umbg-overlay-link, .umbg-overlay' ).fadeOut( 1700 );
					$( '#' + opts.mediaPlayerId ).fadeOut( 1500 );
				}
			}

			function removeMefo() {
				if ( mediaPlayerType === 'dailymotion' ) {
					$( '#' + opts.mediaPlayerId + ', .umbg-overlay-link, .umbg-overlay' ).css( 'visibility', 'visible' ).animate( { opacity: 1 }, 1500 );
				} else {
					$( '.umbg-overlay-link, .umbg-overlay' ).fadeIn( 1500 );
					$( '#' + opts.mediaPlayerId ).fadeIn( 1700 );
				}
			}

			function autoMefo() {
				if ( opts.mediaEndFadeOut === 1 ) {

					if ( mediaEnded === 1 ) {
						setMefo();
					} else {
						removeMefo();
					}
				}
			}

			// END - MEFO

			// If audio = 0 or volume level = 0 don't display volume button.
			if ( opts.audio <= 0 || opts.volumeLevel <= 0 ) {
				volumeLevel = 0;
				$volumeButton.css( 'display', 'none' );
				umbgMuted = 1;
			} else {
				volumeLevel = opts.volumeLevel;
				//$volumeButton.find( 'i' ).removeClass( 'fa-volume-off' ).addClass( 'fa-volume-up' );
				umbgMuted = 0;
				//volumeButton();
			}

			// Find the percent amount of a given number.
			// num = number, percentAmount = percentage to find.
			function percent( num, percentAmount ) {
				return num * percentAmount / 100;
			}

			// Enlarge video player size by a given percent amount.
			function enlargeVideoPlayer( num, percentAmount ) {
				return percent( num, percentAmount ) + num;
			}

			// START - callback helpers.
			var callBackTimeoutId;

			function delayedCallback( action, delay ) {

				if ( ! delay ) {
					switch ( action ) {
						case 'start':
							delay = 500;
							break;
						case 'pause':
							delay = 100;
							break;
						case 'end':
							delay = 100;
							break;
						default:
							delay = 100;
					}
				}

				callBackTimeoutId = window.setTimeout( function () {
					runCallback( action );
				}, delay );
			}

			function runCallback( action ) {

				// Run the correct callback.
				switch ( action ) {
					case 'start':
						opts.onPlaybackStart.call();
						break;
					case 'pause':
						opts.onPlaybackPause.call();
						break;
					case 'end':
						opts.onPlaybackEnd.call();
						break;
					default:
						return;
				}

				clearCallback();
			}

			function clearCallback() {
				window.clearTimeout( callBackTimeoutId );
			}

			// END - callback helpers.

			// Check if it's a mobile device.
			function isMobilePhone() {
				return ! ! /iPhone|\biPhone\b|\biPod\b|BlackBerry|BlackBerry|\bBB10\b|rim[0-9]+HTC|HTC|HTC.*(Sensation|Evo|Vision|Explorer|6800|8100|8900|A7272|S510e|C110e|Legend|Desire|T8282)|APX515CKT|Qtek9090|APA9292KT|HD_mini|Sensation.*Z710e|PG86100|Z715e|Desire.*(A8181|HD)|ADR6200|ADR6400L|ADR6425|001HT|Inspire 4G|Android.*\bEVO\b|T-Mobile G1|Z520m|Nexus One|Nexus S|Galaxy.*Nexus|Nexus 4|Nexus 5|Nexus 6|Dell|Dell.*Streak|Dell.*Aero|Dell.*Venue|DELL.*Venue Pro|Dell Flash|Dell Smoke|Dell Mini 3iX|XCD28|XCD35|\b001DL\b|\b101DL\b|\bGS01\b|Motorola|Motorola|DROIDX|DROID BIONIC|\bDroid\b.*Build|Android.*Xoom|HRI39|MOT-|A1260|A1680|A555|A853|A855|A953|A955|A956|Motorola.*ELECTRIFY|Motorola.*i1|i867|i940|MB200|MB300|MB501|MB502|MB508|MB511|MB520|MB525|MB526|MB611|MB612|MB632|MB810|MB855|MB860|MB861|MB865|MB870|ME501|ME502|ME511|ME525|ME600|ME632|ME722|ME811|ME860|ME863|ME865|MT620|MT710|MT716|MT720|MT810|MT870|MT917|Motorola.*TITANIUM|WX435|WX445|XT300|XT301|XT311|XT316|XT317|XT319|XT320|XT390|XT502|XT530|XT531|XT532|XT535|XT603|XT610|XT611|XT615|XT681|XT701|XT702|XT711|XT720|XT800|XT806|XT860|XT862|XT875|XT882|XT883|XT894|XT901|XT907|XT909|XT910|XT912|XT928|XT926|XT915|XT919|XT925Samsung|Samsung|SGH-I337|BGT-S5230|GT-B2100|GT-B2700|GT-B2710|GT-B3210|GT-B3310|GT-B3410|GT-B3730|GT-B3740|GT-B5510|GT-B5512|GT-B5722|GT-B6520|GT-B7300|GT-B7320|GT-B7330|GT-B7350|GT-B7510|GT-B7722|GT-B7800|GT-C3010|GT-C3011|GT-C3060|GT-C3200|GT-C3212|GT-C3212I|GT-C3262|GT-C3222|GT-C3300|GT-C3300K|GT-C3303|GT-C3303K|GT-C3310|GT-C3322|GT-C3330|GT-C3350|GT-C3500|GT-C3510|GT-C3530|GT-C3630|GT-C3780|GT-C5010|GT-C5212|GT-C6620|GT-C6625|GT-C6712|GT-E1050|GT-E1070|GT-E1075|GT-E1080|GT-E1081|GT-E1085|GT-E1087|GT-E1100|GT-E1107|GT-E1110|GT-E1120|GT-E1125|GT-E1130|GT-E1160|GT-E1170|GT-E1175|GT-E1180|GT-E1182|GT-E1200|GT-E1210|GT-E1225|GT-E1230|GT-E1390|GT-E2100|GT-E2120|GT-E2121|GT-E2152|GT-E2220|GT-E2222|GT-E2230|GT-E2232|GT-E2250|GT-E2370|GT-E2550|GT-E2652|GT-E3210|GT-E3213|GT-I5500|GT-I5503|GT-I5700|GT-I5800|GT-I5801|GT-I6410|GT-I6420|GT-I7110|GT-I7410|GT-I7500|GT-I8000|GT-I8150|GT-I8160|GT-I8190|GT-I8320|GT-I8330|GT-I8350|GT-I8530|GT-I8700|GT-I8703|GT-I8910|GT-I9000|GT-I9001|GT-I9003|GT-I9010|GT-I9020|GT-I9023|GT-I9070|GT-I9082|GT-I9100|GT-I9103|GT-I9220|GT-I9250|GT-I9300|GT-I9305|GT-I9500|GT-I9505|GT-M3510|GT-M5650|GT-M7500|GT-M7600|GT-M7603|GT-M8800|GT-M8910|GT-N7000|GT-S3110|GT-S3310|GT-S3350|GT-S3353|GT-S3370|GT-S3650|GT-S3653|GT-S3770|GT-S3850|GT-S5210|GT-S5220|GT-S5229|GT-S5230|GT-S5233|GT-S5250|GT-S5253|GT-S5260|GT-S5263|GT-S5270|GT-S5300|GT-S5330|GT-S5350|GT-S5360|GT-S5363|GT-S5369|GT-S5380|GT-S5380D|GT-S5560|GT-S5570|GT-S5600|GT-S5603|GT-S5610|GT-S5620|GT-S5660|GT-S5670|GT-S5690|GT-S5750|GT-S5780|GT-S5830|GT-S5839|GT-S6102|GT-S6500|GT-S7070|GT-S7200|GT-S7220|GT-S7230|GT-S7233|GT-S7250|GT-S7500|GT-S7530|GT-S7550|GT-S7562|GT-S7710|GT-S8000|GT-S8003|GT-S8500|GT-S8530|GT-S8600|SCH-A310|SCH-A530|SCH-A570|SCH-A610|SCH-A630|SCH-A650|SCH-A790|SCH-A795|SCH-A850|SCH-A870|SCH-A890|SCH-A930|SCH-A950|SCH-A970|SCH-A990|SCH-I100|SCH-I110|SCH-I400|SCH-I405|SCH-I500|SCH-I510|SCH-I515|SCH-I600|SCH-I730|SCH-I760|SCH-I770|SCH-I830|SCH-I910|SCH-I920|SCH-I959|SCH-LC11|SCH-N150|SCH-N300|SCH-R100|SCH-R300|SCH-R351|SCH-R400|SCH-R410|SCH-T300|SCH-U310|SCH-U320|SCH-U350|SCH-U360|SCH-U365|SCH-U370|SCH-U380|SCH-U410|SCH-U430|SCH-U450|SCH-U460|SCH-U470|SCH-U490|SCH-U540|SCH-U550|SCH-U620|SCH-U640|SCH-U650|SCH-U660|SCH-U700|SCH-U740|SCH-U750|SCH-U810|SCH-U820|SCH-U900|SCH-U940|SCH-U960|SCS-26UC|SGH-A107|SGH-A117|SGH-A127|SGH-A137|SGH-A157|SGH-A167|SGH-A177|SGH-A187|SGH-A197|SGH-A227|SGH-A237|SGH-A257|SGH-A437|SGH-A517|SGH-A597|SGH-A637|SGH-A657|SGH-A667|SGH-A687|SGH-A697|SGH-A707|SGH-A717|SGH-A727|SGH-A737|SGH-A747|SGH-A767|SGH-A777|SGH-A797|SGH-A817|SGH-A827|SGH-A837|SGH-A847|SGH-A867|SGH-A877|SGH-A887|SGH-A897|SGH-A927|SGH-B100|SGH-B130|SGH-B200|SGH-B220|SGH-C100|SGH-C110|SGH-C120|SGH-C130|SGH-C140|SGH-C160|SGH-C170|SGH-C180|SGH-C200|SGH-C207|SGH-C210|SGH-C225|SGH-C230|SGH-C417|SGH-C450|SGH-D307|SGH-D347|SGH-D357|SGH-D407|SGH-D415|SGH-D780|SGH-D807|SGH-D980|SGH-E105|SGH-E200|SGH-E315|SGH-E316|SGH-E317|SGH-E335|SGH-E590|SGH-E635|SGH-E715|SGH-E890|SGH-F300|SGH-F480|SGH-I200|SGH-I300|SGH-I320|SGH-I550|SGH-I577|SGH-I600|SGH-I607|SGH-I617|SGH-I627|SGH-I637|SGH-I677|SGH-I700|SGH-I717|SGH-I727|SGH-i747M|SGH-I777|SGH-I780|SGH-I827|SGH-I847|SGH-I857|SGH-I896|SGH-I897|SGH-I900|SGH-I907|SGH-I917|SGH-I927|SGH-I937|SGH-I997|SGH-J150|SGH-J200|SGH-L170|SGH-L700|SGH-M110|SGH-M150|SGH-M200|SGH-N105|SGH-N500|SGH-N600|SGH-N620|SGH-N625|SGH-N700|SGH-N710|SGH-P107|SGH-P207|SGH-P300|SGH-P310|SGH-P520|SGH-P735|SGH-P777|SGH-Q105|SGH-R210|SGH-R220|SGH-R225|SGH-S105|SGH-S307|SGH-T109|SGH-T119|SGH-T139|SGH-T209|SGH-T219|SGH-T229|SGH-T239|SGH-T249|SGH-T259|SGH-T309|SGH-T319|SGH-T329|SGH-T339|SGH-T349|SGH-T359|SGH-T369|SGH-T379|SGH-T409|SGH-T429|SGH-T439|SGH-T459|SGH-T469|SGH-T479|SGH-T499|SGH-T509|SGH-T519|SGH-T539|SGH-T559|SGH-T589|SGH-T609|SGH-T619|SGH-T629|SGH-T639|SGH-T659|SGH-T669|SGH-T679|SGH-T709|SGH-T719|SGH-T729|SGH-T739|SGH-T746|SGH-T749|SGH-T759|SGH-T769|SGH-T809|SGH-T819|SGH-T839|SGH-T919|SGH-T929|SGH-T939|SGH-T959|SGH-T989|SGH-U100|SGH-U200|SGH-U800|SGH-V205|SGH-V206|SGH-X100|SGH-X105|SGH-X120|SGH-X140|SGH-X426|SGH-X427|SGH-X475|SGH-X495|SGH-X497|SGH-X507|SGH-X600|SGH-X610|SGH-X620|SGH-X630|SGH-X700|SGH-X820|SGH-X890|SGH-Z130|SGH-Z150|SGH-Z170|SGH-ZX10|SGH-ZX20|SHW-M110|SPH-A120|SPH-A400|SPH-A420|SPH-A460|SPH-A500|SPH-A560|SPH-A600|SPH-A620|SPH-A660|SPH-A700|SPH-A740|SPH-A760|SPH-A790|SPH-A800|SPH-A820|SPH-A840|SPH-A880|SPH-A900|SPH-A940|SPH-A960|SPH-D600|SPH-D700|SPH-D710|SPH-D720|SPH-I300|SPH-I325|SPH-I330|SPH-I350|SPH-I500|SPH-I600|SPH-I700|SPH-L700|SPH-M100|SPH-M220|SPH-M240|SPH-M300|SPH-M305|SPH-M320|SPH-M330|SPH-M350|SPH-M360|SPH-M370|SPH-M380|SPH-M510|SPH-M540|SPH-M550|SPH-M560|SPH-M570|SPH-M580|SPH-M610|SPH-M620|SPH-M630|SPH-M800|SPH-M810|SPH-M850|SPH-M900|SPH-M910|SPH-M920|SPH-M930|SPH-N100|SPH-N200|SPH-N240|SPH-N300|SPH-N400|SPH-Z400|SWC-E100|SCH-i909|GT-N7100|GT-N7105|SCH-I535|SM-N900A|SGH-I317|SGH-T999L|GT-S5360B|GT-I8262|GT-S6802|GT-S6312|GT-S6310|GT-S5312|GT-S5310|GT-I9105|GT-I8510|GT-S6790N|SM-G7105|SM-N9005|GT-S5301|GT-I9295|GT-I9195|SM-C101|GT-S7392|GT-S7560|GT-B7610|GT-I5510|GT-S7582|GT-S7530E|GT-I8750|SM-G9006V|SM-G9008V|SM-G9009D|SM-G900A|SM-G900D|SM-G900F|SM-G900H|SM-G900I|SM-G900J|SM-G900K|SM-G900L|SM-G900M|SM-G900P|SM-G900R4|SM-G900S|SM-G900T|SM-G900V|SM-G900W8|SHV-E160K|LG|\bLG\b;|LG[- ]?(C800|C900|E400|E610|E900|E-900|F160|F180K|F180L|F180S|730|855|L160|LS740|LS840|LS970|LU6200|MS690|MS695|MS770|MS840|MS870|MS910|P500|P700|P705|VM696|AS680|AS695|AX840|C729|E970|GS505|272|C395|E739BK|E960|L55C|L75C|LS696|LS860|P769BK|P350|P500|P509|P870|UN272|US730|VS840|VS950|LN272|LN510|LS670|LS855|LW690|MN270|MN510|P509|P769|P930|UN200|UN270|UN510|UN610|US670|US740|US760|UX265|UX840|VN271|VN530|VS660|VS700|VS740|VS750|VS910|VS920|VS930|VX9200|VX11000|AX840A|LW770|P506|P925|P999|E612|D955|D802),Sony|SonyST|SonyLT|SonyEricsson|SonyEricssonLT15iv|LT18i|E10i|LT28h|LT26w|SonyEricssonMT27i|C5303|C6902|C6903|C6906|C6943|D2533Asus|Asus.*Galaxy|PadFone.*Mobile|Micromax|Micromax.*\b(A210|A92|A88|A72|A111|A110Q|A115|A116|A110|A90S|A26|A51|A35|A54|A25|A27|A89|A68|A65|A57|A90)\b|Palm|PalmSource|Palm|Vertu|Vertu|Vertu.*Ltd|Vertu.*Ascent|Vertu.*Ayxta|Vertu.*Constellation(F|Quest)?|Vertu.*Monika|Vertu.*Signature|Pantech|PANTECH|IM-A850S|IM-A840S|IM-A830L|IM-A830K|IM-A830S|IM-A820L|IM-A810K|IM-A810S|IM-A800S|IM-T100K|IM-A725L|IM-A780L|IM-A775C|IM-A770K|IM-A760S|IM-A750K|IM-A740S|IM-A730S|IM-A720L|IM-A710K|IM-A690L|IM-A690S|IM-A650S|IM-A630K|IM-A600S|VEGA PTL21|PT003|P8010|ADR910L|P6030|P6020|P9070|P4100|P9060|P5000|CDM8992|TXT8045|ADR8995|IS11PT|P2030|P6010|P8000|PT002|IS06|CDM8999|P9050|PT001|TXT8040|P2020|P9020|P2000|P7040|P7000|C790|Fly|IQ230|IQ444|IQ450|IQ440|IQ442|IQ441|IQ245|IQ256|IQ236|IQ255|IQ235|IQ245|IQ275|IQ240|IQ285|IQ280|IQ270|IQ260|IQ250|Wiko|KITE 4G|HIGHWAY|GETAWAY|STAIRWAY|DARKSIDE|DARKFULL|DARKNIGHT|DARKMOON|SLIDE|WAX 4G|RAINBOW|BLOOM|SUNSET|GOA|LENNY|BARRY|IGGY|OZZY|CINK FIVE|CINK PEAX|CINK PEAX 2|CINK SLIM|CINK SLIM 2|CINK +|CINK KING|CINK PEAX|CINK SLIM|SUBLIM|iMobile|i-mobile (IQ|i-STYLE|idea|ZAA|Hitz)|SimValley|\b(SP-80|XT-930|SX-340|XT-930|SX-310|SP-360|SP60|SPT-800|SP-120|SPT-800|SP-140|SPX-5|SPX-8|SP-100|SPX-8|SPX-12)\b|Wolfgang|AT-B24D|AT-AS50HD|AT-AS40W|AT-AS55HD|AT-AS45q2|AT-B26D|AT-AS50Q|Alcatel|Alcatel|Nintendo|Nintendo 3DS|Amoi|Amoi|INQ|INQ|Tapatalk|PDA;|SAGEM|\bmmp\b|pocket|\bpsp\b|symbian|Smartphone|smartfon|treo|up.browser|up.link|vodafone|\bwap\b|nokia|Series40|Series60|S60|SonyEricsson|N900|MAUI.*WAP.*Browser/i.test( navigator.userAgent );
			}

			function isMobileTablet() {
				return ! ! /iPad|iPad.*Mobile|Android.*Nexus[\s]+(7|9|10)|^.*Android.*Nexus(?:(?!Mobile).)*$|SAMSUNG.*Tablet|Galaxy.*Tab|SC-01C|GT-P1000|GT-P1003|GT-P1010|GT-P3105|GT-P6210|GT-P6800|GT-P6810|GT-P7100|GT-P7300|GT-P7310|GT-P7500|GT-P7510|SCH-I800|SCH-I815|SCH-I905|SGH-I957|SGH-I987|SGH-T849|SGH-T859|SGH-T869|SPH-P100|GT-P3100|GT-P3108|GT-P3110|GT-P5100|GT-P5110|GT-P6200|GT-P7320|GT-P7511|GT-N8000|GT-P8510|SGH-I497|SPH-P500|SGH-T779|SCH-I705|SCH-I915|GT-N8013|GT-P3113|GT-P5113|GT-P8110|GT-N8010|GT-N8005|GT-N8020|GT-P1013|GT-P6201|GT-P7501|GT-N5100|GT-N5105|GT-N5110|SHV-E140K|SHV-E140L|SHV-E140S|SHV-E150S|SHV-E230K|SHV-E230L|SHV-E230S|SHW-M180K|SHW-M180L|SHW-M180S|SHW-M180W|SHW-M300W|SHW-M305W|SHW-M380K|SHW-M380S|SHW-M380W|SHW-M430W|SHW-M480K|SHW-M480S|SHW-M480W|SHW-M485W|SHW-M486W|SHW-M500W|GT-I9228|SCH-P739|SCH-I925|GT-I9200|GT-I9205|GT-P5200|GT-P5210|GT-P5210X|SM-T311|SM-T310|SM-T310X|SM-T210|SM-T210R|SM-T211|SM-P600|SM-P601|SM-P605|SM-P900|SM-P901|SM-T217|SM-T217A|SM-T217S|SM-P6000|SM-T3100|SGH-I467|XE500|SM-T110|GT-P5220|GT-I9200X|GT-N5110X|GT-N5120|SM-P905|SM-T111|SM-T2105|SM-T315|SM-T320|SM-T320X|SM-T321|SM-T520|SM-T525|SM-T530NU|SM-T230NU|SM-T330NU|SM-T900|XE500T1C|SM-P605V|SM-P905V|SM-T337V|SM-T537V|SM-T707V|SM-T807V|SM-P600X|SM-P900X|SM-T210X|SM-T230|SM-T230X|SM-T325|GT-P7503|SM-T531|SM-T330|SM-T530|SM-T705C|SM-T535|SM-T331|SM-T800|SM-T700|SM-T537|SM-T807|SM-P907A|SM-T337A|SM-T537A|SM-T707A|SM-T807A|SM-T237P|SM-T807P|SM-P607T|SM-T217T|SM-T337T|SM-T807T|Kindle|Silk.*Accelerated|Android.*\b(KFOT|KFTT|KFJWI|KFJWA|KFOTE|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|WFJWAE|KFSAWA|KFSAWI|KFASWI)\b|Windows NT [0-9.]+; ARM;.*(Tablet|ARMBJS)|HP Slate (7|8|10)|HP ElitePad 900|hp-tablet|EliteBook.*Touch|HP 8|Slate 21|HP SlateBook 10|^.*PadFone((?!Mobile).)*$|Transformer|TF101|TF101G|TF300T|TF300TG|TF300TL|TF700T|TF700KL|TF701T|TF810C|ME171|ME301T|ME302C|ME371MG|ME370T|ME372MG|ME172V|ME173X|ME400C|Slider SL101|\bK00F\b|\bK00C\b|\bK00E\b|\bK00L\b|TX201LA|ME176C|ME102A|\bM80TA\b|ME372CL|ME560CG|ME372CG|ME302KL|PlayBook|RIM Tablet|HTC_Flyer_P512|HTC Flyer|HTC Jetstream|HTC-P715a|HTC EVO View 4G|PG41200|PG09410|xoom|sholest|MZ615|MZ605|MZ505|MZ601|MZ602|MZ603|MZ604|MZ606|MZ607|MZ608|MZ609|MZ615|MZ616|MZ617|Android.*Nook|NookColor|nook browser|BNRV200|BNRV200A|BNTV250|BNTV250A|BNTV400|BNTV600|LogicPD Zoom2|Android.*; \b(A100|A101|A110|A200|A210|A211|A500|A501|A510|A511|A700|A701|W500|W500P|W501|W501P|W510|W511|W700|G100|G100W|B1-A71|B1-710|B1-711|A1-810|A1-811|A1-830)\b|W3-810|\bA3-A10\b|\bA3-A11\b|Android.*(AT100|AT105|AT200|AT205|AT270|AT275|AT300|AT305|AT1S5|AT500|AT570|AT700|AT830)|TOSHIBA.*FOLIO|\bL-06C|LG-V909|LG-V900|LG-V700|LG-V510|LG-V500|LG-V410|LG-V400|LG-VK810\b|Android.*\b(F-01D|F-02F|F-05E|F-10D|M532|Q572)\b|PMP3170B|PMP3270B|PMP3470B|PMP7170B|PMP3370B|PMP3570C|PMP5870C|PMP3670B|PMP5570C|PMP5770D|PMP3970B|PMP3870C|PMP5580C|PMP5880D|PMP5780D|PMP5588C|PMP7280C|PMP7280C3G|PMP7280|PMP7880D|PMP5597D|PMP5597|PMP7100D|PER3464|PER3274|PER3574|PER3884|PER5274|PER5474|PMP5097CPRO|PMP5097|PMP7380D|PMP5297C|PMP5297C_QUAD|Idea(Tab|Pad)( A1|A10| K1|)|ThinkPad([ ]+)?Tablet|Lenovo.*(S2109|S2110|S5000|S6000|K3011|A3000|A3500|A1000|A2107|A2109|A1107|A5500|A7600|B6000|B8000|B8080)(-|)(FL|F|HV|H|)|Venue 11|Venue 8|Venue 7|Dell Streak 10|Dell Streak 7|Android.*\b(TAB210|TAB211|TAB224|TAB250|TAB260|TAB264|TAB310|TAB360|TAB364|TAB410|TAB411|TAB420|TAB424|TAB450|TAB460|TAB461|TAB464|TAB465|TAB467|TAB468|TAB07-100|TAB07-101|TAB07-150|TAB07-151|TAB07-152|TAB07-200|TAB07-201-3G|TAB07-210|TAB07-211|TAB07-212|TAB07-214|TAB07-220|TAB07-400|TAB07-485|TAB08-150|TAB08-200|TAB08-201-3G|TAB08-201-30|TAB09-100|TAB09-211|TAB09-410|TAB10-150|TAB10-201|TAB10-211|TAB10-400|TAB10-410|TAB13-201|TAB274EUK|TAB275EUK|TAB374EUK|TAB462EUK|TAB474EUK|TAB9-200)\b|Android.*\bOYO\b|LIFE.*(P9212|P9514|P9516|S9512)|LIFETAB|AN10G2|AN7bG3|AN7fG3|AN8G3|AN8cG3|AN7G3|AN9G3|AN7dG3|AN7dG3ST|AN7dG3ChildPad|AN10bG3|AN10bG3DT|AN9G2|INM8002KP|INM1010FP|INM805ND|Intenso Tab|TAB1004|M702pro|MegaFon V9|\bZTE V9\b|Android.*\bMT7A\b|E-Boda (Supreme|Impresspeed|Izzycomm|Essential)|Allview.*(Viva|Alldro|City|Speed|All TV|Frenzy|Quasar|Shine|TX1|AX1|AX2)|\b(101G9|80G9|A101IT)\b|Qilive 97R|Archos5|\bARCHOS (70|79|80|90|97|101|FAMILYPAD|)(b|)(G10| Cobalt| TITANIUM(HD|)| Xenon| Neon|XSK| 2| XS 2| PLATINUM| CARBON|GAMEPAD)\b|NOVO7|NOVO8|NOVO10|Novo7Aurora|Novo7Basic|NOVO7PALADIN|novo9-Spark|Sony.*Tablet|Xperia Tablet|Sony Tablet S|SO-03E|SGPT12|SGPT13|SGPT114|SGPT121|SGPT122|SGPT123|SGPT111|SGPT112|SGPT113|SGPT131|SGPT132|SGPT133|SGPT211|SGPT212|SGPT213|SGP311|SGP312|SGP321|EBRD1101|EBRD1102|EBRD1201|SGP351|SGP341|SGP511|SGP512|SGP521|SGP541|SGP551|SGP621|SGP612|\b(PI2010|PI3000|PI3100|PI3105|PI3110|PI3205|PI3210|PI3900|PI4010|PI7000|PI7100)\b|Android.*(K8GT|U9GT|U10GT|U16GT|U17GT|U18GT|U19GT|U20GT|U23GT|U30GT)|CUBE U8GT|MID1042|MID1045|MID1125|MID1126|MID7012|MID7014|MID7015|MID7034|MID7035|MID7036|MID7042|MID7048|MID7127|MID8042|MID8048|MID8127|MID9042|MID9740|MID9742|MID7022|MID7010|M9701|M9000|M9100|M806|M1052|M806|T703|MID701|MID713|MID710|MID727|MID760|MID830|MID728|MID933|MID125|MID810|MID732|MID120|MID930|MID800|MID731|MID900|MID100|MID820|MID735|MID980|MID130|MID833|MID737|MID960|MID135|MID860|MID736|MID140|MID930|MID835|MID733|MSI \b(Primo 73K|Primo 73L|Primo 81L|Primo 77|Primo 93|Primo 75|Primo 76|Primo 73|Primo 81|Primo 91|Primo 90|Enjoy 71|Enjoy 7|Enjoy 10)\b|Android.*(\bMID\b|MID-560|MTV-T1200|MTV-PND531|MTV-P1101|MTV-PND530)|Android.*(RK2818|RK2808A|RK2918|RK3066)|RK2738|RK2808A|IQ310|Fly Vision|(bq)?.*(Elcano|Curie|Edison|Maxwell|Kepler|Pascal|Tesla|Hypatia|Platon|Newton|Livingstone|Cervantes|Avant|Aquaris E10)|Maxwell.*Lite|Maxwell.*Plus|MediaPad|MediaPad 7 Youth|IDEOS S7|S7-201c|S7-202u|S7-101|S7-103|S7-104|S7-105|S7-106|S7-201|S7-Slim|\bN-06D|\bN-08D|Pantech.*P4100|Broncho.*(N701|N708|N802|a710)|TOUCHPAD.*[78910]|\bTOUCHTAB\b|z1000|Z99 2G|z99|z930|z999|z990|z909|Z919|z900|TB07STA|TB10STA|TB07FTA|TB10FTA|Android.*\bNabi|Kobo Touch|\bK080\b|\bVox\b Build|\bArc\b Build|NaviPad|TB-772A|TM-7045|TM-7055|TM-9750|TM-7016|TM-7024|TM-7026|TM-7041|TM-7043|TM-7047|TM-8041|TM-9741|TM-9747|TM-9748|TM-9751|TM-7022|TM-7021|TM-7020|TM-7011|TM-7010|TM-7023|TM-7025|TM-7037W|TM-7038W|TM-7027W|TM-9720|TM-9725|TM-9737W|TM-1020|TM-9738W|TM-9740|TM-9743W|TB-807A|TB-771A|TB-727A|TB-725A|TB-719A|TB-823A|TB-805A|TB-723A|TB-715A|TB-707A|TB-705A|TB-709A|TB-711A|TB-890HD|TB-880HD|TB-790HD|TB-780HD|TB-770HD|TB-721HD|TB-710HD|TB-434HD|TB-860HD|TB-840HD|TB-760HD|TB-750HD|TB-740HD|TB-730HD|TB-722HD|TB-720HD|TB-700HD|TB-500HD|TB-470HD|TB-431HD|TB-430HD|TB-506|TB-504|TB-446|TB-436|TB-416|TB-146SE|TB-126SE|Playstation.*(Portable|Vita)|ST10416-1|VT10416-1|ST70408-1|ST702xx-1|ST702xx-2|ST80208|ST97216|ST70104-2|VT10416-2|ST10216-2A|SurfTab|\b(PTBL10CEU|PTBL10C|PTBL72BC|PTBL72BCEU|PTBL7CEU|PTBL7C|PTBL92BC|PTBL92BCEU|PTBL9CEU|PTBL9CUK|PTBL9C)\b|Android.* \b(E3A|T3X|T5C|T5B|T3E|T3C|T3B|T1J|T1F|T2A|T1H|T1i|E1C|T1-E|T5-A|T4|E1-B|T2Ci|T1-B|T1-D|O1-A|E1-A|T1-A|T3A|T4i)\b |Genius Tab G3|Genius Tab S2|Genius Tab Q3|Genius Tab G4|Genius Tab Q4|Genius Tab G-II|Genius TAB GII|Genius TAB GIII|Genius Tab S1|Android.*\bG1\b|Funbook|Micromax.*\b(P250|P560|P360|P362|P600|P300|P350|P500|P275)\b|Android.*\b(A39|A37|A34|ST8|ST10|ST7|Smart Tab3|Smart Tab2)\b|Fine7 Genius|Fine7 Shine|Fine7 Air|Fine8 Style|Fine9 More|Fine10 Joy|Fine11 Wide|\b(PEM63|PLT1023G|PLT1041|PLT1044|PLT1044G|PLT1091|PLT4311|PLT4311PL|PLT4315|PLT7030|PLT7033|PLT7033D|PLT7035|PLT7035D|PLT7044K|PLT7045K|PLT7045KB|PLT7071KG|PLT7072|PLT7223G|PLT7225G|PLT7777G|PLT7810K|PLT7849G|PLT7851G|PLT7852G|PLT8015|PLT8031|PLT8034|PLT8036|PLT8080K|PLT8082|PLT8088|PLT8223G|PLT8234G|PLT8235G|PLT8816K|PLT9011|PLT9045K|PLT9233G|PLT9735|PLT9760G|PLT9770G)\b|BQ1078|BC1003|BC1077|RK9702|BC9730|BC9001|IT9001|BC7008|BC7010|BC708|BC728|BC7012|BC7030|BC7027|BC7026|TPC7102|TPC7103|TPC7105|TPC7106|TPC7107|TPC7201|TPC7203|TPC7205|TPC7210|TPC7708|TPC7709|TPC7712|TPC7110|TPC8101|TPC8103|TPC8105|TPC8106|TPC8203|TPC8205|TPC8503|TPC9106|TPC9701|TPC97101|TPC97103|TPC97105|TPC97106|TPC97111|TPC97113|TPC97203|TPC97603|TPC97809|TPC97205|TPC10101|TPC10103|TPC10106|TPC10111|TPC10203|TPC10205|TPC10503|TX-A1301|TX-M9002|Q702|kf026|TAB-P506|TAB-navi-7-3G-M|TAB-P517|TAB-P-527|TAB-P701|TAB-P703|TAB-P721|TAB-P731N|TAB-P741|TAB-P825|TAB-P905|TAB-P925|TAB-PR945|TAB-PL1015|TAB-P1025|TAB-PI1045|TAB-P1325|TAB-PROTAB[0-9]+|TAB-PROTAB25|TAB-PROTAB26|TAB-PROTAB27|TAB-PROTAB26XL|TAB-PROTAB2-IPS9|TAB-PROTAB30-IPS9|TAB-PROTAB25XXL|TAB-PROTAB26-IPS10|TAB-PROTAB30-IPS10|OV-(SteelCore|NewBase|Basecore|Baseone|Exellen|Quattor|EduTab|Solution|ACTION|BasicTab|TeddyTab|MagicTab|Stream|TB-08|TB-09)|HCL.*Tablet|Connect-3G-2.0|Connect-2G-2.0|ME Tablet U1|ME Tablet U2|ME Tablet G1|ME Tablet X1|ME Tablet Y2|ME Tablet Sync|DPS Dream 9|DPS Dual 7|V97 HD|i75 3G|Visture V4( HD)?|Visture V5( HD)?|Visture V10|CTP(-)?810|CTP(-)?818|CTP(-)?828|CTP(-)?838|CTP(-)?888|CTP(-)?978|CTP(-)?980|CTP(-)?987|CTP(-)?988|CTP(-)?989|\bMT8125|MT8389|MT8135|MT8377\b|Concorde([ ]+)?Tab|ConCorde ReadMan|GOCLEVER TAB|A7GOCLEVER|M1042|M7841|M742|R1042BK|R1041|TAB A975|TAB A7842|TAB A741|TAB A741L|TAB M723G|TAB M721|TAB A1021|TAB I921|TAB R721|TAB I720|TAB T76|TAB R70|TAB R76.2|TAB R106|TAB R83.2|TAB M813G|TAB I721|GCTA722|TAB I70|TAB I71|TAB S73|TAB R73|TAB R74|TAB R93|TAB R75|TAB R76.1|TAB A73|TAB A93|TAB A93.2|TAB T72|TAB R83|TAB R974|TAB R973|TAB A101|TAB A103|TAB A104|TAB A104.2|R105BK|M713G|A972BK|TAB A971|TAB R974.2|TAB R104|TAB R83.3|TAB A1042|FreeTAB 9000|FreeTAB 7.4|FreeTAB 7004|FreeTAB 7800|FreeTAB 2096|FreeTAB 7.5|FreeTAB 1014|FreeTAB 1001 |FreeTAB 8001|FreeTAB 9706|FreeTAB 9702|FreeTAB 7003|FreeTAB 7002|FreeTAB 1002|FreeTAB 7801|FreeTAB 1331|FreeTAB 1004|FreeTAB 8002|FreeTAB 8014|FreeTAB 9704|FreeTAB 1003|\b(Argus[ _]?S|Diamond[ _]?79HD|Emerald[ _]?78E|Luna[ _]?70C|Onyx[ _]?S|Onyx[ _]?Z|Orin[ _]?HD|Orin[ _]?S|Otis[ _]?S|SpeedStar[ _]?S|Magnet[ _]?M9|Primus[ _]?94[ _]?3G|Primus[ _]?94HD|Primus[ _]?QS|Android.*\bQ8\b|Sirius[ _]?EVO[ _]?QS|Sirius[ _]?QS|Spirit[ _]?S)\b|V07OT2|TM105A|S10OT1|TR10CS1|eZee[_']?(Tab|Go)[0-9]+|TabLC7|Looney Tunes Tab|SmartTab([ ]+)?[0-9]+|SmartTabII10|SmartTabII7|Smart[ ']?TAB[ ]+?[0-9]+|Family[ ']?TAB2|RM-790|RM-997|RMD-878G|RMD-974R|RMT-705A|RMT-701|RME-601|RMT-501|RMT-711|i-mobile i-note|tolino tab [0-9.]+|tolino shine\bC-22Q|T7-QC|T-17B|T-17P\b|Android.* A78 |Android.* (SKYPAD|PHOENIX|CYCLOPS)|TECNO P9|Android.*\b(F3000|A3300|JXD5000|JXD3000|JXD2000|JXD300B|JXD300|S5800|S7800|S602b|S5110b|S7300|S5300|S602|S603|S5100|S5110|S601|S7100a|P3000F|P3000s|P101|P200s|P1000m|P200m|P9100|P1000s|S6600b|S908|P1000|P300|S18|S6600|S9100)\b|Tablet (Spirit 7|Essentia|Galatea|Fusion|Onix 7|Landa|Titan|Scooby|Deox|Stella|Themis|Argon|Unique 7|Sygnus|Hexen|Finity 7|Cream|Cream X2|Jade|Neon 7|Neron 7|Kandy|Scape|Saphyr 7|Rebel|Biox|Rebel|Rebel 8GB|Myst|Draco 7|Myst|Tab7-004|Myst|Tadeo Jones|Tablet Boing|Arrow|Draco Dual Cam|Aurix|Mint|Amity|Revolution|Finity 9|Neon 9|T9w|Amity 4GB Dual Cam|Stone 4GB|Stone 8GB|Andromeda|Silken|X2|Andromeda II|Halley|Flame|Saphyr 9,7|Touch 8|Planet|Triton|Unique 10|Hexen 10|Memphis 4GB|Memphis 8GB|Onix 10)|FX2 PAD7|FX2 PAD10|KidsPAD 701|PAD[ ]?712|PAD[ ]?714|PAD[ ]?716|PAD[ ]?717|PAD[ ]?718|PAD[ ]?720|PAD[ ]?721|PAD[ ]?722|PAD[ ]?790|PAD[ ]?792|PAD[ ]?900|PAD[ ]?9715D|PAD[ ]?9716DR|PAD[ ]?9718DR|PAD[ ]?9719QR|PAD[ ]?9720QR|TelePAD1030|Telepad1032|TelePAD730|TelePAD731|TelePAD732|TelePAD735Q|TelePAD830|TelePAD9730|TelePAD795|MegaPAD 1331|MegaPAD 1851|MegaPAD 2151|ViewsonicTablet|ViewPad 10pi|ViewPad 10e|ViewPad 10s|ViewPad E72|ViewPad7|ViewPad E100|ViewPad 7e|ViewSonic VB733|VB100a|LOOX|XENO10|ODYS[ -](Space|EVO|Xpress|NOON)|\bXELIO\b|Xelio10Pro|XELIO7PHONETAB|XELIO10EXTREME|XELIOPT2|NEO_QUAD10|CAPTIVA PAD|NetTAB|NT-3702|NT-3702S|NT-3702S|NT-3603P|NT-3603P|NT-0704S|NT-0704S|NT-3805C|NT-3805C|NT-0806C|NT-0806C|NT-0909T|NT-0909T|NT-0907S|NT-0907S|NT-0902S|NT-0902S|T98 4G|\bP80\b|\bX90HD\b|X98 Air|X98 Air 3G|\bX89\b|P80 3G|\bX80h\b|P98 Air|\bX89HD\b|P98 3G|\bP90HD\b|P89 3G|X98 3G|\bP70h\b|P79HD 3G|G18d 3G|\bP79HD\b|\bP89s\b|\bA88\b|\bP10HD\b|\bP19HD\b|G18 3G|\bP78HD\b|\bA78\b|\bP75\b|G17s 3G|G17h 3G|\bP85t\b|\bP90\b|\bP11\b|\bP98t\b|\bP98HD\b|\bG18d\b|\bP85s\b|\bP11HD\b|\bP88s\b|\bA80HD\b|\bA80se\b|\bA10h\b|\bP89\b|\bP78s\b|\bG18\b|\bP85\b|\bA70h\b|\bA70\b|\bG17\b|\bP18\b|\bA80s\b|\bA11s\b|\bP88HD\b|\bA80h\b|\bP76s\b|\bP76h\b|\bP98\b|\bA10HD\b|\bP78\b|\bP88\b|\bA11\b|\bA10t\b|\bP76a\b|\bP76t\b|\bP76e\b|\bP85HD\b|\bP85a\b|\bP86\b|\bP75HD\b|\bP76v\b|\bA12\b|\bP75a\b|\bA15\b|\bP76Ti\b|\bP81HD\b|\bA10\b|\bT760VE\b|\bT720HD\b|\bP76\b|\bP73\b|\bP71\b|\bP72\b|\bT720SE\b|\bC520Ti\b|\bT760\b|\bT720VE\b|T720-3GE|T720-WiFi|\b(V975i|Vi30|VX530|V701|Vi60|V701s|Vi50|V801s|V719|Vx610w|VX610W|V819i|Vi10|VX580W|Vi10|V711s|V813|V811|V820w|V820|Vi20|V711|VI30W|V712|V891w|V972|V819w|V820w|Vi60|V820w|V711|V813s|V801|V819|V975s|V801|V819|V819|V818|V811|V712|V975m|V101w|V961w|V812|V818|V971|V971s|V919|V989|V116w|V102w|V973|Vi40)\b[\\s]+|TPC-PA762|Endeavour 800NG|Endeavour 1010|\b(iDx10|iDx9|iDx8|iDx7|iDxD7|iDxD8|iDsQ8|iDsQ7|iDsQ8|iDsD10|iDnD7|3TS804H|iDsQ11|iDj7|iDs10)\b|ARIA_Mini_wifi|Aria[ _]Mini|Evolio X10|Evolio X7|Evolio X8|\bEvotab\b|\bNeura\b|QPAD E704|\bIvoryS\b|E-TAB IVORY|CT695|CT888|CT[\\s]?910|CT7 Tab|CT9 Tab|CT3 Tab|CT2 Tab|CT1 Tab|C820|C720|\bCT-1\b|miTab \b(DIAMOND|SPACE|BROOKLYN|NEO|FLY|MANHATTAN|FUNK|EVOLUTION|SKY|GOCAR|IRON|GENIUS|POP|MINT|EPSILON|BROADWAY|JUMP|HOP|LEGEND|NEW AGE|LINE|ADVANCE|FEEL|FOLLOW|LIKE|LINK|LIVE|THINK|FREEDOM|CHICAGO|CLEVELAND|BALTIMORE-GH|IOWA|BOSTON|SEATTLE|PHOENIX|DALLAS|IN 101|MasterChef)\b|\bMI PAD\b|\bHM NOTE 1W\b|Nibiru M1|Nibiru Jupiter One|NEXO NOVA|NEXO 10|NEXO AVIO|NEXO FREE|NEXO GO|NEXO EVO|NEXO 3G|NEXO SMART|NEXO KIDDO|NEXO MOBI|UbiSlate[\\s]?7C|Pocketbook|Hudl HT7S3|T-Hub2|Android.*\b97D\b|Tablet(?!.*PC)|BNTV250A|MID-WCDMA|LogicPD Zoom2|\bA7EB\b|CatNova8|A1_07|CT704|CT1002|\bM721\b|rk30sdk|\bEVOTAB\b|M758A|ET904|ALUMIUM10|Smartfren Tab|Endeavour 1010|Tablet-PC-4|Tagi Tab|\bM6pro\b|CT1020W|arc 10HD|\bJolla\b/i.test( navigator.userAgent );

			}

			// Insert/append media player to page.
			function insertPlayer( umbgPlayer ) {
				if ( opts.mediaOverlay === 1 ) {

					$this.prepend( mediaOverlay );
					$this.prepend( umbgPlayer );

					if ( opts.delayBy > 0 ) {
						$( '.umbg-overlay' ).hide().fadeIn( 500 );
					}
				} else {

					$this.prepend( mediaOverlayTransparent );
					$this.prepend( umbgPlayer );
				}

				mediaLink();

			}// End insertPlayer().

			// Start - mediaLink().
			function mediaLink() {

				if ( opts.mediaLink > '' ) {
					$( 'body' ).addClass( 'umbg-body' );
					$( '.umbg-overlay' ).wrap( '<a class="umbg-overlay-link" href="' + opts.mediaLink + '" target="' + opts.mediaLinkTarget + '"></a>' );
				}
				//else {
				//	$( 'body' ).removeClass( 'umbg-body' );
				//}
			}// End mediaLink().

			// Construct UMBG with YouTube API.
			function ytPlayer() {

				var duration,
					timeUpdater = null
					;

				// Set the default video quality.
				if ( opts.videoQuality === undefined || 0 || '' || 'auto' ) {
					videoQuality = 'default';
				} else {
					videoQuality = opts.videoQuality;
				}

				// Create the html iframe video player element & insert/append it to the page.
				umbgMediaPlayer = '<div id="' + opts.mediaPlayerId + '"></div>';
				insertPlayer( umbgMediaPlayer );

				// Load YouTube API to the page.
				$.getScript( '//www.youtube.com/iframe_api', function ( data, textStatus, jqxhr ) {
					// console.log( data ); // Data returned
					// console.log( textStatus ); // Success
					// console.log( jqxhr.status ); // 200
					// console.log( "Load was performed." );
				} )
					.done( function () {

						// When YT Iframe API is ready add necessary vars and events.
						YT.ready( function () {
							player = new YT.Player( opts.mediaPlayerId, {
								videoId   : opts.mediaId,
								playerVars: {
									'enablejsapi'   : 1,
									'origin'        : window.location.origin,
									'autoplay'      : opts.autoPlay,
									'modesbranding' : 1,
									'playlist'      : opts.mediaId,
									'controls'      : 0,
									'iv_load_policy': 3,
									'rel'           : 0,
									'showinfo'      : 0,
									'html5'         : 1
								},
								events    : {
									'onReady'      : onPlayerReady,
									'onStateChange': onPlayerStateChange
								}
							} );

							play = function () {
								player.playVideo();
							};
							pause = function () {
								player.pauseVideo();
							};
							seek = function () {
								player.seekTo( startTime );
							};
							mute = function () {
								player.mute();
							};
							unmute = function () {
								player.unMute();
							};

							// If mediaStartFadeIn is enable and autoPlay is disable then hide the player.
							if ( opts.mediaStartFadeIn === 1 && opts.autoPlay === 0 ) {
								$( '#' + opts.mediaPlayerId + ', .umbg-overlay-link, .umbg-overlay' ).hide();
							}
						} );

					} )
					.fail( function ( data, textStatus, exception ) {
						console.log( 'The script for YT failed to load.' );
						console.log( 'Status: ' + textStatus ); // Error
						console.log( 'Exception: ' + data.status + ' - ' + exception ); // Exception code & status
					} );

				// Seek to appropriate start time & play video & set volume level.
				function onPlayerReady( event ) {
					if ( opts.startAudioMuted === 1 ) {
						// player.mute();
						// umbgMuted = 1;
						volumeMute();
					}

					// Auto playback. (Use 'false' in case autoPlay equals '').
					if ( opts.autoPlay === 0 || false ) {
						seek.call();

						setTimeout( function () {
							pause.call();

						}, 400 );
						umbgPlaying = 0;
					}
					else {
						playAction();
						event.target.seekTo( startTime );
						umbgPlaying = 1;
					}

					event.target.setVolume( volumeLevel );
					event.target.setPlaybackQuality( videoQuality );
				}

				// When video ends restart and pause, if looping restart video and play.
				// Player state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).
				function onPlayerStateChange( state ) {

					// Get the video duration and if stopTime is 0 or less or stopTime is > original duration then set to the original duration.
					duration = player.getDuration();
					if ( stopTime <= 0 || stopTime >= duration ) {
						stopTime = duration - 0.5;
					}

					if ( state.data === 1 ) {
						timeUpdater = setInterval( updateTime, 100 );
						umbgPlaying = 1;
						umbgInitialStart = 0;
						autoMefo();
					}

					if ( state.data === 2 || state.data === 0 ) {
						clearInterval( timeUpdater );
						umbgPlaying = 0;
					}

				} // End onPlayerStateChange().

				// Checking the current time
				function updateTime() {

					var oldStartTime = startTime;
					if ( player && player.getCurrentTime ) {
						startTime = player.getCurrentTime();
					}

					if ( startTime !== oldStartTime ) {
						onProgress( startTime );
					}
				}

				// If time changes then pause/stop or continue playing.
				function onProgress( currentTime ) {

					if ( currentTime >= stopTime ) {

						startTime = opts.startAt;
						mediaEnded = 1;
						autoPud();
						autoFio();
						autoMefo();

						if ( opts.loop === 0 ) {
							if ( rewindToStartAt === 1 ) {
								player.seekTo( startTime );
							}
							pauseAction( 'stop' );
						}
						else if ( opts.loop === 1 ) {
							pauseAction( 'stop' );
							player.seekTo( startTime );
							playAction();
						}
					}

				}

				// Page Visibility Pause.
				pvp();
				window.handleVisibilityChange = function () {

					if ( document[ hidden ] && userPause === 0 ) {
						pauseAction();
						umbgPlaying = 0;
						userPause = 0;

					} else if ( userPause === 0 ) {
						if ( mediaEnded === 1 ) {
							player.seekTo( startTime );
							mediaEnded = 0;
						}
						playAction();
						umbgPlaying = 1;
						userPause = 0;
					}
				};
				pvp2();
			} // End ytPlayer().

			// Construct UMBG with Vimeo API.
			function vimeoPlayer() {

				// Set video quality.
				if ( opts.videoQuality === 'default' || '' || undefined ) {
					videoQuality = 0;
				} else {
					videoQuality = opts.videoQuality;
				}

				// Create the html iframe video player element & insert(append) it to the page.
				umbgMediaPlayer = '<iframe id="' + opts.mediaPlayerId + '" src="https://player.vimeo.com/video/' +
					opts.mediaId + '?api=1&amp;player_id=' + opts.mediaPlayerId + '&amp;quality=' + videoQuality + '&amp;title=0&amp;byline=0&amp;portrait=0&amp;loop=' + opts.loop + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen ></iframe>';

				insertPlayer( umbgMediaPlayer );

				// Select the player element after it has been inserted, get the url & get the origin of the message for security purposes and declare variables.
				var vimeoVolume = ( volumeLevel / 100 ),
					vol = vimeoVolume,
					vDuration = 0,
					iframe,
					player
					;

				// Load Vimeo API to the page.
				$.getScript( 'https://f.vimeocdn.com/js/froogaloop2.min.js', function ( data, textStatus, jqxhr ) {
					//console.log( data ); // Data returned
					//console.log( textStatus ); // Success
					//console.log( jqxhr.status ); // 200
					//console.log( "Load was performed." );
				} )
					.done( function () {

						iframe = $( '#' + opts.mediaPlayerId )[ 0 ];
						player = $f( iframe )
						;


						// Set Vimeo API actions to media player.
						play = function () {
							player.api( 'play' );
						};
						pause = function () {
							player.api( 'pause' );
						};
						seek = function () {
							player.api( 'seekTo', startTime );
						};
						mute = function () {
							player.api( 'setVolume', '0' );
						};
						unmute = function () {
							player.api( 'setVolume', '' + vimeoVolume + '' );
						};


						/**
						 * Utility function for adding an event. Handles the inconsistencies
						 * between the W3C method for adding events (addEventListener) and
						 * IE's (attachEvent).
						 */
						function addEvent( element, eventName, callback ) {
							if ( element.addEventListener ) {
								element.addEventListener( eventName, callback, false );
							}
							else {
								element.attachEvent( eventName, callback, false );
							}
						}


						// When the player is ready, add listeners for play, pause, finish, and playProgress.
						player.addEvent( 'ready', function () {

							player.addEvent( 'play', onPlay );
							player.addEvent( 'playProgress', onPlayProgress );

							umbgInitialStart = 1;

							// If mediaStartFadeIn is enable and autoPlay is disable then hide the player.
							if ( opts.mediaStartFadeIn === 1 && opts.autoPlay === 0 ) {
								$( '#umbg, .umbg-overlay-link, .umbg-overlay' ).hide();
							}

							// Auto playback. (Use 'false' in case autoPlay equals '').
							if ( opts.autoPlay === 1 || false ) {

								seek.call();
							}
							else {
								pauseAction( 'stop' );
							}

							// Set volume.
							if ( opts.startAudioMuted === 1 ) {
								volumeMute();
								vol = '0';
								umbgMuted = 1;
							} else {
								volumeUnmute();
								umbgMuted = 0;
							}

						} );

						// Call the API when a necessary.
						function onPlay( data ) {

							vDuration = Math.floor( data.duration );

							if ( mediaEnded === 1 ) {
								seek.call();
								playAction();
							}
							else {
								playAction();
							}

						}

						function onPlayProgress( data ) {

							var vTime = Math.floor( data.seconds );

							// If stopTime is 0 or less || is > original duration then set original to duration.
							// Minus .5 secs (Vimeo calls the finish event without this).
							if ( stopTime <= 0 || stopTime >= vDuration ) {
								stopTime = vDuration;
							}

							// When stop time reached then pause video or restart if looping.
							// Minus a few secs or ms to stop Vimeo from calling the finish event.
							if ( ( stopTime > 0 && vTime >= stopTime ) || ( vTime >= vDuration ) ) {

								mediaEnded = 1;

								// Check if to loop video.
								if ( opts.loop === 1 ) {
									// Use pauseAction('stop') to trigger onPlaybackEnd.
									pauseAction( 'stop' );
									seek.call();
									playAction();
								} else {

									if ( rewindToStartAt === 1 ) {
										seek.call();
									}
									pauseAction( 'stop' );
									autoMefo();

								}// End check loop.
								autoPud();
								autoFio();
								//vEnd();

							}// End current time check.

						}


					} )
					.fail( function ( data, textStatus, exception ) {
						console.log( 'The script Vimeo failed to load.' );
						console.log( 'Status: ' + textStatus ); // Error
						console.log( 'Exception: ' + data.status + ' - ' + exception ); // Exception code & status
					} );

				//
				function vEnd() {
					setTimeout( function () {
						//return opts.onPlaybackEnd.call();
					}, 100 );
				}

				// Page Visibility Pause.
				pvp();
				window.handleVisibilityChange = function () {
					if ( document[ hidden ] && userPause === 0 ) {
						pauseAction();
						userPause = 0;
					} else if ( userPause === 0 ) {
						if ( mediaEnded === 1 ) {
							seek.call();
							mediaEnded = 0;
						}
						playAction();
						userPause = 0;
					}
				};
				pvp2();


			}// End vimeoPlayer().

			// Construct UMBG with Dailymotion API.
			function dailymotionPlayer() {

				// Set the default video quality.
				if ( opts.videoQuality === 'default' || 0 ) {
					videoQuality = 480;
				} else {
					videoQuality = opts.videoQuality;
				}

				umbgMediaPlayer = '<div id="' + opts.mediaPlayerId + '"></div>';
				insertPlayer( umbgMediaPlayer );


				// Select the player element after it has been inserted & Get the origin of the message for security purposes.
				var player,
					origin = document.location.protocol + '//www.dailymotion.com',
					t = 3000,
					t2 = 1000,
					dmVolume = ( volumeLevel / 100 ),
					vol = dmVolume,
					dmDuration,
					dmInitialStart = 1
					;

				// Load Dailymotion API to the page.
				$.getScript( 'https://api.dmcdn.net/all.js', function ( data, textStatus, jqxhr ) {
					//console.log( data ); // Data returned
					//console.log( textStatus ); // Success
					//console.log( jqxhr.status ); // 200
					//console.log( "Load was performed." );
				} )
					.done( function () {

						// Initialize dm.
						player = DM.player( document.getElementById( opts.mediaPlayerId ), {
							video : opts.mediaId,
							params: {
								autoplay  : opts.autoPlay,
								//start     : startTime,
								//mute      : opts.startAudioMuted,
								chromeless: 1,
								info      : 0,
								logo      : 0,
								quality   : videoQuality,
								related   : 0,
								origin    : origin
							}
						} );

						// Set playback actions.
						play = function () {
							player.play();
						};
						pause = function () {
							player.pause();
						};
						seek = function () {
							player.seek( startTime );
						};
						mute = function () {
							player.setVolume( 0 );
						};
						unmute = function () {
							player.setVolume( vol );
						};

						// If mediaStartFadeIn is enable and autoPlay is disable then hide the player.
						if ( opts.mediaStartFadeIn === 1 && opts.autoPlay === 0 ) {
							setMefo();
						}

						// Add DM event listeners.
						// Ad events.
						player.addEventListener( 'ad_start', function ( event ) {
							//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );

							player.setVolume( dmVolume );

							if ( opts.startAudioMuted === 1 && umbgInitialStart === 1 ) {
								volumeMute();
							} else if ( vol === 0 ) {
								volumeMute();
								vol = 0;
							} else {
								volumeUnmute();
								vol = dmVolume;
							}

							//$volumeButton.fadeOut( t2 );
							adEnded = 0;
							umbgPlaying = 1;
							umbgInitialStart = 0;
						} );

						player.addEventListener( 'ad_play', function ( event ) {
							//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );
						} );

						player.addEventListener( 'ad_end', function ( event ) {
							//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );

							$playButton.fadeIn( t );
							if ( opts.audio === 1 ) {
								$volumeButton.fadeIn( t2 );
							}
							adEnded = 1;
							mediaEnded = 0;
							umbgInitialStart = 1;
							dmInitialStart = 1;
							seek.call();
						} );

						// Regular DM playback events.
						player.addEventListener( 'start', function ( event ) {
							//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );

							player.setVolume( dmVolume );

							if ( opts.startAudioMuted === 1 && umbgInitialStart === 1 ) {
								volumeMute();
							} else if ( vol === 0 ) {
								volumeMute();
								vol = 0;
							} else {
								volumeUnmute();
								vol = dmVolume;
							}

						} );

						player.addEventListener( 'durationchange', function ( event ) {
							//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );
							onDurationChange();
						} );

						player.addEventListener( 'video_start', function ( event ) {
							//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );

							seek.call();
							umbgPlaying = 1;
							adEnded = 1;

							// Check for overall DM initial start and run callback.
							if ( umbgInitialStart === 1 && dmInitialStart === 1 ) {
								delayedCallback( 'start' );
								umbgInitialStart = 0;
							}

						} );

						player.addEventListener( 'play', function ( event ) {
							//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );

							removeMefo();
						} );

						player.addEventListener( 'timeupdate', function ( event ) {
							if ( umbgPlaying === 1 ) {
								onTimeUpdate( player.currentTime );
							}
						} );

					} )
					.fail( function ( data, textStatus, exception ) {
						console.log( 'The script DM failed to load.' );
						console.log( 'Status: ' + textStatus ); // Error
						console.log( 'Exception: ' + data.status + ' - ' + exception ); // Exception code & status
					} );

				function onDurationChange() {
					dmDuration = Math.floor( player.duration );
				}

				// After setting the video duration, play the video.
				function onTimeUpdate( dmtime ) {

					if ( stopTime <= 0 ) {
						stopTime = dmDuration - 1;//0.75;
					}


					// If opts.endAt is set, then opts.endAt is end time, else play to the end & restart.
					//if ( ( stopTime > 0 && dmtime >= stopTime - 0.5 ) || ( dmtime >= dmDuration - 0.5 ) ) {
					if ( stopTime > 0 && dmtime >= stopTime ) {

						mediaEnded = 1;
						dmInitialStart = 0;

						// If looping then restart & play the video, else restart & pause.
						if ( opts.loop === 1 ) {
							pauseAction( 'stop' );
							seek.call();
							playAction();

						} else {

							umbgPlaying = 0;

							// If video has ad then make sure ad has ended before stopping playback.
							if ( adEnded === 1 && dmInitialStart === 0 ) {

								pauseAction( 'stop' );

								if ( rewindToStartAt === 1 ) {
									seek.call();
								}

							} //

						} // End loop check.

						autoPud();
						autoFio();
						autoMefo();

					} // End

				} // End onTimeUpdate().

				// Page Visibility Pause function.
				pvp();
				window.handleVisibilityChange = function () {
					if ( document[ hidden ] && userPause === 0 ) {
						pauseAction();
						umbgPlaying = 0;
						userPause = 0;
					} else if ( userPause === 0 ) {
						if ( mediaEnded === 1 ) {
							seek.call();
							mediaEnded = 0;
						}
						playAction();
						umbgPlaying = 1;
						userPause = 0;
					}
				};
				pvp2();

			}// End dailymotionPlayer().

			// Construct UMBG with Wistia API.
			function wistiaPlayer() {

				// Variables for Wistia.
				var doNotTrack;

				// Set the default video quality.
				if ( opts.videoQuality === undefined || 0 || '' ) {
					videoQuality = 'default';
				} else {
					videoQuality = opts.videoQuality;
				}

				// Set the doNotTrack option for Wistia.
				if ( opts.wistiaDoNotTrack === 1 ) {
					doNotTrack = true;
				} else {
					doNotTrack = false;
				}

				// Create the html iframe video player element & insert/append it to the page.
				umbgMediaPlayer = '<iframe id="' + opts.mediaPlayerId + '" src="http://fast.wistia.net/embed/iframe/' +
					opts.mediaId + '?controlsVisibleOnLoad=false&version=v1&chromeless=true&wmode=window&autoPlay=false' +
					'&doNotTrack=' + doNotTrack + '&playButton=false&videoQuality=' + opts.videoQuality + '"' +
					'allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" ></iframe>';
				insertPlayer( umbgMediaPlayer );

				// If mediaStartFadeIn is enable and autoPlay is disable then hide the player.
				if ( opts.mediaStartFadeIn === 1 && opts.autoPlay === 0 ) {
					$( '#' + opts.mediaPlayerId + ', .umbg-overlay-link, .umbg-overlay' ).hide();
				}

				// Load Wistia API to the page.
				$.getScript( '//fast.wistia.net/static/iframe-api-v1.js', function ( data, textStatus, jqxhr ) {
					//console.log( data ); // Data returned
					//console.log( textStatus ); // Success
					//console.log( jqxhr.status ); // 200
					//console.log( "Load was performed." );
				} )
					.done( function () {

						//$volumeButton.trigger();
						var wistiaEmbed = document.getElementById( opts.mediaPlayerId );

						// Set playback actions.
						play = function () {
							wistiaEmbed.wistiaApi.play();
						};
						pause = function () {
							wistiaEmbed.wistiaApi.pause();
						};
						seek = function () {
							wistiaEmbed.wistiaApi.time( startTime );
						};
						mute = function () {
							wistiaEmbed.wistiaApi.volume( 0 );
						};
						unmute = function () {
							wistiaEmbed.wistiaApi.volume( volumeLevel / 100 );
						};

						// Start audio action.
						if ( opts.startAudioMuted === 1 ) {
							volumeMute();
						} else {
							volumeUnmute();
						}

						// Auto playback. (Use 'false' in case autoPlay equals '').
						if ( opts.autoPlay === 0 || false ) {
							pauseAction( 'stop' );
							seek.call();
						}
						else {
							seek.call();
							playAction();
						}

						// When video ends, restart and pause, if looping, restart and play.
						wistiaEmbed.wistiaApi.bind( 'timechange', function ( t ) {

							var wTime = Math.floor( t );

							// If endAt is less than or equal 0 OR endAt > original duration then set original duration.
							if ( stopTime <= 0 || stopTime >= wistiaEmbed.wistiaApi.duration() ) {
								stopTime = wistiaEmbed.wistiaApi.duration();
							}

							stopTime = Math.floor( stopTime );

						} );

						wistiaEmbed.wistiaApi.bind( 'secondchange', function ( s ) {

							if ( s >= stopTime || wistiaEmbed.wistiaApi.state() === 'ended' ) {

								// Run PUD and FIO functions.
								autoPud();
								autoFio();
								mediaEnded = 1;

								// Check if to loop the video.
								if ( opts.loop === 1 ) {
									pauseAction( 'stop' );
									wistiaEmbed.wistiaApi.time( startTime );
									playAction();
									umbgPlaying = 1;
								} else {
									if ( rewindToStartAt === 1 ) {
										wistiaEmbed.wistiaApi.time( startTime );
									}
									pauseAction( 'stop' );
									umbgPlaying = 0;
								} // End loop check.

								autoMefo();
							}
						} );


					} )
					.fail( function ( data, textStatus, exception ) {
						console.log( 'The script for Wistia failed to load.' );
						console.log( 'Status: ' + textStatus ); // Error
						console.log( 'Exception: ' + data.status + ' - ' + exception ); // Exception code & status
					} );

				// Page Visibility Pause function.
				pvp();
				window.handleVisibilityChange = function () {
					if ( document[ hidden ] && userPause === 0 ) {
						pauseAction();
						umbgPlaying = 0;
						userPause = 0;
					} else if ( userPause === 0 ) {
						if ( mediaEnded === 1 ) {
							seek.call();
							mediaEnded = 0;
						}
						playAction();
						umbgPlaying = 1;
						userPause = 0;
					}
				};
				pvp2();

			}// End wistiaPlayer().

			// Construct UMBG with HTML5 API.
			function htmlPlayer() {

				var autoplay = '';

				// Remove the filename extension.
				var $file = opts.mediaId;
				$file = $file.substring( 0, $file.lastIndexOf( '.' ) );

				// Create the html video player & insert(append) it to the page.
				umbgMediaPlayer = $( '<video id="' + opts.mediaPlayerId + '" poster="' + opts.mediaPoster + '" preload="auto" ' + autoplay + ' >' +
					'<source src="' + $file + '.mp4" type="video/mp4">' +
					'<source src="' + $file + '.webm" type="video/webm">' +
					'<source src="' + $file + '.ogv" type="video/ogg">' +
					// Add the fallback image for devices or browsers that don't support video tag.
					'<img src="' + opts.mediaPoster + '" alt="" />' +
					'</video>' );
				insertPlayer( umbgMediaPlayer );

				// If mediaStartFadeIn is enable and autoPlay is disable then hide the player.
				if ( opts.mediaStartFadeIn === 1 && opts.autoPlay === 0 ) {
					$( '#umbg, .umbg-overlay-link, .umbg-overlay' ).hide();
				}

				// Select the video player element once it's inserted to the page.
				var videoElement = document.getElementById( opts.mediaPlayerId );

				// Set playback actions.
				play = function () {
					videoElement.play();
					autoMefo();
				};
				pause = function () {
					videoElement.pause();
				};
				seek = function () {
					videoElement.currentTime = startTime;
				};

				mute = function () {
					videoElement.muted = 'muted';
				};
				unmute = function () {
					videoElement.muted = '';
				};

				// Set audio and volume.
				if ( opts.audio === 0 || opts.startAudioMuted === 1 ) {
					videoElement.muted = true;
					umbgMuted = 1;

				} else {
					videoElement.muted = false;
					videoElement.volume = volumeLevel / 100;
					umbgMuted = 0;
				}

				//  Get the video duration & start the video at 'startTime' during loadmetadata event.
				videoElement.addEventListener( 'loadedmetadata', function ( event ) {
					//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );
					videoElement.currentTime = startTime;

					// Auto playback.
					if ( opts.autoPlay === 1 ) {
						playAction();
					}

				}, false );

				//  Play event.
				videoElement.addEventListener( 'play', function ( event ) {
					//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );
					mediaEnded = 0;
				}, false );

				// Playing event.
				videoElement.addEventListener( 'playing', function ( event ) {
					//console.log( 'event ' + event.type + ' received on ' + event.target + '!' );
				}, false );

				//  Get the current and remaining times & end video at 'opts.EndAt' & if looping restart video.
				videoElement.addEventListener( 'timeupdate', function () {
					//  Current time
					var cTime = videoElement.currentTime;

					if ( stopTime > 0 && cTime >= stopTime ) {
						onHtmlEnd();
					}

				}, false );

				// If looping then restart the video.
				videoElement.addEventListener( 'ended', function () {
					onHtmlEnd();
				}, false );

				// When video ends initiate appropriate actions.
				function onHtmlEnd() {
					if ( opts.loop === 1 ) {
						videoElement.currentTime = startTime;
						playAction();
					} else {
						if ( rewindToStartAt === 1 ) {
							videoElement.currentTime = startTime;
						}
						pauseAction( 'stop' );
						mediaEnded = 1;
					}
					autoPud();
					autoFio();
					autoMefo();
					opts.onPlaybackEnd.call();
				}

				// Page Visibility Pause
				pvp();
				window.handleVisibilityChange = function () {
					if ( document[ hidden ] && userPause === 0 ) {
						pauseAction();
						umbgPlaying = 0;
						userPause = 0;

					} else if ( userPause === 0 ) {
						if ( mediaEnded === 1 ) {
							videoElement.currentTime = startTime;
							mediaEnded = 0;
						}
						playAction();
						umbgPlaying = 1;
						userPause = 0;
					}
				};
				pvp2();

			}// End html5Player().

			// Construct UMBG with UMBG-Slider.
			function imagePlayer( type ) {

				// Find current file location to use with the adding of umbg-slider.js. Making sure umbg-slider loads after umbg.
				var scriptElements = document.getElementsByTagName( 'script' ),
					jsfile = 'jquery.umbg.js',
					i,
					myfile,
					myurl
					;

				for ( i = 0; scriptElements[ i ]; i ++ ) {
					myfile = scriptElements[ i ].src;
					if ( myfile.indexOf( jsfile ) >= 0 ) {
						myurl = myfile.substring( 0, myfile.indexOf( jsfile ) );
					}
				}

				// Add umbg-slider.css to <head> tag.
				var cssLink = document.createElement( 'link' );
				cssLink.id = 'umbg-slider-style-css';
				cssLink.media = 'all';
				cssLink.type = 'text/css';
				cssLink.href = myurl + 'umbg-slider/umbg-slider.css?ver=1.1.0';
				cssLink.rel = 'stylesheet';
				// Insert/append before UMBG main CSS stylesheet else append to <head>.
				if ( $( '#umbg-style-css' ) ) {
					$( '#umbg-style-css' ).before( cssLink );
				} else {
					$( 'head' ).append( cssLink );
				}

				// Create array from opts.mediaId data.
				var img_arr1 = opts.mediaId,
					img_arr2 = img_arr1.split( ',' );

				var imgs = [];
				for ( i = 0; i < img_arr2.length; i ++ ) {
					imgs += '<div>' +
						'<img id="umbg-slider-img" src="' + img_arr2[ i ] + '" />' +
						'</div>';
				}

				// Create the html video player & insert(append) it to the page.
				umbgMediaPlayer = $( '<div id="umbg" class="umbg-slider-container">' +
					imgs +
					'</div>' );

				insertPlayer( umbgMediaPlayer );

				// Load jquery.umbg.slider.js to the page.
				$.getScript( myurl + 'umbg-slider/jquery.umbg.slider.js?ver=1.3.0', function ( data, textStatus, jqxhr ) {
					//console.log( data ); // Data returned
					//console.log( textStatus ); // Success
					//console.log( jqxhr.status ); // 200
					//console.log( "Load was performed." );
				} )
					.done( function () {

						// Initialize umbg-slider.
						$( 'body' ).umbgslider( {
							'duration'         : + opts.slideShowDuration,
							'effect'           : opts.slideShowEffect, // 'random', 'zoomIn', 'zoomOut', 'panLeft', 'panRight', 'panUp', 'panDown', 'crossFade'
							'transition'       : + opts.slideShowTransitionDuration,
							'effectEasing'     : opts.slideShowEasing, // ease, linear, ease-in, ease-out, ease-in-out
							'loop'             : + opts.loop,
							'rewind'           : + opts.rewindToStartAt,
							'autoPlay'         : + opts.autoPlay,
							'endSliderFunction': function () {

								mediaEnded = 1;
								autoPud();
								autoFio();
								autoMefo();

								var delayCallback;

								// Set proper delay time for playback end callback.
								if ( opts.rewindToStartAt === 1 || opts.loop === 1 ) {
									delayCallback = opts.slideShowDuration;
								} else {
									delayCallback = opts.slideShowDuration + opts.slideShowTransitionDuration;
								}

								// Run proper callback function based on loop option.
								if ( opts.loop === 0 ) {

									pauseAction( 'stop', delayCallback );

								} else {

									delayedCallback( 'end', delayCallback );

								}

							} //

						} );

						// Set playback actions.
						play = function () {
							$this.umbgslider.play();
						};
						pause = function () {
							$this.umbgslider.pause();
						};

						seek = function () {
							return null;
						};

						// If 'image' type then run the following.
						if ( type === 'image' ) {
							// Declare imagePlayer() variables.
							var ssLength = img_arr2.length - 1,
								endReached = 0,
								sstms = + opts.slideShowDuration,
								sstmins = ( sstms / 1000 ),
								ssLoopingTime
								;

							// If only one image then no need to show play button.
							if ( ssLength === 0 ) {
								$playButton.fadeOut( 'slow' ).hide();
							}

							// Auto playback.
							if ( opts.autoPlay === 1 && ssLength > 0 ) {
								playAction();
							}

							// Page Visibility Pause
							pvp();
							window.handleVisibilityChange = function () {
								if ( document[ hidden ] && userPause === 0 ) {
									if ( umbgPlaying === 1 ) {
										umbgPlaying = 0;
										pauseAction();
										userPause = 0;
									}

								} else if ( userPause === 0 ) {
									umbgPlaying = 1;
									endReached = 1;
									playAction();
									userPause = 0;
								}
							};
							pvp2();

						} // End - if 'image' type.

					} )
					.fail( function ( data, textStatus, exception ) {
						console.log( 'The script jquery.umbg.slider.js failed to load.' );
						console.log( 'Status: ' + textStatus ); // Error
						console.log( 'Exception: ' + data.status + ' - ' + exception ); // Exception code & status
					} );

			}// End imagePlayer().

			// START - UMBG PLAYBACK ACTIONS AND BUTTONS

			// PLAY/PAUSE BUTTONS
			// Play functionality
			function playAction( action ) {

				// Set default action.
				action = ( action !== 'initial' ) ? 'restart' : 'initial';

				removeMefo();

				// If media has ended then start at beginning.
				if ( mediaEnded === 1 && opts.mediaType !== 'image' ) {
					mediaEnded = 0;
					seek.call();
				}

				play.call();
				userPause = 0;
				umbgPlaying = 1;
				playPauseButton();

				// If playback start is initial, run necessary initial code.
				if ( umbgInitialStart === 1 ) {

					if ( $.isFunction( opts.onPlaybackStart ) && ( ( umbgInitialStart === 1 && adEnded === 1 ) || ( opts.mediaPlayerType !== 'dailymotion' && umbgPlaying === 1 ) ) ) {

						opts.onPlaybackStart.call();
						//delayedCallback( 'start', 100 );
						umbgInitialStart = 0;
					}

				}

			} // End - playAction().

			// Pause functionality
			function pauseAction( action, delay ) {

				// Set default parameters.
				action = ( action !== 'stop' ) ? 'pause' : 'stop';
				delay = ( ! delay ) ? 100 : delay;

				// Call all necessary actions for playback.
				pause.call();
				userPause = 1;
				umbgPlaying = 0;
				playPauseButton();

				if ( ( $.isFunction( opts.onPlaybackPause ) ) && action !== 'stop' && ! document[ hidden ] ) {

					if ( opts.mediaPlayerType !== 'dailymotion' ) {
						delayedCallback( 'pause', delay );
					}
					else if ( opts.mediaPlayerType === 'dailymotion' && adEnded === 1 ) {
						delayedCallback( 'pause', delay );
					}
				}

				if ( action === 'stop' && mediaEnded === 1 ) {
					//opts.onPlaybackEnd.call();
					delayedCallback( 'end', delay );
				}

			} // End - pauseAction();

			// Play button toggle function.
			function playToggle() {

				if ( isMediaPlaying() ) {
					pauseAction();
				} else {
					playAction();
				}

			} // End - playToggle().

			// Function to check if media is playing.
			function isMediaPlaying() {

				if ( umbgPlaying === 1 ) {
					return true;
				}
				else {
					return false;
				}
			} // End - isMediaPlaying().

			// Built and handle each playback button functionality.
			function playPauseButton() {

				$( '.umbg-play-button' ).each( function ( index, elem ) {

					// Button variables.
					var $this = $( elem ),
						p1 = $this.data( 'umbg-play-text' ),
						p2 = $this.data( 'umbg-pause-text' ),
						i1 = $this.data( 'umbg-play-icon' ),
						i2 = $this.data( 'umbg-pause-icon' ),
						ip = $this.data( 'umbg-icon-placement' ),
						v1,
						v2
						;

					// Check if playback text is available.
					p1 = ( p1 ) ? p1 : '';
					p2 = ( p2 ) ? p2 : '';

					// Check if playback icons are available and set necessary button markup.
					if ( i1 && i2 ) {

						// Payback icon placement.
						if ( ip === 'right' ) {
							v1 = p1 + ' <i class="umbg-playback-icon ' + i1 + '"></i>';
							v2 = p2 + ' <i class="umbg-playback-icon ' + i2 + '"></i>';
						} else {
							v1 = '<i class="umbg-playback-icon ' + i1 + '"></i> ' + p1;
							v2 = '<i class="umbg-playback-icon ' + i2 + '"></i> ' + p2;
						}

					} else {
						v1 = p1;
						v2 = p2;
					}

					// Set button HTML value based on playback.
					if ( isMediaPlaying() === false ) {
						$this.html( v1 );
					} else {
						$this.html( v2 );
					}

				} );

			} // End - playButton().

			// Run playPauseButton to set proper button text/icons.
			playPauseButton();

			// Play button click event.
			$playButton.on( 'click', function ( e ) {
				e.preventDefault();
				playToggle();
			} );

			// PUD BUTTON
			// PUD button toggle function.
			function pudToggle() {

				if ( opts.pud === 1 ) {
					if ( pudPosition === 'up' ) {
						pageDown();
					} else if ( pudPosition === 'down' ) {
						pageUp();
					}
				}

				pudButton();

			}

			// PUD button click event.
			$pudButton.on( 'click', function ( e ) {
				e.preventDefault();
				pudToggle();
			} );

			// Built and handle each PUD button functionality.
			function pudButton() {

				$( '.umbg-pud-button' ).each( function ( index, elem ) {

					// Button variables.
					var $this = $( elem ),
						f1 = $this.data( 'umbg-page-down-text' ),
						f2 = $this.data( 'umbg-page-up-text' ),
						i1 = $this.data( 'umbg-page-down-icon' ),
						i2 = $this.data( 'umbg-page-up-icon' ),
						ip = $this.data( 'umbg-icon-placement' ),
						v1,
						v2
						;

					// Check if playback text is available.
					f1 = ( f1 ) ? f1 : '';
					f2 = ( f2 ) ? f2 : '';

					// Check if playback icons are available and set necessary button markup.
					if ( i1 && i2 ) {

						// Payback icon placement.
						if ( ip === 'right' ) {
							v1 = f1 + ' <i class="umbg-playback-icon ' + i1 + '"></i>';
							v2 = f2 + ' <i class="umbg-playback-icon ' + i2 + '"></i>';
						} else {
							v1 = '<i class="umbg-playback-icon ' + i1 + '"></i> ' + f1;
							v2 = '<i class="umbg-playback-icon ' + i2 + '"></i> ' + f2;
						}

					} else {
						v1 = f1;
						v2 = f2;
					}

					// Set button HTML value based on playback.
					if ( pudPosition === 'up' ) {
						$this.html( v1 );
					} else {
						$this.html( v2 );
					}

				} );

			} // End - pudButton().

			// Run pudButton to set proper button text/icons.
			pudButton();

			// FIO BUTTON
			// Built and handle each FIO button functionality.
			function fioButton() {

				$( '.umbg-fio-button' ).each( function ( index, elem ) {

					// Button variables.
					var $this = $( elem ),
						f1 = $this.data( 'umbg-fade-in-text' ),
						f2 = $this.data( 'umbg-fade-out-text' ),
						i1 = $this.data( 'umbg-fade-in-icon' ),
						i2 = $this.data( 'umbg-fade-out-icon' ),
						ip = $this.data( 'umbg-icon-placement' ),
						v1,
						v2
						;

					// Check if playback text is available.
					f1 = ( f1 ) ? f1 : '';
					f2 = ( f2 ) ? f2 : '';

					// Check if playback icons are available and set necessary button markup.
					if ( i1 && i2 ) {

						// Payback icon placement.
						if ( ip === 'right' ) {
							v1 = f1 + ' <i class="umbg-playback-icon ' + i1 + '"></i>';
							v2 = f2 + ' <i class="umbg-playback-icon ' + i2 + '"></i>';
						} else {
							v1 = '<i class="umbg-playback-icon ' + i1 + '"></i> ' + f1;
							v2 = '<i class="umbg-playback-icon ' + i2 + '"></i> ' + f2;
						}

					} else {
						v1 = f1;
						v2 = f2;
					}

					// Set button HTML value based on playback.
					if ( fioStatus === 'off' ) {
						$this.html( v1 );
					} else {
						$this.html( v2 );
					}

				} );

			} // End - fioButton().

			// Run fioButton to set proper button text/icons.
			fioButton();

			// FIO button toggle function.
			function fioToggle() {

				if ( fioStatus === 'off' ) {
					setFioOpacity();

				} else if ( fioStatus === 'on' ) {
					removeFioOpacity();
				}

			} // End - fioToggle().

			// FIO button click event.
			$fioButton.on( 'click', function ( e ) {
				e.preventDefault();
				fioToggle();
			} );

			// VOLUME BUTTON
			// Volume button unmute functionality.
			function volumeUnmute() {
				unmute.call();
				umbgMuted = 0;
				volumeButton();
			}

			// Volume button mute functionality.
			function volumeMute() {
				mute.call();
				umbgMuted = 1;
				volumeButton();
			}

			// Volume button toggle function.
			function volumeToggle() {

				if ( umbgMuted === 1 ) {
					volumeUnmute();
				}
				else {
					volumeMute();
				}

			} // End -volumeToggle().

			// Volume button click event.
			$volumeButton.on( 'click', function ( e ) {
				e.preventDefault();
				volumeToggle();
			} );

			// Built and handle each volume button functionality.
			function volumeButton() {

				$( '.umbg-volume-button' ).each( function ( index, elem ) {

					// Button variables.
					var $this = $( elem ),
						mx1 = $this.data( 'umbg-mute-text' ),
						mx2 = $this.data( 'umbg-unmute-text' ),
						ix1 = $this.data( 'umbg-mute-icon' ),
						ix2 = $this.data( 'umbg-unmute-icon' ),
						ixp = $this.data( 'umbg-icon-placement' ),
						vx1,
						vx2
						;

					// Check if playback text is available.
					mx1 = ( mx1 ) ? mx1 : '';
					mx2 = ( mx2 ) ? mx2 : '';

					// Check if playback icons are available and set necessary button markup.
					if ( ix1 && ix2 ) {

						// Payback icon placement.
						if ( ixp === 'right' ) {
							vx1 = mx1 + ' <i class="umbg-playback-icon ' + ix1 + '"></i>';
							vx2 = mx2 + ' <i class="umbg-playback-icon ' + ix2 + '"></i>';
						} else {
							vx1 = '<i class="umbg-playback-icon ' + ix1 + '"></i> ' + mx1;
							vx2 = '<i class="umbg-playback-icon ' + ix2 + '"></i> ' + mx2;
						}

					} else {
						vx1 = mx1;
						vx2 = mx2;
					}

					// Set button HTML value based on playback.
					if ( umbgMuted === 1 ) {
						$this.html( vx2 );
					} else {
						$this.html( vx1 );
					}

				} );

			} // End - volumeButton().

			// Run volumeButton to set proper button text/icons.
			volumeButton();

			// SCROLL-TO-TOP BUTTON
			if ( opts.enableScrollToTopButton === 1 ) {
				var scrollToTopBtn = '<a class="umbg-scroll-to-top-button" href="#"><i class="umbg-player-icon fa fa-angle-up" ></i></a>';

				// Check where controls are located and append scroll button accordingly.
				if ( opts.placeControls === ( 'umbg-br' || 'umbg-tr' ) ) {
					$( scrollToTopBtn ).prependTo( '.umbg-player-controls' ).hide();
				} else {
					$( scrollToTopBtn ).appendTo( '.umbg-player-controls' ).hide();
				}

				// If the window is not on top then display scroll button.
				$( window ).on( 'load scroll', function () {

					if ( $( window ).scrollTop() > 100 ) {
						$( '.umbg-scroll-to-top-button' ).fadeIn( 'slow' );
					} else {
						$( '.umbg-scroll-to-top-button' ).fadeOut( 'slow' );
					}

				} );

				// Scroll button click.
				$( '.umbg-scroll-to-top-button' ).click( function ( e ) {
					e.preventDefault();

					$( 'html, body' ).animate( { scrollTop: 0 }, 800 );
				} );

			}

			// KEYBOARD CONTROLS
			// Use keyboard controls if option is enabled.
			if ( opts.keyboardControls === 1 ) {

				// Allowed keycodes to use.
				var keysArr = [ 32, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122 ];

				// Trigger keyboard use on 'keydown' event.
				$( document ).on( 'keydown', function ( e ) {
					if ( opts.preventBrowserKeys ) {
						e.preventDefault();
					}

					e = e || event;

					var charName;
					var keyCode = e.which;
					var keyChar;
					var specialKeyName = ( e.shiftKey ? 'SHIFT' : '') || (e.ctrlKey ? 'CTRL' : '') || (e.altKey ? 'ALT' : '');

					// Get key name from keycode.
					switch ( keyCode ) {
						case 32: // left
							keyChar = 'SPACE';
							break;
						case 37: // left
							keyChar = 'LEFT';
							break;
						case 38: // up
							keyChar = 'UP';
							break;
						case 39: // right
							keyChar = 'RIGHT';
							break;
						case 40: // down
							keyChar = 'DOWN';
							break;
						default:
							keyChar = String.fromCharCode( keyCode );
							break;
					}

					// Check if keyCode is in allowed keys array.
					var inKeys = $.inArray( keyCode, keysArr );

					// Get the key character pressed.
					if ( specialKeyName.length > 2 && inKeys < 0 ) {

						charName = specialKeyName;

					} else if ( specialKeyName.length < 2 && ( inKeys > - 1 ) ) {

						charName = keyChar;

					} else {

						charName = '';

					}

					// If the key character matches then run the correct action.
					switch ( charName.toUpperCase() ) {
						case opts.keyboardTogglePlay:
							playToggle();
							break;
						case opts.keyboardPlay:
							playAction();
							break;
						case opts.keyboardPause:
							pauseAction();
							break;
						case opts.keyboardToggleVolume:
							volumeToggle();
							break;
						case opts.keyboardMute:
							volumeMute();
							break;
						case opts.keyboardUnmute:
							volumeUnmute();
							break;
						case opts.keyboardTogglePud:
							pudToggle();
							break;
						case opts.keyboardPudPageDown:
							pageDown();
							break;
						case opts.keyboardPudPageUp:
							pageUp();
							break;
						case opts.keyboardToggleFio:
							fioToggle();
							break;
						case opts.keyboardFioFadeIn:
							removeFioOpacity();
							break;
						case opts.keyboardFioFadeOut:
							setFioOpacity();
							break;

					}

				} );
			}

			// PUBLIC METHODS
			$.fn.umbg.togglePlay = function () {
				playToggle();
			};

			$.fn.umbg.play = function () {
				playAction();
			};

			$.fn.umbg.isPlaying = function () {
				isMediaPlaying();
			};

			$.fn.umbg.pause = function () {
				pauseAction();
			};

			$.fn.umbg.toggleVolume = function () {
				volumeToggle();
			};

			$.fn.umbg.mute = function () {
				volumeMute();
			};

			$.fn.umbg.unMute = function () {
				volumeUnmute();
			};

			$.fn.umbg.pudDown = function () {
				pageDown();
			};

			$.fn.umbg.pudUp = function () {
				pageUp();
			};

			$.fn.umbg.togglePud = function () {
				pudToggle();
			};

			$.fn.umbg.toggleFio = function () {
				fioToggle();
			};

			$.fn.umbg.fioFadeIn = function () {
				removeFioOpacity();
			};

			$.fn.umbg.fioFadeOut = function () {
				setFioOpacity();
			};
			// END - UMBG PLAYBACK ACTIONS AND BUTTONS

			// Resize media player.
			// Based on Sean McCambridge jQuery tubular plugin resize() function (http://www.seanmccambridge.com/tubular).
			function videoResize( media_type ) {

				media_type = media_type || 'html5';

				var width = $( window ).width(),
					pWidth,
					height = $( window ).height(),
					pHeight,
					h
					;

				var umbgMediaPlayer2 = $( '#' + opts.mediaPlayerId );

				// When screen aspect ratio differs from media/video, video will be center and underlay one dimension.
				// If new video height < window height (gap underneath).
				if ( width / opts.mediaAspectRatio < height ) {
					// Get new player width
					pWidth = enlargeVideoPlayer( Math.ceil( height * opts.mediaAspectRatio ), opts.enlargeBy );
					height = enlargeVideoPlayer( height, opts.enlargeBy );

					// Player width is greater, offset left; reset top
					umbgMediaPlayer2.width( pWidth ).height( height ).css( {
						left: (width - pWidth) / 2,
						top : 0
					} );

					// For UMBG-Slider set slide image height. Helper for smaller height images.
					$( '.umbg-slider-container img' ).css( {
						'min-height': height,
						'max-width' : pWidth //* 1.5
					} );

				} else {
					// If video player width < window width (gap to right).
					// Get new player height.
					pHeight = enlargeVideoPlayer( Math.ceil( width * opts.mediaAspectRatio ), opts.enlargeBy );
					width = enlargeVideoPlayer( width, opts.enlargeBy );

					// Use different top value if image or color media type.
					h = media_type === ( 'image' || 'color') ? 0 : (height - pHeight) / 2;

					// Player height is greater, offset top; reset left
					umbgMediaPlayer2.width( width ).height( pHeight ).css( {
						left: 0,
						top : h
					} );

					// For UMBG-Slider set slide image height. Helper for smaller height images.
					$( '.umbg-slider-container img' ).css( {
						//'height': pHeight,
						//'max-height': height * 1.5
						'min-height': pHeight / 3,
						'max-width' : width //* 1.5
					} );

				}

			} // End - videoResize()

			function playerSwitch() {
				// Determine which video API to use and load the video player.
				switch ( mediaPlayerType ) {
					case 'youtube':
						ytPlayer();
						break;
					case 'vimeo':
						vimeoPlayer();
						break;
					case 'dailymotion':
						dailymotionPlayer();
						break;
					case 'wistia':
						wistiaPlayer();
						break;
					case 'html5':
						htmlPlayer();
						break;
					case 'image':
						imagePlayer( 'image' );
						break;
					case 'color':
						imagePlayer( 'color' );
						break;
				}// End switch video player function.

				videoResize( mediaPlayerType );
			}

			// Determine if mobile phone/tablet and load video poster or load video player then hide or show controls as necessary. If not a mobile device then play normally.
			if ( disableMobileAll || ( disableMobilePhone && opts.disableOnMobileVideoOnly !== 1 ) ) {

				$playerControls.remove();

			} else if ( ( isMobilePhone() || isMobileTablet() ) /*&& mediaPlayerType !== 'image'*/ ) {

				// If video backgrounds disable or disable on mobile phones only then do not play and remove controls. Else show poster image.
				if ( disableMobileVideo || ( disableMobilePhone && opts.disableOnMobileVideoOnly === 1 ) ) {

					$playerControls.remove();

				} else {

					if ( mediaPlayerType !== ( 'image' || 'color' ) ) {
						umbgMediaPlayer = mobilePoster;
						insertPlayer( umbgMediaPlayer );
					} else {
						playerSwitch();
					}

					// If using PUD then display PUD control only.
					if ( opts.pud === 1 || opts.fio === 1 ) {
						$playButton.hide();
						$volumeButton.hide();
					} else {
						$playerControls.remove();
					}

				}

			} else {

				if ( mediaPlayerType === 'color' ) {
					$playerControls.remove();
				}

				// If delayBy is used then delay media start.
				if ( opts.delayBy > 0 ) {
					setTimeout( function () {
							playerSwitch();
							$( '#umbg' ).hide();
							$( '.umbg-overlay' ).hide().fadeIn( 500, function () {
								$( '#umbg' ).fadeIn( 1000 );
							} );

						}, opts.delayBy
					);
				} else {
					playerSwitch();
				}

				// Resize the media player on the browser window resize.
				$( window ).resize( function () {
					videoResize( mediaPlayerType );
				} );

				// Resize if mobile device to target browser nav bar spacing specially on iOS devices.
				if ( isMobilePhone() || isMobileTablet() ) {
					document.addEventListener( 'touchmove', qwerty, false );
				}

			}

			// For resizing mobile devices after touch event.
			function qwerty() {
				$( '#umbg' ).css( 'min-height', '100%' );
			}

			// Pause the video if browser page is not the visible one by using the Page Visibility API.
			// Split into two functions to work with the different media type players.
			function pvp() {
				if ( + opts.pageVisibilityPause === 1 ) {

					if ( typeof document.hidden !== 'undefined' ) { // Opera 12.10 and Firefox 18 and later support
						hidden = 'hidden';
						visibilityChange = 'visibilitychange';
					} else if ( typeof document.mozHidden !== 'undefined' ) {
						hidden = 'mozHidden';
						visibilityChange = 'mozvisibilitychange';
					} else if ( typeof document.msHidden !== 'undefined' ) {
						hidden = 'msHidden';
						visibilityChange = 'msvisibilitychange';
					} else if ( typeof document.webkitHidden !== 'undefined' ) {
						hidden = 'webkitHidden';
						visibilityChange = 'webkitvisibilitychange';
					}
				}
			}

			function pvp2() {

				// Warn if the browser doesn't support addEventListener or the Page Visibility API
				if ( typeof document.addEventListener === 'undefined' ||
					typeof document[ hidden ] === 'undefined' ) {
					console.log( 'Pausing the video based on page visibility requires an updated browser, such as ' +
						'Google Chrome or Firefox, that supports the Page Visibility API.' );
				} else {
					// Handle page visibility change
					document.addEventListener( visibilityChange, window.handleVisibilityChange, false );
				}

			}// End Page Visibility API.

		} );// End this.each function.

	};// End $fn.umbg.

	// Default settings.
	$.fn.umbg.defaults = {
		'mediaPlayerId'              : 'umbg', // Id for UMBG's media player element. Enter without the # symbol.
		'mediaPlayerType'            : 'YouTube', // YouTube, Vimeo, Dailymotion, Wistia, HTML5, Image, or Color.
		'mediaId'                    : 'k7dEsMCFfFw', // For YouTube, Vimeo, etc., enter the video id. For HTML5 enter the location and video filename. For images enter the URL location seperated by a comma for multiple images.
		'mediaLink'                  : '', // URL link to send users if they click on media background.
		'mediaLinkTarget'            : '_blank', // '_self' or '_blank'. Specify a window where the mediaLink is loaded.
		'mediaPoster'                : 'yourfolderlocation/myposter.jpg', // URL location of video poster to display for mobile devices or if video does not play.
		'mediaPosterCss'             : 'umbg-mobile-poster', // CSS class to use on mobile devices for the video poster image.
		'mediaOverlay'               : 1, // 0= no overlay, 1= use overlay.
		'mediaOverlayCss'            : 'umbg-overlay-square-grid', // CSS class to use for the overlay. See UMBG's CSS file for all available options.
		'mediaOverlayColor'          : 'rgba(0, 0, 0, 0.4)', // Color of the overlay.
		'videoQuality'               : 'default', // Forces HD quality video play. Default auto selects the appropriate playback quality.
		// YouTube Quality = default, small, medium, large, hd720, hd1080, or highres.
		// Vimeo Quality: default or auto, 4K, 2K, 1080p, 720p, 540p, or 360p.
		// Dailymotion Quality: auto, 240, 380, 480, 720, 1080, 1440, or 2160.
		// Wistia Quality: auto, sd-only, md, hd-only.
		'wistiaDoNotTrack'           : 0, // 0=false 1=true. For Wistia video's only (When true, it will not track views).
		'slideShowDuration'          : 6000, // Duration each image will be displayed in milliseconds.
		'slideShowEffect'            : 'random', // 'random', 'zoomIn', 'zoomOut', 'panLeft', 'panRight', 'panUp', 'panDown', 'fade'.
		'slideShowTransitionDuration': 2000, // Duration of fade between slides in milliseconds.
		'slideShowEasing'            : 'ease-in-out', // ease, linear, ease-in, ease-out, ease-in-out.
		'autoPlay'                   : 1,
		'startAt'                    : 0, // Where to start the video in seconds.
		'endAt'                      : 0, // Where to end the video in seconds.
		'delayBy'                    : 0, // Enter the time to delay displaying the background in milliseconds.
		'loop'                       : 1, // 0=no, 1=yes. Loop the media play.
		'rewindToStartAt'            : 0, // If no looping then do we reload/rewind the media to the beginning.
		'mediaStartFadeIn'           : 0, // 0 = no, 1 = yes. When playback starts fade-in the media background.
		'mediaEndFadeOut'            : 0, // 0 = no, 1 = yes. When playback ends fade-out the media background.
		'audio'                      : 1, //  0 = no audio, 1 = video plays with audio and volume button is display.
		'startAudioMuted'            : 0, // 0 = no, 1 = yes. When enable(yes) the media will start with the audio muted.
		'volumeLevel'                : 100, // Choose 0-100, 0 = no volume (mute), 100 = video plays with audio at 100% volume.
		'displayControls'            : 1, // 0=no, 1=yes.
		'placeControls'              : 'umbg-br', // umbg-br = bottom right, umbg-bl = bottom left, umbg-tr = top right, umbg-tl = top left.
		'controlColor'               : 'rgba(255, 255, 255, 0.8)', // Color for the control icons.
		'controlBgColor'             : 'rgba(39, 173, 211, 0.7)', // Color for the control background.
		'enableScrollToTopButton'    : 1, // 0 = no, 1 = yes. Display scroll-to-top button in the controls panel.
		'pud'                        : 1, // Use Page-Up-Down (PUD) 0=no, 1=yes.
		'pudElement'                 : '#page', // The HTML element to use for PUD feature.
		'pudDown'                    : 0, // Start playback with PUD on down position.
		'pudUp'                      : 1, // PUD will automatically go up when media playback ends or first loop ends.
		'pudShow'                    : 0, // Amount of page to show in pixels when pud is down position.
		'fio'                        : 1, // Use Fade-In-Out (FIO) 0=no, 1=yes.
		'fioElement'                 : '#page', // The HTML element to use for FIO feature.
		'fioOpacity'                 : 0.5, // Amount of opacity level to use with FIO.
		'fioStart'                   : 0, // Start playback with the FIO opacity.
		'fioEnd'                     : 1, // End playback with opacity set to 1.
		'enlargeBy'                  : '0', // Use to enlarge the media player size by percent number, i.e. to hide Vimeo & YouTube player controls, ads, etc.
		'mediaAspectRatio'           : 16 / 9, // The media's aspect ratio, i.e. 16:9 = 16 / 9, 4:3 = 4 / 3, etc.
		'pageVisibilityPause'        : 1, // Pause the video if browser page is not the visible one.
		'disableOnMobileAll'         : 0, // 0=no, 1=yes. Disable playback of all backgrounds on mobile devices.
		'disableOnMobileVideoOnly'   : 0, // 0=no, 1=yes. Disable playback of video backgrounds on all mobile devices.
		'disableOnMobilePhonesOnly'  : 0, // 0=no, 1=yes. Disable playback on mobile phones only. Will play on tablets.
		// For keyboard controls you must enter one key from A-Z, 0-9, SHIFT, CONTROL, ALT, SPACE, UP, DOWN, LEFT, and RIGHT. Combo keys are not supported at this time. Remember that OS and browser key combinations may override UMBG's.
		'keyboardControls'           : 0, // 0=no, 1=yes. Enable the use of keyboard controls.
		'keyboardTogglePlay'         : 'SHIFT', // Use A-Z, 0-9, SHIFT, CONTROL, ALT, SPACE, UP, DOWN, LEFT, and RIGHT.
		'keyboardPlay'               : 'A',
		'keyboardPause'              : 'S',
		'keyboardToggleVolume'       : 'V',
		'keyboardMute'               : 'M',
		'keyboardUnmute'             : 'N',
		'keyboardTogglePud'          : 'P',
		'keyboardPudPageDown'        : 'RIGHT',
		'keyboardPudPageUp'          : 'LEFT',
		'keyboardToggleFio'          : 'F',
		'keyboardFioFadeIn'          : 'I',
		'keyboardFioFadeOut'         : 'O',
		'preventBrowserKeys'         : 0, // 0=no, 1-yes. Prevent browser key controls from overriding UMBG's. CAUTION: The user may lose functionality of all default browser key shortcuts in the window UMBG is playing.
		'onPlaybackStart'            : function () {}, // Callback method trigger when playback begins. Don't use alert box as it causes playback issues.
		'onPlaybackPause'            : function () {}, // Callback method trigger when playback is pause. Don't use alert box as it causes playback issues.
		'onPlaybackEnd'              : function () {}  // Callback method trigger when playback ends. Don't use alert box as it causes playback issues.
	};

})( jQuery );//END UMBG.