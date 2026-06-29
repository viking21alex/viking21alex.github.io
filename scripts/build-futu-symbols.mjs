import fs from 'node:fs';
import vm from 'node:vm';

const catalogUrl = new URL('../data/catalog.js', import.meta.url);
const outputUrl = new URL('../data/futu-symbols.json', import.meta.url);
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(catalogUrl, 'utf8'), context);

const prefixByExchange = {
  NASDAQ: 'US',
  NYSE: 'US',
  HKEX: 'HK',
  SSE: 'SH',
  SZSE: 'SZ',
  TSE: 'JP',
};

function futuCode(company) {
  const prefix = prefixByExchange[company.exchange];
  if (!prefix) return null;
  let ticker = String(company.ticker).trim().toUpperCase();
  if (prefix === 'HK') ticker = ticker.replace(/\D/g, '').padStart(5, '0');
  return `${prefix}.${ticker}`;
}

const companies = Object.fromEntries(
  context.window.AI_CHAIN_DATA.companies.map((company) => {
    const code = futuCode(company);
    return [company.id, {
      status: code ? 'supported' : 'unsupported-market',
      futuCode: code,
      exchange: company.exchange,
      ticker: company.ticker,
      message: code ? '可通过 Futu OpenAPI 同步' : '富途不覆盖该交易所',
    }];
  }),
);

const output = {
  generatedAt: new Date().toISOString(),
  policy: 'Futu OpenAPI is the only automated financial data source.',
  companies,
};
fs.writeFileSync(outputUrl, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`generated ${Object.keys(companies).length} Futu mapping records`);
