function extractCharPosition(errorMessage: string): number {
  const charPattern = /\(char (\d+)\)/;
  const match = charPattern.exec(errorMessage);
  if (match) {
    return parseInt(match[1], 10);
  } else {
    throw new Error('Character position not found in the error message.');
  }
}

function fixInvalidEscape(jsonToLoad: string, errorMessage: string): string {
  while (errorMessage.startsWith('Invalid \\escape')) {
    const badEscapeLocation = extractCharPosition(errorMessage);
    jsonToLoad = jsonToLoad.slice(0, badEscapeLocation) + jsonToLoad.slice(badEscapeLocation + 1);
    try {
      JSON.parse(jsonToLoad);
      return jsonToLoad;
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.debug('json parse error - fix invalid escape', e);
        errorMessage = e.message;
      }
    }
  }
  return jsonToLoad;
}

function balanceBraces(jsonString: string): string | null {
  let openBracesCount = (jsonString.match(/{/g) || []).length;
  let closeBracesCount = (jsonString.match(/}/g) || []).length;

  while (openBracesCount > closeBracesCount) {
    jsonString += '}';
    closeBracesCount++;
  }

  while (closeBracesCount > openBracesCount) {
    jsonString = jsonString.slice(0, -1);
    closeBracesCount--;
  }

  try {
    JSON.parse(jsonString);
    return jsonString;
  } catch (e) {
    if (e instanceof SyntaxError) {
      return null;
    }
  }
  return null;
}

function addQuotesToPropertyNames(jsonString: string): string | null {
  const replaceFunc = (_match: string, p1: string) => `"${p1}":`;
  const propertyNamePattern = /(\w+):/g;
  const correctedJsonString = jsonString.replace(propertyNamePattern, replaceFunc);
  try {
    JSON.parse(correctedJsonString);
    return correctedJsonString;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw e;
    }
  }
  return null;
}

export function correctJson(jsonToLoad: string): string | null {
  if (!jsonToLoad.startsWith('{')) {
    const fragments = jsonToLoad.split('{');
    if (fragments.length > 1) {
      jsonToLoad = '{' + fragments.slice(1).join('{');
    }
  }
  try {
    console.debug('json', jsonToLoad);
    JSON.parse(jsonToLoad);
    return jsonToLoad;
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.debug('json parse error', e);
      let errorMessage = e.message;
      if (errorMessage.startsWith('Invalid \\escape')) {
        jsonToLoad = fixInvalidEscape(jsonToLoad, errorMessage);
      }
      if (errorMessage.startsWith('Expecting property name enclosed in double quotes')) {
        jsonToLoad = addQuotesToPropertyNames(jsonToLoad) || '{}';
        try {
          JSON.parse(jsonToLoad);
          return jsonToLoad;
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.debug('json parse error - add quotes', e);
            errorMessage = e.message;
          }
        }
      }
      const balancedStr = balanceBraces(jsonToLoad);
      if (balancedStr) {
        return balancedStr;
      }
    }
  }
  return jsonToLoad;
}
