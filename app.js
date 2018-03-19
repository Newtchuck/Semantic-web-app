const { Connection, query } = require("stardog");

let express = require('express')
	, fetch = require("isomorphic-fetch")
	, sparql = require('sparql-http-client')
	, routes = require('./routes')
	, http = require('http')
	, path = require('path')
	, bodyParser = require('body-parser')
	, logger = require('morgan')
	, methodOverride = require('method-override');

sparql.fetch = fetch;

let dbpediaEP = new sparql({endpoint: 'http://dbpedia.org/sparql'});
let linkedGEP = new sparql({endpoint: 'http://linkedgeodata.org/search'});

let link = new Connection({
	username: "admin",
	password: "admin",
	endpoint: "http://localhost:5820"
});

let app = express();

app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') === 'development') {
	app.locals.pretty = true;
}

app.get('/', function(req, res) {
	query.execute(link,
		"semantic-wep-app",
		"PREFIX ngw: <local:ngwproject:> PREFIX schema: <http://schema.org/> PREFIX dbo: <http://dbpedia.org/ontology/> PREFIX foaf: <http://xmlns.com/foaf/0.1/>" +
		"SELECT ?code ?county ?email ?website WHERE {" +
			"?Org a schema:Organisation ." +
			"?Org dbo:code ?code ." +
			"?Org dbo:county ?county ." +
			"OPTIONAL {" +
				"?Org vcard:email ?email ." +
				"?Org dbo:website ?website" +
			"}" +
		"}" +
		"ORDER BY asc(?code)")
		.then(({ body }) => {
	     	console.log(body);
	     	const results = body.results.bindings;
	     	res.render('index', {title: "List of hospitals", results: results});
	     });

});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

module.exports = app;
