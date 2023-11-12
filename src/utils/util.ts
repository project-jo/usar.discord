export function getRankAndName(rankAndName: string) {
  const regex = /\[(.*?)\]\s(.*)/;

  const match = regex.exec(rankAndName);

  if (match) {
    const textInsideBrackets = match[1].trim();
    const restOfString = match[2];

    const splitString = restOfString.split(',');
    return {
      title: textInsideBrackets,
      rank: splitString[0].trim(),
      name: splitString[1].trim()
    }
  }
}
