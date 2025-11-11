#!/usr/bin/env node
/*
  Script: list all Twilio Conversations and optionally delete them.

  Usage:
    npx ts-node scripts/delete-all-conversations.ts          # dry run, list only
    npx ts-node scripts/delete-all-conversations.ts --delete --confirm   # delete after confirmation
    npx ts-node scripts/delete-all-conversations.ts -d -y   # delete without interactive prompt

  Environment variables required:
    TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET

  The script will attempt to load a .env file if present (requires dotenv in your environment).
*/

try {
  // try to load dotenv if available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require('dotenv');
  if (dotenv && typeof dotenv.config === 'function') {
    dotenv.config();
  }
} catch (e) {
  // ignore if dotenv isn't installed
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilioLib = require('twilio');
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const argv = process.argv.slice(2);
  const doDelete = argv.includes('--delete') || argv.includes('-d');
  const autoConfirm = argv.includes('--confirm') || argv.includes('-y');

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;

  if (!accountSid || !apiKey || !apiSecret) {
    console.error('Missing Twilio credentials. Set TWILIO_ACCOUNT_SID, TWILIO_API_KEY and TWILIO_API_SECRET in env.');
    process.exit(1);
  }

  const client = twilioLib(apiKey, apiSecret, { accountSid });

  console.log('Fetching conversations (limit 1000)...');
  let conversations: any[] = [];
  try {
    conversations = await client.conversations.v1.conversations.list({ limit: 1000 });
  } catch (err: any) {
    console.error('Failed to list conversations:', err.message || err);
    process.exit(1);
  }

  if (!conversations || conversations.length === 0) {
    console.log('No conversations found.');
    process.exit(0);
  }

  console.log(`Found ${conversations.length} conversations:`);
  conversations.forEach((c) => {
    console.log(`- ${c.sid} | friendlyName=${c.friendlyName || '<none>'} | uniqueName=${c.uniqueName || '<none>'}`);
  });

  if (!doDelete) {
    console.log('\nDry run complete. To delete run with --delete (and --confirm or answer yes at the prompt).');
    process.exit(0);
  }

  if (!autoConfirm) {
    // ask the user to confirm
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer: string = await new Promise((resolve) => rl.question('Are you sure you want to DELETE ALL conversations? Type "yes" to continue: ', resolve));
    rl.close();
    if (!/^yes$/i.test(answer.trim())) {
      console.log('Aborted by user. No conversations were deleted.');
      process.exit(0);
    }
  }

  console.log('\nDeleting conversations (sequential, this may take a while)...');
  let deleted = 0;
  let failed = 0;

  for (const c of conversations) {
    try {
      await client.conversations.v1.conversations(c.sid).remove();
      console.log(`Deleted ${c.sid} (${c.friendlyName || 'no-name'})`);
      deleted++;
    } catch (err: any) {
      console.error(`Failed to delete ${c.sid}:`, err.message || err);
      failed++;
    }
  }

  console.log(`\nDone. Deleted: ${deleted}, Failed: ${failed}`);
  process.exit(0);
})();
