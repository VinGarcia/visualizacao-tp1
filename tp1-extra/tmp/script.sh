#!/bin/bash
COUNTER=-1
while read LINHA; do

    echo $LINHA | awk '{print $1}'
    

        let COUNTER=COUNTER+1 
done < arq.tsv
