import { writeFile } from 'fs';
import { SigningArchwayClient } from '@archwayhq/arch3.js';
import 'dotenv/config'

const SNAPSHOT_FOLDER = process.env.OUTPATH + process.env.COLLECTION_NAME + '/';
const JSON_EXT = '.json'
const TOKEN_CONTRACT = process.env.TOKEN_CONTRACT;
const RPC_NETWORK = process.env.RPC_NETWORK;

async function getClient() {
  const cwClient = await SigningArchwayClient.connectWithSigner(RPC_NETWORK, null);
  return cwClient;
}

async function numTokens(client = null) {
  if (!client) client = await getClient();
  try {
    let entrypoint = {
      num_tokens: {}
    };
    let query = await client.queryClient.wasm.queryContractSmart(
      TOKEN_CONTRACT,
      entrypoint
    );
    if (!query['count']) throw new Error('Error resolving num_tokens query');
    return query.count;
  } catch(e) {
    console.error(e);
    return 0;
  }
}

async function loadToken(client = null, tokenId = null) {
  if (!tokenId || typeof tokenId !== 'number') return;
  if (!client) client = await getClient();
  try {
    let entrypoint = {
      all_nft_info: {
        token_id: String(tokenId)
      }
    };
    let query = await client.queryClient.wasm.queryContractSmart(
      TOKEN_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

async function main() {
  let client = await getClient();

  let TokensMinted = await numTokens();
  console.log("Computing: " + TokensMinted + " tokens, from collection: " + process.env.COLLECTION_NAME);

  // Get snapshot
  let snapshot = {};
  let holders = 0;
  let holders_only = [];
  let burned_tokens = [];
  for (let i = 0; i < TokensMinted; i++) {
    let tokenId = i+1;
    console.log('token_id', tokenId);
    let tokenInfo = await loadToken(client, tokenId);
    let owner = (tokenInfo.hasOwnProperty('access')) ? tokenInfo.access.owner : null;
    if (!owner) {
      burned_tokens.push(String(tokenId));
      TokensMinted += 1;
    } else if (snapshot[owner]) snapshot[owner].tokens.push(String(tokenId));
    else {
      holders += 1;
      snapshot[owner] = { tokens: [String(tokenId)]};
      holders_only.push(owner);
    }
    if (i == TokensMinted-1) {
      console.log('holders', holders);
      snapshot.holders = holders;
      snapshot.burned_tokens = burned_tokens;
      let timestamp = new Date().getTime();
      let snapshot_filename = SNAPSHOT_FOLDER + "snapshot-" + timestamp + JSON_EXT;
      let holders_filename = SNAPSHOT_FOLDER + "holders-only-" + timestamp + JSON_EXT;
      writeFile(
        snapshot_filename, 
        JSON.stringify(snapshot), 
        'utf8', 
        ((err) => { 
          if (err) console.log(err);
        })
      );
      writeFile(
        holders_filename, 
        JSON.stringify(holders_only), 
        'utf8', 
        ((err) => { 
          if (err) console.log(err);
        })
      );
    }
  }
}

main();