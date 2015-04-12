// Person data type
function Person() {

	this.id = null;
	this.placeTypes = [];
	this.placeIDs = [];

	this.similarity = [];

};

Person.prototype.computeVisitMap = function() {

	this.visitMap = {};
	this.numVisits = this.placeTypes.length;

	// Get unique place types.
	var unique = [];

	for (var i = 0; i < this.placeTypes.length; i++)
		if (unique.indexOf(this.placeTypes[i]) == -1)
			unique.push(this.placeTypes[i]);

	// Count occurences of each type.
	for (var i = 0; i < unique.length; i++) {

		var type = unique[i];
		var count = 0;

		for (var j = 0; j < this.placeTypes.length; j++)
			if (this.placeTypes[j] == type)
				count++;

		this.visitMap[type] = count;

	}

};

// Returns an array of objects containing data related to visits. Each
// object/entry has the place type and number of visits. This is mainly used to
// conform with D3's data layout.
Person.prototype.getVisitArray = function() {

	var visitArray = [];

	for (var placeType in this.visitMap) {
		if (!this.visitMap.hasOwnProperty(placeType))
			continue;

		entry = {};
		entry.placeType = placeType;
		entry.numVisits = this.visitMap[placeType];
		visitArray.push(entry);
	}

	return visitArray;

};

// Similarity metric: euclidean
Person.prototype.simEuclidean = function(person) {

	places = [];
	for (var i = 0; i < this.placeTypes.length; i++)
		places.push(this.placeTypes[i]);

	for (var i = 0; i < person.placeTypes.length; i++)
		if (!(person.placeTypes[i] in places))
			places.push(person.placeTypes[i]);

	var sim = 0;
	for (var i = 0; i < places.length; i++) {

		var a = 0, b = 0;
		if (places[i] in this.placeTypes) a = this.visitMap[i];
		if (places[i] in person.placeTypes) b = person.visitMap[i];

		if (a + b != 0) sim += Math.sqrt(pow((a - b), 2));

	}

	return sim;

}
