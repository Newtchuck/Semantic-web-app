$(document).ready(function() {
	var element, ink, d, x, y;
	$('.ripple').click(function(e) {
		element = $(this);
		if (element.find('.ink').length === 0) {
			element.prepend('<span class="ink"></span>');
		}

		ink = element.find('.ink');
		ink.removeClass('animate');
		d = Math.max(element.outerWidth(), element.outerHeight());
		ink.css({
			height: d,
			width:  d
		});

		x = e.pageX - element.offset().left - ink.width() / 2;
		y = e.pageY - element.offset().top - ink.height() / 2;

		ink.css({
			top:  y + 'px',
			left: x + 'px'
		}).addClass('animate');
	});

	var card = $('.list .card');
	card.click(function() {
		let button = $(this.children[5])[0];
		console.log(button);
		var c = $(this);
		if (c.hasClass('active')) {
			card.removeClass('active');
			button.style.display = "none";
		}
		else {
			card.removeClass('active');
			c.addClass('active');
			button.style.display = "flex";
		}
	});
});