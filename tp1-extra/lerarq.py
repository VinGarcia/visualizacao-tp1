   # -*- coding: iso-8859-15 -*-
__author__="Larissa"
__date__="$21/04/2015 18:32:50$"


if __name__ == "__main__":
 arquivo = open('dat-1.txt', 'r')

linha = arquivo.readlines()
count = 0 

matrix = [elem.strip().split('\t') for elem in linha]
anterior = -1


for pos_linha in range(1,len(matrix)):
	#for pos_coluna in range(1,len(matrix[0])):
	
	teste = matrix[pos_linha][1]
	if anterior != teste:
		count += 1
	print str(count)+"*"
	print matrix[pos_linha]
	anterior = 	matrix[pos_linha][1]
	

	#if(anterior == teste[pos_linha][2])
	#	count++

	#anterior = teste[pos_linha][2]



#print item
# >>> texto.append('Nova linha') 
# >>> arquivo = open('musica.txt', 'w')
# >>> arquivo.writelines(texto)
# >>> arquivo.close()