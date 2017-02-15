const redis = require('redis')
const redisClient = redis.createClient()

module.exports =  {
	create: (segment) => {
			let id
			redisClient.incr("id", (error, newId) => {
				id = newId
				redisClient.hmset("segments:" + newId,
													"starDate", segment.startDate,
													"endDate", segment.endDate,
													"priority", segment.priority,
													(error, reply) => {
					if (error) {
						throw Error(error)
					}
				})
				redisClient.zadd("startDate", segment.startDate, newId)
			})
			return id
	},

	update: (segment) => {

	},

	getAll: () => {
		return new Promise((resolve, reject) => {
			let allSegments = []
			let keys = []
			redisClient.scan(0, "MATCH", "segments*", (error, reply) => {
				if (error) {
					reject(error)
				}
				let keys = reply[1]
				console.log(keys)
				keys.forEach((key) => {
					redisClient.hgetall(key, (error, reply) => {
						allSegments.push(reply)
					})
				})
				let cursor = reply[0]
				if (cursor == 0) {
					console.log(cursor)
				}
			})
			console.log(allSegments)
			resolve(allSegments)
		})	
	},

	delete: (segment) => {

	}
}