import { generateCssUnicodeRange } from "./googleFontsCss";

/**
 * Equivalent regex for HTML (manually tested):
 * .*https://fonts\.googleapis\.com/css2\?(family=[+,-.:;@\dA-Za-z]+&)+display=swap.*
 */
const googleFontsUrlRegex = /.*(https:\/\/fonts\.googleapis\.com\/css2\?(family=[+,-.:;@\dA-Za-z]+&)+display=swap).*/;

// At this point, the URL was already validated, so we seal the type to string.
function getGoogleFontsUrl(googleFontsCode: string): string {
  return googleFontsCode.match(googleFontsUrlRegex)?.[1] as string;
}

// Each family includes the font name and its styles (if any).
function getFamilyValues(googleFontsUrl: string): string[] {
  return (googleFontsUrl
    .match(/family=.+?&/g) as string[])
    .map(match => match.slice(7, -1));
}

function getFamily(familyValue: string): string {
  return (
    familyValue.match(/([^:]+):?/)?.[1] as string
  ).replace(/\+/g, ' ');
}

function generateGoogleFontsUrl(familyValue: string): string {
  return `https://fonts.googleapis.com/css2?family=${familyValue}&display=swap`;
}

async function getCss(googleFontsUrl: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const responseText = await (await fetch(googleFontsUrl)).text();

      if (/@font-face/.test(responseText)) {
        resolve(responseText);
      };
    } catch (error) {
      reject(Error('failed to fetch CSS files'));
    }
  });
}

async function generateOptimizedCss(
  googleFontsUrl: string,
  charChunks: string[],
  unicodeRangeChunks: UnicodeRange[][]
): Promise<string> {
  let optimizedCss: string = '';
  const amountOfChunks = charChunks.length;

  for (let i = 0; i < amountOfChunks; i++) {
    const optimizedCssChunk = await getCss(
      `${googleFontsUrl}&text=${encodeURIComponent(charChunks[i])}`
    );

    if (/\/\* .+ \*\/\n@font-face/.test(optimizedCssChunk)) {
      throw Error('this font couldn\'t be optimized by Google Fonts');
    }

    optimizedCss += optimizedCssChunk.replaceAll(
      /(src: .+;)/g,
      `$1\n  unicode-range: ${generateCssUnicodeRange(unicodeRangeChunks[i])};`
    );
  }

  return [...new Set(
    (optimizedCss.match(/(\/\*.+\*\/\n)?.+ {\n([^}]+\n)+}(\n)?/g) as string[])
      .reverse()
  )]
    .reverse()
    .join('');
}

async function getWoff2Weight(woff2Url: string): Promise<number> {
  const woff2Request = new XMLHttpRequest();
  woff2Request.open('GET', woff2Url);
  woff2Request.send();
  return new Promise((resolve, reject) => {
    woff2Request.onload = () => {
      resolve(Number(woff2Request.getResponseHeader('content-length')));
    };
    woff2Request.onerror = () => {
      reject(Error('failed to fetch WOFF2 files'));
    };
  });
}

async function getTotalWoff2Weight(woff2Urls: string[]): Promise<number> {
  let totalWoff2Weight: number = 0;

  for (const woff2Url of woff2Urls) {
    totalWoff2Weight += await getWoff2Weight(woff2Url);
  }

  return totalWoff2Weight;
}

function getStyleHeaders(familyValue: string): AxisTag[] | null {
  return familyValue
    .match(/:(.+)@/)?.[1]
    .split(',') as AxisTag[] ||
    null;
}

function getStyleTuples(familyValue: string): string[][] | null {
  return familyValue
    .match(/@(.+)/)?.[1]
    .split(';')
    .map(tuple => tuple.split(',')) ||
    null;
}

export {
  generateGoogleFontsUrl,
  generateOptimizedCss,
  getCss,
  getFamily,
  getFamilyValues,
  getGoogleFontsUrl,
  getStyleHeaders,
  getStyleTuples,
  getTotalWoff2Weight,
  getWoff2Weight,
  googleFontsUrlRegex,
};
