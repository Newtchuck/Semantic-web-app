from rdflib import Graph, Literal, BNode, RDF, Namespace
from rdflib.namespace import FOAF
from parse_file import *

store = Graph()

#Import namespaces
DBPEDIA_OWL = Namespace("http://dbpedia-owl/ontology/")
VCARD = Namespace("http://www.w3.org/2006/vcard/")

# Bind a few prefix, namespace pairs
store.bind("foaf", FOAF)
store.bind("dbpedia-owl", DBPEDIA_OWL)
store.bind("vcard", VCARD)

for count, line in enumerate(file, start=0):
    hospital = BNode()
    store.add((hospital, RDF.type, DBPEDIA_OWL["Hospital"]))
    store.add((hospital, DBPEDIA_OWL["id"], Literal(line[0])))
    store.add((hospital, DBPEDIA_OWL["code"], Literal(line[1])))
    store.add((hospital, DBPEDIA_OWL["type"], Literal(line[3])))
    store.add((hospital, DBPEDIA_OWL["department"], Literal(line[4])))
    store.add((hospital, DBPEDIA_OWL["Organisation"], Literal(line[7])))
    store.add((hospital, DBPEDIA_OWL["address"], Literal(line[8])))
    store.add((hospital, DBPEDIA_OWL["city"], Literal(line[11])))
    store.add((hospital, DBPEDIA_OWL["county"], Literal(line[12])))
    store.add((hospital, DBPEDIA_OWL["postalCode"], Literal(line[13])))
    store.add((hospital, VCARD["latitude"], Literal(line[14])))
    store.add((hospital, VCARD["longitude"], Literal(line[15])))
    store.add((hospital, FOAF.phone, Literal(line[18])))
    store.add((hospital, VCARD["email"], Literal(line[19])))
    store.add((hospital, DBPEDIA_OWL["Website"], Literal(line[20])))

store.serialize("hospital_foaf.rdf", format="pretty-xml", max_depth=3)

print(store.serialize(format="turtle"))
