import type { Rule } from 'eslint';

const TOOL_DIRECTIVE = /^\s*(eslint-|@ts-expect-error|@ts-ignore|prettier-ignore)/;

export const noCommentsRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      comment: 'Code carries no comments: give the value a name or extract a function, reasons go to docs/adr',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.loc && !TOOL_DIRECTIVE.test(comment.value)) {
            context.report({ loc: comment.loc, messageId: 'comment' });
          }
        }
      },
    };
  },
};
