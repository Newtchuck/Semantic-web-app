import csv

file = []
with open('../resources/Hospital.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter='\t')
    for count, row in enumerate(reader, start=0):
        if count != 0:
            file.append(row)
