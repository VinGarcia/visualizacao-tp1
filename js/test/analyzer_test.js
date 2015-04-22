
fs = require('fs')
expect = require('chai').expect

Analyzer = require("./../analyzer.js").Analyzer;
inputParser = require("./../inputParser.js").inputParser;

eval(fs.readFileSync('../../data/data.json', 'utf-8'));

inputParser.initialize(rawData);

function newAnalyzer() {
	return new Analyzer(inputParser.graphs, 500, true);
}

// Used on the tests below.
var a = newAnalyzer();

describe('Analyzer', function(){

	describe('#getRand()', function(){

		it('should return between 0 and 100', function(){
			for(i=0; i<100; i++) {
				var rand = a.getRand(0, 100);
				expect(rand).to.be.at.least(0);
				expect(rand).to.be.at.most(100);
			}
		})

		it('should return the floor for decimals', function() {
			// Test if getRand is getting using the Math.floor():
			for(i=0; i<100; i++) {
				var rand = a.getRand(0.9, 99.9);
				expect(rand).to.be.at.least(0);
				expect(rand).to.be.at.most(99);
			}
		})
	})

	describe('#computeDistanceMap()', function(){
		it('should not throw', function(done) {
			this.timeout(5000);
			function fn() { a.computeDistanceMap(); done(); }
			expect(fn).to.not.throw();
		})

		it('should initialize distMap', function() {
			//a = newAnalyzer();
			//this.timetout(7000);
			//function fn() { a.computeDistanceMap(); done(); }
			//expect(fn).to.not.throw();
			//try{ a.computeDistanceMap() } catch(e) { console.log(e) }
			//console.log(a.distMaps);
			//expect(a.distMaps).to.be.ok();
		})
	})
})














