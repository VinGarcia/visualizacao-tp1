
fs = require('fs')
expect = require('chai').expect

Analyzer = require("./../analyzer.js").Analyzer;
inputParser = require("./../inputParser.js").inputParser;

eval(fs.readFileSync('../../data/data.json', 'utf-8'));

// Set true for the analyzer debuging mode:
//DEBUG_MODE = true;

inputParser.initialize(rawData);
var a = new Analyzer(inputParser.graphs, 500);


describe('Analyzer', function(){

	describe('#getRand()', function(){

		it('should return between 0 and 100', function(){

			for(i=0; i<100; i++) {
				var rand = getRand(0, 100);
				expect(rand).to.be.at.least(0);
				expect(rand).to.be.at.most(100);
			}

			// Test if getRand is getting using the Math.floor():
			for(i=0; i<100; i++) {
				var rand = getRand(0.9, 99.9);
				expect(rand).to.be.at.least(0);
				expect(rand).to.be.at.most(99);
			}

		})
	})
})
