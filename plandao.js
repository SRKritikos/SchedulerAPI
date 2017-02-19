const redis = require('redis')
const redisClient = redis.createClient()

module.exports =  {
	
	/**
	 * Read functions
	 */

	getPlanForPlanId: (planId) => {
		return new Promise((resolve, reject) => {
			redisClient.hgetall(planId, (error, plan) => {
				if (error) {
					reject(error)
				}
				plan = JSON.parse(plan.plan)
				resolve(plan)
			})
		})	
	},

	getActivePlanIds: () => {
		return new Promise((resolve, reject) => {
			redisClient.smembers("activePlanIds", (error, planIds) => {
				if (error) {
					reject(error)
				}
				resolve(planIds)
			})
		})
	},

	determineIfPlanExists: (planId) => {
		return new Promise((resolve, reject) => {
			redisClient.sismember("activePlanIds", planId, (error, reply) => {
				if (error) {
					reject(error)
				}
				resolve(reply)
			})
		})

	},

	/**
	 * Create functions
	 */

	incrementId: () => {
		return new Promise((resolve, reject) => {
			redisClient.incr("planId", (error, newId) => {
				if (error) {
					reject(error)
				}
				resolve(newId)
			})
		})
	},

	insertPlan: (plan) => {
		return new Promise((resolve, reject) => {
			redisClient.hmset(
				plan.id,
				"plan", JSON.stringify(plan),
				(error, reply) => {
					if (error) {
						reject(error)
					}
					resolve(reply)	
				})
		})								
	},

	insertIntoPlanIdsSet: (newPlanId) => {
		return new Promise((resolve, reject) => {
			redisClient.sadd("activePlanIds", newPlanId, (error, reply) => {
				if (error) {
					reject(error)
				}
				resolve(reply)
			})
		})
	},
	
	/**
	 * Delete function
	 */

	removePlanIdFromActivePlanSet: (planId) => {
		return new Promise((resolve, reject) => {
			redisClient.srem("activePlanIds", planId, (error, reply) => {
				if (error) {
					reject(error)
				}
				resolve(reply)
			})
		})
	},
}