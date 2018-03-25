const { Connection, query } = require("stardog");

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
let linkedGEP = new sparql({endpointUrl: 'http://linkedgeodata.org/sparql'});

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

var data = {
	hospital: "",
	id: "bla",
	lon: "",
	lat: ""
};

const queries = [
	// request 1
	"PREFIX schema: <http://schema.org/> PREFIX dbo: <http://dbpedia.org/ontology/> PREFIX foaf: <http://xmlns.com/foaf/0.1/>" +
	"SELECT ?name ?code ?county ?email ?website WHERE {" +
	"?Org a schema:Organisation ." +
	"?Org dbo:name ?name ." +
	"?Org dbo:code ?code ." +
	"?Org dbo:county ?county ." +
	"OPTIONAL {" +
	"?Org dbo:email ?email ." +
	"?Org foaf:homepage ?website" +
	"}" +
	"}" +
	"ORDER BY asc(?code)",
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
	"FILTER(?code = " + "\"",

	"PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
	"PREFIX dbr: <http://dbpedia.org/resource/>\n" +
	"PREFIX geo: <https://www.w3.org/2003/01/geo/>\n" +
	"PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
	"PREFIX dbp: <http://dbpedia.org/property/>\n" +
	"\n" +
	"SELECT *\n" +
	"WHERE {\n" +
	"    dbr:" + data.hospital + "  dbo:abstract ?abstract .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "  dbo:thumbnail ?tn }.\n" +
	"    OPTIONAL { dbr:" + data.hospital + "  dbp:caption ?caption } .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "  dbo:bedCount ?bed } .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "  dbo:address ?ad } .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "  foaf:homepage ?page } .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "  geo:geometry ?geo } .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "   dbp:location ?location } .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "  dbp:healthcare ?hc } .\n" +
	"    dbr:" + data.hospital + "   dbp:type ?type .\n" +
	"    OPTIONAL { dbr:" + data.hospital + "   dbo:country ?country }\n" +
	"}",

	"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
	"PREFIX ogc: <http://www.opengis.net/ont/geosparql#>\n" +
	"PREFIX geom: <http://geovocab.org/geometry#>\n" +
	"PREFIX lgdo: <http://linkedgeodata.org/ontology/>\n" +
	"SELECT ?l ?lon ?lat\n" +
	"FROM <http://linkedgeodata.org> {\n" +
	"   ?s\n" +
	"   a lgdo:Amenity ;\n" +
	"   rdfs:label ?l ;\n" +
	"   geom:geometry [\n" +
	"   ogc:asWKT ?g\n" +
	"   ] .\n" +
	"FILTER( REGEX(?l, '(pharmacy|chemist|school)', 'i')) .\n" +
	"FILTER(bif:st_intersects (?g, bif:st_point (",

	"), 5)) .\n" +
	"FILTER( REGEX(str(?g), 'point', 'i')) .\n" +
	"BIND(STRBEFORE(STRAFTER(str(?g), 'POINT('), ' ') AS ?lon) .\n" +
	"BIND(STRAFTER(STRBEFORE(str(?g), ')'), ' ') AS ?lat)\n" +
	"}"
];

app.get('/', function(req, res) {
	query.execute(link, "semantic-wep-app", queries[0])
	     .then(({ body }) => {
			const results = body.results.bindings;
	     	res.render('index', {title: "List of hospitals", results: results});
	     })
		.catch(err => {res.render('error', {title: "An error occured. Traceback below.", error: err})})

});

app.get('/hospital/:id', function(req, res) {
	data.id = req.params.id;
	query.execute(link, "semantic-wep-app", queries[1] + data.id + "\")}")
	     .then(({ body }) => {
	     	const result = body === null ? {} : body.results.bindings[0];
	     	data.hospital = result.name.value.split(" ").join("_").split("(").join("").split(")").join("");
	     	dbpediaEP
				.selectQuery(queries[2])
				.then(function(res) {
					return res.json();
				})
				.then(function(dbpRes) {
					const dbpedia = dbpRes.results.bindings.length === 0 ? "empty" : dbpRes.results.bindings;
					const url = "http://dbpedia.org/page/" + data.hospital;
					data.lon = result.geolon.value;
					data.lat = result.geolat.value;
					linkedGEP
						.selectQuery(queries[3] + data.lon + ", " + data.lat + queries[4])
						.then(function(res) {
							return res.json();
						})
						.then(function(lgdRes) {
							const linkedgeodata = lgdRes.results.bindings.length === 0 ? [] : lgdRes.results.bindings;
							res.render("hospital", {title: "More details about:", result: result, dbpedia: dbpedia[0], linkedG: linkedgeodata, url: url})
						})
						.catch(err => res.render('error', {error: err}));
				})
				.catch(err => res.render('error', {error: err}));
	     })
		.catch(err => res.render('error', {error: err}));
});

app.get('/*', function(req, res) {
	res.render("404", {url: "localhost:3000" + req.url})
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

module.exports = app;
