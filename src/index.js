const output_table = {
  'sprite': document.getElementById('sprite'),
  'name': document.getElementById('name'),
  'dex_no': document.getElementById('dex-no'),
  'types': document.getElementById('types'),
  'flavor_text': document.getElementById('flavor-text'),
  'abilities': document.getElementById('abilities'),
  'prev_pkmn': document.getElementById('prev-pkmn'),
  'next_pkmn': document.getElementById('next-pkmn')
}
const totalPokemon = 1017;

const titleCase = (str) => {
  let words = str.split(' ');
  if(words.length === 1){
    return words[0][0].toUpperCase() + words[0].slice(1);
  }
  return ([titleCase(words[0])].concat(words.slice(1))).join(' ');
}
const copyValuesByKey = (obj_in, keys) => {
  let obj_out = {};
  
  keys.forEach((key) => obj_out[key] = obj_in[key]);
  console.log(obj_out);
  return obj_out;
}

function fetchPokemon(input, is_button = false) {
  const fetchHelper = (spcs_json) => {
    return fetch(spcs_json.varieties[0].pokemon.url)
    .then((resp) => resp.json())
    .then((pkmn_json) => parsePokemon(pkmn_json, spcs_json, is_button))
  };

  return fetch(`https://pokeapi.co/api/v2/pokemon-species/${input}`)
    .then((resp) => resp.json())
    .then((json) => fetchHelper(json));
}

function parsePokemon(pokemon, species, is_button = false){
  // console.log(pokemon,species);

  const getSprite = () => pokemon.sprites.front_default;
  const getName = () => {
    return species.names.find((entry) => entry.language.name === 'en').name;
  }
  const getSmallSprite = () => {
    return pokemon.sprites.versions['generation-viii'].icons.front_default
  }
  const getTypes = () => {
    let types = [];
    pokemon.types.forEach(
      (entry) => types.push(entry.type.name)
    );
    return types;
  }
  const getFlavorText = () => {
    return species.flavor_text_entries
    .findLast((entry) => entry.language.name === 'en').flavor_text;
  }
  const getAbilities = () => {
    let abilities = [];
    pokemon.abilities.forEach(
      (entry) => abilities.push(
        {
          'name':       titleCase(entry.ability.name.replace('-',' ')),
          'is_hidden':  entry.is_hidden
        }
      ));
    return abilities;
  }

  const data_out = {
    'sprite':       getSprite(),
    'name':         getName(),
    'dex_no':       species.id,
    'types':        getTypes(),
    'flavor_text':  getFlavorText(),
    'abilities':    getAbilities()
  }
  console.log(data_out)
  // renderPkmn(data_out);
}