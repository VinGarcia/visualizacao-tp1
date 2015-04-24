// If nodejs is being used:
if(typeof exports !== 'undefined') {
	// Prepare the hook for nodejs require():
	exports.Person = Person;
}

// Person data type
function Person(gid, id) {

	// This person ID on its own graph.
	this.id = id;
	// This person graph ID.
	this.gid = gid;
	this.placeTypes = [];
	this.placeIDs = [];

	this.similarity = [];
	this.visitMap = {
		'A':0,'B':0,'C':0,'D':0,'E':0,'F':0,'G':0,'H':0,'I':0,
		'J':0,'K':0,'L':0,'M':0,'N':0,'O':0,'P':0,'Q':0,'R':0,
		'S':0,'T':0,'U':0,'V':0,'W':0,'X':0,'Y':0,'Z':0
	}
};

Person.prototype.add = function(place,id) {
	this.visitMap[place]++;
	this.placeTypes.push(place)
	this.placeIDs.push(id)
}

// Tests how many times two people go to a place with same type and ID. These is
// used to draw edges.
Person.prototype.goesToSamePlace = function(person) {
  var matchCount = 0;

  for (var i = 0; i < this.placeTypes.length; i++)
    for (var j = 0; j < person.placeTypes.length; j++)
      if ((this.placeTypes[i] == person.placeTypes[j]) &&
          (this.placeIDs[i] == person.placeIDs[j]))
        matchCount++;

  var percentMatch = (matchCount / Math.max(this.placeTypes.length,
                                            person.placeTypes.length));

  var ret = {};
  ret.percentMatch = percentMatch;

  return ret;
}

// Similarity metric: euclidean
Person.prototype.simEuclidean = function(person) {

	var sim = 0;
	var a,b;
	for(L in this.visitMap) {
		a = this.visitMap[L]
		b = person.visitMap[L]

		sim += Math.pow((a - b), 2);
	}

  return Math.sqrt(sim)
}

// Returns an array of objects containing data related to visits. Each
// object/entry has the place type and number of visits. This is mainly used to
// conform with D3's data layout.
Person.prototype.getVisitArray = function() {
	var visitArray = [];
  var totalVisits = 0;

  // Compute the total number of visits for this person.
	for (var placeType in this.visitMap) {
		if (!this.visitMap.hasOwnProperty(placeType))
			continue;

    totalVisits += this.visitMap[placeType];
  }

  // Build vector with collapsed number of visits.
	for (var placeType in this.visitMap) {
		if (!this.visitMap.hasOwnProperty(placeType))
			continue;

		entry = {};
		entry.placeType = placeType;
		entry.numVisits = this.visitMap[placeType];
    entry.percentage = Math.round((this.visitMap[placeType] / totalVisits) * 100);
    entry.isOutlier = this.isOutlier;
		visitArray.push(entry);
	}

	return visitArray;
};

// Returns a key commposed by the graph ID and the person ID in the graph:
//   "gid,pid"
Person.prototype.getKey = function() {
  return (this.gid.toString() + "," + this.id.toString());
}




//Person.prototype.computeVisitMap = function() {
//
//	this.numVisits = this.placeTypes.length;
//
//	// Get unique place types.
//	var unique = [];
//
//	for (var i = 0; i < this.placeTypes.length; i++)
//		if (unique.indexOf(this.placeTypes[i]) == -1)
//			unique.push(this.placeTypes[i]);
//
//	// Count occurences of each type.
//	for (var i in unique) {
//
//		var type = unique[i];
//		var count = 0;
//
//		for (var j = 0; j < this.placeTypes.length; j++)
//			if (this.placeTypes[j] == type)
//				count++;
//
//		this.visitMap[type] = count;
//
//	}
//
//};
