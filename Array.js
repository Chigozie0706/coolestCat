const contractSource = `
payable contract VotingApp =

  record coolCat = {
    name           : string,
    image          : string,
    voteCount      : int
    }

  record state = {
    coolCats : map( int, coolCat ),
    length : int
    }

  entrypoint init() = {
    coolCats = {},
    length = 0
    }

  entrypoint getCool_cat(index : int) : coolCat =
    switch(Map.lookup(index, state.coolCats))
	    None    => abort("There was no coolCat with this index registered.")
	    Some(x) => x


  stateful entrypoint updateCool_cat(name' : string, image' : string) =
    let coolCat = {name = name', image = image', voteCount = 0}
    let index = getLength() + 1
    put(state{coolCats[index] = coolCat, length = index})

  entrypoint getLength() : int =
    state.length

  payable stateful entrypoint voteCool_Cat(index : int) =
    let coolCat = getCool_cat(index)
    let updatedVoteCount = coolCat.voteCount + Call.value
    let updatedcoolCats = state.coolCats{ [index].voteCount = updatedVoteCount }
    put(state{ coolCats = updatedcoolCats })
    `

const contractAddress = 'ct_24efgFXcGcAcyW428EUkb874mY8ABWTF4PgauHgrs9n3N9C7NL';
var coolcats_data = [];
var memeLength = 0;
var client = null;


function renderMemes() {
  coolcats_data = coolcats_data.sort(function(a,b){return b.votes-a.votes})
  var template = $('#template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, {coolcats_data});
  $('#coolCat_body').html(rendered);
}

async function callStatic(func, args) {
const contract = await client.getContractInstance(contractSource, {contractAddress});
const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
const decodedGet = await calledGet.decode().catch(e => console.error(e));

return decodedGet;
}


window.addEventListener('load', async () => {

   client = await Ae.Aepp()
  coolCats_Length = await callStatic('getLength', []);

  for (let i = 1; i <= coolCats_Length; i++) {

    const coolCat = await callStatic('getCool_cat', [i]);
    coolcats_data.push({
      candidateName: coolCat.name,
      coolcat_image: coolCat.image,
      index: i,
      votes: coolCat.voteCount,
    })
  }

renderMemes();
});

$('#registerBtn').click(async function(){
  var name = ($('#registerName').val()),
      image = ($('#uploadImage').val());


coolcats_data.push({
    candidateName: name,
    coolcat_image: image,
    index: coolcats_data.length+1,
    votes: 0
  })
  renderMemes();
});
