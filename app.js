const { Connection, query } = require("stardog");

const util = require("util");
let express = require('express')
	, fetch = require("isomorphic-fetch")
	, sparql = require('sparql-http-client')
	, http = require('http')
	, path = require('path')
	, bodyParser = require('body-parser')
	, logger = require('morgan')
	, methodOverride = require('method-override');

sparql.fetch = fetch;

let dbpediaEP = new sparql({endpointUrl: 'http://dbpedia.org/sparql'});
let linkedGEP = new sparql({endpointUrl: 'http://linkedgeodata.org/search'});

var hospitalTarget;

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

const queries = [
	// request 1
	"PREFIX schema: <http://schema.org/> PREFIX dbo: <http://dbpedia.org/ontology/> PREFIX foaf: <http://xmlns.com/foaf/0.1/>" +
	"SELECT ?code ?county ?email ?website WHERE {" +
	"?Org a schema:Organisation ." +
	"?Org dbo:code ?code ." +
	"?Org dbo:county ?county ." +
	"OPTIONAL {" +
	"?Org dbo:email ?email ." +
	"?Org foaf:homepage ?website" +
	"}" +
	"}" +
	"ORDER BY asc(?code)",
	// request 2
	"PREFIX schema: <http://schema.org/>\n" +
	"PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
	"PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
	"PREFIX geo: <https://www.w3.org/2003/01/geo/>\n" +
	"\n" +
	"SELECT * WHERE {\n" +
	"\t?Org a schema:Organisation .\n" +
	"\t?Org dbo:code ?code .\n" +
	"\t?Org dbo:id ?id .\n" +
	"\t?Org dbo:name ?name .\n" +
	"\t?Org dbo:department ?department .\n" +
	"\t?Org dbo:city ?city .\n" +
	"\t?Org foaf:email ?mail .\n" +
	"\t?Org foaf:phone ?phone .\n" +
	"\t?Org foaf:homepage ?website .\n" +
	"\t?Org dbo:postalCode ?addrcode .\n" +
	"\t?Org dbo:county ?addrcounty .\n" +
	"\t?Org geo:lat ?geolat .\n" +
	"\t?Org geo:long ?geolon .\n" +
	"FILTER(?code = ",
	// request 3
	"PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
	"PREFIX dbr: <http://dbpedia.org/resource/>\n" +
	"PREFIX geo: <https://www.w3.org/2003/01/geo/>\n" +
	"PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
	"PREFIX dbp: <http://dbpedia.org/property/>\n" +
	"\n" +
	"SELECT *\n" +
	"WHERE {\n" +
	"    dbr:" + hospitalTarget + "  dbo:abstract ?abstract .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "  dbo:thumbnail ?tn }.\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "  dbp:caption ?caption } .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "  dbo:bedCount ?bed } .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "  dbo:address ?ad } .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "  foaf:homepage ?page } .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "  geo:geometry ?geo } .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "   dbp:location ?location } .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "  dbp:healthcare ?hc } .\n" +
	"    dbr:" + hospitalTarget + "   dbp:type ?type .\n" +
	"    OPTIONAL { dbr:" + hospitalTarget + "   dbo:country ?country }\n" +
	"}"
];

app.get('/', function(req, res) {
	query.execute(link,
		"semantic-wep-app", queries[0])
		.then(({ body }) => {
			const results = body.results.bindings;
	     	res.render('index', {title: "List of hospitals", results: results});
	     });

});

app.get('/hospital/:id', function(req, res) {
	let id = req.params.id;
	query.execute(link,
		"semantic-wep-app",
		"PREFIX schema: <http://schema.org/>" +
		"PREFIX dbo: <http://dbpedia.org/ontology/>" +
		"PREFIX foaf: <http://xmlns.com/foaf/0.1/>" +
		"PREFIX geo: <https://www.w3.org/2003/01/geo/>" +
		"SELECT * WHERE {" +
		"\t?Org a schema:Organisation ." +
		"\t?Org dbo:code ?code ." +
		"\t?Org dbo:id ?id ." +
		"\t?Org dbo:name ?name ." +
		"\t?Org dbo:department ?department ." +
		"\t?Org dbo:city ?city ." +
		"\t?Org foaf:email ?mail ." +
		"\t?Org foaf:phone ?phone ." +
		"\t?Org foaf:homepage ?website ." +
		"\t?Org dbo:postalCode ?addrcode ." +
		"\t?Org dbo:county ?addrcounty ." +
		"\t?Org geo:lat ?geolat ." +
		"\t?Org geo:long ?geolon ." +
		"FILTER(?code = " + "\"" + id + "\")" +
		"}")
		.then(({ body }) => {
			let result = body === null ? {} : body.results.bindings[0];
			hospitalTarget = result.name.value.split(" ").join("_").split("(").join("").split(")").join("");
			hospitalTarget = "Leicester_Royal_Infirmary"
			dbpediaEP
				.selectQuery(
					"PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
					"PREFIX dbr: <http://dbpedia.org/resource/>\n" +
					"PREFIX geo: <https://www.w3.org/2003/01/geo/>\n" +
					"PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
					"PREFIX dbp: <http://dbpedia.org/property/>\n" +
					"\n" +
					"SELECT *\n" +
					"WHERE {\n" +
					"    dbr:" + hospitalTarget + "  dbo:abstract ?abstract .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "  dbo:thumbnail ?tn }.\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "  dbp:caption ?caption } .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "  dbo:bedCount ?bed } .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "  dbo:address ?ad } .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "  foaf:homepage ?page } .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "  geo:geometry ?geo } .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "   dbp:location ?location } .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "  dbp:healthcare ?hc } .\n" +
					"    dbr:" + hospitalTarget + "   dbp:type ?type .\n" +
					"    OPTIONAL { dbr:" + hospitalTarget + "   dbo:country ?country }\n" +
					"}"
				)
				.then(function(res) {
					return res.json();
				})
				.then(function(resultat) {
					console.log(resultat.results.bindings[0])
					const dbpedia = resultat.results.bindings.length === 0 ? "empty" : resultat.results.bindings;
					console.log(dbpedia[0].abstract.value)
					res.render("hospital", {title: "More details about:", result: result, dbpedia: dbpedia[0]})
			});
	});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

module.exports = app;
