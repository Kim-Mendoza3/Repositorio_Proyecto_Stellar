#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import { z } from "zod";

// Tool schemas
const DeployContractSchema = z.object({
  wasmPath: z.string().describe("Absolute path to the WASM file"),
  network: z.string().default("testnet").describe("Network: testnet or mainnet"),
  source: z.string().describe("Source account identity (e.g., pool-admin)"),
});

const InvokeContractSchema = z.object({
  contractId: z.string().describe("Contract ID to invoke"),
  network: z.string().default("testnet"),
  source: z.string().describe("Source account identity"),
  method: z.string().describe("Contract method to call"),
  args: z.record(z.any()).optional().describe("Method arguments as key-value pairs"),
});

const GetBalanceSchema = z.object({
  address: z.string().describe("Stellar address to check balance"),
  network: z.string().default("testnet"),
});

const CreateWalletSchema = z.object({
  identity: z.string().describe("Identity name for the wallet (e.g., my-wallet)"),
  network: z.string().default("testnet"),
});

const BuildContractSchema = z.object({
  contractPath: z.string().describe("Path to the contract directory"),
  features: z.string().optional().describe("Cargo features to enable (e.g., 'loan')"),
});

// Server setup
const server = new Server(
  {
    name: "stellar-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools: Tool[] = [
  {
    name: "build_contract",
    description: "Build and optimize a Soroban smart contract to WASM",
    inputSchema: {
      type: "object",
      properties: {
        contractPath: {
          type: "string",
          description: "Path to the contract directory",
        },
        features: {
          type: "string",
          description: "Cargo features to enable (e.g., 'loan')",
        },
      },
      required: ["contractPath"],
    },
  },
  {
    name: "deploy_contract",
    description: "Deploy a Soroban smart contract to Stellar testnet/mainnet",
    inputSchema: {
      type: "object",
      properties: {
        wasmPath: {
          type: "string",
          description: "Absolute path to the WASM file",
        },
        network: {
          type: "string",
          description: "Network: testnet or mainnet",
          default: "testnet",
        },
        source: {
          type: "string",
          description: "Source account identity (e.g., pool-admin)",
        },
      },
      required: ["wasmPath", "source"],
    },
  },
  {
    name: "invoke_contract",
    description: "Invoke a method on a deployed Soroban contract",
    inputSchema: {
      type: "object",
      properties: {
        contractId: {
          type: "string",
          description: "Contract ID to invoke",
        },
        network: {
          type: "string",
          description: "Network: testnet or mainnet",
          default: "testnet",
        },
        source: {
          type: "string",
          description: "Source account identity",
        },
        method: {
          type: "string",
          description: "Contract method to call",
        },
        args: {
          type: "object",
          description: "Method arguments as key-value pairs",
        },
      },
      required: ["contractId", "source", "method"],
    },
  },
  {
    name: "get_balance",
    description: "Get XLM balance of a Stellar address",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Stellar address to check balance",
        },
        network: {
          type: "string",
          description: "Network: testnet or mainnet",
          default: "testnet",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "create_wallet",
    description: "Generate a new Stellar wallet and fund it on testnet",
    inputSchema: {
      type: "object",
      properties: {
        identity: {
          type: "string",
          description: "Identity name for the wallet (e.g., my-wallet)",
        },
        network: {
          type: "string",
          description: "Network: testnet or mainnet",
          default: "testnet",
        },
      },
      required: ["identity"],
    },
  },
];

// Request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "build_contract": {
        const parsed = BuildContractSchema.parse(args);
        const featuresFlag = parsed.features ? `--features ${parsed.features}` : "";
        
        // Build WASM
        const buildCmd = `cd ${parsed.contractPath} && cargo build --target wasm32-unknown-unknown --release ${featuresFlag}`;
        const buildOutput = execSync(buildCmd, { encoding: "utf-8" });
        
        // Find WASM file name from Cargo.toml
        const cargoToml = execSync(`cat ${parsed.contractPath}/Cargo.toml`, { encoding: "utf-8" });
        const nameMatch = cargoToml.match(/name\s*=\s*"([^"]+)"/);
        const crateName = nameMatch ? nameMatch[1].replace(/-/g, "_") : "contract";
        
        const wasmPath = `${parsed.contractPath}/target/wasm32-unknown-unknown/release/${crateName}.wasm`;
        
        // Optimize WASM
        const optimizeCmd = `stellar contract optimize --wasm ${wasmPath}`;
        const optimizeOutput = execSync(optimizeCmd, { encoding: "utf-8" });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                wasmPath: wasmPath.replace(".wasm", ".optimized.wasm"),
                buildOutput: buildOutput.substring(0, 500),
                optimizeOutput,
              }, null, 2),
            },
          ],
        };
      }

      case "deploy_contract": {
        const parsed = DeployContractSchema.parse(args);
        const cmd = `stellar contract deploy --wasm ${parsed.wasmPath} --network ${parsed.network} --source ${parsed.source}`;
        const output = execSync(cmd, { encoding: "utf-8" });
        const contractId = output.trim();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                contractId,
                network: parsed.network,
                message: `Contract deployed successfully to ${parsed.network}`,
              }, null, 2),
            },
          ],
        };
      }

      case "invoke_contract": {
        const parsed = InvokeContractSchema.parse(args);
        
        // Build args string
        let argsStr = "";
        if (parsed.args) {
          for (const [key, value] of Object.entries(parsed.args)) {
            if (typeof value === "string") {
              argsStr += ` --${key} ${value}`;
            } else {
              argsStr += ` --${key} ${JSON.stringify(value)}`;
            }
          }
        }

        const cmd = `stellar contract invoke --id ${parsed.contractId} --network ${parsed.network} --source ${parsed.source} -- ${parsed.method}${argsStr}`;
        const output = execSync(cmd, { encoding: "utf-8" });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                result: output.trim(),
                method: parsed.method,
                contractId: parsed.contractId,
              }, null, 2),
            },
          ],
        };
      }

      case "get_balance": {
        const parsed = GetBalanceSchema.parse(args);
        const rpcUrl = parsed.network === "testnet" 
          ? "https://soroban-testnet.stellar.org"
          : "https://soroban-mainnet.stellar.org";
        
        const cmd = `stellar keys address ${parsed.address} 2>&1 || echo "${parsed.address}"`;
        execSync(cmd);
        
        // Get account info
        const accountCmd = `curl -s -X POST ${rpcUrl} -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getAccount","params":{"account":"${parsed.address}"}}'`;
        const output = execSync(accountCmd, { encoding: "utf-8" });
        const data = JSON.parse(output);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                address: parsed.address,
                network: parsed.network,
                accountData: data.result || data.error,
              }, null, 2),
            },
          ],
        };
      }

      case "create_wallet": {
        const parsed = CreateWalletSchema.parse(args);
        
        // Generate wallet
        const generateCmd = `stellar keys generate ${parsed.identity} --network ${parsed.network}`;
        execSync(generateCmd);
        
        // Get address
        const addressCmd = `stellar keys address ${parsed.identity}`;
        const address = execSync(addressCmd, { encoding: "utf-8" }).trim();
        
        // Fund on testnet
        let fundingResult = "N/A (mainnet)";
        if (parsed.network === "testnet") {
          const fundCmd = `stellar keys fund ${parsed.identity} --network testnet`;
          fundingResult = execSync(fundCmd, { encoding: "utf-8" }).trim();
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                identity: parsed.identity,
                address,
                network: parsed.network,
                funded: parsed.network === "testnet",
                fundingResult,
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            stderr: error instanceof Error && 'stderr' in error ? error.stderr : undefined,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Stellar MCP Server running on stdio");
}

main().catch(console.error);
