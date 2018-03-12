import csv

file = []
with open('../resources/Hospital.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile, delimiter='\t')
    for row in reader:
        file.append(row)
