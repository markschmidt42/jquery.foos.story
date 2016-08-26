(function( $ ){

	var $container;
	var $timerDiv;

	var timer = null;

	var totalElapsedSeconds = 0;

	var settings = {
		gameTimeSeconds: (5 * 60),
		startingTime: 0,
		autoExtendTimerBy: .25, // 25%
		animateEasing: 'linear', // vs 'swing'
		debug: false
	};

	var timerWidth = 0;
	var totalGameTimeEstimate = 0;  // seconds
	var estimateSegmentWidth = 0; // px

	var containerWidth = 0;
	var scores = [];

	var resetSizeEstimate = function() {
    	containerWidth = $container.width();
    	estimateSegmentWidth = containerWidth / totalGameTimeEstimate;

    	// if there are scores... they need to be repositioned
    	updateScores();
	}

	var updateTimerBar = function() {
		// if we have reached the end of the timer... extend it
		if (totalElapsedSeconds >= totalGameTimeEstimate) {
			totalGameTimeEstimate = totalGameTimeEstimate * (1 + settings.autoExtendTimerBy); // add 25%
			resetSizeEstimate();
		}

    	timerWidth = estimateSegmentWidth * totalElapsedSeconds;
		$timerDiv.animate({ 'width': timerWidth }, 200, settings.animateEasing);

    	if (settings.debug) console.log(totalElapsedSeconds)
		if (settings.debug) $timerDiv.text(totalElapsedSeconds +' of '+ totalGameTimeEstimate);

		totalElapsedSeconds++;
	}

	var updateScores = function() {
		if (scores.length == 0)
			return;

		$(scores).each(function() {
			score = this;

			var leftPosition = (score.seconds * estimateSegmentWidth);

			var $scoreDiv = $container.find('.game-story-score[data-seconds="'+ score.seconds +'"]');
			if ($scoreDiv.length == 1) {
				$scoreDiv.animate({'left' : leftPosition}, 200, settings.animateEasing);
			} else {
				var label = "";
				if (score.label) {
					label = "<label>"+ score.label +"</label>"
				}
				$scoreDiv = $('<div class="game-story-score '+ score.cssClass +'" data-seconds="'+ score.seconds +'" style="left:'+ leftPosition +'">'+ label +'</div>');
			}

			$container.prepend($scoreDiv);
		})
    	
	}

    var methods = {
        init : function(options) {
        	$container = this;

        	settings = $.extend( {}, settings, options );
        	if (settings.debug) console.log(settings)

        	totalElapsedSeconds   = settings.startingTime;
        	totalGameTimeEstimate = settings.gameTimeSeconds;
	    	resetSizeEstimate();

        	if (settings.debug) console.log(containerWidth, totalGameTimeEstimate, estimateSegmentWidth)

        	$timerDiv = $('<div class="game-story-timer" style="width:0px;"></div>');
        	$container.append($timerDiv);

        	$(window).resize(function() {
        		resetSizeEstimate();
        	});

        },

        start : function( ) {    
        	timer = setInterval(updateTimerBar, 1000);
        	updateTimerBar();
        },

        score : function( cssClass, label ) {  

        	scores.push({ 
        		 seconds: (totalElapsedSeconds-1) // current gameSecond
        		,cssClass: cssClass
        		,label: label
        	});

        	updateScores();
        	//$container.find(".game-story-timer").append('<div>'+ team +', '+ position +'</div>');
        },

        stop: function() {
        	clearInterval(timer);
        },
    };

    $.fn.gameStory = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.gameStory' );
        }    
    };


})( jQuery );