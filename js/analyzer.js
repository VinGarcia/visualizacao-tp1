// Analyzes the input graphs for similarities between nodes
analyzer.getSimilarity = function() {

	var numPersons = 0;
	var graphs = inputParser.graphs;

	for (var i = 0; i < graphs.length; i++)
		for (var j = 0; j < graphs[i].length; j++)
			numPersons++;

	var similarity = new Array(numPersons);
	for (var i = 0; i < numPersons; i++) {

		// similarity[i] = ;

	}

	/*
	for (var i = 0; i < graphs.length; i++)
		for (var j = 0; j < graphs[i].length; j++)
			for (var k = i + 1; k < graphs.length; k++)
				for (var l = 0; l < graphs[k].length; l++) {

					personA = graphs[i][j];
					personB = graphs[k][l];
					similarity[] = personA.simEuclidean(B);

				}
	*/

}
