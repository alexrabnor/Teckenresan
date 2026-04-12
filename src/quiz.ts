import type { QuizQuestion, QuizType } from './types';
import { WORLDS } from './data';

const QUIZ_TYPES: QuizType[] = ['emoji-to-text', 'text-to-emoji', 'find-wrong'];

function randomType(): QuizType {
  return QUIZ_TYPES[Math.floor(Math.random() * QUIZ_TYPES.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateQuiz(worldIndex: number): QuizQuestion[] {
  const world = WORLDS[worldIndex];
  const selected = shuffle(world.squares).slice(0, 4);

  return selected.map(sq => {
    const type = randomType();

    if (type === 'emoji-to-text') {
      // Show emoji → pick correct Swedish word
      const wrong = shuffle(world.squares.filter(s => s.squareNum !== sq.squareNum))
        .slice(0, 3)
        .map(s => s.name);
      const options = shuffle([sq.name, ...wrong]);
      return {
        type,
        signName: sq.name,
        signEmoji: sq.emoji,
        options,
        correctIndex: options.indexOf(sq.name),
      };
    }

    if (type === 'text-to-emoji') {
      // Show Swedish word → pick correct emoji
      const wrong = shuffle(world.squares.filter(s => s.squareNum !== sq.squareNum))
        .slice(0, 3)
        .map(s => s.emoji);
      const options = shuffle([sq.emoji, ...wrong]);
      return {
        type,
        signName: sq.name,
        signEmoji: sq.emoji,
        options,
        correctIndex: options.indexOf(sq.emoji),
      };
    }

    // find-wrong: show 4 pairs, one is mismatched — click the wrong one
    // Pick 3 other correct squares + 1 deliberately mismatched
    const others = shuffle(world.squares.filter(s => s.squareNum !== sq.squareNum)).slice(0, 3);
    const correctPairs = [{ emoji: sq.emoji, name: sq.name }, ...others.map(s => ({ emoji: s.emoji, name: s.name }))];

    // Create wrong pair: swap emoji from another square into a random slot
    const wrongIdx = Math.floor(Math.random() * 4);
    const wrongEmojiSource = shuffle(world.squares.filter(s => s.squareNum !== correctPairs[wrongIdx === 0 ? 1 : 0].name as unknown as number)).find(
      s => s.emoji !== correctPairs[wrongIdx].emoji
    );
    const pairs = correctPairs.map((pair, i) =>
      i === wrongIdx && wrongEmojiSource ? { emoji: wrongEmojiSource.emoji, name: pair.name } : pair
    );

    return {
      type,
      signName: sq.name,
      signEmoji: sq.emoji,
      options: pairs.map((_, i) => String(i)), // options are pair indices as strings
      correctIndex: wrongIdx,
      pairs,
    };
  });
}
