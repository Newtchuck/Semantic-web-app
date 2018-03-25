$(document).ready(function() {
	let input, filter, list, elem;
	$("#sample6").keyup(function () {
		filter = $("#sample6").val().toLowerCase().toLowerCase();
		elem = $(".card-container").children();

		elem.each(function(item) {
			let name = $(this).children(".card-info").children("div:first")[0].innerHTML.toLowerCase();
			if (filter === "") {
				$(this).show();
			} else {
				if (name.includes(filter)) {
					$(this).show();
				} else {
					$(this).hide();
				}
			}
		});
	});
});