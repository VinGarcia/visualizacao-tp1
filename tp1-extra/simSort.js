
if(typeof exports !== 'undefined') {
	exports.simSort = simSort;
}

function simSort(people, matrix) {

	var copy = [];

	for(var i in people)
		copy.push(people[i]);

	var sorted = [copy[0]];
	var person = copy[0];
	delete copy[0];
  while(true) {
		var mostSimilar = getMostSimilar(person, copy, matrix);

		if(mostSimilar===null) break;

    sorted.push(mostSimilar.person);

		person = mostSimilar.person;

		delete copy[mostSimilar.person_index];
	}

	for(var i in sorted) {
		var num = sorted[i].number;
    people[num].sorted_x = i;
		sorted[i].sorted_x = i;
	}

	return sorted;

	/* * * * * Functions: * * * * */

  // Search the `graph` for the graph member that is
  // most similar to `person` and return it.
  function getMostSimilar(person, people, matrix) {
    var personKey = person.number;
    var mostSimilar = {
			'person_index': null,
			'similarity': null,
			'person':null
		}

    for(var i=0; i < people.length; i++) {

      // If there is nothing on people[i]:
      if(people.hasOwnProperty(i) === false) continue;

      // This line assumes matrix has all distances, between
      // all persons, if not it will break here.
      var otherKey = people[i].number;
      var similarity = matrix[personKey][otherKey];

      if(
        mostSimilar.similarity === null ||
        mostSimilar.similarity > similarity
      ) {
        mostSimilar.person_index = i;
        mostSimilar.similarity = similarity;
        mostSimilar.person = people[i];
      }
    }

    // If no one was found, it means people list is empty:
    if(mostSimilar.similarity === null) return null;
    // Else return the most similar person:
    return mostSimilar;
  }

}

