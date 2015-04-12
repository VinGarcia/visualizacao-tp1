// Utility for parsing the raw JSON input data into more friendly structures.
// Also offers a set of processing routines.
var inputParser = {};

inputParser.initialize = function() {

	this.graphs = [];

	// Parse the raw arrays into a vector of graphs. Each position of GRAPHS has a
	// another vector, with PERSON objects.
	for (var i = 0; i < rawData.length; i++) {
		var personList = [];
		var graph = rawData[i];
		var currentPerson = new Person();

		for (var j = 0; j < graph.length; j++) {
			entry = graph[j];

			if (entry.personId != currentPerson.id) {
				if (currentPerson.id != null)
					personList.push(currentPerson);

				currentPerson = new Person();
				currentPerson.id = entry.personId;
			}

			currentPerson.placeTypes.push(entry.placeType);
			currentPerson.placeIDs.push(entry.placeId);
		}

		personList.push(currentPerson);
		this.graphs.push(personList);
	}

	for (var i = 0; i < this.graphs.length; i++)  
		for (var j = 0; j < this.graphs[i].length; j++)
			this.graphs[i][j].computeVisitMap();

	return;

};
