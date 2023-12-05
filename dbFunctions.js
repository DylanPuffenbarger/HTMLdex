// Code for writeDb() function provided by jamezmca on GitHub
// Link: https://github.com/jamezmca/json-db/blob/main/dbFunctions.js

const fs = require('fs')

const placeholder = {
  'sprites': {
    'official_art': './src/images/error.png',
    'pixel_sprite': './src/images/error.png',
  },
  'name': 'ERROR',
  'id': NaN,
  'types': [],
  'flavor_text': "The Pokémon you were searching for couldn't be found. ((+_+))",
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

function titleCase(str){
  return str.replace(
    RegExp(/(?<=\b)\w/, 'g'),
    char => char.toUpperCase()
  )
}

async function convertPkmnData(id){
  const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(resp => resp.json())
  const species = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(resp => resp.json())
  const abilities = () => {
    const abList = []
    pokemon.abilities.forEach(entry => {
      // In PokéAPI's database, single-ability 'mons tend to have a duplicate entry of their primary ability as their hidden ability,
      // so this if statement is here to prevent those duplicates from showing up on HTMLdex.
      if(!abList.some(prev_entry => prev_entry.name === entry.name)){
        abList.push(Object({
          'name': titleCase(entry.ability.name.replace('-',' ')),
          'is_hidden': entry.is_hidden
        }))
      }
    })
    return abList
  }
  const flavorText = () => {
    if(species.flavor_text_entries.some(entry => entry.language.name === 'en')){
      return species.flavor_text_entries.findLast(entry => entry.language.name === 'en').flavor_text
    } else {
      return 'NO DATA FOUND'
    }
  }
  const name = () => species.names.find(entry => entry.language.name === 'en').name
  const sprites = () => {
    return {
      'pixel_sprite': pokemon.sprites.front_default,
      'official_art': pokemon.sprites.other['official-artwork'].front_default
    }
  }
  const types = () => pokemon.types.map(entry => entry.type.name)

  return {
    'name': name(),
    'search_name': species.name,
    'id': id,
    'types': types(),
    'abilities': abilities(),
    'flavor_text': flavorText(),
    'sprites': sprites()
  }
}

function writeDb(obj, dbName = 'db.json') {
  if (!obj) return console.log('Please provide data to save')
  try {
    fs.writeFileSync(dbName, JSON.stringify(obj)) //overwrites current data
    return console.log('SAVE SUCESS')
  } catch (err) {
    return console.log('FAILED TO WRITE')
  }
}

async function initDb(dbName = 'db.json'){
  let pkmnCount = await
    fetch("https://pokeapi.co/api/v2/pokemon-species?limit=100000&offset=0")
    .then(resp => resp.json()).then(json => json.count)
  let db = {'pokemon' : {}, 'count': [pkmnCount]}
  db.pokemon['error'] = placeholder

  for(let i = 1; i <= pkmnCount; i++){
    const new_data = await convertPkmnData(i)
    db.pokemon[new_data.search_name] = new_data
    console.log(`Successfully fetched #${i.toString().padStart(4, '0')} ${new_data.name}`.padEnd(40) + `%${(i * 100 / pkmnCount).toString().slice(0,6)}`)
  }
  return writeDb(db, dbName)
}

return initDb();