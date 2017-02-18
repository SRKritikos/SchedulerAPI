const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const planDAO = require('./plandao.js')
const port = 8080

app.use(bodyParser.urlencoded( {extended : false} ))
app.use(bodyParser.json())

app.get('/plans/:startTime/:endTime', (request, response) => {
	console.log("Get plans by datespan called ", request.params)
	planDAO.getAllPlansByDateRange(request.params.startTime, request.params.endTime)
	.then((plans) => {
		response.status(200)
		response.json(plans)
	}).catch((error) => {
		if (error === 0) {
			response.status(404)
		} else {
			response.status(500)
		}
		response.end()
	})
})

app.get("/plans/", (request, response) => {
	console.log("getting all plans")
	planDAO.getAllPlans().then((plans) => {
			response.status(200)
			response.json(plans)
	}).catch((error) => {
		if (error === 0) {
			response.status(404)
		} else {
			response.status(500)
		}
			response.end()
	})
})

app.put('/plans/', (request, response) => {
	console.log("Update plan ", request.body)
	planDAO.update(request.body).then((planId) => {
		response.status(204)
		response.location("/plans/" + planId)
		response.end()
	}).catch((error) => {
		if (error === 0) {
			response.status(404)
		} else {
			response.status(500)
		}
		response.end() 
	})
})

app.post('/plans/', (request, response) => {
	console.log("Now creating plan", request.body)
	planDAO.create(request.body).then((planId) => {
		response.status(201)
		response.location('/plans/' + planId)
		response.end()
	}).catch((error) => {
		reponse.status(500) 
		reponse.end()
	})
})

app.delete("/plans/:planId", (request, response) => {
	console.log("Now deleting plan", request.params.planId)
	 planDAO.delete(request.params.planId).then(() => {
		 response.status(200)
		 response.end()
	 }).catch((error) => {
		 response.status(500)
		 response.end()
	 })
})

app.listen(port)

console.log("HI FROM SERVER")