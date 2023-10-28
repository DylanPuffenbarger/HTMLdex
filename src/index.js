const search_bar = document.getElementById('search-bar')
const output = {
  'sprite': document.getElementById('sprite'),
  'name': document.getElementById('name'),
  'dex_no': document.getElementById('dex-no'),
  'types': document.getElementById('types'),
  'flavor_text': document.getElementById('flavor-text'),
  'abilities': document.getElementById('abilities'),
}
const prevButton = document.getElementById('prev-pkmn');
const nextButton = document.getElementById('next-pkmn')
const totalPokemon = 1017;

const titleCase = (str) => {
  return str.replace(/\w+/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}
const copyValuesByKey = (obj_in, keys) => {
  let obj_out = {};
  
  keys.forEach((key) => obj_out[key] = obj_in[key]);
  console.log(obj_out);
  return obj_out;
}

function clearScreen(){
  for(key in output){
    output[key].innerHTML = '';
  }
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
  // console.log(data_out)
  return renderPokemon(data_out);
}

function renderPokemon(data){
  clearScreen();
  output.sprite.innerHTML = `<img src='${data.sprite}' alt='${data.name}'>`;
  
  output.name.innerHTML = `<h2>${data.name}</h2>`
  
  output.dex_no.innerHTML = `#${'0'.repeat(4 - Math.log10(data.dex_no+1)) + data.dex_no}`
  output.dex_no.value = data.dex_no;

  output.flavor_text.innerHTML = `<p>${data.flavor_text}</p>`
  
  output.abilities.innerHTML = `<div><h3>Abilities</h3></div>`
  
  data.types.forEach((type) => output.types.innerHTML += `<img src="images/${type}.png" alt="${titleCase(type)}">`)
  
  data.abilities.forEach((ability) => {
    output.abilities.innerHTML += `
    <div>${ability.is_hidden?'<i>':''}
    ${ability.name}</div>
    ${ability.is_hidden?'</i>':''}</div>`
  })
}


document.addEventListener("DOMContentLoaded", () => {
  fetchPokemon(Math.floor(Math.random() * totalPokemon) + 1)
  
  document.addEventListener("submit", (ev) => {
    ev.preventDefault();
    fetchPokemon(search_bar.value);
  });

  nextButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    fetchPokemon(output.dex_no.value%totalPokemon + 1);
  });

  prevButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    if(output.dex_no.value === 1){
      fetchPokemon(totalPokemon);
    }else{
      fetchPokemon(output.dex_no.value - 1);
    }
  })
})