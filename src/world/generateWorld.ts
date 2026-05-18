import type { WorldTile } from "./tile";

const worldTemplate = [
  "##################################################",
  "##################AAAA~AAAAAAAA###################",
  "###############AAAAAAY~YAAAAAAAAA#################",
  "##############AAATAAY~~YYYYAAAAAAA################",
  "#############AAAA,AAY~YYYYYYYYYAAA################",
  "############AAAA,,,,Y~YYY,,,,YYYAAA###############",
  "###########AAAn,,,,,Y~YYY,YY,,YYYAA###############",
  "############AAA,,,,,~YYYT,YYY,,,YYAA##############",
  "#############AA,,,,~YYYYYYYYYYY,,YAA##############",
  "#############AAA,,Y~~YYYYYYYYY,,,,AA##############",
  "##############AA,,,YY~~YYYYY,,,,,AA###############",
  "##############T,,,,,YYY~YYYY,,,,,AA###############",
  "############AAYY,,,....Y~~Y,,,,,,nA###############",
  "###########AYYYY,,......Y~Y,,,,,AA################",
  "##########AYYY,,.........~,,,,,AA#################",
  "##########AYY,,.........~~,,,,,A##################",
  "#########AYYY,....n....~,,~,,,,A##################",
  "#########AY,,..........T,,,~,,,AA#################",
  "##########,,..........##,,,,~,,A##################",
  "##########,..T.....####,,,,,~~A###################",
  "###########..#....######,,,,A~####################",
  "################...#####,,,,A#####################",
  "##################.#####,,AA######################",
  "#########################,########################",
  "##################################################",
];

export function generateWorld(): WorldTile[][] {
  return worldTemplate.map((row) =>
    row.split("").map((symbol) => symbolToTile(symbol))
  );
}

function symbolToTile(symbol: string): WorldTile {
  if (symbol === "#") return { type: "ocean" };
  if (symbol === "~") return { type: "river" };
  if (symbol === ",") return { type: "plains" };
  if (symbol === ".") return { type: "desert" };
  if (symbol === "Y") return { type: "forest" };
  if (symbol === "A") return { type: "mountain" };
  if (symbol === "T") return { type: "town" };
  if (symbol === "n") return { type: "cave" };

  return { type: "plains" };
}