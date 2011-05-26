/*****************************************************************************************
	* jQuery plug-in
	* Flickr Photo Gallery
	* Developed by J.P. Given (http://johnpatrickgiven.com)
	* Useage: anyone so long as credit is left alone...oh and get your own API key ;)
******************************************************************************************/

var flickrhelpers = null;

(function(jQuery) {

	jQuery.fn.flickrGallery = function(args) {
		
		var $element = jQuery(this), // reference to the jQuery version of the current DOM element
		    element = this;         // reference to the actual DOM element
		
		// Public methods
		var methods = {
			init : function () {
				// Extend the default options
				settings = jQuery.extend({}, defaults, args);
				
				// Make sure the api key and setID are passed
				if (settings.flickrKey === null || settings.flickrSet === null) {
					alert('You must pass an API key and a Flickr setID');
					return;
				}
				
				// init the image loader and set values
				$("body").append('<div id="flickr_loader"></div>');
				$("#flickr_loader").css({
					"width"            : element.width(),
					"height"           : element.height(),
					"background-color" : "#FFF"
				});
				
				// CSS jqfobject overflow for aspect ratio
				element.css("overflow","hidden");
				
				// Get the Flickr Set :)
				$.getJSON("http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getPhotos&photoset_id=" + settings.flickrSet + "&api_key=" + settings.flickrKey + "&jsoncallback=?", function(flickrData){
				
					var length = flickrData.photoset.photo.length;
					var thumbHTML = '';

					for (i=0; i<length; i++) {
						var photoURL = 'http://farm' + flickrData.photoset.photo[i].farm + '.' + 'static.flickr.com/' + flickrData.photoset.photo[i].server + '/' + flickrData.photoset.photo[i].id + '_' + flickrData.photoset.photo[i].secret +'.jpg'
						var thumbURL = 'http://farm' + flickrData.photoset.photo[i].farm + '.' + 'static.flickr.com/' + flickrData.photoset.photo[i].server + '/' + flickrData.photoset.photo[i].id + '_' + flickrData.photoset.photo[i].secret + '_s.jpg'
						thumbHTML += '<img src=' + thumbURL + ' width="50" height="50" onclick="flickrhelpers.navImg('+ i +');flickrhelpers.toggleUp();" style="cursor: pointer;">';
						settings.imgArray[i] = photoURL;
						settings.titleArray[i] = flickrData.photoset.photo[i].title;
					}
					
					// Create previous and next buttons
					$("body").append('<div id="flickr_next"></div>');
					$("body").append('<div id="flickr_prev"></div>');
					
					// Set navigation click events
					$("#flickr_next").click(function() {
						if (settings.currentIndex < (settings.imgArray.length - 1)) {
							settings.currentIndex = settings.currentIndex + 1;
							flickrhelpers.navImg(settings.currentIndex);
						}
					});

					$("#flickr_prev").click(function() {
						if (settings.currentIndex > 0) {
							settings.currentIndex = settings.currentIndex - 1;
							flickrhelpers.navImg(settings.currentIndex);
						}
					});
					
					// Get the position of the element Flickr jqfobj will be loaded into
					settings.x = element.offset().left;
					settings.y = element.offset().top;
					settings.c = settings.x + (element.width() / 2);
					settings.ct = settings.y + (element.height() / 2);
					
					// position loader
					$("#flickr_loader").css({
						"left" : settings.x,
						"top"  : settings.y
					});
					
					// Append the Thumbs holder to the body
					$("body").append('<div id="flickr_thumbs"></div>');
					$("#flickr_thumbs").css("background-color",element.css("background-color"));
					$("#flickr_thumbs").css("width",element.width());
					$("#flickr_thumbs").css("left",settings.x);
					$("#flickr_thumbs").css("top",settings.y);

					$("#flickr_thumbs").html(thumbHTML);

					$("#flickr_thumbs").slideUp("slow");
					
					// When data is set, load first image.
					flickrhelpers.navImg(0);
					
				});
				
			}
		}
		
		// Helper functions here
		flickrhelpers = {
			navImg : function (index) {
				// Set the global index
				currentIndex = index;

				// Set the loader gif pos and display
				$("#flickr_loader").css({
					"top" : settings.y,
					"left" : settings.x,
					"display" : "block"
				});
				

				// Create an image Obj with the URL from array
				var thsImage = null;
				thsImage = new Image();
				thsImage.src = settings.imgArray[index];

				// Set global imgObj to jQuery img Object
				settings.fImg = $( thsImage );

				// Display the image
				element.html('');
				element.html('<img id="thsImage" src=' + settings.imgArray[index] + ' border=0>');

				// Call to function to take loader away once image is fully loaded
				$("#thsImage").load(function() {
					// Set the aspect ratio
					var w = $("#thsImage").width();
					var h = $("#thsImage").height();
					if (w > h) {
						var fRatio = w/h;
						$("#thsImage").css("width",element.width());
						$("#thsImage").css("height",Math.round(element.width() * (1/fRatio)));
					} else {
						var fRatio = h/w;
						$("#thsImage").css("height",element.height());
						$("#thsImage").css("width",Math.round(element.height() * (1/fRatio)));
					}

					if (element.outerHeight() > $("#thsImage").outerHeight()) {
						var thisHalfImage = $("#thsImage").outerHeight()/2;
						var thisTopOffset = (element.outerHeight()/2) - thisHalfImage;
						$("#thsImage").css("margin-top",thisTopOffset+"px");
					}
					
					var current_count = currentIndex + 1;
					$("#flickr_count").html("Photo " + current_count + " of " + settings.imgArray.length);
					if (settings.titleArray[currentIndex] != "") {
						$("#flickr_count").append(" : " + settings.titleArray[currentIndex]);
					}
					
					$("#flickr_loader").fadeOut();
				});

				
			},
			toggleUp : function() {
				$("#flickr_thumbs").slideUp("slow");
			}
		}
		
		// Hooray, defaults
		var defaults = {
			"flickrSet" : null,
			"flickrKey" : null,
			"x" : 0, // Object X
			"y" : 0, // Object Y
			"c" : 0, // Object center point
			"ct" : 0, // Object center point from top
			"mX" : 0, // Mouse X
			"mY" : 0,  // Mouse Y
			"imgArray" : [], // Array to hold urls to flickr images
			"titleArray" : [], // Array to hold image titles if they exist
			"currentIndex" : 0, // Default image index
			"fImg" : null, // For checking if the image jqfobject is loaded.
		}
		
		// For extending the defaults!
		var settings = {}
		
		// Init this thing
		jQuery(document).ready(function () {
			methods.init();
		});
		
		// Sort of like an init() but re-positions dynamic elements if browser resized.
		$(window).resize(function() {
			// Get the position of the element Flickr jqfobj will be loaded into
			settings.x = element.offset().left;
			settings.y = element.offset().top;
			settings.c = settings.x + (element.width() / 2);
			settings.ct = settings.y + (element.height() / 2);

			$("#flickr_loader").css("background-color","#fff"); // Set background color of loader to the background-color of container
			$("#flickr_loader").css("width",element.width() + "px");
			$("#flickr_loader").css("height",element.height() + "px");

			$("#flickr_thumbs").css("background-color",element.css("background-color"));
			$("#flickr_thumbs").css("width",element.width() + "px");
			$("#flickr_thumbs").css("left",settings.x + "px");
			$("#flickr_thumbs").css("top",settings.y + "px");
		});
		
		$(document).mousemove(function (e) {
			// Set global mouse position
			settings.mX = e.pageX;
			settings.mY = e.pageY;
			
			// Bounding box coordinents of jqfobject
			var bY = settings.y + element.height();
			var rX = settings.x + element.width();
			if (((settings.mY > settings.y) && (settings.mY < bY)) && ((settings.mX > settings.x) && (settings.mX < rX))) {
				if (settings.mY < (settings.y + 50)) {
					$("#flickr_thumbs").slideDown("slow");
				} else if ((settings.mY > (settings.y + $("#flickr_thumbs").outerHeight()))) {
					$("#flickr_thumbs").slideUp("slow");
				}
				
				if (settings.mX < settings.c) {
					$("#flickr_next").css("display","none");
					$("#flickr_prev").css("display","block");
					$("#flickr_prev").css("left",settings.mX-20 + "px");
					$("#flickr_prev").css("top",settings.mY-10 + "px");
				} else if (settings.mX > settings.c) {
					$("#flickr_prev").css("display","none");
					$("#flickr_next").css("display","block");
					$("#flickr_next").css("left",settings.mX-10 + "px");
					$("#flickr_next").css("top",settings.mY-10 + "px");
				} else {
					$("#flickr_prev").css("display","none");
					$("#flickr_next").css("display","none");
				}
			} else {
				$("#flickr_thumbs").slideUp("slow");
				$("#flickr_prev").css("display","none");
				$("#flickr_next").css("display","none");
			}
		});
		
	}
	

})(jQuery);