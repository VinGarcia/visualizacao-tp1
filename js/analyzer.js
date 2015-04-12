
function Analyzer(data, nGroups) {
	this.persons = data.gPersonList;
	this.num = nGroups || 8;

	this.buildMatrix = function(persons) {
		var simMatrix = [];
		var max=0, min=0;
	
		persons = persons || this.persons;
	
		for(var i in persons) {
			var simVec = [];
			
			for(var j in persons) {
				simVec.push( persons[i].simEuclidean(person[j]) );
				if(simVec[j] > max) max = simVec[j];
				if(simVec[j] < min) min = simVec[j];
			}
			
			simMatrix.push(simVec);
		}
	
		if(persons == this.persons) {
			this.max = max;
			this.min = min;
		}
	
		return simMatrix;
	}
	
	this.buildVector = function(persons, matrix) {
		persons = persons || this.persons;
	
		for(var i in persons) {
			persons[i].stats = 0;
			for(var j in persons)
				persons[i].stats += matrix[i][j]
		}
	
		return vec;
	}

	this.formGroups = function(nGroups, persons) {
		persons = persons || this.persons;
		nGroups = nGroups || this.num;
	
		this.matrix = this.matrix || buildMatrix(persons);
		this.vec = this.vec || buildVector(persons, this.matrix);
	
	  return this.method(this.vec)
	}

  this.method = function(persons) {
		persons = persons || this.persons;
		if(persons[0].stats === undefined)
			buildVector(persons);
	
		// Sort in crescent order:
		persons = persons.sort(function(a,b){
			return a.stats - b.stats;
		});
		
		var benchmark_base = (this.max-this.min)/this.num;
		var benchmark = benchmark_base;
	
		// There will be this.num groups in total:
		var groups = [];
		var currentGroup = 0;
		for(var person in persons) {
			person = persons[i];
	
			if(person.stats > benchmark) {
				currentGroup++;
				benchmark += benchmark_base;
			}
	
	    groups[currentGroup].push(person)
		}

		return groups;
	}
}

// Ideia antiga de como agrupar:
	// para cada grafico
	// para cada pessoa desse grafico
	//
	// Repita:
	//   Encontre no próximo gráfico o cara mais similar.
	// 
	// Agora faça o somatório da similaridade interna dos grupos
	// Ordene os grupos com base nisso.

