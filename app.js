// irc entry
const irc = require('irc');

const client = new irc.Client('irc.freenode.net', 'BugTrackerIRCBot', {
	autoConnect: false
});

client.connect(5, (serverReply) => {
	console.log("Connected!\n", serverReply);

	client.join('#BugsChannel', (_) => {
		console.log("Joined #BugsChannel");
		client.say('#BugsChannel', "Welcome! I am IRC Bot. Here to track bugs in your application for your team.\n I can help you using following commands.\n BUGREPORT \n BUG # <BUG. NO>");
	});

});

// bot entry
const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const { databaseId, containerId, pcKey } = config;
const dbContext = require("./data/databaseContext");
const cosClient = new CosmosClient(pcKey);
const database = cosClient.database(databaseId);
const container = database.container(containerId);

async function main(){
	await dbContext.create(cosClient, databaseId, containerId);
	console.log(`Querying container: ${container.id}`);

	// query to return all items
	const querySpec = {
		query: "SELECT * from c"
	};

	const { resources: items } = await container.items
  .query(querySpec)
	.fetchAll();
}

async function handleError(error) {
	console.log("\nAn error with code '" + error.code + "' has occurred:");
	console.log("\t" + error.body || error);
}

main().catch(handleError);
// const cosClient = new CosmosClient("AccountEndpoint=https://bugbotdb.documents.azure.com:443/;AccountKey=1Yx7lotfapV9lwF28S0zlSCBXUgxKqzhWABF1opviIcuxJX1eI6wSI9HqD7iIRlnEEGHj4dR71cNfiBqXjMY6A==;")
// async function main() {

// 	const database = cosClient.database(databaseId);
// 	const container = database.container(containerId);

// 	console.log('container', container.database.client);
	
// 	// Make sure Tasks database is already setup. If not, create it.
// 	// await dbContext.create(cosClient, databaseId, containerId);
// 	// try {
// 		// console.log(`Querying container: ${containerId}`);
// 		// const { resource: createdItem } = await container.items.create(newItem);
// 		// console.log(`\r\nCreated new item: ${createdItem.id} - ${createdItem.description}\r\n`);

// 		client.addListener('message', (from, to, text)=>{
// 			console.info("made it to the even listener");
// 			let str = text;
// 			if(str.indexOf('BUGREPORT') === -1){
// 				if(str.indexOf('BUG #') === -1){
// 					client.say('#BugsChannel', "I could not get that!\n Send me commands like,\n BUG # <BUG. NO>");
// 				}
// 				else {
// 					client.say('#BugsChannel', `So you need info about "${text}`);
// 					client.say('#BugsChannel', "Wait for a moment!");
// 					let t= text.substring(6,text.length);
// 					let temp = t.trim();
					
// 					let querySpec = {
// 						query: 'SELECT * FROM Bugs b WHERE b.id= @id',
// 						parameters: [{
// 							name: '@id',
// 							value: temp
// 						}]
// 					};

// 					// read all items in the container by the given value
// 					const { resources: bugsById } = container.items
// 					.query(querySpec)
// 					.fetchAll();
		
// 					if(BugsById.length > 0){
// 						client.say('#BugsChannel', `[${bugsById[0].url}] [Status]: ${bugsById[0].status} [Title]: ${bugsById[0].title}`);
// 					}
// 					else {
// 						client.say('#BugsChannel', 'No bugs found.');
// 					}
// 				}
// 			}
// 			else {
// 				client.say('#BugChannel', "So you need a Bug Report!");
// 				client.say('#BugsChannel', "Wait for a moment!");
// 				let querySpec2 = {
// 					query: 'SELECT * FROM Bugs b WHERE b.status= @status',
// 					parameters: [{
// 						name: '@status',
// 						value: 'Open'
// 					}]
// 				};

// 				// read all items in the container with open status
// 				const { resources: openItems } = container.items
// 				.query(querySpec2)
// 				.fetchAll();
		
// 				client.say('#BugsChannel', `Total Open Bugs: ${openItems.length}`);
		
// 				let querySpec3 = {
// 					query: 'SELECT * FROM Bugs b WHERE b.status= @status',
// 					parameters: [{
// 						name: '@status',
// 						value: 'Closed'
// 					}]
// 				};
		
// 				// read all items in the container with closed status
// 				const { resources: closedItems } = container.items
// 				.query(querySpec3)
// 				.fetchAll();
		
// 				client.say('#BugsChannel', `Total Closed Bugs: ${closedItems.length}`);
// 			}
// 		});
// }

// async function handleError(error) {
//     console.log("\nAn error with code '" + error.code + "' has occurred:");
//     console.log("\t" + error.body || error);
// }

// main().catch(handleError);
