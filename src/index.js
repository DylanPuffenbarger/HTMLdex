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

const copyValuesByKey = (obj_in, keys) => {
  let obj_out = {};
  
  keys.forEach((key) => obj_out[key] = obj_in[key]);
  console.log(obj_out);
  return obj_out;
}

function fetchPokemon(input) {
  const fetchSpeciesHelper = (json_in) => {
    return {
      'species': copyValuesByKey(json_in, ['names','id','flavor_text_entries']),
      'pokemon': fetch(json_in.varieties[0].pokemon.url)
        .then((resp) => resp.json())
        .then((json) => fetchPokemonHelper(json))
    };
  }
  const fetchPokemonHelper = (json_in) => {
    return copyValuesByKey(
      json_in,
      ['sprites', 'types', 'abilities']
    );
  }

  return fetch(`https://pokeapi.co/api/v2/pokemon-species/${input}`)
    .then((resp) => resp.json())
    .then((json) => fetchSpeciesHelper(json));
}