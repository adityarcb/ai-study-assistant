export function stripQuestionFields(questions) {
  if (!questions?.length) return [];
  return questions.map(({ id, questionText, optionA, optionB, optionC, optionD }) => ({
    id, questionText, optionA, optionB, optionC, optionD,
  }));
}
