require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');

const client = new Client();

// Paraphrasing using Hugging Face T5
async function paraphrase(text) {
  try {
    const res = await axios.post(
      'https://api-inference.huggingface.co/models/Vamsi/T5_Paraphrase_Paws',
      { inputs: `paraphrase to make it sound like a normal human message: ${originalText}`},
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        },
        timeout: 10000,
      }
    );
    const result = res.data[0]?.generated_text;
    return result || '[Failed to paraphrase]';
  } catch (err) {
    console.error('Paraphrasing failed:', err.response?.data || err.message);
    return '[Error paraphrasing]';
  }
}

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (msg) => {
  // Only forward certain users' messages
  if (msg.channel.id === process.env.SOURCE_CHANNEL_ID) {
  const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL_ID);

  if (targetChannel) {
    const content = msg.content;
    const author = msg.author.tag;
    const paraphrased = await paraphrase(content);

    targetChannel.send(`💬 **${author} said:**\n${paraphrased}`);
  }
};

  // Only from the defined source channel
  if (msg.channel.id === process.env.SOURCE_CHANNEL_ID) {
    const paraphrased = await paraphrase(msg.content);

    const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL_ID);
    if (targetChannel) {
      targetChannel.send(`🌀 *Paraphrased version:*\n${paraphrased}`);
    } else {
      console.error('Target channel not found.');
    }
  }
});

client.login(process.env.USER_TOKEN);
