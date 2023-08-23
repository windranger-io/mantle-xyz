import { Token } from "@config/constants";

export const searchTokensByNameAndSymbol = (tokens: Token[], query: string) => {
  const normalizedQuery = query.toLowerCase();

  return tokens.filter((token) => {
    const normalizedTokenName = token.name.toLowerCase();
    const normalizedTokenSymbol = token.symbol.toLowerCase();

    return (
      normalizedTokenName.includes(normalizedQuery) ||
      normalizedTokenSymbol.includes(normalizedQuery)
    );
  });
};
