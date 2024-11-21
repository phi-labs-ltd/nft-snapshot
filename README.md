# NFT Snapshot Utility

Code in this repository enables you to take a snapshot of token holders for NFTs on Archway Network. In addition to holder addresses, the snapshot utility will also keep track of token ids for any burned tokens.

## Usage

Clone the repository and configure a snapshot:

```bash
git clone git@github.com:phi-labs-ltd/nft-snapshot.git
cd nft-snapshot
npm install
cp env.example .env
# Now modify .env with your values for `OUTPATH`, `COLLECTION_NAME`, `TOKEN_CONTRACT` and `RPC_NETWORK`
```

What's in the environment (`.env`) file:

```bash
OUTPATH = "" # Root output folder where snapshots are all stored
COLLECTION_NAME = "" # Folder name for the current snapshot (it will be stored inside the root output folder)
TOKEN_CONTRACT = "" # Cw721 contract address of the collection
RPC_NETWORK = "" # RPC network end point used for querying the collection
```

Take a snapshot:

```bash
npm start
```
