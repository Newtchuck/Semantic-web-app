const query = require("stardog").query;

const app = require("../app.js");
const link = app.link;

exports.index = function(req, res) {
	query.execute(link, "semantic-wep-app",
		"PREFIX ngw: <local:ngwproject>" +
		"PREFIX ngw: <local:ngwproject:>" +
		"PREFIX schema: <http://schema.org/>" +
		"PREFIX dbo: <http://dbpedia.org/ontology/>" +
		"PREFIX foaf: <http://xmlns.com/foaf/0.1/>" +
		"SELECT ?Code ?Name ?Contact_Mail ?Contact_Phone" +
		"WHERE {" +
		"?Org a schema:Organisation ." +
		"?Org ngw:organisationCode ?Code ." +
		"?Org dbo:name ?Name ." +
		"OPTIONAL {" +
		"?Org foaf:email ?Contact_Mail ." +
		"?Org foaf:phone ?Contact_Phone" +
		"}" +
		"}" +
		"ORDER BY asc(?Code)")
	     .then(({ body }) => {
		     const results = body.results.bindings;
		     res.render('index', {title: "List of hospitals from the U.K.", results: results});
	     });

};
