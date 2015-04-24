
if(typeof places === 'undefined') {
  var places = [
	  "A","B","C","D","E","F","G","H","I",
    "J","K","L","M","N","O","P","Q","R",
    "S","T","U","V","W","X","Y","Z"
  ]
}

// Used to sort data:
if(typeof exports !== 'undefined') {
	console.log('entrou!');
	exports.distMatrix = distMatrix;
  
	var d3 = require('./d3.js');
	var simSort = require('./simSort.js').simSort;
	var fs = require('fs');

	var file = fs.readFileSync('data.tsv', 'utf-8');

  var data = d3.tsv.parse(file, function(d) {

    return {
      number: +d.number,
      graph: +d.graph,
      person: +d.person,
      place: d.place,
      freq: +d.freq,
    };

  });

  var dm = distMatrix(data)
	var matrix = dm[0];
	var persons = dm[1];

	var sorted = simSort(persons, matrix);

	console.log('chegou, vai imprimir!');
  fs.writeFileSync('sortedPeople.js', JSON.stringify(sorted));
  //fs.writeFileSync('persons.js', JSON.stringify(persons));
}

// distMatrix expect each line of 'data'
// to contain the following attributes:
// {
//   number: +d.number,
//   graph: +d.graph,
//   person: +d.person,
//   place: d.place,
//   freq: +d.freq,
// };
function distMatrix(data) {

	// Make vector of people:
	var people = []
	for(var i in data) {
    var p = data[i];
    if(people[p.number] === undefined)
      people[p.number] = {
        'number': p.number,
				'graph': p.graph,
				'person': p.person,
        'places': {
          'A':0,'B':0,'C':0,'D':0,'E':0,'F':0,'G':0,'H':0,'I':0,
          'J':0,'K':0,'L':0,'M':0,'N':0,'O':0,'P':0,'Q':0,'R':0,
          'S':0,'T':0,'U':0,'V':0,'W':0,'X':0,'Y':0,'Z':0
        }
			};

		people[p.number].places[p.place] += p.freq;
	}

	// Now build the matrix:
	var matrix = []
	var count = 0
	for(var p1 in people) {

		matrix[p1] = [];

    for(var p2 in people) {
      matrix[p1][p2] = similarity(people[p1], people[p2]);
			//if(matrix[p1][p2]===NaN) count++;
			//if(count++<100) console.log(matrix[p1][p2]);
		}
	}
	//console.log('count: ', count);

	return [matrix, people];

	/* * * * * Functions: * * * * */

  // Similarity metric: euclidean
  function similarity(p1, p2) {

	  var sim = 0;
	  var a, b;
	  for(var L in places) {
		  a = p1.places[places[L]];
		  b = p2.places[places[L]];

		  sim += Math.pow((a - b), 2);
	  }

    return Math.sqrt(sim);
  }
}


