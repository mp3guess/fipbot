require("dotenv").config(); //Taking the bot token from .env file
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy"); //Import from grammy library
const { getRandomQuestion, getCorrectAnswer } = require("./utils"); //Import from ./utils.js file getRandomeQuestion function

const bot = new Bot(process.env.BOT_API_KEY); //Creating an instance of the `Bot` class

//Handling the 'start' command
bot.command("start", async (ctx) => {
  const startKeyboard = new Keyboard() //Creating a new keyboard with 'HTML','CSS', 'JavaScript', 'React' options.
    .text("HTML")
    .text("CSS")
    .row() //chaging the row
    .text("JavaScript")
    .text("React")
    .row()
    .text("Random Question")
    .resized(); //resizing keyboard to the screen size(for phone)

  await ctx.reply(
    "Hi! I am Frontend Interview Bot \nI will help you to get ready for a Front-end Interview!"
  );

  await ctx.reply("With what will we start? Choose a topic in the menu", {
    reply_markup: startKeyboard,
  });
});

//Handling other messages
bot.hears(["HTML", "CSS", "JavaScript", "React", "Random Question"], async (ctx) => {
  const topic = ctx.message.text.toLowerCase(); //Getting the topic from the message
  const { question, questionTopic } = getRandomQuestion(topic); //Getting a random question from the topic

  let inlineKeyboard;

  if (question.hasOptions) {
    const buttonRows = question.options.map((option) => [
      InlineKeyboard.text(
        option.text,
        JSON.stringify({
          type: `${questionTopic}-option`,
          isCorrect: option.isCorrect,
          questionId: question.id,
        }),
      ),
    ]);

    inlineKeyboard = InlineKeyboard.from(buttonRows);
  } else {
    inlineKeyboard = new InlineKeyboard() //Creating InlineKeyboard
      .text(
        "Get the answer",
        JSON.stringify({
          type: questionTopic,
          questionId: question.id,
        }),
      );
  }

  await ctx.reply(question.text, {
    reply_markup: inlineKeyboard,
  });
},
);

bot.on("callback_query:data", async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data);

  if (!callbackData.type.includes('option')) {
    const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);

    await ctx.reply(answer, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    await ctx.answerCallbackQuery();
    return;
  }

  if (callbackData.isCorrect) {
    await ctx.reply("Correct answer! 🎉");
    await ctx.answerCallbackQuery();
    return;
  }

  const answer = getCorrectAnswer(
    callbackData.type.split('-')[0],
    callbackData.questionId,
  );
  await ctx.reply(`Wrong answer! The correct answer is: ${answer}`);
  await ctx.answerCallbackQuery();
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
