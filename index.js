require("dotenv").config(); //Taking the bot token from .env file
const { Bot, GrammyError, HttpError, Keyboard } = require("grammy"); //Import from grammy library

const bot = new Bot(process.env.BOT_API_KEY); //Creating an instance of the `Bot` class

//Handling the 'start' command
bot.command("start", async (ctx) => {
  const startKeyboard = new Keyboard() //Creating a new keyboard with 'HTML','CSS', 'JavaScript', 'React' options.
    .text("HTML")
    .text("CSS")
    .row() //chaging the row
    .text("JavaScript")
    .text("React")
    .resized(); //resizing keyboard to the screen size(for phone)

  await ctx.reply(
    "Hi! I am Frontend Interview Bot \nI will help you to get ready for a Front-end Interview!"
  );

  await ctx.reply("With what will we start? Choose a topic in the menu", {
    reply_markup: startKeyboard,
  });
});

//Handling other messages
bot.hears(["HTML","CSS","JavaScript","React"], async (ctx) => {
  await ctx.reply(`What is ${ctx.message.text}?`);
});

//Catching Errors
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start(); //Starting the bot
