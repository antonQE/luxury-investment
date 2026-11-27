// beforeShellExecution: require the user's approval for git commit and git push.
import { readStdinJson, respond } from './common.mjs';

const GIT_WRITE = /\bgit\b[^;&|\n]*?\s(commit|push)\b/;

const input = await readStdinJson();
const command = typeof input.command === 'string' ? input.command : '';

if (GIT_WRITE.test(command)) {
  respond({
    permission: 'ask',
    user_message: `The agent wants to run: ${command}\nApprove only if you asked for this commit/push.`,
    agent_message:
      'In this repo commits and pushes need explicit approval from the user. Wait for it.',
  });
} else {
  respond({ permission: 'allow' });
}
process.exit(0);
