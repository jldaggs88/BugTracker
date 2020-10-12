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
	
	client.addListener('message', async (from, to, text)=>{
		let str = text;
		if(str.indexOf('BUGREPORT') === -1){
			if(str.indexOf('BUG #') === -1){
				client.say('#BugsChannel', "Oops, I couldn't process your request.\n Send me commands like,\n BUG # <BUG. NO>");
			}
			else {
				client.say('#BugsChannel', `So you need info about "${text}`);
				let t= text.substring(5,text.length);
				let temp = t.trim();

				let queryById = {
					query: 'SELECT * FROM Bugs b WHERE b.id= @id',
					parameters: [{
						name: '@id',
						value: temp
					}]
				};

				({ resources: queryById } = await container.items
				.query(queryById)
				.fetchAll());
				
				if(queryById.length > 0){
					client.say('#BugsChannel', `${queryById[0].url} ~ Status: ${queryById[0].status} Title: ${queryById[0].title}`);
				} else {
					client.say('#BugsChannel', 'No bugs found.');
				}
			}
		} else {
			client.say('#BugsChannel', "Working on your Bug Report!");
			client.say('#BugsChannel', "One Sec!");

			let queryOpenItems = {
				query: 'SELECT * FROM Bugs b WHERE b.status= @status',
				parameters: [{
					name: '@status',
					value: 'Open'
				}]
			};

			({ resources: queryOpenItems } = await container.items
			.query(queryOpenItems)
			.fetchAll());

			console.log(queryOpenItems.length)
			client.say('#BugsChannel', `Open Bugs: ${queryOpenItems.length}`);

			let queryClosedItems = {
				query: 'SELECT * FROM Bugs b WHERE b.status= @status',
				parameters: [{
					name: '@status',
					value: 'Closed'
				}]
			};

			({ resources: queryClosedItems } = await container.items
			.query(queryClosedItems)
			.fetchAll());
	
			client.say('#BugsChannel', `Closed Bugs: ${queryClosedItems.length}`);
		}
		
	})
	client.on('error', (err) => {
		console.warn(err.message)
 });
}

async function handleError(error) {
	console.log("\nAn error with code '" + error.code + "' has occurred:");
	console.log("\t" + error.body || error);
}

main().catch(handleError);