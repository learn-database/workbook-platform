import type { LegacyStaticLesson } from "../index.js";

export const legacyStaticLesson10: LegacyStaticLesson = {
  lessons_raw: [
    {
      id: 10,
      title: "Functional Dependencies",
      overview: "Selected static player fixture.",
      schema: "NorthWind",
      questions: [
        {
          id: 1,
          type: "text block",
          prompt: "Read the static player compatibility note.",
          solution: "",
          points: 0,
          response: "",
          hint: "",
          feedback: "",
          feedback_correct: "",
          feedback_incorrect: "",
        },
        {
          id: 2,
          type: "multiple choice",
          prompt: "Which pattern is supported by this legacy fixture?",
          options: [
            {
              id: 1,
              text: "Legacy question validation",
            },
            {
              id: 2,
              text: "Canvas launch",
            },
          ],
          solution: 1,
          points: 1,
          response: 0,
          hint: "Choose the validation-related answer.",
          feedback: "",
          feedback_correct: "Correct.",
          feedback_incorrect: "Try again.",
          bonus: false,
        },
      ],
    },
  ],
};
