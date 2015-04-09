
function parseCsv(file, callback) {

	var graphs = []
	var graph = null

	d3.text(file, 'text/plain', function(text) {
		text = 'id person type place\n' + text
		text = text.replace(' ', ',', 'g')

		d3.csv.parse(text,
			function(line) {
				if(line.id=='graph') {
					if(graph instanceof Array) graphs.push(graph)
					graph = []
				} else {
					graph.push(line)
				}
				return 'empty'
			}
		)
    graphs.push(graph)

		// End function:
		callback(graphs)
	})
}
