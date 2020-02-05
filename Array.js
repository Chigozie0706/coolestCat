const contractSource = '
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
    put(state{ coolCats = updatedcoolCats })';
const contractAddress = '';
var coolcats_data = [];
var memeLength = 0;
var client = null;


function renderMemes() {
  coolcats_data = coolcats_data.sort(function(a,b){return b.votes-a.votes})
  var template = $('#template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, {coolcats_data});
  $('#memeBody').html(rendered);
}

window.addEventListener('load', async () => {

  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call('getLength', [], {callStatic: true}).catch(e => console.error(e));
  console.log('calledGet', calledGet);

  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log('decodedGet', decodedGet);

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
