// Mobile navigation drawer toggle functions
function toggleDrawer(){
  var h = document.getElementById('hbg');
  var d = document.getElementById('drawer');
  h.classList.toggle('open');
  d.classList.toggle('open');
  document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
}

function closeDrawer(){
  document.getElementById('hbg').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
}
