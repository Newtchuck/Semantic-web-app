from rdflib import Graph, Literal, BNode, RDF, Namespace
from rdflib.namespace import FOAF
from parse_file import *

print(file[0])

store = Graph()



# Bind a few prefix, namespace pairs for pretty output
store.bind("foaf", FOAF)
store.bind("dbpedia-owl", Namespace("http://dbpedia-owl/ontology/"))
store.bind("vcard", Namespace("http://www.w3.org/2006/vcard/"))


    # # Add triples using store's add method.
    # store.add((donna, RDF.type, FOAF.Person))
    # store.add((donna, FOAF.nick, Literal("donna", lang="foo")))
    # store.add((donna, FOAF.name, Literal("Donna Fales")))
