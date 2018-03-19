exports.index = function(req, res){
	var results = ["one", "two", "three","one", "two", "three","one", "two", "three","one", "two", "three","one", "two", "three","one", "two", "three","one", "two", "three"];
	res.render('index', {title: "List of hospitals", results: results});
};
