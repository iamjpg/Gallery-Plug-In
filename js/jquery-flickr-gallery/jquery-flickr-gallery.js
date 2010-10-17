/*****************************************************************************************
	* jQuery plug-in
	* Flickr Photo Gallery
	* Developed by J.P. Given (http://johnpatrickgiven.com)
	* Useage: anyone so long as credit is left alone...oh and get your own API key ;)
******************************************************************************************/
//Globals

var jqf = {} // Container to avoid namespace collisions.

jqf.jqfobj = null; // Container jqfobject
jqf.x = 0; // Object X
jqf.y = 0; // Object Y
jqf.c = 0; // Object center point
jqf.ct = 0; // Object center point from top
jqf.mX = 0; // Mouse X
jqf.mY = 0;  // Mouse Y
jqf.imgArray = new Array(); // Array to hold urls to flickr images
jqf.titleArray = new Array(); // Array to hold image titles if they exist
jqf.currentIndex = 0; // Default image index
jqf.fImg = null; // For checking if the image jqfobject is loaded.

// Callback for Flickr - Simply set array
function setFlickrData(flickrData) {
	var length = flickrData.photoset.photo.length;
	var thumbHTML = '';
	
	for (i=0; i<length; i++) {
		var photoURL = 'http://farm' + flickrData.photoset.photo[i].farm + '.' + 'static.flickr.com/' + flickrData.photoset.photo[i].server + '/' + flickrData.photoset.photo[i].id + '_' + flickrData.photoset.photo[i].secret +'.jpg'
		var thumbURL = 'http://farm' + flickrData.photoset.photo[i].farm + '.' + 'static.flickr.com/' + flickrData.photoset.photo[i].server + '/' + flickrData.photoset.photo[i].id + '_' + flickrData.photoset.photo[i].secret + '_s.jpg'
		thumbHTML += '<img src=' + thumbURL + ' width="50" height="50" onclick="navImg('+ i +');toggleUp();" style="cursor: pointer;">';
		jqf.imgArray[i] = photoURL;
		jqf.titleArray[i] = flickrData.photoset.photo[i].title;
	}
	
	$("#flickr_thumbs").html(thumbHTML);
	
	$("#flickr_thumbs").slideUp("slow");
	
}

//  Image navigation logic
function navImg(index) {
	
	// Set the global index
	currentIndex = index;
	
	// Set the loader gif pos and display
	$("#flickr_loader").css("top",y + "px");
	$("#flickr_loader").css("left",x + "px");
	$("#flickr_loader").css("display","block");
	
	
	// Create an image Obj with the URL from array
	var thsImage = null;
	thsImage = new Image();
	thsImage.src = jqf.imgArray[index];
	
	// Set global imgObj to jQuery img Object
	fImg = $( thsImage );
	
	// Display the image
	jqfobj.html('');
	jqfobj.html('<img id="thsImage" src=' + jqf.imgArray[index] + ' border=0>');
	
	// Call to function to take loader away once image is fully loaded
	checkImageLoad();
	
	// Set image size in relation to container
		// Set the aspect ratio
		var w = $("#thsImage").outerWidth(true);
		var h = $("#thsImage").outerHeight(true);
		if (w > h) {
			var fRatio = w/h;
			$("#thsImage").css("width",jqfobj.outerWidth(true));
			$("#thsImage").css("height",Math.round(jqfobj.outerWidth(true) * (1/fRatio)));
		} else {
			var fRatio = h/w;
			$("#thsImage").css("height",jqfobj.outerHeight(true));
			$("#thsImage").css("width",Math.round(jqfobj.outerHeight(true) * (1/fRatio)));
		}
		
		if (jqfobj.outerHeight() > $("#thsImage").outerHeight()) {
			var thisHalfImage = $("#thsImage").outerHeight()/2;
			var thisTopOffset = (jqfobj.outerHeight()/2) - thisHalfImage;
			$("#thsImage").css("margin-top",thisTopOffset+"px");
		}
}

// Simple function to check if the image is fully loaded
function checkImageLoad() {
	if (fImg.attr( "complete" ) == false) {
		setTimeout("checkImageLoad()",1000);
	} else {
		$("#flickr_loader").fadeOut();
		var current_count = currentIndex + 1;
		$("#flickr_count").html("Photo " + current_count + " of " + jqf.imgArray.length);
		if (jqf.titleArray[currentIndex] != "") {
			$("#flickr_count").append(" : " + jqf.titleArray[currentIndex]);
		}
	}
}

function toggleUp() {
	$("#flickr_thumbs").slideUp("slow");
}

// Sort of like an init() but re-positions dynamic elements if browser resized.
$(window).resize(function() {
	// Get the position of the element Flickr jqfobj will be loaded into
	x = jqfobj.offset().left;
	y = jqfobj.offset().top;
	c = x + (jqfobj.outerWidth(true) / 2);
	ct = y + (jqfobj.outerHeight(true) / 2);
	
	$("#flickr_loader").css("background-color","#fff"); // Set background color of loader to the background-color of container
	$("#flickr_loader").css("width",jqfobj.width() + "px");
	$("#flickr_loader").css("height",jqfobj.height() + "px");

	$("#flickr_thumbs").css("background-color",jqfobj.css("background-color"));
	$("#flickr_thumbs").css("width",jqfobj.width() + "px");
	$("#flickr_thumbs").css("left",x + "px");
	$("#flickr_thumbs").css("top",y + "px");
});

// Plug-In
(function($) {
	
	// plugin definition
	$.fn.flickrGallery = function(setID,apiKEY) {		
		// Set Obj to the Object
		jqfobj = this;
		
		// Assure images are centered
		this.css("text-align","center")
		
		// init the image loader and set values
		$("body").append('<div id="flickr_loader"></div>');
		$("#flickr_loader").css("background-color","#fff"); // Set background color of loader to the background-color of container
		$("#flickr_loader").css("width",jqfobj.width() + "px");
		$("#flickr_loader").css("height",jqfobj.height() + "px");
		
		// CSS jqfobject overflow for aspect ratio
		jqfobj.css("overflow","hidden");
		
		// Get the Flickr Set :)
		$.getScript("http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getPhotos&photoset_id=" + setID + "&api_key=" + apiKEY + "&jsoncallback=setFlickrData", function(data){
			// When data is set, load first image.
			navImg(0);
		});

		// Create previous and next buttons
		$("body").append('<div id="flickr_next"></div>');
		$("body").append('<div id="flickr_prev"></div>');
		
		// Get the position of the element Flickr jqfobj will be loaded into
		x = this.offset().left;
		y = this.offset().top;
		c = x + (jqfobj.outerWidth(true) / 2);
		ct = y + (jqfobj.outerHeight(true) / 2);
		
		// position loader
		$("#flickr_loader_table").css("left",x + "px");
		$("#flickr_loader_table").css("top",y + "px");
		
		// Append the Thumbs holder to the body
		$("body").append('<div id="flickr_thumbs"></div>');
		$("#flickr_thumbs").css("background-color",jqfobj.css("background-color"));
		$("#flickr_thumbs").css("width",jqfobj.width() + "px");
		$("#flickr_thumbs").css("left",x + "px");
		$("#flickr_thumbs").css("top",y + "px");
		
		
		// Set navigation click events
		$("#flickr_next").click(function() {
			if (currentIndex < (jqf.imgArray.length - 1)) {
				jqf.currentIndex = jqf.currentIndex + 1;
				navImg(jqf.currentIndex);
			}
		});
		
		$("#flickr_prev").click(function() {
			if (currentIndex > 0) {
				currentIndex = currentIndex - 1;
				navImg(currentIndex);
			}
		});
		
		$(document).mousemove(function (e) {
			// Set global mouse position
			mX = e.pageX;
			mY = e.pageY;
			
			// Bounding box coordinents of jqfobject
			var bY = y + jqfobj.outerHeight(true);
			var rX = x + jqfobj.outerWidth(true);
			if (((mY > y) && (mY < bY)) && ((mX > x) && (mX < rX))) {
				if (mY < (y + 50)) {
					$("#flickr_thumbs").slideDown("slow");
				} else if ((mY > (y + $("#flickr_thumbs").outerHeight()))) {
					$("#flickr_thumbs").slideUp("slow");
				}
				
				if (mX < c) {
					$("#flickr_next").css("display","none");
					$("#flickr_prev").css("display","block");
					$("#flickr_prev").css("left",mX-20 + "px");
					$("#flickr_prev").css("top",mY-10 + "px");
				} else if (mX > c) {
					$("#flickr_prev").css("display","none");
					$("#flickr_next").css("display","block");
					$("#flickr_next").css("left",mX-10 + "px");
					$("#flickr_next").css("top",mY-10 + "px");
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
	};
	
	// private function for debugging
	function debug(msg) {
		window.console.log(msg);
	};
})(jQuery);