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
		// Generate the coordinates for the first graph:
		var baseCoordinates = generateCoordinates(graphs[0]);

		// For each other graph:
		for(var i=1; i < graphs.length; i++) {

			// Separate commonPeople from outliers:
			var aux = markOutliers(graphs[i]);
			var commonPeople = aux.commonPeople;
			var outliers = aux.outliers;

			// Make a copy of commonPeople from the first graph:
			var commonPeopleBase = copyVector(baseCoordinates.commonPeople);

			// Form the best pairs possible:
			while(1) {
				// Get the most similar pair of persons:
				var mostSimilarPair = getMostSimilarPair(commonPeople, commonPeopleBase);

				// If the result is null, there are no more pairs to make:
				if(mostSimilarPair === null) break;

				// Make p1 coordinates equal to its pair coordinates:
				var p1 = commonPeople[ mostSimilarPair.p1_index ];
				var p2 = commonPeopleBase[ mostSimilarPair.p2_index ];
				p1.x = p2.x;
				p1.y = p2.y;

				// Remove the pair from both lists:
				delete commonPeople[ mostSimilarPair.p1_index ];
				delete commonPeopleBase[ mostSimilarPair.p2_index ];

				// Continue with the next best pair...
			}

			// For each remaining people with no coordinates:
			for(var i=0; i < commonPeople.length; i++) {
				if(commonPeople.hasOwnProperty(i) === false) continue;
				var coord = generateSafeCoordinates(side, baseCoordinates.coordsVector);
				// TODO: This coordinates are random and have no similarity meaning.
				// Maybe we should add the left over Persons to the baseCoordinates list:
				// baseCoordinates.commonPeople.push(commonPeople[i]);
				// baseCoordinates.coordsVector.push( coord );
				// This way the next iterations will use this Person as a reference.
				commonPeople[i].x = coord[0];
				commonPeople[i].y = coord[1];
			}

			// Allocate the outliers equaly spaced on the bottom of the screen:
			allocateOutliers(side, outliers);
		}
	}();

	/* * * * * Private Functions Declarations: * * * * */

	// For each person in graph this function
	// sets person.isOutlier to true or false,
	// according to self.outlierKeySet list.
	function markOutliers(graph) {
		var outliers = [];
		var commonPeople = [];
		// Separate the graph persons into two groups:
		//   commonPeople and outliers
		for (var j = 0; j < graph.length; j++) {
			var person = graph[j];

			if (self.outlierKeySet.has(person.getKey())) {
				person.isOutlier = true;
				outliers.push(person);
			} else {
				person.isOutlier = false;
				commonPeople.push(person);
			}
		}

		return {'outliers': outliers, 'commonPeople': commonPeople };
	}

	// Generate new coordinates for a given graph.
	function generateCoordinates(graph) {

		var aux = markOutliers(graph);
		var commonPeople = aux.commonPeople;
		var outliers = aux.outliers;

		var coordsVector = [];

		// Randomly assign coordinates to common people.
		for (var j = 0; j < commonPeople.length; j++) {
			var coord = generateSafeCoordinates(side, coordsVector);

			coordsVector.push(coord);
			commonPeople[j].x = coord[0];
			commonPeople[j].y = coord[1];
		}

		// Assign fixed coordinates at the bottom for outliers:
		allocateOutliers(side, outliers);

		return { 'commonPeople': commonPeople, 'outliers': outliers, 'coordsVector': coordsVector };
	};

	function generateSafeCoordinates(side, coordsVector) {

		// 25% of the screen is kept for outliers.
		var coord = [self.getRand(side*0.12, side*0.88), self.getRand(side*0.12, side * 0.75)];
		var maxIterations = 1000;

		// Compute new random coordinates until we find a valid one.
		while (!self.isCoordAlowed(coord, coordsVector)) {
			coord = [self.getRand(side*0.12, side*0.88), self.getRand(side*0.12, side * 0.75)];
			if(maxIterations-- === 0) {
				console.log('Analyzer.generateSafeCoordinates: Número máximo de iterações atingido!');
				return null;
			}
		}

		return coord;
	}

	function allocateOutliers(side, outliers) {
		for (var j = 0; j < outliers.length; j++) {
			outliers[j].x = (side/outliers.length) * (i+1);
			outliers[j].y = (side*0.87);
		}
		return outliers;
	}

	// This function search for the best possible pair of similar
	// persons from two graphs.
	// The best pair is the one with smaller similarity measure
	// (the smaller the more simillar they are).
	function getMostSimilarPair(graph1, graph2) {
		// Start with the a null best pair:
		var bestPair = {
			'p1_index': null,
			'p2_index': null,
			'smilarity': null
		};

		// For each member of graph1
		for(i=0; i < graph1.length; i++) {
			// If there is nothing on graph1[i]:
			if(graph1.hasOwnProperty(i) === false) continue;

			// Search for the best pair for it:
			current = getMostSimilar(graph1[i], graph2);

			// If current is null, it means that graph2 is empty:
			if(current === null) return null;

			// If this new formed pair, is better than the current best:
			if(bestPair.similarity === null || current.similarity < bestPair.similarity) {
				// Save the current pair as the best pair.
				bestPair.p1_index = i;
				bestPair.p2_index = current.person_index;
				bestPair.similarity = current.similarity;
			}
		}

		// If no pair was found,
		// it means that graph1 is empty:
		if(bestPair.similarity === null) return null;
		// Else return the best pair:
		else return bestPair;
	}

	// Search the `graph` for the graph member that is
	// most similar to `person` and return it.
	function getMostSimilar(person, graph, distMaps) {
		// Read from parameters if given, else use 'self.distMaps'
		distMaps = distMaps || self.distMaps;

		var personKey = person.getKey();
		var mostSimilar = { 'person_index': null, 'similarity': null, 'person':null }

		for(int i=0; i < graph.length; i++) {

			// If there is nothing on graph[i]:
			if(graph.hasOwnProperty(i) === false) continue;

			// This line assumes distMaps has all distances, between
			// all persons, if not it will break here.
			var otherKey = graph[i].getKey();
			var similarity = distMaps[personKey][otherKey];

			if(mostSimilar.similarity === null || mostSimilar.similarity < similarity) {
				mostSimilar.person_index = i;
				mostSimilar.similarity = similarity;
				mostSimilar.person = graph[i];
			}
		}

		// If no one was found, it means graph is empty:
		if(mostSimilar.similarity === null) return null;
		// Else return the most similar person:
		return mostSimilar;
	}

	function copyVector(vector) {
		var output_vector = []
		for(var i in vector) {
			output_vector[i] = vector[i];
		}
		return output_vector;
	}
}

// Ideia antiga de como agrupar:
//	 para cada grafico
//	 para cada pessoa desse grafico
//	
//	 Repita:
//	   Encontre no próximo gráfico o cara mais similar.
//	 
//	 Agora faça o somatório da similaridade interna dos grupos
//	 Ordene os grupos com base nisso.
