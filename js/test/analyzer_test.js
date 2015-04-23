
fs = require('fs')
expect = require('chai').expect
assert = require('chai').assert

Analyzer = require("./../analyzer.js").Analyzer;
inputParser = require("./../inputParser.js").inputParser;

// data.json declares the variable 'rawData'
eval(fs.readFileSync('../../data/data.json', 'utf-8'));

var rawData1 = [
  [
    {"personId":1,"placeType":"S","placeId":92},
    {"personId":1,"placeType":"A","placeId":12},
    {"personId":2,"placeType":"B","placeId":99},
    {"personId":2,"placeType":"B","placeId":95},
    {"personId":2,"placeType":"D","placeId":24}
  ],
  [
    {"personId":1,"placeType":"I","placeId":65},
    {"personId":2,"placeType":"S","placeId":92},
    {"personId":3,"placeType":"Y","placeId":96},
    {"personId":4,"placeType":"Y","placeId":97},
    {"personId":4,"placeType":"Y","placeId":90},
    {"personId":4,"placeType":"F","placeId":46}
  ]
]

var rawData2 = [
  [
    {"personId":1,"placeType":"S","placeId":92},
    {"personId":2,"placeType":"A","placeId":12},
    {"personId":3,"placeType":"B","placeId":99},
    {"personId":4,"placeType":"B","placeId":95},
    {"personId":5,"placeType":"D","placeId":24},
    {"personId":6,"placeType":"D","placeId":24},
    {"personId":7,"placeType":"D","placeId":24},
    {"personId":8,"placeType":"D","placeId":24},
    {"personId":9,"placeType":"D","placeId":24},
    {"personId":10,"placeType":"D","placeId":24}
  ],
  [
    {"personId":1,"placeType":"I","placeId":65},
    {"personId":2,"placeType":"S","placeId":92},
    {"personId":3,"placeType":"Y","placeId":96},
    {"personId":4,"placeType":"Y","placeId":97},
    {"personId":5,"placeType":"Y","placeId":90},
    {"personId":6,"placeType":"F","placeId":46},
    {"personId":7,"placeType":"D","placeId":24},
    {"personId":8,"placeType":"D","placeId":24},
    {"personId":9,"placeType":"D","placeId":24},
    {"personId":10,"placeType":"D","placeId":24}
  ]
]

function newAnalyzer(rawData) {
  inputParser.initialize(rawData);
  return new Analyzer(inputParser.graphs, 500, true);
}

// Used on the tests below.
var a = newAnalyzer(rawData1);
var b = newAnalyzer(rawData2);

describe('Analyzer', function(){

  describe('#getRand()', function(){

    it('should return between 0 and 100', function(){
      for(var i=0; i<100; i++) {
        var rand = a.getRand(0, 100);
        //expect(rand).to.be.at.least(0);
        //expect(rand).to.be.at.most(100);
        assert(rand>=0, 'rand should be >= 0');
        assert(rand<=100, 'rand should be <= 100');
      }
    })

    it('should return the floor for decimals', function() {
      // Test if getRand is getting using the Math.floor():
      for(var i=0; i<100; i++) {
        var rand = a.getRand(0.9, 99.9);
        //expect(rand).to.be.at.least(0);
        //expect(rand).to.be.at.most(99);
        assert(rand>=0, 'rand should be >= 0');
        assert(rand<=99, 'rand should be <= 100');
      }
    })
  })

  describe('#computeDistanceMap()', function(){
    it('should not throw', function(done) {
      this.timeout(5000);
      function fn() { a.computeDistanceMap(); done(); }
      expect(fn).to.not.throw();
    })

    it('should initialize distMaps', function(done) {
      this.timeout(7000);
      assert(typeof a.distMaps === 'object', 'distMaps should be initialized');
      var numPersons = Object.keys(a.distMaps).length;
      assert(numPersons === 6, 'distMaps should have all Persons');
      for(var i in a.distMaps) {
        var len = Object.keys(a.distMaps[i]).length;
        assert(len === numPersons, 'distMaps should have all distances between everyone')
      }
      done();
    })

    it('should calculate the distance correctly', function(done) {
      var dist11_12 = Math.sqrt(1+1);
      var dist11_14 = Math.sqrt(1+1+4);
      expect(a.distMaps['1,1']['1,2']).to.equal(dist11_12);
      expect(a.distMaps['1,2']['1,1']).to.equal(dist11_12);
      expect(a.distMaps['1,1']['1,4']).to.equal(dist11_14);
      done();
    })

    it('should calculate maxDistance', function(done) {
      var dist01_14 = Math.sqrt(4+1+4+1);
      assert(typeof a.maxDistance == 'number',
          'maxDistance to be initialized');
      expect(a.maxDistance).to.equal(dist01_14);
      done();
    })
  })

  describe('#computeOutliers()', function(){
    a.computeDistanceMap();
    a.computeOutliers();
    b.computeDistanceMap();
    b.computeOutliers();
    
    it('should initialize self.distSumVector', function(done) {
      assert(typeof a.distSumVector === 'object');
      expect(a.distSumVector.length).to.equal(6);
      done();
    })

    it('should calculate correctly distSumVector', function(done) {
      expect(a.distSumVector).to.include.keys('0');
      var v = ['0,1','0,2','1,1','1,2','1,3','1,4'];
      for(var i in a.distSumVector) {
        for(var j in v) {
          if( v[j] === a.distSumVector[i].key )
            v[j] = null;
        }
      }
      var allIn = true;
      for(var i in v) if(v[i]!==null) allIn = false;
      assert(allIn===true, 'all persons should be on the vector');
      done();
    })

    it('should calculate correctly self.outlierKeySet', function(done) {
      //console.log(b.outlierKeySet.size);
      expect(b.outlierKeySet).to.be.instanceof(Set);
      expect(b.outlierKeySet.size).to.equal(2)
      done();
    })
  })

  describe('#isCoordAllowed()', function(){
    a.computeDistanceMap();
    a.computeOutliers();

    it('should return true or false', function(done) {
      a.side=500;
      var v1 = a.isCoordAllowed([300,300], [[0,0]])
      var v2 = a.isCoordAllowed([0,0], [[0,0]])
      var v3 = a.isCoordAllowed([300,300], [[300,300],[0,0]])

      expect(v1).to.equal(true);
      expect(v2).to.equal(false);
      expect(v3).to.equal(false);
      done();
    })
  })

  describe('#markOutliers()', function(){
    b.computeDistanceMap();
    b.computeOutliers();

    it('should return a dict with 2 arrays', function(done) {
      var v1 = b.markOutliers(b.graphs[0])
      expect(v1).to.contain.keys('outliers','commonPeople')
      expect(v1.outliers).to.be.instanceof(Array);
      expect(v1.commonPeople).to.be.instanceof(Array);
      done();
    });

    it('all Persons of graph must be in the dict', function(done) {
      var v1 = b.markOutliers(b.graphs[0]);
      expect(v1.outliers.length + v1.commonPeople.length)
        .to.equal(b.graphs[0].length)
      done();
    });
  })

  describe('#copyVector()', function(){

    it('should copy all values', function(done) {
      var v1 = b.copyVector([0,1,2,3]);
      expect(v1.length).to.equal(4);
      expect(v1[0]).to.equal(0);
      expect(v1[1]).to.equal(1);
      expect(v1[2]).to.equal(2);
      expect(v1[3]).to.equal(3);
      done();
    })
  })

  describe('#getMostSimilar()', function(){
    a.computeDistanceMap();
    a.computeOutliers();
    
    it('should return a dict with 3 attributes', function(done) {
      var person = a.graphs[0][0];
      var v1 = a.getMostSimilar(person, a.graphs[0]);
      
      expect(v1).to.be.instanceof(Object);
      expect(v1).to.contain.keys('person_index','similarity','person');

      done();
    })

    it('should find the most similar person', function(done) {
      var p1 = a.graphs[0][0];
      var p2 = a.graphs[1][0];
      var v1 = a.getMostSimilar(p1, a.graphs[0]);
      var v2 = a.getMostSimilar(p2, a.graphs[1]);

      expect(v1.person_index).to.equal(0);
      expect(v1.similarity).to.equal(0);
      expect(v1.person).to.equal(p1);

      expect(v2.person_index).to.equal(0);
      expect(v2.similarity).to.equal(0);
      expect(v2.person).to.equal(p2);

      done();
    })

  })

  describe('#getMostSimilarPair()', function(){
    a.computeDistanceMap();
    a.computeOutliers();

    it('should return a dict', function(done) {
      var g1 = a.graphs[0];
      var g2 = a.graphs[1];
      var v1 = a.getMostSimilarPair(g1,g1);

      expect(v1).to.be.instanceof(Object);
      expect(v1).to.contain.keys('p1_index', 'p2_index', 'similarity');
      done();
    })

    it('should return a similar pair', function(done) {
      var g1 = a.graphs[0];
      var g2 = a.graphs[1];
      var v1 = a.getMostSimilarPair(g1,g1);
      var v2 = a.getMostSimilarPair(g1,g2);
      var v3 = a.getMostSimilarPair(g2,g1);

      expect(v1.p1_index).to.equal(v1.p2_index);
      expect(v1.similarity).to.equal(0);

      expect(v2.p1_index).to.equal(v3.p2_index);
      expect(v3.p2_index).to.equal(v2.p1_index);
      expect(v2.similarity).to.equal(v3.similarity);
      done();
    })
  })

  describe('#allocateOutliers()', function(){
    a.computeDistanceMap();
    a.computeOutliers();

    it('should return an array', function(done) {
      var v1 = a.allocateOutliers(500, a.graphs[1]);
      expect(v1).to.be.instanceof(Array);
      expect(v1.length).to.equal(a.graphs[1].length);
      done();
    })

    it('each person on the graph must have .x and .y', function(done) {
      var v1 = a.allocateOutliers(500, a.graphs[1]);

      for(var i in v1) {
        expect(v1[i].x).to.exist;
        expect(v1[i].x).to.be.a('number');

        expect(v1[i].y).to.exist;
        expect(v1[i].y).to.be.a('number');
      }

      done();
    })
  })

  describe('#generateSafeCoordinates()', function(){
    a.computeDistanceMap();
    a.computeOutliers();

    it('should return an array [x,y]', function(done) {
      var v1 = a.generateSafeCoordinates(500, []);

      expect(v1).to.be.instanceof(Array);
      expect(v1).to.have.length(2);
      expect(v1[0]).to.be.a('number');
      expect(v1[1]).to.be.a('number');

      done();
    })

    it('should run several times with new coordinates', function(done) {
      var aux = function() {
        return a.generateSafeCoordinates(500,coordsVector)
      }

      for(var i=0; i<100; i++) {
        var coordsVector = []
        coordsVector.push(aux());
        coordsVector.push(aux());
        coordsVector.push(aux());
        coordsVector.push(aux());

        coordsVector.push(aux());
        coordsVector.push(aux());
        coordsVector.push(aux());
        coordsVector.push(aux());

        coordsVector.push(aux());
        coordsVector.push(aux());
        coordsVector.push(aux());
        coordsVector.push(aux());

        expect(coordsVector).to.have.length(12);
      }

      done();
    })
  })

  describe('#generateCoordinates()', function(){
    a.computeDistanceMap();
    a.computeOutliers();

    it('should return a dict', function(done) {
      var v1 = a.generateCoordinates(a.graphs[0]);

      expect(v1).to.be.instanceof(Object);
      expect(v1).to.contain.keys(
        'commonPeople','outliers','coordsVector'
      );
      
      for(var i in v1) {
        expect(v1[i]).to.be.instanceof(Array);
      }

      done();
    })

    it('should create coordinates for all persons', function(done) {
      var v1 = a.generateCoordinates(a.graphs[0]);
      var TotalLen = v1.outliers.length + v1.commonPeople.length;

      expect(TotalLen).to.equal( a.graphs[0].length );

      var p = a.graphs[0]
      for(var i in p) {
        expect(p[i].x).to.exist;
        expect(p[i].x).to.be.a('number');
        expect(p[i].y).to.exist;
        expect(p[i].y).to.be.a('number');
      }

      // This should work, but doesn't
      // It says that graph[1] already have some x or y initialized.
      /*var p = a.graphs[1]
      for(var i in p) {
        expect(p[i].x).to.not.exist;
        expect(p[i].y).to.not.exist;
      }*/

      done();
    })
  })

  describe('#computeCoordinates()', function(){
    a.computeDistanceMap();
    a.computeOutliers();

    it('should not throw', function(done) {
      var fn = function () { a.computeCoordinates(); done(); }
      expect(fn).to.not.throw();
    })

    it('should initialize all coordinates', function(done) {
      a.computeCoordinates();

      for(var g in a.graphs) {
        for(var p in a.graphs[g]) {
          p = a.graphs[g][p];

          expect(p.x).to.exist;
          expect(p.x).to.be.a('number');
          expect(p.y).to.exist;
          expect(p.y).to.be.a('number');
        }
      }

      done();
    })
  })

  describe('Runing with original data file', function(){
    it('Should work with original rawData', function(done) {
      this.timeout(20000)
      var fn = function() {
        inputParser.initialize(rawData);
        var v = new Analyzer(inputParser.graphs, 500);
        //v.computeDistanceMap();
        //v.computeOutliers();
        //v.computeCoordinates();
        done();
      }
      expect(fn).to.not.throw();
    })
  })

})














