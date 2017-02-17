const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const segmentDAO = require('./segmentdao.js')
const port = 8080

app.use(bodyParser.urlencoded( {extended : false} ))
app.use(bodyParser.json())

app.get('/segments/:startTime/:endTime', (request, response) => {
	console.log("Get segments by datespan called ", request.params)
	let foundSegments = segmentDAO.getAllSegmentsByDateRange
							(request.params.startTime, request.params.endTime)
	foundSegments.then((segments) => {
		response.status(200)
		response.json(segments)
	})
})

app.get("/segments/", (request, response) => {
	console.log("getting all segments")
	let allSegments = segmentDAO.getAllSegments()
	allSegments.then((segments) => {
			response.status(200)
			response.json(segments)
	})
})

app.put('/segments/', (request, response) => {
	console.log("Update segment ", request.params)
	response.status(200)
	response.location("/segments/"+1)
})

app.post('/segments/', (request, response) => {
	console.log("Now creating segment", request.body)
	let resourceId = segmentDAO.create(request.body)
	resourceId.then((id) => {
		console.log(id)
		response.status(201)
		response.location('/segments/' + id)
		response.end()
	})
})

app.listen(port)

console.log("HI FROM SERVER")