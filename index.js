const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites
  ]
});

client.commands = new Collection();
client.invites = new Collection();

// Load Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Cache invites when bot is ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Set bot status to Idle with the name "Cfw Studio"
  client.user.setPresence({
    status: 'idle', // Sets the bot status to Idle
    activities: [
      {
        name: 'Cfw Studio',
        type: ActivityType.Playing, // You can change to Watching, Listening, etc. if preferred
      },
    ],
  });

  client.guilds.cache.forEach(async guild => {
    const invites = await guild.invites.fetch();
    invites.forEach(invite => client.invites.set(`${guild.id}-${invite.code}`, invite.uses));
  });
});

client.login(config.TOKEN);
