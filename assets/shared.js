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

// Cookie Consent Banner functions
function closeCookieBanner(){
  var banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.classList.remove('show');
    localStorage.setItem('goflow_cookies_accepted', 'true');
  }
}

document.addEventListener('DOMContentLoaded', function(){
  var banner = document.getElementById('cookie-banner');
  if (banner && !localStorage.getItem('goflow_cookies_accepted')) {
    // Show banner with a subtle premium delay
    setTimeout(function(){
      banner.classList.add('show');
    }, 600);
  }
});
