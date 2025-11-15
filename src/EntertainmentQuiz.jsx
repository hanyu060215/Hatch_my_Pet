const allQuestions = Object.values(questions).flat();
const randomIndex = Math.floor(Math.random() * questions.length);
const randomQuestion = questions[randomIndex];

console.log(questions);