const repl = require("repl");

const dotenv = require('dotenv');
dotenv.load();

const web3 = require('../helpers/web3');
const contractService = require('../services/contractService');
const searchService = require('../services/searchService');
const optimusService = require('../services/optimusService');
const db = require('../helpers/db');
const elasticsearch = require('../helpers/elasticsearch');
const Contract = require('../models/contract');

const envName = process.env.NODE_ENV || "dev";
const replServer = repl.start({
  prompt: "Weipoint (" + envName + ") > "
});

replServer.context.web3 = web3;
replServer.context.contractService = contractService;
replServer.context.optimusService = optimusService;
replServer.context.db = db;
replServer.context.elasticsearch = elasticsearch;
replServer.context.Contract = Contract;
replServer.context.searchService = searchService;
