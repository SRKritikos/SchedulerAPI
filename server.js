const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const segmentDAO = require('./segmentdao.js')
const port = 8080

app.use(bodyParser.urlencoded( {extended : false} ))
app.use(bodyParser.json())

app.get('/segments/:startTime/:endTime', (request, response) => {
	console.log("Get segments by datespan called ", request.params)
	response.status(200)
	response.send({ 'segment' : { 'startDate' : 1 }})
})

app.get("/segments/", (request, response) => {
	console.log("getting all segments")
	let allSegments = segmentDAO.getAll()
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
	segmentDAO.create(request.body)
	response.status(201)
	response.location('/segments/'+1)
	response.send();
})

app.listen(port)

console.log("HI FROM SERVER")