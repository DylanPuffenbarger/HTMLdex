const search_bar = document.getElementById('search-bar')
const output = document.getElementById('output');
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
  return String(target).match(regexp)[0] === String(target);
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

function clearScreen(){
  while(output.hasChildNodes()){
    output.removeChild(output.firstChild)
  };
}

async function fetchPokemon(input, depth=4) {
  if(depth === 4) clearScreen;
  input = String(input);
  const resp_1 = await
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${String(input).replace(/\s+/,'-')}`);
  if(resp_1.status !== 200){
    return renderPokemon({
      'sprites': {
        'official_art': './src/images/error.png',
        'pixel_sprite': './src/images/error.png',
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
  }
  const species = await resp_1.json();
  const id = species.id;
  const resp_2 = await fetch(species.varieties[0].pokemon.url);
  const pokemon = await resp_2.json();
  if(depth === 0){
    return [parsePokemon(pokemon,species)];
  } else {
    return [parsePokemon(pokemon, species)].concat(fetchPokemon(id % totalPokemon + 1, depth - 1));
  }
}


function parsePokemon(pokemon, species){
  console.log(pokemon,species);

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
  let search_result = document.createElement('table');
  search_result.class = 'search-result'
  search_result.id = `pkmn${data.dex_no}`;
  search_result.innerHTML =
    `<thead>
    <tr>
      <td colspan="3" class="name"></td>
      <td class="dex-no"></td>
      <td rowspan="3" class="flavor-text"></td>
    </tr>
    <tr>
      <td colspan="2" rowspan="2" class="sprite"></td>
      <td colspan="2" class="types"></td>
    </tr>
    <tr>
      <td colspan="2" class="abilities"></td>
    </tr>
    </thead>`
  const renderSprite = () => {
    const sprite = document.createElement('img');
    const source =
      artMode? data.sprites.official_art
      : data.sprites.pixel_sprite;
    sprite.alt = data.name;
    sprite.src =
      (source === null)? './src/images/null_sprite.png'
      : source;
      search_result.querySelector('.sprite').appendChild(sprite);
  }
  const renderName = () => {
    const name = document.createElement('h2');
    name.innerHTML = data.name;
    search_result.querySelector('.name').appendChild(name);
  }
  const renderDexNo = () => {
    const dexNo = document.createElement('p');
    dexNo.innerHTML = 
      `#${'0'.repeat(4 - Math.log10(data.dex_no+1)) + data.dex_no}`
      search_result.querySelector('.dex-no').appendChild(dexNo);
  }
  const renderFlavorText = () => {
    const flavText = document.createElement('p');
    flavText.innerHTML = data.flavor_text;
    search_result.querySelector('.flavor-text').appendChild(flavText);
  }
  const renderAbilities = () => {
    const abilities = document.createElement('table');
    abilities.class = 'ab-table'
    abilities.innerHTML = 
    `<thead>
      <tr>
        <th colspan="${data.abilities.length}"><b>Abilities:</b></th>
      </tr>
    </thead>
    <tbody>
      <tr></tr>
    </tbody>`
    ab_list = abilities.querySelector('tbody>tr');
    data.abilities.forEach(ability => {
      let td = document.createElement('td');
      td.innerHTML = `${ability.is_hidden ? `<i>${ability.name}</i>` : ability.name}`;
      ab_list.appendChild(td);
    });
    search_result.querySelector('.abilities').appendChild(abilities);
  }
  const renderTypes = () => {
    data.types.forEach((type) => {
      const typeIcon = document.createElement('img');
      typeIcon.src = `./src/images/${type}.png`;
      typeIcon.alt = titleCase(type);
      search_result.querySelector('.types').appendChild(typeIcon);
    });
  }
  
  renderSprite();
  renderName();
  renderDexNo();
  renderFlavorText();
  renderAbilities();
  renderTypes();
  output.appendChild(search_result);
}

function switchSprites(){
  const pokemonOnScreen = document.querySelector('#output').childNodes;
  for(let i in pokemonOnScreen){
    artMode = !artMode;
    let this_sprite = pokemonOnScreen[i].querySelector('.sprite');
    this_sprite.src = currentPkmnData[i].sprites[artMode? 'official_art' : 'pixel_sprite']
  }
}

document.addEventListener("DOMContentLoaded", main);

let currentPkmnId
let currentPkmnData

async function nextPkmn(){
  clearScreen();
  currentPkmnId = currentPkmnId % totalPokemon + 1;
  currentPkmnData = fetchPokemon(currentPkmnId);
}
async function prevPkmn(){
  clearScreen();
  currentPkmnId = (currentPkmnId===1? totalPokemon : currentPkmnId-1);
  currentPkmnData = await fetchPokemon(currentPkmnId);
}

async function main(){

  currentPkmnData = await fetchPokemon(Math.floor(Math.random() * totalPokemon) + 1);
  currentPkmnId = await currentPkmnData[0].dex_no;

  document.addEventListener("submit", async function(ev){
    ev.preventDefault();
    clearScreen();
    currentPkmnData = await fetchPokemon(search_bar.value);
    currentPkmnId = await currentPkmnData[0].dex_no;
  });

  document.addEventListener("keydown", function(ev){
    if(ev.target !== search_bar){
      if(ev.key === ' '){
        artMode = !artMode;
        clearScreen();
        fetchPokemon(currentPkmnId);
      }
      if(['ArrowRight', 'ArrowDown'].includes(ev.key)) nextPkmn();
      if(['ArrowLeft', 'ArrowUp'].includes(ev.key)) prevPkmn();
    }
  });
    
    

  nextButton.addEventListener('mousedown', async function(ev){
    if (ev.button === 0) nextPkmn();
  });

  prevButton.addEventListener('mousedown', async function(ev){
    if(ev.button === 0) prevPkmn();
  });
}