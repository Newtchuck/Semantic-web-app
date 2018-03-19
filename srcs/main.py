from rdflib import Graph, Literal, BNode, RDF, Namespace
from rdflib.namespace import FOAF
from parse_file import *

store = Graph()

#Import namespaces
VCARD = Namespace("http://www.w3.lorg/2006/vcard/")
DBPEDIA_OWL = Namespace("http://dbpedia.org/ontology/")
SCHEMA = Namespace("http://schema.org/")

store.bind("foaf", FOAF)
store.bind("dbpedia", DBPEDIA_OWL)
store.bind("vcard", VCARD)
store.bind("schema", SCHEMA)

for count, line in enumerate(file, start=0):
    hospital = BNode()
    store.add((hospital, RDF.type, SCHEMA.Organisation))
    store.add((hospital, DBPEDIA_OWL["id"], Literal(line[0])))
    store.add((hospital, DBPEDIA_OWL["code"], Literal(line[1])))
    store.add((hospital, DBPEDIA_OWL["type"], Literal(line[3])))
    store.add((hospital, DBPEDIA_OWL["department"], Literal(line[4])))
    store.add((hospital, DBPEDIA_OWL["name"], Literal(line[7])))
    if len(line[8]) != 0:
        store.add((hospital, DBPEDIA_OWL["address"], Literal(line[8])))
    elif len(line[9]) != 0:
        store.add((hospital, DBPEDIA_OWL["address"], Literal(line[9])))
    elif len(line[10]) != 0:
        store.add((hospital, DBPEDIA_OWL["address"], Literal(line[10])))
    store.add((hospital, DBPEDIA_OWL["city"], Literal(line[11])))
    store.add((hospital, DBPEDIA_OWL["county"], Literal(line[12])))
    store.add((hospital, DBPEDIA_OWL["postalCode"], Literal(line[13])))
    store.add((hospital, VCARD["latitude"], Literal(line[14])))
    store.add((hospital, VCARD["longitude"], Literal(line[15])))
    store.add((hospital, FOAF.phone, Literal(line[18])))
    store.add((hospital, VCARD["email"], Literal(line[19])))
    store.add((hospital, DBPEDIA_OWL["Website"], Literal(line[20])))

store.serialize("hospital_foaf.rdf", format="pretty-xml", max_depth=3)
