(function($) {
	$.fn.gallery = function(options) { return new Gallery(this.get(0), options); };
	
	function Gallery(context, options) { this.init(context, options); };
	
	Gallery.prototype = {
		options:{},
		init: function (context, options){
			this.options = $.extend({
				duration: 700,									//duration of effect it 1000 = 1sec
				slideElement: 1,								//number of elements for a slide
				autoRotation: false,							//false = option is disabled; 1000 = 1sec
				effect: false,									//false = slide; true = fade
				listOfSlides: 'ul > li',						//elements galleries
				switcher: false,								//false = option is disabled; 'ul > li' = elements switcher
				disableBtn: false,								//false = option is disabled; 'hidden' = class adds an buttons "prev" and "next"
				nextBtn: 'a.link-next, a.btn-next, a.next',		//button "next"
				prevBtn: 'a.link-prev, a.btn-prev, a.prev',		//button "prev"
				circle: true,									//true = cyclic gallery; false = not cyclic gallery
				direction: false,								//false = horizontal; true = vertical
				event: 'click',									//event for the buttons and switcher
				IE: false,										//forced off effect it "fade" in IE
				textBox: false
			}, options || {});
			var _el = $(context).find(this.options.listOfSlides);
			if (this.options.effect) this.list = _el;
			else this.list = _el.parent();
			this.switcher = $(context).find(this.options.switcher);
			this.nextBtn = $(context).find(this.options.nextBtn);
			this.prevBtn = $(context).find(this.options.prevBtn);
			this.textBox = $(context).find(this.options.textBox);
			this.count = _el.index(_el.filter(':last'));
			
			if (this.options.switcher) this.active = this.switcher.index(this.switcher.filter('.active:eq(0)'));
			else this.active = _el.index(_el.filter('.active:eq(0)'));
			if (this.active < 0) this.active = 0;
			this.last = this.active;
			
			this.woh = _el.outerWidth(true);
			if (!this.options.direction) this.installDirections(this.list.parent().width());
			else {
				this.woh = _el.outerHeight(true);
				this.installDirections(this.list.parent().height());
			}
			
			if (!this.options.effect) {
				this.rew = this.count - this.wrapHolderW + 1;
				if (!this.options.direction) this.anim = '{marginLeft: -(this.woh * this.active)}';
				else this.anim = '{marginTop: -(this.woh * this.active)}';
				eval('this.list.css('+this.anim+')');
			}
			else {
				this.rew = this.count;
				this.list.css({opacity: 0}).eq(this.active).css({opacity: 1}).css('opacity', 'auto');
				this.list.parent().removeClass('active');
				this.list.eq(this.active).parent().addClass('active').css({opacity:'auto'});
				this.switcher.removeClass('active').eq(this.active).addClass('active');
				if (this.options.textBox){
					this.heightTextBox = this.textBox.outerHeight();
					this.textBox.css({bottom: -this.heightTextBox}).eq(this.active).css({bottom: 0});
				}
			}
			
			this.initEvent(this, this.nextBtn, true);
			this.initEvent(this, this.prevBtn, false);
			if (this.options.disableBtn) this.initDisableBtn();
			if (this.options.autoRotation) this.runTimer(this);
			if (this.options.switcher) this.initEventSwitcher(this, this.switcher);
		},
		initDisableBtn: function(){
			this.prevBtn.removeClass('prev-'+this.options.disableBtn);
			this.nextBtn.removeClass('next-'+this.options.disableBtn);
			if (this.active == 0 || this.count+1 == this.wrapHolderW) this.prevBtn.addClass('prev-'+this.options.disableBtn);
			if (this.active == 0 && this.count == 1 || this.count+1 == this.wrapHolderW) this.nextBtn.addClass('next-'+this.options.disableBtn);
			if (this.active == this.rew) this.nextBtn.addClass('next-'+this.options.disableBtn);
		},
		installDirections: function(temp){
			this.wrapHolderW = Math.ceil(temp / this.woh);
			if (((this.wrapHolderW - 1) * this.woh + this.woh / 2) > temp) this.wrapHolderW--;
		},
		fadeElement: function(){
			if ($.browser.msie && this.options.IE){
				this.list.eq(this.last).css({opacity:0});
			}
			else{
				this.list.eq(this.last).animate({opacity:0}, {queue:false, duration: this.options.duration});
				this.list.eq(this.active).animate({
					opacity:1
				}, {queue:false, duration: this.options.duration, complete: function(){
					$(this).css('opacity','auto');
				}});
				if (this.options.textBox){
					this.textBox.eq(this.last).animate({bottom: -this.heightTextBox}, {queue:false, duration: this.options.duration});
					this.textBox.eq(this.active).animate({bottom:0}, {queue:false, duration: this.options.duration});
				}
			}
			this.list.parent().removeClass('active');
			this.list.eq(this.active).parent().addClass('active').css({opacity:'auto'});
			if (this.options.switcher) this.switcher.removeClass('active').eq(this.active).addClass('active');
			this.last = this.active;
		},
		scrollElement: function(){
			eval('this.list.animate('+this.anim+', {queue:false, duration: this.options.duration});');
			if (this.options.switcher) this.switcher.removeClass('active').eq(this.active / this.options.slideElement).addClass('active');
		},
		runTimer: function($this){
			if($this._t) clearTimeout($this._t);
			$this._t = setInterval(function(){
				$this.toPrepare($this, true);
			}, this.options.autoRotation);
		},
		initEventSwitcher: function($this, el){
			el.bind($this.options.event, function(){
				$this.active = $this.switcher.index($(this)) * $this.options.slideElement;
				if($this._t) clearTimeout($this._t);
				if ($this.options.disableBtn) $this.initDisableBtn();
				if (!$this.options.effect) $this.scrollElement();
				else $this.fadeElement();
				if ($this.options.autoRotation) $this.runTimer($this);
				return false;
			});
		},
		initEvent: function($this, addEventEl, dir){
			addEventEl.bind($this.options.event, function(){
				if($this._t) clearTimeout($this._t);
				$this.toPrepare($this, dir);
				if ($this.options.autoRotation) $this.runTimer($this);
				return false;
			});
		},
		toPrepare: function($this, side){
			if (($this.active == $this.rew) && $this.options.circle && side) $this.active = -$this.options.slideElement;
			if (($this.active == 0) && $this.options.circle && !side) $this.active = $this.rew + $this.options.slideElement;
			for (var i = 0; i < $this.options.slideElement; i++){
				if (side) { if ($this.active + 1 <= $this.rew) $this.active++; }
				else { if ($this.active - 1 >= 0) $this.active--; }
			};
			if (this.options.disableBtn) this.initDisableBtn();
			if (!$this.options.effect) $this.scrollElement();
			else $this.fadeElement();
		},
		stop: function(){
			if (this._t) clearTimeout(this._t);
		},
		play: function(){
			if (this._t) clearTimeout(this._t);
			if (this.options.autoRotation) this.runTimer(this);
		}
	}
}(jQuery));

$(document).ready(function(){
	var obj = $('div.gall-fade').gallery({
		duration: 500,
		autoRotation: 5000,
		listOfSlides: 'div.inner > ul > li > img',
		effect: true,
		switcher: 'ul.swicher > li',
		textBox:'div.inner > ul > li > div.frame'
	});
	var w = obj.options.autoRotation;
	$('div.gall-fade a.pause').click(function(){
		if ($(this).hasClass('play')){
			$(this).removeClass('play');
			$(this).text('Pause');
			obj.options.autoRotation = w;
			obj.play();
		}
		else{
			$(this).addClass('play');
			$(this).text('Play');
			obj.options.autoRotation = false;
			obj.stop();
		}
		return false;
	});
});
