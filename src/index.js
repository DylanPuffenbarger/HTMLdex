const search_bar = document.getElementById('search-bar')
const outputWindow = {
  'sprite': document.getElementById('sprite'),
  'name': document.getElementById('name'),
  'dex_no': document.getElementById('dex-no'),
  'types': document.getElementById('types'),
  'flavor_text': document.getElementById('flavor-text'),
  'abilities': document.getElementById('abilities'),
  'abilities_label': document.getElementById('abilities-label')
}
const prevButton = document.getElementById('prev-pkmn');
const nextButton = document.getElementById('next-pkmn')
let artMode = false;

let totalPokemon = 0;
fetch("https://pokeapi.co/api/v2/pokemon-species?limit=100000&offset=0")
.then(resp => resp.json())
.then(json => {
  totalPokemon = json.count;
});

function fullMatch(target, regexp){
  return String(target).match(regexp);
}

function titleCase(str){
  const wordList = str.split(' ');
  if(wordList.length === 0){
    return str;
  }else if(wordList.length === 1){
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }else{
    return `${titleCase(wordList[0])} ${titleCase(wordList.slice(1).join(' '))}`
  }
}
function copyValuesByKey(obj_in, keys){
  let obj_out = {};
  
  keys.forEach((key) => obj_out[key] = obj_in[key]);
  console.log(obj_out);
  return obj_out;
}

function clearScreen(){
  for(key in outputWindow){
    let element = outputWindow[key];
    while(element.hasChildNodes()){
      element.removeChild(element.firstChild)
    }
  }
}

async function fetchPokemon(input) {
  if(fullMatch(input, /\d/)){
    input = Number(input);
  }
  const resp_1 = await
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${String(input).replace(/\s+/,'-')}`);
  
  if(resp_1.status !== 200){
    return renderPokemon({
      'sprites': {
        'official_art': './images/error.png',
        'pixel_sprite': './images/error.png'
      },
      'name': 'ERROR',
      'dex_no': NaN,
      'types': [],
      'flavor_text': "The Pokémon you were searching for couldn't be found.</p><p>Your search query may have been misspelled or invalid. ((+_+))",
      'abilities': [
        {
          'name': '(╯°□°）╯︵ ┻━┻',
          'is_hidden': false
        },
        {
          'name': '(°_°)',
          'is_hidden': true
        }
      ]
    });
  } else {
    const species = await resp_1.json();
    const resp_2 = await fetch(species.varieties[0].pokemon.url);
    const pokemon = await resp_2.json();
    return parsePokemon(pokemon, species);
  }
}


function parsePokemon(pokemon, species){
  // console.log(pokemon,species);

  const getSprites = () => {
    return {
      'official_art': pokemon.sprites.other['official-artwork'].front_default,
      'pixel_sprite': pokemon.sprites.front_default
    };
  };
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
    if(species.flavor_text_entries.length === 0){
      return 'No known data'
    }
    return species.flavor_text_entries
    .findLast((entry) => entry.language.name === 'en').flavor_text;
  }
  const getAbilities = () => {
    let abilities = [];
    pokemon.abilities.forEach(
      (entry) => abilities.push(
        {
          'name':       titleCase(entry.ability.name.replaceAll('-',' ')),
          'is_hidden':  entry.is_hidden
        }
      ));
    return abilities;
  }

  const data_out = {
    'sprites':       getSprites(),
    'name':         getName(),
    'dex_no':       species.id,
    'types':        getTypes(),
    'flavor_text':  getFlavorText(),
    'abilities':    getAbilities()
  }
  console.log(data_out)
  renderPokemon(data_out);
  return data_out;
}

function renderPokemon(data){
  const renderSprite = () => {
    const sprite = document.createElement('img');
    sprite.alt = data.name;
    sprite.src =
      artMode?  data.sprites.official_art
      :         data.sprites.pixel_sprite
    outputWindow.sprite.appendChild(sprite);
  }
  const renderName = () => {
    const name = document.createElement('h2');
    name.innerHTML = data.name;
    outputWindow.name.appendChild(name);
  }
  const renderDexNo = () => {
    const dexNo = document.createElement('p');
    dexNo.innerHTML = 
      `#${'0'.repeat(4 - Math.log10(data.dex_no+1)) + data.dex_no}`
    outputWindow.dex_no.appendChild(dexNo);
  }
  const renderFlavorText = () => {
    const flavText = document.createElement('p');
    flavText.innerHTML = data.flavor_text;
    outputWindow.flavor_text.appendChild(flavText);
  }
  const renderAbilities = () => {
    const label = document.createElement('h3');
    label.innerHTML = "Abilities:";
    outputWindow.abilities_label.appendChild(label);

    const abList = document.createElement('ul');
    data.abilities.forEach((ability) => {
      if(!(ability.name === data.abilities[0].name && ability.is_hidden)){
        const abNode = document.createElement('li');
        abNode.innerHTML = 
          `${ability.is_hidden?'<i>':''}
          ${ability.name}
          ${ability.is_hidden?'</i>':''}`;
        abList.appendChild(abNode);
      }
    });
    outputWindow.abilities.appendChild(abList);
  }
  const renderTypes = () => {
    data.types.forEach((type) => {
      const typeIcon = document.createElement('img');
      typeIcon.src = `images/${type}.png`;
      typeIcon.alt = titleCase(type);
      outputWindow.types.appendChild(typeIcon);
    });
  }
  
  clearScreen();
  renderSprite();
  renderName();
  renderDexNo();
  renderFlavorText();
  renderAbilities();
  renderTypes();
  return data;
}

document.addEventListener("DOMContentLoaded", main);

let currentPkmnId
let currentPkmnData

async function main(){
  async function nextPkmn(){
    currentPkmnData = await fetchPokemon((currentPkmnId) % totalPokemon + 1);
    currentPkmnId = await currentPkmnData.dex_no;
  }
  async function prevPkmn(){
    if(currentPkmnId === 1){
      currentPkmnData = await fetchPokemon(totalPokemon);
    }else{
      currentPkmnData = await fetchPokemon(currentPkmnId-1);
    }
    currentPkmnId = await currentPkmnData.dex_no;
  }

  currentPkmnData = await fetchPokemon(Math.floor(Math.random() * totalPokemon) + 1);
  currentPkmnId = await currentPkmnData.dex_no;

  document.addEventListener("submit", async function(ev){
    ev.preventDefault();
    currentPkmnData = await fetchPokemon(search_bar.value);
    currentPkmnId = await currentPkmnData.dex_no;
  });

  document.addEventListener("keydown", function(ev){
    // console.log(ev.key);
    if(ev.key === ' '){
      artMode = !artMode;
      renderPokemon(currentPkmnData);
    }
    if(ev.key === 'ArrowRight') nextPkmn();
    if(ev.key === 'ArrowLeft') prevPkmn();
  });

  nextButton.addEventListener('mousedown', async function(ev){
    if (ev.button === 0) nextPkmn();
  });

  prevButton.addEventListener('mousedown', async function(ev){
    if(ev.button === 0) prevPkmn();
  });
}