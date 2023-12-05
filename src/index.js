const search_bar = document.getElementById('search-bar')
const output = document.getElementById('output');
const prevButton = document.getElementById('prev-pkmn');
const nextButton = document.getElementById('next-pkmn')
const errorMsg = {
  'sprites': {
    'official_art': './src/images/error.png',
    'pixel_sprite': './src/images/error.png',
  },
  'name': 'ERROR',
  'id': NaN,
  'types': [],
  'flavor_text': "The Pokémon you were searching for couldn't be found. ((+_+))</p>",
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
}
let artMode = false
let currentPkmn
let pkmnCount
  fetch('http://localhost:3000/count')
  .then(resp => resp.json()).then(json => {pkmnCount = json[0]})

function titleCase(str){
  return str.replace(
    RegExp(/(?<=\b)\w/, 'g'),
    char => char.toUpperCase()
  )
}

function clearScreen(){
  while(output.hasChildNodes()){
    output.removeChild(output.firstChild)
  };
}

async function fetchPokemon(input) {
  let data_out
  if(String(input).match(/\D/)){
    debugger
    input = input.toLowerCase()
      .replace(/(?<=\b)\s+(?=\b)/, '-')
      .replace(/[^a-z-]/, '')
    data_out = await fetch(`http://localhost:3000/pokemon`)
    .then(resp => resp.json()).then(json => {return json[input]})
  } else {
    data_out = await fetch(`http://localhost:3000/pokemon`)
    .then(resp => resp.json()).then(json => {return Object.values(json)[input]})
  }
  console.log(data_out)

  if(!data_out){
    return showErrorMsg()
  } else {
    return renderPokemon(data_out)
  }
}

function showErrorMsg(){
  clearScreen()
  return renderPokemon(errorMsg)
}

function renderPokemon(data){
  const renderSprite = (data, parent) => {
    const sprite = document.createElement('img');
    const source =
      artMode? data.sprites.official_art
      : data.sprites.pixel_sprite;
    sprite.alt = data.name;
    sprite.src =
      (source === null)? './src/images/null_sprite.png'
      : source;
      parent.querySelector('.sprite').appendChild(sprite);
  }
  const renderName = (data, parent) => {
    const name = document.createElement('h2');
    name.innerHTML = data.name;
    parent.querySelector('.name').appendChild(name);
  }
  const renderDexNo = (data, parent) => {
    const dexNo = document.createElement('p');
    dexNo.innerHTML = 
      `#${'0'.repeat(4 - Math.log10(data.id+1)) + data.id}`
      parent.querySelector('.dex-no').appendChild(dexNo);
  }
  const renderFlavorText = (data, parent) => {
    const flavText = document.createElement('p');
    flavText.innerHTML = data.flavor_text;
    parent.querySelector('.flavor-text').appendChild(flavText);
  }
  const renderAbilities = (data, parent) => {
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
    parent.querySelector('.abilities').appendChild(abilities);
  }
  const renderTypes = (data, parent) => {
    data.types.forEach((type) => {
      const typeIcon = document.createElement('img');
      typeIcon.src = `./src/images/${type}.png`;
      typeIcon.alt = titleCase(type);
      parent.querySelector('.types').appendChild(typeIcon);
    });
  }
  
  let html_out = document.createElement('table');
  html_out.class = 'search-result'
  html_out.id = `pkmn${data.id}`;
  html_out.innerHTML =
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
  renderSprite(data, html_out)
  renderName(data, html_out)
  renderDexNo(data, html_out)
  renderFlavorText(data, html_out)
  renderAbilities(data, html_out)
  renderTypes(data, html_out)
  output.appendChild(html_out)
  return data
}

function switchSprites(){
  const pokemonOnScreen = document.querySelector('#output').childNodes;
  for(let i in pokemonOnScreen){
    artMode = !artMode;
    let this_sprite = pokemonOnScreen[i].querySelector('.sprite');
    this_sprite.src = currentPkmn[i].sprites[artMode? 'official_art' : 'pixel_sprite']
  }
}

document.addEventListener("DOMContentLoaded", main);

async function nextPkmn(){
  clearScreen();
  currentPkmn = await fetchPokemon(currentPkmn.id % pkmnCount + 1);
}
async function prevPkmn(){
  clearScreen();
  currentPkmn = await fetchPokemon(
    currentPkmn.id === 1? pkmnCount : currentPkmn.id - 1
  );
}

async function main(){
  currentPkmn = await fetchPokemon(1)

  document.addEventListener("submit", async function(ev){
    ev.preventDefault();
    clearScreen();
    debugger
    currentPkmn = await fetchPokemon(search_bar.value);
  });

  document.addEventListener("keydown", function(ev){
    if(ev.target !== search_bar){
      if(ev.key === ' '){
        artMode = !artMode;
        clearScreen();
        fetchPokemon(currentPkmn.id);
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