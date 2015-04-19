function Analyzer(graphs, side) {
  this.graphs = graphs;
  var self = this;

  // Computes a similarity map for the set of graphs. Each entry has another
  // map, with distances from the node to every other node in all graphs. Ex:
  //   {
  //     "1,3": {"3,4": 5, "4,2": 3},
  //     "1,4": {"3,4": 6:, "8,6": 21}
  //   }
  this.computeDistanceMap = function() {
    self.distMaps = {};
    self.maxDistance = 0;

    // Compare each person with all other persons in the graph.
    for (var i = 0; i < self.graphs.length; i++) {
      for (var j = 0; j < self.graphs[i].length; j++) {
        var currentPerson = self.graphs[i][j];
        var currentKey = currentPerson.getKey();
        self.distMaps[currentKey] = {};

        for (var k = 0; k < self.graphs.length; k++) {
          for (var l = 0; l < self.graphs[k].length; l++) {
            var otherPerson = self.graphs[k][l];
            var otherKey = otherPerson.getKey();
            var distance = currentPerson.simEuclidean(otherPerson);

            // Add the current distance.
            self.distMaps[currentKey][otherKey] = distance;

            if (distance > self.maxDistance)
              self.maxDistance = distance;
          }
        }
      }
    }
  }();

  // The outliers are defined as the nodes which are the farthest from all other
  // nodes. We defined the outliers to be the 10% nodes with highest sum of
  // distance to all other nodes.
  this.computeOutliers = function() {
    self.distSumVector = [];

    // Computes a vector that, for each person, stores the sum of distances to
    // all other persons.
    for (key in self.distMaps) {
       if (!self.distMaps.hasOwnProperty(key))
         continue;

       var sumDist = 0;

       for (innerKey in self.distMaps[key]) {
         if (!self.distMaps[key].hasOwnProperty(innerKey))
           continue;

         sumDist += self.distMaps[key][innerKey];
       }

       self.distSumVector.push({"key":key,"sumDist":sumDist});
    }

		self.distSumVector = self.distSumVector.sort(function(a,b) {
			return a.sumDist - b.sumDist;
		});

    self.outlierKeySet = new Set();
    var threshold = Math.ceil(self.distSumVector.length * 0.9);

    // Build a set with the keys of all outlier nodes.
    for (var i = threshold; i < self.distSumVector.length; i++)
      self.outlierKeySet.add(self.distSumVector[i].key);
  }();

  // Returns a random integer between min and max.
  this.getRand = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // Checks if a given coordinate is far enough from other points (as the radius
  // of common charts is 20% of the side, the minimum distance between centers
  // is 22% of side).
  this.isCoordAlowed = function(coord, coordsVector) {
    for (var i = 0; i < coordsVector.length; i++) {
      var dist = Math.sqrt(Math.pow((coord[0] - coordsVector[i][0]), 2) +
                           Math.pow((coord[1] - coordsVector[i][1]), 2));

      if (dist < side*0.22)
        return false;
    }

    return true;
  };

  // Computes where each chart should beplotted in the canves. We assume that
  // the diameter of common charts will be 20% of the canvas side. Outlier
  // charts will be 15%. For the first graph, random coordinates will be
  // assigned. For the remaining charts, coordinates are based on the similarity
  // to nodes of previous charts. Outliers will always be plotted at the bottom
  // (13%) of the canvas.
  this.computeCoordinates = function() {
    for (var i = 0; i < self.graphs.length; i++) {
      // TODO: take off.
      if (i != 0)
        break;

      var commonPeople = [];
      var outliers = [];

      for (var j = 0; j < self.graphs[i].length; j++) {
        var person = self.graphs[i][j];

        if (self.outlierKeySet.has(person.getKey()))
          outliers.push(person);
        else
          commonPeople.push(person);
      }

      var coordsVector = [];

      // Randomly assign coordinates to common people.
      for (var j = 0; j < commonPeople.length; j++) {
        // 25% of the screen is kept for outliers.
        var coord = [self.getRand(side*0.12, side*0.88), self.getRand(side*0.12, side * 0.75)];

        // Compute new random coordinates until we find a valid one.
        while (!self.isCoordAlowed(coord, coordsVector))
          coord = [self.getRand(side*0.12, side*0.88), self.getRand(side*0.12, side * 0.75)];

        coordsVector.push(coord);
        commonPeople[j].x = coord[0];
        commonPeople[j].y = coord[1];
        commonPeople[j].isOutlier = false;
      }

      // Assign fixed coordinates at the bottom for outliers.
      for (var j = 0; j < outliers.length; j++) {
        outliers[j].x = (side/outliers.length) * (i+1);
        outliers[j].y = (side*0.87);
        outliers[j].isOutlier = true;
      }
    }
  }();

  return;
}





//function Analyzer(data, nGroups) {
//	this.persons = data.gPersonList;
//	this.num = nGroups || 8;
//
//	this.buildMatrix = function(persons) {
//		var simMatrix = [];
//		var max=0, min=0;
//	
//		persons = persons || this.persons;
//	
//		for(var i in persons) {
//			var simVec = [];
//			
//			for(var j in persons) {
//				simVec.push( persons[i].simEuclidean(person[j]) );
//				if(simVec[j] > max) max = simVec[j];
//				if(simVec[j] < min) min = simVec[j];
//			}
//			
//			simMatrix.push(simVec);
//		}
//	
//		if(persons == this.persons) {
//			this.max = max;
//			this.min = min;
//		}
//	
//		return simMatrix;
//	}
//	
//	this.buildVector = function(persons, matrix) {
//		persons = persons || this.persons;
//	
//		for(var i in persons) {
//			persons[i].stats = 0;
//			for(var j in persons)
//				persons[i].stats += matrix[i][j]
//		}
//	
//		return vec;
//	}
//
//	this.formGroups = function(nGroups, persons) {
//		persons = persons || this.persons;
//		nGroups = nGroups || this.num;
//	
//		this.matrix = this.matrix || buildMatrix(persons);
//		this.vec = this.vec || buildVector(persons, this.matrix);
//	
//	  return this.method(this.vec)
//	}
//
//  this.method = function(persons) {
//		persons = persons || this.persons;
//		if(persons[0].stats === undefined)
//			buildVector(persons);
//	
//		// Sort in crescent order:
//		persons = persons.sort(function(a,b){
//			return a.stats - b.stats;
//		});
//		
//		var benchmark_base = (this.max-this.min)/this.num;
//		var benchmark = benchmark_base;
//	
//		// There will be this.num groups in total:
//		var groups = [];
//		var currentGroup = 0;
//		for(var person in persons) {
//			person = persons[i];
//	
//			if(person.stats > benchmark) {
//				currentGroup++;
//				benchmark += benchmark_base;
//			}
//	
//	    groups[currentGroup].push(person)
//		}
//
//		return groups;
//	}
//}
//
//// Ideia antiga de como agrupar:
//	// para cada grafico
//	// para cada pessoa desse grafico
//	//
//	// Repita:
//	//   Encontre no próximo gráfico o cara mais similar.
//	// 
//	// Agora faça o somatório da similaridade interna dos grupos
//	// Ordene os grupos com base nisso.
//
