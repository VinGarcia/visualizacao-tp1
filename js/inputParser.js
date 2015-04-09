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

function Person() {
  this.id = null;
  this.placeTypes = [];
  this.placeIDs = [];
}

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
}
