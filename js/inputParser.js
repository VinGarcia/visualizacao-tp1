// Utility for parsing the raw JSON input data into more friendly structures.
// Also offers a set of processing routines.
var inputParser = {};

// If nodejs is being used:
if(typeof exports !== 'undefined') {
	// Prepare the hook for nodejs require():
	exports.inputParser = inputParser;
	Person = require('./person.js').Person;
}

inputParser.initialize = function(rawData) {
	this.graphs = [];
	this.gPersonList = [];
	// Person count:
	var graphCount = 0;

	// Parse the raw arrays into a vector of graphs.
	// Each position of GRAPHS has a
	// another vector, with PERSON objects.
	var lineCount=0;
	for (var graph in rawData) {
		graph = rawData[graph];

		var personList = [];
		var currentPerson = new Person();

		// Note that the graph entries are sorted by id.
		for (var i in graph) {
			var entry = graph[i];
			lineCount++;

			// If a new person id is found:
			if (entry.personId != currentPerson.id) {

				currentPerson = new Person(
					graphCount,
					entry.personId
				);
				currentPerson.graphID = i;

				personList.push(currentPerson);
				this.gPersonList.push(currentPerson);
			}

			// Add this entry to the person history:
			currentPerson.add(entry.placeType, entry.placeId)
		}

		this.graphs.push(personList);
    graphCount++;
	}

	return;
};
