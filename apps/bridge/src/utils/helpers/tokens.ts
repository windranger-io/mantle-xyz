import {
  MANTLE_TOKEN_LIST,
  ChainID,
  TokenSymbol,
  Token
} from 'src/config/tokens';

const getTokenBySymbol = (chainID: ChainID, symbol: TokenSymbol): Token => {
  const token = MANTLE_TOKEN_LIST.tokens
    .filter(item => item.chainId === chainID)
    .find(item => item.symbol === symbol);

  if (token === undefined) {
    throw new Error('Something went wrong!');
  }

  return token;
};

const getTokenByAddress = (chainID: ChainID, address: string): Token => {
  const token = MANTLE_TOKEN_LIST.tokens
    .filter(item => item.chainId === chainID)
    .find(item => item.address.toLocaleLowerCase() === address.toLocaleLowerCase());

  if (token === undefined) {
    throw new Error('Something went wrong!');
  }

  return token;
};

export {
  getTokenBySymbol,
  getTokenByAddress
};
