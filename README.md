# HTMLdex

HTMLdex is a web app that displays basic data about any Pokémon using PokéAPI.

## Usage

To search for a Pokémon to display, input its name or ID in the search bar. If the Pokémon you're searching for has any special characters, just follow these rules:

- Spaces and hyphens are interchangeable
    * i.e. "ho-oh"/"ho oh" for Ho-Oh, "tapu koko"/"tapu-koko" for Tapu Koko
- Omit all punctuation marks (except for hyphens). 
    * i.e. "farfetchd" for Farfetch'd, "type null" for Type: Null
- Ignore diacritic marks 
    * i.e. "flabebe" for Flabébé
- Replace "♀" and "♂" with "-f" and "-m", respectively.
    * i.e. "nidoran-f" for Nidoran♀

### Other Features
To go to the next or previous Pokémon in the National Dex, use the left/right arrow keys or click the onscreen navigation buttons.

Pressing the space bar will toggle between viewing the Pokémon's pixel art sprite and its official splash art.

Please note that some Pokémon near the end of the Dex are recent additions to the series. As a result, they may be missing data that hasn't yet been fully incorporated into PokéAPI.

## Attributions
- All images in source (with the exception of favicon.ico) provided by Bulbagarden Archives
