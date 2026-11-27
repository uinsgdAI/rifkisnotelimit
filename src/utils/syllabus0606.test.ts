import assert from 'node:assert/strict';
import test from 'node:test';
import katex from 'katex';
import { SYLLABUS_0606, ALL_SUBTOPICS_0606 } from '../data/syllabus0606';
import { PRACTICE_QUESTION_BANK_0606 } from '../data/practiceBank0606';
import { generate0606MockQuestions } from './questionGenerator0606';
import { evaluateStudentAnswer, gradeStudentAnswer } from './examLogic';
import { tokenizeMathText } from './mathTextParser';
import { getKeyFindingsForNote, highlightImportantText } from './noteKeyFindings';

test('Cambridge 0606 (2025-2027) syllabus has all 14 official chapters and valid quickChecks', () => {
  assert.equal(SYLLABUS_0606.length, 14);
  assert.equal(SYLLABUS_0606[7].title, 'Coordinate geometry of the circle');
  assert.equal(SYLLABUS_0606[13].title, 'Calculus');
  assert.ok(ALL_SUBTOPICS_0606.length >= 38);

  for (const subtopic of ALL_SUBTOPICS_0606) {
    assert.ok(subtopic.id.length >= 3, `Missing id on ${subtopic.title}`);
    assert.ok(subtopic.coreObjectives.length > 0, `Missing objectives on ${subtopic.id}`);
    assert.ok(subtopic.keyFormulas.length > 0, `Missing formulas on ${subtopic.id}`);
    assert.ok(subtopic.studyNotes.length > 0, `Missing studyNotes on ${subtopic.id}`);
    assert.ok(subtopic.workedExamples.length > 0, `Missing workedExamples on ${subtopic.id}`);
    assert.ok(subtopic.commonMistakes.length > 0, `Missing commonMistakes on ${subtopic.id}`);

    const qc = subtopic.quickCheck;
    const isOk = evaluateStudentAnswer(qc.answer, {
      questionType: 'numeric',
      correctAnswer: qc.answer,
      acceptedAnswers: qc.acceptedAnswers,
      numericAnswer: qc.numericAnswer,
      tolerance: qc.tolerance,
      marks: qc.marks,
      question: qc.prompt,
    });
    assert.equal(isOk, true, `QuickCheck self-grading failed on 0606 ${subtopic.id}`);

    if (qc.acceptedAnswers) {
      for (const alt of qc.acceptedAnswers) {
        assert.equal(
          evaluateStudentAnswer(alt, {
            questionType: 'numeric',
            correctAnswer: qc.answer,
            acceptedAnswers: qc.acceptedAnswers,
            numericAnswer: qc.numericAnswer,
            tolerance: qc.tolerance,
            marks: qc.marks,
            question: qc.prompt,
          }),
          true,
          `Accepted alternate "${alt}" failed on 0606 ${subtopic.id}`
        );
      }
    }
  }
});

test('0606 practice bank spans all 14 chapters with Paper 1 Non-Calc and Paper 2 Calc questions', () => {
  const chaptersCovered = new Set(PRACTICE_QUESTION_BANK_0606.map((q) => q.chapterId));
  for (let ch = 1; ch <= 14; ch += 1) {
    assert.ok(chaptersCovered.has(ch), `Practice bank 0606 missing chapter ${ch}`);
  }

  assert.ok(PRACTICE_QUESTION_BANK_0606.some((q) => q.paperType === 'Non-Calculator'));
  assert.ok(PRACTICE_QUESTION_BANK_0606.some((q) => q.paperType === 'Calculator'));

  const validTopicIds = new Set(ALL_SUBTOPICS_0606.map((t) => t.id));
  for (const q of PRACTICE_QUESTION_BANK_0606) {
    assert.ok(validTopicIds.has(q.topicId), `Invalid 0606 topicId ${q.topicId} on ${q.id}`);
    const evalResult = gradeStudentAnswer(q.correctAnswer, q);
    assert.equal(evalResult.isCorrect, true, `Bank question ${q.id} failed self-check`);
    if (q.acceptedAnswers) {
      for (const alt of q.acceptedAnswers) {
        assert.equal(
          gradeStudentAnswer(alt, q).isCorrect,
          true,
          `Bank question ${q.id} alt "${alt}" failed`
        );
      }
    }
  }
});

test('0606 procedural question generator builds Paper 1, Paper 2, Full, and Topical sets cleanly', () => {
  const p1 = generate0606MockQuestions({ mode: 'mock-0606-p1', attemptNumber: 1 });
  assert.equal(p1.questions.length, 8);
  assert.ok(p1.questions.every((q) => q.paperType === 'Non-Calculator'));

  const p2 = generate0606MockQuestions({ mode: 'mock-0606-p2', attemptNumber: 1 });
  assert.equal(p2.questions.length, 8);
  assert.ok(p2.questions.every((q) => q.paperType === 'Calculator'));

  const full = generate0606MockQuestions({ mode: 'mock-0606-full', attemptNumber: 1 });
  assert.equal(full.questions.length, 12);
  for (const q of full.questions) {
    assert.equal(
      gradeStudentAnswer(q.correctAnswer, q).isCorrect,
      true,
      `Generated 0606 question ${q.id} failed self-check`
    );
  }

  // Retrying with avoidSignatures produces fresh prompts
  const retry = generate0606MockQuestions({
    mode: 'mock-0606-p1',
    attemptNumber: 2,
    avoidSignatures: new Set(p1.signatures),
  });
  assert.equal(retry.questions.length, 8);
  const overlap = retry.signatures.filter((s) => p1.signatures.includes(s));
  assert.ok(overlap.length < retry.signatures.length, 'Expected fresh 0606 variants on retry');

  // Every chapter 1..14 topical drill returns at least 4 valid questions
  for (let ch = 1; ch <= 14; ch += 1) {
    const topical = generate0606MockQuestions({
      mode: 'topical',
      attemptNumber: 1,
      chapterId: ch,
    });
    assert.ok(topical.questions.length >= 2, `Expected topical questions for 0606 ch ${ch}`);
    assert.ok(topical.questions.every((q) => q.chapterId === ch));
    for (const q of topical.questions) {
      assert.equal(gradeStudentAnswer(q.correctAnswer, q).isCorrect, true);
    }
  }
});

function assertCleanMathText(text: string, label: string) {
  assert.equal(
    /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text),
    false,
    `Control character found in ${label}: ${JSON.stringify(text)}`
  );

  const inspectSegments = (input: string) => {
    const segments = tokenizeMathText(input);
    for (const seg of segments) {
      if (seg.type === 'inline' || seg.type === 'display') {
        assert.doesNotThrow(
          () =>
            katex.renderToString(seg.content, {
              displayMode: seg.type === 'display',
              throwOnError: true,
              strict: false,
            }),
          `KaTeX parse error in ${label}: $${seg.content}$`
        );
      } else if (seg.type === 'underline' || seg.type === 'bold' || seg.type === 'italic') {
        inspectSegments(seg.content);
      } else {
        const unescaped = seg.content.replace(/\\\$/g, '');
        assert.equal(
          unescaped.includes('$'),
          false,
          `Unrendered "$" left in ${seg.type} segment at ${label}: ${seg.content}`
        );
      }
    }
  };

  inspectSegments(text);
}

test('All 0606 notes, key findings, practice bank, and mock questions render cleanly without stray $ or KaTeX errors', () => {
  for (const subtopic of ALL_SUBTOPICS_0606) {
    assertCleanMathText(subtopic.summary, `0606 ${subtopic.id} summary`);
    if (subtopic.coursebookTip) {
      assertCleanMathText(highlightImportantText(subtopic.coursebookTip), `0606 ${subtopic.id} coursebookTip`);
    }
    if (subtopic.fastForward) {
      assertCleanMathText(subtopic.fastForward, `0606 ${subtopic.id} fastForward`);
    }
    if (subtopic.bigIdea) {
      assertCleanMathText(subtopic.bigIdea, `0606 ${subtopic.id} bigIdea`);
    }
    for (const f of subtopic.keyFormulas) {
      assertCleanMathText(f.label, `0606 ${subtopic.id} keyFormula label`);
      assert.doesNotThrow(
        () => katex.renderToString(f.latex, { displayMode: false, throwOnError: true, strict: false }),
        `KaTeX error in 0606 ${subtopic.id} keyFormula latex: ${f.latex}`
      );
      if (f.note) {
        assertCleanMathText(f.note, `0606 ${subtopic.id} keyFormula note`);
      }
    }
    for (const obj of subtopic.coreObjectives) {
      assertCleanMathText(obj, `0606 ${subtopic.id} coreObjective`);
    }
    for (const step of subtopic.stepByStepMethod || []) {
      assertCleanMathText(step, `0606 ${subtopic.id} stepByStepMethod`);
    }
    for (const r of subtopic.rapidSummary || []) {
      assertCleanMathText(r.rule, `0606 ${subtopic.id} rapidSummary rule`);
      assertCleanMathText(r.detail, `0606 ${subtopic.id} rapidSummary detail`);
    }
    if (subtopic.comparisonTable) {
      assertCleanMathText(subtopic.comparisonTable.title, `0606 ${subtopic.id} table title`);
      for (const h of subtopic.comparisonTable.headers) {
        assertCleanMathText(h, `0606 ${subtopic.id} table header`);
      }
      for (const row of subtopic.comparisonTable.rows) {
        for (const cell of row) {
          assertCleanMathText(cell, `0606 ${subtopic.id} table cell`);
        }
      }
    }
    for (const note of subtopic.studyNotes) {
      assertCleanMathText(note.heading, `0606 ${subtopic.id} note heading`);
      assertCleanMathText(highlightImportantText(note.body), `0606 ${subtopic.id} note body`);
      for (const b of note.bullets || []) {
        assertCleanMathText(highlightImportantText(b), `0606 ${subtopic.id} note bullet`);
      }
      if (note.noteBox) {
        assertCleanMathText(note.noteBox, `0606 ${subtopic.id} note noteBox`);
      }
    }
    for (const ex of subtopic.workedExamples) {
      assertCleanMathText(ex.title, `0606 ${subtopic.id} example title`);
      assertCleanMathText(ex.question, `0606 ${subtopic.id} example question`);
      for (const s of ex.steps) {
        assertCleanMathText(s, `0606 ${subtopic.id} example step`);
      }
      assertCleanMathText(ex.answer, `0606 ${subtopic.id} example answer`);
      assertCleanMathText(ex.markSchemeNotes, `0606 ${subtopic.id} example markSchemeNotes`);
    }
    for (const m of subtopic.commonMistakes) {
      assertCleanMathText(highlightImportantText(m), `0606 ${subtopic.id} commonMistake`);
    }
    for (const kf of getKeyFindingsForNote(subtopic)) {
      assertCleanMathText(kf.title, `0606 ${subtopic.id} keyFinding title`);
      assertCleanMathText(kf.finding, `0606 ${subtopic.id} keyFinding body`);
      if (kf.noteBox) {
        assertCleanMathText(kf.noteBox, `0606 ${subtopic.id} keyFinding noteBox`);
      }
    }
    assertCleanMathText(subtopic.quickCheck.prompt, `0606 ${subtopic.id} quickCheck prompt`);
    assertCleanMathText(subtopic.quickCheck.hint, `0606 ${subtopic.id} quickCheck hint`);
    assertCleanMathText(subtopic.quickCheck.solution, `0606 ${subtopic.id} quickCheck solution`);
  }

  for (const q of PRACTICE_QUESTION_BANK_0606) {
    assertCleanMathText(q.question, `0606 bank ${q.id} question`);
    assertCleanMathText(q.fullSolution, `0606 bank ${q.id} fullSolution`);
    for (const ms of q.markScheme) {
      assertCleanMathText(ms.detail, `0606 bank ${q.id} markScheme`);
    }
  }

  const generated = generate0606MockQuestions({ mode: 'mock-0606-full', attemptNumber: 1 });
  for (const q of generated.questions) {
    assertCleanMathText(q.question, `0606 gen ${q.id} question`);
    assertCleanMathText(q.fullSolution, `0606 gen ${q.id} fullSolution`);
    for (const ms of q.markScheme) {
      assertCleanMathText(ms.detail, `0606 gen ${q.id} markScheme`);
    }
  }
});

