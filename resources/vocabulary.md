**Vocabulary choices**

* dbpedia-owl:Hospital

* OrganisationID -> dbpedia-owl:id
* OrganisationCode -> dbpedia-owl:code
* SubType ->  dbpedia-owl:type (rdf:type)
* Sector -> dbpedia-owl:department

* OrganisationName -> dbpedia-owl:Organisation
* Address -> dbpedia-owl:address

* City -> dbpedia-owl:city
* County -> dbpedia-owl:county
* Postcode -> dbpedia-owl:postalCode
* Latitude -> vcard:latitude
* Longitude -> vcard:longitude

* Phone -> foaf:phone
* Website -> dbpedia-owl:Website
* Email -> vcard:email


**Namespaces**

* RDF
* DBPEDIA-OWL
* FOAF
* VCARD

shop	pharmacy	http://www.w3.org/1999/02/22-rdf-syntax-ns#type	http://linkedgeodata.org/ontology/Pharmacy

SELECT ?name ?pgeo
WHERE
{
  <Hospital url> geo:geometry ?geo .
  ?p a <http://linkedgeodata.org/ontology/Pharmacy> .
  ?p geo:geometry ?pgeo
  FILTER(bif:st_intersects(?geo, ?pgeo, 5))
}
